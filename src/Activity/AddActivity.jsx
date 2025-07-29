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
} from "../redux/reducer/activitySlice";
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
  // Defensive userRole extraction
  const token = localStorage.getItem("token");
  let userRole = "";
  try {
    const decodedToken = jwtDecode(token);
    userRole = decodedToken.role;
  } catch (e) {
    userRole = "";
  }

  console.log("User Role:", userRole);
  // 1. Add editedFields state and always use backend's value when available
  const [editedFields, setEditedFields] = useState([]);
  const [originalFormData, setOriginalFormData] = useState(null);

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

  console.log("User Role:", userRole);
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
    }
  };

  // 2. When selectedActivity changes, set editedFields from backend
  useEffect(() => {
    if (selectedActivity) {
      preFillForm();
      setEditedFields(
        Array.isArray(selectedActivity.editedFields)
          ? selectedActivity.editedFields
          : []
      );
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

  // Update your handleChange and handleEditorChange to properly track changes
  const handleChange = (event) => {
    const { name, value } = event.target;
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
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // 4. In handleSubmit, only clear editedFields if status is published
  const handleSubmit = async () => {
    setLoading(true);
    try {
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
        editorName: decodedToken.name || decodedToken.username || "You",
        editedAt: new Date(),
      };

      // Create updated fieldEditors map
      const updatedFieldEditors = { ...(selectedActivity?.fieldEditors || {}) };
      editedFields.forEach((field) => {
        updatedFieldEditors[field] = currentEditor;
      });

      const updatedFormData = {
        ...formData,
        status: userRole === "admin" ? "published" : "under review",
        editedFields: mergedEditedFields, // always send the merged array!
        fieldEditors: updatedFieldEditors,
      };

      if (id) {
        await dispatch(
          updateActivity({ id, updatedData: updatedFormData })
        ).unwrap();

        setSnackbarMessage(
          userRole === "admin"
            ? "Activity published successfully!"
            : "Changes saved successfully!"
        );
        setSnackbarSeverity("success");

        if (userRole !== "admin") {
          setFormData((prev) => ({ ...prev, status: "under review" }));
          setOriginalFormData(updatedFormData); // Keep tracking changes
        } else {
          // After admin publishes, reload activity to get cleared editedFields
          await dispatch(getActivityById(id)).unwrap();
          // Only clear locally if status is published
          if (updatedFormData.status === "published") {
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
          setSnackbarMessage("Please fill all fields!");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }

        await dispatch(createActivity(updatedFormData)).unwrap();
        setSnackbarMessage(
          userRole === "admin"
            ? "Activity created and published!"
            : "Activity created successfully!"
        );
        setSnackbarSeverity("success");
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error("Save error:", error);
      setSnackbarMessage(`Operation failed: ${error.message || error}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  // const handleReview = async () => {
  //   setLoading(true);
  //   try {
  //     const updatedFormData = { ...formData, status: "under review" };
  //     if (id) {
  //       await dispatch(
  //         updateActivity({ id, updatedData: updatedFormData })
  //       ).unwrap();
  //       setSnackbarMessage("Activity Reviewed successfully!");
  //       setSnackbarSeverity("success");
  //       await dispatch(getActivityById(id)).unwrap();
  //     } else {
  //       if (
  //         !formData.type ||
  //         !formData.title ||
  //         !formData.shortDesc ||
  //         !formData.readMore
  //       ) {
  //         setSnackbarMessage("please fill all fields!");
  //         setSnackbarSeverity("warning");
  //         setSnackbarOpen(true);
  //         setLoading(false);
  //         return;
  //       }
  //       await dispatch(createActivity(formData)).unwrap();
  //       setSnackbarMessage("Activity created and Reviewed successfully!");
  //       setSnackbarSeverity("success");
  //     }
  //     setSnackbarOpen(true);
  //   } catch (error) {
  //     console.error("Save error:", error);
  //     setSnackbarMessage(`Operation failed: ${error.message || error}`);
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   } finally {
  //     setLoading(false); // Ensure loading stops after success or failure
  //   }
  // };

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

    return configs[currentStatus] || configs.draft;
  };

  const currentStatus =
    formData.status || (userRole === "admin" ? "published" : "draft");
  const statusData = getStatusConfig(
    Array.isArray(editedFields) ? editedFields : [],
    currentStatus
  );

  // 5. The banner already uses editedFields, so no change needed there
  useEffect(() => {
    console.log("Current status:", currentStatus);
    console.log("Edited fields:", editedFields);
    console.log("Original data:", originalFormData);
    console.log("data:", formData);
  }, [currentStatus, editedFields, originalFormData, formData]);
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
        open={snackbarOpen}
        autoHideDuration={4000}
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
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            {userRole && currentStatus !== "published" && (
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
                  <Box sx={{ color: statusData.iconColor }}>
                    {statusData.icon}
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
                        {statusData.icon}
                        {statusData.title}
                      </Typography>

                      {userRole === "admin" && (
                        <Chip
                          label={`${selectedActivity.editedFields.length} pending changes`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                      {Array.isArray(selectedActivity?.editedFields) &&
                      selectedActivity.editedFields.length > 0 ? (
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
                            Recent Changes Fields
                          </Typography>

                          <List dense sx={{ py: 0 }}>
                            {selectedActivity.editedFields.map((field) => {
                              const editorInfo =
                                selectedActivity.fieldEditors?.[field];
                              // const editorName =
                              //   editorInfo?.editorName || "System";
                              const editTime = editorInfo?.editedAt
                                ? new Date(editorInfo.editedAt).toLocaleString(
                                    [],
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
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
                                          {fieldLabels[field] || field}
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Edited at • {editTime}
                                      </Typography>
                                    }
                                    sx={{ my: 0 }}
                                  />
                                </ListItem>
                              );
                            })}
                          </List>
                        </Box>
                      ) : (
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
                      )}
                    </Box>

                    {userRole === "admin" && editedFields.length > 0 && (
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
                          {editedFields.map((field) => {
                            const editorInfo = formData.fieldEditors?.[field];
                            const editTime = editorInfo?.editedAt
                              ? new Date(
                                  editorInfo.editedAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "just now";

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
                                    <span>{fieldLabels[field] || field}</span>
                                    <CircleIcon sx={{ fontSize: 8 }} />
                                    <span>{editTime}</span>
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
              {/* <Button
                variant="outlined"
                sx={{
                  backgroundColor: "#CC9A3A !important",

                  color: "white !important",
                  padding: "0.5rem 1rem",
                  marginLeft: "0.5rem",
                  "&:hover": {
                    backgroundColor: "#c38f2fff !important",
                  },
                }}
                onClick={handleReview}
              >
                Review
              </Button> */}
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
                {userRole === "admin" ? "Publish" : "Save Changes"}
              </Button>

              {/* <Button variant="outlined">Fetch Data from Quorum</Button> */}
            </Stack>

            <Paper elevation={2} sx={{ width: "100%", marginBottom: "50px" }}>
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

                  <Grid size={2}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Activity Details
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
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
                      Congress
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
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
                      Read More
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <FormControl fullWidth>
                      <TextField
                        sx={{
                          fontFamily: "'Be Vietnam Pro', sans-serif",
                          height: 38,
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
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#CC9A3A !important",
                              borderWidth: "1px",
                            },
                          },
                        }}
                        fullWidth
                        variant="outlined"
                        name="readMore"
                        value={formData.readMore}
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
                  <Grid
                    container
                    spacing={2}
                    alignItems="center"
                    sx={{ ml: { xs: 0, sm: 5.6 } }}
                  >
                    <Grid item xs={12} sm={2}>
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
                        Tracked Activities
                      </InputLabel>
                    </Grid>

                    <Grid item xs={12} sm={10}>
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
                </Grid>
              </Box>
            </Paper>
          </Stack>
          <Copyright sx={{ my: 4 }} />
        </Box>
      </Box>
    </AppTheme>
  );
}
