import * as React from "react";
import { useRef } from "react";
import { alpha, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SideMenu from "./components/SideMenu";
import AppTheme from "/shared-theme/AppTheme";
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
import Copyright from "./internals/components/Copyright";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  getHouseById,
  updateHouse,
  createHouse,
} from "../redux/slice/houseSlice";
import {
  getHouseDataByHouseId,
  updateHouseData,
  createHouseData,
  getHouseDataById,
} from "../redux/slice/houseTermSlice";
import {
  getAllVotes,
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
} from "../redux/slice/voteSlice";
import { getAllTerms } from "../redux/slice/termSlice";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export default function Addrepresentative(props) {
  const [age, setAge] = React.useState("");
  const { id } = useParams();
  const dispatch = useDispatch();
  const { house: selectedHouse } = useSelector((state) => state.house);
  const { houseData: selectedHouseData } = useSelector(
    (state) => state.houseData
  );
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const [scoredVotes, setScoredVotes] = useState([
    { id: 1, voteId: "", score: "" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    btn: "",
    district: "",
    party: "",
    photo: "",
    photoPreview: "",
    termId: "",
    rating: "",
    summary: "",
    currentTerm: "",
    votesScore: "",
    activitiesScore: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Can be "success", "error", "warning", or "info"

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

  useEffect(() => {
    console.log("ID from URL:", id);
    if (id) {
      dispatch(getHouseById(id));
      dispatch(getHouseDataById(id));
    }
    dispatch(getAllTerms());
    dispatch(getAllVotes());
    return () => {
      dispatch(clearVoteState());
    };
  }, [id, dispatch]);

  useEffect(() => {
    console.log("Selected House:", selectedHouse);
    console.log("Selected House Data:", selectedHouseData);
  }, [selectedHouse, selectedHouseData]);

  useEffect(() => {
    if (selectedHouse || selectedHouseData) {
      const extractedState = selectedHouse?.district?.split(", ").pop() || "";
      const termId =
        selectedHouseData[0]?.termId?._id || selectedHouseData?.termId || "";

      setFormData({
        name: selectedHouse?.name || "",
        btn: selectedHouse?.btn || "",
        district: extractedState,
        party: selectedHouse?.party || "",
        photo: selectedHouse?.photo || "",
        termId: termId || "",
        rating: selectedHouseData?.rating || "",
        summary: selectedHouseData?.summary || "",
        currentTerm: selectedHouseData[0]?.currentTerm || false,
        votesScore: selectedHouseData[0]?.votesScore || [],
        activitiesScore: selectedHouseData[0]?.activitiesScore || [],
      });

      if (selectedHouseData[0]?.votesScore) {
        setScoredVotes(
          selectedHouseData[0]?.votesScore.map((vote) => ({
            voteId: vote.voteId || "",
            score: vote.score || "",
          }))
        );
      }
    }
  }, [selectedHouse, selectedHouseData, terms, votes]);
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
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };
  const handleAddScoredVote = () => {
    setScoredVotes([...scoredVotes, { voteId: "", score: "" }]);
  };
  const handleScoredVoteChange = (event, index, field) => {
    const { value } = event.target;

    // Update the specific vote in the scoredVotes array
    setScoredVotes((prev) => {
      const updatedVotes = prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );

      console.log("Updated Scored Votes:", updatedVotes); // Debugging
      return updatedVotes;
    });
  };

  const handleRemoveScoredVote = (index) => {
    setScoredVotes((prev) => prev.filter((_, i) => i !== index));
  };
  const handleChange = (event) => {
    setAge(event.target.value);
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditorChange = (content, editor, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: content }));
  };

  const handleSave = async () => {
    try {
      const {
        name,
        btn,
        district,
        party,
        photo,
        termId,
        rating,
        summary,
        currentTerm,
      } = formData;

      let formDataObject = new FormData();
      formDataObject.append("name", name);
      formDataObject.append("btn", btn);
      formDataObject.append("district", district);
      formDataObject.append("party", party);

      if (photo instanceof File) {
        formDataObject.append("photo", photo);
      }

      // Format votesScore
      const formattedVotesScore = vote
        .map((v) => ({
          voteId: v.option1?.trim() || null,
          score: v.option2?.trim() || null,
        }))
        .filter((v) => v.voteId && v.score); // Ensure only valid objects

      // Format activitiesScore
      const formattedActivitiesScore = activity
        .map((a) => ({
          activityId: a.option1?.trim() || null,
          score: a.option2?.trim() || null,
        }))
        .filter((a) => a.activityId && a.score);

      let houseId = id;

      /** Step 1: Handle House Creation/Update */
      if (houseId) {
        await dispatch(
          updateHouse({ id: houseId, formData: formDataObject })
        ).unwrap();
      } else {
        const newHouseResponse = await dispatch(
          createHouse(formDataObject)
        ).unwrap();
      }

      /** Step 2: Handle HouseData Creation/Update */
      const houseDataPayload = {
        houseId, // Link to house
        termId, // Ensure termId is passed
        summary,
        rating,
        votesScore: formattedVotesScore,
        activitiesScore: formattedActivitiesScore,
      };

      if (selectedHouseData && selectedHouseData?.info?._id) {
        // Update existing houseData
        await dispatch(
          updateHouseData({
            id: selectedHouseData._id, // Use existing _id
            data: houseDataPayload,
          })
        ).unwrap();
      } else {
        // Create new houseData
        await dispatch(createHouseData(houseDataPayload)).unwrap();
      }

      handleSnackbarOpen(
        "Representative and term information saved successfully!"
      );
    } catch (error) {
      handleSnackbarOpen("Save operation failed:", error);
    }
  };

  const [vote, setVote] = React.useState([{ id: 1, option1: "", option2: "" }]);
  const [activity, setActivity] = React.useState([
    { id: 1, option1: "", option2: "" },
  ]);

  const handleAdd = () => {
    setVote([...vote, { id: vote.length + 1, option1: "", option2: "" }]);
  };

  const handleRemove = (id) => {
    setVote(vote.filter((item) => item.id !== id));
  };

  const handleRemoveActivity = (id) => {
    setActivity(activity.filter((item) => item.id !== id));
  };
  const label = { inputProps: { "aria-label": "Color switch demo" } };
  return (
    <AppTheme>
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={[
                {
                  paddingTop: "50px",
                  color: "text.secondary",
                },
              ]}
            >
              SBA Scorecard Management System
            </Typography>

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
                variant="contained"
                onClick={handleSave}
                sx={{
                  "&:hover": {
                    backgroundColor: "green",
                  },
                }}
              >
                Save
              </Button>
              <Button variant="outlined">
                Fetch Representatives from Quorum
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
                  <Grid size={5}>
                    <ButtonGroup
                      variant="outlined"
                      name="btn"
                      value={formData.btn}
                      onChange={handleChange}
                      aria-label="Basic button group"
                    >
                      <Button>Active</Button>
                      <Button>Former</Button>
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
                  <Grid size={5}>
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
                        variant="contained"
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
            <Paper elevation={2} sx={{ width: "100%", marginBottom: "50px" }}>
              <Box sx={{ padding: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
                  Representative's Term Information
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
                      Term
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
                    <FormControl fullWidth>
                      <Select
                        name="termId"
                        value={formData.termId}
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
                  <Grid size={1}>
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
                  <Grid size={5}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.rating}
                        name="rating"
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="A+">A+</MenuItem>
                        <MenuItem value="F">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                        <MenuItem value="B">C</MenuItem>
                        <MenuItem value="B">D</MenuItem>
                        <MenuItem value="B">F</MenuItem>
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
                  <Grid size={10}>
                    <Editor
                      apiKey="nbxuqfjn2kwm9382tv3bi98nn95itbawmplf1l3x826f16u4"
                      onInit={(_evt, editor) => (editorRef.current = editor)}
                      initialValue={formData.summary}
                      name="summary"
                      value={formData.summary}
                      onEditorChange={(content, editor) =>
                        handleEditorChange(content, editor, "summary")
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
                          "undo redo | blocks | " +
                          "bold italic forecolor | alignleft aligncenter " +
                          "alignright alignjustify | bullist numlist outdent indent | " +
                          "removeformat | help",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </Grid>

                  <Grid size={2} sx={{ alignContent: "center" }}>
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
                  <Grid size={10}>
                    <Switch
                      {...label}
                      name="currentTerm"
                      value={formData.currentTerm}
                      onChange={handleChange}
                      color="warning"
                    />
                  </Grid>

                  {scoredVotes.map((item, index) => (
                    <Grid rowSpacing={2} sx={{ width: "100%" }} key={index}>
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
                        <Grid size={4}>
                          <FormControl fullWidth>
                            <Select
                              value={item.voteId || ""}
                              onChange={(event) =>
                                handleScoredVoteChange(event, index, "voteId")
                              }
                              sx={{ background: "#fff" }}
                            >
                              <MenuItem value="" disabled>
                                Select a Vote
                              </MenuItem>
                              {votes && votes.length > 0 ? (
                                votes.map((vote) => (
                                  <MenuItem key={vote._id} value={vote._id}>
                                    {vote.title}
                                  </MenuItem>
                                ))
                              ) : (
                                <MenuItem value="" disabled>
                                  No votes available
                                </MenuItem>
                              )}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={5}>
                          <FormControl fullWidth>
                            <InputLabel>Select Score</InputLabel>
                            <Select
                              value={item.score || ""}
                              onChange={(event) =>
                                handleScoredVoteChange(event, index, "score")
                              }
                              sx={{ background: "#fff" }}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                              <MenuItem value="Neutral">Neutral</MenuItem>
                              <MenuItem value="None">None</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={1}>
                          <DeleteForeverIcon
                            onClick={() => handleRemoveScoredVote(index)}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                  <Grid size={1}></Grid>
                  <Grid size={10} sx={{ textAlign: "right" }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddScoredVote}
                    >
                      Add Vote
                    </Button>
                  </Grid>
                  <Grid size={1}></Grid>

                  <Grid rowSpacing={2} sx={{ width: "100%" }}>
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
                      <Grid size={4}>
                        <FormControl fullWidth>
                          <Select
                            value={formData.activitiesScore}
                            name="activitiesScore"
                            onChange={handleChange}
                            sx={{ background: "#fff" }}
                          >
                            <MenuItem value="New York">New York</MenuItem>
                            <MenuItem value="Chicago">Chicago</MenuItem>
                            <MenuItem value="NC">NC</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={5}>
                        <FormControl fullWidth>
                          <Select
                            value={formData.activitiesScore}
                            name="activitiesScore"
                            onChange={handleChange}
                            sx={{ background: "#fff" }}
                          >
                            <MenuItem value="New York">New York</MenuItem>
                            <MenuItem value="Chicago">Chicago</MenuItem>
                            <MenuItem value="NC">NC</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={1}>
                        <DeleteForeverIcon />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid size={1}></Grid>
                  <Grid size={10} sx={{ textAlign: "right" }}>
                    <Button variant="contained" startIcon={<AddIcon />}>
                      Add Activity
                    </Button>
                  </Grid>
                  <Grid size={1}></Grid>
                </Grid>
              </Box>
            </Paper>
          </Stack>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
          <Copyright sx={{ my: 4 }} />
        </Box>
      </Box>
    </AppTheme>
  );
}