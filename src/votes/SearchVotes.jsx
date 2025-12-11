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
import { getErrorMessage } from "../utils/errorHandler";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SideMenu from "../components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
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

export default function SearchVotes(params) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const dispatch = useDispatch();
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

  const handleSearch = async () => {
    setLoading(true);
    setSearchAttempted(true);

    try {
      if (!searchQuery.trim()) {
        showSnackbar("Please enter a search query!", "warning");
        setLoading(false);
        return;
      }

      if (!token) {
        showSnackbar("Please log in to search votes", "error");
        setLoading(false);
        navigate("/login");
        return;
      }

      const searchTerm = searchQuery.trim();
      let response;
      const rollCallMatchWithChamber = searchTerm.match(/^([SH])(\d+)$/i);
      const rollCallMatchNumberOnly = searchTerm.match(/^(\d+)$/);

      if (rollCallMatchWithChamber || rollCallMatchNumberOnly) {
        let numberOnly;

        if (rollCallMatchWithChamber) {
          numberOnly = rollCallMatchWithChamber[2];
        } else {
          numberOnly = rollCallMatchNumberOnly[1];
        }
        response = await axios.post(
          `${API_URL}/fetch-quorum/store-data`,
          {
            type: "votes",
            additionalParams: {
              number: numberOnly,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSearchResults(
          Array.isArray(response.data?.data) ? response.data.data : []
        );
        return;
      }
      const trySearch = async (fieldName) => {
        const res = await axios.post(
          `${API_URL}/fetch-quorum/store-data`,
          {
            type: "votes",
            additionalParams: {
              [fieldName]: searchTerm,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return Array.isArray(res.data?.data) ? res.data.data : [];
      };
      let result = await trySearch("question");
      if (result.length === 0) {
        result = await trySearch("title");
      }
      setSearchResults(result);
      if (result.length === 0) {
        showSnackbar("No votes found matching your search", "info");
      }
    } catch (error) {
      console.error("Error searching votes:", error);
      const errorMessage = getErrorMessage(error, "Failed to search votes");
      showSnackbar(errorMessage, "error");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  const handleAddVote = async (vote) => {
    setLoading(true);
    try {
      const allVotes = await dispatch(getAllVotes()).unwrap();
      const isDuplicate = allVotes.some(
        (existingVote) => String(existingVote.quorumId) === String(vote.quorumId || vote.voteId)
      );
      console.log("isDuplicate:", isDuplicate);
      if (isDuplicate) {
        showSnackbar("Vote already exists", "info");
        setLoading(false);
        return;
      }
      const editorInfo = getEditorInfo();
      const voteData = vote.quorumId
        ? vote
        : {
          quorumId: vote.voteId,
          title: vote.question,
          type: "vote",
          date: vote.date,
          rollCallNumber: vote.rollCallNumber,
          chamber: vote.chamber,
          result: vote.result,
          relatedBill: vote.relatedBill,
        };

      const response = await axios.post(`${API_URL}/fetch-quorum/votes/save`, {
        bills: [voteData],
        editorInfo: editorInfo,
      });

      const voteId = response.data.data[0]._id;
      if (voteId) {
        navigate(`/edit-vote/${voteId}`);
      } else {
        console.error("voteId (_id) is missing in the API response.");
      }
    } catch (error) {
      console.error("Error saving vote:", error);
      showSnackbar("Failed to save vote", "error");
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

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
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
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      <Box sx={{ display: "flex", bgcolor: "#f6f6f6ff", minHeight: "100vh" }}>
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
                  Search For Votes In Quorum
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
                      placeholder="Search by vote question or roll call"
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
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              Vote Question
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
                          {searchResults.map((vote) => (
                            <TableRow key={vote.voteId || vote.quorumId}>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid #ddd",
                                  fontSize: "13px",
                                }}
                              >
                                {vote.question || vote.title}
                              </TableCell>
                              <TableCell
                                sx={{
                                  borderBottom: "1px solid #ddd",
                                  fontSize: "13px",
                                }}
                              >
                                {formatDate(vote.date)}
                              </TableCell>
                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  borderBottom: "1px solid #ddd",
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  onClick={() => handleAddVote(vote)}
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
                        No matching votes found in Quorum.
                      </Typography>
                      <Button
                        onClick={() => navigate("/add-vote")}
                        sx={{
                          width: { xs: "100%", md: "auto" },
                          minWidth: "130px",
                          backgroundColor: "#173A5E !important",
                          color: "white !important",
                          marginTop: 2,
                          marginBottom: 2,
                          padding: "0.5rem 1rem",
                          "&:hover": {
                            backgroundColor: "#1E4C80 !important",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Add Vote Manually
                      </Button>
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
