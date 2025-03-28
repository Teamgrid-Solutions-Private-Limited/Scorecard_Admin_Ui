import * as React from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getVoteById, clearVoteState, updateVote, createVote } from "../redux/slice/voteSlice"; // Import clearVoteState
import { getAllTerms } from "../redux/slice/termSlice";
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
import { InputAdornment } from "@mui/material";

export default function AddBill(props) {
  const { id } = useParams();
  const [age, setAge] = React.useState("");
  const dispatch = useDispatch();
  const { vote: selectedVote } = useSelector((state) => state.vote);
  const { terms } = useSelector((state) => state.term);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    shortDescription: "",
    longDescription: "",
    date: "",
    congress: "",
    term: "",
    rollCall: "",
    readMore: "",
  });

  // const preFillForm = () => {
  //   if (selectedVote) {
  //     console.log("Selected Vote:", selectedVote);
  //     console.log("Terms:", terms);
  //     const termId = selectedVote.termId && terms.length > 0
  //       ? terms.find(term => term._id === selectedVote.termId)?._id || ""
  //       : "";
  //     console.log("Term ID:", termId);
  //     setFormData({
  //       type: selectedVote.type === "senate_bill" ? "senate" : selectedVote.type === "house_bill" ? "house" : "",
  //       title: selectedVote.title || "",
  //       shortDescription: selectedVote.shortDesc || selectedVote.shortDescription || "",
  //       longDescription: selectedVote.longDesc || selectedVote.longDescription || "",
  //       date: selectedVote.date ? selectedVote.date.split("T")[0] : "",
  //       congress: selectedVote.congress || "",
  //       term: termId,
  //       rollCall: selectedVote.rollCall || "",
  //       readMore: selectedVote.readMore || "",
  //     });
  //   }
  // };

  const preFillForm = () => {
    if (selectedVote) {
      const termId = selectedVote.termId?._id || "";
      
      setFormData({
        type: selectedVote.type === "senate_bill" ? "senate" : selectedVote.type === "house_bill" ? "house" : "",
        title: selectedVote.title || "",
        shortDescription: selectedVote.shortDesc || selectedVote.shortDescription || "",
        longDescription: selectedVote.longDesc || selectedVote.longDescription || "",
        date: selectedVote.date ? selectedVote.date.split("T")[0] : "",
        congress: selectedVote.congress || "",
        term: termId,
        rollCall: selectedVote.rollCall || "",
        readMore: selectedVote.readMore || "",
      });
    }
  };
  
  useEffect(() => {
    if (id) {
      dispatch(getVoteById(id));
    }
    dispatch(getAllTerms());
  
    return () => {
      dispatch(clearVoteState());
    };
  }, [id, dispatch]);

  useEffect(() => {
 
    preFillForm();
  }, [selectedVote, terms]);

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
  const handleEditorChange = (content, editor, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: content }));
  };
 

  const handleSubmit = () => {
   
    if (id) {
      dispatch(updateVote({ id, updatedData: formData })); // Dispatch updateVote action with formData
    } else {
      dispatch(createVote(formData)); // Dispatch createVote action with formData
    }
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
              sx={[{ paddingTop: "50px", color: "text.secondary" }]}
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
              <Button variant="contained" onClick={handleSubmit}>Save</Button>
              <Button variant="outlined">Fetch Data from Quorum</Button>
            </Stack>

            <div className="spacer"></div>

            <Paper elevation={2} sx={{ width: "100%", marginBottom: "50px" }}>
              <Box sx={{ padding: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
                  Bill's Information
                </Typography>
                <Grid container rowSpacing={2} columnSpacing={2} alignItems={"center"}>
                  <Grid size={2}>
                    <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: "end", fontWeight: 700, my: 0, width: "100%" }}>
                      Type
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                    <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: "end", fontWeight: 700, my: 0, width: "100%" }}>
                      Title
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                    <InputLabel sx={{ display: "flex", justifyContent: "end", fontWeight: 700, my: 0 }}>
                      Short Description
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <Editor
                      apiKey="nbxuqfjn2kwm9382tv3bi98nn95itbawmplf1l3x826f16u4"
                      value={formData.shortDescription}
                      onEditorChange={(content, editor) => handleEditorChange(content, editor, "shortDescription")}
                      init={{
                        height: 250,
                        menubar: false,
                        plugins: [
                          "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media", "table", "code", "help", "wordcount",
                        ],
                        toolbar: "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </Grid>

                  <Grid size={2}>
                    <InputLabel sx={{ display: "flex", justifyContent: "end", fontWeight: 700, my: 0 }}>
                      Long Description
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <Editor
                      apiKey="nbxuqfjn2kwm9382tv3bi98nn95itbawmplf1l3x826f16u4"
                      value={formData.longDescription}
                      onEditorChange={(content, editor) => handleEditorChange(content, editor, "longDescription")}
                      init={{
                        height: 250,
                        menubar: false,
                        plugins: [
                          "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media", "table", "code", "help", "wordcount",
                        ],
                        toolbar: "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </Grid>

                  <Grid size={2}>
                    <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: "end", fontWeight: 700, my: 0, width: "100%" }}>
                      Date
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                    <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: "end", fontWeight: 700, my: 0, width: "100%" }}>
                      Congress
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                    <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: "end", fontWeight: 700, my: 0, width: "100%" }}>
                      Term
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.term || ""}
                        id="term"
                        name="term"
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
                    <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: "end", fontWeight: 700, my: 0, width: "100%" }}>
                      Roll Call
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                              <Typography fontWeight="500" sx={{ fontSize: "13px", backgroundColor: "#F9F9F9" }}>
                                URL:
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
                  </Grid>

                  <Grid size={2}>
                    <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: "end", fontWeight: 700, my: 0, width: "100%" }}>
                      Read More
                    </InputLabel>
                  </Grid>
                  <Grid size={4}>
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
                              <Typography fontWeight="500" sx={{ fontSize: "13px", backgroundColor: "#F9F9F9" }}>
                                URL:
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FormControl>
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