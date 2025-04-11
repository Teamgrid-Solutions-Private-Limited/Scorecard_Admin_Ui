import * as React from "react";
import { useRef, useCallback } from "react";
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
import { rating } from "./global/common";
import { clearHouseState } from "../redux/slice/houseSlice";

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
  clearHouseDataState,
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
import FixedHeader from "./components/FixedHeader";
import Footer from "./components/Footer";

export default function Addrepresentative(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { house } = useSelector((state) => state.house);
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const houseData = useSelector((state) => state.houseData);

  // Initialize as an array to support multiple terms
  const [houseTermData, setHouseTermData] = useState([
    {
      houseId: id,
      summary: "",
      rating: "",
      votesScore: [{ voteId: null, score: "" }],
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
              ? term.votesScore.map((vote) => ({
                  voteId: vote.voteId || null,
                  score: vote.score || "",
                }))
              : [{ voteId: null, score: "" }],
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
      });
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(getHouseById(id));
      dispatch(getHouseDataByHouseId(id));
    }
    dispatch(getAllTerms());
    dispatch(getAllVotes());

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

  const handleSave = async (e) => {
    e.preventDefault();
    let operationType = "";

    try {
      // First handle house data
      if (id) {
        const updatedData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) updatedData.append(key, value);
        });
        await dispatch(updateHouse({ id, formData: updatedData })).unwrap();
        operationType = "Updated";
      }

      // Then handle house term data
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
      await dispatch(getHouseDataByHouseId(id)).unwrap();

      handleSnackbarOpen(`Data ${operationType} successfully!`, "success");
    } catch (error) {
      console.error("Save failed:", error);
      handleSnackbarOpen("Failed to save: " + error.message, "error");
    }
  };

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

  const handleRemoveActivity = (index) => {
    setActivity((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setVote([...vote, { id: vote.length + 1, option1: "", option2: "" }]);
  };

  const handleRemove = (id) => {
    setVote(vote.filter((item) => item.id !== id));
  };

  const label = { inputProps: { "aria-label": "Color switch demo" } };

  return (
    <AppTheme>
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <Box
          component="main"
          sx={(theme) => ({
            width:"80%",
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
                      aria-label="Basic button group"
                    >
                      <Button
                        variant={
                          formData.status === "Active"
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => handleStatusChange("Active")}
                      >
                        Active
                      </Button>
                      <Button
                        variant={
                          formData.status === "Former"
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => handleStatusChange("Former")}
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
                    <Grid size={4}>
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
                    <Grid size={1.5}>
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
                    <Grid size={4.5}>
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
                    <Grid size={10}>
                      <Editor
                        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
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
                        checked={term.currentTerm}
                        onChange={(e) => handleSwitchChange(e, termIndex)}
                        color="warning"
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
                                      width:400,
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
                                <MenuItem value="Yes">Yes</MenuItem>
                                <MenuItem value="No">No</MenuItem>
                                <MenuItem value="Neutral">Neutral</MenuItem>
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
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddVote(termIndex)}
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
                        <Grid size={7.5}>
                          <FormControl fullWidth>
                            <TextField
                              value={formData.activitiesScore}
                              name="activitiesScore"
                              onChange={handleChange}
                              sx={{ background: "#fff" }}
                              placeholder="No Activity"
                              disabled
                            ></TextField>
                          </FormControl>
                        </Grid>
                        <Grid size={1.6}>
                          <FormControl fullWidth>
                            <TextField
                              value={formData.activitiesScore}
                              name="activitiesScore"
                              onChange={handleChange}
                              sx={{
                                background: "#fff",
                                "& MuiOutlinedInput-root": {
                                  "&:hover fieldset": {
                                    borderColor: "transparent",
                                  },
                                  "&.Mui-disabled fieldset": {
                                    borderColor: "transparent",
                                  },
                                },
                              }}
                              placeholder="Select"
                              disabled
                              
                            ></TextField>
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
            ))}

            {/* Add Term Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTerm}
              sx={{ alignSelf: "flex-start" }}
            >
              Add Another Term
            </Button>

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
          </Stack>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
