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
} from "../redux/reducer/voteSlice";
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

  const preFillForm = () => {
    if (selectedVote) {
      const termId = selectedVote.termId?._id || "";
      const newFormData = {
        type: selectedVote.type.includes("senate")
          ? "senate"
          : selectedVote.type.includes("house")
          ? "house"
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

  const handleSubmit = async () => {
    if (!formData.termId) {
      setSnackbarMessage("Term is required!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Merge backend's editedFields with current session's changes
      const backendEditedFields = Array.isArray(selectedVote?.editedFields)
        ? selectedVote.editedFields
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
      const updatedFieldEditors = { ...(selectedVote?.fieldEditors || {}) };
      editedFields.forEach((field) => {
        updatedFieldEditors[field] = currentEditor;
      });

      const updatedFormData = {
        ...formData,
        status: userRole === "admin" ? "published" : "under review",
        editedFields: mergedEditedFields,
        fieldEditors: updatedFieldEditors,
      };

      if (id) {
        await dispatch(
          updateVote({ id, updatedData: updatedFormData })
        ).unwrap();

        setSnackbarMessage(
          userRole === "admin"
            ? "Bill published successfully!"
            : "Changes saved successfully!"
        );
        setSnackbarSeverity("success");

        if (userRole !== "admin") {
          setFormData((prev) => ({ ...prev, status: "under review" }));
          setOriginalFormData(updatedFormData);
        } else {
          // After admin publishes, reload vote to get cleared editedFields
          await dispatch(getVoteById(id)).unwrap();
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
          setSnackbarMessage("Please fill all required fields!");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }

        await dispatch(createVote(updatedFormData)).unwrap();
        setSnackbarMessage(
          userRole === "admin"
            ? "Bill created and published!"
            : "Bill created successfully!"
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
    };

    return configs[currentStatus] || configs.draft;
  };

  const currentStatus =
    formData.status || (userRole === "admin" ? "published" : "");
  const statusData = getStatusConfig(
    Array.isArray(editedFields) ? editedFields : [],
    currentStatus
  );

  useEffect(() => {
    console.log("Current status:", currentStatus);
    console.log("Edited fields:", editedFields);
    console.log("Original data:", originalFormData);
    console.log("Form data:", formData);
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
                            (selectedVote?.editedFields?.length || 0) +
                            editedFields.length
                          } pending changes`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ mt: 1.5 }}>
                      {editedFields.length > 0 ||
                      (selectedVote?.editedFields?.length || 0) > 0 ? (
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
                            {id ? "Pending Changes" : "New Fields"}
                          </Typography>

                          <List dense sx={{ py: 0 }}>
                            {selectedVote?.editedFields?.map((field) => {
                              const editorInfo =
                                selectedVote.fieldEditors?.[field];
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
                                        Edited on {editTime}
                                      </Typography>
                                    }
                                    sx={{ my: 0 }}
                                  />
                                </ListItem>
                              );
                            })}

                            {editedFields.map((field) => {
                              if (selectedVote?.editedFields?.includes(field))
                                return null;
                              return (
                                <ListItem
                                  key={`current-${field}`}
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
                                            backgroundColor: "#FFA000",
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
                                        Edited by You • just now
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
                          {id
                            ? "No pending changes"
                            : "Fill in the form to create a new bill"}
                        </Typography>
                      )}
                    </Box>

                    {/* ✅ Show Unsaved Changes Chips */}
                    {(userRole === "admin" || userRole === "editor") &&
                      editedFields.length > 0 && (
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
            </Stack>

            <Paper elevation={2} sx={{ width: "100%", marginBottom: "50px" }}>
              <Box sx={{ padding: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
                  Bill's Information
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
                      Title
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
                      Short Description
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <Editor
                      tinymceScriptSrc={`${
                        import.meta.env.BASE_URL
                      }tinymce/tinymce.min.js`}
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
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Long Description
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <Editor
                      value={formData.longDesc}
                      onEditorChange={(content) =>
                        handleEditorChange(content, "longDesc")
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
                      Term
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.termId || ""}
                        id="termId"
                        name="termId"
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="" disabled>
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
                        )}
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
                      Roll Call
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
                    sx={{ ml: { xs: 0, sm: 10.2 } }}
                  >
                    <Grid item xs={12} sm={2} sx={{ mr: 0.5 }}>
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
                        SBA Position
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
                                checkedIcon={
                                  <CancelIcon sx={{ color: "red" }} />
                                }
                              />
                            }
                            label="No"
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
