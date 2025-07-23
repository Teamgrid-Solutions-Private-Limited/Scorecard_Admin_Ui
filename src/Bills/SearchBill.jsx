import * as React from "react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  getVoteById,
  clearVoteState,
  updateVote,
  createVote,
} from "../redux/reducer/voteSlice"; // Import clearVoteState
import { getAllTerms } from "../redux/reducer/termSlice"; 
import { useState } from "react";
import { alpha, styled } from "@mui/material/styles";
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

export default function SearchBill(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [searchAttempted, setSearchAttempted] = useState(false); // Track if search was attempted
  const [draftBills, setDraftBills] = useState([]);
  const navigate = useNavigate();
  

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
    setSearchAttempted(true); // Mark that a search was attempted
    try {
      if(!searchQuery){
        setSnackbarMessage("Fill the Field!")
        setSnackbarSeverity("warning")
        setSnackbarOpen(true)
        setLoading(false)
        return
      }
      const response = await axios.post(`${API_URL}/fetch-quorum/store-data`, {
        type: "bills",
        additionalParams: {
          title: searchQuery,
        },
      });
      setSearchResults(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error searching bills:", error);
      setSearchResults([]); // Defensive: clear results on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async (bill) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/fetch-quorum/votes/save`, {
        bills: [bill],
      });
      // console.log("Bill saved successfully:", response.data);

      // alert("Bill saved successfully");

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

  const label = { inputProps: { "aria-label": "Color switch demo" } };

  return (
    <AppTheme>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: ' rgba(255, 255, 255,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
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
      <FixedHeader />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
          })}
        >
          <Stack spacing={2} sx={{ alignItems: "center", mx: 3, pb: 0, mt: { xs: 8, md: 0 }, flex: 1 }}>
            

            <Paper elevation={2} sx={{ width: "100%" }}>
              <Box sx={{ padding: 5, pb: 10 }}>
                <Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
                  Search For Bills In Quorum
                </Typography>
                <Grid
                  container
                  rowSpacing={2}
                  columnSpacing={2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Grid
                    item
                    xs={12}
                    md={8}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: { xs: "column", md: "row" },
                      gap: { xs: 2, md: 3 },
                      width: "100%",
                      marginLeft: { xs: "0px", lg: "20px" },
                    }}
                  >
                    {/* <Typography
                      sx={{
                        minWidth: "120px",
                        textAlign: { xs: "center", md: "right" },
                        fontWeight: 500,
                        color: "#656D9A",
                      }}
                    >
                      Search Bills 
                    </Typography> */}

                    <TextField
                      placeholder="Look for Bills in Quorum"
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      fullWidth
                      sx={{
                        maxWidth: { xs: "110%", md: "800px" },
                        "& .MuiOutlinedInput-root": {
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "gray !important",
                          },
                        },
                        "& .MuiInputBase-root": {
                          "&.Mui-focused": {
                            borderColor: "#CC9A3A !important",
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
                        backgroundColor: "#4a90e2 !important",
                        color: "white !important",
                        padding: "0.5rem 1rem",
                        marginLeft: "0.5rem",
                        "&:hover": {
                          backgroundColor: "#357ABD !important",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Search
                    </Button>
                  </Grid>

                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 2,
                      }}
                    >
                      {/* <CircularProgress /> */}
                    </Box>
                  ) : (
                    Array.isArray(searchResults) && searchResults.length > 0 && (
                      <TableContainer
                        component={Paper}
                        sx={{ marginTop: 6, border: "1px solid #ddd", backgroundColor: '#fff' }}
                      >
                        <Table size="large" >
                          
                          <TableHead>
                            <TableRow sx={{ }}>
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
                                <TableCell sx={{ borderBottom: "1px solid #ddd" , fontSize:"13px" }}>
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
                                      backgroundColor: "#4a90e2 !important",
                        color: "white !important",
                         
                        "&:hover": {
                          backgroundColor: "#357ABD !important",
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
                  {/* Show 'No results found' message if search was attempted, not loading, and no results */}
                  {searchAttempted && !loading && Array.isArray(searchResults) && searchResults.length === 0 && (
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No bills found for your search.
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Box>
            </Paper>
          </Stack>
          <Footer />
        </Box>
      </Box>
    </AppTheme>
  );
}
