import { Space } from "antd";
import {
  Guider,
} from "../../components";
import { NotificationInstance } from "antd/es/notification/interface";
import { useMemo } from "react";
import { MainPage } from "../MainPage/MainPage";
import { useAppVersionContext } from "../../helpers";
interface AppFlowProps {
  appStep: number;
  setAppStep: React.Dispatch<React.SetStateAction<number>>;
  api: NotificationInstance;
  setActivePage: (page: string) => void;
  currentMode: string;
}
const backendUrlHttp = import.meta.env.VITE_BACKEND_HTTP_URL;

export const AppFlow = ({
  appStep,
  setAppStep,
  setActivePage,
  api,
  currentMode,
}: AppFlowProps) => {
  const { appVersion } = useAppVersionContext();

  const renderPart = useMemo(() => {
    switch (appStep) {
      default:
        return (
          <MainPage
            api={api}
            key={"application-use-1"}
            setAppStep={setAppStep}
            finishFn={() => {
              setActivePage("result");
              setAppStep(0);
            }}
            currentMode={currentMode}
            backendUrlHttp={backendUrlHttp}
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
