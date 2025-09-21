export const TENETS = {
  1: "Canada should aim to be the world's most prosperous country.",
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
	1. ${TENETS[1]}
	2. ${TENETS[2]}
	3. ${TENETS[3]}
	4. ${TENETS[4]}
	5. ${TENETS[5]}
	6. ${TENETS[6]}
	7. ${TENETS[7]}
	8. ${TENETS[8]}

  For social issue grading:
    Positive signals (any one can qualify if it is the main focus):
    - Recognition/commemoration: heritage months/days, awareness days, honorary observances, national symbols (e.g., national bird/anthem/flag changes).
    - Rights & identity: assisted dying, abortion, marriage/family status, gender identity/expression, LGBTQ+ rights, indigenous rights, disability rights, hate speech/hate crimes, religious freedoms.
    - Culture & language: multiculturalism, official languages, curriculum content on culture/history, media/broadcast standards on content/morality.
    - Civil liberties & expression: protests/assembly, press/speech regulations primarily about expression or social values.

    Negative/Non-social (unless rights/identity are the central focus):
    - Core economics/fiscal: budgets, taxation, appropriations, trade, monetary policy.
    - Infrastructure/operations: transportation, energy, housing supply mechanics, procurement, zoning mechanics.
    - Technical/administrative: agency powers, forms, reporting, definitions not tied to values/identity.
    - Environmental/health/safety mainly as regulation/operations (e.g., emissions standards, workplace safety), unless framed around rights/identity or moral controversy.

    Tie-breakers:
    - Classify based on primary purpose, not incidental mentions.
    - If the bill materially creates or changes an observance/day/month or declares a national symbol, classify as social issue = yes.
    - If mixed, choose "no".


  For general guidelines:
    - Be critical.
    - Bias to the overall wellbeing of Canadians.
    - Use markdown formatting.
    - Use bullet points to summarize the highlights of the bill.
    - Do not include any other text in the summary.
    - Never self reference Build Canada.

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
  5.	Generate 3 critical questions, pertaining to this and only about this bill, for Question Period in the House of Commons phrased in a way that a Member of Parliament might actually ask in Question Period. Omit any prefix like "Mr. Speaker" or "Madam Speaker".
 

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
  "question_period_questions": [
    {
      "question": ""
    },
    {
      "question": ""
    },
    {
      "question": ""
    },
    
  ],
  "final_judgment": "yes|no",
  "rationale": "2 sentences explaining the overall judgment and then bullet points explaining the rationale for the judgment and suggestions for what we might change. Use markdown formatting.",
  "is_social_issue": "yes|no"
}
`

