// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   FormLabel,
//   FormControl,
//   TextField,
//   Typography,
//   Stack,
//   Select,
//   MenuItem,
//   Card as MuiCard,
//   Snackbar,
//   Alert as MuiAlert,
//   Dialog,
//   DialogTitle,
//   CircularProgress,
// } from "@mui/material";
// import { styled } from "@mui/material/styles";
// import CloseIcon from "@mui/icons-material/Close";
// import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import InputAdornment from "@mui/material/InputAdornment";
// import IconButton from "@mui/material/IconButton";
// import axios from "axios";
// import { API_URL } from "../../redux/API";
// import { useDispatch } from "react-redux";
// import { addUser ,getAllUsers} from "../../redux/reducer/loginSlice";

// const Header = styled(Box)(({ theme }) => ({
//   textAlign: 'center',
//   backgroundColor: '#739ACE',
//   padding: '22px 20px 24px 20px',
//   position: 'relative',
//   marginBottom: '10px',
//   height: '75px',
// }));

// const StyledButton = styled(Button)(({ theme }) => ({
//   background: "#CBA246",
//   color: "white",
//   fontSize: "13px",
//   padding: "10px",
//   height: "37px",
//   borderRadius: "6px",
//   textTransform: "none",
//   "&:hover": {
//     background: "#B28E3D",
//     color: "white",
//   },
// }));

// function AddUser({ open = false, onClose }) {
//   const [form, setForm] = useState({
//     fullName: "",
//     nickName: "",
//     email: "",
//     role: "admin",
//   });
//   const [openSnackbar, setOpenSnackbar] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState("success");

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   // Validation function
//   const validate = () => {
//     const newErrors = {};
//     if (!form.fullName || form.fullName.trim().length < 3) {
//       newErrors.fullName = "Full name is required (min 3 characters)";
//     }
//     if (!form.email) {
//       newErrors.email = "Email is required";
//     } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
//       newErrors.email = "Invalid email address";
//     }

//     if (!form.role || !["admin", "editor", "contributor"].includes(form.role)) {
//       newErrors.role = "Role is required";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     setLoading(true);

//     try {
//       await dispatch(addUser(form)).unwrap();

//       setSnackbarMessage("Invite sent successfully!");
//       setSnackbarSeverity("success");
//       setOpenSnackbar(true);
//       dispatch(getAllUsers());

//       if (onClose) onClose();
//     } catch (error) {
//       let message = "Failed to send invite. Please try again.";
//       if (typeof error === "string") {
//         message = error;
//       } else if (error && error.message) {
//         message = error.message;
//       } else if (error && error.data && error.data.message) {
//         message = error.data.message;
//       }
//       setSnackbarMessage(message);
//       setSnackbarSeverity("error");
//       setOpenSnackbar(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSnackbarClose = (event, reason) => {
//     if (reason === "clickaway") return;
//     setOpenSnackbar(false);
//   };

//   return (
//     <>
//       <Snackbar
//         open={openSnackbar}
//         autoHideDuration={4000}
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <MuiAlert
//           onClose={handleSnackbarClose}
//           severity={snackbarSeverity}
//           sx={{
//             width: "100%",
//             backgroundColor:
//               snackbarSeverity === "success" ? "#90EE90" : undefined,
//             color: "#000",
//           }}
//           elevation={6}
//           variant="filled"
//         >
//           {snackbarMessage}
//         </MuiAlert>
//       </Snackbar>
//       <Dialog
//         open={open}
//         onClose={onClose}
//         maxWidth="xs"
//         fullWidth
//         scroll="body"
//       >
//         <DialogTitle sx={{ p: 0,  position: 'relative' }}>
//           <Header sx={{bgcolor:'#173A5E'}}>
//             <PersonAddAltRoundedIcon sx={{ fontSize: 30, color: 'white', }} />
//             <Typography variant="h6" fontWeight="400" color="white" fontSize={18}>
//               Add New User
//             </Typography>
//             <Typography
//               variant="body1"
//               color="white"
//               fontWeight={300}
//               sx={{ mb: 1, fontSize: 15 }}
//             >
//               Fill in the details below
//             </Typography>
//             <IconButton
//       aria-label="close"
//       onClick={onClose}
//       size="small"
//       sx={{
//         position: 'absolute',
//         top: 8,
//         right: 8,
//         color: 'white',
//         "&:hover":{
//           bgcolor:'#173A5E'
//         }
//       }}
//     >
//       <CloseIcon fontSize="small"/>
//     </IconButton>
//           </Header>
//         </DialogTitle>
//         <Box
//           component="form"
//           noValidate
//           onSubmit={handleSubmit}
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 2,
//             paddingX: 3,
//             pt: 2,
//             pb: 3,
//             bgcolor:'#f6f6f6ff'
//           }}
//         >
//           <FormControl>
//             <FormLabel sx={{ color: '#656D9A', pb: 0, fontSize: 13, fontWeight: 'bold' }}>Full Name</FormLabel>
//             <TextField
//               name="fullName"
//               placeholder="Enter full name"
//               value={form.fullName}
//               onChange={handleChange}
//               required
//               fullWidth
//               variant="outlined"
//               error={!!errors.fullName}
//               helperText={errors.fullName}
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "6px",
//                   height: "37px",
//                   overflow: "hidden",
//                   "& .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "#bdbdbd",
//                   },
//                   "&:hover .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "gray !important",
//                   },
//                   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "#CC9A3A !important",
//                   },
//                 },
//               }}
//             />
//           </FormControl>
//           <FormControl>
//             <FormLabel sx={{ color: '#656D9A', pb: 0, fontSize: 13, fontWeight: 'bold' }}>Nick Name</FormLabel>
//             <TextField
//               name="nickName"
//               placeholder="Enter nick name"
//               value={form.nickName}
//               onChange={handleChange}
//               fullWidth
//               variant="outlined"
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "6px",
//                   height: "37px",
//                   overflow: "hidden",
//                   "& .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "#bdbdbd",
//                   },
//                   "&:hover .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "gray !important",
//                   },
//                   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "#CC9A3A !important",
//                   },
//                 },
//               }}
//             />
//           </FormControl>
//           <FormControl>
//             <FormLabel sx={{ color: '#656D9A', pb: 0, fontSize: 13, fontWeight: 'bold' }}>Email</FormLabel>
//             <TextField
//               name="email"
//               type="email"
//               placeholder="Enter email address"
//               value={form.email}
//               onChange={handleChange}
//               required
//               fullWidth
//               variant="outlined"
//               error={!!errors.email}
//               helperText={errors.email}
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "6px",
//                   height: "37px",
//                   overflow: "hidden",
//                   "& .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "#bdbdbd",
//                   },
//                   "&:hover .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "gray !important",
//                   },
//                   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                     borderColor: "#CC9A3A !important",
//                   },
//                 },
//               }}
//             />
//           </FormControl>
//           <FormControl>

//           </FormControl>
//           <FormControl>
//             <FormLabel sx={{ color: '#656D9A', pb: 0, fontSize: 13, fontWeight: 'bold' }}>Role</FormLabel>
//             <Select
//               name="role"
//               value={form.role}
//               onChange={handleChange}
//               required
//               fullWidth
//               variant="outlined"
//               error={!!errors.role}
//               sx={{
//                 borderRadius: "6px",
//                 height: "37px",
//                 "& .MuiOutlinedInput-notchedOutline": {
//                   borderColor: "#bdbdbd",
//                 },
//                 "&:hover .MuiOutlinedInput-notchedOutline": {
//                   borderColor: "gray !important",
//                 },
//                 "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                   borderColor: "#CC9A3A !important",
//                 },
//               }}
//             >
//               <MenuItem value="admin">Admin</MenuItem>
//               <MenuItem value="editor">Editor</MenuItem>
//               <MenuItem value="contributor">Contributor</MenuItem>
//             </Select>
//             {errors.role && (
//               <Typography color="error" variant="caption">{errors.role}</Typography>
//             )}
//           </FormControl>
//           <StyledButton
//             type="submit"
//             fullWidth
//             endIcon={<PersonAddAltRoundedIcon />}
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={20} color="inherit" /> : "Add User"}
//           </StyledButton>
//         </Box>
//       </Dialog>
//     </>
//   );
// }

// export default AddUser;
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { useDispatch } from "react-redux";
import { addUser, getAllUsers } from "../../redux/reducer/loginSlice";

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
    role: "admin",
  });
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
      setSnackbarMessage("Invite sent successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      dispatch(getAllUsers());
      if (onClose) onClose();
    } catch (error) {
      let message = "Failed to send invite. Please try again.";
      if (typeof error === "string") {
        message = error;
      } else if (error && error.message) {
        message = error.message;
      } else if (error && error.data && error.data.message) {
        message = error.data.message;
      }
      setSnackbarMessage(message);
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
