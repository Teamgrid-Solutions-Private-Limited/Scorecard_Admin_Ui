import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllHouses,
  deleteHouse,
  updateRepresentativeStatus,
} from "../redux/reducer/houseSlice";
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Badge,
  InputAdornment,
  IconButton,
  ClickAwayListener,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import AppTheme from "../../src/shared-theme/AppTheme";
import SideMenu from "../../src/components/SideMenu";
import MainGrid from "../../src/components/MainGrid";
import { API_URL } from "../redux/API";
import axios from "axios";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../../src/Themes/customizations";
import FixedHeader from "../../src/components/FixedHeader";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};
import { getAllHouseData } from "../redux/reducer/houseTermSlice";
import { getAllTerms } from "../redux/reducer/termSlice";
import { jwtDecode } from "jwt-decode";
import MobileHeader from "../components/MobileHeader";

export default function Representative(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { houses, loading } = useSelector((state) => state.house);
  const [fetching, setFetching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const token = localStorage.getItem("token");
  // Decode token to get user role
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  const [partyFilter, setPartyFilter] = useState([]);
  const [districtFilter, setDistrictFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([]);
  const { houseData } = useSelector((state) => state.houseData);
  const [mergedHouses, setMergedHouses] = useState([]);
  const [congressFilter, setCongressFilter] = useState([]);
  const [termFilter, setTermFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [searchTerms, setSearchTerms] = useState({
    party: "",
    district: "",
    rating: "",
    congress: "",
  });
  const { terms } = useSelector((state) => state.term);

  const ratingOptions = ["A+", "B", "C", "D", "F"];
  const [statusFilter, setStatusFilter] = useState([]);
  const statusOptions = ["published", "under review", "draft"];

  const getOrdinalSuffix = (num) => {
    const n = Number(num);
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  };

  // Build congress options from available houseData terms

  useEffect(() => {
    dispatch(getAllHouses());
    dispatch(getAllHouseData());
    dispatch(getAllTerms());
  }, [dispatch]);

 useEffect(() => {
  if (houses && houseData && terms) {
    const merged = houses.map((house) => {
      const houseRecords = houseData.filter((data) => data.houseId === house._id);
      const currentTermData = houseRecords.find((rec) => rec.currentTerm === true);

      let termId;
      let rating = "N/A";
      let termName = "";
      let currentTerm = false;

      if (currentTermData) {
        termId = currentTermData.termId;
        rating = currentTermData.rating !== undefined && currentTermData.rating !== null 
          ? currentTermData.rating 
          : "N/A";
        currentTerm = true;

        if (currentTermData.rating === "") {
          const fallbackRecords = houseRecords
            .map((rec) => {
              const termObj = terms.find((t) => t._id === rec.termId);
              return termObj ? { ...rec, termObj } : null;
            })
            .filter(Boolean)
            .sort((a, b) => {
              const aYear = parseInt(a.termObj.endYear, 10) || 0;
              const bYear = parseInt(b.termObj.endYear, 10) || 0;
              return bYear - aYear;
            });

          const valid = fallbackRecords.find((rec) => rec.rating && rec.rating.trim() !== "");
          if (valid) {
            rating = valid.rating;
            termId = valid.termId;
          }
        }
        
        const termObj = terms.find((t) => t._id === termId);
        termName = termObj ? termObj.name : "";
        
      } else {
        const validRecords = houseRecords
          .map((rec) => {
            const termObj = terms.find((t) => t._id === rec.termId);
            return termObj ? { ...rec, termObj } : null;
          })
          .filter(Boolean)
          .sort((a, b) => {
            const aYear = parseInt(a.termObj.endYear, 10) || 0;
            const bYear = parseInt(b.termObj.endYear, 10) || 0;
            return bYear - aYear;
          });

        if (validRecords.length > 0) {
          const latest = validRecords.find((rec) => rec.rating && rec.rating.trim() !== "");
          if (latest) {
            termId = latest.termId;
            rating = latest.rating;
            termName = latest.termObj.name;
          } else {
            const mostRecent = validRecords[0];
            termId = mostRecent.termId;
            rating = mostRecent.rating || "N/A";
            termName = mostRecent.termObj.name;
          }
        } else {
          termId = house.termId;
          const termObj = terms.find((t) => t._id === termId);
          termName = termObj ? termObj.name : "";
          rating = "N/A";
        }
      }

      // Collect all term entries for this representative for filtering (congress)
      const allTerms = houseRecords
        .map((rec) => {
          const termObj = terms.find((t) => t._id === rec.termId);
          return termObj
            ? {
                termId: rec.termId,
                termName: termObj.name || "",
                currentTerm: rec.currentTerm || false,
                rating: rec.rating,
                congresses: Array.isArray(termObj.congresses) ? termObj.congresses : [],
              }
            : null;
        })
        .filter(Boolean);

      return {
        ...house,
        rating,
        termId,
        termName,
        currentTerm,
        allTerms,
      };
    });

    setMergedHouses(merged);
  }
}, [houses, houseData, terms]);

  const transformedHouses = mergedHouses.map((house) => ({
    ...house,
    district: house.district?.split(", ").pop() || "Unknown",
    currentTerm: house.currentTerm || false, // Ensure currentTerm exists
  }));

  const partyOptions = [
    ...new Set(transformedHouses.map((rep) => rep.party)),
  ].filter(Boolean);
  const districtOptions = [
    ...new Set(transformedHouses.map((rep) => rep.district)),
  ].filter(Boolean);

  const filteredPartyOptions = partyOptions.filter((party) =>
    party.toLowerCase().includes(searchTerms.party)
  );

  const filteredDistrictOptions = districtOptions.filter((district) =>
    district.toLowerCase().includes(searchTerms.district)
  );

  const filteredRatingOptions = ratingOptions.filter((rating) =>
    rating.toLowerCase().includes(searchTerms.rating)
  );

  // Build Congress options and map each congress to a year range using only terms with a single congress value
  const congressYearMap = (() => {
    const map = {};
    (terms || []).forEach((t) => {
      const list = Array.isArray(t.congresses) ? t.congresses : [];
      if (list.length === 1) {
        const c = list[0];
        if (!map[c]) {
          map[c] = { startYear: t.startYear, endYear: t.endYear };
        }
      }
    });
    return map;
  })();

  const congressOptions = [
    ...new Set(Object.keys(congressYearMap).map((k) => Number(k))),
  ].sort((a, b) => a - b);

  const filteredCongressOptions = congressOptions.filter((c) => {
    const yr = congressYearMap[c];
    const label = yr ? `Congress ${c} (${yr.startYear}-${yr.endYear})` : `Congress ${c}`;
    return label.toLowerCase().includes(searchTerms.congress);
  });

  const filteredRepresentative = transformedHouses.filter(
    (transformedHouse) => {
      // Term filter logic - now properly checking currentTerm field
      if (termFilter === "current") {
        if (transformedHouse.currentTerm !== true) return false;
      } else if (termFilter === "past") {
        if (transformedHouse.currentTerm === true) return false;
      }
      // Congress filter: match if any of representative's term congress numbers intersect selection
      if (congressFilter.length > 0) {
        const houseTerms = mergedHouses.find((h) => h._id === transformedHouse._id)?.allTerms || [];
        const matchesCongress = houseTerms.some((t) => Array.isArray(t.congresses) && t.congresses.some((num) => congressFilter.includes(num)));
        if (!matchesCongress) return false;
      }

      // Name search filter
      const nameMatch = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => transformedHouse.name.toLowerCase().includes(word));

      // Rating filter
      const ratingMatch =
        ratingFilter.length === 0 ||
        (transformedHouse.rating &&
          ratingFilter.includes(transformedHouse.rating));

      // Party filter
      const partyMatch =
        partyFilter.length === 0 ||
        partyFilter.includes(transformedHouse.party);

      // District filter
      const districtMatch =
        districtFilter.length === 0 ||
        districtFilter.includes(transformedHouse.district);

      // Status filter
      const statusMatch =
        statusFilter.length === 0 ||
        (transformedHouse.publishStatus &&
          statusFilter.includes(transformedHouse.publishStatus));

      return (
        nameMatch && partyMatch && districtMatch && ratingMatch && statusMatch
      );
    }
  );

  // Filter handlers
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

  const handlePartyFilter = (party) => {
    setPartyFilter((prev) =>
      prev.includes(party) ? prev.filter((p) => p !== party) : [...prev, party]
    );
  };

  const handleDistrictFilter = (district) => {
    setDistrictFilter((prev) =>
      prev.includes(district)
        ? prev.filter((s) => s !== district)
        : [...prev, district]
    );
  };

  const handleCongressFilter = (congress) => {
    setCongressFilter((prev) =>
      prev.includes(congress)
        ? prev.filter((c) => c !== congress)
        : [...prev, congress]
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
    setYearFilter((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleTermFilter = (term) => {
    setTermFilter((prev) => (prev === term ? null : term));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setPartyFilter([]);
    setDistrictFilter([]);
    setRatingFilter([]);
    setCongressFilter([]);
    setTermFilter(null);
    setStatusFilter([]);
    setSearchQuery("");
  };

  const handleEdit = (row) => {
    navigate(`/edit-representative/${row._id}`);
  };

  const fetchRepresentativeFromQuorum = async () => {
    setFetching(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25));
    }, 1000);

    try {
      const response = await axios.post(
        `${API_URL}/fetch-quorum/store-data`,
        { type: "representative" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSnackbarMessage("Success: Representatives fetched successfully!");
        setSnackbarSeverity("success");
        await dispatch(getAllHouses());
      } else {
        throw new Error("Failed to fetch representatives from Quorum.");
      }
    } catch (error) {
      console.error("Error fetching representatives from Quorum:", error);
      setSnackbarMessage("Error: Unable to fetch representatives.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleDeleteClick = (row) => {
    setSelectedRepresentative(row);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setOpenDeleteDialog(false);
    setFetching(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25));
    }, 1000);

    try {
      await dispatch(deleteHouse(selectedRepresentative._id));
      await dispatch(getAllHouses());
      setSnackbarMessage(
        `${selectedRepresentative?.name} deleted successfully.`
      );
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Error deleting representative.");
      setSnackbarSeverity("error");
      console.error("Error fetching representatives from Quorum:", error);
      setSnackbarMessage("Error: Unable to fetch representatives.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    }
  };

  const handleToggleStatusHouse = async (house) => {
    const newStatus =
      house.publishStatus === "published" ? "draft" : "published";
    try {
      await dispatch(
        updateRepresentativeStatus({ id: house._id, publishStatus: newStatus })
      ).unwrap();

      // Optimistically update local UI without waiting for getAllHouses
      const updated = houses.map((h) =>
        h._id === house._id ? { ...h, publishStatus: newStatus } : h
      );
      // You may set local state with setHouses(updated) if you're maintaining local state
      // Or let redux update on re-fetch:
      dispatch(getAllHouses());
    } catch (error) {
      console.error("Failed to update status:", error);
      setSnackbarMessage("Failed to update status.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const activeFilterCount =
    partyFilter.length +
    districtFilter.length +
    ratingFilter.length +
    congressFilter.length +
    (termFilter ? 1 : 0) +
    statusFilter.length;

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
                    onClick={fetchRepresentativeFromQuorum}
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
                  placeholder="Search Representatives"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#173A5E", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    //  marginLeft: { xs: 0, sm: "0.5rem" },
                    width: { xs: "50%", sm: "235px" },
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                      padding: "19.1px",
                      transition: "all 0.2s ease-in-out",
                      "& fieldset": {
                        borderColor: "#e5e7eb",
                      },
                      "&:hover fieldset": {
                        borderColor: "#cbd5e1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#173A5E",
                        borderWidth: "2px",
                      },
                    },

                    "& input::placeholder": {
                      fontSize: "0.9rem",
                      color: "#9ca3af",
                    },
                  }}
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
                                      onClick={() => handlePartyFilter(party)}
                                      className="filter-option"
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

                        {/* District Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "district" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("district")}
                          >
                            <Typography variant="body1">District</Typography>
                            {expandedFilter === "district" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "district" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box sx={{ mb: 2, px: 2 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Search districts..."
                                  value={searchTerms.district}
                                  onChange={(e) =>
                                    handleSearchChange(
                                      "district",
                                      e.target.value
                                    )
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
                                {filteredDistrictOptions.length > 0 ? (
                                  filteredDistrictOptions.map((district) => (
                                    <Box
                                      key={district}
                                      onClick={() =>
                                        handleDistrictFilter(district)
                                      }
                                      className="filter-option"
                                    >
                                      {districtFilter.includes(district) ? (
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
                                        {district}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No districts found
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

                        {/* Congress Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "congress" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("congress")}
                          >
                            <Typography variant="body1">Congress</Typography>
                            {expandedFilter === "congress" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "congress" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box sx={{ mb: 2, px: 2 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Search Congress..."
                                  value={searchTerms.congress}
                                  onChange={(e) =>
                                    handleSearchChange("congress", e.target.value)
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
                                {filteredCongressOptions.length > 0 ? (
                                  filteredCongressOptions.map((congress) => (
                                    <Box
                                      key={congress}
                                      onClick={() => handleCongressFilter(congress)}
                                      className="filter-option"
                                    >
                                      {congressFilter.includes(congress) ? (
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
                                        {congressYearMap[congress]
                                          ? `${getOrdinalSuffix(congress)} Congress (${congressYearMap[congress].startYear}-${congressYearMap[congress].endYear})`
                                          : `${getOrdinalSuffix(congress)} Congress`}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No Congress found
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
                              !districtFilter.length &&
                              !ratingFilter.length &&
                              !congressFilter.length &&
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

                {userRole === "admin" && (
                  <Button
                    variant="outlined"
                    className="fetch-btn"
                    onClick={fetchRepresentativeFromQuorum}
                  >
                    Fetch Representatives from Quorum
                  </Button>
                )}
              </Stack>
            </Box>
            {/* Representative Table */}
            <MainGrid
              type="representative"
              data={filteredRepresentative || []}
              loading={fetching ? false : loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              handleToggleStatusHouse={handleToggleStatusHouse}
            />
          </Stack>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
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
                `${selectedRepresentative?.name} deleted successfully.`
                  ? "#fde8e4"
                  : snackbarMessage ===
                    "Success: Representatives fetched successfully!"
                  ? "#daf4f0"
                  : undefined,

              "& .MuiAlert-icon": {
                color:
                  snackbarMessage ===
                  `${selectedRepresentative?.name} deleted successfully.`
                    ? "#cc563d"
                    : snackbarMessage ===
                      "Success: Representatives fetched successfully!"
                    ? "#099885"
                    : undefined,
              },

              "& .MuiAlert-message": {
                color:
                  snackbarMessage ===
                  `${selectedRepresentative?.name} deleted successfully.`
                    ? "#cc563d"
                    : snackbarMessage ===
                      "Success: Representatives fetched successfully!"
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
            sx: { borderRadius: 3, padding: 2, width: '90%', maxWidth: 420 },
          }}
        >
          <DialogTitle className="dialogBox">
            Confirm Deletion
          </DialogTitle>

          <DialogContent>
            <DialogContentText className="dialogTitle">
              Are you sure you want to delete{" "}
              <strong>{selectedRepresentative?.name}</strong>?
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
