export const BUDGET_META = {
  // Required fields
  title: "Budget 2025", // Full title (can be same as short_title from analysis file)
  status: "tabled", // Bill status: "tabled", "passed", "defeated", etc.
  chamber: "House of Commons" as const, // "House of Commons" or "Senate"

  // Sponsor information
  sponsorParty: "Liberal", // Political party of the sponsor
  sponsorName: undefined, // Optional: name of the sponsor

  // Dates
  introducedOn: new Date("2025-11-04"), // Date when budget was introduced/tabled
  lastUpdatedOn: new Date("2025-11-04"), // Date of last update (typically same as introducedOn for budgets)

  // Additional metadata
  genres: ["Budget"], // Categories/tags for the bill
  supportedRegion: "Canada", // Geographic scope
  source: "https://www.budget.canada.ca/2025/home-accueil-en.html", // Official source URL

  // Parliament information
  parliamentNumber: undefined, // Optional: parliament number
  sessionNumber: undefined, // Optional: session number

  // Legislative process
  stages: [
    {
      stage: "Tabled",
      state: "Completed",
      house: "House of Commons",
      date: new Date("2025-11-04"),
    },
  ] as Array<{
    stage: string;
    state: string;
    house: string;
    date: Date;
  }>,

  votes: [] as Array<{
    chamber: string;
    date: Date;
    motion?: string;
    result: string;
    yeas?: number;
    nays?: number;
    abstentions?: number;
    source?: string;
  }>,

  // Other fields
  billTextsCount: undefined, // Optional: number of bill text versions
  isSocialIssue: false, // Whether this is classified as a social issue
};
