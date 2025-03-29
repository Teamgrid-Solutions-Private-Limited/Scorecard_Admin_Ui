import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllHouses, deleteHouse, } from "../redux/slice/houseSlice"; // Import the action
import { Box, Stack, Typography, Button, CircularProgress, TextField, Snackbar, Alert ,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import AppTheme from "/shared-theme/AppTheme";
import SideMenu from "./components/SideMenu";
import MainGrid from "./components/MainGrid";
import { API_URL } from "../redux/api/API";
import axios from "axios";
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations, } from "./theme/customizations";

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

export default function Representative(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState(""); // Search state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    // Fetch representatives from Redux store
    const { houses, loading } = useSelector((state) => state.house); // Ensure correct state mapping
    const [fetching, setFetching] = useState(false)
    const [progress, setProgress] = useState(0);
    const [progressStep, setProgressStep] = useState(0); // Controls which quarter is visible
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedRepresentative, setSelectedRepresentative] = useState(null);


    // Fetch representatives when the component mounts
    useEffect(() => {
        dispatch(getAllHouses());
    }, [dispatch]);

    // Transform data to include state extracted from district
    const transformedHouses = houses.map((house) => ({
        ...house,
        district: house.district?.split(", ").pop() || "Unknown", // Extract state from district
    }));

    console.log("Transformed Houses Data:", transformedHouses);

    // **Filter representatives based on search query**

    const filteredRepresentative = transformedHouses.filter((transformedHouses) =>
        transformedHouses.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fetch representatives when the component mounts
    useEffect(() => {
        dispatch(getAllHouses());
    }, [dispatch]);

    const handleEdit = (row) => {
        navigate(`/edit-representative/${row._id}`)
    }

    const fetchRepresentativeFromQuorum = async () => {
        setFetching(true); // Set fetching state to true
        setProgress(0); // Reset progress
        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 100 ? 0 : prev + 25)); // Increase progress in steps
        }, 1000); // Change progress every second
        try {
            const response = await axios.post(`${API_URL}/fetch-quorum/store-data`, {
                type: "representative",
            });

            if (response.status === 200) {
                setSnackbarMessage("Success: Representatives fetched successfully!");
                setSnackbarSeverity("success"); // Green success alert
                await dispatch(getAllHouses()); // Refresh the list of representatives
            } else {
                throw new Error("Failed to fetch representatives from Quorum.");
            }
        } catch (error) {
            console.error("Error fetching representatives from Quorum:", error);
            setSnackbarMessage("Error: Unable to fetch representatives.");
            setSnackbarSeverity("error"); // Red error alert
        } finally {
            clearInterval(interval); // Stop progress updates
            setFetching(false);
            setSnackbarOpen(true); // Show the snackbar
            setProgress(100); // Ensure it completes
            setTimeout(() => setProgress(0), 500); // Reset after a short delay

        }
    };

    // Snackbar Component

    // console.log("Transformed Houses Data:", transformedHouses);
    //handle Delete
    const handleDeleteClick = (row) => {
        setSelectedRepresentative(row);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        setOpenDeleteDialog(false)
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
        } finally {
            clearInterval(interval);
            setFetching(false);
            setSnackbarOpen(true);
            setOpenDeleteDialog(false);
        }
    };

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <Box sx={{ display: "flex" }}>
                <SideMenu />
                <Box sx={{
                    flexGrow: 1, overflow: "auto",
                    filter: fetching ? "blur(1px)" : "none", // Apply blur when fetching
                    pointerEvents: fetching ? "none" : "auto", // Disable interactions
                }}>
                    <Stack spacing={2} sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
                        <Typography variant="h4" align="center" sx={{ paddingTop: "50px", color: "text.secondary" }}>
                            SBA Scorecard Management System
                        </Typography>

                        {/* Fetch Representative Button */}
                        <Stack direction="row" spacing={2} width="100%" sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                            <Button variant="outlined" onClick={fetchRepresentativeFromQuorum}>
                                Fetch Representative from Quorum
                            </Button>
                        </Stack>

                        {/* Search Input - Positioned ABOVE the table */}
                        <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <TextField
                                placeholder="Search by Name"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ width: "170px" }} // Adjust width if needed
                            />
                        </Box>

                        {/* Representative Table */}
                        <MainGrid
                            type="representative"
                            data={filteredRepresentative || []}
                            loading={fetching?false:loading}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    </Stack>

                </Box>

                {/* Overlay Loading Indicator (Prevents Blur) */}
                {fetching && (
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
                )}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={5000} // Auto close after 4 seconds
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }} // Position at top-right
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity={snackbarSeverity}
                        sx={{ width: "100%" }}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

                {/* //dialog box */}
                  <Dialog
                                    open={openDeleteDialog}
                                    onClose={() => setOpenDeleteDialog(false)}
                                    PaperProps={{
                                        sx: { borderRadius: 3, padding: 2, minWidth: 350 }
                                    }}
                                >
                                    <DialogTitle
                                        sx={{
                                            fontSize: "1.4rem",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            color: "error.main"
                                        }}
                                    >
                                        Confirm Deletion
                                    </DialogTitle>
                
                                    <DialogContent>
                                        <DialogContentText
                                            sx={{
                                                textAlign: "center",
                                                fontSize: "1rem",
                                                color: "text.secondary"
                                            }}
                                        >
                                            Are you sure you want to delete <strong>{selectedRepresentative?.name}</strong>?
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
