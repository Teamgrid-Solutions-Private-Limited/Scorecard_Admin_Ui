import * as React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {jwtDecode} from "jwt-decode";
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
import {
  createTerm,
  getAllTerms,
  deleteTerm,
} from "../redux/reducer/termSlice";
import { Add, Delete } from "@mui/icons-material";
import AppTheme from "../../src/shared-theme/AppTheme";
import SideMenu from "../components/SideMenu";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";

export default function ManageTerm(props) {
  const dispatch = useDispatch();
  const { terms, loading } = useSelector((state) => state.term);

  // New state for term inputs
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState(null);

  const token = localStorage.getItem("token");
  // Decode token to get user role
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  const handleOpenConfirm = (termId) => {
    setSelectedTermId(termId);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedTermId(null);
  };

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

const handleConfirmDelete = async () => {
  try {
    await dispatch(deleteTerm(selectedTermId)).unwrap();
    handleSnackbarOpen("Term deleted successfully");
    dispatch(getAllTerms());
  } catch (error) {
    console.error("Failed to delete term:", error);
    handleSnackbarOpen(error.message || "Error deleting term", "error");
  } finally {
    handleCloseConfirm();
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

      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f6f6f6ff" }}>
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
              mx: 2.5,
              mt: 4,
              // px: 3,
              // maxWidth: "1200px",
              // width: "100%",
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
                        backgroundColor: "#fff",
                      }}
                    >
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
                            bgcolor: "#173A5E",
                            color: "#fff",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        >
                          Congress:{" "}
                          {term.congresses?.length
                            ? term.congresses.join(", ")
                            : "N/A"}
                        </Paper>
                      </Stack>

                      {/* Delete Button */}
                      {
                        userRole === 'admin' &&
                          <Tooltip title="Delete term">
                        <IconButton
                          color="error"
                           onClick={() => handleOpenConfirm(term._id)}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      }
                    
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
<Dialog
  open={openConfirm}
  onClose={handleCloseConfirm}
  aria-labelledby="confirm-dialog"
  PaperProps={{
    sx: { borderRadius: 3, padding: 2, minWidth: 350 },
  }}
>
  <DialogTitle
    id="confirm-dialog"
    sx={{
      fontSize: "1.4rem",
      fontWeight: "bold",
      textAlign: "center",
      color: "error.main",
    }}
  >
    Confirm Deletion
  </DialogTitle>

  <DialogContent>
    <DialogContentText
      sx={{
        textAlign: "center",
        fontSize: "1rem",
        color: "text.secondary",
      }}
    >
      Are you sure you want to delete this term? <br />
      <strong>This action cannot be undone.</strong>
    </DialogContentText>
  </DialogContent>

  <DialogActions>
    <Stack
      direction="row"
      spacing={2}
      sx={{
        width: "100%",
        justifyContent: "center",
        paddingBottom: 2,
      }}
    >
      <Button
        onClick={handleCloseConfirm}
        variant="outlined"
        color="secondary"
        sx={{ borderRadius: 2, paddingX: 3 }}
      >
        Cancel
      </Button>

      <Button
        onClick={handleConfirmDelete}
        variant="contained"
        color="error"
        sx={{ borderRadius: 2, paddingX: 3 }}
        autoFocus
      >
        Delete
      </Button>
    </Stack>
  </DialogActions>
</Dialog>



    </AppTheme>
    
  );
}
