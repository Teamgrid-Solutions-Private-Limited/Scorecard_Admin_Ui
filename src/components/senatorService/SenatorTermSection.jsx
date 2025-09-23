import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import { Editor } from "@tinymce/tinymce-react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import { Autocomplete, TextField } from "@mui/material";
import { rating } from "../../Dashboard/global/common";

export default function SenatorTermSection({
  term,
  termIndex,
  isMobile,
  terms,
  getAvailableTerms,
  getValidTermId,
  handleTermChange,
  handleSwitchChange,
  handleSummaryChange,
  allVotes,
  validateVoteInTermRange,
  handleVoteChange,
  handleRemoveVote,
  handleAddVote,
  allActivities,
  validateActivityInTermRange,
  handleActivityChange,
  handleRemoveActivity,
  handleAddActivity,
  handleRemoveTerm,
  handleAddPastVote,
  handlePastVoteChange,
  handleRemovePastVote,
}) {
  return (
    <Box sx={{ padding: 0 }}>
      <Box className="termData-header">
        <Typography fontSize={"1rem"} fontWeight={500}>
          Senator's Term Information {termIndex + 1}
        </Typography>
        {termIndex > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={() => handleRemoveTerm(termIndex)}
         
          >
            Remove Term
          </Button>
        )}
      </Box>

      <Grid
        container
        rowSpacing={2}
        columnSpacing={2}
        alignItems={"center"}
        py={3}
      >
        <Grid size={isMobile ? 4 : 2}>
          <InputLabel className="label">Term</InputLabel>
        </Grid>
        <Grid size={isMobile ? 6 : 2.2}>
          <FormControl fullWidth>
            <Select
              value={getValidTermId(term.termId?._id || term.termId || "")}
              id="term"
              name="termId"
              onChange={(event) => handleTermChange(event, termIndex)}
              sx={{ background: "#fff" }}
            >
              <MenuItem value="" disabled>
                Select an option
              </MenuItem>
              {getAvailableTerms(termIndex).length > 0 ? (
                getAvailableTerms(termIndex).map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No terms available
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={isMobile ? 6 : 2.1} sx={{ alignContent: "center" }}>
          <InputLabel className="label">Current Term</InputLabel>
        </Grid>
        <Grid size={isMobile ? 6 : 0}>
          <Switch
            name="currentTerm"
            checked={term.currentTerm}
            onChange={(e) => handleSwitchChange(e, termIndex)}
            color="warning"
          />
        </Grid>

        <Grid size={isMobile ? 6 : 2.39}>
          <InputLabel className="label">SBA Rating</InputLabel>
        </Grid>
        <Grid size={isMobile ? 4 : 2.2}>
          <FormControl fullWidth>
            <Select
              value={term.rating || ""}
              id="rating"
              name="rating"
              onChange={(event) => handleTermChange(event, termIndex)}
              sx={{ background: "#fff" }}
            >
              <MenuItem value="" disabled>
                Select a rating
              </MenuItem>
              {rating.map((rate, index) => (
                <MenuItem key={index} value={rate}>
                  {rate}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={isMobile ? 12 : 2}>
          <InputLabel className="label">Term Summary</InputLabel>
        </Grid>
        <Grid className="textField" size={isMobile ? 11 : 9.05}>
          <Editor
            tinymceScriptSrc="/scorecard/admin/tinymce/tinymce.min.js"
            licenseKey="gpl"
            value={term?.summary || ""}
            onEditorChange={(content) =>
              handleSummaryChange(termIndex, content)
            }
            init={{
              base_url: "/scorecard/admin/tinymce",
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
                "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; direction: ltr; }",
              directionality: "ltr",
            }}
          />
        </Grid>

        {term.termId ? (
          <>
            {term.votesScore.map((vote, voteIndex) => (
              <Grid rowSpacing={2} sx={{ width: "100%" }} key={voteIndex}>
                <Grid
                  size={12}
                  display="flex"
                  flexDirection={isMobile? "column":"row"}
                  gap={isMobile ? 1 : 0}
                  alignItems={isMobile ? "flex-start" : "center"}
                  columnGap={"15px"}
                  
                >
                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">
                      Scored Vote {voteIndex + 1}
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 11 : 7.5}>
                    <Autocomplete
                    className="textField"
                      options={allVotes.filter(
                        (v) =>
                          validateVoteInTermRange(v._id, term.termId).isValid
                      )}
                      getOptionLabel={(option) => option.title}
                      value={
                        allVotes.find((v) => v._id === vote.voteId) || null
                      }
                      onChange={(e, newValue) =>
                        handleVoteChange(
                          termIndex,
                          voteIndex,
                          "voteId",
                          newValue?._id || ""
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search bills..."
                          size="small"
                          sx={{
                                      "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        background: "#fff",
                                        cursor: "pointer",
                                        "& input": {
                                          cursor: "pointer",
                                        },
                                        "& fieldset": {
                                          border: "none", // remove border
                                        },
                                      },
                                    }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={isMobile ? 5 : 1.6}>
                    <FormControl fullWidth className="textField">
                      <Select
                        value={vote?.score || ""}
                        onChange={(event) =>
                          handleVoteChange(
                            termIndex,
                            voteIndex,
                            "score",
                            event.target.value
                          )
                        }
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="yea">Yea</MenuItem>
                        <MenuItem value="nay">Nay</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={1}>
                    <DeleteForeverIcon
                    className="paddingLeft"
                      onClick={() => handleRemoveVote(termIndex, voteIndex)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </>
        ) : (
          <Grid rowSpacing={2} sx={{ width: "100%" }}>
            <Grid
              size={12}
              display="flex"
               flexDirection={isMobile ? "column" : "row"}
               alignItems={isMobile ? "flex-start" : "center"}
               gap={isMobile ? 1 : 0}
              columnGap={"15px"}
            >
              <Grid size={isMobile ? 12 : 2}>
                 <InputLabel className="label">
                  Scored Vote 1
                </InputLabel>
              </Grid>
              <Grid size={isMobile ? 11 : 7.5}>
                <Autocomplete
                className="textField"
                  freeSolo
                  disabled
                  options={[]}
                  popupIcon={null}
                  clearIcon={null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select a term first"
                      variant="outlined"
                      fullWidth
                      sx={{
                                      "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        background: "#fff",
                                        cursor: "pointer",
                                        "& input": {
                                          cursor: "pointer",
                                        },
                                        "& fieldset": {
                                          border: "none", // remove border
                                        },
                                      },
                                    }}
                    />
                  )}
                />
              </Grid>
              <Grid size={isMobile ? 5 : 1.6}>
                <FormControl fullWidth className="paddingLeft">
                  <Select value="" sx={{ background: "#fff" }} disabled>
                    <MenuItem value="yea">Yea</MenuItem>
                    <MenuItem value="nay">Nay</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={1}>
                <DeleteForeverIcon className="paddingLeft" sx={{ opacity: 0.5 }} />
              </Grid>
            </Grid>
          </Grid>
        )}

        <Grid size={1}></Grid>
        <Grid size={10} sx={{ textAlign: "right" }}>
          <Button
            variant="outlined"
            className="addVoteActivity-btn"
            startIcon={<AddIcon />}
            onClick={() => handleAddVote(termIndex)}
          >
            Add Vote
          </Button>
        </Grid>
        <Grid size={1}></Grid>
        <Grid size={1}></Grid>

        {term.termId ? (
          <>
            {term.activitiesScore.map((activity, activityIndex) => (
              <Grid rowSpacing={2} sx={{ width: "100%" }} key={activityIndex}>
                <Grid
                  size={12}
                  display="flex"
                  flexDirection={isMobile ? "column" : "row"}
                  alignItems={isMobile ? "flex-start" : "center"}
                  gap={isMobile ? 1 : 0}
                  columnGap={"15px"}
                >
                  <Grid size={isMobile ? 12 : 2}>
                     <InputLabel className="label">
                      Tracked Activity {activityIndex + 1}
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 11 : 7.5}>
                    <Autocomplete
                    className="textField"
                      options={allActivities.filter(
                        (a) =>
                          a.type === "senate" &&
                          validateActivityInTermRange(a._id, term.termId)
                            .isValid
                      )}
                      getOptionLabel={(option) =>
                        option.title || "Untitled Activity"
                      }
                      value={
                        allActivities.find(
                          (a) => a._id === activity.activityId
                        ) || null
                      }
                      onChange={(e, newValue) =>
                        handleActivityChange(
                          termIndex,
                          activityIndex,
                          "activityId",
                          newValue?._id || ""
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search activities..."
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "40px",
                              background: "#fff",
                              cursor: "pointer",
                              "& input": { cursor: "pointer" },
                              "& fieldset": { border: "none" },
                              "&:hover fieldset": { border: "none" },
                              "&.Mui-focused fieldset": { border: "none" },
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={isMobile ? 5 : 1.6}>
                    <FormControl fullWidth className="paddingLeft">
                      <Select
                        value={activity?.score || ""}
                        onChange={(event) =>
                          handleActivityChange(
                            termIndex,
                            activityIndex,
                            "score",
                            event.target.value
                          )
                        }
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="yes">Yea</MenuItem>
                        <MenuItem value="no">Nay</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={1}>
                    <DeleteForeverIcon
                    className="paddingLeft"
                      onClick={() =>
                        handleRemoveActivity(termIndex, activityIndex)
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </>
        ) : (
          <Grid rowSpacing={2} sx={{ width: "100%", mt: 2 }}>
            <Grid
              size={12}
              display="flex"
               flexDirection={isMobile ? "column" : "row"}
               alignItems={isMobile ? "flex-start" : "center"}
               gap={isMobile ? 1 : 0}
              columnGap={"15px"}
            >
              <Grid size={isMobile ? 12 : 2}>
                 <InputLabel className="label">
                  Tracked Activity 1
                </InputLabel>
              </Grid>
              <Grid size={isMobile ? 11 : 7.5}>
                <Autocomplete
                className="textField"
                  freeSolo
                  disabled
                  options={[]}
                  popupIcon={null}
                  clearIcon={null}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select a term first"
                      variant="outlined"
                      fullWidth
                      sx={{
                                      "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                        background: "#fff",
                                        cursor: "pointer",
                                        "& input": {
                                          cursor: "pointer",
                                        },
                                        "& fieldset": {
                                          border: "none", // remove border
                                        },
                                      },
                                    }}
                    />
                  )}
                />
              </Grid>
              <Grid size={isMobile ? 5 : 1.6}>
                <FormControl fullWidth className="paddingLeft">
                  <Select value="" sx={{ background: "#fff" }} disabled>
                    <MenuItem value="yes">Yea</MenuItem>
                    <MenuItem value="no">Nay</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={1}>
                <DeleteForeverIcon sx={{ opacity: 0.5 }} />
              </Grid>
            </Grid>
          </Grid>
        )}

        <Grid size={1}></Grid>
        <Grid size={10} sx={{ textAlign: "right" }}>
          <Button
            variant="outlined"
            className="addVoteActivity-btn"
            startIcon={<AddIcon />}
            onClick={() => handleAddActivity(termIndex)}
          >
            Add Activity
          </Button>
        </Grid>
        <Grid size={1}></Grid>
        <Grid size={1}></Grid>

        {term.termId ? (
          <>
            {(term.pastVotesScore || []).map((vote, voteIndex) => (
              <Grid
                rowSpacing={2}
                sx={{ width: "100%" }}
                key={`past-${voteIndex}`}
              >
                <Grid
                  size={12}
                  display="flex"
                   flexDirection={isMobile ? "column" : "row"}
                   alignItems={isMobile ? "flex-start" : "center"}
                   gap={isMobile ? 1 : 0}
                  columnGap={"15px"}
                >
                  <Grid size={isMobile ? 12 : 2}>
                    <InputLabel className="label">
                      Important Past Vote {voteIndex + 1}
                    </InputLabel>
                  </Grid>
                  <Grid size={isMobile ? 11 : 7.5}>
                    <Autocomplete
                    className="textField"
                      options={allVotes}
                      getOptionLabel={(option) => option.title || ""}
                      value={
                        allVotes.find((v) => v._id === vote.voteId) || null
                      }
                      onChange={(e, newValue) =>
                        handlePastVoteChange(
                          termIndex,
                          voteIndex,
                          "voteId",
                          newValue?._id || ""
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Search past votes..."
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "40px",
                              background: "#fff",
                              cursor: "pointer",
                              "& input": { cursor: "pointer" },
                              "& fieldset": { border: "none" },
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={isMobile ? 5 : 1.6}>
                    <FormControl fullWidth className="paddingLeft">
                      <Select
                        value={vote?.score || ""}
                        onChange={(event) =>
                          handlePastVoteChange(
                            termIndex,
                            voteIndex,
                            "score",
                            event.target.value
                          )
                        }
                        sx={{ background: "#fff" }}
                      >
                        <MenuItem value="yea">Yea</MenuItem>
                        <MenuItem value="nay">Nay</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={1}>
                    <DeleteForeverIcon
                    className="paddingLeft"
                      onClick={() => handleRemovePastVote(termIndex, voteIndex)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </>
        ) : (
          <Grid rowSpacing={2} sx={{ width: "100%", mt: 2 }}>
            <Grid
              size={12}
              display="flex"
              flexDirection={isMobile ? "column" : "row"}
            alignItems={isMobile ? "flex-start" : "center"}
            gap={isMobile ? 1 : 0}
              columnGap={"15px"}
            >
              <Grid size={isMobile ? 12 : 2}>
                <InputLabel
                  className="label"
                >
                  Important Past Vote 1
                </InputLabel>
              </Grid>
              <Grid size={isMobile ? 11 : 7.5}>
                <Autocomplete
                            className="textField"
                              freeSolo
                              disabled
                              options={[]}
                              popupIcon={null}
                              clearIcon={null}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  background: "#fff",
                                },
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Select a term first"
                                  variant="outlined"
                                  fullWidth
                                  sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "40px",
                              background: "#fff",
                              cursor: "pointer",
                              "& input": { cursor: "pointer" },
                              "& fieldset": { border: "none" },
                            },
                          }}
                                />
                              )}
                            />
              </Grid>
              <Grid size={isMobile ? 5 : 1.6}>
                <FormControl fullWidth className="paddingLeft">
                  <Select value="" sx={{ background: "#fff" }} disabled>
                    <MenuItem value="yes">Yea</MenuItem>
                    <MenuItem value="no">Nay</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={1}>
                <DeleteForeverIcon className="paddingLeft" sx={{ opacity: 0.5 }} />
              </Grid>
            </Grid>
          </Grid>
        )}

        <Grid size={1}></Grid>
        <Grid size={10} sx={{ textAlign: "right" }}>
          <Button
            variant="outlined"
            className="addVoteActivity-btn"
            startIcon={<AddIcon />}
            onClick={() => handleAddPastVote(termIndex)}
          >
            Add Past Vote
          </Button>
        </Grid>
        <Grid size={1}></Grid>
      </Grid>
    </Box>
  );
}
