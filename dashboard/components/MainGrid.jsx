import * as React from "react";
import { Box, Typography, Grid } from "@mui/material";
import Copyright from "../internals/components/Copyright";
import CustomizedDataGrid from "./CustomizedDataGrid";

export default function MainGrid({ type, data, loading }) {
    const title = type === "senator" ? "All Senators" : "All Representatives";

    return (
        <Box sx={{ width: "100%" }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <Grid container spacing={2} columns={12}>
                <Grid item xs={12} lg={12}>
                    <CustomizedDataGrid type={type} rows={data} loading={loading} />
                </Grid>
            </Grid>
            <Copyright sx={{ my: 4 }} />
        </Box>
    );
}
