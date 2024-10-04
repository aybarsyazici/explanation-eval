import { Space } from "antd";
import {
  Guider,
  LearningTest,
  UserHighlightUserExplain,
  UserHighlightUserExplain_word,
  UserHighlightWeExplain,
  UserHighlightWeExplain_word,
  WeHighlightUserExplain,
  WeHighlightUserExplain_word,
  WeHighlightWeExplain,
  WeHighlightWeExplain_word,
} from "../../components";
import { NotificationInstance } from "antd/es/notification/interface";
import { useEffect, useMemo } from "react";
import { MainPage } from "../MainPage/MainPage";
import { useAppVersionContext } from "../../helpers";
import {
  BackendUserResult,
  BackendUserResultDetails,
  UserTestResult,
  UserTestResultsDetails,
} from "../../types";
import { traceHit } from "./TraceHit";
import ResultPage from "../ResultPage/ResultPage";
interface AppFlowProps {
  appStep: number;
  setAppStep: React.Dispatch<React.SetStateAction<number>>;
  api: NotificationInstance;
  setActivePage: (page: string) => void;
  currentMode: string;
}
const backendUrlHttp = "https://gelex-backend-a3bfadfb8f41.herokuapp.com";

export const AppFlow = ({
  appStep,
  setAppStep,
  api,
  setActivePage,
  currentMode,
}: AppFlowProps) => {
  const { appVersion } = useAppVersionContext();
  // placeholder, replace with actual data
  const finishApplication = (
    finishEvent: string,
    result_fn: () => void,
    results: BackendUserResultDetails
  ) => {
    // Extend the results with the original recipe and improvement level
    const userId = document.cookie
      .split(";")
      .find((cookie) => cookie.includes("userId"))
      ?.split("=")[1];
    if (!userId) {
      api.error({
        message: "Error",
        description: "Something went wrong. Please try again.",
        placement: "top",
      });
      return;
    }
    const resultsForBackend: BackendUserResult = {
      user: userId,
      event: finishEvent,
      details: results,
    };
    // console.log('Submitting results', resultsForBackend);
    // Hit endpoint with results(/trace/)
    traceHit(backendUrlHttp, resultsForBackend, result_fn, api);
  };

  const finishReview = (
    results: UserTestResultsDetails,
    eventName: string,
    result_fn: () => void
  ) => {
    // Extend the results with the original recipe and improvement level
    const userId = document.cookie
      .split(";")
      .find((cookie) => cookie.includes("userId"))
      ?.split("=")[1];
    if (!userId) {
      api.error({
        message: "Error",
        description: "Something went wrong. Please try again.",
        placement: "top",
      });
      return;
    }
    const resultsForBackend: UserTestResult = {
      user: userId,
      event: eventName,
      details: results,
    };
    console.log("Submitting test results", resultsForBackend);
    traceHit(backendUrlHttp, resultsForBackend, result_fn, api);
  };

  const renderPart = useMemo(() => {
    switch (appStep) {
      case 0:
        return (
          <LearningTest
            finishEvent={(result: UserTestResultsDetails) => {
              finishReview(result, "preTest", () => setAppStep(1));
            }}
            version="pre"
            api={api}
          />
        );
      case 1:
        return (
          <MainPage
            api={api}
            key={"application-use-1"}
            setAppStep={() => setAppStep(2)}
            currentMode={currentMode}
            backendUrlHttp={backendUrlHttp}
          />
        );
      case 2:
        return (
          <MainPage
            api={api}
            key={"application-use-2"}
            setAppStep={() => setAppStep(3)}
            currentMode={currentMode}
            backendUrlHttp={backendUrlHttp}
          />
        );
      case 3:
        return (
          <LearningTest
            finishEvent={(result: UserTestResultsDetails) => {
              finishReview(result, "postTest", () => {
                setActivePage("result");
                setAppStep(0);
              });
            }}
            version="post"
            api={api}
          />
        );
    }
  }, [appStep, currentMode, appVersion]);

  return (
    <Space direction="vertical" style={{ display: "flex" }} size="large">
      <Guider currentStep={appStep} />
      {renderPart}
    </Space>
  );
};

export default AppFlow;
