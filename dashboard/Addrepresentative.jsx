import * as React from "react";
import { useRef , useCallback} from "react";
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
import {clearHouseState} from "../redux/slice/houseSlice"

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

export default function Addrepresentative(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { house } = useSelector((state) => state.house);
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const  houseData  = useSelector((state) => state.houseData);

  const [houseTermData, setHouseTermData] = useState({
    houseId: id,
    summary: "",
    rating: "",
    votesScore:[{voteId:null, score:""}],
    currentTerm:false,
    termId: null
  })

  const handleTermChange = (e)=>{
    setHouseTermData({...houseTermData, [e.target.name]:e.target.value});
  }

  const handleSwitchChange = (e)=>{
    setHouseTermData({...houseTermData, [e.target.name]:e.target.checked});
  }

  const handleAddVote = () => {
    setHouseTermData((prev) => ({
      ...prev,
      votesScore: [
        ...prev.votesScore,
        { voteId: null, score: "" }, // New empty vote
      ],
    }));
  };

  const handleRemoveVote = (index) => {
    setHouseTermData((prev) => ({
      ...prev,
      votesScore: prev.votesScore.filter((_, i) => i !== index),
    }));
  };

  const handleVoteChange = (index, field, value) => {
    setHouseTermData((prev) => {
      const updatedVotes = [...prev.votesScore];
      updatedVotes[index] = {
        ...updatedVotes[index],
        [field]: value,
      };
      return {
        ...prev,
        votesScore: updatedVotes,
      };
    });
  };
    const contentRef = useRef("");

     const handleEditorChange = useCallback((content) => {
        contentRef.current = content;
      }, []);

       const handleBlur = useCallback(() => {
          setHouseTermData((prev) => ({
            ...prev,
            summary: contentRef.current,
          }));
        }, []);


        const termPreFill = ()=>{
          if (houseData?.currentHouse?.[0]){
            const currentTerm = houseData.currentHouse[0]


            const matchedTerm = terms?.find(
              (term)=>term.name === currentTerm.termId?.name
            );

            const votes = 
              currentTerm.votesScore?.length>0
              ? currentTerm.votesScore.map((vote)=>({
                voteId: vote.voteId || null,
                score: vote.score || "",
              }))
              :
              [{voteId:null, score:""}];

             

              setHouseTermData({
                summary:currentTerm.summary || "",
                rating: currentTerm.rating || "",
                termId: matchedTerm._id || "",
                currentTerm: currentTerm.currentTerm || false,
                votesScore: votes,
              })
          }else{
            setHouseTermData((prev)=>({
              ...prev,
              votesScore: [{voteId:null, score:""}],
            }))
          }
        }

        useEffect(()=>{
          termPreFill()
        },[id,houseData])

  const [formData, setFormData] = useState({
    name: "",
    district: "",
    party: "",
    photo: null,
    status:""
  
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Can be "success", "error", "warning", or "info"

  const preFillForm = ()=>{
    if(house){
      setFormData({
        name:house.name || "",
        district:house.district || "",
        party:house.party || "",
        photo:house.photo || "",
        status:house.status || ""
      })
    }
  }

  useEffect(()=>{
    if(id){
      dispatch(getHouseById(id));
      dispatch(getHouseDataByHouseId(id));
    }
    dispatch(getAllTerms());
    dispatch(getAllVotes());

    return ()=>{
      dispatch(clearHouseState());
      dispatch(clearHouseDataState())

    }

  },[id, dispatch])

  useEffect(()=>{
    preFillForm()
  },[house,terms])

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

      const existingTermData = houseData?.currentHouse?.[0];
      console.log("existing term data:", existingTermData)
      let operationType = null;
  
      try {
        // --- Update or Create Senator Term Data ---
        if (existingTermData) {
          await dispatch(
            updateHouseData({
              id: existingTermData._id,
              data: houseTermData,
            })
          ).unwrap();
          operationType = "update";
        } else {
          await dispatch(createHouseData(houseTermData)).unwrap();
          operationType = "create";
        }
        await dispatch(getHouseDataByHouseId(id)).unwrap();
  
        // ===== (2) Handle Senator Data =========
        if (id) {
          const updatedData = new FormData();
  
          Object.entries(formData).forEach(([key, value]) => {
            if (value) updatedData.append(key, value);
          });
  
          updatedData.append("votes", JSON.stringify(vote));
  
          if (formData.term) updatedData.append("termId", formData.term);
          if (formData.bill) updatedData.append("billId", formData.bill);
  
          await dispatch(updateHouse({ id, formData: updatedData })).unwrap();
        }
  
        if (operationType === "create") {
          handleSnackbarOpen("Data created successfully!", "success");
        } else {
          handleSnackbarOpen("Data updated successfully!", "success");
        }
      } catch (error) {
        console.error("Save failed:", error);
        handleSnackbarOpen("Failed to save: " + error.message, "error");
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
                        value={houseTermData.termId || ""}
                        onChange={(event)=> handleTermChange(event)}
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
                        value={houseTermData.rating || ""}
                        name="rating"
                        onChange={(event)=>handleTermChange(event)}
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="" disabled>
                          Select a rating
                        </MenuItem>{" "}
                        {
                          rating.map((rate,index)=>(
                            <MenuItem key={index} value={rate}>
                              {rate}
                            </MenuItem>
                          ))
                        }
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
                      initialValue={houseTermData.summary}
                      name="summary"
                    
                      onEditorChange={handleEditorChange}
                      onBlur={handleBlur}
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
                      checked={houseTermData.currentTerm }
                      onChange={handleSwitchChange}
                      color="warning"
                    />
                  </Grid>

                   {houseTermData.votesScore.map((vote, index) => (
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
                                                value={vote.voteId || ""}
                                                onChange={(event) =>
                                                  handleVoteChange(
                                                    index,
                                                    "voteId",
                                                    event.target.value
                                                  )
                                                }
                                                sx={{ background: "#fff" }}
                                              >
                                                <MenuItem value="" disabled>
                                                  Select a Bill
                                                </MenuItem>
                                                {votes && votes.length > 0 ? (
                                                  votes.map((voteItem) => (
                                                    <MenuItem
                                                      key={voteItem._id}
                                                      value={voteItem._id}
                                                    >
                                                      {voteItem.title}
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
                                                value={vote.score || ""}
                                                onChange={(event) =>
                                                  handleVoteChange(
                                                    index,
                                                    "score",
                                                    event.target.value
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
                                          <Grid size={1}>
                                            <DeleteForeverIcon
                                              onClick={() => handleRemoveVote(index)}
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
                      onClick={handleAddVote}
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