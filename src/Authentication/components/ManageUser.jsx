import React, { useState, useEffect } from "react";

import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import CloseIcon from "@mui/icons-material/Close";

import AddUser from "./AddUser";
import SideMenu from "../../components/SideMenu";
import FixedHeader from "../../components/FixedHeader";
import AppTheme from "../../shared-theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../../Themes/customizations";
import MainGrid from "../../components/MainGrid";

import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  deleteUser,
  updateUser,
} from "../../redux/reducer/loginSlice";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function ManageUser(props) {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.auth);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    role: "",
  });

  // Fetch users on component mount
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  }, [error]);

  const handleEditUser = (user) => {
    setEditUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "",
    });
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditUserSave = async () => {
    try {
      await dispatch(
        updateUser({ userId: editUser._id, userData: editForm })
      ).unwrap();
      setSnackbarMessage("User updated successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setEditUser(null);
      dispatch(getAllUsers()); // Refresh the user list
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to update user");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditUserClose = () => setEditUser(null);

  const handleDeleteUser = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      setSnackbarMessage("User deleted successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to delete user");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const roleOptions = ["admin", "editor", "contributor"];

  const handleAddUserOpen = () => setOpenAddUser(true);
  const handleAddUserClose = () => setOpenAddUser(false);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1, width: "80%", p: 2 }}>
          <FixedHeader />
          <Box sx={{ maxWidth: "100%", mx: "auto", mt: 6 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h5" fontWeight="bold">
                Manage Users
              </Typography>
              <Button
                startIcon={<PersonAddAltRoundedIcon />}
                onClick={handleAddUserOpen}
                sx={{
                  backgroundColor: "#4a90e2 !important",
                  color: "white !important",
                  padding: "0.5rem 1rem",
                  marginLeft: "0.5rem",
                  "&:hover": {
                    backgroundColor: "#357ABD !important",
                  },
                }}
              >
                Add User
              </Button>
            </Stack>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <MainGrid
                type="user"
                data={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            )}

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onClose={handleEditUserClose}>
              <DialogTitle>Edit User</DialogTitle>
              <DialogContent>
                <TextField
                  margin="dense"
                  label="Full Name"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditFormChange}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  label="Role"
                  name="role"
                  value={editForm.role}
                  onChange={handleEditFormChange}
                  select
                  fullWidth
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleEditUserClose}>Cancel</Button>
                <Button onClick={handleEditUserSave} variant="contained">
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            <AddUser
              open={openAddUser}
              onClose={handleAddUserClose}
              onSuccess={(newUser) => {
                setSnackbarMessage("User added successfully");
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                dispatch(getAllUsers()); // Refresh the user list
              }}
              onError={(error) => {
                setSnackbarMessage(error);
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
              }}
            />

            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Alert
                severity={snackbarSeverity}
                action={
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleSnackbarClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
