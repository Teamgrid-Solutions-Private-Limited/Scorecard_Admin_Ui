import * as React from "react";
import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllHouses } from "../redux/slice/houseSlice"; // Import the action
import { Box, Stack, Typography, Button ,CircularProgress } from "@mui/material";
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
    const [fetching, setFetching] = useState(false);
 

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
                            <Button variant="contained" onClick={fetchRepresentativeFromQuorum}>Fetch Representative from Quorum</Button>
                        </Stack>
                         {fetching && <CircularProgress />}

                        {/* Pass transformed data to MainGrid */}
                        <MainGrid type="representative" data={transformedHouses || []} loading={loading} />
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}
// import * as React from "react";
// import { alpha } from "@mui/material/styles";
// import CssBaseline from "@mui/material/CssBaseline";
// import Box from "@mui/material/Box";
// import Stack from "@mui/material/Stack";
// import AppNavbar from "./components/AppNavbar";
// import Header from "./components/Header";
// import MainGrid from "./components/MainGrid";
// import SideMenu from "./components/SideMenu";
// import AppTheme from "/shared-theme/AppTheme";
// import Typography from "@mui/material/Typography";
// import ButtonGroup from "@mui/material/ButtonGroup";
// import Grid from "@mui/material/Grid2";
// import Button from "@mui/material/Button";
// import SaveIcon from "@mui/icons-material/Save";
// import AddIcon from "@mui/icons-material/Add";
// import { useNavigate } from "react-router-dom";
// import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from "./theme/customizations";

// const xThemeComponents = {
//     ...chartsCustomizations,
//     ...dataGridCustomizations,
//     ...datePickersCustomizations,
//     ...treeViewCustomizations,
// };

// export default function Representative(props) {
//     const navigate = useNavigate();
//     return (
//         <AppTheme {...props} themeComponents={xThemeComponents}>
//             <Box sx={{ display: "flex" }}>
//                 <SideMenu />

//                 <Box
//                     sx={{
//                         flexGrow: 1,
//                         overflow: "auto",
//                     }}
//                 >
//                     <Stack
//                         spacing={2}
//                         sx={{
//                             alignItems: "center",
//                             mx: 3,
//                             pb: 5,
//                             mt: { xs: 8, md: 0 },
//                         }}
//                     >
//                         <Typography
//                             variant="h4"
//                             align="center"
//                             sx={[
//                                 {
//                                     paddingTop: "50px",
//                                     color: "text.secondary",
//                                 },
//                             ]}
//                         >
//                             SBA Scorecard Management System
//                         </Typography>

//                         <Stack
//                             container
//                             direction="row"
//                             spacing={2}
//                             width="100%"
//                             sx={{
//                                 justifyContent: "flex-end",
//                                 alignItems: "center",
//                             }}
//                         >
//                             <Button variant="contained" startIcon={<AddIcon />}  onClick={() => navigate("/add-representative")}>Add Representative</Button>
//                             <Button variant="outlined">Fetch Representative from Quorum</Button>

                    
//                         </Stack>

//                         <MainGrid type="representative" />
                        
//                     </Stack>
//                 </Box>
//             </Box>
//         </AppTheme>
//     );
// }
