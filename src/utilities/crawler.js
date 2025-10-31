import axios from "axios";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

import sources from "../config/source.js";
import { policiesExtractionPrompt } from "../constants/prompts.js";
import { semanticMatchingPrompt } from "../constants/prompts.js";
import policyModel from "../models/policies.schema.js";
import logModel from "../models/logs.schema.js";

dotenv.config();
dayjs.extend(customParseFormat);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "..", "logs");
const logFile = path.join(logDir, "crawler.log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

async function writeLog(data) {
  const timestamp = new Date().toISOString();

  let message;
  if (typeof data === "object") {
    message = JSON.stringify(data, null, 2);
  } else {
    message = data;
  }

  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logFile, logMessage, "utf8");

  await logModel.create(data);
}

function parsePublishedAt(dateString) {
  if (!dateString) return null;

  const formats = ["DD/MM/YYYY", "MMMM D, YYYY"];
  for (const format of formats) {
    const parsed = dayjs(dateString, format);
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }

  return null;
}

async function fetchData(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        Connection: "keep-alive",
        Referer: "https://www.google.com/",
      },
      timeout: 20000,
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching the URL ${url}: ${error.message}`);
  }
}

async function extractPolicies(html) {
  console.log("extracting policies using claude.....");
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 20000,
    temperature: 0,
    system: policiesExtractionPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: html,
          },
        ],
      },
    ],
  });

  const rawText = response.content[0].text;
  const cleanText = rawText.replace(/```json\s*|\s*```/g, "");
  return JSON.parse(cleanText);
}

async function newPolicyChecker(storedPolicies, extractedPolicy) {
  const userPrompt = `
    Target Policy:
    Title: ${extractedPolicy.title}
    Description: ${extractedPolicy.description}

    Stored Policies:
    ${storedPolicies
      .map(
        (p, i) =>
          `${i + 1}. Title: ${p.title}\n   Description: ${p.description}`
      )
      .join("\n\n")}
  `;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2000,
    temperature: 1,
    system: semanticMatchingPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userPrompt,
          },
        ],
      },
    ],
  });

  // return response.content[0].text === "Yes" ? true : false; // Yes - new policy
  return response.content[0].text;
}

async function crawler() {
  try {
    for (const source of sources) {
      const policiesToInsert = [];

      console.log("Fetching URL:", source.url);
      const html = await fetchData(source.url);
      if (!html) {
        console.error("No HTML returned — likely blocked or invalid response.");
        continue;
      }

      const $ = cheerio.load(html);

      let publishedAt = null;
      if (
        source.selectors.publishedAt &&
        $(source.selectors.publishedAt).length > 0
      ) {
        publishedAt = $(source.selectors.publishedAt).text();
      }

      // console.log("found elements:", $(source.selectors.container).length);
      const policyContainer = $(source.selectors.container).html();
      const extractedPolicies = await extractPolicies(policyContainer);

      const storedPolicies = await policyModel.find(
        { sourceName: { $ne: source.name } },
        { title: 1, description: 1, _id: 0 }
      );

      let storedPoliciesTitles = await policyModel.find(
        {},
        { title: 1, _id: 0 }
      );
      storedPoliciesTitles = storedPoliciesTitles.map((policy) => policy.title);

      for (const policy of extractedPolicies) {
        const policyTitle = policy.title?.trim();
        const policyDesc = policy.description?.trim();

        if (storedPoliciesTitles.includes(policyTitle)) {
          await writeLog({
            action: "skipping...",
            isDuplicate: true,
            title: policyTitle,
            description: policyDesc,
            sourceName: source.name,
          });
          continue;
        }

        const isNewPolicy = await newPolicyChecker(storedPolicies, policy);
        if (isNewPolicy !== "Yes") {
          await writeLog({
            action: "skipping...",
            isDuplicate: true,
            title: policyTitle,
            description: policyDesc,
            sourceName: source.name,
          });
          continue;
        }

        const modifiedPolicy = {
          title: policyTitle,
          description: policyDesc,
          sourceUrl: source.url,
          sourceName: source.name,
        };

        if (publishedAt) {
          modifiedPolicy["publishedAt"] = parsePublishedAt(publishedAt);
        }

        policiesToInsert.push(modifiedPolicy);
        await writeLog({
          action: "inserting...",
          isDuplicate: false,
          title: policyTitle,
          description: policyDesc,
          sourceName: source.name,
        });
      }

      if (policiesToInsert.length > 0) {
        // console.log(
        //   `new policies to insert from ${source.name}:`,
        //   policiesToInsert
        // );
        try {
          const result = await policyModel.insertMany(policiesToInsert, {
            ordered: false,
          });
          console.log(
            `Inserted ${result.length} new policies successfully from ${source.name}`
          );
        } catch (error) {
          console.error(
            `Bulk insert error for new policies from ${source.name}:`,
            error.message
          );
        } finally {
          policiesToInsert.length = 0;
        }
      } else {
        console.log(`No new policies to insert from ${source.name}`);
      }
    }
    console.log("Crawling from all the sources completed.");
  } catch (error) {
    console.error("Crawling Exception:", error.message);
  }
}

export default crawler;
