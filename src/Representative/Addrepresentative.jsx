import * as React from "react";
import { useRef, useCallback } from "react";
import { alpha, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
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
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { rating } from "../Dashboard/global/common";
import {
  clearHouseState,
  updateRepresentativeStatus,
} from "../redux/reducer/houseSlice";
import {
  getHouseById,
  updateHouse,
  createHouse,
} from "../redux/reducer/houseSlice";
import { getAllActivity } from "../redux/reducer/activitySlice";
import {
  getHouseDataByHouseId,
  updateHouseData,
  createHouseData,
  getHouseDataById,
  clearHouseDataState,
} from "../redux/reducer/houseTermSlice";
import {
  getAllVotes,
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
} from "../redux/reducer/voteSlice";
import { getAllTerms } from "../redux/reducer/termSlice";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import { Chip } from "@mui/material";
import HourglassTop from "@mui/icons-material/HourglassTop";
import Verified from "@mui/icons-material/Verified";
import { Drafts } from "@mui/icons-material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { jwtDecode } from "jwt-decode";

export default function Addrepresentative(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { house } = useSelector((state) => state.house);
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const houseData = useSelector((state) => state.houseData);
  const { activities } = useSelector((state) => state.activity);
  const houseActivities =
    activities?.filter((activity) => activity.type === "house") || [];
  const token = localStorage.getItem("token");
  // Decode token to get user role
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  console.log("User Role:", userRole);
  // Initialize as an array to support multiple terms
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
    setHouseTermData((prev) =>
      prev.map((term, index) =>
        index === termIndex
          ? { ...term, [e.target.name]: e.target.value }
          : term
      )
    );
  };

  const handleSwitchChange = (e, termIndex) => {
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
              votesScore: [...term.votesScore, { voteId: null, score: "" }],
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

  // Add a new term
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

  // Remove a term (can't remove the first one)
  const handleRemoveTerm = (termIndex) => {
    if (termIndex > 0) {
      setHouseTermData((prev) =>
        prev.filter((_, index) => index !== termIndex)
      );
    }
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
    } else {
      setHouseTermData([
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
    }
  };

  useEffect(() => {
    termPreFill();
  }, [id, houseData]);

  const [formData, setFormData] = useState({
    name: "",
    district: "",
    party: "",
    photo: null,
    status: "",
    publishStatus: "", // Default status
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const preFillForm = () => {
    if (house) {
      setFormData({
        name: house.name || "",
        district: house.district || "",
        party: house.party || "",
        photo: house.photo || "",
        status: house.status || "Active",
        publishStatus: house.publishStatus || "",
      });
    }
  };

  // const token = localStorage.getItem("token");
  // // Decode token to get user role
  // const decodedToken = jwtDecode(token);
  // const userRole = decodedToken.role;

  console.log("User Role:", userRole);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    let operationType = "";
    setLoading(true);

    try {
      setSnackbarMessage("");
      setSnackbarSeverity("success");

      if (id) {
        const updatedData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) updatedData.append(key, value);
        });
        await dispatch(updateHouse({ id, formData: updatedData })).unwrap();
        operationType = "Updated";
      }

      const termPromises = houseTermData.map((termData) => {
        if (termData._id) {
          operationType = "Updated";
          return dispatch(
            updateHouseData({
              id: termData._id,
              data: {
                ...termData,
                houseId: id,
              },
            })
          ).unwrap();
        } else {
          operationType = "Created";
          return dispatch(
            createHouseData({
              ...termData,
              houseId: id,
            })
          ).unwrap();
        }
      });

      await Promise.all(termPromises);

      // ✅ Different logic based on role
      if (userRole === "admin") {
        await dispatch(
          updateRepresentativeStatus({ id, publishStatus: "published" })
        ).unwrap();
      } else {
        await dispatch(
          updateRepresentativeStatus({ id, publishStatus: "under review" })
        ).unwrap();
      }

      await dispatch(getHouseDataByHouseId(id)).unwrap();
      await dispatch(getHouseById(id)).unwrap();

      handleSnackbarOpen(`Data ${operationType} successfully!`, "success");
    } catch (error) {
      console.error("Save failed:", error);
      handleSnackbarOpen(
        "Failed to save: " + (error.message || "Unknown error occurred"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleReview = async (e) => {
  //   e.preventDefault();
  //   let operationType = "";
  //   setLoading(true);

  //   try {
  //     // Reset any previous errors
  //     setSnackbarMessage("");
  //     setSnackbarSeverity("success");

  //     // ✅ 1. Update house data
  //     if (id) {
  //       const updatedData = new FormData();
  //       Object.entries(formData).forEach(([key, value]) => {
  //         if (value) updatedData.append(key, value);
  //       });

  //       await dispatch(updateHouse({ id, formData: updatedData })).unwrap();
  //       operationType = "Updated";
  //     }

  //     // ✅ 2. Save house term data (filter out completely empty entries if needed)
  //     const termPromises = houseTermData.map((termData) => {
  //       const termPayload = {
  //         ...termData,
  //         houseId: id,
  //       };

  //       if (termData._id) {
  //         operationType = "under review";
  //         return dispatch(
  //           updateHouseData({ id: termData._id, data: termPayload })
  //         ).unwrap();
  //       } else {
  //         operationType = "under review";
  //         return dispatch(createHouseData(termPayload)).unwrap();
  //       }
  //     });

  //     await Promise.all(termPromises);

  //     // ✅ 3. Update status to "review"
  //     await dispatch(
  //       updateRepresentativeStatus({ id, publishStatus: "under review" })
  //     ).unwrap();

  //     // ✅ 4. Refresh data
  //     await dispatch(getHouseDataByHouseId(id)).unwrap();
  //     await dispatch(getHouseById(id)).unwrap();

  //     // ✅ 5. Success message
  //     handleSnackbarOpen(`Data ${operationType} successfully!`, "success");
  //   } catch (error) {
  //     console.error("Save failed:", error);
  //     handleSnackbarOpen(
  //       "Failed to save: " + (error.message || "Unknown error occurred"),
  //       "error"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const [vote, setVote] = React.useState([{ id: 1, option1: "", option2: "" }]);
  const [activity, setActivity] = React.useState([
    { id: 1, option1: "", option2: "" },
  ]);
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

  const handleAdd = () => {
    setVote([...vote, { id: vote.length + 1, option1: "", option2: "" }]);
  };

  const handleRemove = (id) => {
    setVote(vote.filter((item) => item.id !== id));
  };

  const label = { inputProps: { "aria-label": "Color switch demo" } };

  const statusConfig = {
    draft: {
      backgroundColor: "rgba(66, 165, 245, 0.12)",
      borderColor: "#2196F3",
      iconColor: "#1565C0",
      icon: <Drafts sx={{ fontSize: "20px" }} />,
      title: "Draft Version",
      description: "Unpublished draft - changes pending",
      titleColor: "#0D47A1",
      descColor: "#1976D2",
    },
    reviewed: {
      backgroundColor: "rgba(255, 193, 7, 0.12)",
      borderColor: "#FFC107",
      iconColor: "#FFA000",
      icon: <HourglassTop sx={{ fontSize: "20px" }} />,
      title: "Under Review",
      description: "Being reviewed by the team",
      titleColor: "#5D4037",
      descColor: "#795548",
    },
    // published: {
    //   backgroundColor: "rgba(76, 175, 80, 0.12)",
    //   borderColor: "#4CAF50",
    //   iconColor: "#2E7D32",
    //   icon: <CheckCircle sx={{ fontSize: "20px" }} />,
    //   title: "Published",
    //   description: "This document is live",
    //   titleColor: "#2E7D32",
    //   descColor: "#388E3C",
    // },
  };

  const currentStatus = formData.publishStatus || ""; // Fallback to draft if undefined
  const statusData = statusConfig[currentStatus];

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
            // overflow: "auto",
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
            {statusData && (
              <Box
                sx={{
                  width: "98%",
                  py: 1.2,
                  px: 3,
                  backgroundColor: statusData.backgroundColor,
                  borderLeft: `3px solid ${statusData.borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: "0 4px 4px 0",
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    backgroundColor: `rgba(${
                      currentStatus === "draft"
                        ? "66, 165, 245"
                        : currentStatus === "under review"
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
                    color: statusData.iconColor,
                  })}
                </Box>

                <Box sx={{ overflow: "hidden" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    sx={{
                      color: statusData.titleColor,
                      lineHeight: 1.3,
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {statusData.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: statusData.descColor,
                      opacity: 0.8,
                      display: "block",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {statusData.description}
                  </Typography>
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
                onClick={handleReview}
                sx={{
                  backgroundColor: "#CC9A3A !important",
                  color: "white !important",
                  padding: "0.5rem 1rem",
                  marginLeft: "0.5rem",
                  "&:hover": {
                    backgroundColor: "#c38f2fff !important",
                  },
                }}
              >
                Review
              </Button> */}
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

              {/* <Button variant="outlined">
                Fetch Representatives from Quorum
              </Button> */}
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
                  <Grid size={2}>
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
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      autoComplete="off"
                      variant="outlined"
                      placeholder="Enter district"
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
                  <Grid size={2}>
                    <InputLabel
                      sx={{
                        display: "flex",
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Representative's Photo
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
                          alignSelf: "flex-start",
                          backgroundColor: "#4a90e2 !important",
                          color: "white !important",
                          padding: "0.5rem 1rem",
                          marginLeft: "0.5rem",
                          "&:hover": {
                            backgroundColor: "#357ABD !important",
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

            {/* Render each term */}
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
                          name="termId"
                          value={term.termId || ""}
                          onChange={(e) => handleTermChange(e, termIndex)}
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
                          name="rating"
                          onChange={(e) => handleTermChange(e, termIndex)}
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
                        //apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                        licenseKey="gpl"
                        onInit={(_evt, editor) => (editorRef.current = editor)}
                        initialValue={term.summary}
                        name="summary"
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
                            "undo redo | blocks | " +
                            "bold italic forecolor | alignleft aligncenter " +
                            "alignright alignjustify | bullist numlist outdent indent | " +
                            "removeformat | help",
                          content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}
                      />
                    </Grid>

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
                          {/* Label - keep size 2 to match other labels */}
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

                          {/* Vote Select - adjusted to 5 (was 4) */}
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
                                }}
                                MenuProps={{
                                  PaperProps: {
                                    sx: {
                                      maxHeight: 300,
                                      width: 400,
                                      "& .MuiMenuItem-root": {
                                        whiteSpace: "normal",
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
                                      sx={{
                                        py: 1.5,
                                      }}
                                    >
                                      <Typography
                                        noWrap
                                        sx={{ maxWidth: "100%" }}
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

                          {/* Score Select - adjusted to 3 (was 5) */}
                          <Grid size={1.6}>
                            <FormControl fullWidth>
                              <Select
                                value={vote.score || ""}
                                onChange={(e) =>
                                  handleVoteChange(
                                    termIndex,
                                    voteIndex,
                                    "score",
                                    e.target.value
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

                          {/* Delete icon - keep size 1 */}
                          <Grid size={1}>
                            <DeleteForeverIcon
                              onClick={() =>
                                handleRemoveVote(termIndex, voteIndex)
                              }
                            />
                          </Grid>

                          {/* Add an empty Grid to balance the layout */}
                        </Grid>
                      </Grid>
                    ))}
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
              startIcon={<AddIcon />}
              onClick={handleAddTerm}
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
