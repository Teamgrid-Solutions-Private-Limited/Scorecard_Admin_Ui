export const FIELD_LABELS = {
  name: "Senator Name",
  status: "Status",
  state: "State",
  party: "Party",
  photo: "Photo",
  term: "Term",
  publishStatus: "Publish Status",
  senateId: "Senate ID",
  summary: "Term Summary",
  rating: "SBA Rating",
  votesScore: "Scored Vote",
  activitiesScore: "Tracked Activity",
  currentTerm: "Current Term",
  termId: "Term",
};

export const STATUS_CONFIGS = {
  draft: {
    backgroundColor: "rgba(66, 165, 245, 0.12)",
    borderColor: "#2196F3",
    iconColor: "#1565C0",
    title: "Draft Version",
    titleColor: "#0D47A1",
    descColor: "#1976D2",
  },
  "under review": {
    backgroundColor: "rgba(255, 193, 7, 0.12)",
    borderColor: "#FFC107",
    iconColor: "#FFA000",
    title: "Under Review",
    titleColor: "#5D4037",
    descColor: "#795548",
  },
  published: {
    backgroundColor: "rgba(255, 193, 7, 0.12)",
    borderColor: "#FFC107",
    iconColor: "#FFA000",
    title: "Unsaved Changes",
    titleColor: "#5D4037",
    descColor: "#795548",
  },
};

export const DEFAULT_TERM_DATA = {
  senateId: "",
  summary: "",
  rating: "",
  votesScore: [{ voteId: "", score: "" }],
  activitiesScore: [{ activityId: "", score: "" }],
  pastVotesScore: [{ voteId: "", score: "" }],
  currentTerm: false,
  termId: null,
};

