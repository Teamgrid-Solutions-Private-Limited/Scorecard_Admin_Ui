import * as React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { alpha, styled } from "@mui/material/styles";
import SideMenu from "../components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import Grid from "@mui/material/Grid2";
import { Editor } from "@tinymce/tinymce-react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { rating } from "../Dashboard/global/common";
import { useParams, useNavigate } from "react-router-dom";
import HourglassTop from "@mui/icons-material/HourglassTop";
import { Drafts } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import {
  Autocomplete,
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Button,
  Switch,
} from "@mui/material";
import { getAllVotes } from "../redux/reducer/voteSlice";
import { getAllActivity } from "../redux/reducer/activitySlice";
import { discardHouseChanges } from "../redux/reducer/houseSlice";
import {
  clearHouseState,
  getHouseById,
  updateHouse,
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
import { deleteHouseData } from "../redux/reducer/houseTermSlice";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MobileHeader from "../components/MobileHeader";
import ActionButtons from "../components/ActionButtons";
import LoadingOverlay from "../components/LoadingOverlay";
import SnackbarComponent from "../components/SnackbarComponent";
import BasicInfo from "../components/BasicInfo";
import StatusDisplay from "../components/StatusDisplay";
import DialogBox from "../components/DialogBox";

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
  const [isDataFetching, setIsDataFetching] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectionError, setSelectionError] = useState({
    show: false,
    message: "",
    type: "",
  });

  const navigate = useNavigate();

  let houseActivities =
    activities?.filter((activity) => activity.type === "house") || [];

  const fieldLabels = {
    name: "Representative Name",
    status: "Status",
    district: "District",
    party: "Party",
    photo: "Photo",
    publishStatus: "Publish Status",
    houseId: "House ID",
    summary: "Term Summary",
    rating: "SBA Rating",
    votesScore: "Scored Vote",
    activitiesScore: "Tracked Activity",
    currentTerm: "Current Term",
    termId: "Term",
  };
  const getFieldDisplayName = (field) => {
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

  const handleTermChange = (e, termIndex) => {
    const { name, value } = e.target;
    const fieldName = `term${termIndex}_${name}`;

    setHouseTermData((prev) => {
      const newTerms = prev.map((term, index) => {
        if (index !== termIndex) return term;
        if (name === "termId" && value !== term.termId) {
          const newTermId = value;
          const selectedTerm = terms.find((t) => t._id === newTermId);
          const termCongresses = selectedTerm?.congresses || [];
          const termCongressStrings = termCongresses.map((c) => c.toString());
          const existingTermData = houseData?.currentHouse?.find(
            (ht) =>
              ht.termId &&
              (ht.termId._id === newTermId ||
                ht.termId === newTermId ||
                (typeof ht.termId === "object" &&
                  ht.termId.name === selectedTerm?.name))
          );

          let votesScore = [];
          let activitiesScore = [];
          let summary = "";
          let rating = "";
          let currentTerm = false;

          if (existingTermData) {
            votesScore =
              existingTermData.votesScore?.map((vote) => ({
                voteId: vote.voteId?._id || vote.voteId || "",
                score: vote.score || "",
              })) || [];

            activitiesScore =
              existingTermData.activitiesScore?.map((activity) => ({
                activityId:
                  activity.activityId?._id || activity.activityId || "",
                score: activity.score || "",
              })) || [];

            summary = existingTermData.summary || "";
            rating = existingTermData.rating || "";
            currentTerm =
              existingTermData.currentTerm !== undefined
                ? existingTermData.currentTerm
                : false;
          } else {
            votesScore = term.votesScore.filter((vote) => {
              if (!vote.voteId || vote.voteId === "") return true;

              const voteItem = votes.find((v) => v._id === vote.voteId);
              if (!voteItem) return false;

              return termCongressStrings.includes(voteItem.congress);
            });

            activitiesScore = term.activitiesScore.filter((activity) => {
              if (!activity.activityId || activity.activityId === "")
                return true;

              const activityItem = houseActivities.find(
                (a) => a._id === activity.activityId
              );
              if (!activityItem) return false;

              return termCongressStrings.includes(activityItem.congress);
            });

            summary = "";
            rating = "";
            currentTerm = false;
          }

          const finalVotesScore =
            votesScore.length > 0 ? votesScore : [{ voteId: "", score: "" }];

          const finalActivitiesScore =
            activitiesScore.length > 0
              ? activitiesScore
              : [{ activityId: "", score: "" }];

          return {
            ...term,
            [name]: value,
            votesScore: finalVotesScore,
            activitiesScore: finalActivitiesScore,
            summary,
            rating,
            currentTerm,
          };
        }

        return { ...term, [name]: value };
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

    setHouseTermData((prev) => {
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
    setHouseTermData((prev) => {
      const updatedTerms = prev.map((term, index) =>
        index === termIndex
          ? {
            ...term,
            votesScore: term.votesScore.filter((_, i) => i !== voteIndex),
          }
          : term
      );

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
    const activityChangeId = `term${termIndex}_TrackedActivity_${activityIndex + 1
      }`;

    setHouseTermData((prev) => {
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
        editedFields: [],
        fieldEditors: {},
        isNew: true,
      },
    ]);
    
  };

const handleRemoveTerm = (termIndex) => {
  setHouseTermData((prev) => {
    const removed = prev[termIndex];
    const removalId = `Term_${termIndex + 1} Removed`;
        if (!removed.isNew) {
      if (removed && removed._id) {
        setDeletedTermIds((ids) => [...ids, removed._id]);
        if (!localChanges.includes(removalId)) {
          setLocalChanges((prev) => [...prev, removalId]);
        }
      } else {
        if (!localChanges.includes(removalId)) {
          setLocalChanges((prev) => [...prev, removalId]);
        }
      }
    }
    
    setLocalChanges((prevChanges) =>
      prevChanges.filter((change) => !change.startsWith(`term${termIndex}_`))
    );
    
    return prev.filter((_, index) => index !== termIndex);
  });
};

  const compareValues = (newVal, oldVal) => {
    if (newVal == null || oldVal == null) return newVal !== oldVal;
    if (typeof newVal !== "object") return newVal !== oldVal;
    return JSON.stringify(newVal) !== JSON.stringify(oldVal);
  };

  const termPreFill = () => {
    if (houseData?.currentHouse?.length > 0) {

      const termsData = houseData.currentHouse.map((term) => {
        const matchedTerm = terms?.find((t) => {
          if (
            term.termId &&
            typeof term.termId === "object" &&
            term.termId.name
          ) {
            return t.name === term.termId.name;
          }
          else if (typeof term.termId === "string") {
            return t.name === term.termId;
          }
          else if (
            term.termId &&
            mongoose.Types.ObjectId.isValid(term.termId)
          ) {
            return t._id.toString() === term.termId.toString();
          }
          return false;
        });
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
            : [{ voteId: "", score: "" }];


        if (
          votesScore.length === 0 ||
          votesScore.every((v) => v.voteId == null)
        ) {
          votesScore = [{ voteId: "", score: "" }];
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
          isNew: true,
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


  useEffect(() => {
    if (originalFormData && formData && originalTermData && houseTermData) {
      const changes = [];

      Object.keys(formData).forEach((key) => {
        if (key === "editedFields" || key === "fieldEditors") return;
        if (compareValues(formData[key], originalFormData[key])) {
          changes.push(key);
        }
      });


      houseTermData.forEach((term, termIndex) => {
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
    if (!isDataFetching && id && houseData) {
      termPreFill();
    }
  }, [id, houseData, isDataFetching]);

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
    const fetchData = async () => {
      setIsDataFetching(true);
      try {
        if (id) {
          await Promise.all([
            dispatch(getHouseById(id)),
            dispatch(getHouseDataByHouseId(id)),
          ]);
        }
        await Promise.all([
          dispatch(getAllTerms()),
          dispatch(getAllVotes()),
          dispatch(getAllActivity()),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbarMessage("Error loading data. Please try again.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setIsDataFetching(false);
      }
    };

    fetchData();

    return () => {
      dispatch(clearHouseState());
      dispatch(clearHouseDataState());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (!isDataFetching && house) {
      preFillForm();
    }
  }, [house, terms, isDataFetching]);



  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
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
    const fieldName = "Photo";

    if (!localChanges.includes(fieldName)) {
      setLocalChanges((prev) => [...prev, fieldName]);
    }
    setFormData((prev) => ({ ...prev, photo: file }));
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
      const hasSelectedTerms = houseTermData.some(
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
          deletedTermIds.map((id) => dispatch(deleteHouseData(id)).unwrap())
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

      houseTermData.forEach((term, termIndex) => {
        term.votesScore.forEach((vote, voteIndex) => {
          if (vote.voteId && vote.voteId.toString().trim() !== "") {
            if (hasVoteChanged(termIndex, voteIndex, vote)) {
              const voteItem = votes.find((v) => v._id === vote.voteId);
              if (voteItem) {
                const uniqueId = `votesScore_${sanitizeKey(voteItem.title)}`;
                processedChanges.push({
                  uniqueId,
                  displayName: `Term ${termIndex + 1}: Scored Vote ${voteIndex + 1
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
              const activityItem = houseActivities.find(
                (a) => a._id === activity.activityId
              );
              if (activityItem) {
                const uniqueId = `activitiesScore_${sanitizeKey(
                  activityItem.title
                )}`;
                processedChanges.push({
                  uniqueId,
                  displayName: `Term ${termIndex + 1}: Tracked Activity ${activityIndex + 1
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

      const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
      const hasNonDefaultValue = (field, value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (field === "currentTerm" && value === false) return false;
        return true;
      };

      houseTermData.forEach((term, termIndex) => {
        const originalTerm = originalTermData?.[termIndex] || {};
        const termFields = ["summary", "rating", "currentTerm", "termId"];

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
              displayName: `Term ${termIndex + 1}: ${fieldLabels[field] || field
                }`,
              field: [fieldName],
              name: `Term ${termIndex + 1}: ${fieldLabels[field] || field}`,
            });
          }
        });
      });
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
      const updatedFieldEditors = { ...(formData.fieldEditors || {}) };
      const changedFieldsInThisSession = new Set();

      localChanges.forEach((change) => {
        let editorKey;

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
            }
          }
          return;
        }

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
            }
          }
          return;
        }

        editorKey = change;
        updatedFieldEditors[editorKey] = currentEditor;
        changedFieldsInThisSession.add(editorKey);
      });


      processedChanges.forEach((change) => {
        if (!changedFieldsInThisSession.has(change.uniqueId)) {
          updatedFieldEditors[change.uniqueId] =
            updatedFieldEditors[change.uniqueId] || currentEditor;
        }
      });


      const representativeUpdate = {
        ...formData,
        editedFields: allChanges,
        fieldEditors: updatedFieldEditors, 
        publishStatus: userRole === "admin" ? "published" : "under review",
      };

      if (representativeUpdate.publishStatus === "published") {
        representativeUpdate.editedFields = [];
        representativeUpdate.fieldEditors = {};
      }

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
          fieldEditors: updatedFieldEditors,
        };
        return term._id
          ? dispatch(
            updateHouseData({ id: term._id, data: termUpdate })
          ).unwrap()
          : dispatch(createHouseData(termUpdate)).unwrap();
      });

      await Promise.all(termPromises);

      await dispatch(getHouseDataByHouseId(id)).unwrap();
      await dispatch(getHouseById(id)).unwrap();

      setOriginalFormData(JSON.parse(JSON.stringify(formData)));
      setOriginalTermData(JSON.parse(JSON.stringify(houseTermData)));
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
      handleSnackbarOpen(`Failed to save: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVotes = (termIndex) => {
    const term = houseTermData[termIndex];
    if (!term || !term.termId) return votes || [];

    const selectedTerm = terms.find((t) => t._id === term.termId);
    if (!selectedTerm || !selectedTerm.congresses) return votes || [];
  

    return (votes || []).filter(
      (vote) =>
        vote.type?.toLowerCase().includes("house") &&
        selectedTerm.congresses.includes(Number(vote.congress))
    );
  };
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
        error?.error ||
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
      <LoadingOverlay loading={loading || isDataFetching} />
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
          className={`${isDataFetching ? "fetching" : "notFetching"}`}
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
            <StatusDisplay
              userRole={userRole}
              formData={formData}
              localChanges={localChanges}
              statusData={statusData}
              termData={houseTermData}
              mode="representative"
            />

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
                mode="representative"
              />
            </Paper>

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
                    <Grid size={isMobile ? 4 : 2}>
                      <InputLabel className="label">Term</InputLabel>
                    </Grid>
                    <Grid size={isMobile ? 6 : 2.2}>
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
                                  t.startYear % 2 === 1 &&
                                  t.endYear % 2 === 0 &&
                                  t.startYear >= 2015 &&
                                  t.endYear >= 2015
                              )
                              .filter(
                                (t) =>
                                  Array.isArray(t.congresses) &&
                                  t.congresses.length > 0
                              )
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
                    <Grid size={isMobile ? 4 : 2.2}>
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
                    <Grid className="textField" size={isMobile ? 11 : 9.05}>
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

                    {term.votesScore.map((vote, voteIndex) =>
                      vote.voteId != null ? (
                        <Grid
                          rowSpacing={2}
                          sx={{ width: "100%" }}
                          key={voteIndex}
                        >
                          <Grid
                            size={12}
                            display="flex"
                            flexDirection={isMobile ? "column" : "row"}
                            gap={isMobile ? 1 : 0}
                            alignItems={isMobile ? "flex-start" : "center"}
                            columnGap={"15px"}
                          >
                            <Grid size={isMobile ? 12 : 2}>
                              <InputLabel className="label">
                                Scored Vote {voteIndex + 1}
                              </InputLabel>
                            </Grid>
                            <Grid size={isMobile ? 11 : 7.5}>
                              <Autocomplete
                                className="textField"
                                options={getFilteredVotes(termIndex)}
                                getOptionLabel={(option) => option.title || ""}
                                value={
                                  getFilteredVotes(termIndex).find(
                                    (v) => v._id === vote.voteId
                                  ) || null
                                }
                                onChange={(e, newValue) =>
                                  handleVoteChange(
                                    termIndex,
                                    voteIndex,
                                    "voteId",
                                    newValue?._id || ""
                                  )
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Search bills..."
                                    size="small"
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        background: "#fff",
                                        cursor: "pointer",
                                        "& input": {
                                          cursor: "pointer",
                                        },
                                        "& fieldset": {
                                          border: "none",
                                        },
                                      },
                                    }}
                                  />
                                )}
                                noOptionsText={
                                  term.termId
                                    ? "No bills available for this congress"
                                    : "Select a term first"
                                }
                              />
                            </Grid>
                            <Grid size={isMobile ? 5 : 1.6}>
                              <FormControl fullWidth className="textField">
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
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid size={1}>
                              <DeleteForeverIcon
                                className="paddingLeft"
                                onClick={() =>
                                  handleRemoveVote(termIndex, voteIndex)
                                }
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : null
                    )}

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
                    <Grid size={1}></Grid>

                    {term.activitiesScore.map((activity, activityIndex) =>
                      activity.activityId != null ? (
                        <Grid
                          rowSpacing={2}
                          sx={{ width: "100%" }}
                          key={activityIndex}
                        >
                          <Grid
                            size={12}
                            display="flex"
                            flexDirection={isMobile ? "column" : "row"}
                            gap={isMobile ? 1 : 0}
                            alignItems={isMobile ? "flex-start" : "center"}
                            columnGap={"15px"}
                          >
                            <Grid size={isMobile ? 12 : 2}>
                              <InputLabel className="label">
                                Tracked Activity {activityIndex + 1}
                              </InputLabel>
                            </Grid>
                            <Grid size={isMobile ? 11 : 7.5}>
                              <Autocomplete
                                className="textField"
                                value={
                                  getFilteredActivities(termIndex).find(
                                    (a) => a._id === activity.activityId
                                  ) || null
                                }
                                onChange={(event, newValue) =>
                                  handleActivityChange(
                                    termIndex,
                                    activityIndex,
                                    "activityId",
                                    newValue ? newValue._id : ""
                                  )
                                }
                                options={getFilteredActivities(termIndex)}
                                getOptionLabel={(option) => option.title || ""}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Search activities..."
                                    size="small"
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        background: "#fff",
                                        cursor: "pointer",
                                        "& input": {
                                          cursor: "pointer",
                                        },
                                        "& fieldset": {
                                          border: "none",
                                        },
                                      },
                                    }}
                                  />
                                )}
                                isOptionEqualToValue={(option, value) =>
                                  option._id === value._id
                                }
                                noOptionsText={
                                  term.termId
                                    ? "No activities available for this congress"
                                    : "Select a term first"
                                }
                              />
                            </Grid>
                            <Grid size={isMobile ? 5 : 1.6}>
                              <FormControl fullWidth className="paddingLeft">
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
                                className="paddingLeft"
                                onClick={() =>
                                  handleRemoveActivity(termIndex, activityIndex)
                                }
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      ) : null
                    )}
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
