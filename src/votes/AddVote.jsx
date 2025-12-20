import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
  discardVoteChanges,
} from "../redux/reducer/voteSlice";
import { API_URL } from "../redux/API";
import { getAllTerms } from "../redux/reducer/termSlice";
import { getErrorMessage } from "../utils/errorHandler";
import { compareValues } from "../helpers/fieldHelpers";
import { validateRequired } from "../helpers/validationHelpers";
import { alpha, styled } from "@mui/material/styles";
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
import { Editor } from "@tinymce/tinymce-react";
import {
  InputAdornment,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import FixedHeader from "../components/FixedHeader";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassTop from "@mui/icons-material/HourglassTop";
import { Drafts } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useSnackbar, useAuth, useFileUpload, useEntityData, useFormChangeTracker } from "../hooks";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MobileHeader from "../components/MobileHeader";
import Footer from "../components/Footer";
import DialogBox from "../components/DialogBox";
import LoadingOverlay from "../components/LoadingOverlay";

export default function AddBill(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { vote: selectedVote } = useSelector((state) => state.vote);

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
  const [readMoreType, setReadMoreType] = useState("file"); // 'url' or 'file'
  const terms = useSelector((state) => state.term?.terms || []);

  const { isDataFetching, setIsDataFetching } = useEntityData({
    dispatch,
    id,
    getAllTerms: id ? null : getAllTerms, 
    getEntityById: id ? getVoteById : null,
    clearEntityState: clearVoteState,
    additionalActions: id ? [getAllTerms] : [], 
  });

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
  const { token, userRole, getCurrentEditor } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    open: openSnackbar,
    message: snackbarMessage,
    severity: snackbarSeverity,
    showSnackbar,
    hideSnackbar: handleSnackbarClose,
  } = useSnackbar();

  const preFillForm = () => {
    if (selectedVote) {
      const termIdRaw = selectedVote.termId ?? "";
      const termIdStr =
        termIdRaw !== null && termIdRaw !== undefined ? String(termIdRaw) : "";
      let resolvedTermName = "";
      let congressValue = selectedVote.congress || "";

      const termIds = terms.map((t) =>
        String(t._id ?? t.id ?? t.termId ?? t.value ?? "")
      );

      if (termIdStr && termIds.includes(termIdStr)) {
        const selectedTerm = terms.find(
          (term) =>
            String(term._id ?? term.id ?? term.termId ?? term.value ?? "") ===
            termIdStr
        );
        if (selectedTerm) {
          resolvedTermName = selectedTerm.name ?? "";
          if (selectedTerm.congresses && selectedTerm.congresses.length > 0) {
            congressValue = String(selectedTerm.congresses[0]);
          }
        } else {
          resolvedTermName = termIdStr;
        }
      } else if (termIdStr) {
        const found = terms.find((t) => {
          const name = (t.name ?? t.title ?? "").toString();
          const yearRange =
            t.startYear && t.endYear
              ? `${t.startYear}-${t.endYear}`
              : t.startYear || t.endYear
              ? `${t.startYear || ""}${t.endYear ? "-" + t.endYear : ""}`
              : "";
          return (
            name === termIdStr ||
            yearRange === termIdStr ||
            name.trim() === termIdStr.trim() ||
            yearRange.trim() === termIdStr.trim()
          );
        });
        if (found) {
          resolvedTermName = found.name ?? "";
          if (found.congresses && found.congresses.length > 0) {
            congressValue = String(found.congresses[0]);
          }
        } else {
          resolvedTermName = termIdStr;
        }
      }

      const newFormData = {
        type: selectedVote.type?.includes("senate")
          ? "senate_vote"
          : selectedVote.type?.includes("house")
          ? "house_vote"
          : "",
        title: selectedVote.title || "",
        shortDesc: selectedVote.shortDesc || "",
        longDesc: selectedVote.longDesc || "",
        date: selectedVote.date ? selectedVote.date.split("T")[0] : "",
        congress: congressValue,
        termId: resolvedTermName,
        rollCall: selectedVote.rollCall || "",
        readMore: selectedVote.readMore || "",
        sbaPosition: selectedVote.sbaPosition || "",
        status: selectedVote.status || "",
      };

      setFormData(newFormData);
      setOriginalFormData(newFormData);
    }
  };

  useEffect(() => {
    if (selectedVote && !isDataFetching) {
      preFillForm();
      setEditedFields(
        Array.isArray(selectedVote.editedFields)
          ? selectedVote.editedFields
          : []
      );
    }
  }, [selectedVote, isDataFetching]);

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

  const handleReadMoreChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      readMore: value,
    }));
  };

  const { handleChange: baseHandleChange } = useFormChangeTracker({
    originalFormData,
    useLocalChanges: false, 
    formData,
    setFormData,
    editedFields,
    setEditedFields,
    compareValues,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    if (name === "termId") {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        const selectedTerm = terms.find(
          (t) =>
            (t.name ?? "").toString() === String(value) ||
            String(t._id ?? t.id ?? t.termId ?? "") === String(value)
        );
        if (
          selectedTerm &&
          Array.isArray(selectedTerm.congresses) &&
          selectedTerm.congresses.length > 0
        ) {
          newData.congress = String(selectedTerm.congresses[0]);
          newData.termId = selectedTerm.name ?? String(value); // ensure termId stores the name
        } else {
          newData.congress = "";
          newData.termId = String(value);
        }
        
        if (originalFormData) {
          const changes = Object.keys(newData).filter((key) =>
            compareValues(newData[key], originalFormData[key])
          );
          setEditedFields(changes);
        }
        
        return newData;
      });
    } else {
      baseHandleChange(event);
    }
  };

  const [editorsInitialized, setEditorsInitialized] = useState({
    shortDesc: false,
    longDesc: false,
  });
  const handleEditorChange = (content, fieldName) => {
    if (!editorsInitialized[fieldName]) {
      setEditorsInitialized((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
      return;
    }
    if (content === formData[fieldName]) {
      return;
    }

    setFormData((prev) => {
      const newData = { ...prev, [fieldName]: content };

      if (originalFormData) {
        const changes = Object.keys(newData).filter((key) => {
          const newValue = newData[key];
          const oldValue = originalFormData[key];
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

  const handleSubmit = async (publishFlag = false) => {
    const termValidation = validateRequired(formData.termId, "Term");
    if (!termValidation.isValid) {
      showSnackbar(termValidation.message, "error");
      return;
    }

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

      const updatedFieldEditors = { ...(selectedVote?.fieldEditors || {}) };
      filteredEditedFields.forEach((field) => {
        updatedFieldEditors[field] = currentEditor;
      });

      formDataToSend.append("editedFields", JSON.stringify(mergedEditedFields));
      formDataToSend.append(
        "fieldEditors",
        JSON.stringify(updatedFieldEditors)
      );

      const finalStatus = publishFlag ? "published" : userRole === "admin" ? "under review" : "under review";
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

          showSnackbar("No changes detected. Nothing to update.", "info");
          return;
        }

        await dispatch(
          updateVote({ id, updatedData: formDataToSend })
        ).unwrap();
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
        await dispatch(getVoteById(id)).unwrap();

        if (publishFlag) {
          showSnackbar("Changes published successfully!", "success");
        } else if (userRole === "admin") {
          showSnackbar("Changes saved (draft).", "success");
        } else {
          showSnackbar('Status changed to "Draft" for admin to moderate.', "info");
        }

        if (userRole !== "admin") {
          setFormData((prev) => ({ ...prev, status: "under review" }));
          setEditedFields((prev) => prev.filter((field) => field !== "status"));
        } else {
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
          showSnackbar("Please fill all required fields!", "warning");
          setLoading(false);
          return;
        }
        const result = await dispatch(createVote(formDataToSend)).unwrap();

        const newVoteId = result.data?._id || null; 

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
        showSnackbar("Bill created successfully!", "success");
        if (newVoteId) {
          setTimeout(() => {
            navigate(`/edit-vote/${newVoteId}`);
          }, 1500);
        } else {
          console.error("Vote (_id) is missing in the API response.");
        }
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
      const result = await dispatch(discardVoteChanges(id)).unwrap();
      await dispatch(getVoteById(id));
      showSnackbar(
        `Changes ${userRole === "admin" ? "Discard" : "Undo"} successfully`,
        "success"
      );
    } catch (error) {
      console.error("Discard failed:", error);
      const errorMessage = getErrorMessage(
        error,
        `Failed to ${userRole === "admin" ? "Discard" : "Undo"} changes`
      );
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
        backgroundColor: "rgba(66, 165, 245, 0.12)",
        borderColor: "#2196F3",
        iconColor: "#1565C0",
        icon:  <HourglassTop sx={{ fontSize: "20px" }} />,
        title: "Saved Draft",
        description:
          editedFields.length > 0
            ? `Edited fields: ${editedFields
                .map((f) => fieldLabels[f] || f)
                .join(", ")}`
            : "No recent changes",
        titleColor: "#0D47A1",
        descColor: "#1976D2",
      },
      published: {
        backgroundColor: "rgba(66, 165, 245, 0.12)",
        borderColor: "#2196F3",
        iconColor: "#1565C0",
        icon: <HourglassTop sx={{ fontSize: "20px" }} />,
        title: "Unsaved Draft",
        description:
          editedFields.length > 0
            ? `${editedFields.length} pending changes`
            : "Published and live",
        titleColor: "#0D47A1",
        descColor: "#1976D2",
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
      <LoadingOverlay loading={loading || isDataFetching} />

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
              {id &&userRole === "admin" ? 
                <Button
                  variant="outlined"
                  onClick={handleDiscard}
                  className="discardBtn"
                >
                  Discard
                  {/* {userRole === "admin" ? "Discard" : "Undo"} */}
                </Button>:null
              }

              {id ? (
                userRole === "admin" ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => handleSubmit(false)}
                      className="publishBtn"
                    >
                      Save Draft
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleSubmit(true)}
                   sx ={{
              backgroundColor: "#2E7D32 !important",
              color: "white !important",
              padding: "0.5rem 1.5rem",
              marginLeft: "0.5rem",
              "&:hover": { backgroundColor: "#216A2A !important" },
            }}
                    >
                      Publish
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleSubmit(false)}
                    className="publishBtn"
                  >
                    Save Draft
                  </Button>
                )
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => handleSubmit(false)}
                  className="publishBtn"
                >
                  Create
                </Button>
              )}
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
                            ? "66, 165, 245"
                            : formData.status === "published"
                            ? "66, 165, 245"
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
                                  : "Fill in the form to create a new vote"}
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
                                 {/* < Typography
                                    variant="overline"
                                    sx={{ color: "text.secondary", mb: 1 }}
                                  >
                                    {id ? "Saved Changes" : "New Fields"}
                                  </Typography> */}
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
                                      : "Unsaved Draft"}
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
                <Typography className="customTypography">
                  Vote Information
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
                        <MenuItem value="senate_vote">Senate</MenuItem>
                        <MenuItem value="house_vote">House</MenuItem>
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
                    <InputLabel className="label">Short Description</InputLabel>
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
                    <InputLabel className="label">Long Description</InputLabel>
                  </Grid>
                  <Grid className="paddingLeft" size={isMobile ? 12 : 10}>
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

                  {id && (
                    <>
                      <Grid size={isMobile ? 4 : 2}>
                        <InputLabel className="label">Congress</InputLabel>
                      </Grid>
                      <Grid size={isMobile ? 8 : 10}>
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
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </FormControl>
                      </Grid>
                    </>
                  )}

                  <Grid size={isMobile ? 3 : 2}>
                    <InputLabel className="label">Term</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 9 : 10}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.termId || ""}
                        id="termId"
                        name="termId"
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="">Select Term</MenuItem>
                        {terms
                          .filter(
                            (term) =>
                              term.startYear &&
                              term.endYear &&
                              Number(term.endYear) - Number(term.startYear) ===
                                1
                          )
                          .sort((a, b) => {
                            const ca = Array.isArray(a.congresses)
                              ? a.congresses[0]
                              : 0;
                            const cb = Array.isArray(b.congresses)
                              ? b.congresses[0]
                              : 0;
                            return ca - cb;
                          })
                          .map((term, idx) => {
                            const value =
                              term.name ??
                              `${term.startYear || ""}-${term.endYear || ""}` ??
                              idx;
                            const label =
                              term.name ??
                              term.title ??
                              (term.startYear || term.endYear
                                ? `${term.startYear || ""} - ${
                                    term.endYear || ""
                                  }`
                                : value);

                            return (
                              <MenuItem key={value || idx} value={value}>
                                {label}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">Roll Call</InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 11 : 10}>
                    <FormControl fullWidth className="paddingLeft">
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
                                ? `${API_URL}/uploads/documents/${formData.readMore.replace(
                                    "/uploads/",
                                    ""
                                  )}`
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
                                    : `${API_URL}/uploads/documents/${formData.readMore.replace(
                                        "/uploads/",
                                        ""
                                      )}`
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
                  <Grid size={isMobile ? 5 : 2}>
                    <InputLabel className="label">SBA Position</InputLabel>
                  </Grid>

                  <Grid size={isMobile ? 7 : 10}>
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
                          value="yes"
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
                          value="no"
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