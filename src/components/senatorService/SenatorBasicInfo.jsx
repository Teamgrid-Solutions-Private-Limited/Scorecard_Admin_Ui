import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function SenatorBasicInfo({ formData, handleChange, handleStatusChange, handleFileChange, isMobile }) {
  return (
    <Box sx={{ p: 0 }}>
      <Typography
        fontSize={"1rem"}
        fontWeight={500}
        sx={{ borderBottom: "1px solid", borderColor: "divider", p: 1.5, px: 3 }}
      >
        Senator's Information
      </Typography>
      <Grid container rowSpacing={2} columnSpacing={2} alignItems={"center"} py={3}>
        <Grid size={isMobile ? 12 : 2}>
          <InputLabel sx={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "flex-start" : "flex-end", fontWeight: 500, my: 0 }}>
            Senator's Name
          </InputLabel>
        </Grid>
        <Grid size={isMobile ? 12 : 4}>
          <TextField required id="title" name="name" value={formData.name} onChange={handleChange} fullWidth size="small" autoComplete="off" variant="outlined" />
        </Grid>
        <Grid size={isMobile ? 12 : 1}>
          <InputLabel sx={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end", fontWeight: 500, my: 0 }}>Status</InputLabel>
        </Grid>
        <Grid size={isMobile ? 12 : 4}>
          <ButtonGroup variant="outlined" aria-label="Basic button group" sx={{ "& .MuiButton-outlined": { height: "36px", borderColor: "#4CAF50", color: "#4CAF50", "&:hover": { backgroundColor: "rgba(76, 175, 80, 0.04)", borderColor: "#4CAF50" } } }}>
            <Button variant={"outlined"} onClick={() => handleStatusChange("Active")} sx={{ backgroundColor: formData.status === "Active" ? "#4CAF50 !important" : "transparent", color: formData.status === "Active" ? "white !important" : "#4CAF50", borderColor: "#4CAF50 !important", "&:hover": { backgroundColor: formData.status === "Active" ? "#45a049 !important" : "rgba(76, 175, 80, 0.1)", borderColor: "#4CAF50 !important" } }}>Active</Button>
            <Button variant={"outlined"} onClick={() => handleStatusChange("Former")} sx={{ backgroundColor: formData.status === "Former" ? "#4CAF50 !important" : "transparent", color: formData.status === "Former" ? "white !important" : "#4CAF50", borderColor: "#4CAF50 !important", "&:hover": { backgroundColor: formData.status === "Former" ? "#45a049 !important" : "rgba(76, 175, 80, 0.1)", borderColor: "#4CAF50 !important" } }}>Former</Button>
          </ButtonGroup>
        </Grid>
        <Grid size={isMobile ? 12 : 2}>
          <InputLabel sx={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end", fontWeight: 500, my: 0 }}>State</InputLabel>
        </Grid>
        <Grid size={isMobile ? 12 : 4}>
          <TextField id="state" name="state" value={formData.state} onChange={handleChange} fullWidth size="small" autoComplete="off" variant="outlined" />
        </Grid>
        <Grid size={isMobile ? 12 : 1} sx={{ alignContent: "center" }}>
          <InputLabel sx={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end", fontWeight: 500, my: 0 }}>Party</InputLabel>
        </Grid>
        <Grid size={isMobile ? 12 : 4}>
          <FormControl fullWidth>
            <Select name="party" value={formData.party} onChange={handleChange} sx={{ background: "#fff" }}>
              <MenuItem value="republican">Republican</MenuItem>
              <MenuItem value="democrat">Democrat</MenuItem>
              <MenuItem value="independent">Independent</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={isMobile ? 12 : 2}>
          <InputLabel sx={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end", fontWeight: 500, my: 0 }}>Senator's Photo</InputLabel>
        </Grid>
        <Grid size={10}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {formData.photo ? (
              <img src={typeof formData.photo === "string" ? formData.photo : URL.createObjectURL(formData.photo)} alt="Senator's Photo" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} />
            ) : (
              <Typography variant="body2" color="text.secondary">No photo uploaded</Typography>
            )}
            <Button component="label" variant="outlined" sx={{ backgroundColor: "#173A5E !important", color: "white !important", padding: "0.5rem 1rem", marginLeft: "0.5rem", "&:hover": { backgroundColor: "#1E4C80 !important" } }} startIcon={<CloudUploadIcon />}>
              Upload files
              <VisuallyHiddenInput type="file" onChange={handleFileChange} accept="image/*" />
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}


