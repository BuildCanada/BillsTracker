export function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    // 🌱 Environment & Climate
    "Environmental": "leaf",
    "Environmental Policy": "sprout",
    "Environmental Issues": "recycle",
    "Climate and Environment": "cloud-sun",

    // 🏗 Infrastructure & Housing
    "Infrastructure": "land-plot",
    "Housing and Urban Development": "home",

    // 🧑‍🤝‍🧑 Social & Human Rights
    "Indigenous Affairs": "users",
    "Social Welfare": "hand-heart",
    "Human Rights": "handshake",
    "Social Issues": "users",

    // ⚖️ Law, Justice, Governance
    "Legal and Regulatory": "scale",
    "Legal and Corporate": "briefcase",
    "Legal and Constitutional": "gavel",
    "Criminal Justice": "shield-check",
    "Law and Employment": "book-text",
    "Legal": "scale",
    "Politics and Governance": "landmark",
    "Political Issues": "megaphone",
    "Politics": "flag",
    "Government": "building",
    "Government and Politics": "building-2",
    "Elections": "vote",
    "National Security": "shield-alert",
    "Military and Employment": "shield-plus",

    // 💰 Economy & Work
    "Economics": "trending-up",
    "Trade and Commerce": "shopping-bag",
    "Business": "factory",
    "Labor and Employment": "hard-hat",

    // 🩺 Health & Education
    "Healthcare": "stethoscope",
    "Education": "graduation-cap",

    // 🌾 Agriculture & Food
    "Food and Agriculture": "utensils-crossed",
    "Agriculture": "tractor",
    "Animal Welfare": "paw-print",

    // 🚗 Transportation & Land
    "Transportation": "truck",
    "Public Lands": "map",

    // 🌎 Foreign & Immigration
    "Foreign Affairs": "globe",
    "Immigration": "plane",

    // ⚡ Energy & Technology
    "Energy and Utilities": "zap",
    "Technology and Innovation": "cpu",

    // 🎨 Culture & Heritage
    "Culture and Heritage": "landmark",
    "Cultural Awareness": "palette",
  };

  return iconMap[category] || "file-text";
}