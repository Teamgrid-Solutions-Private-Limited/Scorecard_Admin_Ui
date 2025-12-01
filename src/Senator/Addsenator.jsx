import * as React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { alpha, styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box, Paper, Stack, Button } from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  DeleteForever as DeleteForeverIcon,
  Add as AddIcon,
  HourglassTop,
  Drafts,
  Circle as CircleIcon,
} from "@mui/icons-material";

import AppTheme from "../../src/shared-theme/AppTheme";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";

import SideMenu from "../components/SideMenu";
import BasicInfo from "../components/BasicInfo";
import SenatorTermSection from "../components/senatorService/SenatorTermSection";
import StatusDisplay from "../components/StatusDisplay";
import SnackbarComponent from "../components/SnackbarComponent";
import ActionButtons from "../components/ActionButtons";
import Typography from "@mui/material/Typography";
import {
  getSenatorDataBySenetorId,
  createSenatorData,
  updateSenatorData,
  clearSenatorDataState,
  deleteSenatorData,
} from "../redux/reducer/senetorTermSlice";
import {
  getSenatorById,
  updateSenator,
  clearSenatorState,
  updateSenatorStatus,
  discardSenatorChanges,
} from "../redux/reducer/senetorSlice";
import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
  getAllVotes,
} from "../redux/reducer/voteSlice";
import { getAllActivity } from "../redux/reducer/activitySlice";
import { getAllTerms } from "../redux/reducer/termSlice";
import DialogBox from "../components/DialogBox";
import CircularProgress from "@mui/material/CircularProgress";

export default function AddSenator(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { senator } = useSelector((state) => state.senator);
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const { activities } = useSelector((state) => state.activity);
  const senatorData = useSelector((state) => state.senatorData);
  const loadingg = useSelector((state) => state.senatorData.loading);
  const [editedFields, setEditedFields] = useState([]);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [originalTermData, setOriginalTermData] = useState([]);
  const [localChanges, setLocalChanges] = useState([]);
  const [deletedTermIds, setDeletedTermIds] = useState([]);
  const [openDiscardDialog, setOpenDiscardDialog] = useState(false);
  const [componentKey, setComponentKey] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [votesLoaded, setVotesLoaded] = useState(false);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [termsLoaded, setTermsLoaded] = useState(false);
  const [loading, setLoading] = useState(loadingg);
const [removedItems, setRemovedItems] = useState({
  votes: [],
  activities: [],
  pastVotes: []
});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const allVotes = useSelector((state) => state.vote.votes);
  const [selectionError, setSelectionError] = useState({
    show: false,
    message: "",
    type: "",
  });

  const validateVoteInTermRange = (voteId, termId) => {
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

  const validateActivityInTermRange = (activityId, termId) => {
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

  const allActivities = useSelector((state) => state.activity.activities);

  const termStart = new Date(
    `${senatorData?.currentSenator?.[0]?.termId?.startYear}-01-03`
  );
  const termEnd = new Date(
    `${senatorData?.currentSenator?.[0]?.termId?.endYear}-01-02`
  );

  const senatorr = senatorData?.currentSenator?.[0];
  const senatorVotes = senatorr?.votesScore || [];

  const participatedVotes = allVotes.filter((vote) => {
    const voteDate = new Date(vote.date);

    const inTerm =
      voteDate >= termStart &&
      voteDate <= termEnd &&
      senatorr?.termId?.congresses.includes(Number(vote.congress));

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

  const doesVoteBelongToTerm = (voteData, term) => {
    if (!voteData || !term) return false;

    const voteDate = new Date(voteData.date);
    const termStart = new Date(`${term.startYear}-01-03`);
    const termEnd = new Date(`${term.endYear}-01-02`);

    const inDateRange = voteDate >= termStart && voteDate <= termEnd;

    const inCongress = term.congresses.includes(Number(voteData.congress));

    return inDateRange && inCongress;
  };

  const doesActivityBelongToTerm = (activityData, term) => {
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

  const senatorActivities = senatorr?.activitiesScore || [];

  const fieldLabels = {
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
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  const formatRelativeTime = (date) => {
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
  const getAvailableTerms = (currentTermIndex) => {
    const selectedTermIds = senatorTermData
      .map((term, index) => {
        if (index === currentTermIndex) return null;
        return term.termId?._id || term.termId;
      })
      .filter(Boolean);

    return terms?.filter((term) => !selectedTermIds.includes(term._id)) || [];
  };

  const getFieldDisplayName = (field) => {
    if (field.includes("_")) {
      const [termPrefix, actualField] = field.split("_");
      return `${termPrefix.replace("term", "Term ")}: ${
        fieldLabels[actualField] || actualField
      }`;
    }
    return fieldLabels[field] || field;
  };
  const [formData, setFormData] = useState({
    name: "",
    status: "",
    state: "",
    party: "",
    photo: null,
    term: "",
    publishStatus: "",
  });

  const [senatorTermData, setSenatorTermData] = useState([
    {
      senateId: id,
      summary: "",
      rating: "",
      votesScore: [{ voteId: "", score: "" }],
      activitiesScore: [{ activityId: "", score: "" }],
      pastVotesScore: [{ voteId: "", score: "" }],
      currentTerm: false,
      termId: null,
    },
  ]);

  const handleTermChange = (e, termIndex) => {
    const { name, value } = e.target;
    const fieldName = `term${termIndex}_${e.target.name}`;
    setSenatorTermData((prev) => {
      const newTerms = prev.map((term, index) => {
        if (index !== termIndex) return term;

        let updatedTerm = { ...term, [name]: value };

        if (name === "termId" && value) {
          const selectedTerm = terms?.find((t) => t._id === value);

          if (selectedTerm) {
            const newTermStart = new Date(`${selectedTerm.startYear}-01-03`);
            const newTermEnd = new Date(`${selectedTerm.endYear}-01-02`);

            const newFilteredVotes = allVotes.filter((vote) => {
              const voteDate = new Date(vote.date);

              const inTerm =
                voteDate >= newTermStart &&
                voteDate <= newTermEnd &&
                selectedTerm.congresses.includes(Number(vote.congress));

              if (!inTerm) return false;
              return senatorVotes.some((v) => {
                if (!v?.score || v.score.trim() === "") return false;

                const vId =
                  typeof v.voteId === "object" ? v.voteId?._id : v.voteId;

                return (
                  vId === vote._id ||
                  v.quorumId === vote.quorumId ||
                  (v.billNumber &&
                    vote.billNumber &&
                    v.billNumber === vote.billNumber)
                );
              });
            });

            const existingVoteScores = term.votesScore || [];

            updatedTerm.votesScore = newFilteredVotes.map((vote) => {
              const senatorVote = senatorVotes.find((v) => {
                const vId =
                  typeof v.voteId === "object" ? v.voteId?._id : v.voteId;
                return (
                  vId === vote._id ||
                  v.quorumId === vote.quorumId ||
                  (v.billNumber &&
                    vote.billNumber &&
                    v.billNumber === vote.billNumber)
                );
              });

              let scoreValue = "";
              if (senatorVote?.score) {
                const voteScore = senatorVote.score.toLowerCase();
                if (voteScore.includes("yea")) {
                  scoreValue = "yea";
                } else if (voteScore.includes("nay")) {
                  scoreValue = "nay";
                } else if (voteScore.includes("other")) {
                  scoreValue = "other";
                } else {
                  scoreValue = senatorVote.score;
                }
              }

              return {
                voteId: vote._id,
                score: scoreValue,
                title: vote.title,
              };
            });

            if (updatedTerm.votesScore.length === 0) {
              updatedTerm.votesScore = [{ voteId: "", score: "" }];
            }

            const newParticipatedActivities = allActivities.filter(
              (activity) => {
                const activityDate = new Date(activity.date);

                const inTerm =
                  activityDate >= newTermStart &&
                  activityDate <= newTermEnd &&
                  selectedTerm.congresses.includes(
                    Number(activity.congress || 0)
                  );

                if (!inTerm) return false;
                return senatorActivities.some((a) => {
                  if (!a?.score || a.score.trim() === "") return false;

                  const aId =
                    typeof a.activityId === "object"
                      ? a.activityId?._id
                      : a.activityId;

                  return aId === activity._id;
                });
              }
            );

            updatedTerm.activitiesScore = newParticipatedActivities.map(
              (activity) => {
                const senAct = senatorActivities.find((a) => {
                  const aId =
                    typeof a.activityId === "object"
                      ? a.activityId?._id
                      : a.activityId;
                  return aId === activity._id;
                });

                let mappedScore = "";
                if (senAct?.score) {
                  const s = String(senAct.score).toLowerCase();
                  if (s.includes("yea") || s === "yes") mappedScore = "yes";
                  else if (s.includes("nay") || s === "no") mappedScore = "no";
                  else if (s.includes("other")) mappedScore = "other";
                  else mappedScore = senAct.score;
                }

                return {
                  activityId: activity._id,
                  score: mappedScore,
                  title: activity.title,
                };
              }
            );

            if (updatedTerm.activitiesScore.length === 0) {
              updatedTerm.activitiesScore = [{ activityId: "", score: "" }];
            }

            const newPastVotes = allVotes.filter((vote) => {
              return vote.isImportantPastVote === true;
            });

            updatedTerm.pastVotesScore = newPastVotes.map((vote) => {
              const senatorPastVote = senatorVotes.find((v) => {
                const vId =
                  typeof v.voteId === "object" ? v.voteId?._id : v.voteId;
                return vId === vote._id;
              });

              return {
                voteId: vote._id,
                score: senatorPastVote?.score || "",
                title: vote.title,
              };
            });

            if (updatedTerm.pastVotesScore.length === 0) {
              updatedTerm.pastVotesScore = [{ voteId: "", score: "" }];
            }
          }
        }

        return updatedTerm;
      });
      const originalTerm = originalTermData[termIndex] || {};
      const isActualChange = compareValues(value, originalTerm[name]);

      if (isActualChange && !localChanges.includes(fieldName)) {
        setLocalChanges((prev) => [...prev, fieldName]);
      } else if (!isActualChange && localChanges.includes(fieldName)) {
        setLocalChanges((prev) => prev.filter((f) => f !== fieldName));
      }

      return newTerms;
    });
  };

  const handleSwitchChange = (e, termIndex) => {
    const { name, checked } = e.target;
    const fieldName = `term${termIndex}_${name}`;

    setSenatorTermData((prev) => {
      const newTerms = prev.map((term, index) =>
        index === termIndex ? { ...term, [name]: checked } : term
      );

      const originalTerm = originalTermData[termIndex] || {};
      const isActualChange = compareValues(checked, originalTerm[name]);

      if (isActualChange && !localChanges.includes(fieldName)) {
        setLocalChanges((prev) => [...prev, fieldName]);
      } else if (!isActualChange && localChanges.includes(fieldName)) {
        setLocalChanges((prev) => prev.filter((f) => f !== fieldName));
      }

      return newTerms;
    });
  };
  const hasSelectedTerms = () => {
    return senatorTermData.some(
      (term) => term.termId && term.termId.toString().trim() !== ""
    );
  };
  const handleSummaryChange = (termIndex, content) => {
    const fieldName = `term${termIndex}_summary`;

    setSenatorTermData((prev) => {
      const newTerms = prev.map((term, idx) => {
        if (idx !== termIndex) return term;

        return { ...term, summary: content };
      });

      const originalTerm = originalTermData[termIndex] || {};
      const originalSummary = originalTerm.summary || "";
      const isActualChange = compareValues(content, originalSummary);

      if (isActualChange && !localChanges.includes(fieldName)) {
        setLocalChanges((prev) => [...prev, fieldName]);
      } else if (!isActualChange && localChanges.includes(fieldName)) {
        setLocalChanges((prev) => prev.filter((f) => f !== fieldName));
      }

      return newTerms;
    });
  };

  const handleAddVote = (termIndex) => {
    setSenatorTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              votesScore: [...term.votesScore, { voteId: "", score: "" }],
            }
          : term
      )
    );
  };

  const handleDiscard = () => {
    if (!id) {
      setSnackbarMessage("No house selected");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }
    setOpenDiscardDialog(true);
  };

  const handleConfirmDiscard = async () => {
    setOpenDiscardDialog(false);

    try {
      setLoading(true);
      await dispatch(discardSenatorChanges(id)).unwrap();
      navigate(0);

      await dispatch(getSenatorById(id));
      await dispatch(getSenatorDataBySenetorId(id));
      setSnackbarMessage(
        `Changes ${userRole === "admin" ? "Discard" : "Undo"} successfully`
      );
      setSnackbarSeverity("success");
      setComponentKey((prev) => prev + 1);
    } catch (error) {
      console.error("Discard failed:", error);
      const errorMessage =
        error?.payload?.message ||
        error?.message ||
        (typeof error === "string"
          ? error
          : `Failed to ${userRole === "admin" ? "Discard" : "Undo"} changes`);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
      setLoading(false);
    }
  };
const handleRemoveVote = (termIndex, voteIndex) => {
  const voteToRemove = senatorTermData[termIndex].votesScore[voteIndex];
  const removedFieldKey = `term${termIndex}_ScoredVote_${voteIndex + 1}_removed`;
  const addedFieldKey = `term${termIndex}_ScoredVote_${voteIndex + 1}`;
  
  // console.log('=== handleRemoveVote ===');
  // console.log('Current localChanges before removal:', localChanges);
  // console.log('Removing vote with key:', removedFieldKey);
  // console.log('Vote to remove:', voteToRemove);
  
  // Check if this was a newly added empty vote (no voteId and no score)
  const isNewEmptyVote = !voteToRemove?.voteId && (!voteToRemove?.score || voteToRemove.score === "");
  
  // Check original data to see if this vote existed in the database
  const originalTerm = originalTermData[termIndex] || {};
  const originalVotes = originalTerm.votesScore || [];
  const originalVoteAtIndex = originalVotes[voteIndex];
  const existedInOriginal = originalVoteAtIndex && 
                           (originalVoteAtIndex.voteId || originalVoteAtIndex.score);
  
  // console.log('Is new empty vote:', isNewEmptyVote);
  // console.log('Existed in original:', existedInOriginal);
  // console.log('Original votes at index:', originalVoteAtIndex);

  // If the vote has an ID and is being removed, track it (only if it existed in original)
  if (voteToRemove?.voteId && voteToRemove.voteId.toString().trim() !== "" && existedInOriginal) {
    const voteItem = allVotes.find((v) => v._id === voteToRemove.voteId);
    if (voteItem) {
      setRemovedItems(prev => ({
        ...prev,
        votes: [...prev.votes, {
          termIndex,
          voteIndex,
          voteId: voteToRemove.voteId,
          title: voteItem.title,
          fieldKey: removedFieldKey
        }]
      }));

      const decodedToken = jwtDecode(token);
      const currentEditor = {
        editorId: decodedToken.userId,
        editorName: localStorage.getItem("user") || "Unknown Editor",
        editedAt: new Date().toISOString(),
      };

      setFormData(prev => ({
        ...prev,
        fieldEditors: {
          ...prev.fieldEditors,
          [removedFieldKey]: currentEditor
        }
      }));
    }
  }

  // Single state update for localChanges
  setLocalChanges((prev) => {
    let cleanedChanges;
    
    if (isNewEmptyVote && !existedInOriginal) {
      // If it's a newly added empty vote that didn't exist in original, completely remove both addition and removal markers
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey &&
          change !== removedFieldKey
      );
      // console.log('Removing newly added empty vote that never existed, cleaned changes:', cleanedChanges);
    } else if (existedInOriginal) {
      // For votes that existed in original data, clean up the addition marker and add removal marker
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey
      );
      // Only add removal marker if it's not already there
      if (!cleanedChanges.includes(removedFieldKey)) {
        cleanedChanges = [...cleanedChanges, removedFieldKey];
      }
      // console.log('Removing existing vote from original data, cleaned changes:', cleanedChanges);
    } else {
      // For other cases, just clean up the addition marker
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey
      );
      // console.log('Default cleanup, cleaned changes:', cleanedChanges);
    }
    
    return cleanedChanges;
  });

  // Remove the vote from the data
  setSenatorTermData((prev) => {
    return prev.map((term, index) =>
      index === termIndex
        ? {
            ...term,
            votesScore: term.votesScore.filter((_, i) => i !== voteIndex),
          }
        : term
    );
  });
};
  const handleVoteChange = (termIndex, voteIndex, field, value) => {
    const voteChangeId = `term${termIndex}_ScoredVote_${voteIndex + 1}`;
    if (field === "voteId" && value) {
      const termId = senatorTermData[termIndex].termId;
      const validation = validateVoteInTermRange(value, termId);

      if (!validation.isValid) {
        setSelectionError({
          show: true,
          message: validation.message,
          type: "vote",
        });
        return;
      }
    }

    setSenatorTermData((prev) => {
      const newTerms = prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              votesScore: term.votesScore.map((vote, i) =>
                i === voteIndex ? { ...vote, [field]: value } : vote
              ),
            }
          : term
      );

      const originalTerm = originalTermData[termIndex] || {};
      const originalVote = originalTerm.votesScore?.[voteIndex] || {};
      const isActualChange = compareValues(value, originalVote[field]);

      if (isActualChange && !localChanges.includes(voteChangeId)) {
        setLocalChanges((prev) => [...prev, voteChangeId]);
      } else if (!isActualChange && localChanges.includes(voteChangeId)) {
        setLocalChanges((prev) => prev.filter((f) => f !== voteChangeId));
      }

      return newTerms;
    });
  };

  const handleAddActivity = (termIndex) => {
    setSenatorTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              activitiesScore: [
                ...term.activitiesScore,
                { activityId: "", score: "" },
              ],
            }
          : term
      )
    );
  };

const handleRemoveActivity = (termIndex, activityIndex) => {
  const activityToRemove = senatorTermData[termIndex].activitiesScore[activityIndex];
  const removedFieldKey = `term${termIndex}_TrackedActivity_${activityIndex + 1}_removed`;
  const addedFieldKey = `term${termIndex}_TrackedActivity_${activityIndex + 1}`;
  
  // console.log('=== handleRemoveActivity ===');
  // console.log('Current localChanges before removal:', localChanges);
  // console.log('Removing activity with key:', removedFieldKey);
  // console.log('Activity to remove:', activityToRemove);
  
  // Check if this was a newly added empty activity (no activityId and no score)
  const isNewEmptyActivity = !activityToRemove?.activityId && (!activityToRemove?.score || activityToRemove.score === "");
  
  // Check original data to see if this activity existed in the database
  const originalTerm = originalTermData[termIndex] || {};
  const originalActivities = originalTerm.activitiesScore || [];
  const originalActivityAtIndex = originalActivities[activityIndex];
  const existedInOriginal = originalActivityAtIndex && 
                           (originalActivityAtIndex.activityId || originalActivityAtIndex.score);
  
  // console.log('Is new empty activity:', isNewEmptyActivity);
  // console.log('Existed in original:', existedInOriginal);

  // If the activity has an ID and is being removed, track it (only if it existed in original)
  if (activityToRemove?.activityId && activityToRemove.activityId.toString().trim() !== "" && existedInOriginal) {
    const activityItem = allActivities.find((a) => a._id === activityToRemove.activityId);
    if (activityItem) {
      setRemovedItems(prev => ({
        ...prev,
        activities: [...prev.activities, {
          termIndex,
          activityIndex,
          activityId: activityToRemove.activityId,
          title: activityItem.title,
          fieldKey: removedFieldKey
        }]
      }));

      const decodedToken = jwtDecode(token);
      const currentEditor = {
        editorId: decodedToken.userId,
        editorName: localStorage.getItem("user") || "Unknown Editor",
        editedAt: new Date().toISOString(),
      };

      setFormData(prev => ({
        ...prev,
        fieldEditors: {
          ...prev.fieldEditors,
          [removedFieldKey]: currentEditor
        }
      }));
    }
  }

  // Single state update for localChanges
  setLocalChanges((prev) => {
    let cleanedChanges;
    
    if (isNewEmptyActivity && !existedInOriginal) {
      // If it's a newly added empty activity that didn't exist in original, completely remove both addition and removal markers
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey &&
          change !== removedFieldKey
      );
      // console.log('Removing newly added empty activity that never existed, cleaned changes:', cleanedChanges);
    } else if (existedInOriginal) {
      // For activities that existed in original data, clean up the addition marker and add removal marker
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey
      );
      // Only add removal marker if it's not already there
      if (!cleanedChanges.includes(removedFieldKey)) {
        cleanedChanges = [...cleanedChanges, removedFieldKey];
      }
      // console.log('Removing existing activity from original data, cleaned changes:', cleanedChanges);
    } else {
      // For other cases, just clean up the addition marker
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey
      );
      // console.log('Default cleanup, cleaned changes:', cleanedChanges);
    }
    
    return cleanedChanges;
  });

  // Remove the activity from the data
  setSenatorTermData((prev) => {
    return prev.map((term, index) =>
      index === termIndex
        ? {
            ...term,
            activitiesScore: term.activitiesScore.filter(
              (_, i) => i !== activityIndex
            ),
          }
        : term
    );
  });
};

  const handleActivityChange = (termIndex, activityIndex, field, value) => {
    const activityChangeId = `term${termIndex}_TrackedActivity_${
      activityIndex + 1
    }`;
    if (field === "activityId" && value) {
      const termId = senatorTermData[termIndex].termId;
      const validation = validateActivityInTermRange(value, termId);

      if (!validation.isValid) {
        setSelectionError({
          show: true,
          message: validation.message,
          type: "activity",
        });
        return;
      }
    }

    setSenatorTermData((prev) => {
      const newTerms = prev.map((term, idx) => {
        if (idx !== termIndex) return term;

        const newActivities = term.activitiesScore.map((activity, i) =>
          i === activityIndex ? { ...activity, [field]: value } : activity
        );

        return { ...term, activitiesScore: newActivities };
      });

      const originalTerm = originalTermData[termIndex] || {};
      const originalActivity =
        originalTerm.activitiesScore?.[activityIndex] || {};
      const isActualChange = compareValues(value, originalActivity[field]);

      setLocalChanges((prevChanges) => {
        if (isActualChange && !prevChanges.includes(activityChangeId)) {
          return [...prevChanges, activityChangeId];
        } else if (!isActualChange && prevChanges.includes(activityChangeId)) {
          return prevChanges.filter((f) => f !== activityChangeId);
        }
        return prevChanges;
      });

      return newTerms;
    });
  };

  const handleAddPastVote = (termIndex) => {
    setSenatorTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              pastVotesScore: [
                ...(term.pastVotesScore || []),
                { voteId: "", score: "" },
              ],
            }
          : term
      )
    );
  };
const handleRemovePastVote = (termIndex, voteIndex) => {
  const voteToRemove = senatorTermData[termIndex].pastVotesScore[voteIndex];
  const removedFieldKey = `term${termIndex}_pastVotesScore_${voteIndex + 1}_removed`;
  const addedFieldKey = `term${termIndex}_pastVotesScore_${voteIndex + 1}`;
  
  // console.log('=== handleRemovePastVote ===');
  // console.log('Current localChanges before removal:', localChanges);
  // console.log('Removing past vote with key:', removedFieldKey);
  // console.log('Past vote to remove:', voteToRemove);
  
  // Check if this was a newly added empty past vote (no voteId and no score)
  const isNewEmptyVote = !voteToRemove?.voteId && (!voteToRemove?.score || voteToRemove.score === "");
  
  // Check original data to see if this past vote existed in the database
  const originalTerm = originalTermData[termIndex] || {};
  const originalPastVotes = originalTerm.pastVotesScore || [];
  const originalPastVoteAtIndex = originalPastVotes[voteIndex];
  const existedInOriginal = originalPastVoteAtIndex && 
                           (originalPastVoteAtIndex.voteId || originalPastVoteAtIndex.score);
  
  // console.log('Is new empty past vote:', isNewEmptyVote);
  // console.log('Existed in original:', existedInOriginal);
  // console.log('Original past votes at index:', originalPastVoteAtIndex);

  // If the past vote has an ID and is being removed, track it (only if it existed in original)
  if (voteToRemove?.voteId && voteToRemove.voteId.toString().trim() !== "" && existedInOriginal) {
    const voteItem = allVotes.find((v) => v._id === voteToRemove.voteId);
    if (voteItem) {
      setRemovedItems(prev => ({
        ...prev,
        pastVotes: [...prev.pastVotes, {
          termIndex,
          voteIndex,
          voteId: voteToRemove.voteId,
          title: voteItem.title,
          fieldKey: removedFieldKey
        }]
      }));

      const decodedToken = jwtDecode(token);
      const currentEditor = {
        editorId: decodedToken.userId,
        editorName: localStorage.getItem("user") || "Unknown Editor",
        editedAt: new Date().toISOString(),
      };

      setFormData(prev => ({
        ...prev,
        fieldEditors: {
          ...prev.fieldEditors,
          [removedFieldKey]: currentEditor
        }
      }));
    }
  }

  // Single state update for localChanges
  setLocalChanges((prev) => {
    let cleanedChanges;
    
    if (isNewEmptyVote && !existedInOriginal) {
      // If it's a newly added empty past vote that didn't exist in original, completely remove both addition and removal markers
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey &&
          change !== removedFieldKey
      );
      // console.log('Removing newly added empty past vote that never existed, cleaned changes:', cleanedChanges);
    } else if (existedInOriginal) {
      // For past votes that existed in original data, clean up the addition marker and add removal marker
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey
      );
      // Only add removal marker if it's not already there
      if (!cleanedChanges.includes(removedFieldKey)) {
        cleanedChanges = [...cleanedChanges, removedFieldKey];
      }
      // console.log('Removing existing past vote from original data, cleaned changes:', cleanedChanges);
    } else {
      // For other cases, just clean up the addition marker
      cleanedChanges = prev.filter(
        (change) =>
          change !== addedFieldKey
      );
      // console.log('Default cleanup, cleaned changes:', cleanedChanges);
    }
    
    return cleanedChanges;
  });

  // Remove the past vote from the data
  setSenatorTermData((prev) => {
    return prev.map((term, index) =>
      index === termIndex
        ? {
            ...term,
            pastVotesScore: term.pastVotesScore.filter(
              (_, i) => i !== voteIndex
            ),
          }
        : term
    );
  });
};
  const handlePastVoteChange = (termIndex, voteIndex, field, value) => {
    const voteChangeId = `term${termIndex}_pastVotesScore_${voteIndex + 1}`;

    setSenatorTermData((prev) => {
      const newTerms = prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              pastVotesScore: term.pastVotesScore.map((vote, i) =>
                i === voteIndex ? { ...vote, [field]: value } : vote
              ),
            }
          : term
      );

      const originalTerm = originalTermData[termIndex] || {};
      const originalVote = originalTerm.pastVotesScore?.[voteIndex] || {};
      const isActualChange = compareValues(value, originalVote[field]);

      if (isActualChange && !localChanges.includes(voteChangeId)) {
        setLocalChanges((prev) => [...prev, voteChangeId]);
      } else if (!isActualChange && localChanges.includes(voteChangeId)) {
        setLocalChanges((prev) => prev.filter((f) => f !== voteChangeId));
      }

      return newTerms;
    });
  };

  const contentRefs = useRef([]);
useEffect(() => {
  // console.log('=== localChanges state updated ===', localChanges);
}, [localChanges]);
  const handleAddTerm = () => {
    setSenatorTermData((prev) => [
      ...prev,
      {
        senateId: id,
        summary: "",
        rating: "",
        votesScore: [{ voteId: "", score: "" }],
        activitiesScore: [{ activityId: "", score: "" }],
        pastVotesScore: [{ voteId: "", score: "" }],
        currentTerm: false,
        termId: null,
        editedFields: [],
        fieldEditors: {},
        isNew: true,
      },
    ]);
  };

  const handleRemoveTerm = (termIndex) => {
    setSenatorTermData((prev) => {
      const removed = prev[termIndex];
      const removalId = `Term_${termIndex + 1} Removed`;
      if (removed && removed._id) {
        setDeletedTermIds((ids) => [...ids, removed._id]);
        if (!localChanges.includes(removalId)) {
          setLocalChanges((prev) => [...prev, removalId]);
        }
      }
      setLocalChanges((prevChanges) =>
        prevChanges.filter((change) => !change.startsWith(`term${termIndex}_`))
      );
      return prev.filter((_, index) => index !== termIndex);
    });
  };

  const compareValues = (newVal, oldVal) => {
    if (typeof newVal === "string" && typeof oldVal === "string") {
      return newVal.trim() !== oldVal.trim();
    }
    return newVal !== oldVal;
  };
  const isDataReady = () => {
    return (
      !isInitialLoad &&
      dataLoaded &&
      termsLoaded &&
      votesLoaded &&
      activitiesLoaded &&
      terms?.length > 0 &&
      allVotes?.length > 0 &&
      allActivities?.length > 0
    );
  };
  useEffect(() => {
    if (isDataReady()) {
      termPreFill();
      preFillForm();
    }
  }, [dataLoaded, termsLoaded, votesLoaded, activitiesLoaded, senatorData]);

  const termPreFill = () => {
    if (!terms?.length || !allVotes?.length || !allActivities?.length) {
      return;
    }
    if (senatorData?.currentSenator?.length > 0) {
      const termsData = senatorData.currentSenator.map((term) => {
        const matchedTerm = terms?.find((t) => t.name === term.termId?.name);
        if (!matchedTerm) {
          return {
            _id: term._id,
            summary: term.summary || "",
            rating: term.rating || "",
            termId: null,
            currentTerm: term.currentTerm || false,
            editedFields: term.editedFields || [],
            fieldEditors: term.fieldEditors || {},
            isNew: false,
            votesScore: [{ voteId: "", score: "" }],
            activitiesScore: [{ activityId: "", score: "" }],
            pastVotesScore: [{ voteId: "", score: "" }],
          };
        }

        const getVoteScore = (voteId) => {
          const senatorVote = senatorVotes.find(
            (v) =>
              v.voteId === voteId ||
              v.voteId?._id === voteId ||
              (v.billNumber &&
                participatedVotes.find((pv) => pv._id === voteId)
                  ?.billNumber === v.billNumber)
          );

          if (!senatorVote) return "";
          const voteScore = senatorVote.score?.toLowerCase();
          if (voteScore?.includes("yea")) return "yea";
          if (voteScore?.includes("nay")) return "nay";
          if (voteScore?.includes("other")) return "other";

          return "";
        };
        let termVotes = [];
        if (matchedTerm) {
          const termStart = new Date(`${matchedTerm.startYear}-01-03`);
          const termEnd = new Date(`${matchedTerm.endYear}-01-02`);

          termVotes = allVotes.filter((vote) => {
            const voteDate = new Date(vote.date);
            const inTerm =
              voteDate >= termStart &&
              voteDate <= termEnd &&
              matchedTerm.congresses.includes(Number(vote.congress));

            if (!inTerm) return false;
            return senatorVotes.some((v) => {
              if (!v?.score || v.score.trim() === "") return false;

              const vId =
                typeof v.voteId === "object" ? v.voteId?._id : v.voteId;

              return (
                vId === vote._id ||
                v.quorumId === vote.quorumId ||
                (v.billNumber &&
                  vote.billNumber &&
                  v.billNumber === vote.billNumber)
              );
            });
          });
        }
        let votesScore = [];

        if (
          Array.isArray(term.votesScore) &&
          term.votesScore.length > 0 &&
          term.votesScore.some((vote) => vote.voteId && vote.voteId !== "")
        ) {
          votesScore = term.votesScore
            .filter((vote) => {
              const voteId = vote.voteId?._id || vote.voteId;
              if (!voteId) return false;
              const voteData = allVotes.find((v) => v._id === voteId);
              if (!voteData || !matchedTerm) return false;

              const voteDate = new Date(voteData.date);
              const termStart = new Date(`${matchedTerm.startYear}-01-03`);
              const termEnd = new Date(`${matchedTerm.endYear}-01-02`);

              return (
                voteDate >= termStart &&
                voteDate <= termEnd &&
                matchedTerm.congresses.includes(Number(voteData.congress))
              );
            })
            .map((vote) => {
              let scoreValue = "";
              const dbScore = vote.score?.toLowerCase();
              if (dbScore?.includes("yea")) scoreValue = "yea";
              else if (dbScore?.includes("nay")) scoreValue = "nay";
              else if (dbScore?.includes("other")) scoreValue = "other";
              else scoreValue = vote.score || "";

              return {
                voteId: vote.voteId?._id || vote.voteId || "",
                score: scoreValue,
                title: vote.voteId?.title || vote.title || "",
                _id: vote._id || undefined,
              };
            });
        } else if (termVotes.length > 0) {
          votesScore = termVotes.map((vote) => ({
            voteId: vote._id,
            score: getVoteScore(vote._id),
          }));
        }
        senatorData.currentSenator.forEach((otherTerm) => {
          if (
            otherTerm._id !== term._id &&
            Array.isArray(otherTerm.votesScore)
          ) {
            otherTerm.votesScore.forEach((otherVote) => {
              const voteId = otherVote.voteId?._id || otherVote.voteId;
              const voteData = allVotes.find((v) => v._id === voteId);

              if (
                voteData &&
                matchedTerm &&
                doesVoteBelongToTerm(voteData, matchedTerm)
              ) {
                const alreadyIncluded = votesScore.some(
                  (v) => v.voteId === voteId
                );

                if (!alreadyIncluded) {
                  let scoreValue = "";
                  const dbScore = otherVote.score?.toLowerCase();
                  if (dbScore?.includes("yea")) scoreValue = "yea";
                  else if (dbScore?.includes("nay")) scoreValue = "nay";
                  else if (dbScore?.includes("other")) scoreValue = "other";
                  else scoreValue = otherVote.score || "";

                  votesScore.push({
                    voteId: voteId,
                    score: scoreValue,
                    title: voteData.title || "",
                  });
                }
              }
            });
          }
        });
        if (!Array.isArray(votesScore) || votesScore.length === 0) {
          votesScore = [{ voteId: "", score: "" }];
        }
        senatorVotes.forEach((sv) => {
          const voteId = sv.voteId?._id || sv.voteId;
          const voteData = allVotes.find((v) => v._id === voteId);

          if (
            voteData &&
            matchedTerm &&
            doesVoteBelongToTerm(voteData, matchedTerm)
          ) {
            const alreadyIncluded = votesScore.some((v) => v.voteId === voteId);

            if (!alreadyIncluded) {
              let scoreValue = "";
              const dbScore = sv.score?.toLowerCase();
              if (dbScore?.includes("yea")) scoreValue = "yea";
              else if (dbScore?.includes("nay")) scoreValue = "nay";
              else if (dbScore?.includes("other")) scoreValue = "other";
              else scoreValue = sv.score || "";

              votesScore.push({
                voteId: voteId,
                score: scoreValue,
                title: voteData.title || "",
              });
            }
          }
        });
        let orphanVotes = [];

        if (Array.isArray(term.votesScore) && term.votesScore.length > 0) {
          term.votesScore.forEach((vote) => {
            const voteId = vote.voteId?._id || vote.voteId;
            if (!voteId) return;

            const voteData = allVotes.find((v) => v._id === voteId);
            if (!voteData) return;

            const belongsToAnyTerm = senatorData.currentSenator.some(
              (otherTerm) => {
                const otherMatchedTerm = terms?.find(
                  (t) => t.name === otherTerm.termId?.name
                );
                if (!otherMatchedTerm) return false;

                return doesVoteBelongToTerm(voteData, otherMatchedTerm);
              }
            );

            if (!belongsToAnyTerm) {
              let scoreValue = "";
              const dbScore = vote.score?.toLowerCase();
              if (dbScore?.includes("yea")) scoreValue = "yea";
              else if (dbScore?.includes("nay")) scoreValue = "nay";
              else if (dbScore?.includes("other")) scoreValue = "other";
              else scoreValue = vote.score || "";

              orphanVotes.push({
                voteId: voteId,
                score: scoreValue,
                title: vote.voteId?.title || vote.title || "",
                _id: vote._id || undefined,
              });
            }
          });
        }

        if (!Array.isArray(votesScore) || votesScore.length === 0) {
          votesScore = [{ voteId: "", score: "" }];
        }

        let pastVotesScore;
        if (orphanVotes.length > 0) {
          pastVotesScore = orphanVotes;
          const currentEditedFields = Array.isArray(formData?.editedFields)
            ? [...formData.editedFields]
            : [];

          const currentFieldEditors = { ...(formData?.fieldEditors || {}) };

          orphanVotes.forEach((orphanVote) => {
            if (orphanVote.voteId && orphanVote.voteId !== "") {
              const voteData = allVotes.find(
                (v) => v._id === orphanVote.voteId
              );
              if (voteData) {
                const sanitizeKey = (str) => {
                  return str
                    .replace(/[^a-zA-Z0-9_]/g, "_")
                    .replace(/_+/g, "_")
                    .replace(/^_+|_+$/g, "");
                };

                const pastVoteEditorKey = `pastVotesScore_${sanitizeKey(
                  voteData.title
                )}`;
                const regularVoteEditorKey = `votesScore_${sanitizeKey(
                  voteData.title
                )}`;

                const existingPastVoteField = currentEditedFields.find(
                  (field) =>
                    field.name === voteData.title &&
                    Array.isArray(field.field) &&
                    field.field[0] === "pastVotesScore"
                );

                const existingRegularVoteField = currentEditedFields.find(
                  (field) =>
                    field.name === voteData.title &&
                    Array.isArray(field.field) &&
                    field.field[0] === "votesScore"
                );

                if (!existingPastVoteField) {
                  currentEditedFields.push({
                    field: ["pastVotesScore"],
                    name: voteData.title,
                    fromQuorum: false,
                    _id: orphanVote._id || `pastVote_${orphanVote.voteId}`,
                  });

                  if (!currentFieldEditors[pastVoteEditorKey]) {
                    if (
                      existingRegularVoteField &&
                      currentFieldEditors[regularVoteEditorKey]
                    ) {
                      currentFieldEditors[pastVoteEditorKey] = {
                        ...currentFieldEditors[regularVoteEditorKey],
                      };
                    } else {
                      const existingEditorKey = Object.keys(
                        currentFieldEditors
                      ).find((key) =>
                        key.includes(sanitizeKey(voteData.title))
                      );

                      if (
                        existingEditorKey &&
                        currentFieldEditors[existingEditorKey]
                      ) {
                        currentFieldEditors[pastVoteEditorKey] = {
                          ...currentFieldEditors[existingEditorKey],
                        };
                      } else {
                        currentFieldEditors[pastVoteEditorKey] = {
                          editorName: "System",
                          editedAt: new Date().toISOString(),
                        };
                      }
                    }
                  }
                } else if (
                  existingPastVoteField &&
                  !currentFieldEditors[pastVoteEditorKey]
                ) {
                  if (
                    existingRegularVoteField &&
                    currentFieldEditors[regularVoteEditorKey]
                  ) {
                    currentFieldEditors[pastVoteEditorKey] = {
                      ...currentFieldEditors[regularVoteEditorKey],
                    };
                  } else {
                    const existingEditorKey = Object.keys(
                      currentFieldEditors
                    ).find((key) => key.includes(sanitizeKey(voteData.title)));

                    if (
                      existingEditorKey &&
                      currentFieldEditors[existingEditorKey]
                    ) {
                      currentFieldEditors[pastVoteEditorKey] = {
                        ...currentFieldEditors[existingEditorKey],
                      };
                    } else {
                      currentFieldEditors[pastVoteEditorKey] = {
                        editorName: "System",
                        editedAt: new Date().toISOString(),
                      };
                    }
                  }
                }
              }
            }
          });

          setFormData((prev) => {
            const prevEdited = Array.isArray(prev?.editedFields)
              ? prev.editedFields
              : [];
            const mergedEdited = [...prevEdited, ...currentEditedFields];

            const seen = new Set();
            const dedupEdited = mergedEdited.filter((item) => {
              const key = Array.isArray(item.field)
                ? item.field[0]
                : item.field;
              const sig = `${key}::${item.name || ""}`;
              if (seen.has(sig)) return false;
              seen.add(sig);
              return true;
            });

            const mergedEditors = {
              ...(prev?.fieldEditors || {}),
              ...currentFieldEditors,
            };

            return {
              ...prev,
              editedFields: dedupEdited,
              fieldEditors: mergedEditors,
            };
          });
        } else if (
          Array.isArray(term.pastVotesScore) &&
          term.pastVotesScore.length > 0 &&
          term.pastVotesScore.some((vote) => vote.voteId && vote.voteId !== "")
        ) {
          pastVotesScore = term.pastVotesScore
            .filter((vote) => {
              const voteId = vote.voteId?._id || vote.voteId;
              return voteId && voteId.toString().trim() !== "";
            })
            .map((vote) => {
              let scoreValue = "";
              const dbScore = vote.score?.toLowerCase();
              if (dbScore?.includes("yea")) {
                scoreValue = "yea";
              } else if (dbScore?.includes("nay")) {
                scoreValue = "nay";
              } else if (dbScore?.includes("other")) {
                scoreValue = "other";
              } else {
                scoreValue = vote.score || "";
              }

              const voteData = allVotes.find(
                (v) => v._id === (vote.voteId?._id || vote.voteId)
              );

              return {
                voteId: vote.voteId?._id || vote.voteId || "",
                score: scoreValue,
                title:
                  voteData?.title || vote.voteId?.title || vote.title || "",
                _id: vote._id || undefined,
              };
            });
        } else {
          pastVotesScore = [{ voteId: "", score: "" }];
        }

        // Collect DB pastVotes if present
        let dbPastVotes = [];
        if (
          Array.isArray(term.pastVotesScore) &&
          term.pastVotesScore.length > 0 &&
          term.pastVotesScore.some((vote) => vote.voteId && vote.voteId !== "")
        ) {
          dbPastVotes = term.pastVotesScore
            .filter((vote) => {
              const voteId = vote.voteId?._id || vote.voteId;
              return voteId && voteId.toString().trim() !== "";
            })
            .map((vote) => {
              let scoreValue = "";
              const dbScore = vote.score?.toLowerCase();
              if (dbScore?.includes("yea")) scoreValue = "yea";
              else if (dbScore?.includes("nay")) scoreValue = "nay";
              else if (dbScore?.includes("other")) scoreValue = "other";
              else scoreValue = vote.score || "";

              const voteData = allVotes.find(
                (v) => v._id === (vote.voteId?._id || vote.voteId)
              );

              return {
                voteId: vote.voteId?._id || vote.voteId || "",
                score: scoreValue,
                title:
                  voteData?.title || vote.voteId?.title || vote.title || "",
                _id: vote._id || undefined,
              };
            });
        }

        const pastVotesMap = new Map();
        [...dbPastVotes, ...orphanVotes].forEach((v) => {
          if (v.voteId) pastVotesMap.set(v.voteId, v);
        });

        pastVotesScore = Array.from(pastVotesMap.values());

        if (pastVotesScore.length === 0) {
          pastVotesScore = [{ voteId: "", score: "" }];
        }
        const getActivityScore = (activityId) => {
          const senAct = senatorActivities.find((a) => {
            const aId =
              typeof a.activityId === "object"
                ? a.activityId?._id
                : a.activityId;
            return aId === activityId;
          });

          if (!senAct?.score) return "";
          const s = String(senAct.score).toLowerCase();
          if (s.includes("yea") || s === "yes") return "yes";
          if (s.includes("nay") || s === "no") return "no";
          if (s.includes("other")) return "other";
          return senAct.score;
        };
        let termActivities = [];
        if (matchedTerm) {
          const termStart = new Date(`${matchedTerm.startYear}-01-03`);
          const termEnd = new Date(`${matchedTerm.endYear}-01-02`);

          termActivities = allActivities.filter((activity) => {
            const activityDate = new Date(activity.date);
            const inTerm =
              activityDate >= termStart &&
              activityDate <= termEnd &&
              matchedTerm.congresses.includes(Number(activity.congress || 0));

            if (!inTerm) return false;
            return senatorActivities.some((a) => {
              if (!a?.score || a.score.trim() === "") return false;

              const aId =
                typeof a.activityId === "object"
                  ? a.activityId?._id
                  : a.activityId;

              return aId === activity._id;
            });
          });
        }
        let activitiesScore = [];

        if (
          Array.isArray(term.activitiesScore) &&
          term.activitiesScore.length > 0
        ) {
          activitiesScore = term.activitiesScore
            .filter((activity) => {
              const activityId =
                activity.activityId?._id || activity.activityId;
              if (!activityId) return false;
              const activityData = allActivities.find(
                (a) => a._id === activityId
              );
              if (!activityData || !matchedTerm) return false;

              const activityDate = new Date(activityData.date);
              const termStart = new Date(`${matchedTerm.startYear}-01-03`);
              const termEnd = new Date(`${matchedTerm.endYear}-01-02`);

              return (
                activityDate >= termStart &&
                activityDate <= termEnd &&
                matchedTerm.congresses.includes(
                  Number(activityData.congress || 0)
                )
              );
            })
            .map((activity) => {
              const actualActivity = allActivities.find(
                (a) =>
                  a._id === (activity.activityId?._id || activity.activityId)
              );

              return {
                activityId:
                  activity.activityId?._id || activity.activityId || "",
                score: activity.score || "",
                _activityTitle: actualActivity?.title || "Unknown Activity",
                title: actualActivity?.title || "",
              };
            });

          const extraActivities = allActivities
            .filter((activity) => {
              const activityDate = new Date(activity.date);
              const termStart = new Date(`${matchedTerm.startYear}-01-03`);
              const termEnd = new Date(`${matchedTerm.endYear}-01-02`);

              const inRange =
                activityDate >= termStart &&
                activityDate <= termEnd &&
                matchedTerm.congresses.includes(Number(activity.congress || 0));

              const alreadyIncluded = activitiesScore.some(
                (a) => a.activityId === activity._id
              );

              const hasScore = !!getActivityScore(activity._id);

              return inRange && !alreadyIncluded && hasScore;
            })
            .map((activity) => ({
              activityId: activity._id,
              score: getActivityScore(activity._id),
              _activityTitle: activity.title || "Unknown Activity",
              title: activity.title || "",
            }));

          activitiesScore = [...activitiesScore, ...extraActivities];
        } else if (termActivities.length > 0) {
          activitiesScore = termActivities.map((activity) => ({
            activityId: activity._id,
            score: getActivityScore(activity._id),
            _activityTitle: activity.title || "Unknown Activity",
            title: activity.title || "",
          }));
        }
        senatorData.currentSenator.forEach((otherTerm) => {
          if (
            otherTerm._id !== term._id &&
            Array.isArray(otherTerm.activitiesScore)
          ) {
            otherTerm.activitiesScore.forEach((otherActivity) => {
              const activityId =
                otherActivity.activityId?._id || otherActivity.activityId;
              const activityData = allActivities.find(
                (a) => a._id === activityId
              );

              if (
                activityData &&
                matchedTerm &&
                doesActivityBelongToTerm(activityData, matchedTerm)
              ) {
                const alreadyIncluded = activitiesScore.some(
                  (a) => a.activityId === activityId
                );

                if (!alreadyIncluded) {
                  let scoreValue = "";
                  const dbScore = otherActivity.score?.toLowerCase();
                  if (dbScore?.includes("yea") || dbScore === "yes")
                    scoreValue = "yes";
                  else if (dbScore?.includes("nay") || dbScore === "no")
                    scoreValue = "no";
                  else if (dbScore?.includes("other")) scoreValue = "other";
                  else scoreValue = otherActivity.score || "";

                  activitiesScore.push({
                    activityId: activityId,
                    score: scoreValue,
                    title: activityData.title || "",
                  });
                }
              }
            });
          }
        });

        if (!Array.isArray(activitiesScore) || activitiesScore.length === 0) {
          activitiesScore = [{ activityId: "", score: "" }];
        }

        return {
          _id: term._id,
          summary: term.summary || "",
          rating: term.rating || "",
          termId: matchedTerm?._id || "",
          currentTerm: term.currentTerm || false,
          editedFields: term.editedFields || [],
          fieldEditors: term.fieldEditors || {},
          isNew: false,
          votesScore,
          activitiesScore,
          pastVotesScore,
        };
      });
      setSenatorTermData(termsData);
      setOriginalTermData(JSON.parse(JSON.stringify(termsData)));
    } else {
      const defaultTerm = [
        {
          senateId: id,
          summary: "",
          rating: "",
          votesScore: [{ voteId: "", score: "" }],
          activitiesScore: [{ activityId: "", score: "" }],
          pastVotesScore: [{ voteId: "", score: "" }],
          currentTerm: false,
          termId: null,
          editedFields: [],
          fieldEditors: {},
          isNew: true,
        },
      ];

      setSenatorTermData(defaultTerm);
      setOriginalTermData(JSON.parse(JSON.stringify(defaultTerm)));
    }
  };

  useEffect(() => {
    if (originalFormData && formData) {
      const changes = [];
      Object.keys(formData).forEach((key) => {
        if (compareValues(formData[key], originalFormData[key])) {
          changes.push(key);
        }
      });
      setEditedFields(changes);
    }
  }, [formData, originalFormData]);

  useEffect(() => {
    if (!originalFormData || !formData || !originalTermData || !senatorTermData)
      return;

    const changes = [];

    Object.keys(formData).forEach((key) => {
      if (
        key === "editedFields" ||
        key === "fieldEditors" ||
        key === "publishStatus"
      )
        return;
      if (compareValues(formData[key], originalFormData[key])) {
        changes.push(key);
      }
    });

    senatorTermData.forEach((term, termIndex) => {
      const originalTerm = originalTermData[termIndex] || {};
      const isNewTerm = term.isNew;

      Object.keys(term).forEach((key) => {
        if (
          [
            "_id",
            "senateId",
            "editedFields",
            "fieldEditors",
            "isNew",
            "publishStatus",
          ].includes(key)
        )
          return;

        if (key === "summary") {
          const currentSummary = term.summary || "";
          const originalSummary = originalTerm.summary || "";

          if (currentSummary.trim() !== originalSummary.trim()) {
            changes.push(`term${termIndex}_summary`);
          }
        } else if (
          ["votesScore", "activitiesScore", "pastVotesScore"].includes(key)
        ) {
          const current = (term[key] || []).filter((item) =>
            Object.values(item).some((val) => val !== "" && val !== null)
          );
          const original = (originalTerm[key] || []).filter((item) =>
            Object.values(item).some((val) => val !== "" && val !== null)
          );
          if (JSON.stringify(current) !== JSON.stringify(original)) {
            changes.push(`term${termIndex}_${key}`);
          }
        } else {
          const currentValue = term[key];
          const originalValue = originalTerm[key];

          if (isNewTerm) {
            if (
              currentValue !== "" &&
              currentValue !== null &&
              currentValue !== false
            ) {
              changes.push(`term${termIndex}_${key}`);
            }
          } else {
            if ((currentValue || "") !== (originalValue || "")) {
              changes.push(`term${termIndex}_${key}`);
            }
          }
        }
      });
    });

    const backendEditedFields = Array.isArray(formData.editedFields)
      ? formData.editedFields
      : [];
    const mergedChanges = [...new Set([...backendEditedFields, ...changes])];

    setEditedFields(mergedChanges);

    setEditedFields(changes);
  }, [formData, originalFormData, senatorTermData, originalTermData]);

  useEffect(() => {
    termPreFill();
  }, [id, senatorData]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const preFillForm = () => {
    if (senator) {
      const termId =
        senator.termId && terms.length > 0
          ? terms.find((term) => term._id === senator.termId)?._id || ""
          : "";

      const newFormData = {
        name: senator.name || "",
        status: senator.status || "Active",
        state: senator.state || "",
        party: senator.party || "",
        photo: senator.photo || null,
        term: termId,
        publishStatus: senator.publishStatus || "",
        editedFields: senator.editedFields || [],
        fieldEditors: senator.fieldEditors || {},
      };

      setFormData((prev) => {
        const prevEdited = Array.isArray(prev?.editedFields)
          ? prev.editedFields
          : [];
        const incomingEdited = Array.isArray(newFormData.editedFields)
          ? newFormData.editedFields
          : [];
        const mergedEdited = [...prevEdited, ...incomingEdited];

        const seen = new Set();
        const dedupEdited = mergedEdited.filter((item) => {
          const key = Array.isArray(item.field) ? item.field[0] : item.field;
          const sig = `${key}::${item.name || ""}`;
          if (seen.has(sig)) return false;
          seen.add(sig);
          return true;
        });

        const mergedEditors = {
          ...(prev?.fieldEditors || {}),
          ...(newFormData.fieldEditors || {}),
        };

        return {
          ...prev,
          ...newFormData,
          editedFields: dedupEdited,
          fieldEditors: mergedEditors,
        };
      });
      setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));
    }
  };

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          setIsInitialLoad(true);

          await dispatch(getAllTerms()).unwrap();
          setTermsLoaded(true);

          await dispatch(getAllVotes()).unwrap();
          setVotesLoaded(true);

          await dispatch(getAllActivity()).unwrap();
          setActivitiesLoaded(true);

          await Promise.all([
            dispatch(getSenatorById(id)).unwrap(),
            dispatch(getSenatorDataBySenetorId(id)).unwrap(),
          ]);

          setDataLoaded(true);
        } catch (error) {
          setDataLoaded(true);
          //console.error('Data loading failed:', error);
        } finally {
          setIsInitialLoad(false);
        }
      };

      loadData();
    }

    return () => {
      dispatch(clearSenatorState());
      dispatch(clearSenatorDataState());
    };
  }, [id, dispatch]);

  useEffect(() => {
    preFillForm();
  }, [senator, terms]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      const isActualChange = originalFormData
        ? compareValues(newData[name], originalFormData[name])
        : true;

      if (isActualChange && !localChanges.includes(name)) {
        setLocalChanges((prev) => [...prev, name]);
      } else if (!isActualChange && localChanges.includes(name)) {
        setLocalChanges((prev) => prev.filter((field) => field !== name));
      }

      return newData;
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fieldName = "Photo";

    if (!localChanges.includes(fieldName)) {
      setLocalChanges((prev) => [...prev, fieldName]);
    }

    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleStatusChange = (status) => {
    const fieldName = "status";
    setFormData((prev) => {
      const newData = { ...prev, status };

      const isActualChange = originalFormData
        ? status !== originalFormData.status
        : true;

      setLocalChanges((prevChanges) => {
        if (isActualChange && !prevChanges.includes(fieldName)) {
          return [...prevChanges, fieldName];
        } else if (!isActualChange && prevChanges.includes(fieldName)) {
          return prevChanges.filter((field) => field !== fieldName);
        }
        return prevChanges;
      });

      return newData;
    });
  };

  const handleSave = async (e) => {
  e.preventDefault();
  setLoading(true);

  const sanitizeKey = (str) => {
    return str
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  try {
    const hasSelectedTerms = senatorTermData.some(
      (term) => term.termId && term.termId.toString().trim() !== ""
    );

    if (!hasSelectedTerms) {
      setLoading(false);
      handleSnackbarOpen(
        "Please select at least one term before saving.",
        "error"
      );
      return;
    }

    const termIdCounts = senatorTermData
      .map((t) => t.termId)
      .filter(Boolean)
      .reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});

    if (Object.values(termIdCounts).some((count) => count > 1)) {
      setLoading(false);
      handleSnackbarOpen(
        "Duplicate term selected. Each term can only be added once.",
        "error"
      );
      return;
    }

    const currentTerms = senatorTermData.filter((term) => term.currentTerm);
    if (currentTerms.length > 1) {
      setLoading(false);
      handleSnackbarOpen(
        "Only one term can be marked as current term.",
        "error"
      );
      return;
    }

    const hasLocalChanges =
      localChanges.length > 0 ||
      deletedTermIds.length > 0 ||
      removedItems.votes.length > 0 ||
      removedItems.activities.length > 0 ||
      removedItems.pastVotes.length > 0 ||
      (formData?.fieldEditors && Object.keys(formData.fieldEditors).length > 0);

    if (userRole === "editor" && !hasLocalChanges) {
      setLoading(false);
      handleSnackbarOpen("No changes detected. Nothing to update.", "info");
      return;
    }

    const decodedToken = jwtDecode(token);
    const currentEditor = {
      editorId: decodedToken.userId,
      editorName: localStorage.getItem("user") || "Unknown Editor",
      editedAt: new Date(),
    };

    if (deletedTermIds.length > 0) {
      await Promise.all(
        deletedTermIds.map((id) => dispatch(deleteSenatorData(id)).unwrap())
      );
      setDeletedTermIds([]);
    }

    const existingEditedFields = Array.isArray(formData.editedFields)
      ? formData.editedFields
      : [];
    const existingFieldsMap = new Map();
    existingEditedFields.forEach((field) => {
      let fieldKey;
      if (
        Array.isArray(field.field) &&
        field.field[0] === "votesScore" &&
        field.name
      ) {
        fieldKey = `votesScore_${sanitizeKey(field.name)}`;
      } else if (
        Array.isArray(field.field) &&
        field.field[0] === "activitiesScore" &&
        field.name
      ) {
        fieldKey = `activitiesScore_${sanitizeKey(field.name)}`;
      } else if (
        Array.isArray(field.field) &&
        field.field[0] === "pastVotesScore" &&
        field.name
      ) {
        fieldKey = `pastVotesScore_${sanitizeKey(field.name)}`;
      } else {
        fieldKey = Array.isArray(field.field) ? field.field[0] : field;
      }
      existingFieldsMap.set(fieldKey, { ...field });
    });

    const processedChanges = [];

    const hasVoteChanged = (termIndex, voteIndex, vote) => {
      const originalTerm = originalTermData[termIndex] || {};
      const originalVote = originalTerm.votesScore?.[voteIndex] || {};
      return (
        vote.voteId !== originalVote.voteId ||
        vote.score !== originalVote.score
      );
    };

    const hasActivityChanged = (termIndex, activityIndex, activity) => {
      const originalTerm = originalTermData[termIndex] || {};
      const originalActivity =
        originalTerm.activitiesScore?.[activityIndex] || {};
      return (
        activity.activityId !== originalActivity.activityId ||
        activity.score !== originalActivity.score
      );
    };

    const hasPastVoteChanged = (termIndex, voteIndex, vote) => {
      const originalTerm = originalTermData[termIndex] || {};
      const originalVote = originalTerm.pastVotesScore?.[voteIndex] || {};
      return (
        vote.voteId !== originalVote.voteId ||
        vote.score !== originalVote.score
      );
    };

    senatorTermData.forEach((term, termIndex) => {
      term.votesScore.forEach((vote, voteIndex) => {
        if (vote.voteId && vote.voteId.toString().trim() !== "") {
          if (hasVoteChanged(termIndex, voteIndex, vote)) {
            const voteItem = votes.find((v) => v._id === vote.voteId);
            if (voteItem) {
              const uniqueId = `votesScore_${sanitizeKey(voteItem.title)}`;
              processedChanges.push({
                uniqueId,
                displayName: `Term ${termIndex + 1}: Scored Vote ${
                  voteIndex + 1
                }`,
                field: ["votesScore"],
                name: voteItem.title,
                termIndex,
                voteIndex,
              });
            }
          }
        }
      });

      term.activitiesScore.forEach((activity, activityIndex) => {
        if (
          activity.activityId &&
          activity.activityId.toString().trim() !== ""
        ) {
          if (hasActivityChanged(termIndex, activityIndex, activity)) {
            const activityItem = activities.find(
              (a) => a._id === activity.activityId
            );
            if (activityItem) {
              const uniqueId = `activitiesScore_${sanitizeKey(
                activityItem.title
              )}`;
              processedChanges.push({
                uniqueId,
                displayName: `Term ${termIndex + 1}: Tracked Activity ${
                  activityIndex + 1
                }`,
                field: ["activitiesScore"],
                name: activityItem.title,
                termIndex,
                activityIndex,
              });
            }
          }
        }
      });

      term.pastVotesScore.forEach((vote, voteIndex) => {
        if (vote.voteId && vote.voteId.toString().trim() !== "") {
          if (hasPastVoteChanged(termIndex, voteIndex, vote)) {
            const voteItem = votes.find((v) => v._id === vote.voteId);
            if (voteItem) {
              const uniqueId = `pastVotesScore_${sanitizeKey(
                voteItem.title
              )}`;
              processedChanges.push({
                uniqueId,
                displayName: `Term ${termIndex + 1}: Important Past Vote ${
                  voteIndex + 1
                }`,
                field: ["pastVotesScore"],
                name: voteItem.title,
                termIndex,
                voteIndex,
              });
            }
          }
        }
      });
    });

    localChanges.forEach((change) => {
      if (
        !change.includes("votesScore_") &&
        !change.includes("pastVotesScore_") &&
        !change.includes("activitiesScore_") &&
        !change.startsWith("term")
      ) {
        processedChanges.push({
          uniqueId: change,
          displayName: getFieldDisplayName(change),
          field: [change],
          name: getFieldDisplayName(change),
        });
      }
    });

    const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    const hasNonDefaultValue = (field, value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    };

    senatorTermData.forEach((term, termIndex) => {
      const originalTerm = originalTermData?.[termIndex] || {};

      const termFields = ["summary", "rating", "termId"];

      termFields.forEach((field) => {
        const newValue = term[field];
        const oldValue = originalTerm[field];

        if (
          !isEqual(newValue, oldValue) &&
          hasNonDefaultValue(field, newValue)
        ) {
          const fieldName = `term${termIndex}_${field}`;
          processedChanges.push({
            uniqueId: fieldName,
            displayName: `Term ${termIndex + 1}: ${
              fieldLabels[field] || field
            }`,
            field: [fieldName],
            name: `Term ${termIndex + 1}: ${fieldLabels[field] || field}`,
          });
        }
      });

      if (
        !(
          originalTerm.currentTerm === undefined && term.currentTerm === false
        ) &&
        term.currentTerm !== originalTerm.currentTerm
      ) {
        const fieldName = `term${termIndex}_currentTerm`;
        processedChanges.push({
          uniqueId: fieldName,
          displayName: `Term ${termIndex + 1}: Current Term`,
          field: [fieldName],
          name: `Term ${termIndex + 1}: Current Term`,
        });
      }
    });

    // Process removed items
    const processRemovedItems = () => {
      const removedFields = [];

      // Process removed votes
      removedItems.votes.forEach(removedVote => {
        removedFields.push({
          field: [removedVote.fieldKey],
          name: `Term ${removedVote.termIndex + 1}: Scored Vote ${removedVote.voteIndex + 1} - Removed`,
          fromQuorum: false,
          // _id: `removed_vote_${removedVote.voteId}`
        });
      });

      // Process removed activities
      removedItems.activities.forEach(removedActivity => {
        removedFields.push({
          field: [removedActivity.fieldKey],
          name: `Term ${removedActivity.termIndex + 1}: Tracked Activity ${removedActivity.activityIndex + 1} - Removed`,
          fromQuorum: false,
          // _id: `removed_activity_${removedActivity.activityId}`
        });
      });

      // Process removed past votes
      removedItems.pastVotes.forEach(removedPastVote => {
        removedFields.push({
          field: [removedPastVote.fieldKey],
          name: `Term ${removedPastVote.termIndex + 1}: Important Past Vote ${removedPastVote.voteIndex + 1} - Removed`,
          fromQuorum: false,
          // _id: `removed_pastvote_${removedPastVote.voteId}`
        });
      });

      return removedFields;
    };

    const removedFields = processRemovedItems();

    processedChanges.forEach((change) => {
      const existingField = existingFieldsMap.get(change.uniqueId);
      if (!existingField || existingField.name !== change.name) {
        existingFieldsMap.set(change.uniqueId, {
          field: change.field,
          name: change.name,
          updatedAt: new Date().toISOString(),
          fromQuorum: existingField?.fromQuorum || false,
          _id: existingField?._id,
        });
      } else {
        existingFieldsMap.set(change.uniqueId, {
          ...existingField,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    // Combine existing changes with removed items
    const allChanges = [...Array.from(existingFieldsMap.values()), ...removedFields];

    const updatedFieldEditors = { ...(formData.fieldEditors || {}) };
    const changedFieldsInThisSession = new Set();

    localChanges.forEach((change) => {
      let editorKey;

      const voteMatch = change.match(/^term(\d+)_ScoredVote_(\d+)$/);
      if (voteMatch) {
        const [, termIndex, voteIndex] = voteMatch;
        const term = senatorTermData[parseInt(termIndex)];
        const vote = term?.votesScore?.[parseInt(voteIndex)];
        if (vote && vote.voteId) {
          const voteItem = votes.find((v) => v._id === vote.voteId);
          if (voteItem && voteItem.title) {
            editorKey = `votesScore_${sanitizeKey(voteItem.title)}`;
            updatedFieldEditors[editorKey] = currentEditor;
            changedFieldsInThisSession.add(editorKey);
          }
        }
        return;
      }

      const activityMatch = change.match(/^term(\d+)_TrackedActivity_(\d+)$/);
      if (activityMatch) {
        const [, termIndex, activityIndex] = activityMatch;
        const term = senatorTermData[parseInt(termIndex)];
        const activity = term?.activitiesScore?.[parseInt(activityIndex)];
        if (activity && activity.activityId) {
          const activityItem = activities.find(
            (a) => a._id === activity.activityId
          );
          if (activityItem && activityItem.title) {
            editorKey = `activitiesScore_${sanitizeKey(activityItem.title)}`;
            updatedFieldEditors[editorKey] = currentEditor;
            changedFieldsInThisSession.add(editorKey);
          }
        }
        return;
      }

      const pastVoteMatch = change.match(/^term(\d+)_pastVotesScore_(\d+)$/);
      if (pastVoteMatch) {
        const [, termIndex, voteIndex] = pastVoteMatch;
        const term = senatorTermData[parseInt(termIndex)];
        const vote = term?.pastVotesScore?.[parseInt(voteIndex)];
        if (vote && vote.voteId) {
          const voteItem = votes.find((v) => v._id === vote.voteId);
          if (voteItem && voteItem.title) {
            editorKey = `pastVotesScore_${sanitizeKey(voteItem.title)}`;
            updatedFieldEditors[editorKey] = currentEditor;
            changedFieldsInThisSession.add(editorKey);
          }
        }
        return;
      }

      editorKey = change;
      updatedFieldEditors[editorKey] = currentEditor;
      changedFieldsInThisSession.add(editorKey);
    });

    // Also add field editors for removed items
    removedItems.votes.forEach(removedVote => {
      updatedFieldEditors[removedVote.fieldKey] = currentEditor;
    });

    removedItems.activities.forEach(removedActivity => {
      updatedFieldEditors[removedActivity.fieldKey] = currentEditor;
    });

    removedItems.pastVotes.forEach(removedPastVote => {
      updatedFieldEditors[removedPastVote.fieldKey] = currentEditor;
    });

    processedChanges.forEach((change) => {
      if (!changedFieldsInThisSession.has(change.uniqueId)) {
        updatedFieldEditors[change.uniqueId] =
          updatedFieldEditors[change.uniqueId] || currentEditor;
      }
    });

    const senatorUpdate = {
      ...formData,
      editedFields: allChanges,
      fieldEditors: updatedFieldEditors,
      publishStatus: userRole === "admin" ? "published" : "under review",
    };

    if (senatorUpdate.publishStatus === "published") {
      senatorUpdate.editedFields = [];
      senatorUpdate.fieldEditors = {};
    }

    if (id) {
      const formDataToSend = new FormData();
      Object.entries(senatorUpdate).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === "object" && !(value instanceof File)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value);
          }
        }
      });
      await dispatch(
        updateSenator({ id, formData: formDataToSend })
      ).unwrap();
    }

    const termPromises = senatorTermData.map((term, index) => {
      const cleanVotesScore = term.votesScore
        .filter((vote) => vote.voteId && vote.voteId.toString().trim() !== "")
        .map((vote) => ({
          voteId: vote.voteId.toString(),
          score: vote.score,
          title: vote.title || "",
        }));

      const cleanActivitiesScore = term.activitiesScore
        .filter(
          (activity) =>
            activity.activityId &&
            activity.activityId.toString().trim() !== ""
        )
        .map((activity) => ({
          activityId: activity.activityId.toString(),
          score: activity.score,
        }));

      const cleanPastVotesScore = term.pastVotesScore
        ? term.pastVotesScore
            .filter(
              (vote) => vote.voteId && vote.voteId.toString().trim() !== ""
            )
            .map((vote) => ({
              voteId: vote.voteId.toString(),
              score: vote.score,
              title: vote.title || "",
            }))
        : [];

      const termSpecificChanges = allChanges.filter((f) => {
        const fieldName =
          typeof f === "string"
            ? f
            : Array.isArray(f.field)
            ? f.field[0]
            : f.field;
        return fieldName.startsWith(`term${index}_`);
      });

      const termUpdate = {
        ...term,
        votesScore: cleanVotesScore,
        pastVotesScore: cleanPastVotesScore,
        activitiesScore: cleanActivitiesScore,
        isNew: false,
        senateId: id,
        editedFields: termSpecificChanges,
        fieldEditors: updatedFieldEditors,
        summary: term.summary,
      };
      return term._id
        ? dispatch(
            updateSenatorData({ id: term._id, data: termUpdate })
          ).unwrap()
        : dispatch(createSenatorData(termUpdate)).unwrap();
    });

    await Promise.all(termPromises);

    await dispatch(getSenatorDataBySenetorId(id)).unwrap();
    await dispatch(getSenatorById(id)).unwrap();

    setOriginalFormData(JSON.parse(JSON.stringify(formData)));
    setOriginalTermData(JSON.parse(JSON.stringify(senatorTermData)));
    setLocalChanges([]);
    setDeletedTermIds([]);
    
    // Clear removed items after successful save
    setRemovedItems({
      votes: [],
      activities: [],
      pastVotes: []
    });

    userRole === "admin"
      ? handleSnackbarOpen("Changes published successfully!", "success")
      : handleSnackbarOpen(
          'Status changed to "Under Review" for admin to moderate.',
          "info"
        );
  } catch (error) {
    console.error("Save failed:", error);

    let errorMessage = "Operation failed. Please try again.";

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.code === 11000) {
      errorMessage = "Duplicate entry: This senator term already exists.";
    } else if (error?.config?.url?.includes("updateSenator")) {
      errorMessage = "Failed to update senator data.";
    } else if (error?.config?.url?.includes("updateSenatorData")) {
      errorMessage = "Failed to update senator term.";
    } else if (error?.config?.url?.includes("createSenatorData")) {
      errorMessage = "Failed to create senator term.";
    }
    handleSnackbarOpen(errorMessage, "error");
  } finally {
    setLoading(false);
  }
};

  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const editorRef = useRef(null);
  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });
  const label = { inputProps: { "aria-label": "Color switch demo" } };
  const getStatusConfig = (editedFields, currentStatus) => {
    const configs = {
      draft: {
        backgroundColor: "rgba(66, 165, 245, 0.12)",
        borderColor: "#2196F3",
        iconColor: "#1565C0",
        icon: <Drafts sx={{ fontSize: "20px" }} />,
        title: "Draft Version",
        description:
          editedFields.length > 0
            ? `${editedFields.map((f) => fieldLabels[f] || f).join(", ")}`
            : "No changes made yet",
        titleColor: "#0D47A1",
        descColor: "#1976D2",
      },
      "under review": {
        backgroundColor: "rgba(255, 193, 7, 0.12)",
        borderColor: "#FFC107",
        iconColor: "#FFA000",
        icon: <HourglassTop sx={{ fontSize: "20px" }} />,
        title: "Under Review",
        description:
          editedFields.length > 0
            ? `${editedFields.map((f) => fieldLabels[f] || f).join(", ")}`
            : "No recent changes",
        titleColor: "#5D4037",
        descColor: "#795548",
      },
      published: {
        backgroundColor: "rgba(255, 193, 7, 0.12)",
        borderColor: "#FFC107",
        iconColor: "#FFA000",
        icon: <HourglassTop sx={{ fontSize: "20px" }} />,
        title: "Unsaved Changes",
        description:
          editedFields.length > 0
            ? `${editedFields.length} pending changes`
            : "Published and live",
        titleColor: "#5D4037",
        descColor: "#795548",
      },
    };
    return configs[currentStatus];
  };

  const currentStatus =
    formData.publishStatus || (userRole === "admin" ? "published" : "");
  const statusData = getStatusConfig(
    Array.isArray(editedFields) ? editedFields : [],
    currentStatus
  );

  const getValidTermId = (termId) => {
    const termExists = terms?.some((t) => t._id === termId);
    return termExists ? termId : "";
  };

  return (
    <AppTheme key={componentKey}>
      {(loadingg || isInitialLoad || !dataLoaded) && (
        <Box className="circularLoader">
          <CircularProgress sx={{ color: "#CC9A3A !important" }} />
        </Box>
      )}
      <Box className="flexContainer">
        <SideMenu />
        <Box
          component="main"
          sx={(theme) => ({
            width: "80%",
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background} / 1)`
              : alpha(theme.palette.background.default, 1),
          })}
        >
          <FixedHeader />
          <MobileHeader />

          <Stack
            spacing={isMobile ? 1 : 2}
            sx={{
              alignItems: "center",
              mx: { xs: 2, md: 3 },
              mt: { xs: 2, md: 2.8 },
              gap: 1,
            }}
          >
            <ActionButtons
              onDiscard={handleDiscard}
              onSave={handleSave}
              userRole={userRole}
            />

            {!(
              formData.publishStatus === "under review" && !hasSelectedTerms()
            ) && (
              <StatusDisplay
                userRole={userRole}
                formData={formData}
                localChanges={localChanges}
                statusData={statusData}
                termData={senatorTermData}
                mode="senator"
              />
            )}

            <Paper className="customPaper">
              <DialogBox
                userRole={userRole}
                openDiscardDialog={openDiscardDialog}
                setOpenDiscardDialog={setOpenDiscardDialog}
                handleConfirmDiscard={handleConfirmDiscard}
              />
              <BasicInfo
                formData={formData}
                handleChange={handleChange}
                handleStatusChange={handleStatusChange}
                handleFileChange={handleFileChange}
                isMobile={isMobile}
              />
            </Paper>

            {/* Render each term in senatorTermData */}
            {senatorTermData.map((term, termIndex) => (
              <Paper
                key={termIndex}
                sx={{
                  width: "100%",
                  marginBottom: "50px",
                  position: "relative",
                  bgcolor: "#fff",
                  borderRadius: 0.8,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <SenatorTermSection
                  term={term}
                  termIndex={termIndex}
                  isMobile={isMobile}
                  terms={terms}
                  getAvailableTerms={getAvailableTerms}
                  getValidTermId={getValidTermId}
                  handleTermChange={handleTermChange}
                  handleSwitchChange={handleSwitchChange}
                  handleSummaryChange={handleSummaryChange}
                  allVotes={allVotes}
                  validateVoteInTermRange={validateVoteInTermRange}
                  handleVoteChange={handleVoteChange}
                  handleRemoveVote={handleRemoveVote}
                  handleAddVote={handleAddVote}
                  allActivities={allActivities}
                  validateActivityInTermRange={validateActivityInTermRange}
                  handleActivityChange={handleActivityChange}
                  handleRemoveActivity={handleRemoveActivity}
                  handleAddActivity={handleAddActivity}
                  handleRemoveTerm={handleRemoveTerm}
                  handleAddPastVote={handleAddPastVote}
                  handlePastVoteChange={handlePastVoteChange}
                  handleRemovePastVote={handleRemovePastVote}
                />
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTerm}
              className="addTerm-btn"
            >
              Add Another Term
            </Button>
            <SnackbarComponent
              open={openSnackbar}
              onClose={() => {
                handleSnackbarClose();
                setSelectionError({ show: false, message: "", type: "" });
              }}
              message={snackbarMessage}
              severity={snackbarSeverity}
              selectionError={selectionError}
            />
          </Stack>
          <Box sx={{ mb: "40px", mx: "15px" }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}