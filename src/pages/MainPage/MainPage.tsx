import { Card, Col, Empty, Popover, Row, Space, FloatButton } from "antd";
import {
  UserHighlightWeExplain,
  UserHighlightWeExplain_word,
  RecipeForm,
  UserHighlightUserExplain,
  UserHighlightUserExplain_word,
  WeHighlightUserExplain,
  WeHighlightUserExplain_word,
  WeHighlightWeExplain,
  WeHighlightWeExplain_word,
} from "../../components";
import { useEffect, useState } from "react";
import {
  BackendInput,
  ImprovedRecipe,
  BackendResponse,
  BackendUserResult,
  BackendUserResultDetails,
} from "../../types";
import { NotificationInstance } from "antd/es/notification/interface";
import {
  BulbOutlined,
  ForkOutlined,
  QuestionOutlined,
} from "@ant-design/icons";
import { useAppVersionContext, useWebSocketContext } from "../../helpers";
import { useTranslation } from "react-i18next";

type MainPageProps = {
  api: NotificationInstance;
  setAppStep: () => void;
  currentMode: string;
  backendUrlHttp: string;
};

export const MainPage: React.FC<MainPageProps> = ({
  api,
  setAppStep,
  currentMode,
  backendUrlHttp,
}) => {
  const { t } = useTranslation();

  const [originalRecipe, setOriginalRecipe] = useState<string>("");
  const [improvementLevel, setImprovementLevel] = useState<number>(0);
  const [revealExtraWord, setRevealExtraWord] = useState<() => void>(
    () => () => {},
  );
  const [revealAllWords, setRevealAllWords] = useState<() => void>(
    () => () => {},
  );
  // Does the cookie savedImprovedRecipe exist? (for debugging)
  // const savedImprovedRecipe = document.cookie.split(';').find((cookie) => cookie.includes('savedImprovedRecipe'))?.split('=')[1];
  // If it exists parse the JSON
  // const parsedImprovedRecipe = savedImprovedRecipe ? JSON.parse(savedImprovedRecipe) as ImprovedRecipe : undefined;
  const [improvedRecipe, setImprovedRecipe] = useState<
    ImprovedRecipe | undefined
  >();
  const [improvedRecipeLoading, setimprovedRecipeLoading] = useState(false);
  const { appVersion } = useAppVersionContext();

  const { ws, setOnChildDataReceive, setOnChildErrorReceive } = useWebSocketContext();
  
  useEffect(() => {
    // Define the function that the parent will call
    const handleData = (data: BackendResponse) => {
      console.log("WebSocket data received:", data);
      setImprovementLevel(improvementLevel);
      setImprovedRecipe({
        recipeText: data.example_recipe,
        annotations: data.annotations,
        explanations: data.explanations_per_word,
      });
      // // Save the improved recipe to cookie (for debugging)
      // document.cookie = `savedImprovedRecipe=${JSON.stringify({
      //   recipeText: data.example_recipe,
      //   annotations: data.annotations,
      // })}`;
      setimprovedRecipeLoading(false);
      api.success({
        message: "Your new recipe is here!",
        description:
          "Can you identify the changes? Click on the words you think are new!",
        placement: "top",
      });
    };

    const handleError = (error: Event) => {
      console.error("WebSocket error:", error);
      setimprovedRecipeLoading(false);
      console.log("Websocket error while not in tour");
      setOriginalRecipe("");
      setImprovedRecipe(undefined);
    };

    // Pass this function to the parent
    setOnChildDataReceive(handleData);
    setOnChildErrorReceive(handleError);

    return () => {
      setOnChildDataReceive(() => {});
      setOnChildErrorReceive(() => {});
    };
  }, [setOnChildDataReceive, setOnChildErrorReceive]);

  const submitHit = async (
    recipe: string,
    improvementLevel: number,
  ) => {
    // console.log('Submitting recipe mainpage: ', recipe, fromTour)
    // Check the length of the recipe
    if (recipe.length < 25) {
      api.error({
        message: "Error",
        description: "Please enter a longer recipe.",
        placement: "top",
      });
      return;
    }
    const rule_counts = [3, 5, 10, 20, 30];
    // console.log(`Submitting hit with recipe: ${recipe} and improvementLevel: ${improvementLevel}, num_rules: ${rule_counts[improvementLevel]}`)
    setimprovedRecipeLoading(true);

    // Read userId from cookie
    const userId = document.cookie
      .split(";")
      .find((cookie) => cookie.includes("userId"))
      ?.split("=")[1];
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Prepare the data to send
      const dataToSend = JSON.stringify({
        user_recipe: recipe,
        number_of_rules: rule_counts[improvementLevel],
        user_id: userId,
      } as BackendInput);

      // Send data through WebSocket
      ws.send(dataToSend);
      setOriginalRecipe(recipe);
    } else {
      console.error("WebSocket is not connected.");
      api.error({
        message: "Error",
        description: "Connection to the server failed. Please try again.",
        placement: "top",
      });
      setOriginalRecipe("");
      setImprovedRecipe(undefined);
      setimprovedRecipeLoading(false);
    }
  };

  const finishReview = (results: BackendUserResultDetails) => {
    // Extend the results with the original recipe and improvement level
    results.originalRecipe = originalRecipe;
    results.improvementLevel = improvementLevel;
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
      event: "finishReview",
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
          setAppStep();
        }),
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

  return (
    <Space direction="vertical" size="large" style={{ display: "flex" }}>
      <Row gutter={32} style={{ height: "100%" }}>
        <Col span={12} style={{ height: "100%" }}>
          <RecipeForm
            submitHit={submitHit}
            api={api}
          />
        </Col>
        <Col span={12}>
          {
            // App version 0 & 1 has the user highlighting the changes, thus we require the reveal buttons
            appVersion < 2 && (
              <Card
                title={t("MainPage.ImprovedRecipe")}
                loading={improvedRecipeLoading}
                actions={[
                  <Popover
                    content={
                      "Reveal one extra " +
                      (currentMode === "sentence" ? "sentence" : "word") +
                      "!"
                    }
                  >
                    <QuestionOutlined
                      onClick={revealExtraWord}
                    />
                  </Popover>,
                  <Popover
                    content={
                      "Reveal all " +
                      (currentMode === "sentence" ? "sentences" : "words") +
                      "!"
                    }
                  >
                    <BulbOutlined
                      onClick={revealAllWords}
                    />
                  </Popover>,
                ]}
              >
                {appVersion === 1 &&
                  improvedRecipe &&
                  currentMode === "sentence" && (
                    <UserHighlightWeExplain
                      improvedRecipe={improvedRecipe}
                      sendUserResults={finishReview}
                      setRevealExtraWord={setRevealExtraWord}
                      setRevealAllWords={setRevealAllWords}
                    />
                  )}
                {appVersion === 1 &&
                  improvedRecipe &&
                  currentMode === "word" && (
                    <UserHighlightWeExplain_word
                      improvedRecipe={improvedRecipe}
                      sendUserResults={finishReview}
                      setRevealExtraWord={setRevealExtraWord}
                      setRevealAllWords={setRevealAllWords}
                    />
                  )}
                {appVersion === 0 &&
                  improvedRecipe &&
                  currentMode === "sentence" && (
                    <UserHighlightUserExplain
                      improvedRecipe={improvedRecipe}
                      sendUserResults={finishReview}
                      setRevealExtraWord={setRevealExtraWord}
                      setRevealAllWords={setRevealAllWords}
                    />
                  )}
                {appVersion === 0 &&
                  improvedRecipe &&
                  currentMode === "word" && (
                    <UserHighlightUserExplain_word
                      improvedRecipe={improvedRecipe}
                      sendUserResults={finishReview}
                      setRevealExtraWord={setRevealExtraWord}
                      setRevealAllWords={setRevealAllWords}
                    />
                  )}
                {!improvedRecipe && <Empty description="No recipe yet!" />}
              </Card>
            )
          }
          {appVersion >= 2 && (
            <Card
              title={t("MainPage.ImprovedRecipe")}
              loading={improvedRecipeLoading}
            >
              {appVersion === 2 &&
                improvedRecipe &&
                currentMode === "sentence" && (
                  <WeHighlightUserExplain
                    improvedRecipe={improvedRecipe}
                    sendUserResults={finishReview}
                  />
                )}
              {appVersion === 2 && improvedRecipe && currentMode === "word" && (
                <WeHighlightUserExplain_word
                  improvedRecipe={improvedRecipe}
                  sendUserResults={finishReview}
                />
              )}
              {appVersion === 3 &&
                improvedRecipe &&
                currentMode === "sentence" && (
                  <WeHighlightWeExplain
                    improvedRecipe={improvedRecipe}
                    sendUserResults={finishReview}
                  />
                )}
              {appVersion === 3 && improvedRecipe && currentMode === "word" && (
                <WeHighlightWeExplain_word
                  improvedRecipe={improvedRecipe}
                  sendUserResults={finishReview}
                />
              )}
              {!improvedRecipe && <Empty description="No recipe yet!" />}
            </Card>
          )}
        </Col>
      </Row>
      <FloatButton
        icon={<ForkOutlined />}
        type="primary"
        tooltip={`current app version ${appVersion}`}
        /*@ts-ignore*/
      />
    </Space>
  );
};
