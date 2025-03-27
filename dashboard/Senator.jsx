import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteSenator, getAllSenators } from "../redux/slice/senetorSlice"; // Import the action
import { Box, Stack, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import AppTheme from "/shared-theme/AppTheme";
import SideMenu from "./components/SideMenu";
import MainGrid from "./components/MainGrid";
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

    // Fetch senators when the component mounts
    useEffect(() => {
        dispatch(getAllSenators());
    }, [dispatch]);

    const handleEdit = (row) => {
        navigate(`edit-senator/${row._id}`)
    };

    const handleDelete = async(row) => {
        if (window.confirm("Are you sure you want to delete this senator?")){
            await dispatch(deleteSenator(row._id));
            await dispatch(getAllSenators());
        }
    };

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <Box sx={{ display: "flex" }}>
                <SideMenu />
                <Box
                    sx={{
                        flexGrow: 1,
                        overflow: "auto",
                    }}
                >
                    <Stack
                        spacing={2}
                        sx={{
                            alignItems: "center",
                            mx: 3,
                            pb: 5,
                            mt: { xs: 8, md: 0 },
                        }}
                    >
                        <Typography
                            variant="h4"
                            align="center"
                            sx={{
                                paddingTop: "50px",
                                color: "text.secondary",
                            }}
                        >
                            SBA Scorecard Management System
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={2}
                            width="100%"
                            sx={{
                                justifyContent: "flex-end",
                                alignItems: "center",
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate("/add-senator")}
                            >
                                Add Senator
                            </Button>
                            <Button variant="outlined">Fetch Senators from Quorum</Button>
                        </Stack>

                        {/* Pass senators data to MainGrid */}
                        <MainGrid type="senator" data={senators} loading={loading} onDelete={handleDelete}
                        onEdit={handleEdit}/>
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}
