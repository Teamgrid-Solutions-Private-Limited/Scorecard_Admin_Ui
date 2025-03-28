import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllVotes, deleteVote } from "../redux/slice/voteSlice";
import AppTheme from "/shared-theme/AppTheme";
import { Box, Stack, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import SideMenu from "./components/SideMenu";
import MainGrid from "./components/MainGrid";


import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from "./theme/customizations";

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

export default function Bills(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { votes, loading } = useSelector((state) => state.vote);

  useEffect(() => {
    dispatch(getAllVotes());
  }, [dispatch]);

  const formatDate = (isoDate) => {
    return new Date(isoDate).toISOString().split("T")[0];
  };

  const billsData = votes.map((vote, index) => ({
    _id: vote._id || index,
    date: formatDate(vote.date),
    bill: vote.billName || vote.title,
  }));

  const handleEdit = (row) => {
    navigate(`edit-bill/${row._id}`);
  };

  const handleDelete = async (row) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      await dispatch(deleteVote(row._id));
      await dispatch(getAllVotes());
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <Stack spacing={2} sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
            <Typography variant="h4" align="center" sx={{ paddingTop: "50px", color: "text.secondary" }}>
              SBA Scorecard Management System
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              width="100%"
              sx={{ justifyContent: "flex-end", alignItems: "center" }}
            >
              {/* <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/add-bill")}
              >
                Add Bills
              </Button> */}
              <Button variant="outlined"  onClick={() => navigate("/search-bills")}>Fetch bills from Quorum</Button>
            </Stack>

            <MainGrid type="bills" data={billsData} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
