import * as React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  TextField,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import { createTerm, getAllTerms, updateTerm } from "../redux/reducer/termSlice";
import { Add, Edit, Save, Close } from "@mui/icons-material";
import AppTheme from "../../src/shared-theme/AppTheme";
import SideMenu from "../components/SideMenu";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";

export default function ManageTerm(props) {
  const dispatch = useDispatch();
  const { terms, loading } = useSelector((state) => state.term);

  // New state for term inputs
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedStartYear, setEditedStartYear] = useState("");
  const [editedEndYear, setEditedEndYear] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");




  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  useEffect(() => {
    dispatch(getAllTerms());
  }, [dispatch]);

  // ✅ Create Term
  const handleCreateTerm = async () => {
    if (!startYear.trim() || !endYear.trim()) {
      handleSnackbarOpen("Start and End Year are required", "error");
      return;
    }
    
    // Validate years
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    
    if (start >= end) {
      handleSnackbarOpen("End year must be greater than start year", "error");
      return;
    }
    
    try {
      await dispatch(createTerm({ startYear: start, endYear: end })).unwrap();
      setStartYear("");
      setEndYear("");
      handleSnackbarOpen("Term created successfully");
      dispatch(getAllTerms());
    } catch (error) {
      console.error("Failed to create term:", error);
      handleSnackbarOpen(error.message || "Error creating term", "error");
    }
  };

  const handleEditTerm = (term) => {
    setEditingId(term._id);
    setEditedStartYear(term.startYear.toString());
    setEditedEndYear(term.endYear.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedStartYear("");
    setEditedEndYear("");
  };

  const handleSaveChanges = async (termId) => {
    if (!editedStartYear.trim() || !editedEndYear.trim()) {
      handleSnackbarOpen("Start and End Year are required", "error");
      return;
    }
    
    const start = parseInt(editedStartYear);
    const end = parseInt(editedEndYear);
    
    if (start >= end) {
      handleSnackbarOpen("End year must be greater than start year", "error");
      return;
    }
    
    try {
      await dispatch(
        updateTerm({
          id: termId,
          updatedData: { 
            startYear: start, 
            endYear: end,
            // Name will be automatically generated on the backend
          },
        })
      ).unwrap();
      handleSnackbarOpen("Term Updated Successfully");
      dispatch(getAllTerms());
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update term:", error);
      handleSnackbarOpen(error.message || "Error updating term", "error");
    }
  };

  return (
    <AppTheme {...props}>
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
          <CircularProgress sx={{ color: "#CC9A3A" }} />
        </Box>
      )}

      <Box sx={{ display: "flex", minHeight: "100vh" ,bgcolor:'#f6f6f6ff',}}>
        <SideMenu />

        <Box
          sx={{
            width: "80%",
            flexGrow: 1,
            filter: loading ? "blur(1px)" : "none",
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          <FixedHeader />
          <MobileHeader />
          <Box
            sx={{
              mx: "auto",
              mt: 4,
              px: 3,
              maxWidth: "1200px",
              width: "100%",
              pb: 5,
            }}
          >
            {/* Snackbar */}
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

            {/* Add Term Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography sx={{ mb: 2, fontWeight: 500 }}>
                Add New Term
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Start Year"
                  size="small"
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="End Year"
                  size="small"
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
                <Button
                  startIcon={<Add />}
                  onClick={handleCreateTerm}
                  sx={{
                    minWidth: 120,
                    textTransform: "none",
                    boxShadow: "none",
                    bgcolor: "#173A5E",
                    color: "#fff",
                    "&:hover": { boxShadow: "none", bgcolor: "#1E4C80" },
                  }}
                >
                  Add Term
                </Button>
              </Stack>
            </Paper>

            {/* Term List */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Terms List
              </Typography>

              {terms?.length ? (
                <Stack spacing={1.5}>
                  {terms.map((term, index) => (
                    <Paper
                      key={term._id}
                      elevation={0}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderRadius: 1,
                        backgroundColor:
                          editingId === term._id
                            ? "action.selected"
                            : "#fff",
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      {editingId === term._id ? (
                        <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                          <TextField
                            label="Start Year"
                            size="small"
                            type="number"
                            value={editedStartYear}
                            onChange={(e) => setEditedStartYear(e.target.value)}
                            sx={{ width: 120 }}
                          />
                          <TextField
                            label="End Year"
                            size="small"
                            type="number"
                            value={editedEndYear}
                            onChange={(e) => setEditedEndYear(e.target.value)}
                            sx={{ width: 120 }}
                          />
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1">
                            {index + 1}. {term.name}
                          </Typography>

                          <Paper
                            elevation={0}
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: "primary.main",
                              color: "#fff",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Congress: {term.congresses.map((c) => c).join(", ")}
                          </Paper>
                        </Stack>
                      )}

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {editingId === term._id ? (
                          <>
                            <Tooltip title="Save changes">
                              <span>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleSaveChanges(term._id)}
                                  disabled={
                                    !editedStartYear.trim() ||
                                    !editedEndYear.trim()
                                  }
                                  size="small"
                                >
                                  <Save fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton
                                color="error"
                                onClick={handleCancelEdit}
                                size="small"
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                            <Tooltip title="Edit term">
                              <span>
                            <IconButton
                              color="primary"
                              onClick={() => handleEditTerm(term)}
                              disabled={loading || editingId !== null}
                              size="small"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </span>
                          </Tooltip>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: 1,
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    No terms available. Add a new term above.
                  </Typography>
                </Box>
              )}
            </Paper>
            <Footer />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}