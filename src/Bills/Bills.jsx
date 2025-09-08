import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllVotes,
  deleteVote,
  updateVoteStatus,
  bulkUpdateSbaPosition,
} from "../redux/reducer/voteSlice";
import AppTheme from "../../src/shared-theme/AppTheme";
import { Box, Stack, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import SideMenu from "../../src/components/SideMenu";
import MainGrid from "../../src/components/MainGrid";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../../src/Themes/customizations";
import {
  CircularProgress,
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
} from "@mui/material";
import { useState } from "react";
import FixedHeader from "../../src/components/FixedHeader";
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
import { jwtDecode } from "jwt-decode";
import MobileHeader from "../components/MobileHeader";

export default function Bills(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { votes, loading } = useSelector((state) => state.vote);
  const [progress, setProgress] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const token = localStorage.getItem("token");
  // Decode token to get user role
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);
  const statusOptions = ["published", "draft", "under review"];
  const [selectedBills, setSelectedBills] = useState([]); // Store selected bill IDs
  const [isBulkEditMode, setIsBulkEditMode] = useState(false); // Toggle bulk edit mode
  const [bulkSbaPosition, setBulkSbaPosition] = useState(""); // Store bulk SBA position value

  const handleBulkUpdate = async () => {
    if (!selectedBills.length || !bulkSbaPosition) return;

    setFetching(true);
    try {
      await dispatch(
        bulkUpdateSbaPosition({
          ids: selectedBills,
          sbaPosition: bulkSbaPosition, // Already capitalized from dropdown
        })
      );

      await dispatch(getAllVotes());
      setSnackbarMessage(
        `Updated SBA position for ${selectedBills.length} bill(s)`
      );
      setSnackbarSeverity("success");

      // Reset selection
      setSelectedBills([]);
      setBulkSbaPosition("");
      setIsBulkEditMode(false);
    } catch (error) {
      setSnackbarMessage("Failed to update bills");
      setSnackbarSeverity("error");
    } finally {
      setFetching(false);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    dispatch(getAllVotes());
  }, [dispatch]);

  const formatDate = (isoDate) => {
    return new Date(isoDate).toISOString().split("T")[0];
  };

  const filteredVotes = votes.filter((vote) => {
    // Status filter
    return (
      statusFilter.length === 0 ||
      (vote.status && statusFilter.includes(vote.status))
    );
  });

  const billsData = filteredVotes.map((vote, index) => ({
    _id: vote._id || index,
    date: formatDate(vote.date),
    bill: vote.billName || vote.title,
    billsType: vote.type
      ? vote.type.toLowerCase().includes("senate")
        ? "Senate"
        : vote.type.toLowerCase().includes("house")
        ? "House"
        : "Other"
      : "Other",
    status: vote.status || "draft", // <== ADD THI
  }));

  // Filter handlers
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setStatusFilter([]);
  };

  const activeFilterCount = statusFilter.length;

  const handleEdit = (row) => {
    navigate(`edit-bill/${row._id}`);
  };
  const handleDeleteClick = (row) => {
    setSelectedVote(row); // Store senator data
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
      await dispatch(deleteVote(selectedVote._id));
      await dispatch(getAllVotes());
      setSnackbarMessage(`This bill has been successfully deleted.`);
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Failed to delete this bill.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setProgress(100);
      setTimeout(() => setProgress(0), 500); // Re
    }
  };

  const handleToggleStatus = (vote) => {
    const newStatus = vote.status === "published" ? "draft" : "published";
    dispatch(updateVoteStatus({ id: vote._id, status: newStatus }))
      .then(() => dispatch(getAllVotes()))
      .catch(() => {
        setSnackbarMessage("Failed to update status.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };
  // const handleDelete = async (row) => {
  //   if (window.confirm("Are you sure you want to delete this bill?")) {
  //     await dispatch(deleteVote(row._id));
  //     await dispatch(getAllVotes());
  //   }
  // };

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
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                sx={{ ml: "auto", width: { xs: "100%", sm: "auto" } }}
              >
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
                        <Box className="filter-scroll">
                          {statusOptions.map((status) => (
                            <Box
                              key={status}
                              onClick={() => handleStatusFilter(status)}
                              className="filter-option"
                            >
                              {statusFilter.includes(status) ? (
                                <CheckIcon color="primary" fontSize="small" />
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
                            disabled={!statusFilter.length}
                          >
                            Clear Filters
                          </Button>
                        </Box>
                      </Paper>
                    </ClickAwayListener>
                  )}
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  onClick={() => setIsBulkEditMode(!isBulkEditMode)}
                  className={`bulkEditBtn ${isBulkEditMode ? "active" : ""}`}
                >
                  {isBulkEditMode ? "Cancel Bulk Edit" : "Bulk Edit"}
                </Button>

                {userRole === "admin" && (
                  <Button
                    onClick={() => navigate("/search-bills")}
                    className="addBillsBtn"
                  >
                    Add Bills
                  </Button>
                )}
              </Stack>
            </Box>

            {isBulkEditMode && (
              <Box className="bulkEditContainer">
                <Typography variant="subtitle1">
                  {selectedBills.length} bill(s) selected
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    select
                    label="Set SBA Position"
                    value={bulkSbaPosition}
                    onChange={(e) => setBulkSbaPosition(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </TextField>

                  <Button
                    // variant="contained"
                    disabled={!selectedBills.length || !bulkSbaPosition}
                    onClick={handleBulkUpdate}
                    className="applyBtn"
                  >
                    Apply
                  </Button>
                </Stack>
              </Box>
            )}

            <MainGrid
              type="bills"
              data={billsData}
              loading={fetching ? false : loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              isSelectable={isBulkEditMode}
              onSelectionChange={setSelectedBills}
              selectedItems={selectedBills}
            />
          </Stack>
        </Box>
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
              snackbarMessage === "This bill has been successfully deleted."
                ? "#fde8e4"
                : undefined,
            "& .MuiAlert-icon": {
              color:
                snackbarMessage === "This bill has been successfully deleted."
                  ? "#cc563d"
                  : undefined,
            },
            "& .MuiAlert-message": {
              color:
                snackbarMessage === `This bill has been successfully deleted.`
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
          sx: { borderRadius: 3, padding: 2, minWidth: 350 },
        }}
      >
        <DialogTitle className="dialogBox">
          Confirm Deletion
        </DialogTitle>

        <DialogContent>
          <DialogContentText className="dialogTitle">
            Are you sure you want to delete?
            {/* {selectedVote?.bill && (
              <> <strong>{selectedVote.bill}</strong>?</>
            )}
            {!selectedVote?.bill && '?'} */}
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
