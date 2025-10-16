import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const StatusDisplay = ({
  userRole,
  formData,
  localChanges = [],
  statusData,
  termData = [],
  mode = "senator",
}) => {
  if (!userRole || !formData?.publishStatus || !statusData) return null;
  if (formData.publishStatus === "published" && localChanges.length === 0)
    return null;

  const senatorFormatFieldName = (field, index, senatorTermData = []) => {
    if (typeof field === "object" && field !== null) {
      if (
        Array.isArray(field.field) &&
        field.field[0] === "votesScore" &&
        field.name
      ) {
        const billTitle = field.name;
        for (
          let termIndex = 0;
          termIndex < senatorTermData.length;
          termIndex++
        ) {
          const term = senatorTermData[termIndex];
          const votesScore = term?.votesScore || [];
          for (let voteIndex = 0; voteIndex < votesScore.length; voteIndex++) {
            const vote = votesScore[voteIndex];
            if (vote) {
              if (vote.title && vote.title === billTitle) {
                return `Term ${termIndex + 1}: Scored Vote ${voteIndex + 1}`;
              }
              if (
                typeof vote.voteId === "object" &&
                vote.voteId.title === billTitle
              ) {
                return `Term ${termIndex + 1}: Scored Vote ${voteIndex + 1}`;
              }
              if (
                typeof vote.voteId === "string" &&
                vote.voteId === field._id
              ) {
                return `Term ${termIndex + 1}: Scored Vote ${voteIndex + 1}`;
              }
            }
          }
        }
        return null;
      }

      if (
        Array.isArray(field.field) &&
        field.field[0] === "activitiesScore" &&
        field.name
      ) {
        const activityTitle = field.name;
        for (
          let termIndex = 0;
          termIndex < senatorTermData.length;
          termIndex++
        ) {
          const term = senatorTermData[termIndex];
          const activitiesScore = term?.activitiesScore || [];
          for (
            let activityIndex = 0;
            activityIndex < activitiesScore.length;
            activityIndex++
          ) {
            const activity = activitiesScore[activityIndex];
            if (activity) {
              if (activity.title && activity.title === activityTitle) {
                return `Term ${termIndex + 1}: Tracked Activity ${
                  activityIndex + 1
                }`;
              }
              if (
                typeof activity.activityId === "object" &&
                activity.activityId.title === activityTitle
              ) {
                return `Term ${termIndex + 1}: Tracked Activity ${
                  activityIndex + 1
                }`;
              }
              if (
                typeof activity.activityId === "string" &&
                activity.activityId === field._id
              ) {
                return `Term ${termIndex + 1}: Tracked Activity ${
                  activityIndex + 1
                }`;
              }
            }
          }
        }
        return null;
      }

      if (
        Array.isArray(field.field) &&
        field.field[0] === "pastVotesScore" &&
        field.name
      ) {
        const billTitle = field.name;
        for (
          let termIndex = 0;
          termIndex < senatorTermData.length;
          termIndex++
        ) {
          const term = senatorTermData[termIndex];
          const pastVotesScore = term?.pastVotesScore || [];
          for (
            let voteIndex = 0;
            voteIndex < pastVotesScore.length;
            voteIndex++
          ) {
            const vote = pastVotesScore[voteIndex];
            if (vote) {
              if (vote.title && vote.title === billTitle) {
                return `Term ${termIndex + 1}: Important Past Vote ${
                  voteIndex + 1
                }`;
              }
              if (
                typeof vote.voteId === "object" &&
                vote.voteId.title === billTitle
              ) {
                return `Term ${termIndex + 1}: Important Past Vote ${
                  voteIndex + 1
                }`;
              }
              if (
                typeof vote.voteId === "string" &&
                vote.voteId === field._id
              ) {
                return `Term ${termIndex + 1}: Important Past Vote ${
                  voteIndex + 1
                }`;
              }
            }
          }
        }
        return null;
      }

      const fieldId = Array.isArray(field.field) ? field.field[0] : field.field;
      if (fieldId && fieldId.startsWith("term")) {
        const termMatch = fieldId.match(/^term(\d+)_(.+)$/);
        if (termMatch) {
          const [, termIndex, actualField] = termMatch;
          const termNumber = parseInt(termIndex) + 1;
          const fieldDisplayMap = {
            currentTerm: "Current Term",
            summary: "Term Summary",
            rating: "SBA Rating",
            termId: "Term",
            votesScore: "Scored Vote",
            activitiesScore: "Tracked Activity",
            pastVotesScore: "Important Past Vote",
          };
          const displayName = fieldDisplayMap[actualField] || actualField;
          return `Term ${termNumber}: ${displayName}`;
        }
      }

      const simpleFieldMap = {
        status: "Status",
        name: "Senator Name",
        state: "State",
        party: "Party",
        photo: "Photo",
        votesScore: "Scored Vote",
        activitiesScore: "Tracked Activity",
      };
      return (
        field.name || simpleFieldMap[fieldId] || fieldId || "Unknown Field"
      );
    }

    if (typeof field === "string") {
      const termArrayMatch = field.match(
        /^term(\d+)_(votesScore|activitiesScore|pastVotesScore)_(\d+)_(.+)$/
      );
      if (termArrayMatch) {
        const [, termIdx, category, itemIdx] = termArrayMatch;
        const termNumber = parseInt(termIdx) + 1;
        if (category === "votesScore") {
          const voteNumber = parseInt(itemIdx) + 1;
          return `Term ${termNumber}: Scored Vote ${voteNumber}`;
        }
        if (category === "activitiesScore") {
          const activityNumber = parseInt(itemIdx) + 1;
          return `Term ${termNumber}: Tracked Activity ${activityNumber}`;
        }
        if (category === "pastVotesScore") {
          const voteNumber = parseInt(itemIdx) + 1;
          return `Term ${termNumber}: Important Past Vote ${voteNumber}`;
        }
        return `Term ${termNumber}: ${category}`;
      }

      if (field.startsWith("term")) {
        const termMatch = field.match(/^term(\d+)_(.+)$/);
        if (termMatch) {
          const [, termIndex, actualField] = termMatch;
          const termNumber = parseInt(termIndex) + 1;
          const fieldDisplayMap = {
            currentTerm: "Current Term",
            summary: "Term Summary",
            rating: "SBA Rating",
            termId: "Term",
            votesScore: "Scored Vote",
            activitiesScore: "Tracked Activity",
          };
          const displayName = fieldDisplayMap[actualField] || actualField;
          return `Term ${termNumber}: ${displayName}`;
        }
        const parts = field.split("_");
        const termNumber = parseInt(parts[0].replace("term", "")) + 1;
        const fieldKey = parts.slice(1).join("_");
        return `Term ${termNumber}: ${fieldKey}`;
      }

      const simpleFieldMap = {
        status: "Status",
        name: "Senator Name",
        state: "State",
        district: "District",
        party: "Party",
        photo: "Photo",
        votesScore: "Scored Vote",
        activitiesScore: "Tracked Activity",
      };
      return simpleFieldMap[field] || field;
    }

    return `Field ${index + 1}`;
  };

  const representativeFormatFieldName = (field, index, houseTermData = []) => {
    if (typeof field === "object" && field !== null) {
      if (
        Array.isArray(field.field) &&
        field.field[0] === "votesScore" &&
        field.name
      ) {
        const billTitle = field.name;
        for (let termIndex = 0; termIndex < houseTermData.length; termIndex++) {
          const term = houseTermData[termIndex];
          const votesScore = term?.votesScore || [];
          for (let voteIndex = 0; voteIndex < votesScore.length; voteIndex++) {
            const vote = votesScore[voteIndex];
            if (vote) {
              if (vote.title && vote.title === billTitle) {
                return `Term ${termIndex + 1}: Scored Vote ${voteIndex + 1}`;
              }
              if (
                typeof vote.voteId === "object" &&
                vote.voteId.title === billTitle
              ) {
                return `Term ${termIndex + 1}: Scored Vote ${voteIndex + 1}`;
              }
              if (
                typeof vote.voteId === "string" &&
                vote.voteId === field._id
              ) {
                return `Term ${termIndex + 1}: Scored Vote ${voteIndex + 1}`;
              }
            }
          }
        }
        return null;
      }

      if (
        Array.isArray(field.field) &&
        field.field[0] === "activitiesScore" &&
        field.name
      ) {
        const activityTitle = field.name;
        for (let termIndex = 0; termIndex < houseTermData.length; termIndex++) {
          const term = houseTermData[termIndex];
          const activitiesScore = term?.activitiesScore || [];
          for (
            let activityIndex = 0;
            activityIndex < activitiesScore.length;
            activityIndex++
          ) {
            const activity = activitiesScore[activityIndex];
            if (activity) {
              if (activity.title && activity.title === activityTitle) {
                return `Term ${termIndex + 1}: Tracked Activity ${
                  activityIndex + 1
                }`;
              }
              if (
                typeof activity.activityId === "object" &&
                activity.activityId.title === activityTitle
              ) {
                return `Term ${termIndex + 1}: Tracked Activity ${
                  activityIndex + 1
                }`;
              }
              if (
                typeof activity.activityId === "string" &&
                activity.activityId === field._id
              ) {
                return `Term ${termIndex + 1}: Tracked Activity ${
                  activityIndex + 1
                }`;
              }
            }
          }
        }
        return null;
      }

      const fieldId = Array.isArray(field.field) ? field.field[0] : field.field;
      if (fieldId && fieldId.startsWith("term")) {
        const termMatch = fieldId.match(/^term(\d+)_(.+)$/);
        if (termMatch) {
          const [, termIndex, actualField] = termMatch;
          const termNumber = parseInt(termIndex) + 1;
          const fieldDisplayMap = {
            currentTerm: "Current Term",
            summary: "Term Summary",
            rating: "SBA Rating",
            termId: "Term",
            votesScore: "Scored Vote",
            activitiesScore: "Tracked Activity",
          };
          const displayName = fieldDisplayMap[actualField] || actualField;
          return `Term ${termNumber}: ${displayName}`;
        }
      }

      const simpleFieldMap = {
        status: "Status",
        name: "Representative Name",
        district: "District",
        party: "Party",
        photo: "Photo",
        votesScore: "Scored Vote",
        activitiesScore: "Tracked Activity",
      };
      return (
        field.name || simpleFieldMap[fieldId] || fieldId || "Unknown Field"
      );
    }

    if (typeof field === "string") {
      const termArrayMatch = field.match(
        /^term(\d+)_(votesScore|activitiesScore)_(\d+)_(.+)$/
      );
      if (termArrayMatch) {
        const [, termIdx, category, itemIdx] = termArrayMatch;
        const termNumber = parseInt(termIdx) + 1;
        if (category === "votesScore") {
          const voteNumber = parseInt(itemIdx) + 1;
          return `Term ${termNumber}: Scored Vote ${voteNumber}`;
        }
        if (category === "activitiesScore") {
          const activityNumber = parseInt(itemIdx) + 1;
          return `Term ${termNumber}: Tracked Activity ${activityNumber}`;
        }
        return `Term ${termNumber}: ${category}`;
      }

      if (field.startsWith("term")) {
        const termMatch = field.match(/^term(\d+)_(.+)$/);
        if (termMatch) {
          const [, termIndex, actualField] = termMatch;
          const termNumber = parseInt(termIndex) + 1;
          const fieldDisplayMap = {
            currentTerm: "Current Term",
            summary: "Term Summary",
            rating: "SBA Rating",
            termId: "Term",
            votesScore: "Scored Vote",
            activitiesScore: "Tracked Activity",
          };
          const displayName = fieldDisplayMap[actualField] || actualField;
          return `Term ${termNumber}: ${displayName}`;
        }
        const parts = field.split("_");
        const termNumber = parseInt(parts[0].replace("term", "")) + 1;
        const fieldKey = parts.slice(1).join("_");
        return `Term ${termNumber}: ${fieldKey}`;
      }

      const simpleFieldMap = {
        status: "Status",
        name: "Representative Name",
        district: "District",
        party: "Party",
        photo: "Photo",
        votesScore: "Scored Vote",
        activitiesScore: "Tracked Activity",
      };
      return simpleFieldMap[field] || field;
    }

    return `Field ${index + 1}`;
  };
  const formatFieldName = (field, index) => {
    if (mode === "senator") {
      return senatorFormatFieldName(field, index, termData);
    } else {
      return representativeFormatFieldName(field, index, termData);
    }
  };

  const getEditorKey = (field) => {
    const sanitizeKey = (str) => {
      return str
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    };

    if (typeof field === "object" && field !== null) {
      if (
        Array.isArray(field.field) &&
        field.field[0] === "votesScore" &&
        field.name
      ) {
        return `votesScore_${sanitizeKey(field.name)}`;
      }
      if (
        Array.isArray(field.field) &&
        field.field[0] === "activitiesScore" &&
        field.name
      ) {
        return `activitiesScore_${sanitizeKey(field.name)}`;
      }
      if (
        Array.isArray(field.field) &&
        field.field[0] === "pastVotesScore" &&
        field.name
      ) {
        return `pastVotesScore_${sanitizeKey(field.name)}`;
      }
      if (Array.isArray(field.field)) {
        return field.field[0];
      }
      return field.field;
    }
    return field;
  };

  const backendChanges = Array.isArray(formData?.editedFields)
    ? formData.editedFields
    : [];

  const hasChanges = backendChanges.length > 0 || localChanges.length > 0;

  if (!hasChanges) {
    return (
      <Box
        sx={{
          width: "97%",
          p: 2,
          backgroundColor: statusData.backgroundColor,
          borderLeft: `4px solid ${statusData.borderColor}`,
          borderRadius: "0 8px 8px 0",
          boxShadow: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: "50%",
              backgroundColor: `rgba(${
                formData.publishStatus === "draft"
                  ? "66, 165, 245"
                  : formData.publishStatus === "under review"
                  ? "230, 81, 0"
                  : formData.publishStatus === "published"
                  ? "76, 175, 80"
                  : "244, 67, 54"
              }, 0.2)`,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {React.cloneElement(statusData.icon, {
              sx: { color: statusData.iconColor },
            })}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              sx={{
                color: statusData.titleColor,
                mb: 0.5,
              }}
            >
              {statusData.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.disabled" }}>
              No pending changes
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: "90%", sm: "97%" },
        p: 2,
        backgroundColor: statusData.backgroundColor,
        borderLeft: `4px solid ${statusData.borderColor}`,
        borderRadius: "0 8px 8px 0",
        boxShadow: 1,
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box
          sx={{
            p: { xs: 0.4, sm: 1 },
            borderRadius: "50%",
            backgroundColor: `rgba(${
              formData.publishStatus === "draft"
                ? "66, 165, 245"
                : formData.publishStatus === "under review"
                ? "230, 81, 0"
                : formData.publishStatus === "published"
                ? "76, 175, 80"
                : "244, 67, 54"
            }, 0.2)`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(statusData.icon, {
            sx: { color: statusData.iconColor },
          })}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="600"
              sx={{
                color: statusData.titleColor,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {statusData.title}
            </Typography>
          </Box>
          <Box sx={{ mt: 1.5 }}>
            {backendChanges.length > 0 && (
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 1,
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  mb: 2,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", mb: 1 }}
                >
                  Saved Changes
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {backendChanges.map((field, index) => {
                    const fieldLabel = formatFieldName(field, index);
                    if (!fieldLabel) return null;

                    const editorKey = getEditorKey(field);
                    const editorInfo = formData?.fieldEditors?.[editorKey];
                    const editor = editorInfo?.editorName || "Unknown Editor";
                    const editTime = editorInfo?.editedAt
                      ? new Date(editorInfo.editedAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "unknown time";
                    const fromQuorum = field.fromQuorum || false;

                    return (
                      <ListItem
                        key={`backend-${field.field || field}-${index}`}
                        sx={{ py: 0.5, px: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: statusData.iconColor,
                                }}
                              />
                              <Typography variant="body2" fontWeight="500">
                                {fieldLabel}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {fromQuorum
                                ? `Fetched from Quorum by ${editor} on ${editTime}`
                                : `Updated by ${editor} on ${editTime}`}
                            </Typography>
                          }
                          sx={{ my: 0 }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
            {localChanges.length > 0 && (
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: 1,
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", mb: 1 }}
                >
                  {formData.publishStatus === "published"
                    ? ""
                    : "Unsaved Changes"}
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {localChanges.map((field, index) => (
                    <ListItem
                      key={`local-${field}-${index}`}
                      sx={{ py: 0, px: 1 }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: statusData.iconColor,
                              }}
                            />
                            <Typography variant="body2" fontWeight="500">
                              {formatFieldName(field, index)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StatusDisplay;
