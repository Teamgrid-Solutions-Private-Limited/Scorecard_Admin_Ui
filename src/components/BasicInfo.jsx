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
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { API_URL } from "../redux/API";
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

export default function SenatorBasicInfo({
  formData,
  handleChange,
  handleStatusChange,
  handleFileChange,
  isMobile,
  mode = "senator",
}) {
  return (
    <Box sx={{ p: 0 }}>
      <Typography className="customTypography">
        {mode === "representative"
          ? "Representative's Information"
          : "Senator's Information"}
      </Typography>
      <Grid
        container
        rowSpacing={2}
        columnSpacing={2}
        alignItems={"center"}
        py={3}
        pl={{ xs: 0, sm: mode === "representative" ? 9 : 0 }}
      >
        <Grid
          size={isMobile ? 12 : 2}
          sx={mode === "representative" ? { minWidth: 165 } : {}}
        >
          <InputLabel className="label">
            {mode === "representative"
              ? "Representative's Name"
              : "Senator's Name"}
          </InputLabel>
        </Grid>
        <Grid size={isMobile ? 10 : 4}>
          <TextField
            required
            id="title"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            size="small"
            autoComplete="off"
            variant="outlined"
            className="textField"
          />
        </Grid>
        <Grid size={isMobile ? 12 : 1}>
  <InputLabel className="label">Status</InputLabel>
</Grid>

<Grid size={isMobile ? 12 : 4}>
  <ButtonGroup
    variant="outlined"
    className="customButtonGroup"
  >
 <Button
              onClick={() => handleStatusChange("active")}
              className={`statusBtn ${
                formData.status === "active" || formData.status === "Active"
                  ? "active"
                  : ""
              }`}
            >
              Active
            </Button>
            <Button
              onClick={() => handleStatusChange("former")}
              className={`statusBtn ${
                formData.status === "former" || formData.status === "Former"
                  ? "active"
                  : ""
              }`}
            >
              Former
            </Button>
  </ButtonGroup>

  <FormControlLabel
    sx={{ ml: 2 }}
    control={
      <Switch
        name="isNew"
        checked={!!formData.isNew}
        onChange={(e) =>
          handleChange({
            target: { name: "isNew", value: e.target.checked },
          })
        }
      />
    }
    label={<InputLabel className="label">Is New</InputLabel>}
  />
</Grid>

       
        {mode === "senator" ? (
          <>
            <Grid size={isMobile ? 12 : 2}>
              <InputLabel className="label">State</InputLabel>
            </Grid>
            <Grid size={isMobile ? 10 : 4}>
              <TextField
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                fullWidth
                size="small"
                autoComplete="off"
                variant="outlined"
                className="textField"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid size={isMobile ? 12 : 2} sx={{ minWidth: 165 }}>
              <InputLabel className="label">District</InputLabel>
            </Grid>
            <Grid size={isMobile ? 10 : 4}>
              <TextField
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                fullWidth
                size="small"
                autoComplete="off"
                variant="outlined"
                className="textField"
              />
            </Grid>
          </>
        )}
        <Grid size={isMobile ? 12 : 1} sx={{ alignContent: "center" }}>
          <InputLabel className="label">Party</InputLabel>
        </Grid>
        <Grid size={isMobile ? 10 : 4}>
          <FormControl fullWidth className="paddingLeft ">
            <Select
              name="party"
              value={formData.party}
              onChange={handleChange}
              sx={{ background: "#fff" }}
            >
              <MenuItem value="republican">Republican</MenuItem>
              <MenuItem value="democrat">Democrat</MenuItem>
              <MenuItem value="independent">Independent</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          size={isMobile ? 12 : 2}
          sx={mode === "representative" ? { minWidth: 165 } : {}}
        >
          <InputLabel className="label">
            {mode === "representative"
              ? "Representative's Photo"
              : "Senator's Photo"}
          </InputLabel>
        </Grid>
        <Grid size={isMobile ? 10 : 8}>
          <Box
            className="paddingLeft"
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            {formData.photo ? (
              <img
                src={
                  formData?.photo
                    ? typeof formData.photo === "string"
                      ? formData.photo.startsWith("http")
                        ? formData.photo
                        : `${API_URL}${
                            formData.photo.startsWith("/") ? "" : "/"
                          }images/${
                            mode === "representative" ? "house" : "senator"
                          }/${formData.photo}`
                      : URL.createObjectURL(formData.photo)
                    : "/default-avatar.png"
                }
                alt={
                  mode === "representative"
                    ? "House Member's Photo"
                    : "Senator's Photo"
                }
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No photo uploaded
              </Typography>
            )}
            <Button
              component="label"
              variant="outlined"
              className="uploadBtn"
              startIcon={<CloudUploadIcon />}
            >
              Upload files
              <VisuallyHiddenInput
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
