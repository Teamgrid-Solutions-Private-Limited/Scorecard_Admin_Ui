import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteSenator,
  getAllSenators,
  updateSenatorStatus,
} from "../redux/reducer/senatorSlice";
import {
  getAllSenatorData,
  getSenatorDataBySenatorId,
  updateSenatorData,
  bulkPublishSenators,
} from "../redux/reducer/senatorTermSlice";

import { getErrorMessage } from "../utils/errorHandler";
import {
  Box,
  Stack,
  Typography,
  Button,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  IconButton,
  ClickAwayListener,
  Badge,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { useNavigate } from "react-router-dom";
import AppTheme from "../shared-theme/AppTheme";
import SideMenu from "../components/SideMenu";
import MainGrid from "../components/MainGrid";
import axios from "axios";
import { API_URL } from "../redux/API";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "../Themes/customizations";
import FixedHeader from "../components/FixedHeader";
import FilterListIcon from "@mui/icons-material/FilterList";
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};
import { getAllTerms } from "../redux/reducer/termSlice";
import { jwtDecode } from "jwt-decode";
import MobileHeader from "../components/MobileHeader";
import LoadingOverlay from "../components/LoadingOverlay";
import { getToken } from "../utils/auth";
import { useSnackbar } from "../hooks";
import { SmsFailed } from "@mui/icons-material";

export default function Senator(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = getToken();
  const { senatorData } = useSelector((state) => state.senatorData);
  const {
    senators = [],
    loading,
    error,
  } = useSelector((state) => state.senator || {});

  const [progress, setProgress] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    open: snackbarOpen,
    message: snackbarMessage,
    severity: snackbarSeverity,
    showSnackbar,
    hideSnackbar,
  } = useSnackbar();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSenator, setSelectedSenator] = useState(null);
  const { terms } = useSelector((state) => state.term);
  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;
  const [openFetchDialog, setOpenFetchDialog] = useState(false);
  const [fetchType, setFetchType] = useState("active");
  const [partyFilter, setPartyFilter] = useState([]);
  const [stateFilter, setStateFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [hasPastVotesFilter, setHasPastVotesFilter] = useState(false);
  const [mergedSenators, setMergedSenators] = useState([]);
  const [termFilter, setTermFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [selectedYears, setSelectedYears] = useState([]);
  const [searchTerms, setSearchTerms] = useState({
    party: "",
    state: "",
    rating: "",
    year: "",
  });
  const [currentOrFormerFilter, setCurrentOrFormerFilter] = useState("current");

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
    if (!filterOpen) {
      setExpandedFilter(null);
    }
  };

  const toggleFilterSection = (section) => {
    setExpandedFilter(expandedFilter === section ? null : section);
  };
  const handleSearchChange = (filterType, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [filterType]: value.toLowerCase(),
    }));
  };

  const ratingOptions = ["A+", "B", "C", "D", "F"];
  const statusOptions = ["published", "draft"];

  useEffect(() => {
    dispatch(getAllSenators());
    dispatch(getAllSenatorData());
    dispatch(getAllTerms());
  }, [dispatch]);

  useEffect(() => {
    if (senatorData && senators && terms) {
      const senatorDataBySenateId = {};
      senatorData.forEach((data) => {
        if (!senatorDataBySenateId[data.senateId]) {
          senatorDataBySenateId[data.senateId] = [];
        }
        senatorDataBySenateId[data.senateId].push(data);
      });

      const merged = senators.map((senator) => {
        const dataEntries = senatorDataBySenateId[senator._id] || [];

        const hasPastVotesData = dataEntries.some(
          (data) => data.pastVotesScore && data.pastVotesScore.length > 0
        );

        const allRatings = dataEntries
          .map((data) => data.rating)
          .filter((rating) => rating && rating !== "N/A");

        const displayRating =
          allRatings.length > 0 ? allRatings[allRatings.length - 1] : "N/A";

        const senatorTerms = dataEntries.map((data) => {
          const termObj = terms.find((t) => t._id === data.termId);
          return {
            termId: data.termId,
            termName: termObj ? termObj.name : "",
            currentTerm: data.currentTerm,
            rating: data.rating,
            votesScore: data.votesScore,
            pastVotesScore: data.pastVotesScore,
          };
        });

        const hasCurrentTerm = dataEntries.some(
          (data) => data.currentTerm === true
        );

        return {
          ...senator,
          rating: displayRating,
          allDataEntries: dataEntries,
          allTerms: senatorTerms,
          hasPastVotesData: hasPastVotesData,
          hasCurrentTerm: hasCurrentTerm,
          termId:
            dataEntries.length > 0 ? dataEntries[0].termId : senator.termId,
          votesScore: dataEntries.length > 0 ? dataEntries[0].votesScore : [],
          pastVotesScore:
            dataEntries.length > 0 ? dataEntries[0].pastVotesScore : [],
          currentTerm: hasCurrentTerm,
        };
      });
      setMergedSenators(merged);
    }
  }, [senators, senatorData, terms]);
const findTermForDate = (terms = [], date) => {
  if (!date) return null;

  const targetDate = new Date(date);

  return terms.find((t) => {
    const start = new Date(t.termId?.startDate);
    const end = new Date(t.termId?.endDate);
    return targetDate >= start && targetDate <= end;
  });
};

  // const handleBulkApply = async ({ ids = [], payload }) => {
  //   if (!ids || ids.length === 0 || !payload) {
  //     return;
  //   }
  //   if (userRole !== "admin") {
  //     showSnackbar("Bulk edit is for admins only", "error");
  //     return;
  //   }

  //   const { category, itemId, score } = payload;

  //   if (!category || !itemId || !score) {
  //     showSnackbar("Invalid bulk payload", "error");
  //     return;
  //   }

  //   setFetching(true);
  //   let successCount = 0;
  //   try {
  //     for (const sid of ids) {
  //       try {
  //         const termRecords = await dispatch(
  //           getSenatorDataBySenatorId(sid)
  //         ).unwrap();

  //         if (!Array.isArray(termRecords)) {
  //           continue;
  //         }

  //         const updatePromises = [];
  //         termRecords.forEach((term) => {
  // let modified = false;
  // const newTerm = { ...term };

  // if (category === "vote") {
  //   const votes = [...(newTerm.votesScore || [])];
  //   const itemIdStr = itemId.toString();

  //   const index = votes.findIndex((v) => {
  //     const vid = v.voteId?._id || v.voteId;
  //     return vid?.toString() === itemIdStr;
  //   });

  //   if (index > -1) {
  //     // ✅ UPDATE existing vote
  //     votes[index] = { ...votes[index], score };
  //   } else {
  //     // ✅ INSERT new vote
  //     votes.push({
  //       voteId: itemId,
  //       score,
  //     });
  //   }

  //   newTerm.votesScore = votes;
  //   modified = true;
  // }

  // if (category === "activity") {
  //   const acts = [...(newTerm.activitiesScore || [])];
  //   const itemIdStr = itemId.toString();

  //   const index = acts.findIndex((a) => {
  //     const aid = a.activityId?._id || a.activityId;
  //     return aid?.toString() === itemIdStr;
  //   });

  //   if (index > -1) {
  //     // ✅ UPDATE existing activity
  //     acts[index] = { ...acts[index], score };
  //   } else {
  //     // ✅ INSERT new activity
  //     acts.push({
  //       activityId: itemId,
  //       score,
  //     });
  //   }

  //   newTerm.activitiesScore = acts;
  //   modified = true;
  // }

  // if (modified) {
  //   const payloadData = {
  //     ...newTerm,
  //     votesScore: newTerm.votesScore?.map((v) => ({
  //       voteId: v.voteId?._id || v.voteId,
  //       score: v.score,
  //     })),
  //     activitiesScore: newTerm.activitiesScore?.map((a) => ({
  //       activityId: a.activityId?._id || a.activityId,
  //       score: a.score,
  //     })),
  //   };

  //   updatePromises.push(
  //     dispatch(updateSenatorData({ id: term._id, data: payloadData })).unwrap()
  //                 .then((result) => {
  //                   return result;
  //                 })
  //                 .catch((error) => {
  //                   console.error(
  //                     `❌ updateSenatorData error for term ${term._id}:`,
  //                     error
  //                   );
  //                   throw error;
  //                 })
  //             );
  //           } else {
  //             console.log(
  //               `⏭️ Term ${term._id} not modified - no matching ${category} found`
  //             );
  //           }
  //         });

  //         if (updatePromises.length > 0) {
  //           await Promise.all(updatePromises);
  //           successCount += 1;
  //           console.log(`✅ Successfully updated senator ${sid}`);
  //         } else {
  //           console.log(`⚠️ No updates needed for senator ${sid}`);
  //         }
  //       } catch (err) {
  //         console.error(`❌ Bulk update error for senator ${sid}:`, {
  //           error: err,
  //           errorMessage: err?.message,
  //           errorStack: err?.stack,
  //           fullError: err,
  //         });
  //       }
  //     }

  //     await dispatch(getAllSenatorData());
  //     await dispatch(getAllSenators());
  //     console.log(
  //       `✅ Bulk edit completed. Success count: ${successCount}/${ids.length}`
  //     );
  //     showSnackbar(`Bulk edit applied for ${successCount} members.`, "success");
  //   } catch (err) {
  //     console.error("❌ Bulk apply failed:", {
  //       error: err,
  //       errorMessage: err?.message,
  //       errorStack: err?.stack,
  //       fullError: err,
  //     });
  //     showSnackbar("Bulk apply failed. See console for details.", "error");
  //   } finally {
  //     setFetching(false);
  //   }
  // };
const handleBulkApply = async ({ ids = [], payload }) => {
  if (!ids.length || !payload) return;

  if (userRole !== "admin") {
    showSnackbar("Bulk edit is for admins only", "error");
    return;
  }

  const { category, itemId, score, voteDate, activityDate } = payload;
  if (!category || !itemId || !score) {
    showSnackbar("Invalid bulk payload", "error");
    return;
  }

  setFetching(true);
  let successCount = 0;

  try {
    for (const sid of ids) {
      try {
        const termRecords = await dispatch(
          getSenatorDataBySenatorId(sid)
        ).unwrap();

        termRecords?.forEach((tr) => {
          // Handle termId being either an object or string
          const termId = typeof tr.termId === 'object' ? tr.termId._id : tr.termId;
          const termName = typeof tr.termId === 'object' 
            ? tr.termId.name 
            : terms?.find((t) => t._id === termId)?.name || termId;
        });

        if (!Array.isArray(termRecords) || termRecords.length === 0) continue;

        let foundExisting = false;
        let targetTerm = null;

        // 1️⃣ FIRST PASS → check if vote/activity exists anywhere
        for (const term of termRecords) {
          if (category === "vote") {
            // 🔍 1. Check votesScore
            const voteMatch = term.votesScore?.find(
              (v) =>
                (v.voteId?._id || v.voteId)?.toString() === itemId.toString()
            );

            if (voteMatch) {
              foundExisting = true;
              const termId = typeof term.termId === 'object' ? term.termId._id : term.termId;
              const termName = typeof term.termId === 'object' 
                ? term.termId.name 
                : terms?.find((t) => t._id === termId)?.name || termId;

              if (voteMatch.score !== score) {
                const updatedVotes = term.votesScore.map((v) =>
                  (v.voteId?._id || v.voteId)?.toString() === itemId.toString()
                    ? { ...v, score }
                    : v
                );

                await dispatch(
                  updateSenatorData({
                    id: term._id,
                    data: {
                      ...term,
                      votesScore: updatedVotes.map((v) => ({
                        voteId: v.voteId?._id || v.voteId,
                        score: v.score,
                      })),
                    },
                  })
                ).unwrap();
              }
              break;
            }

            // 🔍 2. Check pastVotesScore
            const pastVoteMatch = term.pastVotesScore?.find(
              (v) =>
                (v.voteId?._id || v.voteId)?.toString() === itemId.toString()
            );

            if (pastVoteMatch) {
              foundExisting = true;
              const termId = typeof term.termId === 'object' ? term.termId._id : term.termId;
              const termName = typeof term.termId === 'object' 
                ? term.termId.name 
                : terms?.find((t) => t._id === termId)?.name || termId;

              if (pastVoteMatch.score !== score) {
                const updatedPastVotes = term.pastVotesScore.map((v) =>
                  (v.voteId?._id || v.voteId)?.toString() === itemId.toString()
                    ? { ...v, score }
                    : v
                );

                await dispatch(
                  updateSenatorData({
                    id: term._id,
                    data: {
                      ...term,
                      pastVotesScore: updatedPastVotes.map((v) => ({
                        voteId: v.voteId?._id || v.voteId,
                        score: v.score,
                      })),
                    },
                  })
                ).unwrap();
              }
              break;
            }
          }

          if (category === "activity") {
            const match = term.activitiesScore?.find(
              (a) =>
                (a.activityId?._id || a.activityId)?.toString() ===
                itemId.toString()
            );

            if (match) {
              foundExisting = true;
              const termId = typeof term.termId === 'object' ? term.termId._id : term.termId;
              const termName = typeof term.termId === 'object' 
                ? term.termId.name 
                : terms?.find((t) => t._id === termId)?.name || termId;

              if (match.score !== score) {
                const updatedActs = term.activitiesScore.map((a) =>
                  (a.activityId?._id || a.activityId)?.toString() ===
                  itemId.toString()
                    ? { ...a, score }
                    : a
                );

                await dispatch(
                  updateSenatorData({
                    id: term._id,
                    data: {
                      ...term,
                      activitiesScore: updatedActs.map((a) => ({
                        activityId: a.activityId?._id || a.activityId,
                        score: a.score,
                      })),
                    },
                  })
                ).unwrap();
                console.log(`   📝 Updated activity score to "${score}"`);
              }
              break;
            }
          }
        }

        // 2️⃣ SECOND PASS → insert only if NOT found
        if (!foundExisting) {
          // Determine the item date based on category
          const itemDate = category === "vote" ? voteDate : activityDate;

          // Find the term this item belongs to based on date
          let matchingTerm = null;
          let isPastVote = false;

          if (itemDate && termRecords && termRecords.length > 0) {
            const itemDateTime = new Date(itemDate);
            // Check if vote is before Jan 2 (when terms start - Jan 3)
            const termStartBoundary = new Date('2019-01-02T23:59:59Z');
            if (itemDateTime <= termStartBoundary && category === "vote") {
              isPastVote = true;
              // Find the oldest term
              const oldestTerm = termRecords.reduce((oldest, current) => {
                const oldestYear = typeof oldest.termId === 'object' ? oldest.termId.startYear : 0;
                const currentYear = typeof current.termId === 'object' ? current.termId.startYear : 0;
                return currentYear < oldestYear ? current : oldest;
              });

              matchingTerm = oldestTerm;
              const termId = typeof matchingTerm.termId === 'object' ? matchingTerm.termId._id : matchingTerm.termId;
              const termName = typeof matchingTerm.termId === 'object' 
                ? matchingTerm.termId.name 
                : terms?.find((t) => t._id === termId)?.name || termId;
            } else {
              // Normal date matching logic
              for (const term of termRecords) {
                // Handle termId being either an object or string
                let termDef = null;
                if (typeof term.termId === 'object' && term.termId._id) {
                  // termId is already an object with term definition
                  termDef = term.termId;
                } else {
                  // termId is a string, look it up
                  termDef = terms?.find((t) => t._id === term.termId);
                }

                if (!termDef) {
                  const termIdDisplay = typeof term.termId === 'object' ? term.termId._id : term.termId;
                  continue;
                }

                const termStart = new Date(
                  `${termDef.startYear}-01-03T00:00:00Z`
                );
                const termEnd = new Date(
                  `${termDef.endYear}-01-02T23:59:59Z`
                );

                if (itemDateTime >= termStart && itemDateTime <= termEnd) {
                  matchingTerm = term;
                  break;
                }
              }
            }
          }

          // Fallback logic if no match found by date
          if (!matchingTerm) {
            matchingTerm = termRecords.find((t) => t.currentTerm);
            if (!matchingTerm) {
              matchingTerm = termRecords[0];
            }
            const termId = typeof matchingTerm.termId === 'object' ? matchingTerm.termId._id : matchingTerm.termId;
            const termName = typeof matchingTerm.termId === 'object' 
              ? matchingTerm.termId.name 
              : terms?.find((t) => t._id === termId)?.name || termId;
          }

          targetTerm = matchingTerm;
          const termId = typeof targetTerm.termId === 'object' ? targetTerm.termId._id : targetTerm.termId;
          const selectedTermName = typeof targetTerm.termId === 'object' 
            ? targetTerm.termId.name 
            : terms?.find((t) => t._id === termId)?.name || termId;

          if (category === "vote") {
            if (isPastVote) {
              // Insert into pastVotesScore
              const pastVotes = [...(targetTerm.pastVotesScore || [])];
              pastVotes.push({ voteId: itemId, score });

              await dispatch(
                updateSenatorData({
                  id: targetTerm._id,
                  data: {
                    ...targetTerm,
                    pastVotesScore: pastVotes.map((v) => ({
                      voteId: v.voteId?._id || v.voteId,
                      score: v.score,
                    })),
                  },
                })
              ).unwrap();
            } else {
              // Insert into votesScore
              const votes = [...(targetTerm.votesScore || [])];
              votes.push({ voteId: itemId, score });

              await dispatch(
                updateSenatorData({
                  id: targetTerm._id,
                  data: {
                    ...targetTerm,
                    votesScore: votes.map((v) => ({
                      voteId: v.voteId?._id || v.voteId,
                      score: v.score,
                    })),
                  },
                })
              ).unwrap();
            }
          }

          if (category === "activity") {
            const acts = [...(targetTerm.activitiesScore || [])];
            acts.push({ activityId: itemId, score });

            await dispatch(
              updateSenatorData({
                id: targetTerm._id,
                data: {
                  ...targetTerm,
                  activitiesScore: acts.map((a) => ({
                    activityId: a.activityId?._id || a.activityId,
                    score: a.score,
                  })),
                },
              })
            ).unwrap();
          }
        }

        successCount++;
      } catch (err) {
        console.error(`❌ Error updating senator ${sid}`, err);
      }
    }

    await dispatch(getAllSenatorData());
    await dispatch(getAllSenators());

    showSnackbar(
      `Bulk select applied for ${successCount}/${ids.length} senator${successCount !== 1 ? "s" : ""}!.`,
      "success"
    );
  } catch (err) {
    console.error("❌ Bulk apply failed", err);
    showSnackbar("Bulk apply failed.", "error");
  } finally {
    setFetching(false);
  }
};

// const handleBulkApply = async ({ ids = [], payload }) => {
//   if (!ids.length || !payload) return;

//   if (userRole !== "admin") {
//     showSnackbar("Bulk edit is for admins only", "error");
//     return;
//   }

//   const { category, itemId, score } = payload;
//   if (!category || !itemId || !score) {
//     showSnackbar("Invalid bulk payload", "error");
//     return;
//   }

//   setFetching(true);

//   let successCount = 0;
//   let errorCount = 0;
//   const errorReasons = new Set();

//   try {
//     for (const sid of ids) {
//       try {
//         const termRecords = await dispatch(
//           getSenatorDataBySenatorId(sid)
//         ).unwrap();

//         if (!Array.isArray(termRecords) || termRecords.length === 0) {
//           throw new Error("No senator data found");
//         }

//         let foundExisting = false;

//         // 🔁 PASS 1 → UPDATE if already exists anywhere
//         for (const term of termRecords) {
//           if (category === "vote") {
//             const match = term.votesScore?.find(
//               (v) =>
//                 (v.voteId?._id || v.voteId)?.toString() ===
//                 itemId.toString()
//             );

//             if (match) {
//               foundExisting = true;

//               if (match.score !== score) {
//                 const updatedVotes = term.votesScore.map((v) =>
//                   (v.voteId?._id || v.voteId)?.toString() ===
//                   itemId.toString()
//                     ? { ...v, score }
//                     : v
//                 );

//                 await dispatch(
//                   updateSenatorData({
//                     id: term._id,
//                     data: {
//                       ...term,
//                       votesScore: updatedVotes.map((v) => ({
//                         voteId: v.voteId?._id || v.voteId,
//                         score: v.score,
//                       })),
//                     },
//                   })
//                 ).unwrap();
//               }
//               break;
//             }
//           }

//           if (category === "activity") {
//             const match = term.activitiesScore?.find(
//               (a) =>
//                 (a.activityId?._id || a.activityId)?.toString() ===
//                 itemId.toString()
//             );

//             if (match) {
//               foundExisting = true;

//               if (match.score !== score) {
//                 const updatedActs = term.activitiesScore.map((a) =>
//                   (a.activityId?._id || a.activityId)?.toString() ===
//                   itemId.toString()
//                     ? { ...a, score }
//                     : a
//                 );

//                 await dispatch(
//                   updateSenatorData({
//                     id: term._id,
//                     data: {
//                       ...term,
//                       activitiesScore: updatedActs.map((a) => ({
//                         activityId: a.activityId?._id || a.activityId,
//                         score: a.score,
//                       })),
//                     },
//                   })
//                 ).unwrap();
//               }
//               break;
//             }
//           }
//         }

//         // ➕ PASS 2 → INSERT if NOT found anywhere
//         if (!foundExisting) {
//           // priority:
//           // 1️⃣ currentTerm
//           // 2️⃣ latest term
//           // 3️⃣ senator doc WITHOUT termId
//           const targetTerm =
//             termRecords.find((t) => t.currentTerm) ||
//             termRecords.find((t) => t.termId) ||
//             termRecords[0];

//           if (!targetTerm) {
//             throw new Error("Term is required");
//           }

//           if (category === "vote") {
//             const votes = [...(targetTerm.votesScore || [])];
//             votes.push({ voteId: itemId, score });

//             await dispatch(
//               updateSenatorData({
//                 id: targetTerm._id,
//                 data: {
//                   ...targetTerm,
//                   votesScore: votes.map((v) => ({
//                     voteId: v.voteId?._id || v.voteId,
//                     score: v.score,
//                   })),
//                 },
//               })
//             ).unwrap();
//           }

//           if (category === "activity") {
//             const acts = [...(targetTerm.activitiesScore || [])];
//             acts.push({ activityId: itemId, score });

//             await dispatch(
//               updateSenatorData({
//                 id: targetTerm._id,
//                 data: {
//                   ...targetTerm,
//                   activitiesScore: acts.map((a) => ({
//                     activityId: a.activityId?._id || a.activityId,
//                     score: a.score,
//                   })),
//                 },
//               })
//             ).unwrap();
//           }
//         }

//         successCount++;
//       } catch (err) {
//         errorCount++;

//         const actualError =
//           err?.response?.data?.message ||
//           err?.message ||
//           "Unknown error";

//         errorReasons.add(actualError);

//         console.error(`❌ Senator ${sid} failed`, actualError);
//       }
//     }

//     await dispatch(getAllSenatorData());
//     await dispatch(getAllSenators());

//     const errorText =
//       errorReasons.size > 0
//         ? `${[...errorReasons].join(", ")}`
//         : "";

//     // ✅ FINAL SNACKBAR LOGIC (FIXED)
//     if (successCount === 0) {
//       showSnackbar(
//         `Bulk edit failed for all ${ids.length} senators. ${errorText}`,
//         "error"
//       );
//     } else if (successCount === ids.length) {
//       showSnackbar(
//         `Bulk edit applied successfully for all ${successCount} senators.`,
//         "success"
//       );
//     } else {
//       showSnackbar(
//         `Bulk edit applied for ${successCount}/${ids.length} senators. ${errorText}`,
//         "warning"
//       );
//     }
//   } catch (err) {
//     console.error("❌ Bulk apply crashed", err);
//     showSnackbar("Bulk apply failed unexpectedly.", "error");
//   } finally {
//     setFetching(false);
//   }
// };
// const handleBulkApply = async ({ ids = [], payload }) => {
//   if (!ids.length || !payload) return;

//   if (userRole !== "admin") {
//     showSnackbar("Bulk edit is for admins only", "error");
//     return;
//   }

//   const { category, itemId, score, voteDate } = payload;
//   if (!category || !itemId || !score) {
//     showSnackbar("Invalid bulk payload", "error");
//     return;
//   }

//   setFetching(true);
//   let successCount = 0;

//   try {
//     // Fetch term ranges once for all senators
//     const allTermsData = await dispatch(getAllTerms()).unwrap();
//     console.log("✅ All terms data:", allTermsData);
    
//     const termRangesMap = {};
//     allTermsData.forEach(term => {
//       termRangesMap[term._id] = {
//         startDate: term.startDate,
//         endDate: term.endDate,
//         termId: term._id,
//         name: term.name || term.title || `Term ${term._id}`
//       };
//     });

//     console.log("✅ Term ranges map:", termRangesMap);

//     for (const sid of ids) {
//       try {
//         console.log(`\n🔍 Processing senator ${sid}`);
//         const termRecords = await dispatch(
//           getSenatorDataBySenatorId(sid)
//         ).unwrap();

//         if (!Array.isArray(termRecords) || termRecords.length === 0) {
//           console.log(`⚠️ No term records found for senator ${sid}`);
//           continue;
//         }

//         console.log(`📊 Found ${termRecords.length} term records for senator ${sid}:`, 
//           termRecords.map(tr => ({
//             termId: tr.termId,
//             currentTerm: tr.currentTerm,
//             termRange: termRangesMap[tr.termId]
//           }))
//         );

//         let foundExisting = false;
//         let targetTerm = null;

//         // 1️⃣ FIRST PASS → check if vote/activity exists anywhere
//         for (const term of termRecords) {
//           if (category === "vote") {
//             // Check votesScore
//             const voteMatch = term.votesScore?.find(
//               (v) =>
//                 (v.voteId?._id || v.voteId)?.toString() === itemId.toString()
//             );

//             if (voteMatch) {
//               foundExisting = true;
//               console.log(`✅ Found existing vote in votesScore for term ${term.termId}`);
//               if (voteMatch.score !== score) {
//                 const updatedVotes = term.votesScore.map((v) =>
//                   (v.voteId?._id || v.voteId)?.toString() === itemId.toString()
//                     ? { ...v, score }
//                     : v
//                 );

//                 await dispatch(
//                   updateSenatorData({
//                     id: term._id,
//                     data: {
//                       ...term,
//                       votesScore: updatedVotes.map((v) => ({
//                         voteId: v.voteId?._id || v.voteId,
//                         score: v.score,
//                       })),
//                     },
//                   })
//                 ).unwrap();
//               }
//               break;
//             }

//             // Check pastVotesScore
//             const pastVoteMatch = term.pastVotesScore?.find(
//               (v) =>
//                 (v.voteId?._id || v.voteId)?.toString() === itemId.toString()
//             );

//             if (pastVoteMatch) {
//               foundExisting = true;
//               console.log(`✅ Found existing vote in pastVotesScore for term ${term.termId}`);
//               if (pastVoteMatch.score !== score) {
//                 const updatedPastVotes = term.pastVotesScore.map((v) =>
//                   (v.voteId?._id || v.voteId)?.toString() === itemId.toString()
//                     ? { ...v, score }
//                     : v
//                 );

//                 await dispatch(
//                   updateSenatorData({
//                     id: term._id,
//                     data: {
//                       ...term,
//                       pastVotesScore: updatedPastVotes.map((v) => ({
//                         voteId: v.voteId?._id || v.voteId,
//                         score: v.score,
//                       })),
//                     },
//                   })
//                 ).unwrap();
//               }
//               break;
//             }
//           }

//           if (category === "activity") {
//             const match = term.activitiesScore?.find(
//               (a) =>
//                 (a.activityId?._id || a.activityId)?.toString() ===
//                 itemId.toString()
//             );

//             if (match) {
//               foundExisting = true;
//               console.log(`✅ Found existing activity for term ${term.termId}`);
//               if (match.score !== score) {
//                 const updatedActs = term.activitiesScore.map((a) =>
//                   (a.activityId?._id || a.activityId)?.toString() ===
//                   itemId.toString()
//                     ? { ...a, score }
//                     : a
//                 );

//                 await dispatch(
//                   updateSenatorData({
//                     id: term._id,
//                     data: {
//                       ...term,
//                       activitiesScore: updatedActs.map((a) => ({
//                         activityId: a.activityId?._id || a.activityId,
//                         score: a.score,
//                       })),
//                     },
//                   })
//                 ).unwrap();
//               }
//               break;
//             }
//           }
//         }

//         // 2️⃣ SECOND PASS → insert only if NOT found
//         if (!foundExisting) {
//           console.log(`🆕 No existing ${category} found, will insert new entry`);
          
//           // Find the correct term based on voteDate and term ranges
//           if (voteDate) {
//             const voteDateTime = new Date(voteDate);
//             console.log(`📅 Vote date: ${voteDate} (parsed: ${voteDateTime})`);
            
//             // Find term where voteDate falls within term range
//             let matchingTerm = null;
            
//             for (const term of termRecords) {
//               const termRange = termRangesMap[term.termId];
//               console.log(`🔍 Checking term ${term.termId}:`, termRange);
              
//               if (termRange && termRange.startDate && termRange.endDate) {
//                 const termStart = new Date(termRange.startDate);
//                 const termEnd = new Date(termRange.endDate);
                
//                 console.log(`   Term range: ${termStart} to ${termEnd}`);
//                 console.log(`   Vote date: ${voteDateTime}`);
//                 console.log(`   Is within range? ${voteDateTime >= termStart && voteDateTime <= termEnd}`);
                
//                 // Check if voteDate is within this term's range
//                 if (voteDateTime >= termStart && voteDateTime <= termEnd) {
//                   matchingTerm = term;
//                   console.log(`✅ Found matching term: ${term.termId}`);
//                   break;
//                 }
//               } else {
//                 console.log(`❌ No term range data for term ${term.termId}`);
//               }
//             }
            
//             // If no term matches the date, fallback logic
//             if (!matchingTerm) {
//               console.log(`🤔 No term found matching vote date, using fallback logic`);
              
//               // Create array of terms with dates for sorting
//               const termsWithDates = termRecords
//                 .map(term => {
//                   const range = termRangesMap[term.termId];
//                   return {
//                     term,
//                     startDate: range?.startDate ? new Date(range.startDate) : null,
//                     endDate: range?.endDate ? new Date(range.endDate) : null
//                   };
//                 })
//                 .filter(t => t.startDate)
//                 .sort((a, b) => a.startDate - b.startDate);
              
//               console.log(`📊 Terms with dates (sorted):`, termsWithDates.map(t => ({
//                 termId: t.term.termId,
//                 start: t.startDate,
//                 end: t.endDate
//               })));
              
//               if (termsWithDates.length > 0) {
//                 const earliestTerm = termsWithDates[0];
//                 const latestTerm = termsWithDates[termsWithDates.length - 1];
                
//                 console.log(`📅 Earliest term: ${earliestTerm.term.termId} (${earliestTerm.startDate})`);
//                 console.log(`📅 Latest term: ${latestTerm.term.termId} (${latestTerm.startDate})`);
                
//                 if (voteDateTime < earliestTerm.startDate) {
//                   // Vote is before earliest term
//                   matchingTerm = earliestTerm.term;
//                   console.log(`⬅️ Vote is before earliest term, using earliest term`);
//                 } else if (voteDateTime > latestTerm.startDate) {
//                   // Vote is after latest term
//                   const currentTerm = termRecords.find(t => t.currentTerm);
//                   matchingTerm = currentTerm || latestTerm.term;
//                   console.log(`➡️ Vote is after latest term, using ${currentTerm ? 'current term' : 'latest term'}`);
//                 } else {
//                   // Vote is between terms, find closest term
//                   console.log(`🔍 Vote is between terms, finding closest...`);
//                   for (let i = 0; i < termsWithDates.length - 1; i++) {
//                     const current = termsWithDates[i];
//                     const next = termsWithDates[i + 1];
                    
//                     if (voteDateTime > current.startDate && voteDateTime < next.startDate) {
//                       // Vote is between two terms, use the later term
//                       matchingTerm = next.term;
//                       console.log(`↔️ Vote between terms, using later term: ${next.term.termId}`);
//                       break;
//                     }
//                   }
//                 }
//               }
//             }
            
//             targetTerm = matchingTerm || termRecords.find(t => t.currentTerm) || termRecords[0];
//             console.log(`🎯 Selected target term: ${targetTerm.termId} (currentTerm: ${targetTerm.currentTerm})`);
//           } else {
//             // No voteDate provided, use original fallback
//             targetTerm = termRecords.find(t => t.currentTerm) || termRecords[0];
//             console.log(`📭 No vote date provided, using fallback term: ${targetTerm.termId}`);
//           }

//           // Determine if this should be a past vote or current vote
//           const isPastVote = (category === "vote") && targetTerm && 
//             termRangesMap[targetTerm.termId] && voteDate && 
//             new Date(voteDate) < new Date(termRangesMap[targetTerm.termId].startDate);

//           console.log(`🎯 Is past vote? ${isPastVote} (voteDate: ${voteDate}, termStart: ${targetTerm && termRangesMap[targetTerm.termId]?.startDate})`);

//           if (category === "vote") {
//             if (isPastVote) {
//               // Add to pastVotesScore for votes before term start
//               const pastVotes = [...(targetTerm.pastVotesScore || [])];
//               pastVotes.push({ voteId: itemId, score });
//               console.log(`➕ Adding to pastVotesScore for term ${targetTerm.termId}`);

//               await dispatch(
//                 updateSenatorData({
//                   id: targetTerm._id,
//                   data: {
//                     ...targetTerm,
//                     pastVotesScore: pastVotes.map((v) => ({
//                       voteId: v.voteId?._id || v.voteId,
//                       score: v.score,
//                     })),
//                   },
//                 })
//               ).unwrap();
//             } else {
//               // Add to votesScore for current term votes
//               const votes = [...(targetTerm.votesScore || [])];
//               votes.push({ voteId: itemId, score });
//               console.log(`➕ Adding to votesScore for term ${targetTerm.termId}`);

//               await dispatch(
//                 updateSenatorData({
//                   id: targetTerm._id,
//                   data: {
//                     ...targetTerm,
//                     votesScore: votes.map((v) => ({
//                       voteId: v.voteId?._id || v.voteId,
//                       score: v.score,
//                     })),
//                   },
//                 })
//               ).unwrap();
//             }
//           }

//           if (category === "activity") {
//             const acts = [...(targetTerm.activitiesScore || [])];
//             acts.push({ activityId: itemId, score });
//             console.log(`➕ Adding to activitiesScore for term ${targetTerm.termId}`);

//             await dispatch(
//               updateSenatorData({
//                 id: targetTerm._id,
//                 data: {
//                   ...targetTerm,
//                   activitiesScore: acts.map((a) => ({
//                     activityId: a.activityId?._id || a.activityId,
//                     score: a.score,
//                   })),
//                 },
//               })
//             ).unwrap();
//           }
//         }

//         successCount++;
//         console.log(`✅ Successfully processed senator ${sid}`);
//       } catch (err) {
//         console.error(`❌ Error updating senator ${sid}`, err);
//       }
//     }

//     await dispatch(getAllSenatorData());
//     await dispatch(getAllSenators());

//     showSnackbar(
//       `Bulk select applied for ${successCount}/${ids.length} senators.`,
//       "success"
//     );
//   } catch (err) {
//     console.error("❌ Bulk apply failed", err);
//     showSnackbar("Bulk apply failed.", "error");
//   } finally {
//     setFetching(false);
//   }
// };

// const handleBulkPublish = async ({ ids = [], publishStatus = "published" }) => {
//   if (!ids.length) return;

//   if (userRole !== "admin") {
//     showSnackbar("Bulk publish is for admins only", "error");
//     return;
//   }

//   setFetching(true);

//   try {
//     const result = await dispatch(
//       bulkPublishSenators({ senatorIds: ids, publishStatus })
//     ).unwrap();

//     const successCount = result.successCount || ids.length;
//     const totalCount = result.totalCount || ids.length;

//     await dispatch(getAllSenators());

//     showSnackbar(
//       `Bulk publish applied for ${successCount}/${totalCount} senator${successCount !== 1 ? "s" : ""}!.`,
//       successCount === totalCount ? "success" : "warning"
//     );
//   } catch (err) {
//     console.error("❌ Bulk publish failed", err);
//     const errorMessage = err?.message || "Bulk publish failed.";
//     showSnackbar(errorMessage, "error");
//   } finally {
//     setFetching(false);
//   }
// };
const handleBulkPublish = async ({ ids = [], publishStatus = "published" }) => {
  if (!ids.length) return;

  if (userRole !== "admin") {
    showSnackbar("Bulk publish is for admins only", "error");
    return;
  }

  setFetching(true);

  try {
    const result = await dispatch(
      bulkPublishSenators({ senatorIds: ids, publishStatus })
    ).unwrap();

    const successCount = result.successCount ?? 0;
    const totalCount = result.totalCount ?? ids.length;
    const errors = result.errors || [];

    // 🔴 Extract "Term is required" errors
    const hasTermRequiredError = errors.some(
      e =>
        e.message?.toLowerCase().includes("term is required") ||
        e.details?.some(d => d.toLowerCase().includes("term is required"))
    );

    await dispatch(getAllSenators());
    console.log("Bulk publish result:", result);
console.log("successCount:", successCount, "totalCount:", totalCount, "hasTermRequiredError:", hasTermRequiredError);
    // 🧠 PRIORITY-BASED SNACKBAR LOGIC
    if (successCount === 0 && hasTermRequiredError) {
      showSnackbar("Term is required", "error");
      return;
    }

    if (successCount < totalCount && hasTermRequiredError) {
      showSnackbar(  `Bulk publish applied for ${successCount}/${totalCount} senator${
        successCount !== 1 ? "s" : ""
      }.Failed${" : "} ${totalCount-successCount}`+" Term is required ", "warning");
      return;
    }

    // ✅ Full success only
    showSnackbar(
      `Bulk publish applied for ${successCount}/${totalCount} senator${
        successCount !== 1 ? "s" : ""
      }.`,
      "success"
    );
  } catch (err) {
    showSnackbar(err?.message || "Bulk publish failed.", "error");
  } finally {
    setFetching(false);
  }
};

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 2015; y--) {
    years.push(y);
  }

  const partyOptions = [
    ...new Set(senators.map((senator) => senator.party)),
  ].filter(Boolean);
  const stateOptions = [
    ...new Set(senators.map((senator) => senator.state)),
  ].filter(Boolean);

  const filteredPartyOptions = partyOptions.filter((party) =>
    party.toLowerCase().includes(searchTerms.party)
  );

  const filteredStateOptions = stateOptions.filter((state) =>
    state.toLowerCase().includes(searchTerms.state)
  );

  const filteredRatingOptions = ratingOptions.filter((rating) =>
    rating.toLowerCase().includes(searchTerms.rating)
  );

  const filteredYearOptions = years.filter((year) =>
    year.toString().includes(searchTerms.year)
  );

  const handleEdit = (row) => {
    // Don't navigate if it's a bulk operation
    if (row && row.bulk) {
      return;
    }
    // Don't navigate if _id is missing or undefined
    if (!row || !row._id) {
      console.warn("⚠️ handleEdit: Missing _id, skipping navigation", row);
      return;
    }
    navigate(`/edit-senator/${row._id}`);
  };
  const handleDeleteClick = (row) => {
    setSelectedSenator(row);
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
      const token = getToken();
      if (!token) throw new Error("No auth token found");

      const result = await dispatch(deleteSenator(selectedSenator._id));
      if (result.error) {
        throw new Error(result.payload.message || "Failed to delete senator");
      }
      await dispatch(getAllSenators());
      showSnackbar(`${selectedSenator.name} deleted successfully.`, "success");
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to delete senator.");
      showSnackbar(errorMessage, "error");
    } finally {
      clearInterval(interval);
      setFetching(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleFetchClick = () => {
    setOpenFetchDialog(true);
  };

   const fetchSenatorsFromQuorum = async (status = "active") => {
     setOpenFetchDialog(false);
     setFetching(true);
     setProgress(0);
     const interval = setInterval(() => {
       setProgress((prev) => (prev >= 100 ? 0 : prev + 25));
     }, 1000);
     try {
       const requestBody = {
         type: "senator",
       };

       // Use different endpoints based on status
       const endpoint =
         status === "former"
           ? `${API_URL}/fetch-quorum/save-former`
           : `${API_URL}/fetch-quorum/store-data`;

       const response = await axios.post(endpoint, requestBody, {
         headers: {
           Authorization: `Bearer ${token}`,
         },
       });
       if (response.status === 200) {
            const statusText = status === "active" ? "active" : "former";
        showSnackbar(
          `Success: ${
            statusText.charAt(0).toUpperCase() + statusText.slice(1)
          } senators fetched successfully!`,
          "success"
        );
         await dispatch(getAllSenators());
         setFetching(false);
       } else {
         throw new Error("Failed to fetch senators from Quorum");
       }
     } catch (error) {
       setProgress(100); // Ensure it completes
       setTimeout(() => setProgress(0), 500); // Re
     }
   };
  const handlePartyFilter = (party) => {
    setPartyFilter((prev) =>
      prev.includes(party) ? prev.filter((p) => p !== party) : [...prev, party]
    );
  };

  const handleStateFilter = (state) => {
    setStateFilter((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };
  const handlePastVotesFilter = () => {
    setHasPastVotesFilter((prev) => !prev);
  };

  const handleRatingFilter = (rating) => {
    setRatingFilter((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };
  const handleYearFilter = (year) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };
  const handleStatusFilter = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTermFilter = (term) => {
    setTermFilter((prev) => (prev === term ? null : term));
  };

  const clearAllFilters = () => {
    setPartyFilter([]);
    setStateFilter([]);
    setRatingFilter([]);
    setSelectedYears([]);
    setTermFilter(null);
    setStatusFilter([]);
    setHasPastVotesFilter(false);
    setSearchQuery("");
  };

  const filteredSenators = mergedSenators.filter((senator) => {
    // Current/Former toggle filter - based on status field
    if (currentOrFormerFilter === "current") {
      if (senator.status !== "active") return false;
    } else if (currentOrFormerFilter === "former") {
      if (senator.status !== "former") return false;
    }

    // Term filter logic - check all terms
    if (termFilter === "current") {
      if (!senator.hasCurrentTerm) return false;
    } else if (termFilter === "past") {
      if (senator.hasCurrentTerm) return false;
    }

    if (selectedYears.length > 0) {
      const hasMatchingYear = senator.allTerms.some((term) => {
        if (term.termName && term.termName.includes("-")) {
          const [start, end] = term.termName.split("-").map(Number);
          return selectedYears.some((year) => {
            const yearNum = Number(year);
            return yearNum >= start && yearNum <= end;
          });
        }
        return false;
      });
      if (!hasMatchingYear) return false;
    }

    const nameMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every((word) => senator.name.toLowerCase().includes(word));

    const partyMatch =
      partyFilter.length === 0 || partyFilter.includes(senator.party);

    // State filter
    const stateMatch =
      stateFilter.length === 0 || stateFilter.includes(senator.state);

    // Rating filter - check all terms
    const ratingMatch =
      ratingFilter.length === 0 ||
      senator.allTerms.some(
        (term) => term.rating && ratingFilter.includes(term.rating)
      );

    // Status filter
    const statusMatch =
      statusFilter.length === 0 ||
      (senator.publishStatus && statusFilter.includes(senator.publishStatus)) ||
      (statusFilter.includes("draft") &&
        senator.publishStatus === "under review");

    // Past votes score filter - check all terms
    const pastVotesMatch = !hasPastVotesFilter || senator.hasPastVotesData;

    return (
      nameMatch &&
      partyMatch &&
      stateMatch &&
      ratingMatch &&
      statusMatch &&
      pastVotesMatch
    );
  });

  const activeFilterCount =
    partyFilter.length +
    stateFilter.length +
    ratingFilter.length +
    selectedYears.length +
    (termFilter ? 1 : 0) +
    statusFilter.length +
    (hasPastVotesFilter ? 1 : 0);

  const handleToggleStatusSenator = (senator) => {
    const newStatus =
      senator.publishStatus === "published" ? "draft" : "published";

    dispatch(updateSenatorStatus({ id: senator._id, publishStatus: newStatus }))
      .then(() => {
        dispatch(getAllSenators());
      })
      .catch((error) => {
        showSnackbar("Failed to update status.", "error");
      });
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <LoadingOverlay loading={loading || fetching} />
      <Box className="container">
        <SideMenu />

        <Box className={`contentBox ${fetching ? "fetching" : "notFetching"}`}>
          <FixedHeader />
          <MobileHeader />
          <Stack spacing={2} className="stackBox">
            <Box className="actionsBox">
              {/* {userRole === "admin" && (
                <Box className="adminBox">
                  <Button
                    variant="outlined"
                    className="fetchBtn"
                    onClick={handleFetchClick}
                  >
                    Fetch Senators from Quorum
                  </Button>
                </Box>
              )} */}
              {userRole === "admin" && (
                <Box className="adminBox">
                  <Button
                    variant="outlined"
                    className="fetchBtn"
                    onClick={handleFetchClick}
                  >
                    Fetch Senators from Quorum
                  </Button>
                </Box>
              )}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <TextField
                  placeholder="Search Senators"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth={true}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className="search-icon" />
                      </InputAdornment>
                    ),
                  }}
                  className="custom-search"
                />
  {/* Current/Former Toggle */}
                <Box
                  
                  sx={{
                    display: "flex",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    height: "38px",
                    minWidth: "150px",  
                  }}
                >
                  <Button
                    onClick={() => setCurrentOrFormerFilter("current")}
                    sx={{
                      flex: 1,
                      borderRadius: "8px 0 0 8px",
                      padding: "7px 10px",
                      fontSize: "0.875rem",
                      textTransform: "none",
                      // border: "none",
                      height: "100%",
                      backgroundColor:
                        currentOrFormerFilter === "current" ? "#497bb2 " : "#fff",
                      color:
                        currentOrFormerFilter === "current" ? "#fff" : "#333",
                      "&:hover": {
                        backgroundColor:
                          currentOrFormerFilter === "current"
                            ?"#497bb2 "
                            : "#f5f5f5",
                      },
                    }}
                  >
                    Current
                  </Button>
                  {/* <Box
                    sx={{
                      width: "1px",
                      backgroundColor: "#ccc",
                    }}
                  /> */}
                  <Button
                    onClick={() => setCurrentOrFormerFilter("former")}
                    sx={{
                      flex: 1,
                      borderRadius: "0 8px 8px   0",
                      padding: "7px 10px",
                      fontSize: "0.875rem",
                      textTransform: "none",
                      // border: "none",
                      height: "100%",
                      backgroundColor:
                        currentOrFormerFilter === "former" ?  "#497bb2" : "#fff",
                      color:
                        currentOrFormerFilter === "former" ? "#fff" : "#333",
                      "&:hover": {
                        backgroundColor:
                          currentOrFormerFilter === "former"
                            ? "#497bb2"
                            : "#f5f5f5",
                      },
                    }}
                  >
                    Former
                  </Button>
                </Box>
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <Badge
                    badgeContent={
                      activeFilterCount > 0 ? activeFilterCount : null
                    }
                    color="primary"
                    className="filter-badge"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      endIcon={
                        filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                      }
                      onClick={toggleFilter}
                      className="filter-button"
                    >
                      Filters
                    </Button>
                  </Badge>

                  {filterOpen && (
                    <ClickAwayListener onClickAway={() => setFilterOpen(false)}>
                      <Paper className="filter-paper">
                        <Box className="filter-header">
                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            alignItems="center"
                          >
                            <IconButton size="small" onClick={toggleFilter}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Party Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "party" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("party")}
                          >
                            <Typography variant="body1">Party</Typography>
                            {expandedFilter === "party" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "party" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                {filteredPartyOptions.length > 0 ? (
                                  filteredPartyOptions.map((party) => (
                                    <Box
                                      key={party}
                                      className="filter-option"
                                      onClick={() => handlePartyFilter(party)}
                                    >
                                      {partyFilter.includes(party) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {party.charAt(0).toUpperCase() +
                                          party.slice(1)}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No parties found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* State Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "state" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("state")}
                          >
                            <Typography variant="body1">State</Typography>
                            {expandedFilter === "state" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "state" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box sx={{ mb: 2, px: 2 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Search states..."
                                  value={searchTerms.state}
                                  onChange={(e) =>
                                    handleSearchChange("state", e.target.value)
                                  }
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Box>
                              <Box className="filter-scroll">
                                {filteredStateOptions.length > 0 ? (
                                  filteredStateOptions.map((state) => (
                                    <Box
                                      key={state}
                                      onClick={() => handleStateFilter(state)}
                                      className="filter-option"
                                    >
                                      {stateFilter.includes(state) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {state}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No states found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Rating Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "rating" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("rating")}
                          >
                            <Typography variant="body1">Rating</Typography>
                            {expandedFilter === "rating" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "rating" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                {filteredRatingOptions.length > 0 ? (
                                  filteredRatingOptions.map((rating) => (
                                    <Box
                                      key={rating}
                                      onClick={() => handleRatingFilter(rating)}
                                      className="filter-option"
                                    >
                                      {ratingFilter.includes(rating) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {rating}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No ratings found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Year Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "year" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("year")}
                          >
                            <Typography variant="body1">Year</Typography>
                            {expandedFilter === "year" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "year" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box sx={{ mb: 2, px: 2 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder="Search years..."
                                  value={searchTerms.year}
                                  onChange={(e) =>
                                    handleSearchChange("year", e.target.value)
                                  }
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Box>
                              <Box className="filter-scroll">
                                {filteredYearOptions.length > 0 ? (
                                  filteredYearOptions.map((year) => (
                                    <Box
                                      key={year}
                                      onClick={() =>
                                        handleYearFilter(year.toString())
                                      }
                                      className="filter-option"
                                    >
                                      {selectedYears.includes(
                                        year.toString()
                                      ) ? (
                                        <CheckIcon
                                          color="primary"
                                          fontSize="small"
                                        />
                                      ) : (
                                        <Box sx={{ width: 24, height: 24 }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {year}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ p: 1 }}
                                  >
                                    No years found
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Term Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "term" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("term")}
                          >
                            <Typography variant="body1">Term</Typography>
                            {expandedFilter === "term" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "term" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                {["current" /*, "past"*/].map((term) => (
                                  <Box
                                    key={term}
                                    onClick={() => handleTermFilter(term)}
                                    className="filter-option"
                                  >
                                    {termFilter === term ? (
                                      <CheckIcon
                                        color="primary"
                                        fontSize="small"
                                      />
                                    ) : (
                                      <Box sx={{ width: 24, height: 24 }} />
                                    )}
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      {term === "current"
                                        ? "Current Term"
                                        : "Past Terms"}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Status Filter */}
                        <Box
                          className={`filter-section ${
                            expandedFilter === "status" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("status")}
                          >
                            <Typography variant="body1">Status</Typography>
                            {expandedFilter === "status" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "status" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                {statusOptions.map((status) => (
                                  <Box
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    className="filter-option"
                                  >
                                    {statusFilter.includes(status) ? (
                                      <CheckIcon
                                        color="primary"
                                        fontSize="small"
                                      />
                                    ) : (
                                      <Box sx={{ width: 24, height: 24 }} />
                                    )}
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>

                        <Box
                          className={`filter-section ${
                            expandedFilter === "pastVotes" ? "active" : ""
                          }`}
                        >
                          <Box
                            className="filter-title"
                            onClick={() => toggleFilterSection("pastVotes")}
                          >
                            <Typography variant="body1">Past Votes</Typography>
                            {expandedFilter === "pastVotes" ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </Box>
                          {expandedFilter === "pastVotes" && (
                            <Box sx={{ py: 1, pt: 0 }}>
                              <Box className="filter-scroll">
                                <Box
                                  onClick={handlePastVotesFilter}
                                  className="filter-option"
                                >
                                  {hasPastVotesFilter ? (
                                    <CheckIcon
                                      color="primary"
                                      fontSize="small"
                                    />
                                  ) : (
                                    <Box sx={{ width: 24, height: 24 }} />
                                  )}
                                  <Typography variant="body2" sx={{ ml: 1 }}>
                                    Past Term Votes
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}
                        </Box>

                        {/* Clear All Button */}
                        <Box>
                          <Button
                            fullWidth
                            sx={{ borderRadius: 0, bgcolor: "#fff" }}
                            onClick={clearAllFilters}
                            disabled={
                              !partyFilter.length &&
                              !stateFilter.length &&
                              !ratingFilter.length &&
                              !selectedYears.length &&
                              !termFilter &&
                              !statusFilter.length &&
                              !hasPastVotesFilter
                            }
                          >
                            Clear All Filters
                          </Button>
                        </Box>
                      </Paper>
                    </ClickAwayListener>
                  )}
                </Box>

              

                {/* Desktop: Show Fetch button inside search/filter stack */}
                {userRole === "admin" && (
                  <Button
                    variant="outlined"
                    className="fetch-btn"
                    onClick={handleFetchClick}
                  >
                    Fetch Senators from Quorum
                  </Button>
                )}
              </Stack>
            </Box>
            {/* {userRole === "admin" && (
                  <Button
                    variant="outlined"
                    className="fetch-btn"
                    onClick={handleFetchClick}
                  >
                    Fetch Senators from Quorum
                  </Button>
                )}
              </Stack>
            </Box> */}

            <MainGrid
              type="senator"
              data={filteredSenators}
              loading={fetching ? false : loading}
              onDelete={handleDeleteClick}
              onEdit={handleEdit}
              isSelectable={userRole === "admin"}
              onBulkApply={handleBulkApply}
              onBulkPublish={handleBulkPublish}
              handleToggleStatusSenator={handleToggleStatusSenator}
            />
          </Stack>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={hideSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
        <Alert
            onClose={hideSnackbar}
            severity={snackbarSeverity}
            sx={{
              border: "none",
              boxShadow: "none",
              width: "100%",
              bgcolor:
                snackbarMessage ===
                `${selectedSenator?.name} deleted successfully.`
                  ? "#fde8e4 !important"
                  : (snackbarMessage
                      ?.toLowerCase()
                      .includes("senators fetched successfully!") ||
                    snackbarMessage?.toLowerCase().includes("bulk select applied") ||
                    snackbarMessage?.toLowerCase().includes("bulk publish applied"))
                  ? "#daf4f0 !important"
                  : undefined,
 
              "& .MuiAlert-icon": {
                color:
                  snackbarMessage ===
                  `${selectedSenator?.name} deleted successfully.`
                    ? "#cc563d !important"
                    : (snackbarMessage
                        ?.toLowerCase()
                        .includes("senators fetched successfully!") ||
                      snackbarMessage
                        ?.toLowerCase()
                        .includes("bulk select applied") ||
                      snackbarMessage
                        ?.toLowerCase()
                        .includes("bulk publish applied"))
                    ? "#099885 !important"
                    : undefined,
              },
 
              "& .MuiAlert-message": {
                color:
                  snackbarMessage ===
                  `${selectedSenator?.name} deleted successfully.`
                    ? "#cc563d !important"
                    : (snackbarMessage
                        ?.toLowerCase()
                        .includes("senators fetched successfully!") ||
                      snackbarMessage
                        ?.toLowerCase()
                        .includes("bulk select applied") ||
                      snackbarMessage
                        ?.toLowerCase()
                        .includes("bulk publish applied"))
                    ? "#099885 !important"
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

        <Dialog
          open={openFetchDialog}
          onClose={() => setOpenFetchDialog(false)}
          PaperProps={{
            sx: { borderRadius: 3, padding: 2, width: "90%", maxWidth: 420 },
          }}
        >
          <DialogTitle className="dialogBox">
            Fetch Senators from Quorum
          </DialogTitle>

          <DialogContent>
            <DialogContentText className="dialogTitle">
              Select the type of senators you want to fetch:
            </DialogContentText>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#1E4C80 !important",
                    color: "white !important",
                    border: "none !important",
                  },
                }}
                onClick={() => fetchSenatorsFromQuorum("active")}
              >
                Active Senators
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#1E4C80 !important",
                    color: "white !important",
                    border: "none !important",
                  },
                }}
                onClick={() => fetchSenatorsFromQuorum("former")}
              >
                Former Senators
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenFetchDialog(false)}
              variant="outlined"
              color="secondary"
              sx={{ borderRadius: 2, paddingX: 3 }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: { borderRadius: 3, padding: 2, width: "90%", maxWidth: 420 },
          }}
        >
          <DialogTitle className="dialogBox">Confirm Deletion</DialogTitle>

          <DialogContent>
            <DialogContentText className="dialogTitle">
              Are you sure you want to delete{" "}
              <strong>{selectedSenator?.name}</strong>?
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