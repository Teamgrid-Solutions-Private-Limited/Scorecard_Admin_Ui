import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteSenator,
  getAllSenators,
  updateSenatorStatus,
} from "../redux/reducer/senetorSlice";
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
  Paper,
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
import { useTheme } from "@mui/material/styles";
import { jwtDecode } from "jwt-decode";
import MobileHeader from "../components/MobileHeader";

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

  const [progress, setProgress] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSenator, setSelectedSenator] = useState(null);
  const { terms } = useSelector((state) => state.term);
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;
  const [partyFilter, setPartyFilter] = useState([]);
  const [stateFilter, setStateFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [mergedSenators, setMergedSenators] = useState([]);
  const [termFilter, setTermFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [selectedYears, setSelectedYears] = useState([]);
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
  const statusOptions = ["published", "under review", "draft"];

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
          currentTerm: match?.currentTerm ?? null, // Ensure currentTerm is included
        };
      });
      setMergedSenators(merged);
    }
  }, [senators, senatorData, terms]);

  // Build list of years from 2015 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2015; y--) {
    years.push(y);
  }

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
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };
  const handleStatusFilter = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTermFilter = (term) => {
    setTermFilter((prev) => (prev === term ? null : term));
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
    if (termFilter === "current") {
      if (senator.currentTerm !== true) return false;
    } else if (termFilter === "past") {
      if (senator.currentTerm === true) return false;
    }
    // Year filter
    if (selectedYears.length > 0) {
      if (senator.termName && senator.termName.includes("-")) {
        const [start, end] = senator.termName.split("-").map(Number);
        const hasMatchingYear = selectedYears.some((year) => {
          const yearNum = Number(year);
          return yearNum >= start && yearNum <= end;
        });
        if (!hasMatchingYear) return false;
      } else {
        return false;
      }
    }

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
    const newStatus =
      senator.publishStatus === "published" ? "draft" : "published";

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
        <Box className="circularLoader">
          <CircularProgress sx={{ color: "#CC9A3A !important" }} />
        </Box>
      )}
      <Box className="container">
        <SideMenu />

        <Box className={`contentBox ${fetching ? "fetching" : "notFetching"}`}>
          <FixedHeader />
          <MobileHeader />
          <Stack spacing={2} className="stackBox">
            <Box className="actionsBox">
              {userRole === "admin" && (
                <Box className="adminBox">
                  <Button
                    variant="outlined"
                    className="fetchBtn"
                    onClick={fetchSenatorsFromQuorum}
                  >
                    Fetch Senators from Quorum
                  </Button>
                </Box>
              )}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <TextField
                  placeholder="Search Senators"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth={true}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className="search-icon" />
                      </InputAdornment>
                    ),
                  }}
                  className="custom-search"
                />

                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Badge
                    badgeContent={
                      activeFilterCount > 0 ? activeFilterCount : null
                    }
                    color="primary"
                    className="filter-badge"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      endIcon={
                        filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                      }
                      onClick={toggleFilter}
                      className="filter-button"
                    >
                      Filters
                    </Button>
                  </Badge>

                  {filterOpen && (
                    <ClickAwayListener onClickAway={() => setFilterOpen(false)}>
                      <Paper className="filter-paper">
                        <Box className="filter-header">
                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            alignItems="center"
                          >
                            <IconButton size="small" onClick={toggleFilter}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Party Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "party" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
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
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                {filteredPartyOptions.length > 0 ? (
                                  filteredPartyOptions.map((party) => (
                                    <Box
                                      key={party}
                                      className="filter-option"
                                      onClick={() => handlePartyFilter(party)}
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
                                        {party.charAt(0).toUpperCase() +
                                          party.slice(1)}
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
                          className={`filter-section ${
                            expandedFilter === "state" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
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
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box sx={{ mb: 2, px: 2 }}>
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
                                />
                              </Box>
                              <Box className="filter-scroll">
                                {filteredStateOptions.length > 0 ? (
                                  filteredStateOptions.map((state) => (
                                    <Box
                                      key={state}
                                      onClick={() => handleStateFilter(state)}
                                      className="filter-option"
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
                          className={`filter-section ${
                            expandedFilter === "rating" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
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
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                {filteredRatingOptions.length > 0 ? (
                                  filteredRatingOptions.map((rating) => (
                                    <Box
                                      key={rating}
                                      onClick={() => handleRatingFilter(rating)}
                                      className="filter-option"
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
                          className={`filter-section ${
                            expandedFilter === "year" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
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
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box sx={{ mb: 2, px: 2 }}>
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
                                />
                              </Box>
                              <Box className="filter-scroll">
                                {filteredYearOptions.length > 0 ? (
                                  filteredYearOptions.map((year) => (
                                    <Box
                                      key={year}
                                      onClick={() =>
                                        handleYearFilter(year.toString())
                                      }
                                      className="filter-option"
                                    >
                                      {selectedYears.includes(
                                        year.toString()
                                      ) ? (
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
                          )}
                        </Box>

                        {/* Term Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "term" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
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
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                {["current" /*, "past"*/].map((term) => (
                                  <Box
                                    key={term}
                                    onClick={() => handleTermFilter(term)}
                                    className="filter-option"
                                  >
                                    {termFilter === term ? (
                                      <CheckIcon
                                        color="primary"
                                        fontSize="small"
                                      />
                                    ) : (
                                      <Box sx={{ width: 24, height: 24 }} />
                                    )}
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      {term === "current"
                                        ? "Current Term"
                                        : "Past Terms"}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Status Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "status" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
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
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                {statusOptions.map((status) => (
                                  <Box
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    className="filter-option"
                                  >
                                    {statusFilter.includes(status) ? (
                                      <CheckIcon
                                        color="primary"
                                        fontSize="small"
                                      />
                                    ) : (
                                      <Box sx={{ width: 24, height: 24 }} />
                                    )}
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Clear All Button */}
                        <Box>
                          <Button
                            fullWidth
                            sx={{ borderRadius: 0, bgcolor: "#fff" }}
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

                {/* Desktop: Show Fetch button inside search/filter stack */}
                {userRole === "admin" && (
                  <Button
                    variant="outlined"
                    className="fetch-btn"
                    onClick={fetchSenatorsFromQuorum}
                  >
                    Fetch Senators from Quorum
                  </Button>
                )}
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{
              border: "none",
              boxShadow: "none",
              width: "100%",
              bgcolor:
                snackbarMessage ===
                `${selectedSenator?.name} deleted successfully.`
                  ? "#fde8e4"
                  : snackbarMessage ===
                    "Success: Senators fetched successfully!"
                  ? "#daf4f0"
                  : undefined,

              "& .MuiAlert-icon": {
                color:
                  snackbarMessage ===
                  `${selectedSenator?.name} deleted successfully.`
                    ? "#cc563d"
                    : snackbarMessage ===
                      "Success: Senators fetched successfully!"
                    ? "#099885"
                    : undefined,
              },

              "& .MuiAlert-message": {
                color:
                  snackbarMessage ===
                  `${selectedSenator?.name} deleted successfully.`
                    ? "#cc563d"
                    : snackbarMessage ===
                      "Success: Senators fetched successfully!"
                    ? "#099885"
                    : undefined,
              },
              "& .MuiAlert-action": {
                display: "flex",
                alignItems: "center",
                paddingTop: 0,
                paddingBottom: 0,
              },
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
    </AppTheme>
  );
}
