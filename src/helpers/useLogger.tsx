import { useState, useCallback } from "react";
import { TimeDetail } from "../types";


const useLogger = () => {
  const [timeDetails, setTimeDetails] = useState<TimeDetail[]>([]);

  const logTimeDetail = useCallback((detail: TimeDetail) => {
    setTimeDetails((prev) => [...prev, detail]);
  }, []);

  const logPopupOpen = (index: number) => {
    logTimeDetail({
      timestamp: Date.now(),
      detail: "popupOpen",
      index,
    });
  };

  const logLiked = (index: number) => {
    logTimeDetail({
      timestamp: Date.now(),
      detail: "liked",
      index,
    });
  };

  const logDisliked = (index: number) => {
    logTimeDetail({
      timestamp: Date.now(),
      detail: "disliked",
      index,
    });
  };

  const logWrongSelection = (index: number) => {
    logTimeDetail({
      timestamp: Date.now(),
      detail: "wrongSelection",
      index,
    });
  };

  const logWriteExplanation = (index: number, currentText: string) => {
    logTimeDetail({
      timestamp: Date.now(),
      detail: "writeExplanation",
      currentText,
      index,
    });
  };

  const logSeeLLMExplanation = (index: number, open: boolean) => {
    logTimeDetail({
      timestamp: Date.now(),
      detail: "seeLLMExplanation",
      open,
      index,
    });
  }

  const getResults = () => {
    return timeDetails;
  }

  // useEffect(() => {
  //   console.log(timeDetails);
  // }, [timeDetails]);

  return {
    logPopupOpen,
    logLiked,
    logDisliked,
    logWrongSelection,
    logWriteExplanation,
    logSeeLLMExplanation,
    getResults,
  };
};

export default useLogger;
