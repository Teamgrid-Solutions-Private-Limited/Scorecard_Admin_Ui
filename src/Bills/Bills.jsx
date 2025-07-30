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
} from "@mui/material";
import { useState } from "react";
import FixedHeader from "../../src/components/FixedHeader";
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};
import { jwtDecode } from "jwt-decode";

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
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'published', 'draft'
  const token = localStorage.getItem("token");
  // Decode token to get user role
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  console.log("User Role:", userRole);
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
    if (statusFilter === "all") return true;
    return vote.status === statusFilter;
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

  console.log("bills:", billsData);

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
            sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}
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
                All Bills
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ ml: "auto" }}
              >
                <TextField
                  select
                  variant="outlined"
                  // label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  SelectProps={{ native: true }}
                  size="small"
                  sx={{
                    minWidth: 180,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "primary.light",
                      },
                    },
                  }}
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>

                  <option value="reviewed">Reviewed</option>
                </TextField>
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  onClick={() => setIsBulkEditMode(!isBulkEditMode)}
                  sx={{
                    backgroundColor: isBulkEditMode ? "#CC9A3A" : "#4a90e2",
                    color: "white !important",
                    padding: "0.5rem 1rem",
                    marginLeft: "0.5rem",
                    "&:hover": {
                      backgroundColor: isBulkEditMode ? "#B38935" : "#357ABD",
                    },
                  }}
                >
                  {isBulkEditMode ? "Cancel Bulk Edit" : "Bulk Edit"}
                </Button>

                {userRole === "admin" && (
                  <Button
                    onClick={() => navigate("/search-bills")}
                    sx={{
                      backgroundColor: "#4a90e2 !important",
                      color: "white !important",
                      padding: "0.5rem 1rem",
                      marginLeft: "0.5rem",
                      "&:hover": {
                        backgroundColor: "#357ABD !important",
                      },
                    }}
                  >
                    Add Bills
                  </Button>
                )}

              
              </Stack>
            </Box>

            {isBulkEditMode && (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  backgroundColor: "action.hover",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
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
                    sx={{
                      backgroundColor: "#68e24aff",
                      "&:hover": { backgroundColor: "#357ABD" },
                    }}
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
              isSelectable={isBulkEditMode} // Pass this prop to enable selection
              onSelectionChange={setSelectedBills}
              selectedItems={selectedBills}
            />
          </Stack>
        </Box>
      </Box>
      {/* {fetching && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor: "rgba(255, 255, 255, 0.5)", // Light transparent overlay
            zIndex: 10, // Keep above blurred background
          }}
        >
          <CircularProgress variant="determinate" value={progress} />
        </Box>
      )} */}
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
          sx={{
            width: "100%",
            bgcolor:
              snackbarMessage === "This bill has been successfully deleted."
                ? "#FF474D"
                : undefined,
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
