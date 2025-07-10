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
  Alert,
} from "@mui/material";
import { createTerm, getAllTerms, updateTerm } from "../redux/reducer/termSlice";
import { Add, Edit, Save, Close, CheckCircle } from "@mui/icons-material";
import AppTheme from "../../src/shared-theme/AppTheme";
import SideMenu from "../components/SideMenu";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";

export default function ManageTerm(props) {
  const dispatch = useDispatch();
  const { terms, loading, error } = useSelector((state) => state.term);
  const [newTermName, setNewTermName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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
    dispatch(getAllTerms());
  }, [dispatch]);

  const handleCreateTerm = async () => {
    if (!newTermName.trim()) return;
    try {
      await dispatch(createTerm({ name: newTermName })).unwrap();
      setNewTermName("");
      handleSnackbarOpen("Term created successfully");
      dispatch(getAllTerms());
    } catch (error) {
      console.error("Failed to create term:", error);
    }
  };

  const handleEditTerm = (term) => {
    setEditingId(term._id);
    setEditedName(term.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedName("");
  };

  const handleSaveChanges = async (termId) => {
    if (!editedName.trim()) return;
    try {
      await dispatch(
        updateTerm({
          id: termId,
          updatedData: { name: editedName },
        })
      ).unwrap();
      handleSnackbarOpen("Term Updated Successfully");
      dispatch(getAllTerms());
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update term:", error);
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

      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <SideMenu />

        <Box
          sx={{
            width:"80%",
            flexGrow: 1,
            filter: loading ? "blur(1px)" : "none",
            pointerEvents: loading ? "none" : "auto",
          }}
        >
          <FixedHeader />
          <Box
            sx={{
              mx: "auto",
              mt: 0,
              px: 3,
              maxWidth: "1200px",
              width: "100%",
              pb: 5,
            }}
          >
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

            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Manage Terms
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 2,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography  sx={{ mb: 2, fontWeight: 500 }}>
                Add New Term
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Term Name"
                  size="small"
                  value={newTermName}
                  onChange={(e) => setNewTermName(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      backgroundColor: "background.default",
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
                    bgcolor: "#4a90e2",
                    color: "#fff",
                    "&:hover": { boxShadow: "none", bgcolor: "#7b1fe0" },
                  }}
                >
                  Add Term
                </Button>
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: "background.paper",
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
                            : "background.default",
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      {editingId === term._id ? (
                        <TextField
                          fullWidth
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          size="small"
                          sx={{ mr: 2 }}
                          autoFocus
                        />
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              editingId === term._id ? 500 : "inherit",
                          }}
                        >
                          {index + 1}. {term.name}
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {editingId === term._id ? (
                          <>
                            <Tooltip title="Save changes">
                              <IconButton
                                color="primary"
                                onClick={() => handleSaveChanges(term._id)}
                                disabled={!editedName.trim()}
                                size="small"
                              >
                                <Save fontSize="small" />
                              </IconButton>
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
                            <IconButton
                              color="primary"
                              onClick={() => handleEditTerm(term)}
                              disabled={loading || editingId !== null}
                              size="small"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
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
                    backgroundColor: "background.default",
                    borderRadius: 1,
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    No terms available. Add a new term above.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          <Footer
            sx={{
              mt: "auto",
              py: 2,
              backgroundColor: "background.default",
              textAlign: "center",
              width: "100%",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © 2025 Susan B. Anthony Pro-life America. All rights reserved.
            </Typography>
          </Footer>
        </Box>
      </Box>
    </AppTheme>
  );
}
