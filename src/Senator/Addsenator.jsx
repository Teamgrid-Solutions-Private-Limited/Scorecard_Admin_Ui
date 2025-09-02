import * as React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { alpha, styled } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { getSenatorDataBySenetorId } from "../redux/reducer/senetorTermSlice";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SideMenu from "../components/SideMenu";
import AppTheme from "../../src/shared-theme/AppTheme";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Editor } from "@tinymce/tinymce-react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import Switch from "@mui/material/Switch";
import { useDispatch, useSelector } from "react-redux";
import { rating } from "../../src/Dashboard/global/common";
import { useParams, useNavigate } from "react-router-dom";
import HourglassTop from "@mui/icons-material/HourglassTop";
import { Drafts } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { discardSenatorChanges } from "../redux/reducer/senetorSlice";
import { getAllVotes } from "../redux/reducer/voteSlice";
import { getAllActivity } from "../redux/reducer/activitySlice";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { createSenatorData } from "../redux/reducer/senetorTermSlice";
import {
  clearSenatorDataState,
  updateSenatorData,
} from "../redux/reducer/senetorTermSlice";
import {
  getSenatorById,
  updateSenator,
  clearSenatorState,
  updateSenatorStatus,
} from "../redux/reducer/senetorSlice";
import { getAllTerms } from "../redux/reducer/termSlice";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
// import { jwtDecode } from "jwt-decode";
import { deleteSenatorData } from "../redux/reducer/senetorTermSlice"; // adjust path as needed
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MobileHeader from "../components/MobileHeader";

export default function AddSenator(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { senator } = useSelector((state) => state.senator);
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const { activities } = useSelector((state) => state.activity);
  const senatorData = useSelector((state) => state.senatorData);
  const [editedFields, setEditedFields] = useState([]);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [originalTermData, setOriginalTermData] = useState([]);
  const [localChanges, setLocalChanges] = useState([]);
  const [deletedTermIds, setDeletedTermIds] = useState([]);
  const [openDiscardDialog, setOpenDiscardDialog] = useState(false);
  const [componentKey, setComponentKey] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // mobile detect
  const navigate = useNavigate();
  const allVotes = useSelector((state) => state.vote.votes);
  const allActivities = useSelector((state) => state.activity.activities);

  const termStart = new Date(
    `${senatorData?.currentSenator?.[0]?.termId?.startYear}-01-01`
  );
  const termEnd = new Date(
    `${senatorData?.currentSenator?.[0]?.termId?.endYear}-12-31`
  );
  const filteredVotes = allVotes.filter((vote) => {
    const voteDate = new Date(vote.date);
    return (
      voteDate >= termStart &&
      voteDate <= termEnd &&
      senatorData?.currentSenator?.[0]?.termId?.congresses.includes(
        Number(vote.congress)
      )
    );
  });
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

  // All activities in the term
  const filteredActivities = allActivities.filter((activity) => {
    const activityDate = new Date(activity.date);
    return (
      activityDate >= termStart &&
      activityDate <= termEnd &&
      senatorData?.currentSenator?.[0]?.termId?.congresses.includes(
        Number(activity.congress)
      )
    );
  });

  // Senator's scored activities
  const senatorActivities = senatorr?.activitiesScore || [];

  // Add this near the top of your component
  const fieldLabels = {
    // Senator fields
    name: "Senator Name",
    status: "Status",
    state: "State",
    party: "Party",
    photo: "Photo",
    term: "Term",
    publishStatus: "Publish Status",

    // Term fields (will be prefixed with termX_)
    senateId: "Senate ID",
    summary: "Term Summary",
    rating: "SBA Rating",
    votesScore: "Scored Vote",
    activitiesScore: "Tracked Activity",
    currentTerm: "Current Term",
    termId: "Term",
  };
  const token = localStorage.getItem("token");
  // Decode token to get user role
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  // Add this function near the top of your component
  const getAvailableTerms = (currentTermIndex) => {
    const selectedTermIds = senatorTermData
      .map((term, index) => {
        // Don't exclude the current term being edited
        if (index === currentTermIndex) return null;
        return term.termId?._id || term.termId;
      })
      .filter(Boolean);

    return terms?.filter((term) => !selectedTermIds.includes(term._id)) || [];
  };
  // Helper function to get display name
  const getFieldDisplayName = (field) => {
    // Handle term fields (term0_fieldName)
    if (field.includes("_")) {
      const [termPrefix, actualField] = field.split("_");
      return `${termPrefix.replace("term", "Term ")}: ${
        fieldLabels[actualField] || actualField
      }`;
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
    publishStatus: "", // Default status
  });

  const [senatorTermData, setSenatorTermData] = useState([
    {
      senateId: id,
      summary: "",
      // summaries: [{ content: "" }],
      rating: "",
      votesScore: [{ voteId: "", score: "" }], // Start with empty, will be populated when term is selected
      activitiesScore: [{ activityId: "", score: "" }],
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

        // SPECIAL HANDLING: If termId is being changed, update filtered votes
        if (name === "termId" && value) {
          const selectedTerm = terms?.find((t) => t._id === value);

          if (selectedTerm) {
            // Recalculate filtered votes based on new term - only show votes senator participated in
            const newTermStart = new Date(`${selectedTerm.startYear}-01-01`);
            const newTermEnd = new Date(`${selectedTerm.endYear}-12-31`);

            const newFilteredVotes = allVotes.filter((vote) => {
              const voteDate = new Date(vote.date);

              // Must be inside the term range
              const inTerm =
                voteDate >= newTermStart &&
                voteDate <= newTermEnd &&
                selectedTerm.congresses.includes(Number(vote.congress));

              if (!inTerm) return false;

              // Senator must have participated (have a score) for this vote
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

            // Preserve existing scores for votes that are in both the old and new term
            const existingVoteScores = term.votesScore || [];

            // Create new votesScore array with senator's actual scores
            updatedTerm.votesScore = newFilteredVotes.map((vote) => {
              // Find the senator's actual score for this vote
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

              // Map the score to the standardized format
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
              };
            });

            // If no votes in the new term, ensure we have at least one empty entry
            if (updatedTerm.votesScore.length === 0) {
              updatedTerm.votesScore = [{ voteId: "", score: "" }];
            }

            // In handleTermChange, update the activitiesScore section:

            // Update activitiesScore for the new term
            const newParticipatedActivities = allActivities.filter(
              (activity) => {
                const activityDate = new Date(activity.date);

                //  Condition 1: Must be inside the senator's term range
                const inTerm =
                  activityDate >= newTermStart &&
                  activityDate <= newTermEnd &&
                  selectedTerm.congresses.includes(
                    Number(activity.congress || 0)
                  );

                if (!inTerm) return false;

                //  Condition 2: Must have a non-empty score
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

            // Create new activitiesScore array with senator's actual scores
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
                };
              }
            );

            // If no activities in the new term, ensure we have at least one empty entry
            if (updatedTerm.activitiesScore.length === 0) {
              updatedTerm.activitiesScore = [{ activityId: "", score: "" }];
            }
          }
        }

        return updatedTerm;
      });

      // Compare with original data
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

      // Compare with original data
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

  const handleSummaryChange = (termIndex, content) => {
    const fieldName = `term${termIndex}_summary`;

    setSenatorTermData((prev) => {
      const newTerms = prev.map((term, idx) => {
        if (idx !== termIndex) return term;

        return { ...term, summary: content };
      });

      // Compare with original data
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

      // Refresh the data
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
    setSenatorTermData((prev) => {
      const updatedTerms = prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              votesScore: term.votesScore.filter((_, i) => i !== voteIndex),
            }
          : term
      );

      // Clean up tracked changes for this vote
      setLocalChanges((prevChanges) =>
        prevChanges.filter(
          (change) =>
            !change.startsWith(`term${termIndex}_ScoredVote_${voteIndex + 1}`)
        )
      );

      return updatedTerms;
    });
  };

  const handleVoteChange = (termIndex, voteIndex, field, value) => {
    const voteChangeId = `term${termIndex}_ScoredVote_${voteIndex + 1}`;

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

      // Compare with original data
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
    setSenatorTermData((prev) => {
      const updatedTerms = prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              activitiesScore: term.activitiesScore.filter(
                (_, i) => i !== activityIndex
              ),
            }
          : term
      );

      // Clean up tracked changes for this activity
      setLocalChanges((prevChanges) =>
        prevChanges.filter(
          (change) =>
            !change.startsWith(
              `term${termIndex}_TrackedActivity_${activityIndex + 1}`
            )
        )
      );

      return updatedTerms;
    });
  };

  const handleActivityChange = (termIndex, activityIndex, field, value) => {
    const activityChangeId = `term${termIndex}_TrackedActivity_${
      activityIndex + 1
    }`;

    setSenatorTermData((prev) => {
      const newTerms = prev.map((term, idx) => {
        if (idx !== termIndex) return term;

        const newActivities = term.activitiesScore.map((activity, i) =>
          i === activityIndex ? { ...activity, [field]: value } : activity
        );

        return { ...term, activitiesScore: newActivities };
      });

      // Compare with original data if available
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

  const contentRefs = useRef([]);
  const handleEditorChange = useCallback((content, termIndex) => {
    const fieldName = `term${termIndex}_summary`; // Fixed field name for editor content

    // Track the change if not already tracked
    setLocalChanges((prev) => {
      return prev.includes(fieldName) ? prev : [...prev, fieldName];
    });

    // Store the editor content
    if (!contentRefs.current[termIndex]) {
      contentRefs.current[termIndex] = {};
    }
    contentRefs.current[termIndex].content = content;
  }, []);

  const handleBlur = useCallback((termIndex) => {
    setSenatorTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              summary: contentRefs.current[termIndex]?.content || "",
            }
          : term
      )
    );
  }, []);

  // Add a new empty term
  const handleAddTerm = () => {
    setSenatorTermData((prev) => [
      ...prev,
      {
        senateId: id,
        summary: "",
        // summaries: [{ content: "" }],
        rating: "",
        votesScore: [{ voteId: "", score: "" }], // Start with empty, will be populated when term is selected
        activitiesScore: [{ activityId: "", score: "" }],
        currentTerm: false,
        termId: null,
        editedFields: [], // Initialize empty
        fieldEditors: {}, // Initialize empty
        isNew: true,
      },
    ]);
  };

  const handleRemoveTerm = (termIndex) => {
    setSenatorTermData((prev) => {
      const removed = prev[termIndex];
      if (removed && removed._id) {
        setDeletedTermIds((ids) => [...ids, removed._id]);
      }

      // Remove any tracked changes for this term
      setLocalChanges((prevChanges) =>
        prevChanges.filter((change) => !change.startsWith(`term${termIndex}_`))
      );

      return prev.filter((_, index) => index !== termIndex);
    });
  };
  // const handleRemoveTerm = (termIndex) => {
  //   setSenatorTermData((prev) =>
  //     prev.filter((_, index) => index !== termIndex)
  //   );
  // };

  const compareValues = (newVal, oldVal) => {
    if (typeof newVal === "string" && typeof oldVal === "string") {
      return newVal.trim() !== oldVal.trim();
    }
    return newVal !== oldVal;
  };

  const termPreFill = () => {
    if (senatorData?.currentSenator?.length > 0) {
      const termsData = senatorData.currentSenator.map((term) => {
        const matchedTerm = terms?.find((t) => t.name === term.termId?.name);
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
          const termStart = new Date(`${matchedTerm.startYear}-01-01`);
          const termEnd = new Date(`${matchedTerm.endYear}-12-31`);

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
        let votesScore;
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
              const termStart = new Date(`${matchedTerm.startYear}-01-01`);
              const termEnd = new Date(`${matchedTerm.endYear}-12-31`);

              return (
                voteDate >= termStart &&
                voteDate <= termEnd &&
                matchedTerm.congresses.includes(Number(voteData.congress))
              );
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

              return {
                voteId: vote.voteId?._id || vote.voteId || "",
                score: scoreValue,
              };
            });
        } else if (termVotes.length > 0) {
          votesScore = termVotes.map((vote) => ({
            voteId: vote._id,
            score: getVoteScore(vote._id),
          }));
        } else {
          votesScore = [{ voteId: "", score: "" }];
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
          const termStart = new Date(`${matchedTerm.startYear}-01-01`);
          const termEnd = new Date(`${matchedTerm.endYear}-12-31`);

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
        let activitiesScore;
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
              const termStart = new Date(`${matchedTerm.startYear}-01-01`);
              const termEnd = new Date(`${matchedTerm.endYear}-12-31`);

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
              };
            });
        } else if (termActivities.length > 0) {
          activitiesScore = termActivities.map((activity) => ({
            activityId: activity._id,
            score: getActivityScore(activity._id),
            _activityTitle: activity.title || "Unknown Activity",
          }));
        } else {
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

    // Track senator-level changes
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

    // Track term-level changes
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

          // Track only if content is changed
          if (currentSummary.trim() !== originalSummary.trim()) {
            changes.push(`term${termIndex}_summary`);
          }
        } else if (["votesScore", "activitiesScore"].includes(key)) {
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

    // setEditedFields(changes);
    const backendEditedFields = Array.isArray(formData.editedFields)
      ? formData.editedFields
      : [];
    const mergedChanges = [...new Set([...backendEditedFields, ...changes])];

    setEditedFields(mergedChanges);
    // Use only local diffs for editedFields so reverting removes from list
    setEditedFields(changes);
  }, [formData, originalFormData, senatorTermData, originalTermData]);

  useEffect(() => {
    termPreFill();
  }, [id, senatorData]);

  const [loading, setLoading] = useState(false);
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

      setFormData(newFormData);
      setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getSenatorById(id));
      dispatch(getSenatorDataBySenetorId(id));
    }
    dispatch(getAllTerms());
    dispatch(getAllVotes());
    dispatch(getAllActivity());
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

      // Compare with original data to determine if this is an actual change
      const isActualChange = originalFormData
        ? compareValues(newData[name], originalFormData[name])
        : true;

      // Update local changes only if it's a real change
      if (isActualChange && !localChanges.includes(name)) {
        setLocalChanges((prev) => [...prev, name]);
      } else if (!isActualChange && localChanges.includes(name)) {
        // If it's reverted to original, remove from changes
        setLocalChanges((prev) => prev.filter((field) => field !== name));
      }

      return newData;
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fieldName = "Photo"; // The field name you want to track

    if (!localChanges.includes(fieldName)) {
      setLocalChanges((prev) => [...prev, fieldName]);
    }

    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleStatusChange = (status) => {
    const fieldName = "status"; // The field being changed
    setFormData((prev) => {
      const newData = { ...prev, status };

      // Compare with original value to determine if this is an actual change
      const isActualChange = originalFormData
        ? status !== originalFormData.status
        : true;

      // Update local changes based on whether it's an actual change
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

    try {
      // Prevent duplicate termId selections before any API calls
      const termIdCounts = senatorTermData
        .map((t) => t.termId)
        .filter(Boolean)
        .reduce((acc, id) => {
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});

      const hasDuplicateTerms = Object.values(termIdCounts).some(
        (count) => count > 1
      );
      if (hasDuplicateTerms) {
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

      const decodedToken = jwtDecode(token);
      const currentEditor = {
        editorId: decodedToken.userId,
        editorName: localStorage.getItem("user") || "Unknown User",
        editedAt: new Date(),
      };

      if (deletedTermIds.length > 0) {
        await Promise.all(
          deletedTermIds.map((id) => dispatch(deleteSenatorData(id)).unwrap())
        );
        setDeletedTermIds([]); // clear after delete
      }

      // Transform localChanges to track individual vote/activity edits
      const detailedChanges = localChanges.map((change) => {
        // Handle votesScore changes (e.g. "term1_votesScore_0_voteId")
        const voteMatch = change.match(/^term(\d+)_votesScore_(\d+)_(.+)$/);
        if (voteMatch) {
          const [, termIdx, voteIdx] = voteMatch;
          return `term${termIdx}_votesScore_${voteIdx}`;
        }

        // Handle activitiesScore changes
        const activityMatch = change.match(
          /^term(\d+)_activitiesScore_(\d+)_(.+)$/
        );
        if (activityMatch) {
          const [, termIdx, activityIdx] = activityMatch;
          return `term${termIdx}_activitiesScore_${activityIdx}`;
        }

        return change;
      });

      const allChanges = [
        ...new Set([
          ...(Array.isArray(formData.editedFields)
            ? formData.editedFields
            : []),
          ...detailedChanges,
        ]),
      ];

      // Update field editors with current changes
      const updatedFieldEditors = { ...(formData.fieldEditors || {}) };
      localChanges.forEach((field) => {
        // For senator-level fields
        if (field in formData) {
          if (compareValues(formData[field], originalFormData?.[field] || "")) {
            updatedFieldEditors[field] = currentEditor;
          }
        }
        // For term-level fields
        else if (field.startsWith("term")) {
          updatedFieldEditors[field] = currentEditor;
        }
      });

      // Prepare senator update
      const senatorUpdate = {
        ...formData,
        editedFields: allChanges,
        fieldEditors: updatedFieldEditors,
        publishStatus: userRole === "admin" ? "published" : "under review",
      };

      // Clear editedFields if publishing
      if (senatorUpdate.publishStatus === "published") {
        senatorUpdate.editedFields = [];
        senatorUpdate.fieldEditors = {};
      }

      // Update senator
      if (id) {
        const formData = new FormData();
        Object.entries(senatorUpdate).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === "object" && !(value instanceof File)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        await dispatch(updateSenator({ id, formData })).unwrap();
      }

      // Update terms
      const termPromises = senatorTermData.map((term, index) => {
        const transformedVotesScore = term.votesScore
          .map((vote) => ({
            ...vote,
            voteId: vote.voteId === "" ? null : vote.voteId,
          }))
          .filter((vote) => vote.voteId !== null); // Optional: remove null entries
        const transformedTrackedActivity = term.activitiesScore
          .map((activity) => ({
            ...activity,
            activityId: activity.activityId === "" ? null : activity.activityId,
          }))
          .filter((activity) => activity.activityId !== null);

        // Get changes specific to this term
        const termChanges = allChanges.filter((f) =>
          f.startsWith(`term${index}_`)
        );

        // Get the selected term to extract congress data
        const selectedTerm = terms.find((t) => t._id === term.termId);

        // Extract congress array from the term
        const congressArray = selectedTerm?.congresses || [];

        // Extract years if available
        const years = selectedTerm?.years || null;

        const termUpdate = {
          ...term,
          votesScore: transformedVotesScore,
          activitiesScore: transformedTrackedActivity,
          isNew: false,
          senateId: id,
          editedFields: termChanges,
          fieldEditors: updatedFieldEditors,
          // Map each summary to include the corresponding congress
          // summaries: term.summaries.map((summary, summaryIndex) => ({
          //   ...summary,
          //   congress: congressArray[summaryIndex] || null, // Get the congress at the same index
          // })),
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

      userRole === "admin"
        ? handleSnackbarOpen("Changes published successfully!", "success")
        : handleSnackbarOpen(
            'Status changed to "Under Review" for admin to moderate.',
            "info"
          );
    } catch (error) {
      console.error("Save failed:", error);

      const errorMessage =
        error?.response?.data?.message ||
        (error.code === 11000
          ? "Duplicate entry: This senator term already exists."
          : "Failed to create senator data. Please try again.");

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
  // Update your status config
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

  // Add this helper function to validate activity IDs
  const getValidVoteId = (voteId) => {
    if (!votes || votes.length === 0) return "";
    const voteExists = votes.some((v) => v._id === voteId);
    return voteExists ? voteId : "";
  };

  return (
    <AppTheme key={componentKey}>
      {loading && (
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
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              mt: { xs: 8, md: 2.8 },
              gap: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              width="100%"
              sx={{
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleDiscard}
                className="discardBtn"
              >
                {userRole === "admin" ? "Discard" : "Undo"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleSave}
                className="publishBtn"
              >
                {userRole === "admin" ? "Publish" : "Save Changes"}
              </Button>
            </Stack>
            {userRole &&
              formData.publishStatus &&
              (formData.publishStatus !== "published" ||
                localChanges.length > 0) &&
              statusData && (
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
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    {/* Status icon bubble (unchanged) */}
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
                      {statusData.icon &&
                        React.cloneElement(statusData.icon, {
                          sx: { color: statusData.iconColor },
                        })}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      {/* Header (unchanged) */}
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

                        {/* {userRole === "admin" && (
                          <Chip
                            label={`${Array.isArray(formData?.editedFields)
                              ? formData.editedFields.length +
                              localChanges.length
                              : 0
                              } pending changes`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )} */}
                      </Box>

                      {/* Pending / New fields list */}
                      <Box sx={{ mt: 1.5 }}>
                        {(() => {
                          const backendChanges = Array.isArray(
                            formData?.editedFields
                          )
                            ? formData.editedFields
                            : [];
                          const hasChanges =
                            backendChanges.length > 0 ||
                            localChanges.length > 0;

                          if (!hasChanges) {
                            return (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.disabled",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {id
                                  ? "No pending changes"
                                  : "Fill in the form to create a new senator"}
                              </Typography>
                            );
                          }

                          // Enhanced field name formatter
                          const formatFieldName = (field) => {
                            // Handle term array items (e.g., "term2_votesScore_0_voteId")
                            const termArrayMatch = field.match(
                              /^term(\d+)_(votesScore|activitiesScore)_(\d+)_(.+)$/
                            );
                            if (termArrayMatch) {
                              const [, termIdx, category, itemIdx, subField] =
                                termArrayMatch;
                              const termNumber = parseInt(termIdx) + 1;
                              // const itemNumber = parseInt(itemIdx) + 1;

                              if (category === "votesScore") {
                                return `Term ${termNumber}: Scored Vote`;
                              }
                              if (category === "activitiesScore") {
                                return `Term ${termNumber}: Tracked Activity`;
                              }
                              return `Term ${termNumber}: ${
                                fieldLabels[category] || category
                              } Item ${itemNumber}`;
                            }

                            // Handle regular term fields (e.g., "term2_votesScore")
                            if (field.startsWith("term")) {
                              const parts = field.split("_");
                              const termNumber =
                                parseInt(parts[0].replace("term", "")) + 1;
                              const fieldKey = parts.slice(1).join("_");
                              return `Term ${termNumber}: ${
                                fieldLabels[fieldKey] || fieldKey
                              }`;
                            }

                            // Handle non-term fields
                            return fieldLabels[field] || field;
                          };

                          return (
                            <>
                              {/* Backend pending changes */}
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
                                    {backendChanges.map((field) => {
                                      const editorInfo =
                                        formData?.fieldEditors?.[field];
                                      const editor =
                                        editorInfo?.editorName ||
                                        "Unknown Editor";
                                      const editTime = editorInfo?.editedAt
                                        ? new Date(
                                            editorInfo.editedAt
                                          ).toLocaleString([], {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "unknown time";

                                      return (
                                        <ListItem
                                          key={`backend-${field}`}
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
                                                    backgroundColor:
                                                      statusData.iconColor,
                                                  }}
                                                />
                                                <Typography
                                                  variant="body2"
                                                  fontWeight="500"
                                                >
                                                  {formatFieldName(field)}
                                                </Typography>
                                              </Box>
                                            }
                                            secondary={
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                              >
                                                Updated by {editor} on{" "}
                                                {editTime}
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

                              {/* Local unsaved changes */}
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
                                    {localChanges.map((field) => (
                                      <ListItem
                                        key={`local-${field}`}
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
                                                  backgroundColor:
                                                    statusData.iconColor,
                                                }}
                                              />
                                              <Typography
                                                variant="body2"
                                                fontWeight="500"
                                              >
                                                {formatFieldName(field)}
                                              </Typography>
                                            </Box>
                                          }
                                          // secondary={
                                          //   <Typography variant="caption" color="text.secondary">
                                          //     Edited just now
                                          //   </Typography>
                                          // }
                                          // sx={{ my: 0 }}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                            </>
                          );
                        })()}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

            <Paper className="customPaper">
              <Dialog
                open={openDiscardDialog}
                onClose={() => setOpenDiscardDialog(false)}
                PaperProps={{
                  sx: { borderRadius: 3, padding: 2, minWidth: 350 },
                }}
              >
                <DialogTitle
                  sx={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "warning.main",
                  }}
                >
                  {userRole === "admin" ? "Discard" : "Undo"} Changes?
                </DialogTitle>

                <DialogContent>
                  <DialogContentText
                    sx={{
                      textAlign: "center",
                      fontSize: "1rem",
                      color: "text.secondary",
                    }}
                  >
                    Are you sure you want to{" "}
                    {userRole === "admin" ? "discard" : "undo"} all changes?{" "}
                    <br />
                    <strong>This action cannot be undone.</strong>
                  </DialogContentText>
                </DialogContent>

                <DialogActions>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      width: "100%",
                      justifyContent: "center",
                      paddingBottom: 2,
                    }}
                  >
                    <Button
                      onClick={() => setOpenDiscardDialog(false)}
                      variant="outlined"
                      color="secondary"
                      sx={{ borderRadius: 2, paddingX: 3 }}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleConfirmDiscard}
                      variant="contained"
                      color="warning"
                      sx={{ borderRadius: 2, paddingX: 3 }}
                    >
                      {userRole === "admin" ? "Discard" : "Undo"}
                    </Button>
                  </Stack>
                </DialogActions>
              </Dialog>
              <Box sx={{ p: 0 }}>
                <Typography className="customTypography">
                  Senator's Information
                </Typography>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={2}
                  alignItems={"center"}
                  py={3}
                >
                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="nameLabel">
                      Senator's Name
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 4}>
                    <TextField
                      required
                      id="title"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      autoComplete="off"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={isMobile ? 12 : 1}>
                    <InputLabel className="label">Status</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 4}>
                    <ButtonGroup
                      variant="outlined"
                      aria-label="Basic button group"
                      className="customButtonGroup"
                    >
                      <Button
                        variant={"outlined"}
                        onClick={() => handleStatusChange("Active")}
                        className={`statusBtn ${
                          formData.status === "Active" ? "active" : ""
                        }`}
                      >
                        Active
                      </Button>
                      <Button
                        variant={"outlined"}
                        onClick={() => handleStatusChange("Former")}
                        className={`statusBtn ${
                          formData.status === "Former" ? "active" : ""
                        }`}
                      >
                        Former
                      </Button>
                    </ButtonGroup>
                  </Grid>
                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">State</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 4}>
                    <TextField
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      autoComplete="off"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    size={isMobile ? 12 : 1}
                    sx={{ alignContent: "center" }}
                  >
                    <InputLabel className="label">Party</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 4}>
                    <FormControl fullWidth>
                      <Select
                        name="party"
                        value={formData.party}
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="republican">Republican</MenuItem>
                        <MenuItem value="democrat">Democrat</MenuItem>
                        <MenuItem value="independent">Independent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">Senator's Photo</InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {formData.photo ? (
                        <img
                          src={
                            typeof formData.photo === "string"
                              ? formData.photo
                              : URL.createObjectURL(formData.photo)
                          }
                          alt="Senator's Photo"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No photo uploaded
                        </Typography>
                      )}

                      <Button
                        component="label"
                        variant="outlined"
                        className="uploadBtn"
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload files
                        <VisuallyHiddenInput
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Render each term in senatorTermData */}
            {senatorTermData.map((term, termIndex) => (
              <Paper key={termIndex} className="termData-paper">
                <Box sx={{ padding: 0 }}>
                  <Box className="termData-header">
                    <Typography fontSize={"1rem"} fontWeight={500}>
                      Senator's Term Information {termIndex + 1}
                    </Typography>

                    {termIndex > 0 && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={() => handleRemoveTerm(termIndex)}
                      >
                        Remove Term
                      </Button>
                    )}
                  </Box>
                  <Grid
                    container
                    rowSpacing={2}
                    columnSpacing={2}
                    alignItems={"center"}
                    py={3}
                  >
                    <Grid size={isMobile ? 12 : 2}>
                      <InputLabel className="label">Term</InputLabel>
                    </Grid>
                    <Grid size={isMobile ? 12 : 2.2}>
                      <FormControl fullWidth>
                        <Select
                          value={getValidTermId(
                            term.termId?._id || term.termId || ""
                          )}
                          id="term"
                          name="termId"
                          onChange={(event) =>
                            handleTermChange(event, termIndex)
                          }
                          sx={{ background: "#fff" }}
                        >
                          <MenuItem value="" disabled>
                            Select an option
                          </MenuItem>
                          {getAvailableTerms(termIndex).length > 0 ? (
                            getAvailableTerms(termIndex)
                              .sort((a, b) => b.endYear - a.endYear)
                              .map((t) => (
                                <MenuItem key={t._id} value={t._id}>
                                  {t.name}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem value="" disabled>
                              No terms available
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid
                      size={isMobile ? 6 : 2.1}
                      sx={{ alignContent: "center" }}
                    >
                      <InputLabel className="label">Current Term</InputLabel>
                    </Grid>
                    <Grid size={isMobile ? 6 : 0}>
                      <Switch
                        {...label}
                        name="currentTerm"
                        checked={term.currentTerm}
                        onChange={(e) => handleSwitchChange(e, termIndex)}
                        color="warning"
                      />
                    </Grid>
                    <Grid size={isMobile ? 6 : 2.39}>
                      <InputLabel className="label">SBA Rating</InputLabel>
                    </Grid>
                    <Grid size={isMobile ? 6 : 2.2}>
                      <FormControl fullWidth>
                        <Select
                          value={term.rating || ""}
                          id="rating"
                          name="rating"
                          onChange={(event) =>
                            handleTermChange(event, termIndex)
                          }
                          sx={{ background: "#fff" }}
                        >
                          <MenuItem value="" disabled>
                            Select a rating
                          </MenuItem>
                          {rating.map((rate, index) => (
                            <MenuItem key={index} value={rate}>
                              {rate}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={isMobile ? 12 : 2}>
                      <InputLabel className="label">Term Summary</InputLabel>
                    </Grid>
                    {/* Editor Column */}
                    <Grid size={isMobile ? 12 : 9.05}>
                      <Editor
                        tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
                        licenseKey="gpl"
                        onInit={(_evt, editor) => (editorRef.current = editor)}
                        value={term?.summary || ""}
                        onEditorChange={(content) =>
                          handleSummaryChange(termIndex, content)
                        } // Remove the extra 0
                        init={{
                          base_url: "/scorecard/admin/tinymce",
                          height: 250,
                          menubar: false,
                          plugins: [
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "image",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "code",
                            "help",
                            "wordcount",
                          ],
                          toolbar:
                            "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                          content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; direction: ltr; }",
                          directionality: "ltr",
                        }}
                      />
                    </Grid>
                    <Grid size={1}></Grid>
                    <Grid size={1}></Grid>
                    {term.termId ? (
                      <>
                        {term.votesScore.map((vote, voteIndex) => (
                          <Grid
                            rowSpacing={2}
                            sx={{ width: "100%" }}
                            key={voteIndex}
                          >
                            <Grid
                              size={12}
                              display="flex"
                              alignItems="center"
                              columnGap={"15px"}
                            >
                              <Grid size={isMobile ? 12 : 2}>
                                <InputLabel className="label">
                                  Scored Vote {voteIndex + 1}
                                </InputLabel>
                              </Grid>
                              <Grid size={isMobile ? 12 : 7.5}>
                                <FormControl fullWidth>
                                  <Select
                                    value={vote.voteId || ""}
                                    onChange={(event) =>
                                      handleVoteChange(
                                        termIndex,
                                        voteIndex,
                                        "voteId",
                                        event.target.value
                                      )
                                    }
                                    sx={{
                                      background: "#fff",
                                      width: "100%",
                                    }}
                                    renderValue={(selected) => {
                                      const selectedVote = votes.find(
                                        (v) => v._id === selected
                                      );
                                      return (
                                        <Typography
                                          sx={{
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                          }}
                                        >
                                          {selectedVote?.title ||
                                            "Select a Bill"}
                                        </Typography>
                                      );
                                    }}
                                    MenuProps={{
                                      PaperProps: {
                                        sx: {
                                          maxHeight: 300,
                                          width: 400,
                                          "& .MuiMenuItem-root": {
                                            minHeight: "48px",
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      Select a Bill
                                    </MenuItem>
                                    {allVotes.length > 0 ? (
                                      allVotes
                                        .filter(
                                          (voteItem) =>
                                            voteItem.type === "senate_bill"
                                        ) // Filter by type "senate_bill"
                                        .map((voteItem) => {
                                          // Find the senator's score for this vote
                                          const senatorVote = senatorVotes.find(
                                            (v) => {
                                              const vId =
                                                typeof v.voteId === "object"
                                                  ? v.voteId?._id
                                                  : v.voteId;
                                              return (
                                                vId === voteItem._id ||
                                                v.quorumId ===
                                                  voteItem.quorumId ||
                                                (v.billNumber &&
                                                  voteItem.billNumber &&
                                                  v.billNumber ===
                                                    voteItem.billNumber)
                                              );
                                            }
                                          );

                                          const score =
                                            senatorVote?.score || "";
                                          const scoreText = score
                                            ? ` (${score})`
                                            : "";

                                          return (
                                            <MenuItem
                                              key={voteItem._id}
                                              value={voteItem._id}
                                              sx={{ py: 1.5 }}
                                            >
                                              <Typography
                                                sx={{
                                                  whiteSpace: "normal",
                                                  overflowWrap: "break-word",
                                                }}
                                              >
                                                {voteItem.title}
                                              </Typography>
                                            </MenuItem>
                                          );
                                        })
                                    ) : (
                                      <MenuItem value="" disabled>
                                        {term.termId
                                          ? "No bills available for this term"
                                          : "Select a term first"}
                                      </MenuItem>
                                    )}
                                    {/* ) */}
                                    {/* ()} */}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid size={isMobile ? 12 : 1.6}>
                                <FormControl fullWidth>
                                  <Select
                                    value={vote?.score || ""}
                                    onChange={(event) =>
                                      handleVoteChange(
                                        termIndex,
                                        voteIndex,
                                        "score",
                                        event.target.value
                                      )
                                    }
                                    sx={{ background: "#fff" }}
                                  >
                                    <MenuItem value="yea">Yea</MenuItem>
                                    <MenuItem value="nay">Nay</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid size={1}>
                                <DeleteForeverIcon
                                  onClick={() =>
                                    handleRemoveVote(termIndex, voteIndex)
                                  }
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                      </>
                    ) : (
                      <Grid rowSpacing={2} sx={{ width: "100%" }}>
                        <Grid
                          size={12}
                          display="flex"
                          alignItems="center"
                          columnGap={"15px"}
                        >
                          <Grid size={isMobile ? 12 : 2}>
                            <InputLabel className="label">
                              Scored Vote 1
                            </InputLabel>
                          </Grid>
                          <Grid size={isMobile ? 12 : 7.5}>
                            <FormControl fullWidth>
                              <Select
                                value=""
                                sx={{ background: "#fff", width: "100%" }}
                                disabled
                              >
                                <MenuItem value="">
                                  Select a term first
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={isMobile ? 12 : 1.6}>
                            <FormControl fullWidth>
                              <Select
                                value=""
                                sx={{ background: "#fff" }}
                                disabled
                              >
                                <MenuItem value="yea">Yea</MenuItem>
                                <MenuItem value="nay">Nay</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={1}>
                            <DeleteForeverIcon sx={{ opacity: 0.5 }} />
                          </Grid>
                        </Grid>
                      </Grid>
                    )}
                    {/* Vote Repeater Ends */}
                    <Grid size={1}></Grid>
                    <Grid size={10} sx={{ textAlign: "right" }}>
                      <Button
                        variant="outlined"
                        className="addVoteActivity-btn"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddVote(termIndex)}
                      >
                        Add Vote
                      </Button>
                    </Grid>
                    <Grid size={1}></Grid>
                    {/* Activities Repeater Start */}
                    {term.termId ? (
                      <>
                        {term.activitiesScore.map((activity, activityIndex) => (
                          <Grid
                            rowSpacing={2}
                            sx={{ width: "100%", mt: 2 }}
                            key={activityIndex}
                          >
                            <Grid
                              size={12}
                              display="flex"
                              alignItems="center"
                              columnGap={"15px"}
                            >
                              <Grid size={isMobile ? 12 : 2}>
                                <InputLabel className="label">
                                  Tracked Activity {activityIndex + 1}
                                </InputLabel>
                              </Grid>
                              <Grid size={isMobile ? 12 : 7.5}>
                                <FormControl fullWidth>
                                  <Select
                                    value={activity.activityId || ""}
                                    onChange={(event) =>
                                      handleActivityChange(
                                        termIndex,
                                        activityIndex,
                                        "activityId",
                                        event.target.value
                                      )
                                    }
                                    sx={{
                                      background: "#fff",
                                      width: "100%",
                                    }}
                                    renderValue={(selected) => {
                                      const selectedActivity =
                                        allActivities.find(
                                          (a) => a._id === selected
                                        );
                                      return (
                                        <Typography
                                          sx={{
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                          }}
                                        >
                                          {selectedActivity?.title ||
                                            "Select an Activity"}
                                        </Typography>
                                      );
                                    }}
                                    MenuProps={{
                                      PaperProps: {
                                        sx: {
                                          maxHeight: 300,
                                          width: 400,
                                          "& .MuiMenuItem-root": {
                                            minHeight: "48px",
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <MenuItem value="" disabled>
                                      Select an Activity
                                    </MenuItem>
                                    {allActivities.length > 0 ? (
                                      allActivities
                                        .filter(
                                          (activityItem) =>
                                            activityItem.type === "senate"
                                        )
                                        .map((activityItem) => {
                                          // Find if this activity has a score for this senator
                                          const hasScore =
                                            senatorActivities.some((a) => {
                                              const aId =
                                                typeof a.activityId === "object"
                                                  ? a.activityId?._id
                                                  : a.activityId;
                                              return (
                                                aId === activityItem._id &&
                                                a.score &&
                                                a.score.trim() !== ""
                                              );
                                            });

                                          const scoreText = hasScore
                                            ? " (scored)"
                                            : "";

                                          return (
                                            <MenuItem
                                              key={activityItem._id}
                                              value={activityItem._id}
                                              sx={{ py: 1.5 }}
                                            >
                                              <Typography
                                                sx={{
                                                  whiteSpace: "normal",
                                                  overflowWrap: "break-word",
                                                }}
                                              >
                                                {activityItem.title ||
                                                  "Untitled Activity"}
                                              </Typography>
                                            </MenuItem>
                                          );
                                        })
                                    ) : (
                                      <MenuItem value="" disabled>
                                        No activities available
                                      </MenuItem>
                                    )}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid size={isMobile ? 12 : 1.6}>
                                <FormControl fullWidth>
                                  <Select
                                    value={activity?.score || ""}
                                    onChange={(event) =>
                                      handleActivityChange(
                                        termIndex,
                                        activityIndex,
                                        "score",
                                        event.target.value
                                      )
                                    }
                                    sx={{ background: "#fff" }}
                                  >
                                    <MenuItem value="yes">Yea</MenuItem>
                                    <MenuItem value="no">Nay</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid size={1}>
                                <DeleteForeverIcon
                                  onClick={() =>
                                    handleRemoveActivity(
                                      termIndex,
                                      activityIndex
                                    )
                                  }
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                      </>
                    ) : (
                      <Grid rowSpacing={2} sx={{ width: "100%", mt: 2 }}>
                        <Grid
                          size={12}
                          display="flex"
                          alignItems="center"
                          columnGap={"15px"}
                        >
                          <Grid size={isMobile ? 12 : 2}>
                            <InputLabel className="label">
                              Tracked Activity 1
                            </InputLabel>
                          </Grid>
                          <Grid size={isMobile ? 12 : 7.5}>
                            <FormControl fullWidth>
                              <Select
                                value=""
                                sx={{ background: "#fff", width: "100%" }}
                                disabled
                              >
                                <MenuItem value="">
                                  Select a term first
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={isMobile ? 12 : 1.6}>
                            <FormControl fullWidth>
                              <Select
                                value=""
                                sx={{ background: "#fff" }}
                                disabled
                              >
                                <MenuItem value="yes">Yea</MenuItem>
                                <MenuItem value="no">Nay</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={1}>
                            <DeleteForeverIcon sx={{ opacity: 0.5 }} />
                          </Grid>
                        </Grid>
                      </Grid>
                    )}{" "}
                    {/* Activities Repeater Ends */}
                    <Grid size={1}></Grid>
                    <Grid size={10} sx={{ textAlign: "right" }}>
                      <Button
                        variant="outlined"
                        className="addVoteActivity-btn"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddActivity(termIndex)}
                      >
                        Add Activity
                      </Button>
                    </Grid>
                    <Grid size={1}></Grid>
                  </Grid>
                </Box>
              </Paper>
            ))}

            {/* Add Term Button */}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTerm}
              className="addTerm-btn"
            >
              Add Another Term
            </Button>

            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MuiAlert
                onClose={handleSnackbarClose}
                severity={snackbarSeverity}
                sx={{
                  width: "100%",
                  border: "none",
                  boxShadow: "none",
                  bgcolor:
                    snackbarMessage === "Changes published successfully!"
                      ? "#daf4f0"
                      : undefined,
                  "& .MuiAlert-icon": {
                    color:
                      snackbarMessage === "Changes published successfully!"
                        ? "#099885"
                        : undefined,
                  },
                  "& .MuiAlert-message": {
                    color:
                      snackbarMessage === "Changes published successfully!"
                        ? "#099885"
                        : undefined,
                  },
                  "& .MuiAlert-action": {
                    display: "flex",
                    alignItems: "center",
                    paddingTop: 0,
                    paddingBottom: 0,
                  },
                }}
                elevation={6}
                variant="filled"
              >
                {snackbarMessage}
              </MuiAlert>
            </Snackbar>
          </Stack>
          <Box sx={{ mb: "40px", mx: "15px" }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
