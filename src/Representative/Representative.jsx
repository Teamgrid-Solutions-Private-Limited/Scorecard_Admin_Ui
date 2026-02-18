import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllHouses,
  deleteHouse,
  updateRepresentativeStatus,
  bulkPublishHouses,
} from "../redux/reducer/houseSlice";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  Badge,
  InputAdornment,
  IconButton,
  ClickAwayListener,
  Paper,
} from "@mui/material";
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
import {
  getAllHouseData,
  updateHouseScores,
} from "../redux/reducer/houseTermSlice";
import { getAllTerms } from "../redux/reducer/termSlice";
import { getAllVotes } from "../redux/reducer/voteSlice";
import { getAllActivity } from "../redux/reducer/activitySlice";
import MobileHeader from "../components/MobileHeader";
import LoadingOverlay from "../components/LoadingOverlay";
import { getToken, getUserRole } from "../utils/auth";
import { useSnackbar } from "../hooks";
import FetchFromQuorumDialog from "../components/FetchFromQuorumDialog";
import SnackbarComponent from "../components/SnackbarComponent";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
export default function Representative(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    open: snackbarOpen,
    message: snackbarMessage,
    severity: snackbarSeverity,
    showSnackbar,
    hideSnackbar,
  } = useSnackbar();
  const { houses, loading } = useSelector((state) => state.house);
  const [fetching, setFetching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);
  const token = getToken();
  const userRole = getUserRole();

  const [partyFilter, setPartyFilter] = useState([]);
  const [districtFilter, setDistrictFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([]);
  const { houseData } = useSelector((state) => state.houseData);
  const [mergedHouses, setMergedHouses] = useState([]);
  const [congressFilter, setCongressFilter] = useState([]);
  const [termFilter, setTermFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [openFetchDialog, setOpenFetchDialog] = useState(false);
  const [fetchType, setFetchType] = useState("active");
  const [searchTerms, setSearchTerms] = useState({
    party: "",
    district: "",
    rating: "",
    congress: "",
  });
  const [currentOrFormerFilter, setCurrentOrFormerFilter] = useState("current");
  const { terms } = useSelector((state) => state.term);

  const ratingOptions = ["A+", "B", "C", "D", "F"];
  const [statusFilter, setStatusFilter] = useState([]);
  const [isNewFilter, setIsNewFilter] = useState(false);
  const [alternateProfileFilter, setAlternateProfileFilter] = useState(false);
  const statusOptions = ["published", "draft"];

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

  useEffect(() => {
    dispatch(getAllHouses());
    dispatch(getAllHouseData());
    dispatch(getAllTerms());
    dispatch(getAllVotes());
    dispatch(getAllActivity());
  }, [dispatch]);

  useEffect(() => {
    if (houses && houseData && terms) {
      const merged = houses.map((house) => {
        const houseRecords = houseData.filter(
          (data) => data.houseId === house._id,
        );
        const currentTermData = houseRecords.find(
          (rec) => rec.currentTerm === true,
        );

        let termId;
        let rating = "N/A";
        let termName = "";
        let currentTerm = false;

        if (currentTermData) {
          termId = currentTermData.termId;
          rating =
            currentTermData.rating !== undefined &&
            currentTermData.rating !== null
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

            const valid = fallbackRecords.find(
              (rec) => rec.rating && rec.rating.trim() !== "",
            );
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
            const latest = validRecords.find(
              (rec) => rec.rating && rec.rating.trim() !== "",
            );
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
        const allTerms = houseRecords
          .map((rec) => {
            const termObj = terms.find((t) => t._id === rec.termId);
            return termObj
              ? {
                  termId: rec.termId,
                  termName: termObj.name || "",
                  currentTerm: rec.currentTerm || false,
                  rating: rec.rating,
                  congresses: Array.isArray(termObj.congresses)
                    ? termObj.congresses
                    : [],
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
          isNewRecord: house.isNewRecord || false,
          displayAlternateProfileLink:
            house.displayAlternateProfileLink || false,
          alternateProfileLink: house.alternateProfileLink || "",
        };
      });

      setMergedHouses(merged);
    }
  }, [houses, houseData, terms]);

  const transformedHouses = mergedHouses.map((house) => ({
    ...house,
    district: house.district?.split(", ").pop() || "Unknown",
    currentTerm: house.currentTerm || false,
  }));

  const partyOptions = [
    ...new Set(transformedHouses.map((rep) => rep.party)),
  ].filter(Boolean);
  const districtOptions = [
    ...new Set(transformedHouses.map((rep) => rep.district)),
  ].filter(Boolean);

  const filteredPartyOptions = partyOptions.filter(
    (party) =>
      party.toLowerCase() !== "unknown" &&
      party.toLowerCase().includes(searchTerms.party),
  );
  const filteredDistrictOptions = districtOptions.filter(
    (district) =>
      district.toLowerCase() !== "unknown" &&
      district.toLowerCase().includes(searchTerms.district),
  );

  const filteredRatingOptions = ratingOptions.filter((rating) =>
    rating.toLowerCase().includes(searchTerms.rating),
  );

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
    const label = yr
      ? `Congress ${c} (${yr.startYear}-${yr.endYear})`
      : `Congress ${c}`;
    return label.toLowerCase().includes(searchTerms.congress);
  });

  const filteredRepresentative = transformedHouses.filter(
    (transformedHouse) => {
      // Current/Former toggle filter - based on status field (case-insensitive)
      if (currentOrFormerFilter === "current") {
        if (transformedHouse.status?.toLowerCase() !== "active") return false;
      } else if (currentOrFormerFilter === "former") {
        if (transformedHouse.status?.toLowerCase() !== "former") return false;
      }

      if (termFilter === "current") {
        if (transformedHouse.currentTerm !== true) return false;
      } else if (termFilter === "past") {
        if (transformedHouse.currentTerm === true) return false;
      }
      if (congressFilter.length > 0) {
        const houseTerms =
          mergedHouses.find((h) => h._id === transformedHouse._id)?.allTerms ||
          [];
        const matchesCongress = houseTerms.some(
          (t) =>
            Array.isArray(t.congresses) &&
            t.congresses.some((num) => congressFilter.includes(num)),
        );
        if (!matchesCongress) return false;
      }

      const nameMatch = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => transformedHouse.name.toLowerCase().includes(word));

      const ratingMatch =
        ratingFilter.length === 0 ||
        (transformedHouse.rating &&
          ratingFilter.includes(transformedHouse.rating));

      const partyMatch =
        partyFilter.length === 0 ||
        partyFilter.includes(transformedHouse.party);

      const districtMatch =
        districtFilter.length === 0 ||
        districtFilter.includes(transformedHouse.district);

      const statusMatch =
        statusFilter.length === 0 ||
        (transformedHouse.publishStatus &&
          statusFilter.includes(transformedHouse.publishStatus)) ||
        (statusFilter.includes("draft") &&
          transformedHouse.publishStatus === "under review");

      // Is New filter
      const isNewMatch = !isNewFilter || !!transformedHouse.isNewRecord;

      // Alternate Profile filter - show records that have alternateProfileLink value set
      const alternateProfileMatch =
        !alternateProfileFilter || !!transformedHouse.alternateProfileLink;

      return (
        nameMatch &&
        partyMatch &&
        districtMatch &&
        ratingMatch &&
        statusMatch &&
        isNewMatch &&
        alternateProfileMatch
      );
    },
  );

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
      prev.includes(party) ? prev.filter((p) => p !== party) : [...prev, party],
    );
  };

  const handleDistrictFilter = (district) => {
    setDistrictFilter((prev) =>
      prev.includes(district)
        ? prev.filter((s) => s !== district)
        : [...prev, district],
    );
  };

  const handleCongressFilter = (congress) => {
    setCongressFilter((prev) =>
      prev.includes(congress)
        ? prev.filter((c) => c !== congress)
        : [...prev, congress],
    );
  };

  const handleRatingFilter = (rating) => {
    setRatingFilter((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  const handleTermFilter = (term) => {
    setTermFilter((prev) => (prev === term ? null : term));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleIsNewFilter = () => {
    setIsNewFilter((prev) => !prev);
  };

  const handleAlternateProfileFilter = () => {
    setAlternateProfileFilter((prev) => !prev);
  };

  const clearAllFilters = () => {
    setPartyFilter([]);
    setDistrictFilter([]);
    setRatingFilter([]);
    setCongressFilter([]);
    setTermFilter(null);
    setStatusFilter([]);
    setIsNewFilter(false);
    setAlternateProfileFilter(false);
    setSearchQuery("");
  };

  const handleEdit = (row) => {
    // Don't navigate if it's a bulk operation
    if (row && row.bulk) {
      return;
    }
    // Don't navigate if _id is missing or undefined
    if (!row || !row._id) {
      console.warn("⚠️ handleEdit: Missing _id, skipping navigation", row);
      return;
    }
    navigate(`/edit-representative/${row._id}`);
  };
  const handleBulkApply = async ({ ids = [], payload }) => {
    if (!ids || ids.length === 0 || !payload) {
      return;
    }
    if (userRole !== "admin") {
      showSnackbar("Bulk edit is for admins only", "error");
      return;
    }

    const { category, itemId, score } = payload;

    if (!category || !itemId || !score) {
      showSnackbar("Invalid bulk payload", "error");
      return;
    }

    setFetching(true);
    try {
      // Build updates array for the bulk update endpoint
      const updates = ids.map((houseId) => {
        const update = {
          houseId: houseId,
        };

        if (category === "vote") {
          update.votesScore = [
            {
              voteId: itemId,
              score: score,
            },
          ];
        } else if (category === "activity") {
          update.activitiesScore = [
            {
              activityId: itemId,
              score: score,
            },
          ];
        }

        return update;
      });

      const result = await dispatch(updateHouseScores(updates)).unwrap();

      // Check if no representative had the item
      if (
        result.message &&
        result.message.includes("was not found for any of the representatives")
      ) {
        showSnackbar(result.message, "error");
        setFetching(false);
        return;
      }

      const successCount = result.successful || 0;
      const failedCount = result.failed || 0;

      if (result.errors && result.errors.length > 0) {
        console.warn(`⚠️ Some updates failed:`, result.errors);
      }

      await dispatch(getAllHouseData());
      await dispatch(getAllHouses());

      // Show appropriate snackbar based on success count
      if (successCount === ids.length) {
        // All succeeded
        showSnackbar(
          `Bulk select applied for ${successCount}/${
            ids.length
          } representative${successCount !== 1 ? "s" : ""}!`,
          "success",
        );
      } else if (successCount === 0) {
        // All failed
        showSnackbar(
          `Bulk select failed for all ${ids.length} representatives.`,
          "error",
        );
      } else {
        // Partial success
        showSnackbar(
          `Bulk select applied for ${successCount} of ${
            ids.length
          } representatives.${
            failedCount > 0
              ? ` ${failedCount} failed (item not found for those representatives).`
              : ""
          }`,
          "warning",
        );
      }
    } catch (err) {
      console.error("❌ Bulk apply failed:", {
        error: err,
        errorMessage: err?.message,
        errorStack: err?.stack,
        fullError: err,
      });

      // Check for the specific "not found for any" error
      if (
        err?.message?.includes("was not found for any of the representatives")
      ) {
        showSnackbar(err.message, "error");
      } else {
        showSnackbar("Bulk apply failed.");
      }
    } finally {
      setFetching(false);
    }
  };

  const handleFetchClick = () => {
    setOpenFetchDialog(true);
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
      showSnackbar(
        `${selectedRepresentative?.name} deleted successfully.`,
        "success",
      );
    } catch (error) {
      showSnackbar("Error: Unable to delete representative.", "error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setOpenDeleteDialog(false);
    }
  };

  const handleToggleStatusHouse = async (house) => {
    const newStatus =
      house.publishStatus === "published" ? "draft" : "published";
    try {
      await dispatch(
        updateRepresentativeStatus({ id: house._id, publishStatus: newStatus }),
      ).unwrap();

      dispatch(getAllHouses());
    } catch (error) {
      showSnackbar("Failed to update status.", "error");
    }
  };

  const handleBulkPublish = async ({
    ids = [],
    publishStatus = "published",
  }) => {
    if (!ids.length) return;

    if (userRole !== "admin") {
      showSnackbar("Bulk publish is for admins only", "error");
      return;
    }

    setFetching(true);

    try {
      const result = await dispatch(bulkPublishHouses(ids)).unwrap();
      const successCount = result.successful || 0;
      const failedCount = result.failed || 0;
      const totalCount = result.totalRepresentatives || ids.length;

      // Refresh the houses list
      await dispatch(getAllHouses());

      // Build error message if there are failures
      let errorMessage = "";
      if (result.errors && result.errors.length > 0) {
        // Count unique error messages
        const errorCounts = {};
        result.errors.forEach((err) => {
          const msg = err.message || "Unknown error";
          errorCounts[msg] = (errorCounts[msg] || 0) + 1;
        });

        // Build unique error messages with counts
        const uniqueErrors = Object.entries(errorCounts).map(([msg, count]) =>
          count > 1 ? `${msg}` : msg,
        );

        if (uniqueErrors.length > 0) {
          errorMessage = uniqueErrors.join(", ");
        }
      }

      // Show appropriate snackbar based on success count
      if (successCount === totalCount) {
        // All succeeded
        showSnackbar(
          `Bulk publish applied for ${successCount}/${totalCount} representative${
            successCount !== 1 ? "s" : ""
          }!`,
          "success",
        );
      } else if (successCount === 0) {
        // All failed
        const failMsg = errorMessage
          ? `Bulk publish failed. ${errorMessage}`
          : `Bulk publish failed for all ${totalCount} representatives.`;
        showSnackbar(failMsg, "error");
      } else {
        // Partial success
        const partialMsg = errorMessage
          ? `Bulk publish applied for ${successCount}/${totalCount} representatives.${failedCount} Failed: ${errorMessage}`
          : `Bulk publish applied for ${successCount}/${totalCount} representative${
              successCount !== 1 ? "s" : ""
            }. ${failedCount} failed.`;
        showSnackbar(partialMsg, "warning");
      }
    } catch (err) {
      // Handle both thunk rejection and other errors
      let errorMsg = "Bulk publish failed.";

      if (err?.payload?.errors && err.payload.errors.length > 0) {
        const errorMessages = err.payload.errors
          .map((e) => e.message)
          .filter(Boolean);
        errorMsg =
          errorMessages.length > 0
            ? `Bulk publish failed. ${errorMessages.join(", ")}`
            : errorMsg;
      } else if (err?.message) {
        errorMsg = err.message;
      }

      showSnackbar(errorMsg, "error");
    } finally {
      setFetching(false);
    }
  };

  const activeFilterCount =
    partyFilter.length +
    districtFilter.length +
    ratingFilter.length +
    congressFilter.length +
    (termFilter ? 1 : 0) +
    statusFilter.length +
    (isNewFilter ? 1 : 0) +
    (alternateProfileFilter ? 1 : 0);
  const fetchRepresentativeFromQuorum = async (status = "active") => {
    setOpenFetchDialog(false);
    setFetching(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25));
    }, 1000);

    try {
      const requestBody = {
        type: "representative",
      };

      // Use different endpoints based on status
      const endpoint =
        status === "former"
          ? `${API_URL}/v1/fetch-quorum/save-former`
          : `${API_URL}/v1/fetch-quorum/store-data`;

      const response = await axios.post(endpoint, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const statusText = status === "active" ? "active" : "former";
        showSnackbar(
          `Success: ${
            statusText.charAt(0).toUpperCase() + statusText.slice(1)
          } representatives fetched successfully!`,
          "success",
        );
        await dispatch(getAllHouses());
        setFetching(false);
      } else {
        throw new Error("Failed to fetch representatives from Quorum");
      }
    } catch (error) {
      showSnackbar("Error: Unable to fetch representatives.", "error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <LoadingOverlay loading={loading || fetching} />
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
                    onClick={handleFetchClick}
                  >
                    Fetch Representatives from Quorum
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
                {/* Current/Former Toggle */}
                <Box
                  sx={{
                    display: "flex",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    height: "38px",
                    minWidth: "150px",
                  }}
                >
                  <Button
                    onClick={() => setCurrentOrFormerFilter("current")}
                    sx={{
                      flex: 1,
                      borderRadius: "8px 0 0 8px",
                      padding: "7px 10px",
                      fontSize: "0.875rem",
                      textTransform: "none",
                      // border: "none",
                      height: "100%",
                      backgroundColor:
                        currentOrFormerFilter === "current"
                          ? "#497bb2 !important; "
                          : "#fff",
                      color:
                        currentOrFormerFilter === "current" ? "#fff" : "#333",
                      "&:hover": {
                        backgroundColor:
                          currentOrFormerFilter === "current"
                            ? "#497bb2 !important; "
                            : "#f5f5f5",
                      },
                    }}
                  >
                    Current
                  </Button>
                  <Button
                    onClick={() => setCurrentOrFormerFilter("former")}
                    sx={{
                      flex: 1,
                      borderRadius: "0 8px 8px 0",
                      padding: "7px 10px",
                      fontSize: "0.875rem",
                      textTransform: "none",
                      // border: "none",
                      height: "100%",
                      backgroundColor:
                        currentOrFormerFilter === "former"
                          ? "#497bb2 !important; "
                          : "#fff",
                      color:
                        currentOrFormerFilter === "former" ? "#fff" : "#333",
                      "&:hover": {
                        backgroundColor:
                          currentOrFormerFilter === "former"
                            ? "#497bb2 !important; "
                            : "#f5f5f5",
                      },
                    }}
                  >
                    Former
                  </Button>
                </Box>
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
                                      e.target.value,
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
                                    handleSearchChange(
                                      "congress",
                                      e.target.value,
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
                                {filteredCongressOptions.length > 0 ? (
                                  filteredCongressOptions.map((congress) => (
                                    <Box
                                      key={congress}
                                      onClick={() =>
                                        handleCongressFilter(congress)
                                      }
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
                                          ? `${getOrdinalSuffix(
                                              congress,
                                            )} Congress (${
                                              congressYearMap[congress]
                                                .startYear
                                            }-${
                                              congressYearMap[congress].endYear
                                            })`
                                          : `${getOrdinalSuffix(
                                              congress,
                                            )} Congress`}
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
                                {["current"].map((term) => (
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

                        {/* Is New Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "isNew" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("isNew")}
                          >
                            <Typography variant="body1">Is New</Typography>
                            {expandedFilter === "isNew" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "isNew" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                <Box
                                  onClick={handleIsNewFilter}
                                  className="filter-option"
                                >
                                  {isNewFilter ? (
                                    <CheckIcon
                                      color="primary"
                                      fontSize="small"
                                    />
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    Yes
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Alternate Profile Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "alternateProfile"
                              ? "active"
                              : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() =>
                              toggleFilterSection("alternateProfile")
                            }
                          >
                            <Typography variant="body1">
                              Alternate Profile
                            </Typography>
                            {expandedFilter === "alternateProfile" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "alternateProfile" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                <Box
                                  onClick={handleAlternateProfileFilter}
                                  className="filter-option"
                                >
                                  {alternateProfileFilter ? (
                                    <CheckIcon
                                      color="primary"
                                      fontSize="small"
                                    />
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    Yes
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>

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
                              !statusFilter.length &&
                              !isNewFilter &&
                              !alternateProfileFilter
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
                    onClick={handleFetchClick}
                  >
                    Fetch Representatives from Quorum
                  </Button>
                )}
              </Stack>
            </Box>

            <MainGrid
              type="representative"
              data={filteredRepresentative || []}
              loading={fetching ? false : loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              handleToggleStatusHouse={handleToggleStatusHouse}
              isSelectable={userRole === "admin"}
              onBulkApply={handleBulkApply}
              onBulkPublish={handleBulkPublish}
            />
          </Stack>
        </Box>

        <SnackbarComponent
          open={snackbarOpen}
          onClose={hideSnackbar}
          message={snackbarMessage}
          severity={snackbarSeverity}
        />

        <DeleteConfirmationDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          itemName={selectedRepresentative?.name}
          itemType="representative"
        />

        <FetchFromQuorumDialog
          open={openFetchDialog}
          onClose={() => setOpenFetchDialog(false)}
          onActive={() => fetchRepresentativeFromQuorum("active")}
          onFormer={() => fetchRepresentativeFromQuorum("former")}
          type="Representative"
        />
      </Box>
    </AppTheme>
  );
}
