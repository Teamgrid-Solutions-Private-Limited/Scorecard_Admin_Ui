import * as React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { alpha, styled } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import { getSenatorDataBySenetorId } from "../redux/reducer/senetorTermSlice";
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
import ButtonGroup from "@mui/material/ButtonGroup";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Editor } from "@tinymce/tinymce-react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import Switch from "@mui/material/Switch";
import Copyright from "../../src/Dashboard/internals/components/Copyright";
import { useDispatch, useSelector } from "react-redux";
import { rating } from "../../src/Dashboard/global/common";
import { useParams } from "react-router-dom";

import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
  getAllVotes,
} from "../redux/reducer/voteSlice";
import { getAllActivity } from "../redux/reducer/activitySlice";

import { createSenatorData } from "../redux/reducer/senetorTermSlice";
import {
  clearSenatorDataState,
  updateSenatorData,
} from "../redux/reducer/senetorTermSlice";
import {
  getSenatorById,
  updateSenator,
  clearSenatorState,
  updateSenatorStatus,
} from "../redux/reducer/senetorSlice";
import { getAllTerms } from "../redux/reducer/termSlice";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

export default function AddSenator(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { senator } = useSelector((state) => state.senator);
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const { activities } = useSelector((state) => state.activity);
  const senatorData = useSelector((state) => state.senatorData);
 const token = localStorage.getItem("token");
// Decode token to get user role
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      console.log("User Role:", userRole);
  let senatorActivities =
    activities?.filter((activity) => activity.type === "senate") || [];

  const [senatorTermData, setSenatorTermData] = useState([
    {
      senateId: id,
      summary: "",
      rating: "",
      votesScore: [{ voteId: null, score: "" }],
      activitiesScore: [{ activityId: null, score: "" }],
      currentTerm: false,
      termId: null,
    },
  ]);

  const handleTermChange = (e, termIndex) => {
    setSenatorTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? { ...term, [e.target.name]: e.target.value }
          : term
      )
    );
  };

  const handleSwitchChange = (e, termIndex) => {
    setSenatorTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? { ...term, [e.target.name]: e.target.checked }
          : term
      )
    );
  };

  const handleAddVote = (termIndex) => {
    setSenatorTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? {
              ...term,
              votesScore: [...term.votesScore, { voteId: null, score: "" }],
            }
          : term
      )
    );
  };

  const handleRemoveVote = (termIndex, voteIndex) => {
    setSenatorTermData((prev) =>
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
    setSenatorTermData((prev) =>
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
    setSenatorTermData((prev) =>
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
    setSenatorTermData((prev) =>
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
    setSenatorTermData((prev) =>
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
    if (!contentRefs.current[termIndex]) {
      contentRefs.current[termIndex] = {};
    }
    contentRefs.current[termIndex].content = content;
  }, []);

  const handleBlur = useCallback((termIndex) => {
    setSenatorTermData((prev) =>
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
    setSenatorTermData((prev) => [
      ...prev,
      {
        senateId: id,
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
    setSenatorTermData((prev) =>
      prev.filter((_, index) => index !== termIndex)
    );
  };

  const termPreFill = () => {
    if (senatorData?.currentSenator?.length > 0) {
      const termsData = senatorData.currentSenator.map((term) => {
        const matchedTerm = terms?.find((t) => t.name === term.termId?.name);

        return {
          _id: term._id,
          summary: term.summary || "",
          rating: term.rating || "",
          termId: matchedTerm?._id || "",
          currentTerm: term.currentTerm || false,
          votesScore:
            term.votesScore?.length > 0
              ? term.votesScore.map((vote) => {
                  let scoreValue = "";
                  const dbScore = vote.score?.toLowerCase();

                  if (dbScore?.includes("yea")) {
                    scoreValue = "Yes";
                  } else if (dbScore?.includes("nay")) {
                    scoreValue = "No";
                  } else if (dbScore?.includes("other")) {
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

      setSenatorTermData(termsData);
    } else {
      setSenatorTermData([
        {
          senateId: id,
          summary: "",
          rating: "",
          votesScore: [{ voteId: null, score: "" }],
          activitiesScore: [{ activityId: null, score: "" }],
          currentTerm: false,
          termId: null,
        },
      ]);
    }
  };

  useEffect(() => {
    termPreFill();
  }, [id, senatorData]);

  const [formData, setFormData] = useState({
    name: "",
    status: "",
    state: "",
    party: "",
    photo: null,
    term: "",
  });

  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const preFillForm = () => {
    if (senator) {
      const termId =
        senator.termId && terms.length > 0
          ? terms.find((term) => term._id === senator.termId)?._id || ""
          : "";
      setFormData({
        name: senator.name || "",
        status: senator.status || "Active",
        state: senator.state || "",
        party: senator.party || "",
        photo: senator.photo || null,
        term: termId,
      });
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getSenatorById(id));
      dispatch(getSenatorDataBySenetorId(id));
    }
    dispatch(getAllTerms());
    dispatch(getAllVotes());
    dispatch(getAllActivity());
    return () => {
      dispatch(clearSenatorState());
      dispatch(clearSenatorDataState());
    };
  }, [id, dispatch]);

  useEffect(() => {
    preFillForm();
  }, [senator, terms]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let operationType = "";
    setLoading(true);
    try {
      // First handle senator data
      if (id) {
        const updatedData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) updatedData.append(key, value);
        });
        await dispatch(updateSenator({ id, formData: updatedData })).unwrap();
        operationType = "Updated";
      }

      // Then handle senator term data
      const termPromises = senatorTermData.map((termData) => {
        if (termData._id) {
          operationType = "Updated";
          return dispatch(
            updateSenatorData({
              id: termData._id,
              data: {
                ...termData,
                senateId: id,
              },
            })
          ).unwrap();
        } else {
          operationType = "Created";
          return dispatch(
            createSenatorData({
              ...termData,
              senateId: id,
            })
          ).unwrap();
        }
      });

      await Promise.all(termPromises);

      // 🔄 Update Status to "review"
      await dispatch(
        updateSenatorStatus({
          id,
          publishStatus: "published", // ✅ valid value
        })
      ).unwrap();

      await dispatch(getSenatorDataBySenetorId(id)).unwrap();
      await dispatch(getSenatorDataBySenetorId(id)).unwrap();

      handleSnackbarOpen(`Data ${operationType} successfully!`, "success");
    } catch (error) {
      console.error("Save failed:", error);
      handleSnackbarOpen("Failed to save: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    let operationType = "";
    setLoading(true);

    try {
      // First handle senator data
      if (id) {
        const updatedData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) updatedData.append(key, value);
        });
        await dispatch(updateSenator({ id, formData: updatedData })).unwrap();
        operationType = "Updated";
      }

      // Handle senator term data
      const termPromises = senatorTermData.map((termData) => {
        if (termData._id) {
          operationType = "Reviewed";
          return dispatch(
            updateSenatorData({
              id: termData._id,
              data: {
                ...termData,
                senateId: id,
              },
            })
          ).unwrap();
        } else {
          operationType = "Reviewed";
          return dispatch(
            createSenatorData({
              ...termData,
              senateId: id,
            })
          ).unwrap();
        }
      });

      await Promise.all(termPromises);

      // 🔄 Update Status to "review"
      await dispatch(
        updateSenatorStatus({
          id,
          publishStatus: "reviewed", // ✅ valid value
        })
      ).unwrap();

      await dispatch(getSenatorDataBySenetorId(id)).unwrap();

      handleSnackbarOpen(`Data ${operationType} successfully!`, "success");
    } catch (error) {
      console.error("Save failed:", error);
      handleSnackbarOpen("Failed to save: " + error.message, "error");
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
    setFormData((prev) => ({ ...prev, status }));
  };

  const label = { inputProps: { "aria-label": "Color switch demo" } };

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
                onClick={(e) => {
                  handleReview(e, "review");
                }}
                sx={{
                  backgroundColor: "#CC9A3A !important",
                  color: "white !important",
                  padding: "0.5rem 1rem",
                  "&:hover": {
                    backgroundColor: "#c38f2fff !important",
                  },
                }}
              >
                Review
              </Button>

          {userRole === "admin" && (
            <Button
              variant="outlined"
              onClick={(e) => {
                handleSave(e, "save");
              }}
              sx={{
                  backgroundColor: "#4a90e2 !important",
                  color: "white !important",
                  padding: "0.5rem 1rem",
                  "&:hover": {
                    backgroundColor: "#357ABD !important",
                  },
                }}
              >
                Save Changes
              </Button>
          )}
            </Stack>

            <Paper elevation={2} sx={{ width: "100%" }}>
              <Box sx={{ p: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
                  Senator's Information
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
                      }}
                    >
                      Senator's Name
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
                  <Grid size={2}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      State
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      id="state"
                      name="state"
                      value={formData.state}
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
                    <TextField
                      id="party"
                      name="party"
                      value={formData.party}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      autoComplete="off"
                      variant="outlined"
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
                      Senator's Photo
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {formData.photo ? (
                        <img
                          src={
                            typeof formData.photo === "string"
                              ? formData.photo
                              : URL.createObjectURL(formData.photo)
                          }
                          alt="Senator's Photo"
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

            {/* Render each term in senatorTermData */}
            {senatorTermData.map((term, termIndex) => (
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
                      Senator's Term Information {termIndex + 1}
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
                    {term.votesScore.map((vote, voteIndex) => (
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
                                <MenuItem value="None">None</MenuItem>
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
                                  const selectedActivity =
                                    senatorActivities.find(
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
                                {senatorActivities &&
                                senatorActivities.length > 0 ? (
                                  senatorActivities.map((activityItem) => (
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
                                <MenuItem value="None">None</MenuItem>
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
