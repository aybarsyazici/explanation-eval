import { Button, Card, Col, Input, Row, Space, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import test_example from "../../../temp/test_examples.json";
import { UserTestResultsDetails } from "../../types";
import { NotificationInstance } from "antd/es/notification/interface";

type LearningTestProps = {
  finishEvent: (result: UserTestResultsDetails) => void;
  version: "pre" | "post";
  api: NotificationInstance;
};

export const LearningTest: React.FC<LearningTestProps> = ({ finishEvent, version, api }) => {
  const testExample = version === "pre" ? test_example.pre_test : test_example.post_test
  
  const [reviewText, setReviewText] = useState<string>("");
  const { t } = useTranslation();

  useEffect(() => {
    console.log("Fetching pre-test example");
    if (version === "post"){
      api.info({
        message: "Post-test",
        description: t("LearningTest.PostTestDescription"),
        placement: "top",
      });
    }
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
          title={t("LearningTest.CardTitle")}
        >
          {testExample && exampleTestProcessed}
        </Card>
      </Col>
    </Row>
  );
};

export default LearningTest;
