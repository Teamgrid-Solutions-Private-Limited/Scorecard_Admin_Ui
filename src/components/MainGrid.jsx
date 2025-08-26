import * as React from "react";
import { Box, Typography, Grid } from "@mui/material";
import Copyright from "../../src/Dashboard/internals/components/Copyright";
import CustomizedDataGrid from "./CustomizedDataGrid";
import Footer from "./Footer";

export default function MainGrid({
  type,
  data,
  loading,
  onEdit,
  onDelete,
  onToggleStatus ,
  handleToggleStatusAct,
  handleToggleStatusSenator,
  handleToggleStatusHouse,
  isSelectable = false, // New prop for bulk edit mode
  onSelectionChange, // New prop to handle selection changes
  selectedItems = []
}) {
  const title =
    type === "bills"
      ? "All Bills"
      : type === "senator"
      ? "All Senators"
      : "All Representatives";

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2} columns={12}>
        <Grid item xs={12} lg={12}>
          <CustomizedDataGrid
            type={type}
            rows={data}
            // loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            handleToggleStatusAct={handleToggleStatusAct}
             isSelectable={isSelectable} // Pass to CustomizedDataGrid
            onSelectionChange={onSelectionChange} // Pass to CustomizedDataGrid
            selectedItems={selectedItems}
            handleToggleStatusSenator={handleToggleStatusSenator}
            handleToggleStatusHouse={handleToggleStatusHouse}
         />
        </Grid>
      </Grid>
        {type !== "user" && <Footer />}
    </Box>
  );
}
