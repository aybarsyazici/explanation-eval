import { Card, Space, Typography } from "antd";
import {
  Guider,
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
import { useEffect, useMemo, useState } from "react";
import { MainPage } from "../MainPage/MainPage";
import { useAppVersionContext } from "../../helpers";
import {
  BackendUserResult,
  BackendUserResultDetails,
  ImprovedRecipe,
} from "../../types";
import improved_example from "../../../temp/improved_recipe.json";
import { useTranslation } from "react-i18next";

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
  const finishReview = (
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
    fetch(`${backendUrlHttp}/trace`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resultsForBackend),
    })
      .then((response) =>
        response.json().then((data) => {
          console.log("Trace Data:", data);
          // Go to results page.
          result_fn();
        })
      )
      .catch((error) => {
        console.log(error);
        api.error({
          duration: 0,
          message: "Error",
          description: "Something went wrong. Please try again.",
          placement: "top",
        });
      });
  };

  const { appVersion } = useAppVersionContext();
  // placeholder, replace with actual data
  const [preTestExample, setPreTestExample] = useState<ImprovedRecipe>();

  useEffect(() => {
    if (appStep === 0) {
      // TODO fetch pre-test example
      console.log("Fetching pre-test example");
      setPreTestExample({
        recipeText: improved_example.example_recipe,
        //@ts-ignore
        annotations: improved_example.annotations,
        explanations: improved_example.explanations_per_word,
      });
      setimprovedRecipeLoading(false);
    } else if (appStep === 3) {
      // TODO fetch post-test example
      console.log("Fetching post-test example");
      setimprovedRecipeLoading(false);
    }
  }, [appStep]);

  const [improvedRecipeLoading, setimprovedRecipeLoading] = useState(false);
  const { t } = useTranslation();

  const testVersionGrabber = useMemo(() => {
    switch (appVersion) {
      case 0:
        if (currentMode === "sentence") {
          return (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {preTestExample && (
                <UserHighlightUserExplain
                  improvedRecipe={preTestExample}
                  setRevealAllWords={() => null}
                  setRevealExtraWord={() => null}
                  sendUserResults={(results: BackendUserResultDetails) => {
                    finishReview("pre-test", () => setAppStep(
                      (prev) => prev + 1
                    ), results);
                  }}
                  waitToFindAllWords={false}
                />
              )}
            </Card>
          );
        } else if (currentMode === "word") {
          return (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {preTestExample && (
                <UserHighlightUserExplain_word
                  improvedRecipe={preTestExample}
                  setRevealAllWords={() => null}
                  setRevealExtraWord={() => null}
                  sendUserResults={(results: BackendUserResultDetails) => {
                    finishReview("pre-test", () => setAppStep(
                      (prev) => prev + 1
                    ), results);
                  }}
                  waitToFindAllWords={false}
                />
              )}
            </Card>
          );
        }
        break;
      case 1:
        if (currentMode === "sentence") {
          return (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {preTestExample && (
                <UserHighlightWeExplain
                  improvedRecipe={preTestExample}
                  setRevealAllWords={() => null}
                  setRevealExtraWord={() => null}
                  sendUserResults={(results: BackendUserResultDetails) => {
                    finishReview("pre-test", () => setAppStep(
                      (prev) => prev + 1
                    ), results);
                  }}
                  waitToFindAllWords={false}
                />
              )}
            </Card>
          );
        } else if (currentMode === "word") {
          return (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {preTestExample && (
                <UserHighlightWeExplain_word
                  improvedRecipe={preTestExample}
                  setRevealAllWords={() => null}
                  setRevealExtraWord={() => null}
                  sendUserResults={(results: BackendUserResultDetails) => {
                    finishReview("pre-test", () => setAppStep(
                      (prev) => prev + 1
                    ), results);
                  }}
                  waitToFindAllWords={false}
                />
              )}
            </Card>
          );
        }
        break;
      case 2:
        if (currentMode === "sentence") {
          return (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {preTestExample && (
                <WeHighlightUserExplain
                  improvedRecipe={preTestExample}
                  sendUserResults={(results: BackendUserResultDetails) => {
                    finishReview("pre-test", () => setAppStep(
                      (prev) => prev + 1
                    ), results);
                  }}
                  waitToFindAllWords={false}
                />
              )}
            </Card>
          );
        } else if (currentMode === "word") {
          return (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {preTestExample && (
                <WeHighlightUserExplain_word
                  improvedRecipe={preTestExample}
                  sendUserResults={(results: BackendUserResultDetails) => {
                    finishReview("pre-test", () => setAppStep(
                      (prev) => prev + 1
                    ), results);
                  }}
                  waitToFindAllWords={false}
                />
              )}
            </Card>
          );
        }
        break;
      case 3:
        if (currentMode === "sentence") {
          return (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {preTestExample && (
                <WeHighlightWeExplain
                  improvedRecipe={preTestExample}
                  sendUserResults={(results: BackendUserResultDetails) => {
                    finishReview("pre-test", () => setAppStep(
                      (prev) => prev + 1
                    ), results);
                  }}
                  waitToFindAllWords={false}
                />
              )}
            </Card>
          );
        } else if (currentMode === "word") {
          return (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {preTestExample && (
                <WeHighlightWeExplain_word
                  improvedRecipe={preTestExample}
                  sendUserResults={(results: BackendUserResultDetails) => {
                    finishReview("pre-test", () => setAppStep(
                      (prev) => prev + 1
                    ), results);
                  }}
                  waitToFindAllWords={true}
                />
              )}
            </Card>
          );
        }
        break;
      default:
        return (
          <Typography.Title level={2}>
            Uh oh! Something went wrong, you are not supposed to end up here...
            Please re-enter the app password for the version you want to use.
          </Typography.Title>
        );
    }
  }, [preTestExample, improvedRecipeLoading, currentMode, appVersion]);

  const renderPart = useMemo(() => {
    switch (appStep) {
      case 0:
        return testVersionGrabber;
      case 1:
        return (
          <MainPage
            api={api}
            setAppStep={() => setAppStep(2)}
            currentMode={currentMode}
            backendUrlHttp={backendUrlHttp}
          />
        );
      case 2:
        return (
          <MainPage
            api={api}
            setAppStep={() => setActivePage("result")}
            currentMode={currentMode}
            backendUrlHttp={backendUrlHttp}
          />
        );
      case 3:
        return <p>AAA</p>;
      default:
        return <p>AAA</p>;
    }
  }, [appStep, preTestExample, improvedRecipeLoading, currentMode, appVersion]);

  return (
    <Space direction="vertical" style={{ display: "flex" }} size="large">
      <Guider currentStep={appStep} />
      {renderPart}
    </Space>
  );
};

export default AppFlow;
