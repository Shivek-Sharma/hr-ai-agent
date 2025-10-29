export const policiesExtractionPrompt = `
    You are given scraped webpage content (HTML or plain text) that may contain HR or company policy information.

Your task is to extract all identifiable HR policies and return them in a clean, structured JSON array.

Follow these rules strictly:

1. Each JSON object must have exactly two fields:
   - "title": A short, human-readable name of the policy. Remove any numbers, symbols, or formatting. 
     If no explicit heading exists, infer a reasonable title from context.
   - "description": A complete, self-contained paragraph summarizing the policy’s intent, scope, and purpose in clear language.
     Use information from surrounding text if needed, but avoid lists, examples, or procedural details.

2. Merge fragments that belong to the same policy section.

3. Ignore any navigation text, footers, disclaimers, or unrelated content.

4. Output only a **valid JSON array** — no markdown, no prose, no extra keys, and no trailing commas.

5. Do not include explanations or additional commentary. Only return the final JSON.
`;
