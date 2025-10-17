import * as React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Stack,
  Typography,
  Button,
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
  DialogActions,
} from "@mui/material";
import LoadingOverlay from "../components/LoadingOverlay";

export default function ManageTerm(props) {
  const dispatch = useDispatch();
  const { terms, loading } = useSelector((state) => state.term);

  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState(null);

  const token = localStorage.getItem("token");
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

  const handleCreateTerm = async () => {
    if (!startYear.trim() || !endYear.trim()) {
      handleSnackbarOpen("Start and End Year are required", "error");
      return;
    }

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
      <LoadingOverlay loading={loading} />

      <Box className="main-layout">
        <SideMenu />

        <Box className={`content-wrapper ${loading ? "loading-blur" : ""}`}>
          <FixedHeader />
          <MobileHeader />
          <Box className="content-box">
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MuiAlert
                onClose={handleSnackbarClose}
                severity={snackbarSeverity}
                className={`custom-snackbar ${
                  snackbarMessage === "Term deleted successfully"
                    ? "snackbar-delete"
                    : snackbarMessage === "Term created successfully"
                    ? "snackbar-create"
                    : ""
                }`}
                elevation={6}
                variant="filled"
              >
                {snackbarMessage}
              </MuiAlert>
            </Snackbar>

            <Paper elevation={0} className="paper-box">
              <Box className="paper-header">
                <Typography variant="h6" className="paper-title">
                  Manage Terms
                </Typography>
                <Typography variant="body2" className="paper-subtitle">
                  Define Term Duration (Start Year – End Year)
                </Typography>
              </Box>
              <Stack
                direction="row-responsive"
                spacing={2}
                className="input-stack"
              >
                <TextField
                  fullWidth
                  label="Start Year"
                  size="small"
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="term-input"
                />
                <TextField
                  fullWidth
                  label="End Year"
                  size="small"
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="term-input"
                />
                <Button
                  startIcon={<Add />}
                  onClick={handleCreateTerm}
                  className="add-term-btn"
                >
                  Add Term
                </Button>
              </Stack>
            </Paper>

            <Paper elevation={0} className="terms-list-container">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 500, color: "#173A5E" }}
                >
                  Terms List
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {terms?.length || 0} total
                </Typography>
              </Box>

              {terms?.length ? (
                <Stack spacing={1.5}>
                  {terms.map((term, index) => (
                    <Paper key={term._id} elevation={0} className="term-item">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            {term.name}
                          </Typography>
                        </Box>

                        <Paper elevation={0} className="congress-tag">
                          <Typography sx={{ fontSize: "12px" }}>
                            Congress:{" "}
                            {term.congresses?.length
                              ? term.congresses.join(", ")
                              : "N/A"}
                          </Typography>
                        </Paper>
                      </Stack>

                      {/* Delete Button */}
                      {userRole === "admin" && (
                        <Tooltip title="Delete term">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenConfirm(term._id)}
                            size="small"
                            sx={{ ml: 2 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box className="terms-empty-box">
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
          sx: { borderRadius: 3, padding: 2, width: "90%", maxWidth: 420 },
        }}
      >
        <DialogTitle id="confirm-dialog" className="dialogBox">
          Confirm Deletion
        </DialogTitle>

        <DialogContent>
          <DialogContentText className="dialogTitle">
            Are you sure you want to delete this term? <br />
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
