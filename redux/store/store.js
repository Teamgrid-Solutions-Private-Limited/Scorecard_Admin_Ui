import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/loginSlice";
import senatorReducer from "../slice/senetorSlice"
import senetorTermReducer from "../slice/senetorTermSlice"
import TermReducer from "../slice/termSlice"
import VoteReducer from "../slice/voteSlice"
import ActivityReducer from "../slice/activitySlice"
import HouseReducer from "../slice/houseSlice"
import HouseTermReducer from "../slice/houseTermSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    senator : senatorReducer,
    senatorData : senetorTermReducer,
    term : TermReducer,
    vote : VoteReducer,
    activity : ActivityReducer,
    house : HouseReducer,
    houseData : HouseTermReducer
  }
});

export default store;