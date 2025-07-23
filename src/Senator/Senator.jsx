import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteSenator, getAllSenators , updateSenatorStatus} from "../redux/reducer/senetorSlice"; // Import actions
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
} from "@mui/material";
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
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};
export default function Senator(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Fetch senators from Redux store
  const { senators, loading } = useSelector((state) => state.senator);
  const [progress, setProgress] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSenator, setSelectedSenator] = useState(null);

  useEffect(() => {
    dispatch(getAllSenators());
  }, [dispatch]);

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
      await dispatch(deleteSenator(selectedSenator._id));
      await dispatch(getAllSenators());
      setSnackbarMessage(`${selectedSenator.name} deleted successfully.`);
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Failed to delete senator.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setProgress(100);
      setTimeout(() => setProgress(0), 500); // Re
    }
  };

  const fetchSenatorsFromQuorum = async () => {
    setFetching(true);
    setProgress(0); // Reset progress
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25)); // Increase progress in steps
    }, 1000); // Change progress every second
    try {
      const response = await axios.post(`${API_URL}/fetch-quorum/store-data`, {
        type: "senator",
      });
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

  const filteredSenators = senators.filter((senator) => {
    const name = senator.name.toLowerCase();
    return searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every((word) => name.includes(word));
  });

   const handleToggleStatusSenator = (senator) => {
    const newStatus = senator.publishStatus === "published" ? "draft" : "published";
    console.log("Toggling status:", senator.publishStatus, "→", newStatus);

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
            filter: fetching ? "blur(1px)" : "none", // Apply blur when fetching
            pointerEvents: fetching ? "none" : "auto", // Disable interactions
          }}
        >
          <FixedHeader />
          <Stack
            spacing={2}
            sx={{ alignItems: "center", mx: 2, pb: 5, mt: { xs: 8, md: 0 } }}
          >
            {/* Search Input - Positioned ABOVE the table */}
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
                All Senators
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  placeholder="Search Senators"
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
                  onClick={fetchSenatorsFromQuorum}
                >
                  Fetch Senators from Quorum
                </Button>
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
            sx={{ width: "100%",bgcolor:'#FF474D' }}
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
      {/* Snackbar for success/error messages */}
    </AppTheme>
  );
}
