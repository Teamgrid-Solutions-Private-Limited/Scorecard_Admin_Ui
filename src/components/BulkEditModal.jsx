import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";

export default function BulkEditModal({
  open,
  onClose,
  votes = [],
  activities = [],
  onApply,
  type = "vote", // default view
}) {
  const [mode, setMode] = useState(type);
  const [selectedItem, setSelectedItem] = useState(null);
  const [score, setScore] = useState("");

  useEffect(() => {
    setMode(type);
    setSelectedItem(null);
    setScore("");
  }, [open, type]);

  const voteOptions = votes || [];
  const activityOptions = activities || [];
  const formatDate = (date) => {
    if (!date) return "Unknown date";

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // const scoreOptions = mode === "vote" ? ["yea", "nay", "other"] : ["yes", "no", "other"];
 const scoreOptions =
  mode === "vote"
    ? [
        { label: "Yea", value: "yea" },
        { label: "Nay", value: "nay" },
        { label: "Other", value: "other" },
        { label: "Present", value: "present" },
        { label: "Absent", value: "missed" },
      ]
    : [
        { label: "Yea", value: "yes" },
        { label: "Nay", value: "no" },
        { label: "Other", value: "other" },
        { label: "Present", value: "present" },
        { label: "Absent", value: "missed" },
      ];

  const handleSave = () => {
    if (!selectedItem || !score) {
    
      return;
    }

    const payload = {
      category: mode,
      itemId: selectedItem._id || selectedItem,
      score: score,
    };

    // Include date if available (for term matching)
    if (mode === "vote" && selectedItem.date) {
      payload.voteDate = selectedItem.date;
    } else if (mode === "activity" && selectedItem.date) {
      payload.activityDate = selectedItem.date;
    }


    onApply && onApply(payload);
    onClose && onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Bulk Edit Scores</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Apply a score to the selected members for a specific vote or tracked
            activity.
          </Typography>
        </Box>

        <RadioGroup
          row
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setSelectedItem(null);
            setScore("");
          }}
        >
          <FormControlLabel value="vote" control={<Radio />} label="Vote" />
          <FormControlLabel
            value="activity"
            control={<Radio />}
            label="Activity"
          />
        </RadioGroup>

        {mode === "vote" ? (
          <Autocomplete
            options={voteOptions}
            value={selectedItem}
            onChange={(_, v) => setSelectedItem(v)}
            getOptionLabel={(opt) =>
              opt?.title ? `${opt.title} (${formatDate(opt.date)})` : opt
            }
            renderOption={(props, option) => (
              <li {...props} key={option._id}>
                <Typography variant="body2">
                  {option.title}{" "}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "12px" }}
                  >
                    ({formatDate(option.date)})
                  </Typography>
                </Typography>
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Select vote" margin="normal" />
            )}
            sx={{
              "& .MuiInputLabel-root": { top: "-7px", left: "15px" },
              "& .MuiInputLabel-shrink": { top: "-12px", left: "30px" },
            }}
          />
        ) : (
          <Autocomplete
            options={activityOptions}
            value={selectedItem}
            onChange={(_, v) => setSelectedItem(v)}
            getOptionLabel={(opt) =>
              opt?.title ? `${opt.title} (${formatDate(opt.date)})` : opt
            }
            renderOption={(props, option) => (
              <li {...props} key={option._id}>
                <Typography variant="body2">
                  {option.title}{" "}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "12px" }}
                  >
                    ({formatDate(option.date)})
                  </Typography>
                </Typography>
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Select activity" margin="normal" />
            )}
            sx={{
              "& .MuiInputLabel-root": { top: "-7px", left: "15px" },
              "& .MuiInputLabel-shrink": { top: "-7px", left: "30px" },
            }}
          />
        )}

        <FormControl
          fullWidth
          sx={{
            mt: 1,
            "& .MuiInputLabel-root": {
              top: "-7px",
              left: "15px",
            },
            "& .MuiInputLabel-shrink": {
              top: "-7px",
              left: "30px",
            },
          }}
        >
          <InputLabel id="score-select-label">Score</InputLabel>
          <Select
            labelId="score-select-label"
            label="Score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          >
            {scoreOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
 <DialogActions sx={{ paddingRight: "22px" , paddingBottom: "24px" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: 2, paddingX: 3 }}
        >
          Cancel
        </Button>
         <Button
          variant="outlined"
          className="bulkEditBtn"
          onClick={handleSave}
          disabled={!selectedItem || !score}
          sx={{
            borderRadius: 2,
            backgroundColor: "#173A5E !important",
            color: "white !important",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            padding: "8px 24px",
            border: "none !important",
            "&:hover": {
              backgroundColor: "#1E4C80 !important",
              color: "white !important",
              border: "none !important",
            },
            "&:active": {
              backgroundColor: "#173A5E !important",
            },
            "&:disabled": {
              backgroundColor: "#ccc !important",
              color: "#666 !important",
              border: "none !important",
            },
          }}
        >
          Apply to Selected
        </Button>
      </DialogActions>
    </Dialog>
  );
}
