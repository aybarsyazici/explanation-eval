import { Card, Col, Empty, Row, Space } from "antd";
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
  TourContext,
  IPageRef,
} from "../../components";
import { useContext, useEffect, useRef, useState } from "react";
import {
  BackendInput,
  ImprovedRecipe,
  BackendResponse,
  BackendUserResult,
  BackendUserResultDetails,
} from "../../types";
import { NotificationInstance } from "antd/es/notification/interface";
// import { BulbOutlined, QuestionOutlined } from "@ant-design/icons";
import { useAppVersionContext, useWebSocketContext } from "../../helpers";
import { useTranslation } from "react-i18next";
import "./MainPage.css";

type MainPageProps = {
  api: NotificationInstance;
  setAppStep: React.Dispatch<React.SetStateAction<number>>;
  currentMode: string;
  backendUrlHttp: string;
  finishFn: () => void;
};

export const MainPage: React.FC<MainPageProps> = ({
  api,
  setAppStep,
  finishFn,
  currentMode,
  backendUrlHttp,
}) => {
  const { t } = useTranslation();
  const { doTour, setCurrentPage, startTour, setDoTour } =
    useContext(TourContext);
  const [originalRecipe, setOriginalRecipe] = useState<string>("");
  const [improvementLevel, setImprovementLevel] = useState<number>(0);
  const [__, setRevealExtraWord] = useState<() => void>(() => () => {});
  const [_, setRevealAllWords] = useState<() => void>(() => () => {});
  // Does the cookie savedImprovedRecipe exist? (for debugging)
  // const savedImprovedRecipe = document.cookie.split(';').find((cookie) => cookie.includes('savedImprovedRecipe'))?.split('=')[1];
  // If it exists parse the JSON
  // const parsedImprovedRecipe = savedImprovedRecipe ? JSON.parse(savedImprovedRecipe) as ImprovedRecipe : undefined;
  const [improvedRecipe, setImprovedRecipe] = useState<
    ImprovedRecipe | undefined
  >();
  const [improvedRecipeLoading, setimprovedRecipeLoading] = useState(false);
  const { appVersion } = useAppVersionContext();
  const { ws, setOnChildDataReceive, setOnChildErrorReceive } =
    useWebSocketContext();
  const { i18n } = useTranslation();

  // Ref Map
  const refMap: Record<string, React.RefObject<HTMLDivElement>> = {};
  refMap["improved-recipe-wrapper"] = useRef<HTMLDivElement>(null);
  refMap["reveal-next-change"] = useRef<HTMLDivElement>(null);
  refMap["reveal-all-changes"] = useRef<HTMLDivElement>(null);
  const [refState, setRefState] = useState<IPageRef[]>([]);

  // Use useEffect to update refState when appVersion changes
  useEffect(() => {
    const newRefState: IPageRef[] = [
      {
        title: t("MainPage.TitleImproveRecipe"),
        content:
          appVersion < 2
            ? t("MainPage.ContentWordScale")
            : t("MainPage.ContentHighlightedChanges"),
        target: refMap["improved-recipe-wrapper"],
        onClose: () => {
          setCurrentPage(4);
        },
      },
      // ...(appVersion < 2
      //   ? [
      //       {
      //         title: t("MainPage.TitleRevealChangesOne"),
      //         content: t("MainPage.ContentRevealChangesOne"),
      //         target: refMap["reveal-next-change"],
      //         onClose: () => {
      //           setCurrentPage(4);
      //         },
      //       },
      //       {
      //         title: t("MainPage.TitleRevealChangesAll"),
      //         content: t("MainPage.ContentRevealChangesAll"),
      //         target: refMap["reveal-all-changes"],
      //         onClose: () => {
      //           setCurrentPage(4);
      //         },
      //       },
      //     ]
      //   : []),
    ];

    // Update refState with the new array
    setRefState(newRefState);
  }, [appVersion, t]); // Dependencies: appVersion and t for translations

  useEffect(() => {
    // Define the function that the parent will call
    const handleData = (data: BackendResponse) => {
      // console.log("WebSocket data received:", data);
      setImprovementLevel(improvementLevel);
      setImprovedRecipe({
        recipeText: data.example_recipe,
        annotations: data.annotations,
        explanations: data.explanations_per_word,
      });
      // Save the improved recipe to cookie (for debugging)
      // document.cookie = `savedImprovedRecipe=${JSON.stringify({
      //   recipeText: data.example_recipe,
      //   annotations: data.annotations,
      //   explanations: data.explanations_per_word,
      // })}`;
      setimprovedRecipeLoading(false);
      setAppStep(2);
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
      if (!doTour) {
        setAppStep(0);
        setOriginalRecipe("");
        setImprovedRecipe(undefined);
      }
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
    fromTour?: boolean
  ) => {
    if (doTour && fromTour) {
      setImprovedRecipe({
        recipeText: `This is an example improved recipe. 
          Click on the sentences you think are new! 
          You can like or dislike the sentences.
          Depending on the version, what you need to do will change! 
          After the tour you'll write your own recipe!
          So get ready!`,
        annotations: {
          This: [["th", 0]],
          an: [["an", 2]],
          like: [["like", 16]],
          tour: [["tour", 34]],
        },
        explanations: {
          This: "This is an example explanation.",
          an: "This is an example explanation.",
          like: "This is an example explanation.",
          tour: "This is an example explanation.",
        },
      });
      setCurrentPage(3);
      setTimeout(() => startTour(refState), 1);
      setAppStep(2);
      return true;
    }
    // console.log('Submitting recipe mainpage: ', recipe, fromTour)
    // Check the length of the recipe
    if (recipe.length < 25) {
      api.error({
        message: "Error",
        description: "Please enter a longer recipe.",
        placement: "top",
      });
      return false;
    }
    const rule_counts = [3, 5, 10, 20, 30];
    // console.log(`Submitting hit with recipe: ${recipe} and improvementLevel: ${improvementLevel}, num_rules: ${rule_counts[improvementLevel]}`)
    setimprovedRecipeLoading(true);
    setAppStep(1);
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
        language: i18n.language,
      } as BackendInput);
      console.log("Sending data through WebSocket:", dataToSend);

      // Send data through WebSocket
      ws.send(dataToSend);
      setOriginalRecipe(recipe);
      return true;
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
      setAppStep(0);
      return false;
    }
  };

  const finishReview = (results: BackendUserResultDetails) => {
    if (doTour) {
      setDoTour(false);
      // Set cookieTour to true
      document.cookie = "tour=true;max-age=31536000";
      finishFn();
      return;
    }
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
          console.error("Trace Data:", data);
          // Go to results page.
          // Reset all the states
          setOriginalRecipe("");
          setImprovedRecipe(undefined);
          setimprovedRecipeLoading(false);
          setRevealExtraWord(() => () => {});
          setRevealAllWords(() => () => {});
          finishFn();
        })
      )
      .catch((error) => {
        console.error(error);
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
          <RecipeForm submitHit={submitHit} api={api} />
        </Col>
        <Col span={12}>
          {
            // App version 0 & 1 has the user highlighting the changes, thus we require the reveal buttons
            appVersion < 2 && (
              <Card
                title={t("MainPage.ImprovedRecipe")}
                loading={improvedRecipeLoading}
                ref={refMap["improved-recipe-wrapper"]}
                // actions={[
                //   <Popover
                //     content={
                //       "Reveal one extra " +
                //       (currentMode === "sentence" ? "sentence" : "word") +
                //       "!"
                //     }
                //   >
                //     <QuestionOutlined
                //       onClick={revealExtraWord}
                //       ref={refMap["reveal-next-change"]}
                //     />
                //   </Popover>,
                //   <Popover
                //     content={
                //       "Reveal all " +
                //       (currentMode === "sentence" ? "sentences" : "words") +
                //       "!"
                //     }
                //   >
                //     <BulbOutlined
                //       onClick={revealAllWords}
                //       ref={refMap["reveal-all-changes"]}
                //     />
                //   </Popover>,
                // ]}
              >
                {appVersion === 1 &&
                  improvedRecipe &&
                  currentMode === "sentence" && (
                    <UserHighlightWeExplain
                      improvedRecipe={improvedRecipe}
                      sendUserResults={finishReview}
                      setRevealExtraWord={setRevealExtraWord}
                      setRevealAllWords={setRevealAllWords}
                      waitToFindAllWords={false}
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
                      waitToFindAllWords={false}
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
                      waitToFindAllWords={false}
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
                      waitToFindAllWords={false}
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
              ref={refMap["improved-recipe-wrapper"]}
            >
              {appVersion === 2 &&
                improvedRecipe &&
                currentMode === "sentence" && (
                  <WeHighlightUserExplain
                    improvedRecipe={improvedRecipe}
                    sendUserResults={finishReview}
                    waitToFindAllWords={false}
                  />
                )}
              {appVersion === 2 && improvedRecipe && currentMode === "word" && (
                <WeHighlightUserExplain_word
                  improvedRecipe={improvedRecipe}
                  sendUserResults={finishReview}
                  waitToFindAllWords={false}
                />
              )}
              {appVersion === 3 &&
                improvedRecipe &&
                currentMode === "sentence" && (
                  <WeHighlightWeExplain
                    improvedRecipe={improvedRecipe}
                    sendUserResults={finishReview}
                    waitToFindAllWords={false}
                  />
                )}
              {appVersion === 3 && improvedRecipe && currentMode === "word" && (
                <WeHighlightWeExplain_word
                  improvedRecipe={improvedRecipe}
                  sendUserResults={finishReview}
                  waitToFindAllWords={false}
                />
              )}
              {!improvedRecipe && <Empty description="No recipe yet!" />}
            </Card>
          )}
        </Col>
      </Row>
    </Space>
  );
};
