import { useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { getAllVotes } from "../redux/reducer/voteSlice";
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
import { API_URL } from "../redux/API";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import FixedHeader from "../components/FixedHeader";
import Footer from "../components/Footer";
import MobileHeader from "../components/MobileHeader";
import { jwtDecode } from "jwt-decode";
import LoadingOverlay from "../components/LoadingOverlay";

export default function SearchBill(params) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
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
        setSnackbarMessage("Please log in to search bills");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
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
      setSnackbarMessage(
        error.response?.data?.message || "Failed to search bills"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async (bill) => {
    setLoading(true);
    try {
      const allVotes = await dispatch(getAllVotes()).unwrap();
      const isDuplicate = allVotes.some(
        (vote) => String(vote.quorumId) === String(bill.quorumId)
      );
      if (isDuplicate) {
        setSnackbarMessage("Bill already exists");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }
      const editorInfo = getEditorInfo();
      const response = await axios.post(`${API_URL}/fetch-quorum/votes/save`, {
        bills: [bill],
        editorInfo: editorInfo,
      });

      const voteId = response.data.data[0]._id;
      if (voteId) {
        navigate(`/bills/edit-bill/${voteId}`);
      } else {
        console.error("voteId (_id) is missing in the API response.");
      }
    } catch (error) {
      console.error("Error saving bill:", error);
    } finally {
      setLoading(false);
    }
  };
  const getEditorInfo = () => {
    try {
      if (!token) return null;

      const decodedToken = jwtDecode(token);

      return {
        editorId: decodedToken.userId || decodedToken.id || "unknown",
        editorName:
          user ||
          decodedToken.name ||
          decodedToken.username ||
          "Unknown Editor",
        editedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        editorId: "unknown",
        editorName: "Unknown Editor",
        editedAt: new Date().toISOString(),
      };
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
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      <Box sx={{ display: "flex", bgcolor: "#f6f6f6ff ", minHeight: "100vh" }}>
        <SideMenu />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          })}
        >
          <FixedHeader />
          <MobileHeader />
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 0,
              mt: { xs: 8, md: 4 },
              flex: 1,
            }}
          >
            <Paper elevation={2} sx={{ width: "100%", bgcolor: "#fff" }}>
              <Box sx={{ padding: 0, pb: 5 }}>
                <Typography
                  fontSize={"1rem"}
                  fontWeight={500}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    p: 1.5,
                    px: 3,
                  }}
                >
                  Search For Bills In Quorum
                </Typography>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={2}
                  alignItems="center"
                  justifyContent="center"
                  pt={3}
                >
                  <Grid
                    item
                    xs={12}
                    md={8}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: { xs: "column", md: "row" },
                      gap: { xs: 2, md: 1 },
                      width: "100%",
                      mt: 5,
                    }}
                  >
                    <TextField
                      placeholder="Look for Bills in Quorum"
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                      fullWidth
                      sx={{
                        maxWidth: { xs: "100%", md: "800px" },
                        "& .MuiOutlinedInput-root": {
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "gray !important",
                          },
                        },
                        "& .MuiInputBase-root": {
                          "&.Mui-focused": {
                            boxShadow: "none !important",
                            outline: "none !important",
                          },
                        },
                      }}
                    />

                    <Button
                      onClick={handleSearch}
                      sx={{
                        width: { xs: "100%", md: "auto" },
                        minWidth: "110px",
                        backgroundColor: "#173A5E !important",
                        color: "white !important",
                        padding: "0.5rem 1rem",
                        marginLeft: "0.5rem",
                        "&:hover": {
                          backgroundColor: "#1E4C80 !important",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Search
                    </Button>
                    <Button
                      onClick={() => navigate("/add-bill")}
                      sx={{
                        width: { xs: "100%", md: "auto" },
                        minWidth: "130px",
                        backgroundColor: "#173A5E !important",
                        color: "white !important",
                        padding: "0.5rem 1rem",
                        "&:hover": {
                          backgroundColor: "#1E4C80 !important",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Add Manually
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ p: 3 }}>
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 2,
                    }}
                  ></Box>
                ) : (
                  Array.isArray(searchResults) &&
                  searchResults.length > 0 && (
                    <TableContainer
                      component={Paper}
                      sx={{ border: "1px solid #ddd", backgroundColor: "#fff" }}
                    >
                      <Table size="large">
                        <TableHead>
                          <TableRow sx={{}}>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Title
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
                          {searchResults.map((bill) => (
                            <TableRow key={bill.id}>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid #ddd",
                                  fontSize: "13px",
                                }}
                              >
                                {bill.title}
                              </TableCell>
                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  borderBottom: "1px solid #ddd",
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  onClick={() => handleAddBill(bill)}
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
                {searchAttempted &&
                  !loading &&
                  Array.isArray(searchResults) &&
                  searchResults.length === 0 && (
                    <Box sx={{ width: "100%", textAlign: "center", mt: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No bills found for your search.
                      </Typography>
                    </Box>
                  )}
              </Box>
            </Paper>
          </Stack>
          <Box sx={{ mx: "15px", py: 5 }}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
