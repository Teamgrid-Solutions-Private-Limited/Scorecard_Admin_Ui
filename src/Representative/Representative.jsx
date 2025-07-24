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
  Paper
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

  const [partyFilter, setPartyFilter] = useState([]);
  const [districtFilter, setDistrictFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([]);
  const { houseData } = useSelector((state) => state.houseData)
  const [mergedHouses, setMergedHouses] = useState([]);
  const [yearFilter, setYearFilter] = useState([]);
  const [termFilter, setTermFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [searchTerms, setSearchTerms] = useState({
    party: "",
    district: "",
    rating: "",
    year: "",
  });
  const { terms } = useSelector((state) => state.term);
  const token = localStorage.getItem("token");

  const ratingOptions = ["A+", "B", "C", "D", "F"];

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2015; y--) {
    years.push(y);
  }


  useEffect(() => {
    dispatch(getAllHouses());
    dispatch(getAllHouseData());
    dispatch(getAllTerms());
  }, [dispatch]);

  //  useEffect(() => {
  //     if (houses && houseData) {
  //       const merged = houses
  //         .map((house) => {
  //           const match = houseData.find((data) => data.houseId === house._id);
  //           return {
  //             ...house,
  //             rating: match ? match.rating : "N/A",
  //           };
  //         });
  //   console.log("Merged Houses:", merged);
  //       setMergedHouses(merged);
  //     }
  //   }, [houses, houseData]);
  useEffect(() => {
    if (houses && houseData && terms) {
      const merged = houses.map((house) => {
        const match = houseData.find((data) => data.houseId === house._id);
        const termId = match ? match.termId : house.termId;
        const termObj = terms.find(t => t._id === termId);

        return {
          ...house,
          rating: match ? match.rating : "N/A",
          termId: termId,
          termName: termObj ? termObj.name : "",
          currentTerm: match ? match.currentTerm : false // Add currentTerm from houseData
        };
      });

      console.log("Merged Houses with termName:", merged);
      setMergedHouses(merged);
    }
  }, [houses, houseData, terms]);


  const transformedHouses = mergedHouses.map((house) => ({
    ...house,
    district: house.district?.split(", ").pop() || "Unknown",
    currentTerm: house.currentTerm || false // Ensure currentTerm exists
  }));

  const partyOptions = [...new Set(transformedHouses.map(rep => rep.party))].filter(Boolean);
  const districtOptions = [...new Set(transformedHouses.map(rep => rep.district))].filter(Boolean);

  const filteredPartyOptions = partyOptions.filter((party) =>
    party.toLowerCase().includes(searchTerms.party)
  );

  const filteredDistrictOptions = districtOptions.filter((district) =>
    district.toLowerCase().includes(searchTerms.district)
  );

  const filteredRatingOptions = ratingOptions.filter((rating) =>
    rating.toLowerCase().includes(searchTerms.rating)
  );

  const filteredYearOptions = years.filter((year) =>
    year.toString().includes(searchTerms.year)
  );


  const filteredRepresentative = transformedHouses.filter(
    (transformedHouse) => {
      // Term filter logic - now properly checking currentTerm field
      if (termFilter === 'current') {
        if (transformedHouse.currentTerm !== true) return false;
      } else if (termFilter === 'past') {
        if (transformedHouse.currentTerm === true) return false;
      }
      // const nameMatch = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
      // .every((word) => transformedHouse.name.toLowerCase().includes(word));
      if (yearFilter.length > 0) {
        const [start, end] = transformedHouse.termName?.split("-").map(Number) || [];
        const matchesYear = yearFilter.some(year => start && end && year >= start && year <= end);
        if (!matchesYear) return false;
      }

      // Name search filter
      const nameMatch = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every(word => transformedHouse.name.toLowerCase().includes(word));

      // Rating filter
      const ratingMatch = ratingFilter.length === 0 ||
        (transformedHouse.rating && ratingFilter.includes(transformedHouse.rating));

      // Party filter
      const partyMatch = partyFilter.length === 0 || partyFilter.includes(transformedHouse.party);

      // District filter
      const districtMatch = districtFilter.length === 0 || districtFilter.includes(transformedHouse.district);



      return nameMatch && partyMatch && districtMatch && ratingMatch;
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
  }

  // Filter handlers


  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };


  const handlePartyFilter = (party) => {
    setPartyFilter(prev =>
      prev.includes(party)
        ? prev.filter(p => p !== party)
        : [...prev, party]
    );
  };

  const handleDistrictFilter = (district) => {
    setDistrictFilter(prev =>
      prev.includes(district)
        ? prev.filter(s => s !== district)
        : [...prev, district]
    );
  };

  const handleRatingFilter = (rating) => {
    setRatingFilter(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };
  const handleYearFilter = (year) => {
    setYearFilter(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  const handleTermFilter = (term) => {
    setTermFilter((prev) => (prev === term ? null : term));
  };
  // Add this handler
  const handleTermMenuOpen = (event) => {
    setTermFilterAnchorEl(event.currentTarget);
  };

  const clearAllFilters = () => {
    setPartyFilter([]);
    setDistrictFilter([]);
    setRatingFilter([]);
    setYearFilter([]);
    setTermFilter(null);
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
      setSnackbarMessage(`${selectedRepresentative?.name} deleted successfully.`);
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
            filter: fetching ? "blur(1px)" : "none",
            pointerEvents: fetching ? "none" : "auto",
          }}
        >
          <FixedHeader />
          <Stack
            spacing={2}
            sx={{ alignItems: "center", mx: 2, pb: 5, mt: { xs: 8, md: 0 } }}
          >
            {/* <Typography
              variant="h4"
              align="center"
              sx={{ paddingTop: "50px", paddingBottom: "70px", color: "text.secondary", mb: 6 }}
            >
              SBA Scorecard Management System
            </Typography> */}

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
                All Representatives
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  placeholder="Search Representatives"
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
                    badgeContent={
                      partyFilter.length +
                      districtFilter.length +
                      ratingFilter.length +
                      yearFilter.length +
                      (termFilter ? 1 : 0)
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
                  </Badge>

                  {filterOpen && (
                    <ClickAwayListener onClickAway={() => setFilterOpen(false)}>
                      <Paper
                        sx={{
                          position: "absolute",
                          right: 0,
                          top: "100%",
                          mt: 1,
                          width: 320,
                          zIndex: 1200,
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
                              <TextField
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
                              />
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
                                      <Typography variant="body2" sx={{ ml: 1 }}>
                                        {party}
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
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor:
                              expandedFilter === "district"
                                ? "action.hover"
                                : "background.paper",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 2, cursor: "pointer" }}
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
                            <Box sx={{ p: 2, pt: 0 }}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Search districts..."
                                value={searchTerms.district}
                                onChange={(e) =>
                                  handleSearchChange("district", e.target.value)
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
                                {filteredDistrictOptions.length > 0 ? (
                                  filteredDistrictOptions.map((district) => (
                                    <Box
                                      key={district}
                                      onClick={() => handleDistrictFilter(district)}
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
                                      {districtFilter.includes(district) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography variant="body2" sx={{ ml: 1 }}>
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
                              <TextField
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
                              />
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
                                      <Typography variant="body2" sx={{ ml: 1 }}>
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
                                        handleYearFilter(year)
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
                                      {yearFilter.includes(year) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography variant="body2" sx={{ ml: 1 }}>
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
                                {["current", "past"].map((term) => (
                                  <Box
                                    key={term}
                                    onClick={() => handleTermFilter(term)}
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
                                    {termFilter === term ? (
                                      <CheckIcon
                                        color="primary"
                                        fontSize="small"
                                      />
                                    ) : (
                                      <Box sx={{ width: 24, height: 24 }} />
                                    )}
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      {term === "current" ? "Current Term" : "Past Terms"}
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
                              !districtFilter.length &&
                              !ratingFilter.length &&
                              !yearFilter.length &&
                              !termFilter
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
                  onClick={fetchRepresentativeFromQuorum}
                >
                  Fetch Representatives from Quorum
                </Button>
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
            sx={{ width: "100%", bgcolor: snackbarMessage === `${selectedRepresentative?.name} deleted successfully.` ? '#FF474D' : undefined }}
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
