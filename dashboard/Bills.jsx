import * as React from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import MainGrid from "./components/MainGrid";
import SideMenu from "./components/SideMenu";
import AppTheme from "/shared-theme/AppTheme";
import Typography from "@mui/material/Typography";
import ButtonGroup from "@mui/material/ButtonGroup";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import Maingridbills from "./Maingridbills";
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from "./theme/customizations";

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

export default function Senator(props) {
    const navigate = useNavigate();
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
                            sx={[
                                {
                                    paddingTop: "50px",
                                    color: "text.secondary",
                                },
                            ]}
                        >
                            SBA Scorecard Management System
                        </Typography>

                        <Stack
                            container
                            direction="row"
                            spacing={2}
                            width="100%"
                            sx={{
                                justifyContent: "flex-end",
                                alignItems: "center",
                            }}
                        >
                            <Button variant="contained" startIcon={<AddIcon />}  onClick={() => navigate("/add-bill")}>Add Bills</Button>
                            <Button variant="outlined">Fetch bills from Quorum</Button>

                    
                        </Stack>

                        <Maingridbills />
                        
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}
