// Human-readable stage mappings with keywords for fuzzy matching
const STAGE_MAPPINGS = [
  {
    displayName: "Royal Assent",
    description: "Law complete - granted by Governor General",
    keywords: ["royal assent", "assent", "completed", "enacted", "law"],
    priority: 10,
    category: "complete",
  },
  {
    displayName: "Passed",
    description: "Bill has been approved",
    keywords: ["passed", "approved", "adopted", "carried"],
    priority: 9,
    category: "complete",
  },
  {
    displayName: "Failed",
    description: "Bill was defeated or withdrawn",
    keywords: ["failed", "defeated", "rejected", "withdrawn", "defeat"],
    priority: 9,
    category: "failed",
  },
  {
    displayName: "Third Reading",
    description: "Final debate and vote in chamber",
    keywords: ["third reading", "3rd reading", "final reading", "final vote"],
    priority: 8,
    category: "active",
  },
  {
    displayName: "Report Stage",
    description: "Reviewing committee amendments",
    keywords: ["report stage", "report", "amendments review"],
    priority: 7,
    category: "active",
  },
  {
    displayName: "Committee Review",
    description: "Detailed study by parliamentary committee",
    keywords: [
      "committee",
      "consideration",
      "study",
      "review",
      "clause-by-clause",
    ],
    priority: 6,
    category: "active",
  },
  {
    displayName: "Second Reading",
    description: "Principle debate and committee referral",
    keywords: ["second reading", "2nd reading", "referral", "principle"],
    priority: 5,
    category: "active",
  },
  {
    displayName: "First Reading",
    description: "Bill introduced to Parliament",
    keywords: ["first reading", "1st reading", "introduction", "introduced"],
    priority: 4,
    category: "introduced",
  },
  {
    displayName: "Senate Review",
    description: "Under consideration by the Senate",
    keywords: ["senate", "upper chamber", "sober second thought"],
    priority: 7,
    category: "active",
  },
  {
    displayName: "In Progress",
    description: "Bill is moving through Parliament",
    keywords: ["in progress", "proceeding", "advancing"],
    priority: 3,
    category: "active",
  },
  {
    displayName: "Paused",
    description: "Bill proceedings temporarily halted",
    keywords: ["paused", "suspended", "delayed", "prorogation"],
    priority: 2,
    category: "paused",
  },
  {
    displayName: "Notice Filed",
    description: "Notice submitted before introduction",
    keywords: ["notice", "filed", "48 hours"],
    priority: 1,
    category: "pre-introduction",
  },
  {
    displayName: "Paused",
    description: "Bill is outside the order of precedence",
    keywords: ["outside", "precedence", "out of order"],
    priority: 2,
    category: "paused",
  },
];

/**
 * Simple string similarity calculation using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + cost, // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Fuzzy match a stage string against known stages
 */
export const stageSummarizer = (
  inputStage: string,
  fallbackStatus?: string,
): string => {
  if (!inputStage && !fallbackStatus) {
    return "Unknown Stage";
  }

  const searchText = (inputStage || fallbackStatus || "").toLowerCase().trim();

  if (!searchText) {
    return "Unknown Stage";
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const stageMapping of STAGE_MAPPINGS) {
    for (const keyword of stageMapping.keywords) {
      // Direct substring match gets high score
      if (searchText.includes(keyword)) {
        const score = 0.9 + (keyword.length / searchText.length) * 0.1;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = stageMapping;
        }
      }

      // Fuzzy similarity match
      const similarity = calculateSimilarity(searchText, keyword);
      if (similarity > 0.6 && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = stageMapping;
      }
    }
  }

  // If we found a good match, return it
  if (bestMatch && bestScore > 0.6) {
    return bestMatch.displayName;
  }

  // Fallback to cleaned-up input
  return inputStage || fallbackStatus || "Unknown Stage";
};

/**
 * Get stage description for additional context
 */
export const getStageDescription = (
  inputStage: string,
  fallbackStatus?: string,
): string => {
  const searchText = (inputStage || fallbackStatus || "").toLowerCase().trim();

  if (!searchText) {
    return "Stage information not available";
  }

  for (const stageMapping of STAGE_MAPPINGS) {
    for (const keyword of stageMapping.keywords) {
      if (searchText.includes(keyword)) {
        return stageMapping.description;
      }

      const similarity = calculateSimilarity(searchText, keyword);
      if (similarity > 0.7) {
        return stageMapping.description;
      }
    }
  }

  return "Stage information not available";
};

/**
 * Get stage category for styling purposes
 */
export const getStageCategory = (
  inputStage: string,
  fallbackStatus?: string,
):
  | "complete"
  | "failed"
  | "active"
  | "introduced"
  | "paused"
  | "pre-introduction"
  | "unknown" => {
  const searchText = (inputStage || fallbackStatus || "").toLowerCase().trim();

  if (!searchText) {
    return "unknown";
  }

  for (const stageMapping of STAGE_MAPPINGS) {
    for (const keyword of stageMapping.keywords) {
      if (searchText.includes(keyword)) {
        return stageMapping.category as any;
      }

      const similarity = calculateSimilarity(searchText, keyword);
      if (similarity > 0.7) {
        return stageMapping.category as any;
      }
    }
  }

  return "unknown";
};
