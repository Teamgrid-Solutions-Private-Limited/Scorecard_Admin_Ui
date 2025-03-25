import * as React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Copyright from "../internals/components/Copyright";
import CustomizedDataGrid from "./CustomizedDataGrid";
import { useEffect, useState } from "react";

export default function MainGrid({ type }) {
    const [title, setTitle] = useState("");

    useEffect(() => {
        const newTitle = type === "senator" ? "All Senators" : "All Representatives";
        setTitle(newTitle);
    }, [type]);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <Grid container spacing={2} columns={12}>
                <Grid size={{ xs: 12, lg: 12 }}>
                    <CustomizedDataGrid type={type} />
                </Grid>
            </Grid>
            <Copyright sx={{ my: 4 }} />
        </Box>
    );
}
