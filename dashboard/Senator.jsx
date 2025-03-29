import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteSenator, getAllSenators } from "../redux/slice/senetorSlice"; // Import actions
import { Box, Stack, Typography, Button, CircularProgress, Snackbar, Alert, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppTheme from "/shared-theme/AppTheme";
import SideMenu from "./components/SideMenu";
import MainGrid from "./components/MainGrid";
import axios from "axios";
import { API_URL } from "../redux/api/API";
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from "./theme/customizations";

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

    useEffect(() => {
        dispatch(getAllSenators());
    }, [dispatch]);

    const handleEdit = (row) => {
        navigate(`/edit-senator/${row._id}`);
    };

    const handleDelete = async (row) => {
        if (window.confirm("Are you sure you want to delete this senator?")) {
            await dispatch(deleteSenator(row._id));
            await dispatch(getAllSenators());
            setSnackbarMessage("Senator deleted successfully.");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
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
            } else {
                throw new Error("Failed to fetch senators from Quorum");
            }
        } catch (error) {
            console.error("Error fetching senators:", error);
            setSnackbarMessage("Error: Unable to fetch senators.");
            setSnackbarSeverity("error");
        } finally {
            setFetching(false);
            setSnackbarOpen(true);
            setProgress(100); // Ensure it completes
            // setTimeout(() => setProgress(0), 500); // Re
        }
    };

    const filteredSenators = senators.filter((senator) =>
        senator.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <Box sx={{ display: "flex" }}>
                <SideMenu />
                <Box sx={{ flexGrow: 1, overflow: "auto",
                      filter: fetching ? "blur(2px)" : "none", // Apply blur when fetching
                      pointerEvents: fetching ? "none" : "auto", // Disable interactions
                 }}>
                    <Stack spacing={2} sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
                        <Typography variant="h4" align="center" sx={{ paddingTop: "50px", color: "text.secondary" }}>
                            SBA Scorecard Management System
                        </Typography>

                        <Stack direction="row" spacing={2} width="100%" sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                            <Button variant="outlined" onClick={fetchSenatorsFromQuorum}>Fetch Senators from Quorum</Button>
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

                        <MainGrid type="senator" data={filteredSenators} loading={loading} onDelete={handleDelete} onEdit={handleEdit} />
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
                        <CircularProgress  variant="determinate" value={progress} />
                    </Box>
                )}
            </Box>

            {/* Snackbar for success/error messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </AppTheme>
    );
}
