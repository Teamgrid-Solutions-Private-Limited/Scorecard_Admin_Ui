import { doesVoteBelongToTerm, doesActivityBelongToTerm } from "./validationUtils";

/**
 * Gets available terms for selection (excluding already selected ones)
 */
export const getAvailableTerms = (currentTermIndex, senatorTermData = [], terms = []) => {
  const selectedTermIds = senatorTermData
    .map((term, index) => {
      if (index === currentTermIndex) return null;
      return term.termId?._id || term.termId;
    })
    .filter(Boolean);

  return terms?.filter((term) => !selectedTermIds.includes(term._id)) || [];
};

/**
 * Gets a valid term ID (checks if term exists)
 */
export const getValidTermId = (termId, terms = []) => {
  const termExists = terms?.some((t) => t._id === termId);
  return termExists ? termId : "";
};

/**
 * Gets field display name for labels
 */
export const getFieldDisplayName = (field, fieldLabels = {}) => {
  if (field.includes("_")) {
    const [termPrefix, actualField] = field.split("_");
    return `${termPrefix.replace("term", "Term ")}: ${
      fieldLabels[actualField] || actualField
    }`;
  }
  return fieldLabels[field] || field;
};

/**
 * Maps vote score to standardized format
 */
export const normalizeVoteScore = (score) => {
  if (!score) return "";
  const voteScore = String(score).toLowerCase();
  if (voteScore.includes("yea")) return "yea";
  if (voteScore.includes("nay")) return "nay";
  if (voteScore.includes("other")) return "other";
  return score;
};

/**
 * Maps activity score to standardized format
 */
export const normalizeActivityScore = (score) => {
  if (!score) return "";
  const s = String(score).toLowerCase();
  if (s.includes("yea") || s === "yes") return "yes";
  if (s.includes("nay") || s === "no") return "no";
  if (s.includes("other")) return "other";
  return score;
};

/**
 * Filters votes that belong to a term and have scores
 */
export const filterTermVotes = (allVotes = [], term, senatorVotes = []) => {
  if (!term) return [];
  
  const termStart = new Date(`${term.startYear}-01-03`);
  const termEnd = new Date(`${term.endYear}-01-02`);

  return allVotes.filter((vote) => {
    const voteDate = new Date(vote.date);
    const inTerm =
      voteDate >= termStart &&
      voteDate <= termEnd &&
      term.congresses.includes(Number(vote.congress));

    if (!inTerm) return false;
    
    return senatorVotes.some((v) => {
      if (!v?.score || v.score.trim() === "") return false;
      const vId = typeof v.voteId === "object" ? v.voteId?._id : v.voteId;
      return (
        vId === vote._id ||
        v.quorumId === vote.quorumId ||
        (v.billNumber && vote.billNumber && v.billNumber === vote.billNumber)
      );
    });
  });
};

/**
 * Filters activities that belong to a term and have scores
 */
export const filterTermActivities = (allActivities = [], term, senatorActivities = []) => {
  if (!term) return [];
  
  const termStart = new Date(`${term.startYear}-01-03`);
  const termEnd = new Date(`${term.endYear}-01-02`);

  return allActivities.filter((activity) => {
    const activityDate = new Date(activity.date);
    const inTerm =
      activityDate >= termStart &&
      activityDate <= termEnd &&
      term.congresses.includes(Number(activity.congress || 0));

    if (!inTerm) return false;
    
    return senatorActivities.some((a) => {
      if (!a?.score || a.score.trim() === "") return false;
      const aId =
        typeof a.activityId === "object" ? a.activityId?._id : a.activityId;
      return aId === activity._id;
    });
  });
};

