import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Form, Popover, Button, Typography, theme } from "antd";
import "./ImprovedRecipeDisplay.css";
import { BackendUserResultDetails, ImprovedRecipe } from "../../../types";
import { DislikeOutlined, LikeOutlined } from "@ant-design/icons";
import confetti from "canvas-confetti"; // Import the library
import TextArea from "antd/es/input/TextArea";
import { IPageRef, TourContext } from "../../AppTour/TourContext";
import useLogger from "../../../helpers/useLogger";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type ImprovedRecipeDisplayProps = {
  improvedRecipe: ImprovedRecipe;
  sendUserResults: (res: BackendUserResultDetails) => void;
  setRevealExtraWord: (fn: () => void) => void;
  setRevealAllWords: (fn: () => void) => void;
  waitToFindAllWords?: boolean;
};

interface ClickableSentenceProps {
  sentence: string;
  index: number;
  onAccept: (index: number, sentenceExplanation: string) => void;
  onDecline: (index: number, sentenceExplanation: string) => void;
  toggleSelection: (index: number) => void;
  showPopover: boolean;
  setShowPopover: (index: number | null) => void;
  getSentenceStyle?: (index: number) => React.CSSProperties;
  wordsIncluded: { word: string; wordIndex: number }[];
  sentenceStyle?: React.CSSProperties;
  sentenceExplanation: string;
  handleExplanationChange: (index: number, newExplanation: string) => void;
  popRef: React.RefObject<HTMLDivElement> | undefined;
  spanRef: React.RefObject<HTMLSpanElement> | undefined;
  t: TFunction<"translation", undefined>;
}

type BreakElementProps = {};
type ClickableSentenceTempProps = {
  sentence: string;
  index: number;
  toggleSelection: (index: number) => void;
  wordsIncluded: { word: string; wordIndex: number }[];
};

const ClickableSentence: React.FC<ClickableSentenceProps> = React.memo(
  ({
    sentence,
    index,
    onAccept,
    onDecline,
    toggleSelection,
    showPopover,
    setShowPopover,
    sentenceExplanation,
    handleExplanationChange,
    sentenceStyle,
    popRef,
    spanRef,
    t
  }) => {
    return (
      <Popover
        content={
          <div>
            <TextArea
              placeholder={t("ExplanationPlaceHolder")}
              autoSize={{ minRows: 3, maxRows: 5 }}
              style={{ marginBottom: "5px" }}
              value={sentenceExplanation}
              onChange={(e) => {
                handleExplanationChange(index, e.target.value);
              }}
            />
            <div className="like-dislike-container">
              <Button
                className="like-button"
                onClick={() => onAccept(index, sentenceExplanation)}
              >
                <LikeOutlined />
              </Button>
              <Button
                className="dislike-button"
                onClick={() => onDecline(index, sentenceExplanation)}
              >
                <DislikeOutlined />
              </Button>
            </div>
          </div>
        }
        trigger="click"
        visible={showPopover}
        onVisibleChange={(visible) => !visible && setShowPopover(null)}
        ref={popRef}
      >
        <span
          style={{ ...sentenceStyle, marginRight: "5px", cursor: "pointer" }}
          onClick={() => toggleSelection(index)}
          ref={spanRef}
        >
          {sentence}{" "}
        </span>
      </Popover>
    );
  },
  (prevProps, nextProps) =>
    prevProps.showPopover === nextProps.showPopover &&
    prevProps.sentenceExplanation === nextProps.sentenceExplanation &&
    JSON.stringify(prevProps.sentenceStyle) ===
      JSON.stringify(nextProps.sentenceStyle),
);

export const ImprovedRecipeDisplaySentenceScale: React.FC<
  ImprovedRecipeDisplayProps
> = ({
  improvedRecipe,
  sendUserResults,
  setRevealExtraWord,
  setRevealAllWords,
  waitToFindAllWords = true,
}) => {
  const [sentenceExplanations, setSentenceExplanations] = useState<
    Map<number, string>
  >(new Map());
  const [selectedSentences, setSelectedSentences] = useState<
    Map<number, string>
  >(new Map());
  const [showPopover, setShowPopover] = useState<number | null>(null);
  const [allWordsSelected, setAllWordsSelected] = useState<boolean>(false);
  const [elements, setElements] = useState<
    (BreakElementProps | ClickableSentenceProps)[]
  >([]);
  const [wordToSentenceIndex, setWordToSentenceIndex] = useState<
    Map<number, number>
  >(new Map());
  const [totalSentenceCount, setTotalSentenceCount] = useState<
    number | undefined
  >();
  const [sentences, setSentences] = useState<string[]>([]);
  // console.log('WordToSentenceIndex', wordToSentenceIndex)
  // Read dark mode from config
  const { theme: themeToken } = theme.useToken();
  const isDarkMode = themeToken.id === 1;
  const { recipeText, annotations } = improvedRecipe;
  const { logPopupOpen, logLiked, logDisliked, logWrongSelection, logWriteExplanation, getResults } = useLogger();

  // Ref Map
  const refMap: Record<string, React.RefObject<HTMLDivElement>> = {};
  refMap["all-word-wrapper"] = useRef<HTMLDivElement>(null);
  refMap["result-wrapper"] = useRef<HTMLDivElement>(null);

  refMap["first-sentence"] = useRef<HTMLDivElement>(null);
  refMap["third-sentence"] = useRef<HTMLDivElement>(null);
  refMap["fifth-sentence"] = useRef<HTMLDivElement>(null);

  refMap["first-sentence-pop"] = useRef<HTMLDivElement>(null);
  refMap["third-sentence-pop"] = useRef<HTMLDivElement>(null);
  refMap["fifth-sentence-pop"] = useRef<HTMLDivElement>(null);

  const { startTour, doTour, currentPage, setCurrentPage } =
    useContext(TourContext);
  const createTour = () => {
    const refs: IPageRef[] = [];
    refs.push({
      title: "Find the changes!",
      content: "You'll need to find the new sentences that have been added to your recipe!",
      target: refMap["first-sentence"],
      onNext: () => {
        refMap["first-sentence"]?.current?.click();
      },
      preventClose: true,
    });
    refs.push({
      title: "Why did we do this?",
      content:
        "Clicking on a marked change will bring this popup.\
        In this pop up you'll be asked to explain why you think this change was made.\
        Also, select whether you like or dislike this change.",
      target: refMap["first-sentence-pop"],
      onNext: () => {
        handleAccept(0, "Explanation from tour");
      },
      preventClose: true,
    });
    refs.push({
      title: "Find ALL the changes!",
      content: "You'll need to find all the changes!",
      target: refMap["all-word-wrapper"],
      onNext: () => {
        handleAccept(2, "Explanation from tour");
        handleDecline(4, "Explanation from tour");
      },
      preventClose: true,
    });
    refs.push({
      title: "Wrapping up!",
      content:
        "After you finding and explaining\
        all the changes you'll be able to submit your results!",
      target: refMap["result-wrapper"],
      onClose: () => {
        finishReview();
      },
    });
    return refs;
  };

  useEffect(() => {
    if (!doTour) return;
    if (currentPage === 5) return;
    if (currentPage === 4) {
      setCurrentPage(5);
      startTour(createTour());
    }
  }, [startTour, doTour, currentPage, setCurrentPage, createTour]);

  const getSentenceStyle = (sentenceIndex: number) => {
    const status = selectedSentences.get(sentenceIndex);
    // console.log('Getting style for sentence', sentenceIndex, status)
    if (!isDarkMode) {
      switch (status) {
        case "correct":
          return {
            backgroundColor: "#f0f5ff",
            border: "1px solid #1890ff",
            borderRadius: "4px",
            padding: "2px",
          };
        case "incorrect":
          return {
            backgroundColor: "#ffa39e",
            animation: "fadeBack 1s",
            borderRadius: "4px",
            padding: "2px",
          }; // Light red
        case "accepted":
          return {
            backgroundColor: "#b7eb8f",
            border: "1px solid #52c41a",
            borderRadius: "4px",
            padding: "2px",
          }; // Light green
        case "declined":
          return {
            backgroundColor: "#ffd591",
            border: "1px solid #faad14",
            borderRadius: "4px",
            padding: "2px",
          }; // Light orange
        default:
          return {};
      }
    } else {
      // Dark mode catppucin colors
      switch (status) {
        case "correct":
          return {
            backgroundColor: "#1f2d3d",
            border: "1px solid #1890ff",
            borderRadius: "4px",
            padding: "2px",
          };
        case "incorrect":
          return {
            backgroundColor: "#3b1f1f",
            animation: "fadeBack 1s",
            borderRadius: "4px",
            padding: "2px",
          }; // Light red
        case "accepted":
          return {
            backgroundColor: "#1f3b1f",
            border: "1px solid #52c41a",
            borderRadius: "4px",
            padding: "2px",
          }; // Light green
        case "declined":
          return {
            backgroundColor: "#3b2e1f",
            border: "1px solid #faad14",
            borderRadius: "4px",
            padding: "2px",
          }; // Light orange
        default:
          return {};
      }
    }
  };

  const { indices } = useMemo(() => {
    const indices = new Set<number>();
    Object.values(annotations).forEach((tuples) => {
      tuples.forEach(([, index]) => {
        indices.add(index);
      });
    });
    return { indices };
  }, [annotations]);

  useEffect(() => {
    setRevealExtraWord(() => () => {
      // Find index that is in annotations but not in selectedWords
      const indicesInAnnotations = Array.from(indices).map((index) =>
        wordToSentenceIndex.get(index),
      );
      const indicesInSelectedWords = Array.from(selectedSentences.keys());
      const indicesNotSelected = indicesInAnnotations.filter(
        (index) =>
          index !== undefined && !indicesInSelectedWords.includes(index),
      );
      // console.log('Indices in annotations', indicesInAnnotations)
      // console.log('Indices in selected words', indicesInSelectedWords)
      // console.log('Indices not selected', indicesNotSelected)
      const randomIndex =
        indicesNotSelected[
          Math.floor(Math.random() * indicesNotSelected.length)
        ];
      // console.log('Random index', randomIndex)
      // console.log('Sentence index', sentenceIndex)
      if (randomIndex !== undefined) {
        setSelectedSentences((prev) => {
          const newSelected = new Map(prev);
          newSelected.set(randomIndex, "correct");
          return newSelected;
        });
        setShowPopover(randomIndex);
      }
    });
    setRevealAllWords(() => () => {
      // Find ALL indices that are in annotations but not in selectedWords
      const indicesInAnnotations = Array.from(indices).map((index) =>
        wordToSentenceIndex.get(index),
      );
      const indicesInSelectedWords = Array.from(selectedSentences.keys());
      const indicesNotSelected = indicesInAnnotations.filter(
        (index) =>
          index !== undefined && !indicesInSelectedWords.includes(index),
      );
      // console.log('Indices in annotations', indicesInAnnotations)
      // console.log('Indices in selected words', indicesInSelectedWords)
      // console.log('Indices not selected', indicesNotSelected)
      // console.log('Sentence Indices not selected', indicesNotSelected.map((index) => wordToSentenceIndex.get(index)))
      indicesNotSelected.forEach((randomIndex) => {
        // console.log('Random index', randomIndex)
        // console.log('Sentence index', sentenceIndex)
        if (randomIndex !== undefined) {
          setSelectedSentences((prev) => {
            const newSelected = new Map(prev);
            newSelected.set(randomIndex, "correct");
            return newSelected;
          });
          setShowPopover(randomIndex);
        }
      });
    });
  }, [selectedSentences, indices, wordToSentenceIndex]);

  useEffect(() => {
    // Count the current accepted + declined word count
    const acceptedSentences = Array.from(selectedSentences.values()).filter(
      (status) => status === "accepted",
    ).length;
    const declinedSentences = Array.from(selectedSentences.values()).filter(
      (status) => status === "declined",
    ).length;
    const totalWords = acceptedSentences + declinedSentences;
    if (
      totalSentenceCount &&
      totalWords === totalSentenceCount &&
      !allWordsSelected
    ) {
      setAllWordsSelected(true);
      confetti({
        angle: 60,
        spread: 55,
        particleCount: 150,
        origin: { x: 0 }, // start from the left
      });
      confetti({
        angle: 120,
        spread: 55,
        particleCount: 150,
        origin: { x: 1 }, // start from the right
      });
    }
  }, [selectedSentences, totalSentenceCount]);

  const finishReview = () => {
    const res: BackendUserResultDetails = {
      improvedRecipe: recipeText,
      selectedIndexes: Object.fromEntries(selectedSentences),
      providedExplanations: Object.fromEntries(
        sentenceExplanations || new Map(),
      ),
      timestamp: new Date().toISOString(),
      sentences: sentences,
      mode: "sentence",
      variant: "UserHighlightUserExplain",
      timeDetails: getResults(),
    };
    // console.log('Sending to trace backend: ', res)
    sendUserResults(res);
  };

  // useCallback to memoize the function
  const handleAccept = useCallback(
    (index: number, sentenceExplanation: string) => {
      // Check whether the explanation is longer than 5 characters
      if (sentenceExplanation.length < 5) {
        return;
      }
      setSelectedSentences((prev) => {
        const newSelected = new Map(prev);
        newSelected.set(index, "accepted");
        return newSelected;
      });
      setShowPopover(null);
      logLiked(index);
    },
    [],
  );

  // useCallback to memoize the function
  const handleDecline = useCallback(
    (index: number, sentenceExplanation: string) => {
      // Check whether the explanation is longer than 5 characters
      if (sentenceExplanation.length < 5) {
        return;
      }
      setSelectedSentences((prev) => {
        const newSelected = new Map(prev);
        newSelected.set(index, "declined");
        return newSelected;
      });
      setShowPopover(null);
      logDisliked(index);
    },
    [],
  );

  useEffect(() => {
    let sentenceIndex = 0; // Tracks the index of sentences
    const wordIndexToSentenceIndex = new Map<number, number>();
    let totalSentenceCountTemp = 0;
    let wordIndexCounter = 0;
    const sentencesTemp: string[] = [];
    const elementsTemp = recipeText.split("\n").flatMap((line, _) => {
      if (line.trim().length === 0) {
        return {} as BreakElementProps;
      }
      // Grab each sentence from the line
      let lineMatch = line.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
      if (lineMatch === null) {
        lineMatch = [line];
      }
      const sentenceElements = lineMatch.map((sentence, _) => {
        // Boundary calculation
        // split and Remove words that are just ""
        const wordsInSentence = sentence
          .split(/\s+/)
          .filter((word) => word !== "");
        const currentSentenceIndex = sentenceIndex;
        sentenceIndex += 1;
        // Iterate over the annotations and find the words that are in the sentence
        const wordAnnotations = Object.entries(annotations);
        let wordIndexes: { word: string; wordIndex: number }[];
        if (wordAnnotations !== undefined) {
          wordIndexes = wordAnnotations
            .map(([origWord, wordAnnotations]) => 
              wordAnnotations.map(([word, wordIndex]) => {
                if(wordIndex >= wordIndexCounter && wordIndex < wordIndexCounter + wordsInSentence.length){
                  return {
                    word: word,
                    wordIndex: wordIndex,
                    origWord: origWord,
                  };
                }
                return null;
              })
            )
            .flat()
            .filter((item): item is { word: string; wordIndex: number; origWord: string } => item !== null);

          // Map the wordIndexes to the sentenceIndex
          // console.log('Sentence', currentSentenceIndex, 'has words', wordAnnotations, 'between Indexes', wordIndexCounter, 'and', wordIndexCounter + wordsInSentence.length, wordsInSentence)
          wordIndexes.forEach(({ word: _, wordIndex }) => {
            if (
              wordIndex >= wordIndexCounter &&
              wordIndexCounter < wordIndexCounter + wordsInSentence.length
            ) {
              wordIndexToSentenceIndex.set(wordIndex, currentSentenceIndex);
            }
          });

          if (wordIndexes.length > 0) {
            totalSentenceCountTemp += 1;
          }
        } else {
          wordIndexes = [];
        }

        const toggleSentenceSelection = () => {
          if (wordIndexes.length > 0) {
            setSelectedSentences((prev) => {
              const newSelected = new Map(prev);
              newSelected.set(currentSentenceIndex, "correct");
              return newSelected;
            });
            logPopupOpen(currentSentenceIndex);
            setShowPopover(currentSentenceIndex);
          } else {
            setSelectedSentences((prev) => {
              const newSelected = new Map(prev);
              newSelected.set(currentSentenceIndex, "incorrect");
              return newSelected;
            });
            logWrongSelection(currentSentenceIndex);
            // Clear incorrect status after animation duration
            setTimeout(() => {
              setSelectedSentences((prev) => {
                const newSelected = new Map(prev);
                newSelected.delete(currentSentenceIndex);
                return newSelected;
              });
            }, 1000);
          }
        };
        sentencesTemp.push(sentence);
        wordIndexCounter += wordsInSentence.length;
        return {
          sentence: sentence,
          index: currentSentenceIndex,
          toggleSelection: toggleSentenceSelection,
          wordsIncluded: wordIndexes,
        } as ClickableSentenceTempProps;
      });

      // Add a line break after each line
      return [
        ...(sentenceElements as ClickableSentenceTempProps[]),
        {} as BreakElementProps,
      ];
    });
    setElements(elementsTemp);
    setWordToSentenceIndex(wordIndexToSentenceIndex);
    setTotalSentenceCount(totalSentenceCountTemp);
    setSentences(sentencesTemp);
  }, [recipeText, annotations]);

  const handleExplanationChange = useCallback(
    (index: number, newExplanation: string) => {
      setSentenceExplanations((prev) => {
        const newExplanations = new Map(prev);
        newExplanations.set(index, newExplanation);
        return newExplanations;
      });
      logWriteExplanation(index, newExplanation);
    },
    [setSentenceExplanations],
  );
  const { t } = useTranslation();
  // Animation classes added to the elements
  const submitButtonClass = allWordsSelected ? "submit-button-enter" : "";
  const congratsClass = allWordsSelected ? "congrats-text-enter" : "";
  return (
    <Form layout="vertical">
      <Form.Item>
        <div style={{ whiteSpace: "pre-wrap", userSelect: "text" }}>
          {elements.map((element, index) => {
            if ("sentence" in element) {
              return (
                <ClickableSentence
                  key={`sentence-${index}`}
                  {...element}
                  showPopover={showPopover === element.index}
                  sentenceStyle={getSentenceStyle(element.index)}
                  setShowPopover={setShowPopover}
                  sentenceExplanation={
                    sentenceExplanations.get(element.index) || ""
                  }
                  handleExplanationChange={handleExplanationChange}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  popRef={
                    doTour && currentPage === 3 && index === 0
                      ? refMap["first-sentence-pop"]
                      : doTour && currentPage === 3 && index === 2
                        ? refMap["third-sentence-pop"]
                        : doTour && currentPage === 3 && index === 4
                          ? refMap["fifth-word-pop"]
                          : undefined
                  }
                  spanRef={
                    doTour && currentPage === 3 && index === 0
                      ? refMap["first-sentence"]
                      : doTour && currentPage === 3 && index === 2
                        ? refMap["third-sentence"]
                        : doTour && currentPage === 3 && index === 4
                          ? refMap["fifth-sentence"]
                          : undefined
                  }
                />
              );
            } else {
              return <br key={`br-${index}`} />;
            }
          })}
        </div>
      </Form.Item>
      {(!waitToFindAllWords || allWordsSelected) && (
        <Form.Item>
          {waitToFindAllWords && (
            <Typography.Text strong className={congratsClass}>
              {t("CongratulationsMessage")}
            </Typography.Text>
          )}
          <Button
            type="primary"
            className={submitButtonClass}
            onClick={finishReview}
          >
            Submit your results!
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default ImprovedRecipeDisplaySentenceScale;
