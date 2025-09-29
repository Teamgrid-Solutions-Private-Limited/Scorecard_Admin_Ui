import * as React from "react";
import { Box, Grid } from "@mui/material";
import CustomizedDataGrid from "./CustomizedDataGrid";
import Footer from "./Footer";

export default function MainGrid({
  type,
  data,
  onEdit,
  onDelete,
  onToggleStatus ,
  handleToggleStatusAct,
  handleToggleStatusSenator,
  handleToggleStatusHouse,
  isSelectable = false, 
  onSelectionChange, 
  selectedItems = []
}) {
  const title =
    type === "bills"
      ? "All Bills"
      : type === "senator"
      ? "All Senators"
      : "All Representatives";

  return (
    <Box sx={{
      width: "100%",
      maxWidth: "100%",
      overflowX: "auto",
    }}>
      <Grid container spacing={2} columns={12}>
        <Grid item xs={12} lg={12}>
          <CustomizedDataGrid
            type={type}
            rows={data}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            handleToggleStatusAct={handleToggleStatusAct}
             isSelectable={isSelectable} 
            onSelectionChange={onSelectionChange}
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
