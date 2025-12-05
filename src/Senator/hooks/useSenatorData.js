import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSenatorById,
  clearSenatorState,
} from "../../redux/reducer/senetorSlice";
import {
  getSenatorDataBySenetorId,
  clearSenatorDataState,
} from "../../redux/reducer/senetorTermSlice";
import { getAllTerms } from "../../redux/reducer/termSlice";
import { getAllVotes } from "../../redux/reducer/voteSlice";
import { getAllActivity } from "../../redux/reducer/activitySlice";

/**
 * Custom hook for loading all senator-related data
 */
export const useSenatorData = (id) => {
  const dispatch = useDispatch();
  const { senator } = useSelector((state) => state.senator);
  const { terms } = useSelector((state) => state.term);
  const { votes } = useSelector((state) => state.vote);
  const { activities } = useSelector((state) => state.activity);
  const senatorData = useSelector((state) => state.senatorData);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [votesLoaded, setVotesLoaded] = useState(false);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [termsLoaded, setTermsLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        try {
          setIsInitialLoad(true);

          await dispatch(getAllTerms()).unwrap();
          setTermsLoaded(true);

          await dispatch(getAllVotes()).unwrap();
          setVotesLoaded(true);

          await dispatch(getAllActivity()).unwrap();
          setActivitiesLoaded(true);

          await Promise.all([
            dispatch(getSenatorById(id)).unwrap(),
            dispatch(getSenatorDataBySenetorId(id)).unwrap(),
          ]);

          setDataLoaded(true);
        } catch (error) {
          setDataLoaded(true);
        } finally {
          setIsInitialLoad(false);
        }
      };

      loadData();
    }

    return () => {
      dispatch(clearSenatorState());
      dispatch(clearSenatorDataState());
    };
  }, [id, dispatch]);

  const isDataReady = () => {
    return (
      !isInitialLoad &&
      dataLoaded &&
      termsLoaded &&
      votesLoaded &&
      activitiesLoaded &&
      terms?.length > 0 &&
      votes?.length > 0 &&
      activities?.length > 0
    );
  };

  return {
    senator,
    terms,
    votes,
    activities,
    senatorData,
    isDataReady: isDataReady(),
    isLoading: isInitialLoad || !dataLoaded,
  };
};

