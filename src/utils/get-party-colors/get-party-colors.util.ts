const partyChipStyles = {
  conservative: {
    backgroundColor: "#6495ED",
    color: "white",
  },
  liberal: {
    backgroundColor: "#d41f27",
    color: "white",
  },
  ndp: {
    backgroundColor: "#F4A460",
    color: "white",
  },
  bloc: {
    backgroundColor: "#87CEFA",
    color: "white",
  },
  green: {
    backgroundColor: "#99C955",
    color: "white",
  },
  independent: {
    backgroundColor: "#A9A9A9",
    color: "white",
  },
  default: {
    backgroundColor: "grey",
    color: "white",
  },
  all: {
    backgroundColor: "white",
    color: "black",
  },
  senate: {
    backgroundColor: "#600000",
    color: "white",
  },
};

export const getPartyColor = (party: string) => {
  if (!party) {
    return partyChipStyles.default;
  }
  const normalizedParty = party
    ?.toLowerCase()
    .replace("québécois", "quebecois")
    .replace("quebecois", "");

  if (normalizedParty.includes("senate")) {
    return partyChipStyles.senate;
  }

  if (party.includes("cois")) {
    return partyChipStyles.bloc;
  }

  if (party.includes("Green Party")) {
    return partyChipStyles.green;
  }

  if (normalizedParty.includes("new democratic party")) {
    return partyChipStyles.ndp;
  }

  if (normalizedParty.includes("conservative")) {
    return partyChipStyles.conservative;
  }

  if (normalizedParty.includes("liberal")) {
    return partyChipStyles.liberal;
  }

  return (
    partyChipStyles[normalizedParty as keyof typeof partyChipStyles] ||
    partyChipStyles.default
  );
};
