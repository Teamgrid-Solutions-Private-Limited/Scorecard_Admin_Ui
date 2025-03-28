import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { alpha, styled } from "@mui/material/styles";
 
import { getSenatorDataBySenetorId } from "../redux/slice/senetorTermSlice";
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
import { useDispatch, useSelector } from "react-redux";
import { rating } from "./global/common";
import { useParams } from "react-router-dom";
import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
  getAllVotes,
} from "../redux/slice/voteSlice";
import {
  getSenatorById,
  updateSenator,
  clearSenatorState,
} from "../redux/slice/senetorSlice";
import { getAllTerms } from "../redux/slice/termSlice";

export default function AddSenator(props) {
  const { id } = useParams(); // Get the senator ID from the URL
  const dispatch = useDispatch();
  const { senator } = useSelector((state) => state.senator); // Access senator details from Redux state
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const [formData, setFormData] = useState(
    {
      name: "",
      status: "",
      state: "",
      party: "",
      photo: null,
      term: "",
      bill:""
    },
    []
  );
  const preFillForm = () => {
    if (senator) {
      const termId =
        senator.termId && terms.length > 0
          ? terms.find((term) => term._id === senator.termId)?._id || ""
          : "";
      setFormData({
        name: senator.name || "",
        status: senator.status || "",
        state: senator.state || "",
        party: senator.party || "",
        photo: senator.photo || null, // Photo will not be pre-filled
        term: termId,
      });
    }
  };
  useEffect(() => {
    if (id) {
      dispatch(getSenatorById(id)); // Fetch senator details by ID
    }
    dispatch(getAllTerms());
    dispatch(getAllVotes());
    return () => {
      dispatch(clearSenatorState());
    };
  }, [id, dispatch]);

  useEffect(() => {
    console.log("Votes from Redux:", votes); // Log votes to verify
  }, [votes]);
  useEffect(() => {
    preFillForm(); // Pre-fill the form when senator details are fetched
  }, [senator, terms]);

  const handleVoteChange = (event, index, field) => {
    const { value } = event.target;
    setVote((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prev) => ({ ...prev, photo: file }));
  };
  const handleSave = async () => {
    if (id) {
      const updatedData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) updatedData.append(key, value);
      });
      // Add votes to the formData
      updatedData.append("votes", JSON.stringify(vote));
 if (formData.term) {
   updatedData.append("termId", formData.term); // Add termId
 }
 if (formData.bill) {
   updatedData.append("billId", formData.bill); // Add billId
 }
      try {
        await dispatch(updateSenator({ id, formData: updatedData })).unwrap(); // Wait for the update action to complete
        console.log("Update successful");
        alert("Update successful"); // Show success message
      } catch (error) {
        console.error("Update failed:", error);
        alert("Update failed. Please try again."); // Show error message
      }
    }
  };

  const [age, setAge] = React.useState("");
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

  // const handleChange = (event) => {
  //   setAge(event.target.value);
  // };

  const handleRemoveVote = (index) => {
    setVote((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStatusChange = (status) => {
    setFormData((prev) => ({ ...prev, status })); // Update the status in formData
  };
  const handleAdd = () => {
    setVote([...vote, { id: vote.length + 1, option1: "", option2: "" }]);
  };

  // Removed duplicate declaration of handleRemoveVote
  const handleRemoveActivity = (index) => {
    setActivity((prev) => prev.filter((_, i) => i !== index));
  };

  const label = { inputProps: { "aria-label": "Color switch demo" } };

  // const handleSave = () => {    
    
  // } 


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
            {/* <Header /> */}
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
                    backgroundColor: "green", // Change background color on hover
                  },
                }}
              >
                Save
              </Button>
              <Button variant="outlined">Fetch Senetors from Quorum</Button>
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
                      State
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      id="state"
                      name="state"
                      value={formData.state} // Display the state from formData
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
                  <Grid size={5}>
                    <TextField
                      id="party"
                      name="party"
                      value={formData.party} // Display the state from formData
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
                      {/* Preview the uploaded or dynamic image */}
                      {formData.photo ? (
                        <img
                          src={
                            typeof formData.photo === "string"
                              ? formData.photo // Dynamic image URL
                              : URL.createObjectURL(formData.photo) // Uploaded image preview
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

                      {/* Upload button */}
                      <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload files
                        <VisuallyHiddenInput
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*" // Optional: Restrict to image files
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
                  Senator's Term Information
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
                        value={formData.term || ""}
                        id="term"
                        name="term"
                        onChange={(event) => handleChange(event)}
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
                        value={formData.rating || ""} // Bind the selected value to formData.rating
                        id="rating"
                        name="rating"
                        onChange={(event) => handleChange(event)}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="" disabled>
                          Select a rating
                        </MenuItem>{" "}
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
                      apiKey="nbxuqfjn2kwm9382tv3bi98nn95itbawmplf1l3x826f16u4"
                      onInit={(_evt, editor) => (editorRef.current = editor)}
                      initialValue={formData.termSummary || ""}
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
                    <Switch {...label} color="warning" />
                  </Grid>

                  {/* Vote Repeater Start */}
                  {vote.map((item, index) => (
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
                           < Select
      value={formData.bill || ""} // Bind the selected value to formData.bill
      id="bill"
      name="bill"
      onChange={(event) => handleChange(event)} // Handle bill selection
      sx={{ background: "#fff" }}
    >
      <MenuItem value="" disabled>
        Select a Bill
      </MenuItem>
      {votes && votes.length > 0 ? (
        votes.map((vote) => (
          <MenuItem key={vote._id} value={vote._id}>
            {vote.title}
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
                        <Grid size={5}>
                          <FormControl fullWidth>
                            <Select
                              value={item.option2 || ""}
                              name={`vote-${index}`}
                              onChange={(event) =>
                                handleVoteChange(event, index, "option2")
                              }
                              sx={{ background: "#fff" }}
                            >
                              <MenuItem value={10}>Yes</MenuItem>
                              <MenuItem value={20}>No</MenuItem>
                              <MenuItem value={30}>Neutral</MenuItem>
                              <MenuItem value={30}>None</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={1}>
                          <DeleteForeverIcon
                            onClick={() => handleRemoveVote(index)}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                  {/* Vote Repeater Ends */}

                  <Grid size={1}></Grid>
                  <Grid size={10} sx={{ textAlign: "right" }} key={vote.id}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAdd}
                    >
                      Add Vote
                    </Button>
                  </Grid>
                  <Grid size={1}></Grid>
                  {/* Add Vote Repeater Button Ends */}

                  {/* Activity Repeater Start */}
                  {activity.map((item) => (
                    <Grid rowSpacing={2} sx={{ width: "100%" }} key={item.id}>
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
                              value={item.option1}
                              sx={{ background: "#fff" }}
                            >
                              <MenuItem value={10}>New York</MenuItem>
                              <MenuItem value={20}>Chicago</MenuItem>
                              <MenuItem value={30}>NC</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={5}>
                          <FormControl fullWidth>
                            <Select
                              value={item.option2}
                              sx={{ background: "#fff" }}
                            >
                              <MenuItem value={10}>New York</MenuItem>
                              <MenuItem value={20}>Chicago</MenuItem>
                              <MenuItem value={30}>NC</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={1}>
                          <DeleteForeverIcon
                            onClick={() => {
                              handleRemoveActivity(item.id);
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}

                  {/* Activity Repeater Ends */}

                  <Grid size={1}></Grid>
                  <Grid size={10} sx={{ textAlign: "right" }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        setActivity([
                          ...activity,
                          { id: activity.length + 1, option1: "", option2: "" },
                        ])
                      }
                    >
                      Add Activity
                    </Button>
                  </Grid>
                  <Grid size={1}></Grid>
                  {/* Add Activity Repeater Button Ends */}
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
