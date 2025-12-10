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
import { getErrorMessage } from "../utils/errorHandler";
import { compareValues } from "../helpers/fieldHelpers";
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
import { InputAdornment } from "@mui/material";
import FixedHeader from "../components/FixedHeader";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
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
import { useSnackbar, useAuth, useFileUpload, useFormChangeTracker, useEntityData } from "../hooks";
import CircleIcon from "@mui/icons-material/Circle";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MobileHeader from "../components/MobileHeader";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import DialogBox from "../components/DialogBox";
import LoadingOverlay from "../components/LoadingOverlay";
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
  // Use centralized auth hook
  const { token, userRole, getCurrentEditor } = useAuth();

  // 1. Add editedFields state and always use backend's value when available
  const [editedFields, setEditedFields] = useState([]);
  const [originalFormData, setOriginalFormData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // mobile detect
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [readMoreType, setReadMoreType] = useState("file"); // 'url' or 'file'
  const navigate = useNavigate();

  // Use centralized data fetching hook (must be early, before any useEffect that uses isDataFetching)
  const { isDataFetching, setIsDataFetching } = useEntityData({
    dispatch,
    id,
    getAllTerms,
    getEntityById: id ? getActivityById : null,
    clearEntityState: clearActivityState,
  });

  const fieldLabels = {
    type: "Type",
    title: "Title",
    shortDesc: "Activity Details",
    congress: "Congress",
    date: "Date",
    readMore: "Read More URL",
    trackActivities: "Tracked Activities",
    status: "Status",
  };

  // Custom compareValues that excludes status field from comparison
  const compareValues = (newVal, oldVal, fieldName) => {
    if (fieldName === "status") return false;
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
    if (selectedActivity && !isDataFetching) {
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
  }, [selectedActivity, isDataFetching]);

  // 3. When formData changes, update editedFields (track all changes)
  useEffect(() => {
    if (originalFormData && formData) {
      const changes = [];
      Object.keys(formData).forEach((key) => {
        // Use the compareValues function with field name
        if (
          key !== "status" &&
          compareValues(formData[key], originalFormData[key], key)
        ) {
          changes.push(key);
        }
      });
      setEditedFields(changes);
    }
  }, [formData, originalFormData]);

  // Additional cleanup for selectedFile
  useEffect(() => {
    return () => {
      setSelectedFile(null);
    };
  }, []);

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

  const handleReadMoreChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      readMore: value,
    }));
  };

  // Use centralized form change tracker hook
  const { handleChange } = useFormChangeTracker({
    originalFormData,
    useLocalChanges: false, // Uses editedFields instead
    formData,
    setFormData,
    editedFields,
    setEditedFields,
    compareValues,
  });

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

  // Use centralized file upload hook
  const { handleReadMoreFileUpload } = useFileUpload({
    setFormData,
    setEditedFields,
    originalFormData,
    fieldName: "readMore",
  });

  const handleFileUpload = (event) => {
    if (!hasLocalChanges) {
      setHasLocalChanges(true);
    }
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleReadMoreFileUpload(event, "file");
    }
  };
  const [loading, setLoading] = useState(false);
  
  // Use centralized snackbar hook
  const {
    open: openSnackbar,
    message: snackbarMessage,
    severity: snackbarSeverity,
    showSnackbar,
    hideSnackbar: handleSnackbarClose,
  } = useSnackbar();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "readMore") {
          if (readMoreType === "file" && selectedFile) {
            formDataToSend.append("readMore", selectedFile);
          } else if (readMoreType === "url") {
            formDataToSend.append("readMore", formData.readMore);
          }
        } else if (key !== "status") {
          formDataToSend.append(key, formData[key]);
        }
      });

      const backendEditedFields = Array.isArray(selectedActivity?.editedFields)
        ? selectedActivity.editedFields
        : [];
      const mergedEditedFields = Array.from(
        new Set([...backendEditedFields, ...editedFields])
      );
      const currentEditor = getCurrentEditor();

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
        let hasChanges = true;
        if (userRole === "editor") {
          hasChanges =
            editedFields.length > 0 ||
            selectedFile ||
            Object.keys(updatedFieldEditors).length >
              Object.keys(selectedActivity?.fieldEditors || {}).length;
        }

        if (!hasChanges) {
          setLoading(false);

          showSnackbar("No changes detected. Nothing to update.", "info");

          return;
        }

        await dispatch(
          updateActivity({ id, updatedData: formDataToSend })
        ).unwrap();
        if (readMoreType === "url") {
          setFormData((prev) => ({ ...prev, readMore: formData.readMore }));
          setReadMoreType("url"); // force back to URL mode
        } else if (readMoreType === "file" && selectedFile) {
          setFormData((prev) => ({
            ...prev,
            readMore: `${API_URL}/uploads/documents/${selectedFile.name}`,
          }));
          setReadMoreType("file"); // stay in file mode
        }
        await dispatch(getActivityById(id)).unwrap();

        showSnackbar(
          userRole === "admin"
            ? "Changes published successfully!"
            : 'Status changed to "Under Review" for admin to moderate.',
          "success"
        );

        if (userRole !== "admin") {
          setFormData((prev) => ({ ...prev, status: "under review" }));
        } else {
          // Only clear locally if status is published
          if (finalStatus === "published") {
            setEditedFields([]);
          }
        }
      } else {
        if (!formData.type || !formData.title || !formData.shortDesc) {
        showSnackbar("Please fill all fields!", "warning");
        setLoading(false);
        return;
        }

        const result = await dispatch(createActivity(formDataToSend)).unwrap();
        const newActivityId = result.info._id;
        if (readMoreType === "url") {
          setFormData((prev) => ({ ...prev, readMore: formData.readMore }));
          setReadMoreType("url");
        } else if (readMoreType === "file" && selectedFile) {
          setFormData((prev) => ({
            ...prev,
            readMore: `${API_URL}/uploads/documents/${selectedFile.name}`,
          }));
          setReadMoreType("file");
        }
        showSnackbar("Activity created successfully!", "success");

        if (newActivityId) {
          setTimeout(() => {
            navigate(`/edit-activity/${newActivityId}`);
          }, 1500);
        } else {
          console.error("Activity (_id) is missing in the API response.");
        }

        setHasLocalChanges(false); // Reset after save
        setEditedFields([]);

        setOriginalFormData({ ...formData, status: finalStatus });
      }

    } catch (error) {
      console.error("Save error:", error);
      const errorMessage = getErrorMessage(error, "Operation failed");
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (!id) {
      showSnackbar("No house selected", "error");
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
      showSnackbar("Changes discarded successfully", "success");

      // Reset selectedFile state
      setSelectedFile(null);
    } catch (error) {
      console.error("Discard failed:", error);
      const errorMessage = getErrorMessage(error, "Failed to discard changes");
      showSnackbar(errorMessage, "error");
    } finally {
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

  // 5. The banner already uses editedFields, so no change needed there
  useEffect(() => {}, [
    currentStatus,
    editedFields,
    originalFormData,
    formData,
  ]);
  return (
    <AppTheme>
      <LoadingOverlay loading={loading || isDataFetching} />
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
        </Alert>
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
          className={`${isDataFetching ? "fetching" : "notFetching"}`}
        >
          <FixedHeader />
          <MobileHeader />
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: { xs: 2, md: 3 },
              // pb: 5,
              mt: 2,
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
              {/* Show Discard button only for existing activities */}
              {id && (
                <Button
                  variant="outlined"
                  onClick={handleDiscard}
                  className="discardBtn"
                >
                  {userRole === "admin" ? "Discard" : "Undo"}
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={handleSubmit}
                className="publishBtn"
              >
                {id
                  ? userRole === "admin"
                    ? "Publish"
                    : "Save Changes"
                  : "Create"}
              </Button>
            </Stack>
            {userRole &&
              statusData &&
              (currentStatus !== "published" || hasAnyChanges) && (
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
                                                  {fieldLabels?.[field] ||
                                                    field}
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

            <Paper className="customPaper">
              <DialogBox
                userRole={userRole}
                openDiscardDialog={openDiscardDialog}
                setOpenDiscardDialog={setOpenDiscardDialog}
                handleConfirmDiscard={handleConfirmDiscard}
              />
              <Box sx={{ padding: 0 }}>
                <Typography fontSize={"1rem"} className="customTypography">
                  Activity Information
                </Typography>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={2}
                  alignItems={"center"}
                  py={3}
                  pr={isMobile ? 3 : 7}
                >
                  <Grid size={isMobile ? 3 : 2}>
                    <InputLabel className="label">Type</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 9 : 10}>
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

                  <Grid size={isMobile ? 3 : 2}>
                    <InputLabel className="label">Title</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 9 : 10}>
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
                    <InputLabel className="label">Activity Details</InputLabel>
                  </Grid>
                  <Grid className="paddingLeft" size={isMobile ? 12 : 10}>
                    <Editor
                      tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
                      licenseKey="gpl"
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
                  <Grid size={isMobile ? 4 : 2}>
                    <InputLabel className="label">Congress</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 8 : 10}>
                    <FormControl fullWidth>
                      <Select
                        required
                        id="congress"
                        name="congress"
                        value={formData.congress || ""}
                        onChange={handleChange}
                        size="small"
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="" disabled>
                          Select congress
                        </MenuItem>
                        {Array.isArray(terms) && terms.length > 0 ? (
                          terms
                            .filter((t) => {
                              const s = Number(t.startYear);
                              const e = Number(t.endYear);
                              return (
                                s &&
                                e &&
                                e - s === 1 &&
                                s % 2 === 1 &&
                                Array.isArray(t.congresses) &&
                                t.congresses.length > 0
                              );
                            })
                            .sort((a, b) => a.congresses[0] - b.congresses[0])
                            .map((t) => (
                              <MenuItem
                                key={t._id}
                                value={String(t.congresses[0])}
                                sx={{ py: 1.25 }}
                              >
                                {`${t.congresses[0]}`}
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

                  <Grid size={isMobile ? 3 : 2}>
                    <InputLabel className="label">Date</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 9 : 10}>
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

                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">Read More</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 11 : 10}>
                    <FormControl fullWidth className="paddingLeft">
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        {/* Input fields based on selected type */}
                        {readMoreType === "url" ? (
                          <TextField
                            className="customTextField"
                            fullWidth
                            variant="outlined"
                            name="readMore"
                            value={
                              readMoreType === "url"
                                ? formData.readMore || ""
                                : formData.readMore
                                ? `${API_URL}${formData.readMore}`
                                : ""
                            }
                            onChange={(e) => {
                              let rawValue = e.target.value;
                              if (readMoreType === "file") {
                                rawValue = rawValue.replace(
                                  `${API_URL}/uploads/documents/`,
                                  ""
                                );
                              }
                              handleReadMoreChange({
                                target: { name: "readMore", value: rawValue },
                              });
                            }}
                            placeholder="Enter URL here"
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
                              endAdornment: (
                                <InputAdornment
                                  position="end"
                                  sx={{ marginRight: "-8px" }}
                                >
                                  <Button
                                    size="small"
                                    onClick={() => setReadMoreType("file")}
                                    sx={{
                                      backgroundColor: "#173A5E",
                                      color: "white",
                                      boxShadow: "none",
                                      "&:hover": {
                                        backgroundColor: "#174776ff",
                                        boxShadow: "none",
                                      },
                                      minWidth: "auto",
                                      // padding: "4px 8px",
                                      fontSize: "12px",
                                      textTransform: "none",
                                    }}
                                  >
                                    Switch to File
                                  </Button>
                                </InputAdornment>
                              ),
                            }}
                          />
                        ) : (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                              className="customTextField"
                              fullWidth
                              variant="outlined"
                              name="readMore"
                              value={
                                selectedFile
                                  ? selectedFile.name
                                  : formData.readMore
                                  ? formData.readMore.startsWith("http")
                                    ? formData.readMore
                                    : `${API_URL}${formData.readMore}`
                                  : ""
                              }
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
                                      File:
                                    </Typography>
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment
                                    position="end"
                                    sx={{ marginRight: "-8px" }}
                                  >
                                    <Button
                                      size="small"
                                      onClick={() => setReadMoreType("url")}
                                      sx={{
                                        backgroundColor: "#173A5E",
                                        color: "white",
                                        boxShadow: "none",
                                        "&:hover": {
                                          backgroundColor: "#174776ff",
                                          boxShadow: "none",
                                        },
                                        minWidth: "auto",
                                        padding: "4px 8px",
                                        fontSize: "12px",
                                        textTransform: "none",
                                      }}
                                    >
                                      Switch to URL
                                    </Button>
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
                        )}
                      </Box>
                    </FormControl>
                  </Grid>

                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">
                      Tracked Activities
                    </InputLabel>
                  </Grid>

                  <Grid size={isMobile ? 7 : 10}>
                    <FormControl
                      className="paddingLeft"
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
                              checkedIcon={<CancelIcon sx={{ color: "red" }} />}
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
          <Box sx={{ mb: "40px", mx: "15px" }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
