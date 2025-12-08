import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  FormLabel,
  DialogContentText,
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
import { getErrorMessage } from "../../utils/errorHandler";
import { validateUserForm } from "../../helpers/validationHelpers";
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
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; 
import MobileHeader from "../../components/MobileHeader";
import Footer from "../../components/Footer";
import LoadingOverlay from "../../components/LoadingOverlay";

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
  const [editErrors, setEditErrors] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "admin") {
      navigate("/"); 
    }
  } catch (err) {
    navigate("/login");
  }
}, []);


  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);


  useEffect(() => {
    if (error) {
      if (error === "Access denied: Admins only") {
        setSnackbarMessage("You do not have permission to view users.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage(error);
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
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

  const validateEditForm = () => {
    const validation = validateUserForm(editForm, { includePassword: false });
    setEditErrors(validation.errors);
    return validation.isValid;
  };

  const handleEditUserSave = async () => {
    if (!validateEditForm()) return;
    try {
      await dispatch(
        updateUser({ userId: editUser._id, userData: editForm })
      ).unwrap();
      setSnackbarMessage("User updated successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setEditUser(null);
      dispatch(getAllUsers()); 
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to update user");
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditUserClose = () => setEditUser(null);
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setOpenDeleteDialog(false);
    try {
      await dispatch(deleteUser(selectedUser)).unwrap();
      setSnackbarMessage("User deleted successfully");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      dispatch(getAllUsers()); 
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to delete user");
      setSnackbarMessage(errorMessage);
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
      <Box sx={{ display: "flex", bgcolor: "#f6f6f6ff" }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1, width: "80%" }}>
          <FixedHeader />
          <MobileHeader />
          <Box sx={{ maxWidth: "100%", mt: 2, mx: 3 }}>
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              mb={2}
            >
              <Button
                startIcon={<PersonAddAltRoundedIcon />}
                onClick={handleAddUserOpen}
                sx={{
                  backgroundColor: "#173A5E !important",
                  color: "white !important",
                  padding: "0.5rem 1rem",
                  marginLeft: "0.5rem",
                  "&:hover": {
                    backgroundColor: "#1E4C80 !important",
                  },
                }}
              >
                Add User
              </Button>
            </Stack>

            {error === "Access denied: Admins only" ? (
              <Alert severity="error">
                You do not have permission to view users.
              </Alert>
            ) : (
              <>
                <LoadingOverlay loading={loading} />
                {error && <Alert severity="error">{error}</Alert>}
                <MainGrid
                  type="user"
                  data={users}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteClick}
                  loading={loading}
                />
              </>
            )}

            {/* Edit User Dialog */}
            <Dialog open={!!editUser} onClose={handleEditUserClose}>
              <DialogTitle
                sx={{
                  textAlign: "center",
                  backgroundColor: "#173A5E",
                  padding: "22px 20px 24px 20px",
                  position: "relative",
                  marginBottom: "10px",
                  height: "25px",
                  color: "#fff",
                }}
              >
                Edit User
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <FormLabel
                  sx={{
                    color: "#656D9A",
                    pb: 0,
                    fontSize: 13,
                    fontWeight: "bold",
                  }}
                >
                  Full Name
                </FormLabel>
                <TextField
                  margin="dense"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.fullName}
                  helperText={editErrors.fullName}
                  sx={{ mb: 2 }}
                />
                <FormLabel
                  sx={{
                    color: "#656D9A",
                    pb: 0,
                    fontSize: 13,
                    fontWeight: "bold",
                  }}
                >
                  Email
                </FormLabel>
                <TextField
                  margin="dense"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  fullWidth
                  error={!!editErrors.email}
                  helperText={editErrors.email}
                  sx={{ mb: 2 }}
                />
                <FormLabel
                  sx={{
                    color: "#656D9A",
                    pb: 0,
                    fontSize: 13,
                    fontWeight: "bold",
                  }}
                >
                  Role
                </FormLabel>
                <TextField
                  margin="dense"
                  name="role"
                  value={editForm.role}
                  onChange={handleEditFormChange}
                  select
                  fullWidth
                  error={!!editErrors.role}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
                {editErrors.role && (
                  <Typography color="error" variant="caption">
                    {editErrors.role}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleEditUserClose}>Cancel</Button>
                <Button
                  onClick={handleEditUserSave}
                  sx={{
                    background: "#CBA246",
                    color: "white",
                    fontSize: "13px",
                    padding: "10px",
                    height: "37px",
                    borderRadius: "6px",
                    textTransform: "none",
                    "&:hover": {
                      background: "#B28E3D",
                      color: "white",
                    },
                  }}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={openDeleteDialog}
              onClose={() => setOpenDeleteDialog(false)}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  padding: 2,
                  width: "90%",
                  maxWidth: 420,
                },
              }}
            >
              <DialogTitle className="dialogBox">Confirm Deletion</DialogTitle>
              <DialogContent>
                <DialogContentText className="dialogTitle">
                  Are you sure you want to delete{" "}
                  <strong>{selectedUser?.fullName}</strong>?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    width: "100%",
                    justifyContent: "center",
                    paddingBottom: 2,
                  }}
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

            <AddUser
              open={openAddUser}
              onClose={handleAddUserClose}
              onSuccess={(newUser) => {
                setSnackbarMessage("User added successfully");
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                dispatch(getAllUsers());
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
                sx={{
                  border: "none",
                  boxShadow: "none",
                  width: "100%",
                  bgcolor:
                    snackbarMessage === `User deleted successfully`
                      ? "#fde8e4"
                      : undefined,

                  "& .MuiAlert-icon": {
                    color:
                      snackbarMessage === `User deleted successfully`
                        ? "#cc563d"
                        : undefined,
                  },

                  "& .MuiAlert-message": {
                    color:
                      snackbarMessage === `User deleted successfully`
                        ? "#cc563d"
                        : undefined,
                  },
                  "& .MuiAlert-action": {
                    display: "flex",
                    alignItems: "center",
                    paddingTop: 0,
                    paddingBottom: 0,
                  },
                }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
            <Box sx={{ mb: "40px" }}>
              <Footer />
            </Box>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
