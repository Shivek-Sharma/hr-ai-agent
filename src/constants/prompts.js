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

export const semanticMatchingPrompt = `
You are a semantic matching system that determines if a target policy is unique compared to stored policies.

TASK:
Determine if the target policy is semantically unique (not a duplicate or near-duplicate) when compared against all stored policies.

INPUT FORMAT:
- Target Policy: { title: string, description: string }
- Stored Policies: Array of { title: string, description: string }

UNIQUENESS CRITERIA:
A policy is considered NOT UNIQUE (duplicate) if ANY stored policy has:
- **High Semantic Similarity**: Very similar core concept with different wording
  - Direct synonyms and closely related concepts (e.g., "vehicle" ≈ "automobile", "remote work" ≈ "telecommuting")
  - Essentially the same idea with different phrasing
  - Domain-specific terminology that means the same thing

- **Strong Intent Alignment**: Addresses fundamentally the same issue or purpose
  - Identical or nearly identical underlying goals
  - Substantial overlapping coverage areas (>80%)
  - Very similar scope and specificity level

- **Clear Contextual Equivalence**: 
  - Combined title + description convey essentially the same policy with minimal variation
  - One policy could reasonably substitute for the other
  - Core requirements and guidelines are the same

DUPLICATE DETECTION THRESHOLD:
Consider policies as duplicates (NOT UNIQUE) if similarity would be scored ≥80 on a 0-100 scale:
- 80-100: Clear substantial overlap → NOT UNIQUE
- 0-79: Sufficiently different → UNIQUE

IMPORTANT CONSIDERATIONS:
- Allow for reasonable differences in scope, detail level, and emphasis
- Policies covering related but distinct aspects should be considered unique
- General vs. specific versions of a concept can coexist (e.g., "Employee Benefits" vs. "Healthcare Benefits")
- Different perspectives on similar topics are acceptable (e.g., "Data Security" vs. "Password Requirements")
- Focus on true duplicates rather than related policies
- A policy is duplicate ONLY if it's clearly redundant with an existing stored policy

EXAMPLES:
Target: { title: "Remote Work Policy", description: "Guidelines for employees working from home" }
Stored: { title: "Telecommuting Guidelines", description: "Rules for off-site employee work arrangements" }
→ Output: No (Essentially identical concept, just different terminology)

Target: { title: "Remote Work Equipment", description: "IT equipment provided for home office setups" }
Stored: { title: "Remote Work Policy", description: "Guidelines for employees working from home" }
→ Output: Yes (Related but distinct - one is about equipment, other is about general guidelines)

Target: { title: "Data Privacy Policy", description: "Guidelines for handling customer personal information" }
Stored: { title: "Information Security", description: "Protocols for protecting company data and systems" }
→ Output: Yes (Related concepts but different focus - privacy vs. security)

OUTPUT REQUIREMENT:
Respond with ONLY one word:
- "Yes" if the target policy is unique (no clear duplicates found in stored policies)
- "No" if the target policy is NOT unique (at least one clear duplicate exists in stored policies)

Return nothing else - no explanation, no punctuation, just "Yes" or "No".
`;
