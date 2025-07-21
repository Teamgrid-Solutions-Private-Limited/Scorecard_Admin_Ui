import * as React from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
} from "../redux/reducer/voteSlice";
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

export default function AddBill(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { vote: selectedVote } = useSelector((state) => state.vote);
  const { terms } = useSelector((state) => state.term);
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
  });

  const preFillForm = () => {
    if (selectedVote) {
      const termId = selectedVote.termId?._id || "";
      setFormData({
        ...formData,
        type:
          selectedVote.type.includes("senate") 
            ? "senate"
            : selectedVote.type.includes("house")
            ? "house"
            : "",
        title: selectedVote.title || "",
        shortDesc: selectedVote.shortDesc || "",
        longDesc: selectedVote.longDesc || "",
        date: selectedVote.date ? selectedVote.date.split("T")[0] : "",
        congress: selectedVote.congress || "",
        termId: termId, // Correctly set termId
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
    if (selectedVote) {
      preFillForm();
    }
  }, [selectedVote]);

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
    if (!formData.termId) {
      setSnackbarMessage("Term is required!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return; 
    }
    setLoading(true);
    try {
      if (id) {
        await dispatch(updateVote({ id, updatedData: formData })).unwrap();
        setSnackbarMessage("Bill updated successfully!");
        setSnackbarSeverity("success");
      } else {
        await dispatch(createVote(formData)).unwrap();
        setSnackbarMessage("Bill created successfully!");
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
                  backgroundColor: "#9150e8 !important", // Force blue color
                  color: "white !important", // Force white text
                  padding: "0.5rem 1rem", // px-4 py-2
                  // borderRadius: "0.25rem", // rounded
                  marginLeft: "0.5rem", // ml-2
                  "&:hover": {
                    backgroundColor: "#7b1fe0 !important", // Same color on hover
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
                  Bill's Information
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
                      Title
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
                      Short Description
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <Editor
                      tinymceScriptSrc={`${
                        import.meta.env.BASE_URL
                      }tinymce/tinymce.min.js`}
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
                        justifyContent: "end",
                        fontWeight: 700,
                        my: 0,
                      }}
                    >
                      Long Description
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <Editor
                      apiKey="nbxuqfjn2kwm9382tv3bi98nn95itbawmplf1l3x826f16u4"
                      value={formData.longDesc}
                      onEditorChange={(content) =>
                        handleEditorChange(content, "longDesc")
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
                      Term
                    </InputLabel>
                  </Grid>
                  <Grid size={10}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.termId || ""}
                        id="termId"
                        name="termId"
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
                      Roll Call
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
