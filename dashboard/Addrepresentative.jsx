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
import { getHouseById, updateHouse } from "../redux/slice/houseSlice";
import {
  getHouseDataByHouseId,
  updateHouseData,
  createHouseData,
  getHouseDataById,
} from "../redux/slice/houseTermSlice";
import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
} from "../redux/slice/voteSlice";
import { getAllTerms } from "../redux/slice/termSlice";
export default function Addrepresentative(props) {
  const [age, setAge] = React.useState("");
  const { id } = useParams();
  const dispatch = useDispatch();
  const { house: selectedHouse } = useSelector((state) => state.house);
  const { houseData: selectedHouseData } = useSelector(
    (state) => state.houseData
  );
  const { terms } = useSelector((state) => state.term);
  const { vote: selectedVote } = useSelector((state) => state.vote);
  const [formData, setFormData] = useState({
    name: "", // Avoid undefined values
    btn: "",
    district: "", // Provide a default valid value
    party: "",
    photo: "",
    photoPreview: "",
    //term
    termId: "",
    rating: "",
    summary: "",
    currentTerm: "",
    votesScore: "",
    activitiesScore: "",
  });

  useEffect(() => {
    console.log("ID from URL:", id);
    if (id) {
      dispatch(getHouseById(id));
      dispatch(getHouseDataByHouseId(id));
    }
    dispatch(getAllTerms());
    return () => {
      dispatch(clearVoteState());
    };
  }, [id, dispatch]);

  useEffect(() => {
    console.log("Prefilling Form with:", selectedHouse); // Debugging log
    console.log("house term selected data:", selectedHouseData); // Debugging log
    preFillForm();
    // }
  }, [selectedHouse, selectedHouseData, terms]);
  const preFillForm = () => {
    if (selectedHouse || selectedHouseData) {
      const extractedState = selectedHouse?.district?.split(", ").pop() || ""; // Extracts the last part after the comma
      // const termId=selectedHouseData?.termId ||selectedHouseData?.termId?._id ||"";
      const termId =
        selectedHouseData[0]?.termId?._id || selectedHouseData?.termId || "";
      console.log("Extracted termId:", termId); // Debugging log

      setFormData({
        name: selectedHouse?.name || "",
        btn: selectedHouse?.btn || "",
        district: extractedState, // Extracted from district
        party: selectedHouse?.party || "",
        photo: selectedHouse?.photo || "",
        //termHouse
        termId: termId || "",
        rating: selectedHouseData[0]?.rating || "",
        summary: selectedHouseData[0]?.summary || "hello summary",
        currentTerm: selectedHouseData[0]?.currentTerm || "true",
        votesScore: selectedHouseData[0]?.votesScore?._id || "",
        activitiesScore: selectedHouseData[0]?.activitiesScore?.score || "",
      });
    }
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
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file), // Generate preview URL
      }));
    }
  };
  const handleChange = (event) => {
    setAge(event.target.value);
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditorChange = (content, editor, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: content }));
  };
  //handle Submission
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

      alert("Operation successful!");
    } catch (error) {
      console.error("Save operation failed:", error);
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
                    backgroundColor: "green", // Change background color on hover
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
                      State
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
                    <FormControl fullWidth>
                      <Select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="New York">New York</MenuItem>
                        <MenuItem value="Chicago">Chicago</MenuItem>
                        <MenuItem value="California">California</MenuItem>
                        <MenuItem value="Nc">NC</MenuItem>
                      </Select>
                    </FormControl>
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
                        <MenuItem value="F">F</MenuItem>
                        <MenuItem value="B">B</MenuItem>
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
                      initialValue="Test"
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

                  {/* Vote Repeater Start */}
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
                          Scored Vote
                        </InputLabel>
                      </Grid>
                      <Grid size={4}>
                        <FormControl fullWidth>
                          <Select
                            value={formData.votesScore}
                            name="votesScore"
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
                            value={formData.votesScore}
                            name="votesScore"
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
                  {/* Vote Repeater Ends */}

                  <Grid size={1}></Grid>
                  <Grid size={10} sx={{ textAlign: "right" }}>
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
                  {/* Activity Repeater Ends */}

                  <Grid size={1}></Grid>
                  <Grid size={10} sx={{ textAlign: "right" }}>
                    <Button variant="contained" startIcon={<AddIcon />}>
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
