import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Input, Button, Slider, Row, Col, Typography, Space } from "antd";
import "./RecipeForm.css";
import { NotificationInstance } from "antd/es/notification/interface";
import { IPageRef, TourContext } from "..";
import { useTranslation } from "react-i18next";

type RecipeFormProps = {
  submitHit: (
    recipe: string,
    improvementLevel: number,
    fromTour?: boolean
  ) => Promise<boolean>;
  api: NotificationInstance;
};

export const RecipeForm: React.FC<RecipeFormProps> = ({ submitHit, api }) => {
  const [recipe, setRecipe] = useState<string>("");
  const [improvementLevel, setImprovementLevel] = useState<number>(2);
  const [recentlyShown, setRecentlyShown] = useState<boolean>(false);
  const [inputsDisabled, setInputsDisabled] = useState<boolean>(false);
  const { t } = useTranslation();
  const handleSubmit = async (fromTour?: boolean) => {
    // console.log("Submitting recipe: ", recipe);
    setInputsDisabled(true);
    const resultOfSubmit = await submitHit(recipe, improvementLevel, fromTour);
    if (!resultOfSubmit) {
      setInputsDisabled(false);
    }
  };

  const formatter = (value: number | undefined) => {
    if (value === undefined) {
      return t("RecipeForm.Slider.Level1");
    }
    switch (value) {
      case 0:
        return t("RecipeForm.Slider.Level1");
      case 1:
        return t("RecipeForm.Slider.Level2");
      case 2:
        return t("RecipeForm.Slider.Level3");
      case 3:
        return t("RecipeForm.Slider.Level4");
      case 4:
        return t("RecipeForm.Slider.Level5");
    }
  };

  const sliderChange = (value: number) => {
    setImprovementLevel(value);
    if (!recentlyShown && value === 4) {
      api.warning({
        message: "Warning",
        description: t("RecipeForm.Warning"),
        placement: "top",
        onClose: () => setRecentlyShown(false),
      });
      setRecentlyShown(true);
    }
  };

  // Ref Map
  const refMap: Record<string, React.RefObject<HTMLDivElement>> = {};
  refMap["recipe-form"] = useRef<HTMLDivElement>(null);
  refMap["improvement-level"] = useRef<HTMLDivElement>(null);
  refMap["submit-recipe"] = useRef<HTMLDivElement>(null);

  const { startTour, doTour, currentPage, setCurrentPage, setTourOpen } =
    useContext(TourContext);

  const createTour = () => {
    const refs: IPageRef[] = [];
    refs.push({
      title: "Your recipe!",
      content: `writing your recipe here! Any recipe is fine, but make sure it's at least 25 characters long!`,
      target: refMap["recipe-form"],
      onClose: () => {
        handleSubmit(true);
        setTourOpen(false);
      },
    });
    refs.push({
      title: "Submit!",
      content: "Send your recipe to the AI chef by clicking here!",
      target: refMap["submit-recipe"],
      onNext: () => {
        handleSubmit(true);
        setTourOpen(false);
      },
      onClose: () => {
        handleSubmit(true);
        setTourOpen(false);
      },
    });
    return refs;
  };

  useEffect(() => {
    if (!doTour) return;
    if (currentPage === 2) return;
    if (currentPage === 1) {
      setCurrentPage(2);
      startTour(createTour());
    }
  }, [startTour, doTour, currentPage, setCurrentPage, createTour]);

  return (
    <Form style={{ height: "100%" }}>
      <span ref={refMap["recipe-form"]}>
        <Form.Item
          name="recipe"
          style={{ height: "100%" }}
          label={t("RecipeForm.Form")}
        >
          <Input.TextArea
            rows={8}
            className="recipe-input"
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            disabled={inputsDisabled || doTour}
          />
        </Form.Item>
      </span>
      <Form.Item>
        <Row>
          <Col span={12}>
            <div style={{ display: "none" }}>
              <Typography.Text style={{ marginRight: "10px" }}>
                {t("RecipeForm.Slider.Label")}
              </Typography.Text>
              <span ref={refMap["improvement-level"]}>
                <Slider
                  min={0}
                  max={4}
                  onChange={(value: number) => sliderChange(value)}
                  value={improvementLevel}
                  tooltip={{ formatter }}
                  style={{ marginTop: "20px" }}
                  disabled={inputsDisabled}
                />
              </span>
            </div>
          </Col>
          <Col span={12}>
            <Space direction="vertical" style={{ display: "flex" }} align="end">
              <Button
                type="primary"
                htmlType="submit"
                disabled={inputsDisabled}
                ref={refMap["submit-recipe"]}
                onClick={() => handleSubmit()}
              >
                {t("RecipeForm.SubmitButton")}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default RecipeForm;
