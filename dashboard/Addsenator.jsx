import * as React from "react";
import { useRef } from "react";
import { alpha, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SideMenu from "./components/SideMenu";
import AppTheme from "/shared-theme/AppTheme";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Editor } from "@tinymce/tinymce-react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import Switch from "@mui/material/Switch";
import Copyright from "./internals/components/Copyright";

export default function AddSenator(props) {
	const [age, setAge] = React.useState("");
	const editorRef = useRef(null);
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

	const handleChange = (event) => {
		setAge(event.target.value);
	};

	const label = { inputProps: { "aria-label": "Color switch demo" } };

	return (
		<AppTheme>
			<Box sx={{ display: "flex" }}>
				<SideMenu />
				<Box
					component="main"
					sx={(theme) => ({
						flexGrow: 1,
						backgroundColor: theme.vars ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)` : alpha(theme.palette.background.default, 1),
						overflow: "auto",
					})}
				>
					<Stack
						spacing={2}
						sx={{
							alignItems: "center",
							mx: 3,
							pb: 5,
							mt: { xs: 8, md: 0 },
						}}
					>
						{/* <Header /> */}
						<Typography
							variant="h4"
							align="center"
							sx={[
								{
									paddingTop: "50px",
									color: "text.secondary",
								},
							]}
						>
							SBA Scorecard Management System
						</Typography>
						

						<Stack
							
							direction="row"
							spacing={2}
							width="100%"
							sx={{
								justifyContent: "flex-end",
								alignItems: "center",
							}}
						>
							<Button variant="contained">Save</Button>
							<Button variant="outlined">Fetch Senetors from Quorum</Button>
						</Stack>

						<Paper elevation={2} sx={{ width: "100%" }}>
							<Box sx={{ p: 5 }}>
								<Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
									Senator's Information
								</Typography>
								<Grid container rowSpacing={2} columnSpacing={2} alignItems={"center"}>
									<Grid size={2}>
										<InputLabel
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											Senator's Name
										</InputLabel>
									</Grid>
									<Grid size={4}>
										<TextField required id="title" name="title" fullWidth size="small" autoComplete="off" variant="outlined" />
									</Grid>
									<Grid size={1}>
										<InputLabel
											sx={{
												display: "flex",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											Status
										</InputLabel>
									</Grid>
									<Grid size={5}>
										<ButtonGroup variant="outlined" aria-label="Basic button group">
											<Button>Active</Button>
											<Button>Former</Button>
										</ButtonGroup>
									</Grid>
									<Grid size={2}>
										<InputLabel
											sx={{
												display: "flex",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											State
										</InputLabel>
									</Grid>
									<Grid size={4}>
										<FormControl fullWidth>
											<Select value={age} sx={{ background: "#fff" }}>
												<MenuItem value={10}>New York</MenuItem>
												<MenuItem value={20}>Chicago</MenuItem>
												<MenuItem value={30}>NC</MenuItem>
											</Select>
										</FormControl>
									</Grid>
									<Grid size={1} sx={{ alignContent: "center" }}>
										<InputLabel
											sx={{
												display: "flex",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											Party
										</InputLabel>
									</Grid>
									<Grid size={5}>
										<FormControl fullWidth>
											<Select value={age} sx={{ background: "#fff" }}>
												<MenuItem selected value={10}>
													Republican
												</MenuItem>
												<MenuItem value={20}>Democrat</MenuItem>
												<MenuItem value={30}>Independent</MenuItem>
											</Select>
										</FormControl>
									</Grid>

									<Grid size={2}>
										<InputLabel
											sx={{
												display: "flex",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											Senator's Photo
										</InputLabel>
									</Grid>
									<Grid size={10}>
										<Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}>
											Upload files
											<VisuallyHiddenInput type="file" onChange={(event) => console.log(event.target.files)} multiple />
										</Button>
									</Grid>
								</Grid>
							</Box>
						</Paper>

						<div className="spacer"></div>

						<Paper elevation={2} sx={{ width: "100%", marginBottom: "50px" }}>
							<Box sx={{ padding: 5 }}>
								<Typography variant="h6" gutterBottom sx={{ paddingBottom: 3 }}>
									Senator's Term Information
								</Typography>
								<Grid container rowSpacing={2} columnSpacing={2} alignItems={"center"}>
									

									<Grid size={2}>
										<InputLabel
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											Term
										</InputLabel>
									</Grid>
									<Grid size={4}>
										<FormControl fullWidth>
											<Select value={age} sx={{ background: "#fff" }}>
												<MenuItem value={10}>New York</MenuItem>
												<MenuItem value={20}>Chicago</MenuItem>
												<MenuItem value={30}>NC</MenuItem>
											</Select>
										</FormControl>
									</Grid>

									<Grid size={1}>
										<InputLabel
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											SBA Rating
										</InputLabel>
									</Grid>
									<Grid size={5}>
										<FormControl fullWidth>
											<Select value={age} sx={{ background: "#fff" }}>
												<MenuItem value={10}>New York</MenuItem>
												<MenuItem value={20}>Chicago</MenuItem>
												<MenuItem value={30}>NC</MenuItem>
											</Select>
										</FormControl>
									</Grid>

									<Grid size={2}>
										<InputLabel
											sx={{
												display: "flex",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											Term Summary
										</InputLabel>
									</Grid>
									<Grid size={10}>
										<Editor
											apiKey="nbxuqfjn2kwm9382tv3bi98nn95itbawmplf1l3x826f16u4"
											onInit={(_evt, editor) => (editorRef.current = editor)}
											initialValue="Test"
											init={{
												height: 250,
												menubar: false,
												plugins: [
													"advlist",
													"autolink",
													"lists",
													"link",
													"image",
													"charmap",
													"preview",
													"anchor",
													"searchreplace",
													"visualblocks",
													"code",
													"fullscreen",
													"insertdatetime",
													"media",
													"table",
													"code",
													"help",
													"wordcount",
												],
												toolbar:
													"undo redo | blocks | " +
													"bold italic forecolor | alignleft aligncenter " +
													"alignright alignjustify | bullist numlist outdent indent | " +
													"removeformat | help",
												content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
											}}
										/>
									</Grid>

									<Grid size={2} sx={{ alignContent: "center" }}>
										<InputLabel
											sx={{
												display: "flex",
												justifyContent: "end",
												fontWeight: 700,
												my: 0,
											}}
										>
											Current Term
										</InputLabel>
									</Grid>
									<Grid size={10}>
										<Switch {...label} color="warning" />
									</Grid>

									{/* Vote Repeater Start */}
									<Grid rowSpacing={2} sx={{ width: "100%" }}>
										<Grid size={12} display="flex" alignItems="center" columnGap={"15px"}>
											<Grid size={2}>
												<InputLabel
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "end",
														fontWeight: 700,
														my: 0,
													}}
												>
													Scored Vote
												</InputLabel>
											</Grid>
											<Grid size={4}>
												<FormControl fullWidth>
													<Select value={age} sx={{ background: "#fff" }}>
														<MenuItem value={10}>New York</MenuItem>
														<MenuItem value={20}>Chicago</MenuItem>
														<MenuItem value={30}>NC</MenuItem>
													</Select>
												</FormControl>
											</Grid>
											<Grid size={5}>
												<FormControl fullWidth>
													<Select value={age} sx={{ background: "#fff" }}>
														<MenuItem value={10}>New York</MenuItem>
														<MenuItem value={20}>Chicago</MenuItem>
														<MenuItem value={30}>NC</MenuItem>
													</Select>
												</FormControl>
											</Grid>
											<Grid size={1}>
												<DeleteForeverIcon />
											</Grid>
										</Grid>
									</Grid>
									{/* Vote Repeater Ends */}

									<Grid size={1}></Grid>
									<Grid size={10} sx={{ textAlign: "right" }}>
										<Button variant="contained" startIcon={<AddIcon />}>
											Add Vote
										</Button>
									</Grid>
									<Grid size={1}></Grid>
									{/* Add Vote Repeater Button Ends */}

									{/* Activity Repeater Start */}
									<Grid rowSpacing={2} sx={{ width: "100%" }}>
										<Grid size={12} display="flex" alignItems="center" columnGap={"15px"}>
											<Grid size={2}>
												<InputLabel
													sx={{
														display: "flex",
														alignItems: "center",
														justifyContent: "end",
														fontWeight: 700,
														my: 0,
													}}
												>
													Tracked Activity
												</InputLabel>
											</Grid>
											<Grid size={4}>
												<FormControl fullWidth>
													<Select value={age} sx={{ background: "#fff" }}>
														<MenuItem value={10}>New York</MenuItem>
														<MenuItem value={20}>Chicago</MenuItem>
														<MenuItem value={30}>NC</MenuItem>
													</Select>
												</FormControl>
											</Grid>
											<Grid size={5}>
												<FormControl fullWidth>
													<Select value={age} sx={{ background: "#fff" }}>
														<MenuItem value={10}>New York</MenuItem>
														<MenuItem value={20}>Chicago</MenuItem>
														<MenuItem value={30}>NC</MenuItem>
													</Select>
												</FormControl>
											</Grid>
											<Grid size={1}>
												<DeleteForeverIcon />
											</Grid>
										</Grid>
									</Grid>
									{/* Activity Repeater Ends */}

									<Grid size={1}></Grid>
									<Grid size={10} sx={{ textAlign: "right" }}>
										<Button variant="contained" startIcon={<AddIcon />}>
											Add Activity
										</Button>
									</Grid>
									<Grid size={1}></Grid>
									{/* Add Activity Repeater Button Ends */}
								</Grid>
							</Box>
						</Paper>
					</Stack>
					<Copyright sx={{ my: 4 }} />
				</Box>
			</Box>
		</AppTheme>
	);
}
