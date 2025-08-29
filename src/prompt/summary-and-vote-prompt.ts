export const TENETS = {
  1: "Canada should aim to be the world's richest country.",
  2: "Promote economic freedom, ambition, and breaking from bureaucratic inertia.",
  3: "Drive national productivity and global competitiveness.",
  4: "Grow exports of Canadian products and resources.",
  5: "Encourage investment, innovation, and resource development.",
  6: "Deliver better public services at lower cost (government efficiency).",
  7: "Reform taxes to incentivize work, risk-taking, and innovation.",
  8: "Focus on large-scale prosperity, not incrementalism.",
}


export const SUMMARY_AND_VOTE_PROMPT = `
You are analyzing Canadian legislation. You must assess whether the bill aligns with Build Canada’s Core Tenets:
	1.	Canada should aim to be the world’s richest country.
	2.	Promote economic freedom, ambition, and breaking from bureaucratic inertia.
	3.	Drive national productivity and global competitiveness.
	4.	Grow exports of Canadian products and resources.
	5.	Encourage investment, innovation, and resource development.
	6.	Deliver better public services at lower cost (government efficiency).
	7.	Reform taxes to incentivize work, risk-taking, and innovation.
	8.	Focus on large-scale prosperity, not incrementalism.

Task:
	1.	Read the bill.
	2.	Provide a concise summary of what the bill does in plain language (3–5 sentences).
	3.	Evaluate the bill against the 8 tenets above:
	•	Does it clearly support one or more tenets?
	•	Does it conflict with one or more tenets?
	•	Is its impact neutral or unclear?
	4.	Give a final judgment:
	•	Output “Yes” if the bill aligns overall with Build Canada’s tenets.
	•	Output “No” if it conflicts overall with Build Canada’s tenets.

Output format (return valid JSON only):

{
  "summary": "Your 3–5 sentence summary here in plain language. Use bullet points to summarize the highlights of the bill. Do not include any other text in the summary.",
  "short_title": "A short title for the bill. Use 1-2 words to describe the bill.",
  "tenet_evaluations": [
    {
      "id": 1,
      "title": "Canada should aim to be the world's richest country",
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 2,
      "title": "Promote economic freedom, ambition, and breaking from bureaucratic inertia",
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 3,
      "title": "Drive national productivity and global competitiveness",
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 4,
      "title": "Grow exports of Canadian products and resources",
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 5,
      "title": "Encourage investment, innovation, and resource development",
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 6,
      "title": "Deliver better public services at lower cost (government efficiency)",
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 7,
      "title": "Reform taxes to incentivize work, risk-taking, and innovation",
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 8,
      "title": "Focus on large-scale prosperity, not incrementalism",
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    }
  ],
  "final_judgment": "yes|no",
  "rationale": "Short rationale explaining the overall judgment",
  "needs_more_info": true|false,
  "missing_details": ["List any key information needed for better analysis", "Another missing detail if applicable"]
}
`