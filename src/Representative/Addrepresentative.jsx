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
import { useParams } from "react-router-dom";
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
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
  getAllVotes,
} from "../redux/reducer/voteSlice";
import { getAllActivity } from "../redux/reducer/activitySlice";
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
    votesScore: "Voted Bills",
    activitiesScore: "Tracked Activities",
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
    publishStatus: "draft",
  });

  const [houseTermData, setHouseTermData] = useState([
    {
      houseId: id,
      summary: "",
      rating: "",
      votesScore: [{ voteId: null, score: "" }],
      activitiesScore: [{ activityId: null, score: "" }],
      currentTerm: false,
      termId: null,
    },
  ]);

  const handleTermChange = (e, termIndex) => {

    const fieldName = `term${termIndex}_${e.target.name}`;
    if (!localChanges.includes(fieldName)) {
      setLocalChanges((prev) => [...prev, fieldName]);
    }
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? { ...term, [e.target.name]: e.target.value }
          : term
      )
    );
  };

  const handleSwitchChange = (e, termIndex) => {
    const fieldName = `term${termIndex}_${e.target.name}`;
    if (!localChanges.includes(fieldName)) {
      setLocalChanges((prev) => [...prev, fieldName]);
    }
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? { ...term, [e.target.name]: e.target.checked }
          : term
      )
    );
  };

  const handleAddVote = (termIndex) => {
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
            ...term,
            votesScore: [...term.votesScore, { voteId: " ", score: "" }],
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

  const handleVoteChange = (termIndex, voteIndex, field, value) => {

    // Construct the field name for change tracking
    const fieldName = `term${termIndex}_votesScore_${voteIndex}_${field}`;

    // Update local changes if not already tracked
    setLocalChanges((prev) =>
      prev.includes(fieldName) ? prev : [...prev, fieldName]
    );
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
            ...term,
            votesScore: term.votesScore.map((vote, i) =>
              i === voteIndex ? { ...vote, [field]: value } : vote
            ),
          }
          : term
      )
    );
  };

  const handleAddActivity = (termIndex) => {
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
            ...term,
            activitiesScore: [
              ...term.activitiesScore,
              { activityId: null, score: "" },
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

  const handleActivityChange = (termIndex, activityIndex, field, value) => {

    // Construct the field name for change tracking
    const fieldName = `term${termIndex}_activitiesScore_${activityIndex}_${field}`;

    // Update local changes if not already tracked
    setLocalChanges((prev) =>
      prev.includes(fieldName) ? prev : [...prev, fieldName]
    );
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
            ...term,
            activitiesScore: term.activitiesScore.map((activity, i) =>
              i === activityIndex ? { ...activity, [field]: value } : activity
            ),
          }
          : term
      )
    );
  };

  const contentRefs = useRef([]);

  const handleEditorChange = useCallback((content, termIndex) => {
     const fieldName = `term${termIndex}_summary`; // Fixed field name for editor content

    // Track the change if not already tracked
    setLocalChanges((prev) => 
      prev.includes(fieldName) ? prev : [...prev, fieldName]
    );
    if (!contentRefs.current[termIndex]) {
      contentRefs.current[termIndex] = {};
    }
    contentRefs.current[termIndex].content = content;
  }, []);

  const handleBlur = useCallback((termIndex) => {
    setHouseTermData((prev) =>
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
    setHouseTermData((prev) => [
      ...prev,
      {
        houseId: id,
        summary: "",
        rating: "",
        votesScore: [{ voteId: null, score: "" }],
        activitiesScore: [{ activityId: null, score: "" }],
        currentTerm: false,
        termId: null,
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
      return prev.filter((_, index) => index !== termIndex);
    });
  };
  // const handleRemoveTerm = (termIndex) => {
  //   setHouseTermData((prev) => prev.filter((_, index) => index !== termIndex));
  // };

  const compareValues = (newVal, oldVal) => {
    if (typeof newVal === "string" && typeof oldVal === "string") {
      return newVal.trim() !== oldVal.trim();
    }
    return newVal !== oldVal;
  };

  const termPreFill = () => {
    if (houseData?.currentHouse?.length > 0) {
      const termsData = houseData.currentHouse.map((term) => {
        const matchedTerm = terms?.find((t) => t.name === term.termId?.name);

        return {
          _id: term._id,
          summary: term.summary || "",
          rating: term.rating || "",
          termId: matchedTerm?._id || "",
          currentTerm: term.currentTerm || false,
          editedFields: term.editedFields || [],
          fieldEditors: term.fieldEditors || {},
          votesScore:
            term.votesScore?.length > 0
              ? term.votesScore.map((vote) => {
                let scoreValue = "";
                const dbScore = vote.score?.toLowerCase();

                if (dbScore?.includes("yea_votes")) {
                  scoreValue = "Yes";
                } else if (dbScore?.includes("nay_votes")) {
                  scoreValue = "No";
                } else if (dbScore?.includes("other_votes")) {
                  scoreValue = "Neutral";
                } else {
                  scoreValue = vote.score || "";
                }

                return {
                  voteId: vote.voteId?._id || vote.voteId || null,
                  score: scoreValue,
                };
              })
              : [{ voteId: null, score: "" }],
          activitiesScore:
            term.activitiesScore?.length > 0
              ? term.activitiesScore.map((activity) => ({
                activityId:
                  activity.activityId?._id || activity.activityId || null,
                score: activity.score || "",
              }))
              : [{ activityId: null, score: "" }],
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
          votesScore: [{ voteId: null, score: "" }],
          activitiesScore: [{ activityId: null, score: "" }],
          currentTerm: false,
          termId: null,
          editedFields: [],
          fieldEditors: {},
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

      // Track representative-level changes
      Object.keys(formData).forEach((key) => {
        if (key === "editedFields" || key === "fieldEditors") return;
        if (compareValues(formData[key], originalFormData[key])) {
          changes.push(key);
        }
      });

      // Track term-level changes
      houseTermData.forEach((term, termIndex) => {
        const originalTerm = originalTermData[termIndex] || {};

        Object.keys(term).forEach((key) => {
          // Skip internal and tracking fields
          if (["_id", "houseId", "editedFields", "fieldEditors"].includes(key))
            return;

          // Handle array fields
          if (key === "votesScore" || key === "activitiesScore") {
            const current = JSON.stringify(term[key]);
            const original = JSON.stringify(originalTerm[key] || []);
            if (current !== original) {
              changes.push(`term${termIndex}_${key}`);
            }
          }
          // Handle regular fields
          else if (compareValues(term[key], originalTerm[key])) {
            changes.push(`term${termIndex}_${key}`);
          }
        });
      });

      // Merge with any existing editedFields from backend
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
        publishStatus: house.publishStatus || "draft",
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Track the changed field
    if (!localChanges.includes(name)) {
      setLocalChanges((prev) => [...prev, name]);
    }
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // if (originalFormData) {
      //   const changes = Object.keys(newData).filter((key) =>
      //     compareValues(newData[key], originalFormData[key])
      //   );
      //   setEditedFields(changes);
      // }

      return newData;
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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

       const allChanges = [
        ...new Set([
          ...(Array.isArray(formData.editedFields)
            ? formData.editedFields
            : []),
          ...localChanges,
        ]),
      ];

      // Update field editors with current changes
      const updatedFieldEditors = { ...(formData.fieldEditors || {}) };
      editedFields.forEach((field) => {
        updatedFieldEditors[field] = currentEditor;
      });

      // Prepare representative update
      const representativeUpdate = {
        ...formData,
        editedFields,
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
        const termUpdate = {
          ...term,
          houseId: id,
          editedFields: editedFields.filter((f) =>
            f.startsWith(`term${index}_`)
          ),
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
       setLocalChanges([]);
       await dispatch(getHouseById(id)).unwrap();
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

  const handleStatusChange = (status) => {

    const fieldName = "status"; // The field being changed

    // Update local changes if not already tracked
    setLocalChanges((prev) =>
      prev.includes(fieldName) ? prev : [...prev, fieldName]
    );
    setFormData((prev) => ({ ...prev, status }));
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
        description: "Published and live",
        titleColor: "#2E7D32",
        descColor: "#388E3C",
      },
    };

    return configs[currentStatus] || configs.draft;
  };

  const currentStatus =
    formData.publishStatus || (userRole === "admin" ? "published" : "");
  const statusData = getStatusConfig(
    Array.isArray(editedFields) ? editedFields : [],
    currentStatus
  );

  return (
    <AppTheme>
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
      <Box sx={{ display: "flex" }}>
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

          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 2,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            {userRole && formData.publishStatus !== "published" && (
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
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
      {/* Status icon bubble */}
      <Box
        sx={{
          p: 1,
          borderRadius: "50%",
          backgroundColor: `rgba(${
            formData.publishStatus === "draft"
              ? "66, 165, 245"
              : formData.publishStatus === "under review"
              ? "255, 193, 7"
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
                          label={`${
                            (Array.isArray(formData?.editedFields)
                              ? formData.editedFields.length
                              : 0) + localChanges.length
                          } pending changes`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                      {(() => {
                        const backendChanges = Array.isArray(
                          formData?.editedFields
                        )
                          ? formData.editedFields
                          : [];
                        const hasChanges =
                          backendChanges.length > 0 || localChanges.length > 0;

                        if (!hasChanges) {
                          return (
                            <Typography
                              variant="body2"
                              sx={{
                                fontStyle: "italic",
                                color: "text.disabled",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <HourglassEmpty sx={{ fontSize: 16 }} />
                              No recent changes
                            </Typography>
                          );
                        }

                        return (
                          <Box
                            sx={{
                              backgroundColor: "background.paper",
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
                              Pending Changes
                            </Typography>

                            <List dense sx={{ py: 0 }}>
                              {backendChanges.map((field) => {
                                const parts = field.split("_");
                                const isTermField = field.startsWith("term");
                                const editorInfo =
                                  formData?.fieldEditors?.[field];
                                const editor = editorInfo?.editorName || "Unknown Editor";
                                const editTime = editorInfo?.editedAt
                                  ? new Date(
                                      editorInfo.editedAt
                                    ).toLocaleString("en-GB", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      day: "2-digit",
                                      month: "short",
                                    })
                                  : "unknown time";

                                return (
                                  <ListItem key={field} sx={{ py: 0.5, px: 1 }}>
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
                                            {isTermField
                                              ? `Term ${+parts[0].replace(
                                                "term",
                                                ""
                                              ) + 1
                                              } • ${parts[1]
                                                ?.charAt(0)
                                                .toUpperCase() +
                                              parts[1]?.slice(1)
                                              }`
                                              : field.charAt(0).toUpperCase() +
                                              field.slice(1)}
                                          </Typography>
                                        </Box>
                                      }
                                      secondary={
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Edited by {editor} on {editTime}
                                        </Typography>
                                      }
                                      sx={{ my: 0 }}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          </Box>
                        );
                      })()}
                    </Box>

                    {/* Unsaved (local) changes chips */}
                    {(userRole === "admin" || userRole === "editor") &&
                      Array.isArray(editedFields) &&
                      localChanges.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="overline"
                            sx={{ color: "text.secondary" }}
                          >
                            Your Unsaved Changes
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mt: 1,
                              p: 1,
                              backgroundColor: "action.hover",
                              borderRadius: 1,
                            }}
                          >
                            {localChanges.map((field) => {
                              const parts = field.split("_");
                              const isTermField = field.startsWith("term");
                              const displayLabel = isTermField
                                ? `Term ${+parts[0].replace("term", "") + 1
                                } • ${parts[1]?.charAt(0).toUpperCase() +
                                parts[1]?.slice(1)
                                }`
                                : field.charAt(0).toUpperCase() +
                                field.slice(1);

                              return (
                                <Chip
                                  key={field}
                                  label={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                      }}
                                    >
                                      <span>{displayLabel}</span>
                                      <span>•</span>
                                      <span>just now</span>
                                    </Box>
                                  }
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                  sx={{
                                    "& .MuiChip-label": {
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    },
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      )}
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
                onClick={handleSave}
                sx={{
                  backgroundColor: "#4a90e2 !important",
                  color: "white !important",
                  padding: "0.5rem 1rem",
                  marginLeft: "0.5rem",
                  "&:hover": {
                    backgroundColor: "#357ABD !important",
                  },
                }}
              >
                {userRole === "admin" ? "Publish" : "Save Changes"}
              </Button>
            </Stack>

            <Paper elevation={2} sx={{ width: "100%" }}>
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
                  <Grid size={2} sx={{ minWidth: 165 }}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end", // align left
                        fontWeight: 700,
                        my: 0,
                        whiteSpace: "normal",         // allow wrapping
                        overflowWrap: "break-word",   // break long words
                        width: "100%",                // take full width of grid cell
                      }}
                    >
                      Representative's Name
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                  <Grid size={1}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Status
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                  <Grid size={2} sx={{ minWidth: 165 }} >
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      District
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                  <Grid size={1} sx={{ alignContent: "center" }}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Party
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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

                  <Grid size={2} sx={{ minWidth: 165 }}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end", // align left
                        fontWeight: 700,
                        my: 0,
                        whiteSpace: "normal",         // allow wrapping
                        overflowWrap: "break-word",   // break long words
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
                          backgroundColor: "#4a90e2 !important",
                          color: "white !important",
                          padding: "0.5rem 1rem",
                          marginLeft: "0.5rem",
                          "&:hover": {
                            backgroundColor: "#7b1fe0 !important",
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

            <div className="spacer"></div>

            {/* Render each term in houseTermData */}
            {houseTermData.map((term, termIndex) => (
              <Paper
                key={termIndex}
                elevation={2}
                sx={{
                  width: "100%",
                  marginBottom: "50px",
                  position: "relative",
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
                    <Grid size={2}>
                      <InputLabel
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "end",
                          fontWeight: 700,
                          my: 0,
                        }}
                      >
                        Term
                      </InputLabel>
                    </Grid>
                    <Grid size={2.2}>
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
                            terms.map((t) => (
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
                    <Grid size={2.1} sx={{ alignContent: "center" }}>
                      <InputLabel
                        sx={{
                          display: "flex",
                          justifyContent: "end",
                          fontWeight: 700,
                          my: 0,
                        }}
                      >
                        Current Term
                      </InputLabel>
                    </Grid>
                    <Grid size={0}>
                      <Switch
                        {...label}
                        name="currentTerm"
                        checked={term.currentTerm}
                        onChange={(e) => handleSwitchChange(e, termIndex)}
                        color="warning"
                      />
                    </Grid>

                    <Grid size={2.39}>
                      <InputLabel
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "end",
                          fontWeight: 700,
                          my: 0,
                        }}
                      >
                        SBA Rating
                      </InputLabel>
                    </Grid>
                    <Grid size={2.2}>
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

                    <Grid size={2}>
                      <InputLabel
                        sx={{
                          display: "flex",
                          justifyContent: "end",
                          fontWeight: 700,
                          my: 0,
                        }}
                      >
                        Term Summary
                      </InputLabel>
                    </Grid>
                    <Grid size={9.05}>
                      <Editor
                        tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
                        licenseKey="gpl"
                        onInit={(_evt, editor) => (editorRef.current = editor)}
                        initialValue={term.summary || ""}
                        onEditorChange={(content) =>
                          handleEditorChange(content, termIndex)
                        }
                        onBlur={() => handleBlur(termIndex)}
                        init={{
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
                    {term.votesScore
                      .map((vote, voteIndex) => (
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
                              <Grid size={2}>
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
                              <Grid size={7.5}>
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
                                      votes.map((voteItem) => (
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
                              <Grid size={1.6}>
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
                                    <MenuItem value="Yes">Yea</MenuItem>
                                    <MenuItem value="No">Nay</MenuItem>
                                    <MenuItem value="Neutral">Other</MenuItem>
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
                      ))}
                    {/* Vote Repeater Ends */}

                    <Grid size={1}></Grid>
                    <Grid size={10} sx={{ textAlign: "right" }}>
                      <Button
                        variant="outlined"
                        sx={{
                          backgroundColor: "#4a90e2 !important",
                          color: "white !important",
                          padding: "0.5rem 1rem",
                          marginLeft: "0.5rem",
                          "&:hover": {
                            backgroundColor: "#357ABD !important",
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
                          <Grid size={2}>
                            <InputLabel
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "end",
                                fontWeight: 700,
                                my: 0,
                              }}
                            >
                              Tracked Activity
                            </InputLabel>
                          </Grid>
                          <Grid size={7.5}>
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
                          <Grid size={1.6}>
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
                                <MenuItem value="Yes">Yea</MenuItem>
                                <MenuItem value="No">Nay</MenuItem>
                                <MenuItem value="Neutral">Other</MenuItem>
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
                    ))}
                    {/* Activities Repeater Ends */}

                    <Grid size={1}></Grid>
                    <Grid size={10} sx={{ textAlign: "right" }}>
                      <Button
                        variant="outlined"
                        sx={{
                          backgroundColor: "#4a90e2 !important",
                          color: "white !important",
                          padding: "0.5rem 1rem",
                          marginLeft: "0.5rem",
                          "&:hover": {
                            backgroundColor: "#357ABD !important",
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
                backgroundColor: "#4a90e2 !important",
                color: "white !important",
                padding: "0.5rem 1rem",
                marginLeft: "0.5rem",
                "&:hover": {
                  backgroundColor: "#357ABD !important",
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
                sx={{ width: "100%" }}
                elevation={6}
                variant="filled"
              >
                {snackbarMessage}
              </MuiAlert>
            </Snackbar>
          </Stack>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
