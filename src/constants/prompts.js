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
- **High Semantic Similarity**: Same core concept with different wording
  - Synonyms and related concepts (e.g., "vehicle" ≈ "automobile")
  - Different phrasings of the same idea
  - Domain-specific terminology variations

- **Contextual Equivalence**: 
  - Combined title + description convey essentially the same policy
  - Minor differences in formatting, detail level, or wording don't matter

DUPLICATE DETECTION THRESHOLD:
Consider policies as duplicates (NOT UNIQUE) if similarity would be scored ≥80 on a 0-100 scale:
- 80-100: Substantial overlap → NOT UNIQUE
- 0-79: Sufficiently different → UNIQUE

IMPORTANT CONSIDERATIONS:
- Ignore trivial differences (formatting, article usage, punctuation, minor wording)
- Detect implications and indirect references
- Consider industry/domain context
- Err on the side of marking as duplicate to prevent redundancy
- A policy is unique ONLY if it addresses a clearly different topic/scope from ALL stored policies

EXAMPLES:
Target: { title: "Remote Work Policy", description: "Guidelines for employees working from home" }
Stored: { title: "Telecommuting Guidelines", description: "Rules for off-site employee work arrangements" }
→ Output: No (Same concept, different terminology)

Target: { title: "Remote Work Policy", description: "Guidelines for employees working from home" }
Stored: { title: "Vacation Policy", description: "Guidelines for requesting paid time off" }
→ Output: Yes (Completely different policies)

OUTPUT REQUIREMENT:
Respond with ONLY one word:
- "Yes" if the target policy is unique (no substantial matches found in stored policies)
- "No" if the target policy is NOT unique (at least one substantial match exists in stored policies)

Return nothing else - no explanation, no punctuation, just "Yes" or "No".
`;
