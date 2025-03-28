import * as React from "react";
import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllHouses, deleteHouse, } from "../redux/slice/houseSlice"; // Import the action
import { Box, Stack, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import AppTheme from "/shared-theme/AppTheme";
import SideMenu from "./components/SideMenu";
import MainGrid from "./components/MainGrid";
import { API_URL } from "../redux/api/API"; 
import axios from "axios";
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from "./theme/customizations";

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

export default function Representative(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Fetch representatives from Redux store
    const { houses, loading } = useSelector((state) => state.house); // Ensure correct state mapping
const[fetching,setFetching]=useState(false)
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

    // Fetch representatives when the component mounts
    useEffect(() => {
        dispatch(getAllHouses());
    }, [dispatch]);

    const handleEdit =  (row) => {
        navigate(`/edit-representative/${row._id}`)
    }

    const fetchRepresentativeFromQuorum = async () => {
        setFetching(true); // Set fetching state to true
        try {
            const response = await axios.post(`${API_URL}/fetch-quorum/store-data`, {
                type: "representative",
            });
            if (response.status === 200) {
               alert("success")
                await dispatch(getAllHouses()); // Refresh the list of house
            } else {
                throw new Error("Failed to fetch senators from Quorum");
            }
        } catch (error) {
            console.error("Error fetching senators from Quorum:", error);
           
        } finally {
            setFetching(false); // Set fetching state to false
        }
    };
    // console.log("Transformed Houses Data:", transformedHouses);
    //handle Delete
    const handleDelete = async (row) => {
        if (window.confirm("Are you sure you want to delete this senator?")) {
            await dispatch(deleteHouse(row._id));
            await dispatch(getAllHouses());
            console.log(deleteHouse(row._id))
        };
    }
    

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <Box sx={{ display: "flex" }}>
                <SideMenu />
                <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                    <Stack spacing={2} sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
                        <Typography
                            variant="h4"
                            align="center"
                            sx={{ paddingTop: "50px", color: "text.secondary" }}
                        >
                            SBA Scorecard Management System
                        </Typography>

                        <Stack direction="row" spacing={2} width="100%" sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                            {/* <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/add-representative")}>
                                Add Representative
                            </Button> */}
                            <Button variant="outlined" onClick={fetchRepresentativeFromQuorum}>Fetch Representative from Quorum</Button>
                        </Stack>
                         {fetching && <CircularProgress />}

                        {/* Pass transformed data to MainGrid */}
                        <MainGrid type="representative" data={transformedHouses || []}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}
