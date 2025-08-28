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
  Autocomplete
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
      return `${termPrefix.replace("term", "Term ")}: ${fieldLabels[actualField] || actualField
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

  const handleTermChange = (e, termIndex) => {
    const { name, value } = e.target;
    const fieldName = `term${termIndex}_${e.target.name}`;

    setHouseTermData((prev) => {
      const newTerms = prev.map((term, index) =>
        index === termIndex ? { ...term, [name]: value } : term
      );

      // Compare with original data
      const originalTerm = originalTermData[termIndex] || {};
      const isActualChange = compareValues(value, originalTerm[name]);

      if (isActualChange && !localChanges.includes(fieldName)) {
        setLocalChanges((prev) => [...prev, fieldName]);
      } else if (!isActualChange && localChanges.includes(fieldName)) {
        setLocalChanges((prev) => prev.filter(f => f !== fieldName));
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
        setLocalChanges((prev) => prev.filter(f => f !== fieldName));
      }

      return newTerms;
    });
  };



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

  const handleRemoveVote = (termIndex, voteIndex) => {
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
            ...term,
            votesScore: term.votesScore.filter((_, i) => i !== voteIndex),
          }
          : term
      )
    );
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
        setLocalChanges((prev) => prev.filter(f => f !== voteChangeId));
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
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
            ...term,
            activitiesScore: term.activitiesScore.filter(
              (_, i) => i !== activityIndex
            ),
          }
          : term
      )
    );
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
    const activityChangeId = `term${termIndex}_TrackedActivity_${activityIndex + 1}`;


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
      const originalActivity = originalTerm.activitiesScore?.[activityIndex] || {};
      const isActualChange = compareValues(value, originalActivity[field]);

      setLocalChanges((prevChanges) => {
        if (isActualChange && !prevChanges.includes(activityChangeId)) {
          return [...prevChanges, activityChangeId];
        } else if (!isActualChange && prevChanges.includes(activityChangeId)) {
          return prevChanges.filter(f => f !== activityChangeId);
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
        prevChanges.filter(
          change => !change.startsWith(`term${termIndex}_`)
        )
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
    if (typeof newVal !== 'object') return newVal !== oldVal;

    // Handle arrays and objects
    return JSON.stringify(newVal) !== JSON.stringify(oldVal);
  };

  const termPreFill = () => {
    if (houseData?.currentHouse?.length > 0) {
      const termsData = houseData.currentHouse.map((term) => {
        const matchedTerm = terms?.find((t) => {
          // Case 1: term.termId is an object with name property
          if (term.termId && typeof term.termId === "object" && term.termId.name) {
            return t.name === term.termId.name;
          }
          // Case 2: term.termId is a string (the term name)
          else if (typeof term.termId === "string") {
            return t.name === term.termId;
          }
          // Case 3: term.termId is an ObjectId - find by ID
          else if (term.termId && mongoose.Types.ObjectId.isValid(term.termId)) {
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
          // :
          //   term.votesScore?.length > 0
          //     ? term.votesScore.map((vote) => {
          //       let scoreValue = "";
          //       const dbScore = vote.score?.toLowerCase();

          //       if (dbScore?.includes("yea_votes")) {
          //         scoreValue = "Yes";
          //       } else if (dbScore?.includes("nay_votes")) {
          //         scoreValue = "No";
          //       } else if (dbScore?.includes("other_votes")) {
          //         scoreValue = "Neutral";
          //       } else {
          //         scoreValue = vote.score || "";
          //       }

          //       return {
          //         voteId: vote.voteId?._id || vote.voteId || null,
          //         score: scoreValue,
          //       };
          //     })
          //     : [{ voteId: "", score: "" }],
          activitiesScore:
            term.activitiesScore?.length > 0
              ? term.activitiesScore.map((activity) => ({
                activityId:
                  activity.activityId?._id || activity.activityId || null,
                score: activity.score || "",
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


    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Compare with original data
      if (originalFormData) {
        const isActualChange = compareValues(value, originalFormData[name]);

        setLocalChanges(prevChanges => {
          if (isActualChange && !prevChanges.includes(name)) {
            return [...prevChanges, name];
          } else if (!isActualChange && prevChanges.includes(name)) {
            return prevChanges.filter(field => field !== name);
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

    try {
      // Prevent duplicate termId selections before any API calls
      const termIdCounts = houseTermData
        .map(t => t.termId)
        .filter(Boolean)
        .reduce((acc, id) => {
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        }, {});

      const hasDuplicateTerms = Object.values(termIdCounts).some(count => count > 1);
      if (hasDuplicateTerms) {
        setLoading(false);
        handleSnackbarOpen("Duplicate term selected. Each term can only be added once.", "error");
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
          deletedTermIds.map((id) => dispatch(deleteHouseData(id)).unwrap())
        );
        setDeletedTermIds([]); // clear after delete
      }

      // Transform localChanges to track individual vote/activity edits
      const detailedChanges = localChanges.map(change => {
        // Handle votesScore changes (e.g. "term1_votesScore_0_voteId" or "term1_votesScore_0_score")
        const voteMatch = change.match(/^term(\d+)_votesScore_(\d+)_(.+)$/);
        if (voteMatch) {
          const [, termIdx, voteIdx] = voteMatch;
          return `term${termIdx}_votesScore_${voteIdx}`;
        }

        // Handle activitiesScore changes
        const activityMatch = change.match(/^term(\d+)_activitiesScore_(\d+)_(.+)$/);
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

      // const allChanges = [
      //   ...new Set([
      //     ...(Array.isArray(formData.editedFields)
      //       ? formData.editedFields
      //       : []),
      //     ...localChanges,
      //   ]),
      // ];

      // Update field editors with current changes
      // Update field editors with current changes
      const updatedFieldEditors = { ...(formData.fieldEditors || {}) };
      localChanges.forEach((field) => {
        // For senator-level fields
        if (field in formData) {
          if (compareValues(formData[field], originalFormData?.[field] || '')) {
            updatedFieldEditors[field] = currentEditor;
          }
        }
        // For term-level fields
        else if (field.startsWith('term')) {
          updatedFieldEditors[field] = currentEditor;
        }
      });

      // Prepare representative update
      const representativeUpdate = {
        ...formData,
        editedFields: allChanges,
        fieldEditors: updatedFieldEditors,
        publishStatus: userRole === "admin" ? "published" : "under review",
      };

      // Clear editedFields if publishing
      if (representativeUpdate.publishStatus === "published") {
        representativeUpdate.editedFields = [];
        representativeUpdate.fieldEditors = {};
      }

      // Update representative
      if (id) {
        const formData = new FormData();
        Object.entries(representativeUpdate).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === "object" && !(value instanceof File)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });

        await dispatch(updateHouse({ id, formData })).unwrap();
      }

      // Update terms
      const termPromises = houseTermData.map((term, index) => {
        // Clean votesScore - remove entries with empty/null voteId and transform empty strings
        const cleanVotesScore = term.votesScore
          .filter((vote) => vote.voteId && vote.voteId.toString().trim() !== "")
          .map((vote) => ({
            voteId: vote.voteId.toString().trim() === "" ? null : vote.voteId,
            score: vote.score,
          }));

        const transformedTrackedActivity = term.activitiesScore.map(activity => ({
          ...activity,
          activityId: activity.activityId === "" ? null : activity.activityId
        })).filter(activity => activity.activityId !== null);


        // Get changes specific to this term
        const termChanges = allChanges.filter(f => f.startsWith(`term${index}_`));

        const termUpdate = {
          ...term,
          votesScore: cleanVotesScore,
          activitiesScore: transformedTrackedActivity,
          isNew: false,
          houseId: id,
          editedFields: termChanges,
          fieldEditors: updatedFieldEditors,
        };

        return term._id
          ? dispatch(
            updateHouseData({ id: term._id, data: termUpdate })
          ).unwrap()
          : dispatch(createHouseData(termUpdate)).unwrap();
      });

      await Promise.all(termPromises);

      // Reload data
      await dispatch(getHouseDataByHouseId(id)).unwrap();
      await dispatch(getHouseById(id)).unwrap();

      // Update originals to match latest backend data
      // if (houseData?.currentHouse) {
      //   setOriginalTermData(JSON.parse(JSON.stringify(houseData.currentHouse)));
      // }
      // if (house) {
      //   setOriginalFormData(JSON.parse(JSON.stringify(house)));
      // }
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
          return prevChanges.filter(field => field !== fieldName);
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
        backgroundColor: "rgba(76, 175, 80, 0.12)",
        borderColor: "#4CAF50",
        iconColor: "#2E7D32",
        icon: <CheckCircle sx={{ fontSize: "20px" }} />,
        title: "Published",
        description:
          editedFields.length > 0
            ? `${editedFields.length} pending changes`
            : "Published and live",
        titleColor: "#2E7D32",
        descColor: "#388E3C",
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
      setSnackbarMessage(`Changes ${userRole === "admin" ? "Discard" : "Undo"} successfully`);
      setSnackbarSeverity("success");
      setComponentKey(prev => prev + 1);
    } catch (error) {
      console.error("Discard failed:", error);
      const errorMessage =
        error?.payload?.message ||
        error?.message ||
        (typeof error === "string" ? error : `Failed to ${userRole === "admin" ? "Discard" : "Undo"} changes`);
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
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress sx={{ color: "#CC9A3A !important" }} />
        </Box>
      )}
      <Box sx={{ display: "flex", bgcolor: '#f6f6f6ff', }}>
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
              mt: { xs: 8, md: 2 },
              gap: 1
            }}
          >
            {userRole &&
              formData.publishStatus &&
              statusData &&
              (formData.publishStatus !== "published" || localChanges.length > 0) && (
                <Box
                  sx={{
                    width: "98%",
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
                        backgroundColor: `rgba(${formData.publishStatus === "draft"
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

                        {userRole === "admin" && (
                          <Chip
                            label={`${Array.isArray(formData?.editedFields)
                              ? formData.editedFields.length
                              : 0
                              } pending changes`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
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
                          const formatFieldName = (field) => {
                            // Handle term array items
                            const termArrayMatch = field.match(
                              /^term(\d+)_(votesScore|activitiesScore)_(\d+)_(.+)$/
                            );
                            if (termArrayMatch) {
                              const [, termIdx, category] = termArrayMatch;
                              const termNumber = parseInt(termIdx) + 1;

                              if (category === "votesScore") {
                                return `Term ${termNumber}: Scored Vote`;
                              }
                              if (category === "activitiesScore") {
                                const itemIdx = termArrayMatch[3];
                                const itemNumber = parseInt(itemIdx) + 1;
                                return `Term ${termNumber}: Tracked Activity`;
                              }
                              return `Term ${termNumber}: ${fieldLabels[category] || category
                                }`;
                            }

                            // Handle regular term fields
                            if (field.startsWith("term")) {
                              const parts = field.split("_");
                              const termNumber =
                                parseInt(parts[0].replace("term", "")) + 1;
                              const fieldKey = parts.slice(1).join("_");
                              return `Term ${termNumber}: ${fieldLabels[fieldKey] || fieldKey
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
                                    Unsaved Changes
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
                sx={{
                  backgroundColor: "#173A5E !important",
                  color: "white !important",
                  padding: "0.5rem 1rem",
                  marginLeft: "0.5rem",
                  "&:hover": {
                    backgroundColor: "#1E4C80 !important",
                  },
                }}
              >
                {userRole === "admin" ? "Discard" : "Undo"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleSave}
                sx={{
                  backgroundColor: "#173A5E !important",
                  color: "white !important",
                  padding: "0.5rem 1rem",
                  marginLeft: "0.5rem",
                  "&:hover": {
                    backgroundColor: "#1E4C80 !important",
                  },
                }}
              >
                {userRole === "admin" ? "Publish" : "Save Changes"}
              </Button>
            </Stack>

            <Paper sx={{ width: "100%", bgcolor: "#fff", borderRadius: 0.8, border: '1px solid', borderColor: 'divider', }} >
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

              <Box sx={{ p: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
                  Representative's Information
                </Typography>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={2}
                  alignItems={"center"}
                >
                  <Grid size={isMobile ? 12 : 2} sx={{ minWidth: 165 }}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                        fontWeight: 700,
                        my: 0,
                        whiteSpace: "normal", // allow wrapping
                        overflowWrap: "break-word", // break long words
                        width: "100%", // take full width of grid cell
                      }}
                    >
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
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Status
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 4}>
                    <ButtonGroup
                      variant="outlined"
                      aria-label="Basic button group"
                      sx={{
                        "& .MuiButton-outlined": {
                          borderColor: "#4CAF50",
                          color: "#4CAF50",
                          "&:hover": {
                            backgroundColor: "rgba(76, 175, 80, 0.04)",
                            borderColor: "#4CAF50",
                          },
                        },
                      }}
                    >
                      <Button
                        variant={"outlined"}
                        onClick={() => handleStatusChange("Active")}
                        sx={{
                          backgroundColor:
                            formData.status === "Active"
                              ? "#4CAF50 !important"
                              : "transparent",
                          color:
                            formData.status === "Active"
                              ? "white !important"
                              : "#4CAF50",
                          borderColor: "#4CAF50 !important",
                          "&:hover": {
                            backgroundColor:
                              formData.status === "Active"
                                ? "#45a049 !important"
                                : "rgba(76, 175, 80, 0.1)",
                            borderColor: "#4CAF50 !important",
                          },
                        }}
                      >
                        Active
                      </Button>
                      <Button
                        variant={"outlined"}
                        onClick={() => handleStatusChange("Former")}
                        sx={{
                          backgroundColor:
                            formData.status === "Former"
                              ? "#4CAF50 !important"
                              : "transparent",
                          color:
                            formData.status === "Former"
                              ? "white !important"
                              : "#4CAF50",
                          borderColor: "#4CAF50 !important",
                          "&:hover": {
                            backgroundColor:
                              formData.status === "Former"
                                ? "#45a049 !important"
                                : "rgba(76, 175, 80, 0.1)",
                            borderColor: "#4CAF50 !important",
                          },
                        }}
                      >
                        Former
                      </Button>
                    </ButtonGroup>
                  </Grid>
                  <Grid size={isMobile ? 12 : 2} sx={{ minWidth: 165 }}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      District
                    </InputLabel>
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
                  <Grid size={isMobile ? 12 : 1} sx={{ alignContent: "center" }}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Party
                    </InputLabel>
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
                    <InputLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                        fontWeight: 700,
                        my: 0,
                        whiteSpace: "normal", // allow wrapping
                        overflowWrap: "break-word", // break long words
                        width: "100%",
                      }}
                    >
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
                        sx={{
                          backgroundColor: "#173A5E !important",
                          color: "white !important",
                          padding: "0.5rem 1rem",
                          marginLeft: "0.5rem",
                          "&:hover": {
                            backgroundColor: "#1E4C80 !important",
                          },
                        }}
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
              <Paper
                key={termIndex}

                sx={{
                  width: "100%",
                  marginBottom: "50px",
                  position: "relative",
                  bgcolor: "#fff",
                  borderRadius: 0.8,
                  border: '1px solid',
                  borderColor: 'divider'

                }}
              >
                <Box sx={{ padding: 5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 3,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
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
                  >
                    <Grid size={isMobile ? 12 : 2}>
                      <InputLabel
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: isMobile ? "flex-start" : "flex-end",
                          fontWeight: 700,
                          my: 0,
                        }}
                      >
                        Term
                      </InputLabel>
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
                              .filter((t) => t.startYear && t.endYear && (t.endYear - t.startYear === 1) &&
                                t.startYear % 2 === 1 && // must be odd
                                t.endYear % 2 === 0 && // must be even
                                t.startYear >= 2015 && // no terms before 1789
                                t.endYear >= 2015)     // must be even
                                  .filter((t) => Array.isArray(t.congresses) && t.congresses.length > 0)
                                  // Hide terms already selected in other term sections
                                  .filter((t) => !houseTermData.some((ht, idx) => idx !== termIndex && ht.termId === t._id))
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
                    {/* <Grid size={isMobile ? 12 : 2.2}>
  <FormControl fullWidth>
    <Autocomplete
      options={
        terms
          ? terms.filter(
              (t) => Array.isArray(t.congresses) && t.congresses.length === 1
            )
          : []
      }
      getOptionLabel={(t) =>
        t.congresses && t.congresses.length === 1
          ? `${ordinal(t.congresses[0])} Congress`
          : ""
      }
      value={
        terms.find((t) => t._id === term.termId) || null
      }
      onChange={(event, newValue) =>
        handleTermChange(
          { target: { name: "termId", value: newValue?._id || "" } },
          termIndex
        )
      }
      renderInput={(params) => (
        <TextField
          {...params}
          // label="Select an option"
          sx={{ background: "#fff" }}
        />
      )}
    />
  </FormControl>
</Grid> */}
                    <Grid size={isMobile ? 6 : 2.1} sx={{ alignContent: "center" }}>
                      <InputLabel
                        sx={{
                          display: "flex",
                          justifyContent: isMobile ? "flex-start" : "flex-end",
                          fontWeight: 700,
                          my: 0,
                        }}
                      >
                        Current Term
                      </InputLabel>
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
                      <InputLabel
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: isMobile ? "flex-start" : "flex-end",
                          fontWeight: 700,
                          my: 0,
                        }}
                      >
                        SBA Rating
                      </InputLabel>
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
                      <InputLabel
                        sx={{
                          display: "flex",
                          justifyContent: isMobile ? "flex-start" : "flex-end",
                          fontWeight: 700,
                          my: 0,
                        }}
                      >
                        Term Summary
                      </InputLabel>
                    </Grid>
                    <Grid size={isMobile ? 12 : 9.05}>
                      <Editor
                        tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
                        licenseKey="gpl"
                        onInit={(_evt, editor) => (editorRef.current = editor)}
                        value={term.summary}
                        onEditorChange={(content) => {
                          setHouseTermData(prev =>
                            prev.map((t, idx) =>
                              idx === termIndex ? { ...t, summary: content } : t
                            )
                          );
                          // Optionally update localChanges here too
                          const fieldName = `term${termIndex}_summary`;
                          const originalTerm = originalTermData[termIndex] || {};
                          const isActualChange = compareValues(content, originalTerm.summary || "");
                          setLocalChanges(prev => {
                            if (isActualChange && !prev.includes(fieldName)) {
                              return [...prev, fieldName];
                            } else if (!isActualChange && prev.includes(fieldName)) {
                              return prev.filter(f => f !== fieldName);
                            }
                            return prev;
                          });
                        }}
                        onBlur={() => { }}
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
                              <InputLabel
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "end",
                                  fontWeight: 700,
                                  my: 0,
                                }}
                              >
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
                                        {selectedVote?.title || "Select a Bill"}
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
                                  {votes && votes.length > 0 ? (
                                    votes.filter((vote) => vote.type === "house_bill").map((voteItem) => (
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
                                    ))
                                  ) : (
                                    <MenuItem value="" disabled>
                                      No bills available
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
                        sx={{
                          backgroundColor: "#173A5E !important",
                          color: "white !important",
                          padding: "0.5rem 1rem",
                          marginLeft: "0.5rem",
                          "&:hover": {
                            backgroundColor: "#1E4C80 !important",
                          },
                        }}
                        startIcon={<AddIcon />}
                        onClick={() => handleAddVote(termIndex)}
                      >
                        Add Vote
                      </Button>
                    </Grid>
                    <Grid size={1}></Grid>

                    {/* Activities Repeater Start */}
                    {term.activitiesScore.map((activity, activityIndex) => (
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
                              <InputLabel
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: isMobile ? "flex-start" : "flex-end",
                                  fontWeight: 700,
                                  my: 0,
                                }}
                              >
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
                                    const selectedActivity = houseActivities.find(
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
                                  {houseActivities &&
                                    houseActivities.length > 0 ? (
                                    houseActivities.map((activityItem) => (
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
                                    ))
                                  ) : (
                                    <MenuItem value="" disabled>
                                      No activities available
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
                    ))}
                    {/* Activities Repeater Ends */}

                    <Grid size={1}></Grid>
                    <Grid size={10} sx={{ textAlign: "right" }}>
                      <Button
                        variant="outlined"
                        sx={{
                          backgroundColor: "#173A5E !important",
                          color: "white !important",
                          padding: "0.5rem 1rem",
                          marginLeft: "0.5rem",
                          "&:hover": {
                            backgroundColor: "#1E4C80 !important",
                          },
                        }}
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
              sx={{
                alignSelf: "flex-start",
                backgroundColor: "#173A5E !important",
                color: "white !important",
                padding: "0.5rem 1rem",
                marginLeft: "0.5rem",
                "&:hover": {
                  backgroundColor: "#1E4C80 !important",
                },
              }}
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