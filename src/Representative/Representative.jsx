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

  const ratingOptions = ["A+", "B", "C", "D", "F"];
  const [statusFilter, setStatusFilter] = useState([]);
  const statusOptions = ["published", "under review", "draft"];

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

      // Status filter
      const statusMatch =
        statusFilter.length === 0 ||
        (transformedHouse.publishStatus && statusFilter.includes(transformedHouse.publishStatus));


      return nameMatch && partyMatch && districtMatch && ratingMatch && statusMatch;
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

  const handleStatusFilter = (status) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setPartyFilter([]);
    setDistrictFilter([]);
    setRatingFilter([]);
    setYearFilter([]);
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

  const activeFilterCount =
    partyFilter.length +
    districtFilter.length +
    ratingFilter.length +
    yearFilter.length +
    (termFilter ? 1 : 0) +
    statusFilter.length;

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
      <Box sx={{ display: { xs: "block", md: "flex" }, bgcolor: '#f6f6f6ff', }}>
        <SideMenu sx={{ display: { xs: "none", md: "block" } }} />
        <Box
          sx={{
            flexGrow: 1,
            // overflow: "auto",
            width: { xs: "100%", md: "80%" },
            filter: fetching ? "blur(1px)" : "none",
            pointerEvents: fetching ? "none" : "auto",
            px: { xs: 0.5, sm: 2, md: 0 },
            pt: { xs: 1, md: 0 },
          }}
        >
          <FixedHeader sx={{ display: { xs: "none", md: "block" } }} />
          <MobileHeader />
          <Stack
            spacing={2}
            sx={{
              alignItems: { xs: "stretch", md: "center" },
              mx: { xs: 0, md: 3 },
              pb: { xs: 2, md: 5 },
              mt: { xs: 2, md: 4 },
            }}
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
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "flex-end",
                alignItems: { xs: "stretch", sm: "center" },
                mt: { xs: 2, md: 4 },
                gap: 2,
                // bgcolor: "#fff",
                // borderTop: "1px solid ",
                // borderLeft: "1px solid ",
                // borderRight: "1px solid ",
                // borderTopLeftRadius: 8,
                // borderTopRightRadius: 8,
                // borderColor: "divider",
                // py: 3,
              }}
            >
              {/* <Typography component="h2" variant="h6" sx={{ mb: { xs: 1, sm: 0 }}}>
                All Representatives
              </Typography> */}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ width: { xs: "100%", sm: "auto" } }}>
                {/* Mobile: Show Fetch button above search/filter */}
                {userRole === "admin" && (
                  <Box sx={{ width: "100%", display: { xs: "block", sm: "none" }, }}>
                    <Button
                      variant="outlined"
                      sx={{
                        backgroundColor: "#173A5E !important",
                        color: "#fff !important",
                        width: "100%",
                        "&:hover": {
                          backgroundColor: "#357ABD !important",
                        },
                      }}
                      onClick={fetchRepresentativeFromQuorum}
                      fullWidth
                    >
                      Fetch Representatives from Quorum
                    </Button>
                  </Box>
                )}
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
                    marginLeft: { xs: 0, sm: "0.5rem" },
                    width: { xs: "50%", sm: "220px" },
                    "& .MuiOutlinedInput-root": {
                      // borderRadius: "12px",
                      backgroundColor: "#fff",
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


                <Box sx={{ position: "relative", display: "inline-block", width: { xs: "100%", sm: "auto" } }}>
                  <Badge
                    badgeContent={activeFilterCount}
                    color="primary"
                    sx={{
                      "& .MuiBadge-badge": {
                        top: 6,
                        right: 6,
                        bgcolor: '#E24042'
                      },
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      endIcon={
                        filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                      }
                      onClick={toggleFilter}
                      sx={{
                        padding: { xs: "0.25rem 0.5rem", sm: "0.5rem 1rem" },
                        minWidth: { xs: "100%", sm: "120px" },
                        borderColor: filterOpen ? "primary.main" : "divider",
                        color: "#fff",
                        backgroundColor: "#497BB2",
                        "&:hover": {
                          backgroundColor: "#3B6799",
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
                          mt: 0.5,
                          width: 320,
                          zIndex: 1,
                          boxShadow: 3,
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            p: 0.5,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            alignItems="center"
                          >
                            {/* <Typography variant="subtitle1" fontWeight="bold">
                              Filters
                            </Typography> */}
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
                                : "#fff",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 1.5, px: 2, cursor: "pointer" }}
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
                              <Box sx={{ maxHeight: 200, overflow: "auto", bgcolor: '#fff' }}>
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
                                        {party.charAt(0).toUpperCase() + party.slice(1)}
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
                                : "#fff",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 1.5, px: 2, cursor: "pointer" }}
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
                                    handleSearchChange("district", e.target.value)
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
                              <Box sx={{ maxHeight: 200, overflow: "auto", bgcolor: '#fff' }}>
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
                                : "#fff",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 1.5, px: 2, cursor: "pointer" }}
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
                              <Box sx={{ maxHeight: 200, overflow: "auto", bgcolor: '#fff' }}>
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
                                : "#fff",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 1.5, px: 2, cursor: "pointer" }}
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
                              <Box sx={{ maxHeight: 200, overflow: "auto", bgcolor: '#fff' }}>
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
                                : "#fff",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 1.5, px: 2, cursor: "pointer" }}
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
                              <Box sx={{ maxHeight: 200, overflow: "auto", bgcolor: '#fff' }}>
                                {["current"/*, "past"*/].map((term) => (
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

                        {/* Status Filter */}
                        <Box
                          sx={{
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            bgcolor:
                              expandedFilter === "status"
                                ? "action.hover"
                                : "#fff",
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 1.5, px: 2, cursor: "pointer" }}
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
                              <Box sx={{ maxHeight: 200, overflow: "auto", bgcolor: '#fff' }}>
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
                            // p: 2,
                            // borderTop: "1px solid",
                            // borderColor: "divider",
                          }}
                        >
                          <Button
                            fullWidth
                            // variant="outlined"
                            // color="secondary"
                            sx={{ borderRadius: 0, bgcolor: '#fff' }}
                            onClick={clearAllFilters}
                            disabled={
                              !partyFilter.length &&
                              !districtFilter.length &&
                              !ratingFilter.length &&
                              !yearFilter.length &&
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

                {userRole === "admin" && (<Button
                  variant="outlined"
                  sx={{
                    backgroundColor: "#173A5E !important",
                    color: "#fff !important",
                    padding: { xs: "0.25rem 0.5rem", sm: "0.5rem 1rem" },
                    marginLeft: { xs: 0, sm: "0.5rem" },
                    display: { xs: "none", sm: "block" },
                    "&:hover": {
                      backgroundColor: "#1E4C80 !important",
                    },
                  }}
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
              width: "100%",
              // ✅ Background conditions
              bgcolor:
                snackbarMessage === `${selectedRepresentative?.name} deleted successfully.`
                  ? "#fde8e4"
                  : snackbarMessage === "Success: Representatives fetched successfully!"
                    ? "#daf4f0"
                    : undefined,

              // ✅ Icon color conditions
              "& .MuiAlert-icon": {
                color:
                  snackbarMessage === `${selectedRepresentative?.name} deleted successfully.`
                    ? "#cc563d"
                    : snackbarMessage === "Success: Representatives fetched successfully!"
                      ? "#099885"
                      : undefined,
              },

              // ✅ Text color conditions
              "& .MuiAlert-message": {
                color:
                  snackbarMessage === `${selectedRepresentative?.name} deleted successfully.`
                    ? "#cc563d"
                    : snackbarMessage === "Success: Representatives fetched successfully!"
                      ? "#099885"
                      : undefined,
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