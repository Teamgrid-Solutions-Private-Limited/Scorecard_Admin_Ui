import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteSenator, getAllSenators } from "../redux/reducer/senetorSlice"; // Import actions
import { getAllSenatorData } from "../redux/reducer/senetorTermSlice";
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  Chip,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppTheme from "../shared-theme/AppTheme";
import SideMenu from "../components/SideMenu";
import MainGrid from "../components/MainGrid";
import axios from "axios";
import { API_URL } from "../redux/API";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../Themes/customizations";
import FixedHeader from "../components/FixedHeader";
import FilterListIcon from "@mui/icons-material/FilterList";
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};
import { getAllTerms } from "../redux/reducer/termSlice";
import { FormControl, InputLabel, Select } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function Senator(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Fetch senators from Redux store
  const { senators, loading } = useSelector((state) => state.senator);
  const { senatorData } = useSelector((state) => state.senatorData);
  const [progress, setProgress] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSenator, setSelectedSenator] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const { terms } = useSelector((state) => state.term);

  const [partyFilter, setPartyFilter] = useState([]);
  const [stateFilter, setStateFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [partyMenuAnchorEl, setPartyMenuAnchorEl] = useState(null);
  const [stateMenuAnchorEl, setStateMenuAnchorEl] = useState(null);
  const [ratingMenuAnchorEl, setRatingMenuAnchorEl] = useState(null);
  const [mergedSenators, setMergedSenators] = useState([]);
  const [yearMenuAnchorEl, setYearMenuAnchorEl] = useState(null);


  const ratingOptions = ["A+", "B", "C", "D", "F"];

  useEffect(() => {
    dispatch(getAllSenators());
    dispatch(getAllSenatorData());
    dispatch(getAllTerms());
  }, [dispatch]);

  useEffect(() => {
    if (senatorData && senators && terms) {
      const merged = senators.map((senator) => {
        const match = senatorData.find((data) => data.senateId === senator._id);
        const termId = match ? match.termId : senator.termId;
        const termObj = terms.find(t => t._id === termId);
        return {
          ...senator,
          rating: match ? match.rating : "N/A",
          termId: termId,
          votesScore: match ? match.votesScore : [],
          termName: termObj ? termObj.name : "",
        };
      });
      setMergedSenators(merged);
      console.log("Merged Senators with termname:", merged);
    }
  }, [senators, senatorData, terms]);

  // Build list of years from 2015 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2015; y--) {
    years.push(y);
  }
  // Merge senator data with ratings
  // useEffect(() => {
  //   if (senatorData && senators) {
  //     const merged = senators
  //       .map((senator) => {
  //         const match = senatorData.find((data) => data.senateId === senator._id);
  //         return {
  //           ...senator,
  //           rating: match ? match.rating : "N/A",
  //         };
  //       });
  //     setMergedSenators(merged);
  //   }
  // }, [senators, senatorData]);

  // Get unique parties and states for filter options
  const partyOptions = [...new Set(senators.map(senator => senator.party))].filter(Boolean);
  const stateOptions = [...new Set(senators.map(senator => senator.state))].filter(Boolean);

  const handleEdit = (row) => {
    navigate(`/edit-senator/${row._id}`);
  };
  const handleDeleteClick = (row) => {
    setSelectedSenator(row); // Store senator data
    setOpenDeleteDialog(true); // Open dialog
  };
  const handleConfirmDelete = async () => {
    setOpenDeleteDialog(false);
    setFetching(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25));
    }, 1000);
    try {
      await dispatch(deleteSenator(selectedSenator._id));
      await dispatch(getAllSenators());
      setSnackbarMessage(`${selectedSenator.name} deleted successfully.`);
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Failed to delete senator.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setProgress(100);
      setTimeout(() => setProgress(0), 500); // Re
    }
  };

  const fetchSenatorsFromQuorum = async () => {
    setFetching(true);
    setProgress(0); // Reset progress
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25)); // Increase progress in steps
    }, 1000); // Change progress every second
    try {
      const response = await axios.post(`${API_URL}/fetch-quorum/store-data`, {
        type: "senator",
      });
      if (response.status === 200) {
        setSnackbarMessage("Success: Senators fetched successfully!");
        setSnackbarSeverity("success");
        await dispatch(getAllSenators());
        setFetching(false);
      } else {
        throw new Error("Failed to fetch senators from Quorum");
      }
    } catch (error) {
      console.error("Error fetching senators:", error);
      setSnackbarMessage("Error: Unable to fetch senators.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setProgress(100); // Ensure it completes
      setTimeout(() => setProgress(0), 500); // Re
      // setTimeout(() => setProgress(0), 500); // Re
    }
  };


  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handlePartyMenuOpen = (event) => {
    setPartyMenuAnchorEl(event.currentTarget);
  };

  const handleStateMenuOpen = (event) => {
    setStateMenuAnchorEl(event.currentTarget);
  };

  const handleRatingMenuOpen = (event) => {
    setRatingMenuAnchorEl(event.currentTarget);
  };

  const handleYearMenuOpen = (event) => {
    setYearMenuAnchorEl(event.currentTarget);
  };

  const handleYearFilter = (year) => {
    setSelectedYear((prev) => (prev === year ? "" : year)); // toggle
  };


  const handleMenuClose = () => {
    setPartyMenuAnchorEl(null);
    setStateMenuAnchorEl(null);
    setRatingMenuAnchorEl(null);
      setYearMenuAnchorEl(null);
  };

  const handlePartyFilter = (party) => {
    setPartyFilter(prev =>
      prev.includes(party)
        ? prev.filter(p => p !== party)
        : [...prev, party]
    );
  };

  const handleStateFilter = (state) => {
    setStateFilter(prev =>
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleRatingFilter = (rating) => {
    setRatingFilter(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const clearAllFilters = () => {
    setPartyFilter([]);
    setStateFilter([]);
    setRatingFilter([]);
    setSelectedYear("");
    setSearchQuery("");
  };

  const filteredSenators = mergedSenators.filter((senator) => {
    // Year filter
    if (selectedYear) {
      if (senator.termName && senator.termName.includes("-")) {
        const [start, end] = senator.termName.split('-').map(Number);
        if (!(start && end && Number(selectedYear) >= start && Number(selectedYear) <= end)) {
          return false;
        }
      } else {
        return false;
      }
    }

    const nameMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every(word => senator.name.toLowerCase().includes(word));

    const partyMatch = partyFilter.length === 0 || partyFilter.includes(senator.party);

    // State filter
    const stateMatch = stateFilter.length === 0 || stateFilter.includes(senator.state);

    // Rating filter
    const ratingMatch = ratingFilter.length === 0 ||
      (senator.rating && ratingFilter.includes(senator.rating));


    return nameMatch && partyMatch && stateMatch && ratingMatch;
  });


  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      {(loading || fetching) && (
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
      <Box sx={{ display: "flex" }}>
        <SideMenu />

        <Box
          sx={{
            flexGrow: 1,
            // overflow: "auto",
            width: "80%",
            filter: fetching ? "blur(1px)" : "none", // Apply blur when fetching
            pointerEvents: fetching ? "none" : "auto", // Disable interactions
          }}
        >
          <FixedHeader />
          <Stack
            spacing={2}
            sx={{ alignItems: "center", mx: 2, pb: 5, mt: { xs: 8, md: 0 } }}
          >
            {/* Search Input - Positioned ABOVE the table */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 4,
                gap: 2,
              }}
            >
              <Typography component="h2" variant="h6">
                All Senators
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  placeholder="Search Senators"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    padding: "0.5rem 1rem",
                    marginLeft: "0.5rem",
                    width: "190px",
                    "& .MuiInputBase-root": {
                      "&.Mui-focused": {
                        boxShadow: "none !important",
                        outline: "none !important",
                      },
                    },
                  }}
                />

                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleFilterClick}
                  sx={{
                    height: '40px',
                    minWidth: '40px',
                    padding: '0 8px',
                  }}
                >
                  Filters
                </Button>


                {/* Active filters chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {partyFilter.map(party => (
                    <Chip
                      key={party}
                      label={`Party: ${party}`}
                      onDelete={() => handlePartyFilter(party)}
                      size="small"
                    />
                  ))}
                  {stateFilter.map(state => (
                    <Chip
                      key={state}
                      label={`State: ${state}`}
                      onDelete={() => handleStateFilter(state)}
                      size="small"
                    />
                  ))}
                  {ratingFilter.map(rating => (
                    <Chip
                      key={rating}
                      label={`Rating: ${rating}`}
                      onDelete={() => handleRatingFilter(rating)}
                      size="small"
                    />
                  ))}
                  {(partyFilter.length > 0 || stateFilter.length > 0 || ratingFilter.length > 0) && (
                    <Chip
                      label="Clear all"
                      onClick={clearAllFilters}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {selectedYear && (
                    <Chip
                      label={`Year: ${selectedYear}`}
                      onDelete={() => setSelectedYear("")}
                      size="small"
                    />
                  )}
                </Box>

                <Button
                  variant="outlined"
                  sx={{
                    backgroundColor: "#4a90e2 !important",
                    color: "white !important",
                    padding: "0.5rem 1rem",
                    marginLeft: "0.5rem",
                    "&:hover": {
                      backgroundColor: "#357ABD !important",
                    },
                  }}
                  onClick={fetchSenatorsFromQuorum}
                >
                  Fetch Senators from Quorum
                </Button>
              </Stack>
            </Box>

            <MainGrid
              type="senator"
              data={filteredSenators}
              loading={fetching ? false : loading}
              onDelete={handleDeleteClick}
              onEdit={handleEdit}
            />
          </Stack>
        </Box>

        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={handlePartyMenuOpen}>Filter by Party</MenuItem>
          <MenuItem onClick={handleStateMenuOpen}>Filter by State</MenuItem>
          <MenuItem onClick={handleRatingMenuOpen}>Filter by Rating</MenuItem>
         <MenuItem onClick={handleYearMenuOpen}>Filter by Year</MenuItem>

          <Divider />
          <MenuItem onClick={clearAllFilters}>Clear all filters</MenuItem>
        </Menu>

        {/* Party Filter Menu */}
        <Menu
          anchorEl={partyMenuAnchorEl}
          open={Boolean(partyMenuAnchorEl)}
          onClose={handleMenuClose}
        >
          {partyOptions.map(party => (
            <MenuItem
              key={party}
              onClick={() => {
                handlePartyFilter(party);
                handleMenuClose();
              }}
              sx={{
                backgroundColor: partyFilter.includes(party) ? '#f0f0f0' : 'transparent',
              }}
            >
              {party}
            </MenuItem>
          ))}
        </Menu>

        {/* State Filter Menu */}
        <Menu
          anchorEl={stateMenuAnchorEl}
          open={Boolean(stateMenuAnchorEl)}
          onClose={handleMenuClose}
        >
          {stateOptions.map(state => (
            <MenuItem
              key={state}
              onClick={() => {
                handleStateFilter(state);
                handleMenuClose();
              }}
              sx={{
                backgroundColor: stateFilter.includes(state) ? '#f0f0f0' : 'transparent',
              }}
            >
              {state}
            </MenuItem>
          ))}
        </Menu>

        {/* Rating Filter Menu */}
        <Menu
          anchorEl={ratingMenuAnchorEl}
          open={Boolean(ratingMenuAnchorEl)}
          onClose={handleMenuClose}
        >
          {ratingOptions.map(rating => (
            <MenuItem
              key={rating}
              onClick={() => {
                handleRatingFilter(rating);
                handleMenuClose();
              }}
              sx={{
                backgroundColor: ratingFilter.includes(rating) ? '#f0f0f0' : 'transparent',
              }}
            >
              {rating}
            </MenuItem>
          ))}
        </Menu>
        <Menu
  anchorEl={yearMenuAnchorEl}
  open={Boolean(yearMenuAnchorEl)}
  onClose={handleMenuClose}
>
  {years.map(year => (
    <MenuItem
      key={year}
      onClick={() => {
        handleYearFilter(year.toString());
        handleMenuClose();
      }}
      sx={{
        backgroundColor: selectedYear === year.toString() ? '#f0f0f0' : 'transparent',
      }}
    >
      {year}
    </MenuItem>
  ))}
</Menu>



        {/* Snackbar for success/error messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%", bgcolor: '#FF474D' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: { borderRadius: 3, padding: 2, minWidth: 350 },
          }}
        >
          <DialogTitle
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
              Are you sure you want to delete{" "}
              <strong>{selectedSenator?.name}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Stack
              direction="row"
              spacing={2}
              sx={{ width: "100%", justifyContent: "center", paddingBottom: 2 }}
            >
              <Button
                onClick={() => setOpenDeleteDialog(false)}
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
              >
                Delete
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Snackbar for success/error messages */}
    </AppTheme>
  );
}
