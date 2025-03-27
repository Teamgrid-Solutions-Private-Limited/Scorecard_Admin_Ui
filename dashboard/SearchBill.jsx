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
import { useNavigate } from "react-router-dom";
import { API_URL } from "../redux/api/API";

export default function SearchBill(props) {

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false); // Loader state
    const navigate = useNavigate();
  
    const handleSearch = async () => {
      setLoading(true); // Start loader
      try {
        const response = await axios.post(`${API_URL}/fetch-quorum/store-data`, {
          type: "bills",
          additionalParams: {
            title: searchQuery,
          },
        });
        setSearchResults(response.data.data);
      } catch (error) {
        console.error("Error searching bills:", error);
      } finally {
        setLoading(false); // Stop loader
      }
    };
  
    const handleAddBill = async (bill) => {
      setLoading(true); // Start loader
      try {
        const response = await axios.post(`${API_URL}/fetch-quorum/votes/save`, {
          bills: [bill],
        });
        console.log("Bill saved successfully:", response.data);
  
       alert("Bill saved successfully");
  
       
        const voteId = response.data.data[0]._id; // Use the first item's _id as voteId
        if (voteId) {
          navigate(`/bills/edit-vote/${voteId}`); // Redirect to edit page
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
             
              <Button variant="outlined">Fetch Data from Quorum</Button>
            </Stack>

            <div className="spacer"></div>

            <Paper elevation={2} sx={{ width: "100%", marginBottom: "50px" }}>
              <Box sx={{ padding: 5 }}>
                <Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
                  Bill's Information
                </Typography>
                <Grid container rowSpacing={2} columnSpacing={2} alignItems={"center"}>
                  
                  <Grid size={4}>
                    <FormControl fullWidth>
                      <Select
                        
                        name="type"
                        // onChange={handleChange}
                        sx={{ background: "#fff" }}
                      >
                       
                      </Select>
                    </FormControl>
                    <TextField
                      label="Search Bills"
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{ marginBottom: 2 }}
                    />
                    <Button variant="contained" onClick={handleSearch}>Search</Button>

                    
                  </Grid>

                  <Grid size={2}>
                    <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: "end", fontWeight: 700, my: 0, width: "100%" }}>
                      Title
                    </InputLabel>
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
