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
  "summary": "Your 3–5 sentence summary here in plain language. Use bullet points to summarize the highlights of the bill. Do not include any other text in the summary. Use markdown formatting.",
  "short_title": "A short title for the bill. Use 1-2 words to describe the bill.",
  "tenet_evaluations": [
    {
      "id": 1,
      "title": ${TENETS[1]},
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 2,
      "title": ${TENETS[2]},
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 3,
      "title": ${TENETS[3]},
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 4,
      "title": ${TENETS[4]},
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 5,
      "title": ${TENETS[5]},
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 6,
      "title": ${TENETS[6]},
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 7,
      "title": ${TENETS[7]},
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    },
    {
      "id": 8,
      "title": ${TENETS[8]},
      "alignment": "aligns|conflicts|neutral",
      "explanation": "Short explanation of how this bill relates to this tenet"
    }
  ],
  "final_judgment": "yes|no",
  "rationale": "2 sentences explaining the overall judgment and then bullet points explaining the rationale for the judgment and suggestions for what we might change. Use markdown formatting.",
  "question_period_questions": "Present the strongest possible version of this bill's argument that would align with Build Canada's tenets. What aspects of the bill could be seen as most beneficial for Canadian prosperity? Use markdown formatting."
}
`


const QUESTION_PERIOD_QUESTIONS = `
 You are a parliamentary reporter preparing three questions for Question Period in the House of Commons.

Your goal:
- Generate 3 questions that are topical, relevant to current events, and engaging for both MPs and the public.
- Each question should be direct, pointed, and clearly address a matter of public interest.
- Prefer issues that affect Canadians broadly (economy, health care, climate change, national security, governance, ethics).
- You may include a mix of government accountability questions, opposition challenges, and public-interest topics.

Guidelines:
- Each question should be 1–2 sentences long.
- Make sure the question is phrased in a way that a Member of Parliament might actually ask in Question Period.
- Avoid overly technical language; aim for clarity and impact.
- Include a variety of topics so that not all three questions are about the same issue.

Output format:
Return a JSON array of objects with this shape:

[
  {
     "question": "Full text of the question to be asked in Question Period"
  },
  ...
]

Example output:
[
  {
    "question": "Can the Minister explain what concrete steps the government is taking to reduce surgical wait times that are keeping Canadians from getting timely care?"
  },
    "question": "With rent and mortgage costs hitting record highs, what is the government doing to make housing more affordable for young Canadians?"
  },
    "question": "Will the government commit to a full public inquiry into foreign interference in our elections to restore public trust in our democracy?"
  }
]
`