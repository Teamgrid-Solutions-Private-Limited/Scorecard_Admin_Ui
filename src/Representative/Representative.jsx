import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllHouses, deleteHouse } from "../redux/reducer/houseSlice";
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
   Menu,
  MenuItem,
  Chip,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import AppTheme from "../../src/shared-theme/AppTheme";
import SideMenu from "../../src/components/SideMenu";
import MainGrid from "../../src/components/MainGrid";
import { API_URL } from "../redux/API";
import axios from "axios";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../../src/Themes/customizations";
import FixedHeader from "../../src/components/FixedHeader";
import FilterListIcon from "@mui/icons-material/FilterList";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Representative(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { houses, loading } = useSelector((state) => state.house);
  const [fetching, setFetching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedRepresentative, setSelectedRepresentative] = useState(null);

  const [partyFilter, setPartyFilter] = useState([]);
  const [districtFilter, setDistrictFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [partyMenuAnchorEl, setPartyMenuAnchorEl] = useState(null);
  const [districtMenuAnchorEl, setDistrictMenuAnchorEl] = useState(null);
  const [ratingMenuAnchorEl, setRatingMenuAnchorEl] = useState(null);


   const ratingOptions = ["A+", "B", "C", "D", "F"];

  useEffect(() => {
    dispatch(getAllHouses());
  }, [dispatch]);

  const transformedHouses = houses.map((house) => ({
    ...house,
    district: house.district?.split(", ").pop() || "Unknown",
  }));

  const partyOptions = [...new Set(transformedHouses.map(rep => rep.party))].filter(Boolean);
  const districtOptions = [...new Set(transformedHouses.map(rep => rep.district))].filter(Boolean);

  const filteredRepresentative = transformedHouses.filter(
    (transformedHouse) => {
      const nameMatch = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
      .every((word) => transformedHouse.name.toLowerCase().includes(word));

       // Party filter
    const partyMatch = partyFilter.length === 0 || partyFilter.includes(transformedHouse.party);
    
    // District filter
    const districtMatch = districtFilter.length === 0 || districtFilter.includes(transformedHouse.district);
    
    // Rating filter
    const ratingMatch = ratingFilter.length === 0 || 
      (transformedHouse.rating && ratingFilter.includes(transformedHouse.rating));
    
    return nameMatch && partyMatch && districtMatch && ratingMatch;
    }
  );

    // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handlePartyMenuOpen = (event) => {
    setPartyMenuAnchorEl(event.currentTarget);
  };

  const handleDistrictMenuOpen = (event) => {
    setDistrictMenuAnchorEl(event.currentTarget);
  };

  const handleRatingMenuOpen = (event) => {
    setRatingMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setPartyMenuAnchorEl(null);
    setDistrictMenuAnchorEl(null);
    setRatingMenuAnchorEl(null);
  };

  const handlePartyFilter = (party) => {
    setPartyFilter(prev =>
      prev.includes(party) 
        ? prev.filter(p => p !== party) 
        : [...prev, party]
    );
  };

  const handleDistrictFilter = (district) => {
    setDistrictFilter(prev =>
      prev.includes(district) 
        ? prev.filter(s => s !== district) 
        : [...prev, district]
    );
  };

  const handleRatingFilter = (rating) => {
    setRatingFilter(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const clearAllFilters = () => {
    setPartyFilter([]);
    setDistrictFilter([]);
    setRatingFilter([]);
    setSearchQuery("");
  };

  const handleEdit = (row) => {
    navigate(`/edit-representative/${row._id}`);
  };

  const fetchRepresentativeFromQuorum = async () => {
    setFetching(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25));
    }, 1000);

    try {
      const response = await axios.post(`${API_URL}/fetch-quorum/store-data`, {
        type: "representative",
      });

      if (response.status === 200) {
        setSnackbarMessage("Success: Representatives fetched successfully!");
        setSnackbarSeverity("success");
        await dispatch(getAllHouses());
      } else {
        throw new Error("Failed to fetch representatives from Quorum.");
      }
    } catch (error) {
      console.error("Error fetching representatives from Quorum:", error);
      setSnackbarMessage("Error: Unable to fetch representatives.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleDeleteClick = (row) => {
    setSelectedRepresentative(row);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setOpenDeleteDialog(false);
    setFetching(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 25));
    }, 1000);

    try {
      await dispatch(deleteHouse(selectedRepresentative._id));
      await dispatch(getAllHouses());
      setSnackbarMessage("Representative deleted successfully.");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Error deleting representative.");
      setSnackbarSeverity("error");
      console.error("Error fetching representatives from Quorum:", error);
      setSnackbarMessage("Error: Unable to fetch representatives.");
      setSnackbarSeverity("error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      {(loading || fetching) && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress sx={{ color: "#CC9A3A !important" }} />
        </Box>
      )}
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <Box
          sx={{
            flexGrow: 1,
            // overflow: "auto",
            width: "80%",
            filter: fetching ? "blur(1px)" : "none",
            pointerEvents: fetching ? "none" : "auto",
          }}
        >
          <FixedHeader />
          <Stack
            spacing={2}
            sx={{ alignItems: "center", mx: 2, pb: 5, mt: { xs: 8, md: 0 } }}
          >
            {/* <Typography
              variant="h4"
              align="center"
              sx={{ paddingTop: "50px", paddingBottom: "70px", color: "text.secondary", mb: 6 }}
            >
              SBA Scorecard Management System
            </Typography> */}

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 4,
                gap: 2,
              }}
            >
              <Typography component="h2" variant="h6">
                All Representatives
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  placeholder="Search Representatives"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    padding: "0.5rem 1rem",
                    marginLeft: "0.5rem",
                    width: "190px",
                    "& .MuiInputBase-root": {
                      "&.Mui-focused": {
                        boxShadow: "none !important",
                        outline: "none !important",
                      },
                    },
                  }}
                />


                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={handleFilterClick}
                    sx={{
                      height: '40px',
                      minWidth: '40px',
                      padding: '0 8px',
                    }}
                  >
                    Filters
                  </Button>
              

                {/* Active filters chips */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {partyFilter.map(party => (
                    <Chip 
                      key={party}
                      label={`Party: ${party}`}
                      onDelete={() => handlePartyFilter(party)}
                      size="small"
                    />
                  ))}
                  {districtFilter.map(district => (
                    <Chip 
                      key={district}
                      label={`District: ${district}`}
                      onDelete={() => handleDistrictFilter(district)}
                      size="small"
                    />
                  ))}
                  {ratingFilter.map(rating => (
                    <Chip 
                      key={rating}
                      label={`Rating: ${rating}`}
                      onDelete={() => handleRatingFilter(rating)}
                      size="small"
                    />
                  ))}
                  {(partyFilter.length > 0 || districtFilter.length > 0 || ratingFilter.length > 0) && (
                    <Chip 
                      label="Clear all"
                      onClick={clearAllFilters}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>


                <Button
                  variant="outlined"
                  sx={{
                    backgroundColor: "#4a90e2 !important",
                    color: "white !important",
                    padding: "0.5rem 1rem",
                    marginLeft: "0.5rem",
                    "&:hover": {
                      backgroundColor: "#357ABD !important",
                    },
                  }}
                  onClick={fetchRepresentativeFromQuorum}
                >
                  Fetch Representatives from Quorum
                </Button>
              </Stack>
            </Box>
            {/* Representative Table */}
            <MainGrid
              type="representative"
              data={filteredRepresentative || []}
              loading={fetching ? false : loading}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </Stack>
        </Box>

         <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={handlePartyMenuOpen}>Filter by Party</MenuItem>
          <MenuItem onClick={handleDistrictMenuOpen}>Filter by District</MenuItem>
          <MenuItem onClick={handleRatingMenuOpen}>Filter by Rating</MenuItem>
          <Divider />
          <MenuItem onClick={clearAllFilters}>Clear all filters</MenuItem>
        </Menu>

        {/* Party Filter Menu */}
        <Menu
          anchorEl={partyMenuAnchorEl}
          open={Boolean(partyMenuAnchorEl)}
          onClose={handleMenuClose}
        >
          {partyOptions.map(party => (
            <MenuItem 
              key={party}
              onClick={() => {
                handlePartyFilter(party);
                handleMenuClose();
              }}
              sx={{
                backgroundColor: partyFilter.includes(party) ? '#f0f0f0' : 'transparent',
              }}
            >
              {party}
            </MenuItem>
          ))}
        </Menu>

        {/* District Filter Menu */}
        <Menu
          anchorEl={districtMenuAnchorEl}
          open={Boolean(districtMenuAnchorEl)}
          onClose={handleMenuClose}
        >
          {districtOptions.map(district => (
            <MenuItem 
              key={district}
              onClick={() => {
                handleDistrictFilter(district);
                handleMenuClose();
              }}
              sx={{
                backgroundColor: districtFilter.includes(district) ? '#f0f0f0' : 'transparent',
              }}
            >
              {district}
            </MenuItem>
          ))}
        </Menu>

        {/* Rating Filter Menu */}
        <Menu
          anchorEl={ratingMenuAnchorEl}
          open={Boolean(ratingMenuAnchorEl)}
          onClose={handleMenuClose}
        >
          {ratingOptions.map(rating => (
            <MenuItem 
              key={rating}
              onClick={() => {
                handleRatingFilter(rating);
                handleMenuClose();
              }}
              sx={{
                backgroundColor: ratingFilter.includes(rating) ? '#f0f0f0' : 'transparent',
              }}
            >
              {rating}
            </MenuItem>
          ))}
        </Menu>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%", bgcolor: snackbarMessage === "Representative deleted successfully." ? '#FF474D' : undefined }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: { borderRadius: 3, padding: 2, minWidth: 350 },
          }}
        >
          <DialogTitle
            sx={{
              fontSize: "1.4rem",
              fontWeight: "bold",
              textAlign: "center",
              color: "error.main",
            }}
          >
            Confirm Deletion
          </DialogTitle>

          <DialogContent>
            <DialogContentText
              sx={{
                textAlign: "center",
                fontSize: "1rem",
                color: "text.secondary",
              }}
            >
              Are you sure you want to delete{" "}
              <strong>{selectedRepresentative?.name}</strong>?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Stack
              direction="row"
              spacing={2}
              sx={{ width: "100%", justifyContent: "center", paddingBottom: 2 }}
            >
              <Button
                onClick={() => setOpenDeleteDialog(false)}
                variant="outlined"
                color="secondary"
                sx={{ borderRadius: 2, paddingX: 3 }}
              >
                Cancel
              </Button>

              <Button
                onClick={handleConfirmDelete}
                variant="contained"
                color="error"
                sx={{ borderRadius: 2, paddingX: 3 }}
              >
                Delete
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      </Box>
    </AppTheme>
  );
}
