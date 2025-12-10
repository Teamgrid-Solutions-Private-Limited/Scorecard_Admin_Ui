import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllActivity,
  deleteActivity,
  updateActivityStatus,
  bulkUpdateTrackActivities,
} from "../redux/reducer/activitySlice";
import { getErrorMessage } from "../utils/errorHandler";
import AppTheme from "../../src/shared-theme/AppTheme";
import { Box, Stack, Typography, Button ,InputAdornment,} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";
import FixedHeader from "../../src/components/FixedHeader";
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


export default function Activity(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activities, loading } = useSelector((state) => state.activity);
  const [progress, setProgress] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Use centralized snackbar hook
  const {
    open: snackbarOpen,
    message: snackbarMessage,
    severity: snackbarSeverity,
    showSnackbar,
    hideSnackbar,
  } = useSnackbar();
  const [selectedVote, setSelectedVote] = useState(null);
  const token = getToken();
  const userRole = getUserRole();

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState([]);
  const statusOptions = ["published", "draft", "under review"];
  const [selectedTrackActivity, setSelectedTrackActivity] = useState([]); 
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkTrackActivity, setBulkTrackActivity] = useState("");

  
  useEffect(() => {
    dispatch(getAllActivity());
  }, [dispatch]);

  const formatDate = (isoDate) => {
    return new Date(isoDate).toISOString().split("T")[0];
  };

 const filteredActivities = activities.filter((activity) => {
 
    const statusMatch =
      statusFilter.length === 0 ||
      (activity.status && statusFilter.includes(activity.status));

    const searchMatch =
      !searchQuery ||
      (activity.title &&
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return statusMatch && searchMatch;
  });
  const activitiesData = filteredActivities.map((activity, index) => ({
    _id: activity._id || index,
    date: formatDate(activity.date),
    activity: activity.title,
    activityType: activity.type
      ? activity.type.toLowerCase().includes("senate")
        ? "Senate"
        : activity.type.toLowerCase().includes("house")
        ? "House"
        : "Other"
      : "Other",
    status: activity.status,
  }));


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
    navigate(`/edit-activity/${row._id}`);
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
      await dispatch(deleteActivity(selectedVote._id)).unwrap();
      await dispatch(getAllActivity());
      showSnackbar(`This activity has been successfully deleted.`, "success");
    } catch (error) {
      showSnackbar("Failed to delete this activity.", "error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleToggleStatusAct = (activity) => {
    const newStatus = activity.status === "published" ? "draft" : "published";

    dispatch(updateActivityStatus({ id: activity._id, status: newStatus }))
      .then(() => {
        dispatch(getAllActivity());
      })
      .catch((error) => {
        console.error("Status update failed:", error);
        showSnackbar("Failed to update status.", "error");
      });
  };
 
  const handleBulkUpdate = async () => {
    if (!selectedTrackActivity.length || !bulkTrackActivity) {
      showSnackbar("Please select activities and a status", "warning");
      return;
    }

    setFetching(true);
    try {
     
      const result = await dispatch(
        bulkUpdateTrackActivities({
          ids: selectedTrackActivity,
          trackActivities: bulkTrackActivity,
        })
      ).unwrap(); 

      showSnackbar(
        `Successfully updated ${
          result.updatedActivities?.length || selectedTrackActivity.length
        } activities`,
        "success"
      );

     
      setSelectedTrackActivity([]);
      setBulkTrackActivity("");
      setIsBulkEditMode(false);

     
      dispatch(getAllActivity());
    } catch (error) {
      console.error("Bulk update failed:", error);
      const errorMessage = getErrorMessage(error, "Failed to update activities");
      showSnackbar(errorMessage, "error");
    } finally {
      setFetching(false);
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <LoadingOverlay loading={loading || fetching} />
     <Box className="container">
        <SideMenu/>
        <Box
          className={`contentBox ${fetching ? "fetching" : "notFetching"}`}
        >
          <FixedHeader />
          <MobileHeader/>
          <Stack spacing={2} className="stackBox" >

            <Box className="actionsBox" >
             <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{xs:"flex-start", sm:"center"}}
                sx={{ ml: "auto", width: { xs: "100%", sm: "auto" } }}
              >
                <TextField
                size="small"
                variant="outlined"
                placeholder="Search Activities"
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
                <Button
                  onClick={() => setIsBulkEditMode(!isBulkEditMode)}
                  className={`bulkEditBtn ${isBulkEditMode ? "active" : ""}`}
                >
                  {isBulkEditMode ? "Cancel Bulk Edit" : "Bulk Edit"}
                </Button>
                {userRole === "admin" && (
                  <Button
                    onClick={() => navigate("/search-activities")}
                    className="addBillsBtn"
                >
                  Add Activity
                </Button>
                )}
              </Stack>

            </Box>
            {isBulkEditMode && (
              <Box className="bulkEditContainer">
                <Typography variant="subtitle1">
                  {selectedTrackActivity.length} activity(ies) selected
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    select
                    label="Set Track Activity"
                    value={bulkTrackActivity}
                    onChange={(e) => setBulkTrackActivity(e.target.value)}
                    size="small"
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </TextField>

                  <Button
                    disabled={
                      !selectedTrackActivity.length || !bulkTrackActivity
                    }
                    onClick={handleBulkUpdate}
                     className="applyBtn"
                  >
                    Apply
                  </Button>
                </Stack>
              </Box>
            )}

            <MainGrid
              type="activities"
              data={activitiesData}
              loading={fetching ? false : loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              handleToggleStatusAct={handleToggleStatusAct}
              isSelectable={isBulkEditMode}
              onSelectionChange={setSelectedTrackActivity}
              selectedItems={selectedTrackActivity}
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
            width: "100%",
            border: "none",
            boxShadow: "none",
            bgcolor:
              snackbarMessage === `This activity has been successfully deleted.`
                ? "#fde8e4"
                : undefined,

            "& .MuiAlert-icon": {
              color:
                snackbarMessage ===
                `This activity has been successfully deleted.`
                  ? "#cc563d"
                  : undefined,
            },

            "& .MuiAlert-message": {
              color:
                snackbarMessage ===
                `This activity has been successfully deleted.`
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
          sx: { borderRadius: 3, padding: 2,width: '90%', maxWidth: 420 },
        }}
      >
        <DialogTitle className="dialogBox">
          Confirm Deletion
        </DialogTitle>

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
              sx={{
                borderRadius: 2,
                paddingX: 3,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              sx={{
                borderRadius: 2,
                paddingX: 3,
              }}
            >
              Delete
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
}
