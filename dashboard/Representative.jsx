import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllHouses, deleteHouse } from "../redux/slice/houseSlice";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import AppTheme from "/shared-theme/AppTheme";
import SideMenu from "./components/SideMenu";
import MainGrid from "./components/MainGrid";
import { API_URL } from "../redux/api/API";
import axios from "axios";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "./theme/customizations";
import FixedHeader from "./components/FixedHeader";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

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

  useEffect(() => {
    dispatch(getAllHouses());
  }, [dispatch]);

  const transformedHouses = houses.map((house) => ({
    ...house,
    district: house.district?.split(", ").pop() || "Unknown",
  }));

  const filteredRepresentative = transformedHouses.filter((transformedHouses) =>
    transformedHouses.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      const response = await axios.post(`${API_URL}/fetch-quorum/store-data`, {
        type: "representative",
      });

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
      setSnackbarMessage("Representative deleted successfully.");
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
            backgroundColor: "rgba(255, 255, 255, 0.05)", // More transparent background
            backdropFilter: "blur(1px)", // Slight blur effect
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
                All Representatives
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  placeholder="Search"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: "160px",
                    "& .MuiInputBase-root": {
                          "&.Mui-focused": {
                            borderColor: "#CC9A3A !important",
                            boxShadow: "none !important",
                            outline: "none !important",
                          },
                        },
                   }}
                />
                <Button variant="outlined"  sx={{
                  backgroundColor: "#3b82f6 !important", // Force blue color
                  color: "white !important", // Force white text
                  padding: "0.5rem 1rem", // px-4 py-2
                  // borderRadius: "0.25rem", // rounded
                  marginLeft: "0.5rem", // ml-2
                  '&:hover': {
                    backgroundColor: "#3b82f6 !important" // Same color on hover
                  }
                }} onClick={fetchRepresentativeFromQuorum}>
                  Fetch Representative from Quorum
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
