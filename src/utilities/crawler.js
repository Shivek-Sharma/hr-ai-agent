import axios from "axios";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

import sources from "../config/source.js";
import { policiesExtractionPrompt } from "../constants/prompts.js";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

async function crawler() {
  try {
    for (const source of sources) {
      console.log("Fetching URL:", source.url);
      const html = await fetchData(source.url);
      if (!html) {
        console.error("No HTML returned — likely blocked or invalid response.");
				continue;
      }

      const $ = cheerio.load(html);

      // console.log("found elements:", $(source.selectors.container).length);
      const policyContainer = $(source.selectors.container).html();
      // console.log("policies extracted html:", policyContainer);
      const extractedPolicies = await extractPolicies(policyContainer);
      // console.log("Extracted Policies:", extractedPolicies)

			let publishedAt = null;
			if (source.selectors.publishedAt && $(source.selectors.publishedAt).length > 0) {
				publishedAt = $(source.selectors.publishedAt).text();
			}
			// console.log("published at:", publishedAt)
    }
  } catch (error) {
    console.error("Crawling Exception:", error.message);
  }
}

export default crawler;
