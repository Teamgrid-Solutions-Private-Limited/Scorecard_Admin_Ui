import React, { useState } from "react";
import {
  Box,
  Button,
  FormLabel,
  FormControl,
  TextField,
  Typography,
  Select,
  MenuItem,
  Snackbar,
  Alert as MuiAlert,
  Dialog,
  DialogTitle,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch } from "react-redux";
import { addUser, getAllUsers } from "../../redux/reducer/loginSlice";
import { getErrorMessage } from "../../utils/errorHandler";

const Header = styled(Box)(() => ({
  textAlign: "center",
  backgroundColor: "#739ACE",
  padding: "22px 20px 24px 20px",
  position: "relative",
  marginBottom: "10px",
  height: "75px",
}));

const StyledButton = styled(Button)(() => ({
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
}));

function AddUser({ open = false, onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    nickName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName || form.fullName.trim().length < 3) {
      newErrors.fullName = "Full name is required (min 3 characters)";
    }
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!form.role || !["admin", "editor", "contributor"].includes(form.role)) {
      newErrors.role = "Role is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await dispatch(addUser(form)).unwrap();
      setSnackbarMessage("User created successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      dispatch(getAllUsers());
      if (onClose) onClose();
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to create user. Please try again.");
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  return (
    <>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          className={`snackbar-alert ${
            snackbarSeverity === "success" ? "snackbar-success" : ""
          }`}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        scroll="body"
      >
        <DialogTitle className="dialog-title">
          <Header className="dialog-header">
            <PersonAddAltRoundedIcon sx={{ fontSize: 30, color: "white" }} />
            <Typography variant="h6" className="dialog-title-text">
              Add New User
            </Typography>
            <Typography variant="body1" className="dialog-subtitle">
              Fill in the details below
            </Typography>
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
              className="dialog-close-btn"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Header>
        </DialogTitle>

        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit}
          className="form-container"
        >
          <FormControl>
            <FormLabel className="form-label">Full Name</FormLabel>
            <TextField
              name="fullName"
              placeholder="Enter full name"
              value={form.fullName}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.fullName}
              helperText={errors.fullName}
              className="form-input"
            />
          </FormControl>

          <FormControl>
            <FormLabel className="form-label">Nick Name</FormLabel>
            <TextField
              name="nickName"
              placeholder="Enter nick name"
              value={form.nickName}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="form-input"
            />
          </FormControl>

          <FormControl>
            <FormLabel className="form-label">Email</FormLabel>
            <TextField
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email}
              className="form-input"
            />
          </FormControl>
          <FormControl>
            <FormLabel className="form-label">Password</FormLabel>
            <TextField
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password}
              className="form-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel className="form-label">Confirm Password</FormLabel>
            <TextField
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              className="form-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel className="form-label">Role</FormLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              error={!!errors.role}
              className="form-input"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="contributor">Contributor</MenuItem>
            </Select>
            {errors.role && (
              <Typography color="error" variant="caption">
                {errors.role}
              </Typography>
            )}
          </FormControl>

          <StyledButton
            type="submit"
            fullWidth
            endIcon={<PersonAddAltRoundedIcon />}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Add User"
            )}
          </StyledButton>
        </Box>
      </Dialog>
    </>
  );
}

export default AddUser;
