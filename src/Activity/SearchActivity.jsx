import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SideMenu from "../components/SideMenu";
import AppTheme from "../../src/shared-theme/AppTheme";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/errorHandler";
import { API_URL } from "../redux/API";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";
import { jwtDecode } from "jwt-decode";
import LoadingOverlay from "../components/LoadingOverlay";
import { getToken, getUser } from "../utils/auth";
import { useSnackbar } from "../hooks";

export default function SearchActivity() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const navigate = useNavigate();
  const token = getToken();
  const user = getUser();

  // Use centralized snackbar hook
  const {
    open: snackbarOpen,
    message: snackbarMessage,
    severity: snackbarSeverity,
    showSnackbar,
    hideSnackbar: handleSnackbarClose,
  } = useSnackbar();

  // ---------------------------
  // SEARCH HANDLER
  // ---------------------------
  const handleSearch = async () => {
    setLoading(true);
    setSearchAttempted(true);

    try {
      if (!searchQuery) {
        setSnackbarMessage("Fill the Field!");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      if (!token) {
        showSnackbar("Please log in to search bills", "error");
        setLoading(false);
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API_URL}/fetch-quorum/store-data`,
        {
          type: "bills",
          additionalParams: {
            title: searchQuery,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSearchResults(
        (Array.isArray(response.data?.data) ? response.data.data : []).filter(
          (item) => {
            const date = new Date(item.date);
            return (
              date instanceof Date && !isNaN(date) && date.getFullYear() >= 2015
            );
          }
        )
      );
    } catch (error) {
      console.error("Error searching bills:", error);
      const errorMessage = getErrorMessage(error, "Failed to search bills");
      showSnackbar(errorMessage, "error");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };


  // ADD ACTIVITY
 
  // const handleAddActivity = async (activity) => {
  //   setLoading(true);
  //   try {
  //     const editorInfo = getEditorInfo();

  //     // Convert Quorum format to backend format
  //     const activityData = {
  //       billId: String(activity.quorumId), 
  //       title: activity.title,
  //       introduced: activity.date, 
  //       congress: getCongressFromDate(activity.date),
  //       editorInfo,
  //     };

    

  //     const response = await axios.post(
  //       `${API_URL}/api/v1/activities/save`,
  //       activityData,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

    
  //     if (response.data.exists) {
  //       // Show already exists message
  //       setSnackbarMessage("Activity already exists");
  //       setSnackbarSeverity("warning");
  //       setSnackbarOpen(true);

  //       // Navigate to activities page
  //       return;
  //     }

  //     if (response.data.savedCount > 0) {
  //       navigate("/activities");
  //     }
  //   } catch (err) {
  //     console.error("Save error:", err.response?.data || err);
  //     setSnackbarMessage(
  //       err.response?.data?.message || "Failed to save activity"
  //     );
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleAddActivity = async (activity) => {
  setLoading(true);
  try {
    const editorInfo = getEditorInfo();
    const activityData = {
      billId: String(activity.quorumId),
      title: activity.title,
      introduced: activity.date,
      congress: getCongressFromDate(activity.date),
      editorInfo,
    };


    const response = await axios.post(
      `${API_URL}/api/v1/activities/save`,
      activityData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );


    if (response.data.exists) {
      showSnackbar("Activity already exists", "warning");
      return;
    }

    // Show success message and navigate to edit page
    showSnackbar(
      "Activity added successfully! Legislators are being assigned in the background.",
      "success"
    );

    // Navigate to edit activity page with the new activity ID
    if (response.data.activityId) {
      navigate(`/edit-activity/${response.data.activityId}`);
    }
  } catch (err) {
    console.error("Save error:", err.response?.data || err);
    showSnackbar(
      err.response?.data?.message || "Failed to save activity",
      "error"
    );
  } finally {
    setLoading(false);
  }
};
  // Helper function to determine congress from date
  const getCongressFromDate = (dateString) => {
    if (!dateString) return "118"; // Default to current congress

    const date = new Date(dateString);
    const year = date.getFullYear();

    // Simple congress calculation (each congress is 2 years, starting from 1789)
    const baseYear = 1789;
    const congress = Math.floor((year - baseYear) / 2) + 1;

    return congress.toString();
  };

  // ---------------------------
  // EDITOR INFO
  // ---------------------------
  const getEditorInfo = () => {
    try {
      if (!token) return null;
      const decoded = jwtDecode(token);
      return {
        editorId: decoded.userId || decoded.id || "unknown",
        editorName:
          user || decoded.name || decoded.username || "Unknown Editor",
        editedAt: new Date().toISOString(),
      };
    } catch {
      return {
        editorId: "unknown",
        editorName: "Unknown Editor",
        editedAt: new Date().toISOString(),
      };
    }
  };

  const formatDate = (d) => {
    try {
      return d ? new Date(d).toLocaleDateString() : "Unknown";
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <AppTheme>
      <LoadingOverlay loading={loading} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      <Box sx={{ display: "flex", bgcolor: "#f6f6f6ff", minHeight: "100vh" }}>
        <SideMenu />

        <Box
          component="main"
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <FixedHeader />
          <MobileHeader />

          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              mt: { xs: 8, md: 4 },
              flex: 1,
            }}
          >
            <Paper elevation={2} sx={{ width: "100%", bgcolor: "#fff" }}>
              <Box sx={{ padding: 0, pb: 5 }}>
                <Typography
                  fontSize="1rem"
                  fontWeight={500}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    p: 1.5,
                    px: 3,
                  }}
                >
                  Search For Activities In Quorum
                </Typography>

                {/* Search Bar */}
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={2}
                  justifyContent="center"
                  pt={3}
                >
                  <Grid
                    item
                    xs={12}
                    md={8}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: { xs: 2, md: 1 },
                      mt: 5,
                    }}
                  >
                    <TextField
                      placeholder="Search by Bill title"
                      variant="outlined"
                      value={searchQuery}
                      fullWidth
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />

                    <Button
                      onClick={handleSearch}
                      sx={{
                        minWidth: "110px",
                        backgroundColor: "#173A5E !important",
                        color: "white !important",
                        "&:hover": { backgroundColor: "#1E4C80 !important" },
                      }}
                    >
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Results Table */}
              <Box sx={{ p: 3 }}>
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 2,
                    }}
                  >
                    {/* Loading spinner can be added here if needed */}
                  </Box>
                ) : (
                  Array.isArray(searchResults) &&
                  searchResults.length > 0 && (
                    <TableContainer
                      component={Paper}
                      sx={{ border: "1px solid #ddd", backgroundColor: "#fff" }}
                    >
                      <Table size="large">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Activity Title / Bill Name
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Date
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                textAlign: "center",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {searchResults.map((activity) => (
                            <TableRow key={activity.quorumId || activity.id}>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid #ddd",
                                  fontSize: "13px",
                                }}
                              >
                                {activity.title}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid #ddd",
                                  fontSize: "13px",
                                }}
                              >
                                {formatDate(activity.date)}
                              </TableCell>
                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  borderBottom: "1px solid #ddd",
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  onClick={() => handleAddActivity(activity)}
                                  sx={{
                                    backgroundColor: "#173A5E !important",
                                    color: "white !important",
                                    "&:hover": {
                                      backgroundColor: "#1E4C80 !important",
                                    },
                                    transition: "all 0.3s ease",
                                  }}
                                >
                                  Add
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
                )}

                {/* No Results */}
                {searchAttempted && !loading && searchResults.length === 0 && (
                  <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Typography color="text.secondary">
                      No matching activities found in Quorum.
                    </Typography>

                    <Button
                      onClick={() => navigate("/add-activity")}
                      sx={{
                        mt: 2,
                        backgroundColor: "#173A5E !important",
                        color: "white !important",
                      }}
                    >
                      Add Activity Manually
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Stack>

          <Box sx={{ mx: 3, py: 5 }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
