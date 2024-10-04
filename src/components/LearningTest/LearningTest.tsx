import { Button, Card, Col, Input, Row, Space, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import improved_example from "../../../temp/improved_recipe.json";
import { UserTestResultsDetails } from "../../types";

type LearningTestProps = {
  finishEvent: (result: UserTestResultsDetails) => void;
};

export const LearningTest: React.FC<LearningTestProps> = ({ finishEvent }) => {
  const [improvedRecipeLoading, setimprovedRecipeLoading] = useState(true);
  const [testExample, setTestExample] = useState<string>();
  const [reviewText, setReviewText] = useState<string>("");
  const { t } = useTranslation();

  useEffect(() => {
    // TODO fetch example
    console.log("Fetching pre-test example");
    setTestExample(improved_example.example_recipe);
    setimprovedRecipeLoading(false);
  }, []);

  const exampleTestProcessed = useMemo(
    () =>
      (testExample || "")
        .split("\n")
        .map((line, index) => (
          <Typography.Paragraph key={"test-example-line-" + index}>
            {line}
          </Typography.Paragraph>
        )),
    [testExample]
  );

  return (
    <Row>
      <Col span={10}>
        <Space direction="vertical" size="large" style={{ display: "flex" }}>
          <Input.TextArea
            rows={8}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            autoSize={{ minRows: 8, maxRows: 36 }}
          />
          <Button
            type="primary"
            onClick={() =>
              finishEvent({
                original_recipe: testExample || "",
                identified_improvements: reviewText,
              })
            }
          >
            {t("LearningTest.Submit")}
          </Button>
        </Space>
      </Col>
      <Col span={4} />
      <Col span={10}>
        <Card
          title={t("MainPage.ImprovedRecipe")}
          loading={improvedRecipeLoading}
        >
          {testExample && exampleTestProcessed}
        </Card>
      </Col>
    </Row>
  );
};

export default LearningTest;
