import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllVotes,
  deleteVote,
  updateVoteStatus,
  bulkUpdateSbaPosition,
} from "../redux/reducer/voteSlice";
import AppTheme from "../shared-theme/AppTheme";
import SearchIcon from "@mui/icons-material/Search";
import SideMenu from "../components/SideMenu";
import MainGrid from "../components/MainGrid";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../Themes/customizations";
import {
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Badge,
  IconButton,
  Paper,
  ClickAwayListener,
  Box,
  Stack,
  Typography,
  Button,
  InputAdornment,
} from "@mui/material";
import FixedHeader from "../components/FixedHeader";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};
import MobileHeader from "../components/MobileHeader";
import LoadingOverlay from "../components/LoadingOverlay";
import { getToken, getUserRole } from "../utils/auth";
import { useSnackbar } from "../hooks";

export default function Votes(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { votes, loading } = useSelector((state) => state.vote);
  const [progress, setProgress] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const token = getToken();
  const userRole = getUserRole();
  const {
    open: snackbarOpen,
    message: snackbarMessage,
    severity: snackbarSeverity,
    showSnackbar,
    hideSnackbar,
  } = useSnackbar();

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);
  const [congressFilter, setCongressFilter] = useState([]);
  const statusOptions = ["published", "draft"];
  const [selectedVotes, setSelectedVotes] = useState([]);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkSbaPosition, setBulkSbaPosition] = useState("");
  const [expandedFilter, setExpandedFilter] = useState(null);

  const handleBulkUpdate = async () => {
    if (!selectedVotes.length || !bulkSbaPosition) return;

    setFetching(true);
    try {
      const result = await dispatch(
        bulkUpdateSbaPosition({
          ids: selectedVotes,
          sbaPosition: bulkSbaPosition,
        })
      );

      if (result.payload) {
        await dispatch(getAllVotes());
        showSnackbar(
          `Updated SBA position for ${selectedVotes.length} vote(s)`,
          "success"
        );

        setSelectedVotes([]);
        setBulkSbaPosition("");
        setIsBulkEditMode(false);
      } else if (result.payload === undefined) {
        showSnackbar("Failed to update votes", "error");
      }
    } catch (error) {
      showSnackbar("Failed to update votes", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    dispatch(getAllVotes());
  }, [dispatch]);

  const formatDate = (isoDate) => {
    return new Date(isoDate).toISOString().split("T")[0];
  };

  const filteredVotes = votes.filter((vote) => {
    const statusMatch =
      statusFilter.length === 0 ||
      (vote.status && statusFilter.includes(vote.status)) ||
      (statusFilter.includes("draft") && vote.status === "under review");

    const congressMatch =
      congressFilter.length === 0 ||
      (vote.congress && congressFilter.includes(String(vote.congress)));

    const searchMatch =
      !searchQuery ||
      (vote.voteName &&
        vote.voteName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vote.title &&
        vote.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return statusMatch && congressMatch && searchMatch;
  });

  const congressOptions = [
    ...new Set(
      votes.filter((vote) => vote.congress).map((vote) => String(vote.congress))
    ),
  ].sort((a, b) => parseInt(b) - parseInt(a));

  const votesData = filteredVotes.map((vote, index) => ({
    _id: vote._id || index,
    date: formatDate(vote.date),
    vote: vote.voteName || vote.title,
    congress: vote.congress || "N/A",
    VotesType: vote.type
      ? vote.type.toLowerCase().includes("senate")
        ? "Senate"
        : vote.type.toLowerCase().includes("house")
          ? "House"
          : "Other"
      : "Other",
    status: vote.status || "draft",
    sbaPosition: vote.sbaPosition || "N/A",
  }));

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
    setExpandedFilter(null);
  };

  const toggleFilterSection = (section) => {
    setExpandedFilter(expandedFilter === section ? null : section);
  };

  const toggleStatusFilter = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleCongressFilter = (congress) => {
    setCongressFilter((prev) =>
      prev.includes(congress)
        ? prev.filter((c) => c !== congress)
        : [...prev, congress]
    );
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
    setCongressFilter([]);
  };

  const activeFilterCount = statusFilter.length + congressFilter.length;

  const handleEdit = (row) => {
    navigate(`/edit-vote/${row._id}`);
  };
  const handleDeleteClick = (row) => {
    setSelectedVote(row);
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
      await dispatch(deleteVote(selectedVote._id));
      await dispatch(getAllVotes());
      showSnackbar(`This vote has been successfully deleted.`, "success");
    } catch (error) {
      showSnackbar("Failed to delete this vote.", "error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleToggleStatus = (vote) => {
    const newStatus = vote.status === "published" ? "draft" : "published";
    dispatch(updateVoteStatus({ id: vote._id, status: newStatus }))
      .then(() => dispatch(getAllVotes()))
      .catch(() => {
        showSnackbar("Failed to update status.", "error");
      });
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
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ ml: "auto", width: { xs: "100%", sm: "auto" } }}
              >
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Search Bills"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    badgeContent={activeFilterCount}
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
                      <Paper className="billFilter-paper">
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

                        {/* Status Filter */}
                        <Box
                          className={`filter-section ${expandedFilter === "status" ? "active" : ""
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
                                    onClick={() => toggleStatusFilter(status)}
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

                        {/* Congress Filter */}
                        {congressOptions.length > 0 && (
                          <Box
                            className={`filter-section ${expandedFilter === "congress" ? "active" : ""
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
                                <Box className="filter-scroll">
                                  {congressOptions.map((congress) => (
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
                                        {congress}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Clear All Button */}
                        <Box>
                          <Button
                            fullWidth
                            sx={{
                              borderRadius: 0,
                              bgcolor: "#fff",
                              borderTop: "1px solid",
                              borderColor: "divider",
                              justifyContent: "flex-start",
                              pl: 5,
                            }}
                            onClick={clearAllFilters}
                            disabled={
                              !statusFilter.length && !congressFilter.length
                            }
                          >
                            Clear Filters
                          </Button>
                        </Box>
                      </Paper>
                    </ClickAwayListener>
                  )}
                </Box>
                <Button
                  onClick={() => setIsBulkEditMode(!isBulkEditMode)}
                  className={`bulkEditBtn ${isBulkEditMode ? "active" : ""}`}
                >
                  {isBulkEditMode ? "Cancel Bulk Edit" : "Bulk Edit"}
                </Button>

                {userRole === "admin" && (
                  <Button
                    onClick={() => navigate("/search-votes")}
                    className="addBillsBtn"
                  >
                    Add Votes
                  </Button>
                )}
              </Stack>
            </Box>

            {isBulkEditMode && (
              <Box className="bulkEditContainer">
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: "11px", md: "14px" } }}
                >
                  {selectedVotes.length} Vote(s) selected
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    select
                    label="Set SBA Position"
                    value={bulkSbaPosition}
                    onChange={(e) => setBulkSbaPosition(e.target.value)}
                    size="small"
                    sx={{ minWidth: { xs: 130, md: 160 } }}
                    InputLabelProps={{
                      sx: {
                        fontSize: { xs: "0.7rem", md: "0.9rem" },
                      },
                    }}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>

                  <Button
                    // variant="contained"
                    disabled={!selectedVotes.length || !bulkSbaPosition}
                    onClick={handleBulkUpdate}
                    className="applyBtn"
                  >
                    Apply
                  </Button>
                </Stack>
              </Box>
            )}

            <MainGrid
              type="votes"
              data={votesData}
              loading={fetching ? false : loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              isSelectable={isBulkEditMode}
              onSelectionChange={setSelectedVotes}
              selectedItems={selectedVotes}
            />
          </Stack>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbarSeverity}
          sx={{
            border: "none",
            boxShadow: "none",
            width: "100%",
            bgcolor:
              snackbarMessage === "This vote has been successfully deleted."
                ? "#fde8e4"
                : undefined,
            "& .MuiAlert-icon": {
              color:
                snackbarMessage === "This vote has been successfully deleted."
                  ? "#cc563d"
                  : undefined,
            },
            "& .MuiAlert-message": {
              color:
                snackbarMessage === `This vote has been successfully deleted.`
                  ? "#cc563d"
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
          sx: { borderRadius: 3, padding: 2, width: "90%", maxWidth: 420 },
        }}
      >
        <DialogTitle className="dialogBox">Confirm Deletion</DialogTitle>

        <DialogContent>
          <DialogContentText className="dialogTitle">
            Are you sure you want to delete?
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
    </AppTheme>
  );
}
