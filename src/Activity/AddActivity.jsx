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
  });

  const preFillForm = () => {
    if (selectedActivity) {
      const termId = selectedActivity.termId?._id || "";
      setFormData({
        ...formData,
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
      });
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getActivityById(id));
    }
    dispatch(getAllTerms());

    return () => {
      dispatch(clearActivityState());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedActivity) {
      preFillForm();
    }
  }, [selectedActivity]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: content }));
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
    setLoading(true);
    try {
      const updatedFormData = { ...formData, status: "published" };

      if (id) {
        // Update existing activity with publishStatus
        await dispatch(
          updateActivity({ id, updatedData: updatedFormData })
        ).unwrap();
        setSnackbarMessage("Activity updated successfully!");
        setSnackbarSeverity("success");
      } else {
        // Validate required fields
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

        // Create new activity with publishStatus
        await dispatch(createActivity(updatedFormData)).unwrap();
        setSnackbarMessage("Activity created successfully!");
        setSnackbarSeverity("success");
      }

      setSnackbarOpen(true);
    } catch (error) {
      console.error("Save error:", error);
      setSnackbarMessage(`Operation failed: ${error.message || error}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false); // Ensure loading stops after success or failure
    }
  };

  const handleReview = async () => {
    setLoading(true);
    try {
      const updatedFormData = { ...formData, status: "reviewed" };
      if (id) {
        await dispatch(
          updateActivity({ id, updatedData: updatedFormData })
        ).unwrap();
        setSnackbarMessage("Activity Reviewed successfully!");
        setSnackbarSeverity("success");
      } else {
        if (
          !formData.type ||
          !formData.title ||
          !formData.shortDesc ||
          !formData.readMore
        ) {
          setSnackbarMessage("please fill all fields!");
          setSnackbarSeverity("warning");
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }
        await dispatch(createActivity(formData)).unwrap();
        setSnackbarMessage("Activity created and Reviewed successfully!");
        setSnackbarSeverity("success");
      }
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Save error:", error);
      setSnackbarMessage(`Operation failed: ${error.message || error}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false); // Ensure loading stops after success or failure
    }
  };

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
              </Button>
              <Button
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
              </Button>
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
                onClick={handleSubmit}
              >
                Save Changes
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
                            value="Completed"
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
                            value="Pending"
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
                            value="Failed"
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
