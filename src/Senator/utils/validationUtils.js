/**
 * Validates if a vote belongs to a specific term based on date range and congress
 */
export const validateVoteInTermRange = (voteId, termId, allVotes = [], terms = []) => {
  if (!voteId || !termId)
    return { isValid: false, message: "Invalid selection" };

  const vote = allVotes.find((v) => v._id === voteId);
  const term = terms.find((t) => t._id === termId);

  if (!vote) return { isValid: false, message: "Vote not found" };
  if (!term) return { isValid: false, message: "Term not found" };

  const voteDate = new Date(vote.date);
  const termStart = new Date(`${term.startYear}-01-03`);
  const termEnd = new Date(`${term.endYear}-01-02`);

  const isDateInRange = voteDate >= termStart && voteDate <= termEnd;
  const isCongressInTerm = term.congresses.includes(Number(vote.congress));

  if (!isDateInRange) {
    return {
      isValid: false,
      message: `Selected vote is outside the term range (${term.startYear}-${term.endYear})`,
    };
  }

  if (!isCongressInTerm) {
    return {
      isValid: false,
      message: `This vote (Congress ${
        vote.congress
      }) is not part of the selected term's congresses (${term.congresses.join(
        ", "
      )})`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validates if an activity belongs to a specific term based on date range and congress
 */
export const validateActivityInTermRange = (activityId, termId, allActivities = [], terms = []) => {
  if (!activityId || !termId)
    return { isValid: false, message: "Invalid selection" };

  const activity = allActivities.find((a) => a._id === activityId);
  const term = terms.find((t) => t._id === termId);

  if (!activity) return { isValid: false, message: "Activity not found" };
  if (!term) return { isValid: false, message: "Term not found" };

  const activityDate = new Date(activity.date);
  const termStart = new Date(`${term.startYear}-01-03`);
  const termEnd = new Date(`${term.endYear}-01-02`);

  const isDateInRange = activityDate >= termStart && activityDate <= termEnd;
  const isCongressInTerm = term.congresses.includes(
    Number(activity.congress || 0)
  );

  if (!isDateInRange) {
    return {
      isValid: false,
      message: `Selected activity is outside the term range (${term.startYear}-${term.endYear})`,
    };
  }

  if (!isCongressInTerm) {
    return {
      isValid: false,
      message: `This activity (Congress ${
        activity.congress
      }) is not part of the selected term's congresses (${term.congresses.join(
        ", "
      )})`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Checks if a vote belongs to a specific term
 */
export const doesVoteBelongToTerm = (voteData, term) => {
  if (!voteData || !term) return false;

  const voteDate = new Date(voteData.date);
  const termStart = new Date(`${term.startYear}-01-03`);
  const termEnd = new Date(`${term.endYear}-01-02`);

  const inDateRange = voteDate >= termStart && voteDate <= termEnd;
  const inCongress = term.congresses.includes(Number(voteData.congress));

  return inDateRange && inCongress;
};

/**
 * Checks if an activity belongs to a specific term
 */
export const doesActivityBelongToTerm = (activityData, term) => {
  if (!activityData || !term) return false;

  const activityDate = new Date(activityData.date);
  const termStart = new Date(`${term.startYear}-01-03`);
  const termEnd = new Date(`${term.endYear}-01-02`);

  const inDateRange = activityDate >= termStart && activityDate <= termEnd;

  const inCongress =
    !activityData.congress ||
    term.congresses.includes(Number(activityData.congress || 0));

  return inDateRange && inCongress;
};

/**
 * Compares two values for equality
 */
export const compareValues = (newVal, oldVal) => {
  if (typeof newVal === "string" && typeof oldVal === "string") {
    return newVal.trim() !== oldVal.trim();
  }
  return newVal !== oldVal;
};

/**
 * Formats relative time from a date
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};

/**
 * Sanitizes a string to be used as a key
 */
export const sanitizeKey = (str) => {
  return str
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

