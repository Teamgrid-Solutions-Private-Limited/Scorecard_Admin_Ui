import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/loginSlice";
import senatorReducer from "./reducer/senatorSlice"
import senatorTermReducer from "./reducer/senatorTermSlice"
import TermReducer from "./reducer/termSlice"
import VoteReducer from "./reducer/voteSlice"
import ActivityReducer from "./reducer/activitySlice"
import HouseReducer from "./reducer/houseSlice"
import HouseTermReducer from "./reducer/houseTermSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    senator : senatorReducer,
    senatorData : senatorTermReducer,
    term : TermReducer,
    vote : VoteReducer,
    activity : ActivityReducer,
    house : HouseReducer,
    houseData : HouseTermReducer
  }
});

export default store;