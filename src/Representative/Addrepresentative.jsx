import * as React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { alpha, styled } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SideMenu from "../components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
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
import Copyright from "../Dashboard/internals/components/Copyright";
import { useDispatch, useSelector } from "react-redux";
import { rating } from "../Dashboard/global/common";
import { useParams, useNavigate } from "react-router-dom";
import { Chip } from "@mui/material";
import HourglassTop from "@mui/icons-material/HourglassTop";
import Verified from "@mui/icons-material/Verified";
import { Drafts } from "@mui/icons-material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { jwtDecode } from "jwt-decode";
import CircleIcon from "@mui/icons-material/Circle";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete,
} from "@mui/material";

import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
  getAllVotes,
} from "../redux/reducer/voteSlice";
import { getAllActivity } from "../redux/reducer/activitySlice";
import { discardHouseChanges } from "../redux/reducer/houseSlice";
import {
  clearHouseState,
  updateRepresentativeStatus,
  getHouseById,
  updateHouse,
  createHouse,
} from "../redux/reducer/houseSlice";
import {
  getHouseDataByHouseId,
  updateHouseData,
  createHouseData,
  clearHouseDataState,
} from "../redux/reducer/houseTermSlice";
import { getAllTerms } from "../redux/reducer/termSlice";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import { deleteHouseData } from "../redux/reducer/houseTermSlice"; // adjust path as needed
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MobileHeader from "../components/MobileHeader";

export default function Addrepresentative(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { house } = useSelector((state) => state.house);
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const { activities } = useSelector((state) => state.activity);
  const houseData = useSelector((state) => state.houseData);
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

  let houseActivities =
    activities?.filter((activity) => activity.type === "house") || [];

  // Field labels for display
  const fieldLabels = {
    // Representative fields
    name: "Representative Name",
    status: "Status",
    district: "District",
    party: "Party",
    photo: "Photo",
    publishStatus: "Publish Status",

    // Term fields (will be prefixed with termX_)
    houseId: "House ID",
    summary: "Term Summary",
    rating: "SBA Rating",
    votesScore: "Scored Vote",
    activitiesScore: "Tracked Activity",
    currentTerm: "Current Term",
    termId: "Term",
  };

  // Helper function to get display name
  const getFieldDisplayName = (field) => {
    // Handle term fields (term0_fieldName)
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
    district: "",
    party: "",
    photo: null,
    status: "Active",
    publishStatus: "",
  });
  // console.log("house Data:", houseData);
  const housedataByid = houseData?.currentHouse
  // console.log("housedataByid:", housedataByid);
  const [houseTermData, setHouseTermData] = useState([
    {
      houseId: id,
      summary: "",
      rating: "",
      votesScore: [{ voteId: "", score: "" }],
      activitiesScore: [{ activityId: "", score: "" }],
      currentTerm: false,
      termId: null,
    },
  ]);

  // const handleTermChange = (e, termIndex) => {
  //   const fieldName = `term${termIndex}_${e.target.name}`;
  //   if (!localChanges.includes(fieldName)) {
  //     setLocalChanges((prev) => [...prev, fieldName]);
  //   }
  //   setHouseTermData((prev) =>
  //     prev.map((term, index) =>
  //       index === termIndex
  //         ? { ...term, [e.target.name]: e.target.value }
  //         : term
  //     )
  //   );
  // };

  // const handleTermChange = (e, termIndex) => {
  //   const { name, value } = e.target;
  //   const fieldName = `term${termIndex}_${e.target.name}`;

  //   setHouseTermData((prev) => {
  //     const newTerms = prev.map((term, index) =>
  //       index === termIndex ? { ...term, [name]: value } : term
  //     );

  //     // Compare with original data
  //     const originalTerm = originalTermData[termIndex] || {};
  //     const isActualChange = compareValues(value, originalTerm[name]);

  //     if (isActualChange && !localChanges.includes(fieldName)) {
  //       setLocalChanges((prev) => [...prev, fieldName]);
  //     } else if (!isActualChange && localChanges.includes(fieldName)) {
  //       setLocalChanges((prev) => prev.filter(f => f !== fieldName));
  //     }

  //     return newTerms;
  //   });

  // };
  const handleTermChange = (e, termIndex) => {
    const { name, value } = e.target;
    const fieldName = `term${termIndex}_${name}`;

    setHouseTermData((prev) => {
      const newTerms = prev.map((term, index) => {
        if (index !== termIndex) return term;

        // If term is changing, check if we have existing data for this term
        if (name === "termId" && value !== term.termId) {
          const newTermId = value;
          const selectedTerm = terms.find((t) => t._id === newTermId);
          const termCongresses = selectedTerm?.congresses || [];

          // Convert congress numbers to strings for comparison
          const termCongressStrings = termCongresses.map((c) => c.toString());

          // Check if we have existing data for this term in houseData
          const existingTermData = houseData?.currentHouse?.find(
            (ht) =>
              ht.termId &&
              (ht.termId._id === newTermId ||
                ht.termId === newTermId ||
                (typeof ht.termId === "object" &&
                  ht.termId.name === selectedTerm?.name))
          );

          console.log("Existing term data:", existingTermData);

          let votesScore = [];
          let activitiesScore = [];
          let summary = ""; // Initialize as empty
          let rating = ""; // Initialize as empty
          let currentTerm = false; // Initialize as false

          // If we have existing data for this term, use it
          if (existingTermData) {
            // Map votes from existing data
            votesScore =
              existingTermData.votesScore?.map((vote) => ({
                voteId: vote.voteId?._id || vote.voteId || "",
                score: vote.score || "",
              })) || [];

            // Map activities from existing data
            activitiesScore =
              existingTermData.activitiesScore?.map((activity) => ({
                activityId:
                  activity.activityId?._id || activity.activityId || "",
                score: activity.score || "",
              })) || [];

            // Only use existing values if they exist
            summary = existingTermData.summary || "";
            rating = existingTermData.rating || "";
            currentTerm =
              existingTermData.currentTerm !== undefined
                ? existingTermData.currentTerm
                : false;
          } else {
            // Filter votes to keep only those that belong to the new term's congresses
            votesScore = term.votesScore.filter((vote) => {
              if (!vote.voteId || vote.voteId === "") return true; // keep placeholder

              const voteItem = votes.find((v) => v._id === vote.voteId);
              if (!voteItem) return false;

              return termCongressStrings.includes(voteItem.congress);
            });

            // Filter activities to keep only those that belong to the new term's congresses
            activitiesScore = term.activitiesScore.filter((activity) => {
              if (!activity.activityId || activity.activityId === "")
                return true; // keep placeholder

              const activityItem = houseActivities.find(
                (a) => a._id === activity.activityId
              );
              if (!activityItem) return false;

              return termCongressStrings.includes(activityItem.congress);
            });

            // Set all fields to empty/false for new terms without existing data
            summary = "";
            rating = "";
            currentTerm = false;
          }

          // If no votes remain after filtering, add an empty vote
          const finalVotesScore =
            votesScore.length > 0 ? votesScore : [{ voteId: "", score: "" }];

          // If no activities remain after filtering, add an empty activity
          const finalActivitiesScore =
            activitiesScore.length > 0
              ? activitiesScore
              : [{ activityId: "", score: "" }];

          return {
            ...term,
            [name]: value,
            votesScore: finalVotesScore,
            activitiesScore: finalActivitiesScore,
            summary, // Will be empty if no existing data
            rating, // Will be empty if no existing data
            currentTerm, // Will be false if no existing data
          };
        }

        return { ...term, [name]: value };
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
  // const handleSwitchChange = (e, termIndex) => {
  //   const fieldName = `term${termIndex}_${e.target.name}`;
  //   if (!localChanges.includes(fieldName)) {
  //     setLocalChanges((prev) => [...prev, fieldName]);
  //   }
  //   setHouseTermData((prev) =>
  //     prev.map((term, index) =>
  //       index === termIndex
  //         ? { ...term, [e.target.name]: e.target.checked }
  //         : term
  //     )
  //   );
  // };

  const handleSwitchChange = (e, termIndex) => {
    const { name, checked } = e.target;
    const fieldName = `term${termIndex}_${name}`;

    setHouseTermData((prev) => {
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

  // const handleSwitchChange = (e, termIndex) => {
  //   const { name, checked } = e.target;
  //   const fieldName = `term${termIndex}_${name}`;

  //   setHouseTermData((prev) => {
  //     let newTerms;

  //     // If setting currentTerm to true, ensure only one term is current
  //     if (name === "currentTerm" && checked) {
  //       newTerms = prev.map((term, index) => ({
  //         ...term,
  //         currentTerm: index === termIndex
  //       }));
  //     } else {
  //       newTerms = prev.map((term, index) =>
  //         index === termIndex ? { ...term, [name]: checked } : term
  //       );
  //     }

  //     // Compare with original data
  //     const originalTerm = originalTermData[termIndex] || {};
  //     const isActualChange = compareValues(
  //       name === "currentTerm" && checked
  //         ? true // For currentTerm, we need to check if this specific term should be current
  //         : checked,
  //       originalTerm[name]
  //     );

  //     if (isActualChange && !localChanges.includes(fieldName)) {
  //       setLocalChanges((prev) => [...prev, fieldName]);
  //     } else if (!isActualChange && localChanges.includes(fieldName)) {
  //       setLocalChanges((prev) => prev.filter(f => f !== fieldName));
  //     }

  //     return newTerms;
  //   });
  // };
  const handleAddVote = (termIndex) => {
    setHouseTermData((prev) =>
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

  // const handleRemoveVote = (termIndex, voteIndex) => {

  //   setHouseTermData((prev) =>
  //     prev.map((term, index) =>
  //       index === termIndex
  //         ? {
  //           ...term,
  //           votesScore: term.votesScore.filter((_, i) => i !== voteIndex),
  //         }
  //         : term
  //     )
  //   );
  // };
  const handleRemoveVote = (termIndex, voteIndex) => {
    setHouseTermData((prev) => {
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
  // const handleVoteChange = (termIndex, voteIndex, field, value) => {
  //   // Construct the field name for change tracking
  //   // Construct the field name for change tracking
  //   const voteChangeId = `term${termIndex}_ScoredVote_${voteIndex + 1}`;

  //   // Update local changes if not already tracked
  //   setLocalChanges((prev) =>
  //     prev.includes(voteChangeId) ? prev : [...prev, voteChangeId]
  //   );

  //   // const fieldName = `term${termIndex}_votesScore_${voteIndex}_${field}`;

  //   // setLocalChanges((prev) =>
  //   //   prev.includes(fieldName) ? prev : [...prev, fieldName]
  //   // );
  //   setHouseTermData((prev) =>
  //     prev.map((term, index) =>
  //       index === termIndex
  //         ? {
  //             ...term,
  //             votesScore: term.votesScore.map((vote, i) =>
  //               i === voteIndex ? { ...vote, [field]: value } : vote
  //             ),
  //           }
  //         : term
  //     )
  //   );
  // };

  const handleVoteChange = (termIndex, voteIndex, field, value) => {
    const voteChangeId = `term${termIndex}_ScoredVote_${voteIndex + 1}`;

    setHouseTermData((prev) => {
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
    setHouseTermData((prev) =>
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
    setHouseTermData((prev) => {
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

  // const handleActivityChange = (termIndex, activityIndex, field, value) => {
  //   // Construct the field name for change tracking
  //   const activityChangeId = `term${termIndex}_TrackedActivity_${
  //     activityIndex + 1
  //   }`;

  //   // Update local changes if not already tracked
  //   setLocalChanges((prev) =>
  //     prev.includes(activityChangeId) ? prev : [...prev, activityChangeId]
  //   );
  //   // const fieldName = `term${termIndex}_activitiesScore_${activityIndex}_${field}`;

  //   // setLocalChanges((prev) =>
  //   //   prev.includes(fieldName) ? prev : [...prev, fieldName]
  //   // );
  //   setHouseTermData((prev) =>
  //     prev.map((term, index) =>
  //       index === termIndex
  //         ? {
  //             ...term,
  //             activitiesScore: term.activitiesScore.map((activity, i) =>
  //               i === activityIndex ? { ...activity, [field]: value } : activity
  //             ),
  //           }
  //         : term
  //     )
  //   );
  // };

  const handleActivityChange = (termIndex, activityIndex, field, value) => {
    const activityChangeId = `term${termIndex}_TrackedActivity_${
      activityIndex + 1
    }`;

    setHouseTermData((prev) => {
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

  // Remove contentRefs for summary

  const handleEditorChange = useCallback((content, termIndex) => {
    const fieldName = `term${termIndex}_summary`; // Fixed field name for editor content

    // Track the change if not already tracked
    setLocalChanges((prev) =>
      prev.includes(fieldName) ? prev : [...prev, fieldName]
    );
  }, []);

  const handleBlur = useCallback((termIndex) => {
    // setHouseTermData((prev) =>
    //   prev.map((term, index) =>
    //     index === termIndex
    //       ? {
    //           ...term,
    //           summary: contentRefs.current[termIndex]?.content || "",
    //         }
    //       : term
    //   )
    // );
  }, []);

  // Add a new empty term
  const handleAddTerm = () => {
    setHouseTermData((prev) => [
      ...prev,
      {
        houseId: id,
        summary: "",
        rating: "",
        votesScore: [{ voteId: "", score: "" }],
        activitiesScore: [{ activityId: "", score: "" }],
        currentTerm: false,
        termId: null,
        editedFields: [], // Initialize empty
        fieldEditors: {}, // Initialize empty
        isNew: true, // Mark as new for tracking
      },
    ]);
  };

  // Remove a term
  const handleRemoveTerm = (termIndex) => {
    setHouseTermData((prev) => {
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
  //   setHouseTermData((prev) => prev.filter((_, index) => index !== termIndex));
  // };

  // const compareValues = (newVal, oldVal) => {
  //   if (typeof newVal === "string" && typeof oldVal === "string") {
  //     return newVal.trim() !== oldVal.trim();
  //   }
  //   return newVal !== oldVal;
  // };

  const compareValues = (newVal, oldVal) => {
    // Handle null/undefined cases
    if (newVal == null || oldVal == null) return newVal !== oldVal;

    // Handle booleans and other primitives directly
    if (typeof newVal !== "object") return newVal !== oldVal;

    // Handle arrays and objects
    return JSON.stringify(newVal) !== JSON.stringify(oldVal);
  };

  const termPreFill = () => {
    if (houseData?.currentHouse?.length > 0) {
      const termsData = houseData.currentHouse.map((term) => {
        const matchedTerm = terms?.find((t) => {
          // Case 1: term.termId is an object with name property
          if (
            term.termId &&
            typeof term.termId === "object" &&
            term.termId.name
          ) {
            return t.name === term.termId.name;
          }
          // Case 2: term.termId is a string (the term name)
          else if (typeof term.termId === "string") {
            return t.name === term.termId;
          }
          // Case 3: term.termId is an ObjectId - find by ID
          else if (
            term.termId &&
            mongoose.Types.ObjectId.isValid(term.termId)
          ) {
            return t._id.toString() === term.termId.toString();
          }
          // Case 4: No valid termId found
          return false;
        });
        // Transform votesScore with the same logic as house data
        let votesScore =
          Array.isArray(term.votesScore) && term.votesScore.length > 0
            ? term.votesScore.map((vote) => {
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
                  title: vote.voteId?.title || vote.title || "",
                  _id: vote._id || undefined,
                };
              })
            : [{ voteId: "", score: "" }]; // Changed from empty string to null

        // If all voteId are null or array is empty, add a blank row
        if (
          votesScore.length === 0 ||
          votesScore.every((v) => v.voteId == null)
        ) {
          votesScore = [{ voteId: "", score: "" }]; // Use null instead of empty string
        }

        return {
          _id: term._id,
          summary: term.summary || "",
          rating: term.rating || "",
          termId: matchedTerm?._id || "",
          currentTerm: term.currentTerm || false,
          editedFields: term.editedFields || [],
          fieldEditors: term.fieldEditors || {},
          isNew: false, // Mark as not new
          votesScore,

          activitiesScore:
            term.activitiesScore?.length > 0
              ? term.activitiesScore.map((activity) => ({
                  activityId:
                    activity.activityId?._id || activity.activityId || null,
                  score: activity.score || "",
                  title: activity.activityId?.title || activity.title || "",
                  _id: activity._id || undefined,
                }))
              : [{ activityId: "", score: "" }],
        };
      });

      setHouseTermData(termsData);
      setOriginalTermData(JSON.parse(JSON.stringify(termsData)));
    } else {
      const defaultTerm = [
        {
          houseId: id,
          summary: "",
          rating: "",
          votesScore: [{ voteId: "", score: "" }],
          activitiesScore: [{ activityId: "", score: "" }],
          currentTerm: false,
          termId: null,
          editedFields: [],
          fieldEditors: {},
          isNew: true, // Mark as new for tracking
        },
      ];

      setHouseTermData(defaultTerm);
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

  // Update your change tracking useEffect
  useEffect(() => {
    if (originalFormData && formData && originalTermData && houseTermData) {
      const changes = [];

      // Track house-level changes
      Object.keys(formData).forEach((key) => {
        if (key === "editedFields" || key === "fieldEditors") return;
        if (compareValues(formData[key], originalFormData[key])) {
          changes.push(key);
        }
      });

      // Track term-level changes
      houseTermData.forEach((term, termIndex) => {
        // For new terms, track all fields that have values
        if (term.isNew) {
          Object.keys(term).forEach((key) => {
            if (
              [
                "_id",
                "houseId",
                "editedFields",
                "fieldEditors",
                "isNew",
              ].includes(key)
            )
              return;

            if (key === "votesScore" || key === "activitiesScore") {
              if (
                term[key].some((item) =>
                  Object.values(item).some((val) => val !== "" && val !== null)
                )
              ) {
                changes.push(`term${termIndex}_${key}`);
              }
            } else if (
              term[key] !== "" &&
              term[key] !== null &&
              term[key] !== false
            ) {
              changes.push(`term${termIndex}_${key}`);
            }
          });
        } else {
          // Existing term logic
          const originalTerm = originalTermData[termIndex] || {};
          Object.keys(term).forEach((key) => {
            if (
              ["_id", "houseId", "editedFields", "fieldEditors"].includes(key)
            )
              return;

            if (key === "votesScore" || key === "activitiesScore") {
              const current = JSON.stringify(term[key]);
              const original = JSON.stringify(originalTerm[key] || []);
              if (current !== original) {
                changes.push(`term${termIndex}_${key}`);
              }
            } else if (compareValues(term[key], originalTerm[key])) {
              changes.push(`term${termIndex}_${key}`);
            }
          });
        }
      });

      // Use only local diffs for editedFields so reverting removes from list
      const backendEditedFields = Array.isArray(formData.editedFields)
        ? formData.editedFields
        : [];
      const mergedChanges = [...new Set([...backendEditedFields, ...changes])];

      setEditedFields(mergedChanges);
    }
  }, [formData, originalFormData, houseTermData, originalTermData]);

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  useEffect(() => {
    termPreFill();
  }, [id, houseData]);

  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const preFillForm = () => {
    if (house) {
      const newFormData = {
        name: house.name || "",
        district: house.district || "",
        party: house.party || "",
        photo: house.photo || null,
        status: house.status || "Active",
        publishStatus: house.publishStatus || "",
        editedFields: house.editedFields || [],
        fieldEditors: house.fieldEditors || {},
      };

      setFormData(newFormData);
      setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getHouseById(id));
      dispatch(getHouseDataByHouseId(id));
    }
    dispatch(getAllTerms());
    dispatch(getAllVotes());
    dispatch(getAllActivity());
    return () => {
      dispatch(clearHouseState());
      dispatch(clearHouseDataState());
    };
  }, [id, dispatch]);

  useEffect(() => {
    preFillForm();
  }, [house, terms]);

  // const handleChange = (event) => {
  //   const { name, value } = event.target;

  //   // Track the changed field
  //   if (!localChanges.includes(name)) {
  //     setLocalChanges((prev) => [...prev, name]);
  //   }
  //   setFormData((prev) => {
  //     const newData = { ...prev, [name]: value };

  //     // if (originalFormData) {
  //     //   const changes = Object.keys(newData).filter((key) =>
  //     //     compareValues(newData[key], originalFormData[key])
  //     //   );
  //     //   setEditedFields(changes);
  //     // }

  //     return newData;
  //   });
  // };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Compare with original data
      if (originalFormData) {
        const isActualChange = compareValues(value, originalFormData[name]);

        setLocalChanges((prevChanges) => {
          if (isActualChange && !prevChanges.includes(name)) {
            return [...prevChanges, name];
          } else if (!isActualChange && prevChanges.includes(name)) {
            return prevChanges.filter((field) => field !== name);
          }
          return prevChanges;
        });
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

 const handleSave = async (e) => {
  e.preventDefault();
  setLoading(true);

    // Helper: sanitize keys for MongoDB
    const sanitizeKey = (str) => {
      return str
        .replace(/[^a-zA-Z0-9_]/g, "_") // replace invalid chars
        .replace(/_+/g, "_") // collapse multiple underscores
        .replace(/^_+|_+$/g, ""); // remove leading/trailing underscores
    };

    try {
      // 1️⃣ Prevent duplicate termId selections
      const termIdCounts = houseTermData
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

      // 2️⃣ Only one current term
      const currentTerms = houseTermData.filter((term) => term.currentTerm);
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
        (formData?.fieldEditors &&
          Object.keys(formData.fieldEditors).length > 0);

      // 🚨 Prevent saving if no local changes of any kind
    if (userRole === "editor" && !hasLocalChanges) {
      setLoading(false);
      handleSnackbarOpen("No changes detected. Nothing to update.", "info");
      return;
    }
      // 3️⃣ Current editor info
      const decodedToken = jwtDecode(token);
      const currentEditor = {
        editorId: decodedToken.userId,
        editorName: localStorage.getItem("user") || "Unknown Editor",
        editedAt: new Date(),
      };

      // 4️⃣ Delete removed terms
      if (deletedTermIds.length > 0) {
        await Promise.all(
          deletedTermIds.map((id) => dispatch(deleteHouseData(id)).unwrap())
        );
        setDeletedTermIds([]);
      }

      // 5️⃣ Prepare existing editedFields
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
        } else {
          fieldKey = Array.isArray(field.field) ? field.field[0] : field;
        }
        existingFieldsMap.set(fieldKey, { ...field });
      });

      // 6️⃣ Process current votes & activities
      const processedChanges = [];
      // Helper function to check if a vote has changed
      const hasVoteChanged = (termIndex, voteIndex, vote) => {
        const originalTerm = originalTermData[termIndex] || {};
        const originalVote = originalTerm.votesScore?.[voteIndex] || {};

        // Check if voteId or score has changed
        return (
          vote.voteId !== originalVote.voteId ||
          vote.score !== originalVote.score
        );
      };

      // Helper function to check if an activity has changed
      const hasActivityChanged = (termIndex, activityIndex, activity) => {
        const originalTerm = originalTermData[termIndex] || {};
        const originalActivity =
          originalTerm.activitiesScore?.[activityIndex] || {};

        // Check if activityId or score has changed
        return (
          activity.activityId !== originalActivity.activityId ||
          activity.score !== originalActivity.score
        );
      };

      houseTermData.forEach((term, termIndex) => {
        // votesScore - only process changed votes
        term.votesScore.forEach((vote, voteIndex) => {
          if (vote.voteId && vote.voteId.toString().trim() !== "") {
            // Only add if this vote has actually changed
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

        // activitiesScore - only process changed activities
        term.activitiesScore.forEach((activity, activityIndex) => {
          if (
            activity.activityId &&
            activity.activityId.toString().trim() !== ""
          ) {
            // Only add if this activity has actually changed
            if (hasActivityChanged(termIndex, activityIndex, activity)) {
              const activityItem = houseActivities.find(
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
      });
      // 7️⃣ Process other local changes
      localChanges.forEach((change) => {
        if (
          !change.includes("votesScore_") &&
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

      // helper for deep equality check
      const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

      // helper: check if a value is meaningful (not empty/default)
      const hasNonDefaultValue = (field, value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (field === "currentTerm" && value === false) return false;
        return true;
      };

      // 8️⃣ Process term-level changes
      houseTermData.forEach((term, termIndex) => {
        const originalTerm = originalTermData?.[termIndex] || {};
        const termFields = ["summary", "rating", "currentTerm", "termId"];

        termFields.forEach((field) => {
          const newValue = term[field];
          const oldValue = originalTerm[field];

          // only log change if:
          // - value is actually different (deep compare), AND
          // - new value is non-default
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
      });

      // 9️⃣ Merge with existing fields
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

      const allChanges = Array.from(existingFieldsMap.values());
      // 10️⃣ Update fieldEditors safely
      const updatedFieldEditors = { ...(formData.fieldEditors || {}) };

      // Track which fields were actually changed in this session
      const changedFieldsInThisSession = new Set();

      // 1️⃣ Process localChanges to update only changed votes/activities/terms
      localChanges.forEach((change) => {
        let editorKey;

        // Handle votes: termX_ScoredVote_Y
        const voteMatch = change.match(/^term(\d+)_ScoredVote_(\d+)$/);
        if (voteMatch) {
          const [, termIndex, voteIndex] = voteMatch;
          const term = houseTermData[parseInt(termIndex)];
          const vote = term?.votesScore?.[parseInt(voteIndex)];
          if (vote && vote.voteId) {
            const voteItem = votes.find((v) => v._id === vote.voteId);
            if (voteItem && voteItem.title) {
              editorKey = `votesScore_${sanitizeKey(voteItem.title)}`;
              updatedFieldEditors[editorKey] = currentEditor;
              changedFieldsInThisSession.add(editorKey);

              console.log("✅ Updated vote editor:", editorKey, currentEditor);
            }
          }
          return; // skip further processing
        }

        // Handle activities: termX_TrackedActivity_Y
        const activityMatch = change.match(/^term(\d+)_TrackedActivity_(\d+)$/);
        if (activityMatch) {
          const [, termIndex, activityIndex] = activityMatch;
          const term = houseTermData[parseInt(termIndex)];
          const activity = term?.activitiesScore?.[parseInt(activityIndex)];
          if (activity && activity.activityId) {
            const activityItem = houseActivities.find(
              (a) => a._id === activity.activityId
            );
            if (activityItem && activityItem.title) {
              editorKey = `activitiesScore_${sanitizeKey(activityItem.title)}`;
              updatedFieldEditors[editorKey] = currentEditor;
              changedFieldsInThisSession.add(editorKey);

              console.log(
                "✅ Updated activity editor:",
                editorKey,
                currentEditor
              );
            }
          }
          return; // skip further processing
        }

        // Term-level or simple fields
        editorKey = change;
        updatedFieldEditors[editorKey] = currentEditor;
        changedFieldsInThisSession.add(editorKey);

        console.log("✅ Updated term/simple editor:", editorKey, currentEditor);
      });

      // 2️⃣ Optional: update processedChanges for other fields (non-votes/activities)
      processedChanges.forEach((change) => {
        if (!changedFieldsInThisSession.has(change.uniqueId)) {
          // preserve existing editor if any
          updatedFieldEditors[change.uniqueId] =
            updatedFieldEditors[change.uniqueId] || currentEditor;
        }
      });

      // ✅ Finally, updatedFieldEditors now contains only updated votes/activities

      // 11️⃣ Prepare representative update
      const representativeUpdate = {
        ...formData,
        editedFields: allChanges,
        fieldEditors: updatedFieldEditors, // Use the updated field editors
        publishStatus: userRole === "admin" ? "published" : "under review",
      };

      // Clear if publishing
      if (representativeUpdate.publishStatus === "published") {
        representativeUpdate.editedFields = [];
        representativeUpdate.fieldEditors = {};
      }

      // 12️⃣ Update representative
      if (id) {
        const formDataToSend = new FormData();
        Object.entries(representativeUpdate).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === "object" && !(value instanceof File)) {
              formDataToSend.append(key, JSON.stringify(value));
            } else {
              formDataToSend.append(key, value);
            }
          }
        });
        await dispatch(updateHouse({ id, formData: formDataToSend })).unwrap();
      }

      // 13️⃣ Update terms
      const termPromises = houseTermData.map((term, index) => {
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
          activitiesScore: cleanActivitiesScore,
          isNew: false,
          houseId: id,
          editedFields: termSpecificChanges,
          fieldEditors: updatedFieldEditors, // Use the updated field editors
        };
        return term._id
          ? dispatch(
              updateHouseData({ id: term._id, data: termUpdate })
            ).unwrap()
          : dispatch(createHouseData(termUpdate)).unwrap();
      });

    await Promise.all(termPromises);

      // 14️⃣ Reload data
      await dispatch(getHouseDataByHouseId(id)).unwrap();
      await dispatch(getHouseById(id)).unwrap();

      setOriginalFormData(JSON.parse(JSON.stringify(formData)));
      setOriginalTermData(JSON.parse(JSON.stringify(houseTermData)));
      setLocalChanges([]);

      userRole === "admin"
        ? handleSnackbarOpen("Changes Published successfully!", "success")
        : handleSnackbarOpen(
            'Status changed to "Under Review" for admin to moderate.',
            "info"
          );
    } catch (error) {
      console.error("Save failed:", error);
      handleSnackbarOpen(`Failed to save: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };
  // Helper function to get filtered votes based on selected term
  const getFilteredVotes = (termIndex) => {
    const term = houseTermData[termIndex];
    if (!term || !term.termId) return votes || [];

    const selectedTerm = terms.find((t) => t._id === term.termId);
    if (!selectedTerm || !selectedTerm.congresses) return votes || [];

    return (votes || []).filter(
      (vote) =>
        vote.type === "house_bill" &&
        selectedTerm.congresses.includes(Number(vote.congress))
    );
  };
  // Helper function to get filtered activities based on selected term
  const getFilteredActivities = (termIndex) => {
    const term = houseTermData[termIndex];
    if (!term || !term.termId) return houseActivities || [];

    const selectedTerm = terms.find((t) => t._id === term.termId);
    if (!selectedTerm || !selectedTerm.congresses) return houseActivities || [];

    return (houseActivities || []).filter((activity) =>
      selectedTerm.congresses.includes(Number(activity.congress))
    );
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

  // const handleStatusChange = (status) => {
  //   const fieldName = "status"; // The field being changed

  //   // Update local changes if not already tracked
  //   setLocalChanges((prev) =>
  //     prev.includes(fieldName) ? prev : [...prev, fieldName]
  //   );
  //   setFormData((prev) => ({ ...prev, status }));
  // };

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
            ? `${editedFields.length} pending changes`
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
            ? `Waiting approval for ${editedFields.length} changes`
            : "No changes pending review",
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
      // published: {
      //   backgroundColor: "rgba(76, 175, 80, 0.12)",
      //   borderColor: "#4CAF50",
      //   iconColor: "#2E7D32",
      //   icon: <CheckCircle sx={{ fontSize: "20px" }} />,
      //   title: "Published",
      //   description: "Published and live",
      //   titleColor: "#2E7D32",
      //   descColor: "#388E3C",
      // },
    };

    return configs[currentStatus];
  };

  const currentStatus =
    formData.publishStatus || (userRole === "admin" ? "published" : "");
  const statusData = getStatusConfig(
    Array.isArray(editedFields) ? editedFields : [],
    currentStatus
  );

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
      await dispatch(discardHouseChanges(id)).unwrap();
      navigate(0);
      await dispatch(getHouseById(id));
      await dispatch(getHouseDataByHouseId(id));
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
              // pb: 5,
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
              statusData &&
              (formData.publishStatus !== "published" ||
                localChanges.length > 0) && (
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
                    {/* Status icon bubble */}
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
                      {/* Header: title + pending count (admin only) */}
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
                              ? formData.editedFields.length
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
                                No pending changes
                              </Typography>
                            );
                          }

                          // Field name formatter function
                          const formatFieldName = (
                            field,
                            index,
                            houseTermData = []
                          ) => {
                            // console.log("Formatting field:", field);
                            // console.log("House Term Data:", houseTermData);

                            // Handle object format (editedFields entry from backend)
                            if (typeof field === "object" && field !== null) {
                              // Handle votesScore fields with bill title in name
                              if (
                                Array.isArray(field.field) &&
                                field.field[0] === "votesScore" &&
                                field.name
                              ) {
                                const billTitle = field.name;

                                // Search through all terms to find the matching vote by title
                                for (
                                  let termIndex = 0;
                                  termIndex < houseTermData.length;
                                  termIndex++
                                ) {
                                  const term = houseTermData[termIndex];
                                  const votesScore = term?.votesScore || [];

                                  for (
                                    let voteIndex = 0;
                                    voteIndex < votesScore.length;
                                    voteIndex++
                                  ) {
                                    const vote = votesScore[voteIndex];

                                    if (vote) {
                                      // Case 1: vote has title directly (your latest data)
                                      if (
                                        vote.title &&
                                        vote.title === billTitle
                                      ) {
                                        return `Term ${
                                          termIndex + 1
                                        }: Scored Vote ${voteIndex + 1}`;
                                      }

                                      // Case 2: voteId is object with title
                                      if (
                                        typeof vote.voteId === "object" &&
                                        vote.voteId.title === billTitle
                                      ) {
                                        return `Term ${
                                          termIndex + 1
                                        }: Scored Vote ${voteIndex + 1}`;
                                      }

                                      // Case 3: voteId is string, match with field._id
                                      if (
                                        typeof vote.voteId === "string" &&
                                        vote.voteId === field._id
                                      ) {
                                        return `Term ${
                                          termIndex + 1
                                        }: Scored Vote ${voteIndex + 1}`;
                                      }
                                    }
                                  }
                                }

                                // fallback if nothing matched
                                return null;
                              }
                              // Handle activitiesScore fields
                              if (
                                Array.isArray(field.field) &&
                                field.field[0] === "activitiesScore" &&
                                field.name
                              ) {
                                const activityTitle = field.name;

                                for (
                                  let termIndex = 0;
                                  termIndex < houseTermData.length;
                                  termIndex++
                                ) {
                                  const term = houseTermData[termIndex];
                                  const activitiesScore =
                                    term?.activitiesScore || [];

                                  for (
                                    let activityIndex = 0;
                                    activityIndex < activitiesScore.length;
                                    activityIndex++
                                  ) {
                                    const activity =
                                      activitiesScore[activityIndex];
                                    if (activity) {
                                      if (
                                        activity.title &&
                                        activity.title === activityTitle
                                      ) {
                                        return `Term ${
                                          termIndex + 1
                                        }: Tracked Activity ${
                                          activityIndex + 1
                                        }`;
                                      }
                                      if (
                                        typeof activity.activityId ===
                                          "object" &&
                                        activity.activityId.title ===
                                          activityTitle
                                      ) {
                                        return `Term ${
                                          termIndex + 1
                                        }: Tracked Activity ${
                                          activityIndex + 1
                                        }`;
                                      }
                                      if (
                                        typeof activity.activityId ===
                                          "string" &&
                                        activity.activityId === field._id
                                      ) {
                                        return `Term ${
                                          termIndex + 1
                                        }: Tracked Activity ${
                                          activityIndex + 1
                                        }`;
                                      }
                                    }
                                  }
                                }
                                return null;
                              }
                              // Handle regular term fields (term0_fieldName format)
                              const fieldId = Array.isArray(field.field)
                                ? field.field[0]
                                : field.field;

                              if (fieldId && fieldId.startsWith("term")) {
                                const termMatch =
                                  fieldId.match(/^term(\d+)_(.+)$/);
                                if (termMatch) {
                                  const [, termIndex, actualField] = termMatch;
                                  const termNumber = parseInt(termIndex) + 1;

                                  // Map field names to display names
                                  const fieldDisplayMap = {
                                    currentTerm: "Current Term",
                                    summary: "Term Summary",
                                    rating: "SBA Rating",
                                    termId: "Term",
                                    votesScore: "Scored Vote",
                                    activitiesScore: "Tracked Activity",
                                  };

                                  const displayName =
                                    fieldDisplayMap[actualField] || actualField;
                                  return `Term ${termNumber}: ${displayName}`;
                                }
                              }

                              // Handle simple fields
                              const simpleFieldMap = {
                                status: "Status",
                                name: "Representative Name",
                                district: "District",
                                party: "Party",
                                photo: "Photo",
                                votesScore: "Scored Vote", // Fallback for votesScore without name
                                activitiesScore: "Tracked Activity", // Fallback for activitiesScore without name
                              };

                              return (
                                field.name ||
                                simpleFieldMap[fieldId] ||
                                fieldId ||
                                "Unknown Field"
                              );
                            }

                            // Handle string field format (legacy keys like "term0_votesScore_0_score")
                            if (typeof field === "string") {
                              const termArrayMatch = field.match(
                                /^term(\d+)_(votesScore|activitiesScore)_(\d+)_(.+)$/
                              );

                              if (termArrayMatch) {
                                const [, termIdx, category, itemIdx] =
                                  termArrayMatch;
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

                              // Handle term fields like "term0_currentTerm", "term0_summary", etc.
                              if (field.startsWith("term")) {
                                const termMatch =
                                  field.match(/^term(\d+)_(.+)$/);
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

                                  const displayName =
                                    fieldDisplayMap[actualField] || actualField;
                                  return `Term ${termNumber}: ${displayName}`;
                                }

                                // Fallback for any other term field
                                const parts = field.split("_");
                                const termNumber =
                                  parseInt(parts[0].replace("term", "")) + 1;
                                const fieldKey = parts.slice(1).join("_");
                                return `Term ${termNumber}: ${fieldKey}`;
                              }

                              // Handle simple fields
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
                                    {backendChanges.map((field, index) => {
                                      const fieldLabel = formatFieldName(
                                        field,
                                        index,
                                        houseTermData
                                      );
                                      if (!fieldLabel) return null; // ⬅ skip rendering if no label
                                      const sanitizeKey = (str) => {
                                        return str
                                          .replace(/[^a-zA-Z0-9_]/g, "_") // replace invalid chars
                                          .replace(/_+/g, "_") // collapse multiple underscores
                                          .replace(/^_+|_+$/g, ""); // remove leading/trailing underscores
                                      };
                                      // Helper function to generate the correct editor key
                                      const getEditorKey = (field) => {
                                        if (
                                          typeof field === "object" &&
                                          field !== null
                                        ) {
                                          if (
                                            Array.isArray(field.field) &&
                                            field.field[0] === "votesScore" &&
                                            field.name
                                          ) {
                                            return `votesScore_${sanitizeKey(
                                              field.name
                                            )}`;
                                          }
                                          if (
                                            Array.isArray(field.field) &&
                                            field.field[0] ===
                                              "activitiesScore" &&
                                            field.name
                                          ) {
                                            return `activitiesScore_${sanitizeKey(
                                              field.name
                                            )}`;
                                          }
                                          if (Array.isArray(field.field)) {
                                            return field.field[0]; // For simple fields like ["status"]
                                          }
                                          return field.field; // For other fields
                                        }
                                        return field; // For string fields
                                      };

                                      const editorKey = getEditorKey(field);
                                      const editorInfo =
                                        formData?.fieldEditors?.[editorKey];
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
                                      const fromQuorum =
                                        field.fromQuorum || false;
                                      // console.log("Field fromQuorum:", field, fromQuorum);

                                      return (
                                        <ListItem
                                          key={`backend-${
                                            field.field || field
                                          }-${index}`}
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
                                                  {formatFieldName(
                                                    field,
                                                    index,
                                                    houseTermData
                                                  )}
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

                              {/* Local unsaved changes - now matches senator style */}
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
                                                {formatFieldName(
                                                  field,
                                                  index,
                                                  houseTermData
                                                )}
                                              </Typography>
                                            </Box>
                                          }
                                          // secondary={
                                          //   <Typography
                                          //     variant="caption"
                                          //     color="text.secondary"
                                          //   >
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
                  Representative's Information
                </Typography>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={2}
                  alignItems={"center"}
                  py={3}
                  px={9}
                >
                  <Grid size={isMobile ? 12 : 2} sx={{ minWidth: 165 }}>
                    <InputLabel className="nameLabel">
                      Representative's Name
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
                  <Grid size={isMobile ? 12 : 2} sx={{ minWidth: 165 }}>
                    <InputLabel className="label">District</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 4}>
                    <TextField
                      id="district"
                      name="district"
                      value={formData.district}
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

                  <Grid size={isMobile ? 12 : 2} sx={{ minWidth: 165 }}>
                    <InputLabel className="label">
                      Representative's Photo
                    </InputLabel>
                  </Grid>
                  <Grid size={8}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {formData.photo ? (
                        <img
                          src={
                            typeof formData.photo === "string"
                              ? formData.photo
                              : URL.createObjectURL(formData.photo)
                          }
                          alt="Representative's Photo"
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

            {/* Render each term in houseTermData */}
            {houseTermData.map((term, termIndex) => (
              <Paper key={termIndex} className="termData-paper">
                <Box sx={{ padding: 0 }}>
                  <Box className="termData-header">
                    <Typography fontSize={"1rem"} fontWeight={500}>
                      Representative's Term Information {termIndex + 1}
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
                          value={term.termId || ""}
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
                          {terms && terms.length > 0 ? (
                            terms
                              .filter(
                                (t) =>
                                  t.startYear &&
                                  t.endYear &&
                                  t.endYear - t.startYear === 1 &&
                                  t.startYear % 2 === 1 && // must be odd
                                  t.endYear % 2 === 0 && // must be even
                                  t.startYear >= 2015 && // no terms before 1789
                                  t.endYear >= 2015
                              ) // must be even
                              .filter(
                                (t) =>
                                  Array.isArray(t.congresses) &&
                                  t.congresses.length > 0
                              )
                              // Hide terms already selected in other term sections
                              .filter(
                                (t) =>
                                  !houseTermData.some(
                                    (ht, idx) =>
                                      idx !== termIndex && ht.termId === t._id
                                  )
                              )
                              .sort((a, b) => a.congresses[0] - b.congresses[0])
                              .map((t) => (
                                <MenuItem key={t._id} value={t._id}>
                                  {`${t.congresses[0]}th Congress`}
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
                    <Grid size={isMobile ? 12 : 9.05}>
                      <Editor
                        tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
                        licenseKey="gpl"
                        onInit={(_evt, editor) => (editorRef.current = editor)}
                        value={term.summary}
                        onEditorChange={(content) => {
                          setHouseTermData((prev) =>
                            prev.map((t, idx) =>
                              idx === termIndex ? { ...t, summary: content } : t
                            )
                          );
                          // Optionally update localChanges here too
                          const fieldName = `term${termIndex}_summary`;
                          const originalTerm =
                            originalTermData[termIndex] || {};
                          const isActualChange = compareValues(
                            content,
                            originalTerm.summary || ""
                          );
                          setLocalChanges((prev) => {
                            if (isActualChange && !prev.includes(fieldName)) {
                              return [...prev, fieldName];
                            } else if (
                              !isActualChange &&
                              prev.includes(fieldName)
                            ) {
                              return prev.filter((f) => f !== fieldName);
                            }
                            return prev;
                          });
                        }}
                        onBlur={() => {}}
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

                    {/* Vote Repeater Start */}
                    {term.votesScore.map((vote, voteIndex) =>
                      vote.voteId != null ? ( // Only render if voteId is not null
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
                                Scored Vote
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
                                    const selectedVote = getFilteredVotes(
                                      termIndex
                                    ).find((v) => v._id === selected);

                                    return (
                                      <Typography
                                        sx={{
                                          overflow: "hidden",
                                          whiteSpace: "nowrap",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {
                                          selectedVote?.title
                                          // || "Select a Bill"
                                        }
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
                                  {getFilteredVotes(termIndex).length > 0 ? (
                                    getFilteredVotes(termIndex).map(
                                      (voteItem) => (
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
                                      )
                                    )
                                  ) : (
                                    <MenuItem value="" disabled>
                                      {term.termId
                                        ? "No bills available for this congress"
                                        : "Select a term first"}
                                    </MenuItem>
                                  )}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={isMobile ? 12 : 1.6}>
                              <FormControl fullWidth>
                                <Select
                                  value={vote.score || ""}
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
                                  {/* <MenuItem value="None">None</MenuItem> */}
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
                      ) : null
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
                    {term.activitiesScore.map((activity, activityIndex) =>
                      activity.activityId != null ? (
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
                                Tracked Activity
                              </InputLabel>
                            </Grid>
                            <Grid size={isMobile ? 8 : 7.5}>
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
                                      getFilteredActivities(termIndex).find(
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
                                        {
                                          selectedActivity?.title
                                          //  ||"Select an Activity"
                                        }
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
                                  {getFilteredActivities(termIndex).length >
                                  0 ? (
                                    getFilteredActivities(termIndex).map(
                                      (activityItem) => (
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
                                            {activityItem.title}
                                          </Typography>
                                        </MenuItem>
                                      )
                                    )
                                  ) : (
                                    <MenuItem value="" disabled>
                                      {term.termId
                                        ? "No activities available for this congress"
                                        : "Select a term first"}
                                    </MenuItem>
                                  )}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={isMobile ? 6 : 1.6}>
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
                                  {/* <MenuItem value="None">None</MenuItem> */}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={1}>
                              <DeleteForeverIcon
                                onClick={() =>
                                  handleRemoveActivity(termIndex, activityIndex)
                                }
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : null
                    )}
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
                    snackbarMessage === "Changes Published successfully!"
                      ? "#daf4f0"
                      : undefined,
                  "& .MuiAlert-icon": {
                    color:
                      snackbarMessage === "Changes Published successfully!"
                        ? "#099885"
                        : undefined,
                  },
                  "& .MuiAlert-message": {
                    color:
                      snackbarMessage === "Changes Published successfully!"
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
