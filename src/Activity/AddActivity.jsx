import * as React from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getActivityById,
  clearActivityState,
  updateActivity,
  createActivity,
  discardActivityChanges,
} from "../redux/reducer/activitySlice";
import { getAllTerms } from "../redux/reducer/termSlice";
import { API_URL } from "../redux/API";
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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CancelIcon from "@mui/icons-material/Cancel";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { Chip } from "@mui/material";
import HourglassTop from "@mui/icons-material/HourglassTop";
import Verified from "@mui/icons-material/Verified";
import { Drafts } from "@mui/icons-material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { jwtDecode } from "jwt-decode";
import { List, ListItem, ListItemText } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MobileHeader from "../components/MobileHeader";
import Footer from "../components/Footer";

const Alert = React.forwardRef(function Alert(props, ref) {
  const { ownerState, ...alertProps } = props;
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...alertProps} />;
});

export default function AddActivity(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { activity: selectedActivity } = useSelector((state) => state.activity);
  const { terms } = useSelector((state) => state.term);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    shortDesc: "",
    date: "",
    congress: "",
    readMore: "",
    trackActivities: "",
    status: "",
  });
  const [fieldEditors, setFieldEditors] = useState({});
  const [openDiscardDialog, setOpenDiscardDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  // Defensive userRole extraction
  const token = localStorage.getItem("token");
  let userRole = "";
  try {
    const decodedToken = jwtDecode(token);
    userRole = decodedToken.role;
  } catch (e) {
    userRole = "";
  }

 
  // 1. Add editedFields state and always use backend's value when available
  const [editedFields, setEditedFields] = useState([]);
  const [originalFormData, setOriginalFormData] = useState(null);
           const theme = useTheme();
         const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // mobile detect
   const [hasLocalChanges, setHasLocalChanges] = useState(false);
 
  

  const fieldLabels = {
    type: "Type",
    title: "Name",
    shortDesc: "Activity Details",
    congress: "Congress",
    date: "Date",
    readMore: "Read More URL",
    trackActivities: "Tracked Activities",
    status: "Status",
  };

  const compareValues = (newVal, oldVal) => {
    if (typeof newVal === "string" && typeof oldVal === "string") {
      return newVal.trim() !== oldVal.trim();
    }
    return newVal !== oldVal;
  };

  const preFillForm = () => {
    if (selectedActivity) {
      const newFormData = {
        type:
          selectedActivity.type === "senate"
            ? "senate"
            : selectedActivity.type === "house"
            ? "house"
            : "",
        title: selectedActivity.title || "",
        shortDesc: selectedActivity.shortDesc || "",
        congress: selectedActivity.congress || "",
        date: selectedActivity.date ? selectedActivity.date.split("T")[0] : "",
        readMore: selectedActivity.readMore || "",
        trackActivities: selectedActivity.trackActivities || "",
        status: selectedActivity.status || "",
      };

      setFormData(newFormData);
      setOriginalFormData(newFormData); // Store the original data

      // Reset selectedFile when editing existing activity
      setSelectedFile(null);

      // Reset editedFields when editing existing activity
      setEditedFields([]);
    }
  };

  // 2. When selectedActivity changes, set editedFields from backend
  useEffect(() => {
    if (selectedActivity) {
      preFillForm();
      // Only set editedFields from backend on initial load
      // This prevents overwriting local unsaved changes
      if (isInitialLoad.current) {
        setEditedFields(
          Array.isArray(selectedActivity.editedFields)
            ? selectedActivity.editedFields
            : []
        );
        isInitialLoad.current = false;
      }
    }
  }, [selectedActivity]);

  // 3. When formData changes, update editedFields (track all changes)
  useEffect(() => {
    if (originalFormData && formData) {
      const changes = [];
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== originalFormData[key]) {
          changes.push(key);
        }
      });
      setEditedFields(changes);
    }
  }, [formData, originalFormData]);

  useEffect(() => {
    if (id) {
      dispatch(getActivityById(id));
    }
    dispatch(getAllTerms());

    return () => {
      dispatch(clearActivityState());
      setSelectedFile(null);
    };
  }, [id, dispatch]);

  const editorRef = useRef(null);
  const isInitialLoad = useRef(true);
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

  // Update your handleChange and handleEditorChange to properly track changes
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

  const handleEditorChange = (content, fieldName) => {
    if (!hasLocalChanges) {
      setHasLocalChanges(true);
    }
    setFormData((prev) => {
      const newData = { ...prev, [fieldName]: content };

      if (originalFormData) {
        const changes = Object.keys(newData).filter((key) =>
          compareValues(newData[key], originalFormData[key])
        );
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

  // 4. In handleSubmit, only clear editedFields if status is published
  const handleSubmit = async () => {
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
      const backendEditedFields = Array.isArray(selectedActivity?.editedFields)
        ? selectedActivity.editedFields
        : [];
      const mergedEditedFields = Array.from(
        new Set([...backendEditedFields, ...editedFields])
      );
      const decodedToken = jwtDecode(token);
      const currentEditor = {
        editorId: decodedToken.userId,
        editorName: localStorage.getItem("user") || "Unknown Editor",
        editedAt: new Date(),
      };

      // Create updated fieldEditors map
      const updatedFieldEditors = { ...(selectedActivity?.fieldEditors || {}) };
      editedFields.forEach((field) => {
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
        await dispatch(
          updateActivity({ id, updatedData: formDataToSend })
        ).unwrap();
        await dispatch(getActivityById(id)).unwrap();

        setSnackbarMessage(
          userRole === "admin"
            ? "Changes published successfully!"
            : 'Status changed to "Under Review" for admin to moderate.'
        );
        setSnackbarSeverity("success");

        if (userRole !== "admin") {
          setFormData((prev) => ({ ...prev, status: "under review" }));
          // setOriginalFormData({ ...formData, status: "under review" }); // Keep tracking changes
        } else {
          // Only clear locally if status is published
          if (finalStatus === "published") {
            setEditedFields([]);
            // Update originalFormData to current form data to stop tracking changes
            setOriginalFormData({ ...formData, status: "published" });
          }
        }
      } else {
        if (!formData.type || !formData.title || !formData.shortDesc) {
          setSnackbarMessage("Please fill all fields!");
          setSnackbarSeverity("warning");
          setOpenSnackbar(true);
          setLoading(false);
          return;
        }

        await dispatch(createActivity(formDataToSend)).unwrap();
        setSnackbarMessage("Activity created successfully!");
        setSnackbarSeverity("success");

        // Reset editedFields after successful creation
        setHasLocalChanges(false); // Reset after save
        setEditedFields([]);
        // Update originalFormData to current form data
        setOriginalFormData({ ...formData, status: finalStatus });
      }

      setOpenSnackbar(true);
    } catch (error) {
      console.error("Save error:", error);
      setSnackbarMessage(`Operation failed: ${error.message || error}`);
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
      await dispatch(discardActivityChanges(id)).unwrap();

      // Refresh the data
      await dispatch(getActivityById(id));
      setSnackbarMessage("Changes discarded successfully");
      setSnackbarSeverity("success");

      // Reset selectedFile state
      setSelectedFile(null);
    } catch (error) {
      console.error("Discard failed:", error);
      const errorMessage =
        error?.payload?.message ||
        error?.message ||
        (typeof error === "string" ? error : "Failed to discard changes");
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
        icon: null,
        // title: "Published",
        description:
          editedFields.length > 0
            ? `Edited fields: ${editedFields
                .map((f) => fieldLabels[f] || f)
                .join(", ")}`
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
  const localOnlyChanges = (Array.isArray(editedFields) ? editedFields : []).filter(
    (field) => !backendChanges.includes(field)
  );
  const hasAnyChanges = backendChanges.length > 0 || localOnlyChanges.length > 0;
  const isStatusReady = !id || Boolean(originalFormData);

  // 5. The banner already uses editedFields, so no change needed there
  useEffect(() => {}, [
    currentStatus,
    editedFields,
    originalFormData,
    formData,
  ]);
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
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ "& .MuiClickAwayListener-root": { all: "inherit" } }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background} / 1)`
              : alpha(theme.palette.background.default, 1),
            // overflow: "auto",
            // overflow: "auto",
          })}
        >
          <FixedHeader />
          <MobileHeader/>
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              // pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            {userRole &&
              statusData &&
              (currentStatus !== "published" || hasAnyChanges) && (
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
                        currentStatus === "draft"
                          ? "66, 165, 245"
                          : currentStatus === "review"
                          ? "255, 193, 7"
                          : currentStatus === "published"
                          ? ""
                          : "244, 67, 54"
                      }, 0.2)`,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {statusData.icon && React.cloneElement(statusData.icon, {
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
                          label={`${(() => {
                            const backend = Array.isArray(
                              selectedActivity?.editedFields
                            )
                              ? selectedActivity.editedFields
                              : [];
                            const local = Array.isArray(editedFields)
                              ? editedFields
                              : [];
                            const localOnly = local.filter(
                              (f) => !backend.includes(f)
                            );
                            return backend.length + localOnly.length;
                          })()} pending changes`}
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
                          selectedActivity?.editedFields
                        )
                          ? selectedActivity.editedFields
                          : [];
                        const localChanges = Array.isArray(editedFields)
                          ? editedFields
                          : [];
                        const hasChanges =
                          backendChanges.length > 0 || localChanges.length > 0;

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
                              {typeof id !== "undefined" && id
                                ? "No pending changes"
                                : "Fill in the form to create a new activity"}
                            </Typography>
                          );
                        }

                        return (
                          <>
                            {/* Backend pending changes */}
                            {backendChanges.length > 0 && (
                              <Box
                                sx={{
                                  backgroundColor: "background.paper",
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
                                      selectedActivity?.fieldEditors?.[field];
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
                                                {fieldLabels?.[field] || field}
                                              </Typography>
                                            </Box>
                                          }
                                          secondary={
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Updated by {editor} on {editTime}
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
                                              {fieldLabels?.[field] || field}
                                            </Typography>
                                          </Box>
                                        }
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
              {/* Show Discard button only for existing activities */}
              {id && (
                <Button
                  variant="outlined"
                  onClick={handleDiscard}
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
                  {userRole === "admin" ? "Discard" : "Undo"}
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={handleSubmit}
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
                {id
                  ? userRole === "admin"
                    ? "Publish"
                    : "Save Changes"
                  : "Create"}
              </Button>
            </Stack>

            <Paper elevation={2} sx={{ width: "100%", marginBottom: "50px" }}>
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
              <Box sx={{ padding: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
                  Activity Information
                </Typography>
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
                        width: "100%",
                      }}
                    >
                      Type
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.type}
                        name="type"
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="senate">Senate</MenuItem>
                        <MenuItem value="house">House</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={2}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                        width: "100%",
                      }}
                    >
                      Name
                    </InputLabel>
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

                  <Grid size={isMobile?12:2}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Activity Details
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile?12:10}>
                    <Editor
                      tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
                      licenseKey="gpl"
                      //apiKey="nbxuqfjn2kwm9382tv3bi98nn95itbawmplf1l3x826f16u4"
                      value={formData.shortDesc}
                      onEditorChange={(content) =>
                        handleEditorChange(content, "shortDesc")
                      }
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
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </Grid>
                  <Grid size={isMobile?12:2}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                        fontWeight: 700,
                        my: 0,
                        width: "100%",
                      }}
                    >
                      Congress
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile?12:10}>
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
                    <InputLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                        width: "100%",
                      }}
                    >
                      Date
                    </InputLabel>
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

                  <Grid size={isMobile?12:2}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isMobile ? "flex-start" : "flex-end",
                        fontWeight: 700,
                        my: 0,
                        width: "100%",
                      }}
                    >
                      Read More
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile?12:10}>
                    <FormControl fullWidth>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                          sx={{
                            fontFamily: "'Be Vietnam Pro', sans-serif",
                            height: 38,
                            flex: 1,
                            "& .MuiOutlinedInput-root": {
                              fontFamily: "'Be Vietnam Pro', sans-serif",
                              fontSize: "13px",
                              height: 38,
                              padding: "4px 8px",
                              borderRadius: "6px",
                              alignItems: "center",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#D3D3D3 !important",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#D3D3D3 !important",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "#CC9A3A !important",
                                  borderWidth: "1px",
                                },
                            },
                          }}
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
                          sx={{
                            height: 38,
                            minWidth: "auto",
                            px: 2,
                            borderColor: "#CC9A3A",
                            color: "#CC9A3A",
                            "&:hover": {
                              borderColor: "#B8860B",
                              backgroundColor: "rgba(204, 154, 58, 0.04)",
                            },
                          }}
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
                
                    <Grid size={isMobile?12:2}>
                      <InputLabel
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: isMobile ? "flex-start" : "flex-end",
                          fontWeight: 700,
                          my: 0,
                          width: "100%",
                        }}
                      >
                        Tracked Activities
                      </InputLabel>
                    </Grid>

                    <Grid size={10}>
                      <FormControl
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
                          name="trackActivities"
                          value={formData.trackActivities}
                          onChange={handleChange}
                        >
                          <FormControlLabel
                            value="completed"
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
                            label="Completed"
                          />
                          <FormControlLabel
                            value="pending"
                            control={
                              <Radio
                                icon={
                                  <RadioButtonUncheckedIcon
                                    sx={{ color: "#D3D3D3" }}
                                  />
                                }
                                checkedIcon={
                                  <RadioButtonUncheckedIcon
                                    sx={{ color: "#b4af4bff" }}
                                  />
                                }
                              />
                            }
                            label="Pending"
                          />
                          <FormControlLabel
                            value="failed"
                            control={
                              <Radio
                                icon={<CancelIcon sx={{ color: "#D3D3D3" }} />}
                                checkedIcon={
                                  <CancelIcon sx={{ color: "red" }} />
                                }
                              />
                            }
                            label="Failed"
                          />
                        </RadioGroup>
                      </FormControl>
                  
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Stack>
          <Box sx={{ mb: "50px" }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
