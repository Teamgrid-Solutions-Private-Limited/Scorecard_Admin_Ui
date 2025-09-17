import * as React from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
  discardVoteChanges,
} from "../redux/reducer/voteSlice";
import { API_URL } from "../redux/API";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { getAllTerms } from "../redux/reducer/termSlice";
import { alpha, styled } from "@mui/material/styles";
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
import { Editor } from "@tinymce/tinymce-react";
import Copyright from "../../src/Dashboard/internals/components/Copyright";
import { InputAdornment, CircularProgress } from "@mui/material";
import FixedHeader from "../components/FixedHeader";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Chip } from "@mui/material";
import HourglassTop from "@mui/icons-material/HourglassTop";
import { Drafts } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import { List, ListItem, ListItemText } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MobileHeader from "../components/MobileHeader";
import Footer from "../components/Footer";
import CheckCircle from "@mui/icons-material/CheckCircle";

export default function AddBill(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { vote: selectedVote } = useSelector((state) => state.vote);
  const { terms } = useSelector((state) => state.term);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    shortDesc: "",
    longDesc: "",
    date: "",
    congress: "",
    termId: "",
    rollCall: "",
    readMore: "",
    sbaPosition: "",
    status: "",
  });

  const [fieldEditors, setFieldEditors] = useState({});
  const [editedFields, setEditedFields] = useState([]);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [openDiscardDialog, setOpenDiscardDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // mobile detect
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const fieldLabels = {
    type: "Type",
    title: "Title",
    shortDesc: "Short Description",
    longDesc: "Long Description",
    date: "Date",
    congress: "Congress",
    termId: "Term",
    rollCall: "Roll Call",
    readMore: "Read More URL",
    sbaPosition: "SBA Position",
    status: "Status",
  };

  // Defensive userRole extraction
  const token = localStorage.getItem("token");
  let userRole = "";
  try {
    const decodedToken = jwtDecode(token);
    userRole = decodedToken.role;
  } catch (e) {
    userRole = "";
  }

  const compareValues = (newVal, oldVal) => {
    if (typeof newVal === "string" && typeof oldVal === "string") {
      return newVal.trim() !== oldVal.trim();
    }
    return newVal !== oldVal;
  };

  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const preFillForm = () => {
    if (selectedVote) {
      const termId = selectedVote.termId || "";
      const newFormData = {
        type: selectedVote.type.includes("senate")
          ? "senate_bill"
          : selectedVote.type.includes("house")
          ? "house_bill"
          : "",
        title: selectedVote.title || "",
        shortDesc: selectedVote.shortDesc || "",
        longDesc: selectedVote.longDesc || "",
        date: selectedVote.date ? selectedVote.date.split("T")[0] : "",
        congress: selectedVote.congress || "",
        termId: termId,
        rollCall: selectedVote.rollCall || "",
        readMore: selectedVote.readMore || "",
        sbaPosition: selectedVote.sbaPosition || "",
        status: selectedVote.status || "",
      };

      setFormData(newFormData);
      setOriginalFormData(newFormData);
    }
  };

  // When selectedVote changes, set editedFields from backend
  useEffect(() => {
    if (selectedVote) {
      preFillForm();
      setEditedFields(
        Array.isArray(selectedVote.editedFields)
          ? selectedVote.editedFields
          : []
      );
    }
  }, [selectedVote]);

  // When formData changes, update editedFields (track all changes)
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
    if (id) {
      dispatch(getVoteById(id));
    }
    dispatch(getAllTerms());

    return () => {
      dispatch(clearVoteState());
    };
  }, [id, dispatch]);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (!hasLocalChanges) {
      setHasLocalChanges(true);
    }
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (originalFormData) {
        const changes = Object.keys(newData).filter((key) =>
          compareValues(newData[key], originalFormData[key])
        );
        setEditedFields(changes);
      }

      return newData;
    });
  };

  const [editorsInitialized, setEditorsInitialized] = useState({
    shortDesc: false,
    longDesc: false,
  });
  const handleEditorChange = (content, fieldName) => {
    // Skip initial empty content (first render)
    if (!editorsInitialized[fieldName]) {
      setEditorsInitialized((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
      return;
    }

    // Check if content actually changed from current state
    if (content === formData[fieldName]) {
      return;
    }

    setFormData((prev) => {
      const newData = { ...prev, [fieldName]: content };

      if (originalFormData) {
        const changes = Object.keys(newData).filter((key) => {
          const newValue = newData[key];
          const oldValue = originalFormData[key];

          // Special handling for string comparison
          if (typeof newValue === "string" && typeof oldValue === "string") {
            return newValue.trim() !== oldValue.trim();
          }
          return newValue !== oldValue;
        });

        setEditedFields(changes);
      }

      return newData;
    });
  };

  const handleFileUpload = (event) => {
    if (!hasLocalChanges) {
      setHasLocalChanges(true);
    }
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Set the file path in the readMore field
      setFormData((prev) => ({
        ...prev,
        readMore: file.name,
      }));

      // Update editedFields if this is a change
      if (originalFormData && file.name !== originalFormData.readMore) {
        const changes = Object.keys(formData).filter((key) => {
          if (key === "readMore") {
            return file.name !== originalFormData.readMore;
          }
          return compareValues(formData[key], originalFormData[key]);
        });
        setEditedFields(changes);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.termId) {
      setSnackbarMessage("Term is required!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add all form fields EXCEPT status (we'll add it separately)
      Object.keys(formData).forEach((key) => {
        if (key === "readMore" && selectedFile) {
          // If there's a selected file, append it
          formDataToSend.append("readMore", selectedFile);
        } else if (key !== "status") {
          // Don't add status here
          formDataToSend.append(key, formData[key]);
        }
      });

      // Merge backend's editedFields with current session's changes
      const backendEditedFields = Array.isArray(selectedVote?.editedFields)
        ? selectedVote.editedFields
        : [];

      const filteredEditedFields = editedFields.filter(
        (field) => field !== "status"
      );
      const mergedEditedFields = Array.from(
        new Set([...backendEditedFields, ...filteredEditedFields])
      );

      const decodedToken = jwtDecode(token);
      const currentEditor = {
        editorId: decodedToken.userId,
        editorName: localStorage.getItem("user") || "Unknown Editor",
        editedAt: new Date(),
      };

      // Create updated fieldEditors map
      const updatedFieldEditors = { ...(selectedVote?.fieldEditors || {}) };
      filteredEditedFields.forEach((field) => {
        updatedFieldEditors[field] = currentEditor;
      });

      // Add editedFields and fieldEditors to FormData
      formDataToSend.append("editedFields", JSON.stringify(mergedEditedFields));
      formDataToSend.append(
        "fieldEditors",
        JSON.stringify(updatedFieldEditors)
      );

      // Add status ONLY ONCE
      const finalStatus = userRole === "admin" ? "published" : "under review";
      formDataToSend.append("status", finalStatus);

    if (id) {
      let hasChanges = true;
      if (userRole === "editor") {
        hasChanges =
          filteredEditedFields.length > 0 ||
          selectedFile ||
          Object.keys(updatedFieldEditors).length >
            Object.keys(selectedVote?.fieldEditors || {}).length;
      }

      if (!hasChanges) {
        setLoading(false);

        setSnackbarMessage("No changes detected. Nothing to update.");

        setSnackbarSeverity("info");

        setOpenSnackbar(true);

        return;
      }

      await dispatch(updateVote({ id, updatedData: formDataToSend })).unwrap();
      // After admin publishes, reload vote to get cleared editedFields
      await dispatch(getVoteById(id)).unwrap();

      setSnackbarMessage(
        userRole === "admin"
          ? "Changes published successfully!"
          : 'Status changed to "Under Review" for admin to moderate.'
      );
      setSnackbarSeverity("success");

      if (userRole !== "admin") {
        setFormData((prev) => ({ ...prev, status: "under review" }));
        // setOriginalFormData({ ...formData, readMore: selectedFile ? selectedFile.name : formData.readMore, status: "under review" });
        // Remove status from editedFields after update
        setEditedFields((prev) => prev.filter((field) => field !== "status"));
      } else {
        // Only clear locally if status is published
        if (finalStatus === "published") {
          setEditedFields([]);
        }
      }
    } else {
      if (
        !formData.type ||
        !formData.title ||
        !formData.shortDesc ||
        !formData.readMore
      ) {
        setSnackbarMessage("Please fill all required fields!");
        setSnackbarSeverity("warning");
        setOpenSnackbar(true);
        setLoading(false);
        return;
      }

      await dispatch(createVote(formDataToSend)).unwrap();
      setSnackbarMessage(
        userRole === "admin"
          ? "Bill created and published!"
          : "Bill created successfully!"
      );
      setSnackbarSeverity("success");
    }

      setOpenSnackbar(true);
    } catch (error) {
      console.error("Save error:", error);

      // Better error handling
      let errorMessage = "Operation failed";

      if (error?.payload?.message) {
        errorMessage = error.payload.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 400) {
        errorMessage = "Bad Request: Please check your input data";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server Error: Please try again later";
      }

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
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
      const result = await dispatch(discardVoteChanges(id)).unwrap();

      // Refresh the data
      await dispatch(getVoteById(id));
      setSnackbarMessage(
        `Changes ${userRole === "admin" ? "Discard" : "Undo"} successfully`
      );
      setSnackbarSeverity("success");
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
            ? `Edited fields: ${editedFields
                .map((f) => fieldLabels[f] || f)
                .join(", ")}`
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
            ? `Edited fields: ${editedFields
                .map((f) => fieldLabels[f] || f)
                .join(", ")}`
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
    formData.status || (userRole === "admin" ? "published" : "");
  const statusData = getStatusConfig(
    Array.isArray(editedFields) ? editedFields : [],
    currentStatus
  );
  const backendChanges = Array.isArray(formData?.editedFields)
    ? formData.editedFields
    : [];
  const localOnlyChanges = (
    Array.isArray(editedFields) ? editedFields : []
  ).filter((field) => !backendChanges.includes(field));
  const hasAnyChanges =
    backendChanges.length > 0 || localOnlyChanges.length > 0;
  const isStatusReady = !id || Boolean(originalFormData);

  useEffect(() => {}, [
    currentStatus,
    editedFields,
    originalFormData,
    formData,
  ]);
  // Reset editor initialization when form data is loaded
  useEffect(() => {
    if (formData.shortDesc && formData.longDesc) {
      setEditorsInitialized({
        shortDesc: true,
        longDesc: true,
      });
    }
  }, [formData.shortDesc, formData.longDesc]);

  return (
    <AppTheme>
      {loading && (
        <Box className="circularLoader">
          <CircularProgress sx={{ color: "#CC9A3A !important" }} />
        </Box>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
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
      <Box className="flexContainer">
        <SideMenu />
        <Box
          component="main"
          sx={(theme) => ({
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
                onClick={handleSubmit}
                className="publishBtn"
              >
                {userRole === "admin" ? "Publish" : "Save Changes"}
              </Button>
            </Stack>
            {userRole &&
              statusData &&
              (currentStatus !== "published" || hasAnyChanges) && (
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
                          formData.status === "draft"
                            ? "66, 165, 245"
                            : formData.status === "under review"
                            ? "230, 81, 0"
                            : formData.status === "published"
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
                            label={`${
                              (Array.isArray(selectedVote?.editedFields)
                                ? selectedVote.editedFields.length
                                : 0) +
                              (Array.isArray(editedFields)
                                ? editedFields.length
                                : 0)
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
                            selectedVote?.editedFields
                          )
                            ? selectedVote.editedFields
                            : [];
                          const localChanges = Array.isArray(editedFields)
                            ? editedFields
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
                                  : "Fill in the form to create a new bill"}
                              </Typography>
                            );
                          }

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
                                    {id ? "Saved Changes" : "New Fields"}
                                  </Typography>
                                  <List dense sx={{ py: 0 }}>
                                    {backendChanges.map((field) => {
                                      const editorInfo =
                                        selectedVote?.fieldEditors?.[field];
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
                                                  {fieldLabels[field] || field}
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
                                    {formData.status === "published"
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
                                                {fieldLabels[field] || field}
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
              <Box sx={{ padding: 0 }}>
                <Typography className="customTypography">
                  Bill's Information
                </Typography>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={2}
                  alignItems={"center"}
                  py={3}
                  pr={7}
                >
                  <Grid size={2}>
                    <InputLabel className="label">Type</InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.type}
                        name="type"
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="senate_bill">Senate</MenuItem>
                        <MenuItem value="house_bill">House</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={2}>
                    <InputLabel className="label">Title</InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <FormControl fullWidth>
                      <TextField
                        required
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        autoComplete="off"
                        variant="outlined"
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">
                      Short Description
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 10}>
                    <Editor
                      tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
                      licenseKey="gpl"
                      value={formData.shortDesc}
                      onEditorChange={(content) =>
                        handleEditorChange(content, "shortDesc")
                      }
                      init={{
                        base_url: "/scorecard/admin/tinymce",
                        suffix: ".min",
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
                          "undo redo | bold italic | alignleft aligncenter alignright | code",
                        skin: "oxide",
                        content_css: "default",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </Grid>

                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">
                      Long Description
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 10}>
                    <Editor
                      tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
                      licenseKey="gpl"
                      value={formData.longDesc}
                      onEditorChange={(content) =>
                        handleEditorChange(content, "longDesc")
                      }
                      init={{
                        base_url: "/scorecard/admin/tinymce",
                        suffix: ".min",
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
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </Grid>

                  <Grid size={2}>
                    <InputLabel className="label">Date</InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <FormControl fullWidth>
                      <TextField
                        type="date"
                        required
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        autoComplete="off"
                        variant="outlined"
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={isMobile ? 6 : 2}>
                    <InputLabel className="label">Congress</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 6 : 10}>
                    <FormControl fullWidth>
                      <TextField
                        required
                        id="congress"
                        name="congress"
                        value={formData.congress}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        autoComplete="off"
                        variant="outlined"
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={2}>
                    <InputLabel className="label">Term</InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <FormControl fullWidth>
                      <TextField
                        value={formData.termId || ""}
                        id="termId"
                        name="termId"
                        onChange={handleChange}
                        fullWidth
                        size="small"
                        autoComplete="off"
                        variant="outlined"
                        //sx={{ background: "#fff" }}
                      >
                        {/* <MenuItem value="" disabled>
                          Select an option
                        </MenuItem>
                        {terms && terms.length > 0 ? (
                          terms.map((term) => (
                            <MenuItem key={term._id} value={term._id}>
                              {term.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>
                            No terms available
                          </MenuItem>
                        )} */}
                      </TextField>
                    </FormControl>
                  </Grid>

                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">Roll Call</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 10}>
                    <FormControl fullWidth>
                      <TextField
                        className="customTextField"
                        fullWidth
                        variant="outlined"
                        name="rollCall"
                        value={formData.rollCall}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography
                                fontWeight="500"
                                sx={{
                                  fontSize: "13px",
                                  backgroundColor: "#F9F9F9",
                                }}
                              >
                                URL:
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">Read More</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 12 : 10}>
                    <FormControl fullWidth>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                          className="customTextField"
                          fullWidth
                          variant="outlined"
                          name="readMore"
                          value={
                            formData.readMore
                              ? `${API_URL}/uploads/documents/${formData.readMore
                                  .split("/")
                                  .pop()}`
                              : ""
                          }
                          onChange={handleChange}
                          placeholder="File will be uploaded here"
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography
                                  fontWeight="500"
                                  sx={{
                                    fontSize: "13px",
                                    backgroundColor: "#F9F9F9",
                                  }}
                                >
                                  URL:
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUploadIcon />}
                          className="upload-btn"
                        >
                          Upload
                          <input
                            type="file"
                            hidden
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt,.rtf"
                          />
                        </Button>
                      </Box>
                      {selectedFile && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "success.main",
                            mt: 0.5,
                            display: "block",
                          }}
                        >
                          File selected: {selectedFile.name}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">SBA Position</InputLabel>
                  </Grid>

                  <Grid size={isMobile ? 12 : 10}>
                    <FormControl
                      fullWidth
                      sx={{
                        fontFamily: "'Be Vietnam Pro', sans-serif",
                        "& .MuiFormControlLabel-label": {
                          fontSize: "15px",
                          fontFamily: "'Be Vietnam Pro', sans-serif",
                        },
                      }}
                    >
                      <RadioGroup
                        row
                        name="sbaPosition"
                        value={formData.sbaPosition}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="Yes"
                          control={
                            <Radio
                              icon={
                                <CheckCircleIcon sx={{ color: "#D3D3D3" }} />
                              }
                              checkedIcon={
                                <CheckCircleIcon sx={{ color: "green" }} />
                              }
                            />
                          }
                          label="Yes"
                        />
                        <FormControlLabel
                          value="No"
                          control={
                            <Radio
                              icon={<CancelIcon sx={{ color: "#D3D3D3" }} />}
                              checkedIcon={<CancelIcon sx={{ color: "red" }} />}
                            />
                          }
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Stack>
          <Box sx={{ mb: "40px", mx: "15px" }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
