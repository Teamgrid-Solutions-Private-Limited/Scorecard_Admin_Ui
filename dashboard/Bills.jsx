import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllVotes, deleteVote } from "../redux/slice/voteSlice";
import AppTheme from "/shared-theme/AppTheme";
import { Box, Stack, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import SideMenu from "./components/SideMenu";
import MainGrid from "./components/MainGrid";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";
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
} from "@mui/material";
import { useState } from "react";
import FixedHeader from "./components/FixedHeader";
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

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
  useEffect(() => {
    dispatch(getAllVotes());
  }, [dispatch]);

  const formatDate = (isoDate) => {
    return new Date(isoDate).toISOString().split("T")[0];
  };

  const billsData = votes.map((vote, index) => ({
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
  }));

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
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(1px)",
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
            filter: fetching ? "blur(1px)" : "none",
            pointerEvents: fetching ? "none" : "auto",
          }}
        >
          <FixedHeader/>
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
                            gap: 2
                          }}
                        >
                          <Typography component="h2" variant="h6">
                              All Bills
                            </Typography>
                          
                          <Stack direction="row" spacing={2} alignItems="center">
                           
                            <Button
                // variant="contained"
                onClick={() => navigate("/search-bills")}
                sx={{
                  backgroundColor: "#3b82f6 !important", // Force blue color
                  color: "white !important", // Force white text
                  padding: "0.5rem 1rem", // px-4 py-2
                  // borderRadius: "0.25rem", // rounded
                  marginLeft: "0.5rem", // ml-2
                  '&:hover': {
                    backgroundColor: "#3b82f6 !important" // Same color on hover
                  }
                }}
              >
                Add Bills
              </Button>
                          </Stack>
                        </Box>
            <MainGrid
              type="bills"
              data={billsData}
              loading={fetching ? false : loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
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
          sx={{ width: "100%" }}
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
