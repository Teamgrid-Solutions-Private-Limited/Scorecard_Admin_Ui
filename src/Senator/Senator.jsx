import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteSenator, getAllSenators ,updateSenatorStatus} from "../redux/reducer/senetorSlice"; // Import actions
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
  Autocomplete,
  Paper,
  Popover,
  IconButton,
  ClickAwayListener,
  Badge,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
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
  const token = localStorage.getItem("token");
  // Fetch senators from Redux store
  // const { senators, loading } = useSelector((state) => state.senator);
  const { senatorData } = useSelector((state) => state.senatorData);
  const {
    senators = [],
    loading,
    error,
  } = useSelector((state) => state.senator || {});
  // console.log("Redux State:", { senators, loading, error });
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
  const [statusFilter, setStatusFilter] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [partyMenuAnchorEl, setPartyMenuAnchorEl] = useState(null);
  const [stateMenuAnchorEl, setStateMenuAnchorEl] = useState(null);
  const [ratingMenuAnchorEl, setRatingMenuAnchorEl] = useState(null);
  const [mergedSenators, setMergedSenators] = useState([]);
  const [yearMenuAnchorEl, setYearMenuAnchorEl] = useState(null);
  const [termFilter, setTermFilter] = useState(null); // 'current' or 'past'
  const [termFilterAnchorEl, setTermFilterAnchorEl] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [selectedYears, setSelectedYears] = useState([]); // Changed from selectedYear
  const [searchTerms, setSearchTerms] = useState({
    party: "",
    state: "",
    rating: "",
    year: "",
  });
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
    if (!filterOpen) {
      setExpandedFilter(null);
    }
  };

  const toggleFilterSection = (section) => {
    setExpandedFilter(expandedFilter === section ? null : section);
  };
  const handleSearchChange = (filterType, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [filterType]: value.toLowerCase(),
    }));
  };

  const ratingOptions = ["A+", "B", "C", "D", "F"];
  const statusOptions = ["published", "reviewed", "draft"];

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
        const termObj = terms.find((t) => t._id === termId);
        return {
          ...senator,
          rating: match ? match.rating : "N/A",
          termId: termId,
          votesScore: match ? match.votesScore : [],
          termName: termObj ? termObj.name : "",
          currentTerm: match?.currentTerm ?? null // Ensure currentTerm is included
        };
      });
      setMergedSenators(merged);
      console.log("Merged Senators with termname:", merged);
    }
  }, [senators, senatorData, terms]);
  console.log(" Senators:", senators);
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
  const partyOptions = [
    ...new Set(senators.map((senator) => senator.party)),
  ].filter(Boolean);
  const stateOptions = [
    ...new Set(senators.map((senator) => senator.state)),
  ].filter(Boolean);

  const filteredPartyOptions = partyOptions.filter((party) =>
    party.toLowerCase().includes(searchTerms.party)
  );

  const filteredStateOptions = stateOptions.filter((state) =>
    state.toLowerCase().includes(searchTerms.state)
  );

  const filteredRatingOptions = ratingOptions.filter((rating) =>
    rating.toLowerCase().includes(searchTerms.rating)
  );

  const filteredYearOptions = years.filter((year) =>
    year.toString().includes(searchTerms.year)
  );

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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const result = await dispatch(deleteSenator(selectedSenator._id));
      if (result.error) {
        throw new Error(result.payload.message || "Failed to delete senator");
      }
      await dispatch(getAllSenators());
      setSnackbarMessage(`${selectedSenator.name} deleted successfully.`);
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to delete senator.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const fetchSenatorsFromQuorum = async () => {
    setFetching(true);
    setProgress(0); // Reset progress
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25)); // Increase progress in steps
    }, 1000); // Change progress every second
    try {
      const response = await axios.post(
        `${API_URL}/fetch-quorum/store-data`,
        { type: "senator" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  // const handleYearFilter = (year) => {
  //   setSelectedYear((prev) => (prev === year ? "" : year)); // toggle
  // };

  const handleMenuClose = () => {
    setPartyMenuAnchorEl(null);
    setStateMenuAnchorEl(null);
    setRatingMenuAnchorEl(null);
    setYearMenuAnchorEl(null);
  };

  const handlePartyFilter = (party) => {
    setPartyFilter((prev) =>
      prev.includes(party) ? prev.filter((p) => p !== party) : [...prev, party]
    );
  };

  const handleStateFilter = (state) => {
    setStateFilter((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleRatingFilter = (rating) => {
    setRatingFilter((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };
  const handleYearFilter = (year) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };
  const handleStatusFilter = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };
  const handleTermMenuOpen = (event) => {
    setTermFilterAnchorEl(event.currentTarget);
  };
  const clearAllFilters = () => {
    setPartyFilter([]);
    setStateFilter([]);
    setRatingFilter([]);
    setSelectedYears([]);
    setTermFilter(null);
    setStatusFilter([]);
    setSearchQuery("");
  };

  const filteredSenators = mergedSenators.filter((senator) => {
    // Term filter logic
    if (termFilter === 'current') {
      if (senator.currentTerm !== true) return false;
    } else if (termFilter === 'past') {
      if (senator.currentTerm === true) return false;
    }
    // Year filter
    if (selectedYears.length > 0) {
      if (senator.termName && senator.termName.includes("-")) {
        const [start, end] = senator.termName.split("-").map(Number);
        const hasMatchingYear = selectedYears.some(year => {
          const yearNum = Number(year);
          return yearNum >= start && yearNum <= end;
        });
        if (!hasMatchingYear) return false;
      } else {
        return false;
      }
    }

    // if (selectedYear) {
    //   if (senator.termName && senator.termName.includes("-")) {
    //     const [start, end] = senator.termName.split("-").map(Number);
    //     if (
    //       !(
    //         start &&
    //         end &&
    //         Number(selectedYear) >= start &&
    //         Number(selectedYear) <= end
    //       )
    //     ) {
    //       return false;
    //     }
    //   } else {
    //     return false;
    //   }
    // }

    const nameMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every((word) => senator.name.toLowerCase().includes(word));
    const filteredSenators = senators
      ? senators.filter((senator) => {
        const name = senator.name?.toLowerCase() || "";
        return searchQuery
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean)
          .every((word) => name.includes(word));
      })
      : [];

    const partyMatch =
      partyFilter.length === 0 || partyFilter.includes(senator.party);

    // State filter
    const stateMatch =
      stateFilter.length === 0 || stateFilter.includes(senator.state);

    // Rating filter
    const ratingMatch =
      ratingFilter.length === 0 ||
      (senator.rating && ratingFilter.includes(senator.rating));

    // Status filter
    const statusMatch =
      statusFilter.length === 0 ||
      (senator.publishStatus && statusFilter.includes(senator.publishStatus));

    return nameMatch && partyMatch && stateMatch && ratingMatch && statusMatch;
  });
  const activeFilterCount =
    partyFilter.length +
    stateFilter.length +
    ratingFilter.length +
    selectedYears.length +
    (termFilter ? 1 : 0) +
    statusFilter.length;
   const handleToggleStatusSenator = (senator) => {
    const newStatus = senator.publishStatus === "published" ? "draft" : "published";
    console.log("Toggling status:", senator.publishStatus, "→", newStatus);

    dispatch(updateSenatorStatus({ id: senator._id, publishStatus: newStatus }))
      .then(() => {
        dispatch(getAllSenators());
      })
      .catch((error) => {
        console.error("Status update failed:", error);
        setSnackbarMessage("Failed to update status.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

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

                <Box sx={{ position: "relative", display: "inline-block" }}>




                  <Badge
                    badgeContent={activeFilterCount > 0 ? activeFilterCount : null}
                    color="primary"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      endIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={toggleFilter}
                      sx={{
                        height: "40px",
                        minWidth: "120px",
                        borderColor: filterOpen ? "primary.main" : "divider",
                        backgroundColor: filterOpen
                          ? "primary.light"
                          : "background.paper",
                        "&:hover": {
                          backgroundColor: filterOpen
                            ? "primary.light"
                            : "action.hover",
                        },
                      }}
                    >
                      Filters
                    </Button>
                  </Badge>
                  {/* <Badge
                    badgeContent={
                      partyFilter.length +
                      stateFilter.length +
                      ratingFilter.length +
                      (selectedYear ? 1 : 0) || null +
                      (termFilter ? 1 : 0) || null
                    }
                    color="primary"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      endIcon={
                        filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                      }
                      onClick={toggleFilter}
                      sx={{
                        height: "40px",
                        minWidth: "120px",
                        borderColor: filterOpen ? "primary.main" : "divider",
                        backgroundColor: filterOpen
                          ? "primary.light"
                          : "background.paper",
                        "&:hover": {
                          backgroundColor: filterOpen
                            ? "primary.light"
                            : "action.hover",
                        },
                      }}
                    >
                      Filters
                    </Button>
                  </Badge> */}

                  {filterOpen && (
                    <ClickAwayListener onClickAway={() => setFilterOpen(false)}>
                      <Paper
                        sx={{
                          position: "absolute",
                          right: 0,
                          top: "100%",
                          mt: 1,
                          width: 320,
                          zIndex: 1,
                          boxShadow: 3,
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              Filters
                            </Typography>
                            <IconButton size="small" onClick={toggleFilter}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Party Filter */}
                        <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor:
                              expandedFilter === "party"
                                ? "action.hover"
                                : "background.paper",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 2, cursor: "pointer" }}
                            onClick={() => toggleFilterSection("party")}
                          >
                            <Typography variant="body1">Party</Typography>
                            {expandedFilter === "party" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "party" && (
                            <Box sx={{ p: 2, pt: 0 }}>
                              {/* <TextField
                                fullWidth
                                size="small"
                                placeholder="Search parties..."
                                value={searchTerms.party}
                                onChange={(e) =>
                                  handleSearchChange("party", e.target.value)
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ mb: 2 }}
                              /> */}
                              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                                {filteredPartyOptions.length > 0 ? (
                                  filteredPartyOptions.map((party) => (
                                    <Box
                                      key={party}
                                      onClick={() => handlePartyFilter(party)}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1,
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        "&:hover": {
                                          bgcolor: "action.hover",
                                        },
                                      }}
                                    >
                                      {partyFilter.includes(party) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {party.charAt(0).toUpperCase()+party.slice(1)}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No parties found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* State Filter */}
                        <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor:
                              expandedFilter === "state"
                                ? "action.hover"
                                : "background.paper",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 2, cursor: "pointer" }}
                            onClick={() => toggleFilterSection("state")}
                          >
                            <Typography variant="body1">State</Typography>
                            {expandedFilter === "state" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "state" && (
                            <Box sx={{ p: 2, pt: 0 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Search states..."
                                value={searchTerms.state}
                                onChange={(e) =>
                                  handleSearchChange("state", e.target.value)
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ mb: 2 }}
                              />
                              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                                {filteredStateOptions.length > 0 ? (
                                  filteredStateOptions.map((state) => (
                                    <Box
                                      key={state}
                                      onClick={() => handleStateFilter(state)}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1,
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        "&:hover": {
                                          bgcolor: "action.hover",
                                        },
                                      }}
                                    >
                                      {stateFilter.includes(state) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {state}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No states found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Rating Filter */}
                        <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor:
                              expandedFilter === "rating"
                                ? "action.hover"
                                : "background.paper",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 2, cursor: "pointer" }}
                            onClick={() => toggleFilterSection("rating")}
                          >
                            <Typography variant="body1">Rating</Typography>
                            {expandedFilter === "rating" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "rating" && (
                            <Box sx={{ p: 2, pt: 0 }}>
                              {/* <TextField
                                fullWidth
                                size="small"
                                placeholder="Search ratings..."
                                value={searchTerms.rating}
                                onChange={(e) =>
                                  handleSearchChange("rating", e.target.value)
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ mb: 2 }}
                              /> */}
                              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                                {filteredRatingOptions.length > 0 ? (
                                  filteredRatingOptions.map((rating) => (
                                    <Box
                                      key={rating}
                                      onClick={() => handleRatingFilter(rating)}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1,
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        "&:hover": {
                                          bgcolor: "action.hover",
                                        },
                                      }}
                                    >
                                      {ratingFilter.includes(rating) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {rating}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No ratings found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Year Filter */}
                        <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor:
                              expandedFilter === "year"
                                ? "action.hover"
                                : "background.paper",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 2, cursor: "pointer" }}
                            onClick={() => toggleFilterSection("year")}
                          >
                            <Typography variant="body1">Year</Typography>
                            {expandedFilter === "year" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "year" && (
                            <Box sx={{ p: 2, pt: 0 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Search years..."
                                value={searchTerms.year}
                                onChange={(e) => handleSearchChange("year", e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ mb: 2 }}
                              />
                              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                                {filteredYearOptions.length > 0 ? (
                                  filteredYearOptions.map((year) => (
                                    <Box
                                      key={year}
                                      onClick={() => handleYearFilter(year.toString())}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1,
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        "&:hover": {
                                          bgcolor: "action.hover",
                                        },
                                      }}
                                    >
                                      {selectedYears.includes(year.toString()) ? (
                                        <CheckIcon color="primary" fontSize="small" />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography variant="body2" sx={{ ml: 1 }}>
                                        {year}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography variant="body2" color="textSecondary" sx={{ p: 1 }}>
                                    No years found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                          {/* {expandedFilter === "year" && (
                            <Box sx={{ p: 2, pt: 0 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Search years..."
                                value={searchTerms.year}
                                onChange={(e) =>
                                  handleSearchChange("year", e.target.value)
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ mb: 2 }}
                              />
                              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                                {filteredYearOptions.length > 0 ? (
                                  filteredYearOptions.map((year) => (
                                    <Box
                                      key={year}
                                      onClick={() =>
                                        handleYearFilter(year.toString())
                                      }
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1,
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        "&:hover": {
                                          bgcolor: "action.hover",
                                        },
                                      }}
                                    >
                                      {selectedYear === year.toString() ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {year}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No years found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )} */}
                        </Box>

                        {/* Term Filter */}
                        <Box
                          sx={{

                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor:
                              expandedFilter === "term"
                                ? "action.hover"
                                : "background.paper",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 2, cursor: "pointer" }}
                            onClick={() => toggleFilterSection("term")}
                          >
                            <Typography variant="body1">Term</Typography>
                            {expandedFilter === "term" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "term" && (
                            <Box sx={{ p: 2, pt: 0 }}>
                              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                                <Box
                                  onClick={() => setTermFilter('current')}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 1,
                                    borderRadius: 1,
                                    cursor: "pointer",
                                    "&:hover": {
                                      bgcolor: "action.hover",
                                    },
                                  }}
                                >
                                  {termFilter === 'current' ? (
                                    <CheckIcon color="primary" fontSize="small" />
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    Current Term
                                  </Typography>
                                </Box>
                                <Box
                                  onClick={() => setTermFilter('past')}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 1,
                                    borderRadius: 1,
                                    cursor: "pointer",
                                    "&:hover": {
                                      bgcolor: "action.hover",
                                    },
                                  }}
                                >
                                  {termFilter === 'past' ? (
                                    <CheckIcon color="primary" fontSize="small" />
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    Past Terms
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Status Filter */}
                        <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor:
                              expandedFilter === "status"
                                ? "action.hover"
                                : "background.paper",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 2, cursor: "pointer" }}
                            onClick={() => toggleFilterSection("status")}
                          >
                            <Typography variant="body1">Status</Typography>
                            {expandedFilter === "status" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "status" && (
                            <Box sx={{ p: 2, pt: 0 }}>
                              <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                                {statusOptions.map((status) => (
                                  <Box
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      p: 1,
                                      borderRadius: 1,
                                      cursor: "pointer",
                                      "&:hover": {
                                        bgcolor: "action.hover",
                                      },
                                    }}
                                  >
                                    {statusFilter.includes(status) ? (
                                      <CheckIcon color="primary" fontSize="small" />
                                    ) : (
                                      <Box sx={{ width: 24, height: 24 }} />
                                    )}
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Clear All Button */}
                        <Box
                          sx={{
                            p: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Button
                            fullWidth
                            variant="outlined"
                            color="secondary"
                            onClick={clearAllFilters}
                            disabled={
                              !partyFilter.length &&
                              !stateFilter.length &&
                              !ratingFilter.length &&
                              !selectedYears.length &&
                              !termFilter &&
                              !statusFilter.length
                            }
                          >
                            Clear All Filters
                          </Button>
                        </Box>
                      </Paper>
                    </ClickAwayListener>
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
              handleToggleStatusSenator={handleToggleStatusSenator}

            />
          </Stack>
        </Box>

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
            sx={{ width: "100%",
              //  bgcolor: "#FF474D"
               bgcolor: snackbarMessage === `${selectedSenator?.name} deleted successfully.` ? '#FF474D' : undefined
               }}
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