import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  FloatButton,
  Layout,
  Row,
  notification,
  theme,
} from "antd";
const { Content } = Layout;
import "./App.css";
import { AppFlow, ResultPage } from "./pages";
import WelcomeScreen from "./pages/WelcomeScreen/WelcomeScreen";
import { AppTour, TourContext } from "./components";
import {
  useAppVersionContext,
} from "./helpers";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "../i18n.ts";
import { ForkOutlined, MenuOutlined } from "@ant-design/icons";

type AppProps = {
  setDarkMode: (isDarkMode: boolean) => void;
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

const App: React.FC<AppProps> = ({ setDarkMode }) => {
  const [activeTab, setActiveTab] = useState<string>("app"); // Set 'welcome' as initial state
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true); // Set 'welcome' as initial state
  const { appVersion } = useAppVersionContext();
  const { setDoTour } = useContext(TourContext);
  useEffect(() => {
    const cookieTour =
      document.cookie
        .split(";")
        .find((cookie) => cookie.includes("tour"))
        ?.split("=")[1] || "false";
    console.log("cookieTour", cookieTour);
    setDoTour(cookieTour === "false");
  }, [setDoTour]);
  // Does cookie for currentMode exist?
  // Read current mode from cookie
  const cookieCurrentMode =
    document.cookie
      .split(";")
      .find((cookie) => cookie.includes("currentMode"))
      ?.split("=")[1] || "sentence";
  const [currentMode, setCurrentMode] = useState<string>(cookieCurrentMode); // Set 'word' as initial state
  // Set the cookie
  document.cookie = `currentMode=${currentMode}`;

  const [appStep, setAppStep] = useState<number>(0); // Set '0' as initial state

  useEffect(() => {
    // Whenever the appStep changes, update the cookie
    document.cookie = `appStep=${appStep}`;
  }, [appStep]);

  // Read dark mode from config
  const { theme: themeToken } = theme.useToken();
  const isDarkMode = themeToken.id === 1;

  const handleToggleDarkMode = () => {
    document.cookie = `darkMode=${!isDarkMode}`;
    setDarkMode(!isDarkMode);
  };

  const [api, contextHolder] = notification.useNotification();
  const handleMenuSelect = (menu: string) => {
    setActiveTab(menu);
    // Delay hiding the WelcomeScreen to allow for animation
    setShowWelcomeScreen(false);
  };

  const handleHoverOverTop = () => {
    setShowWelcomeScreen(true);
  };

  return (
    <>
      {/* <div className="hover-target-parent">
        <div className="hover-target" onMouseOver={handleHoverOverTop} />
      </div> */}
      <Layout className="layout">
        <div className="menu-button-wrapper">
          <Button size="large" type="text" icon={<MenuOutlined/>} onClick={handleHoverOverTop}>
          Menu
          </Button>
        </div>
        {contextHolder}
        <WelcomeScreen
          className={showWelcomeScreen ? "menu-enter" : "menu-exit"}
          onMenuSelect={handleMenuSelect}
          toggleDarkMode={handleToggleDarkMode}
          isDarkMode={isDarkMode}
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          appStep={appStep}
          activeTab={activeTab}
          api={api}
        />
        <Content style={{ padding: "2rem 0rem", overflow: "auto" }}>
          <Row>
            <Col span={2} />
            <Col span={20}>
              {activeTab === "app" && (
                <AppFlow
                  appStep={appStep}
                  setAppStep={setAppStep}
                  api={api}
                  setActivePage={handleMenuSelect}
                  currentMode={currentMode}
                />
              )}
              {activeTab === "about" && <p>About Us content</p>}
              {activeTab === "result" && (
                <ResultPage setActivePage={handleMenuSelect} />
              )}
            </Col>
            <Col span={2} />
          </Row>
        </Content>
        <FloatButton
          icon={<ForkOutlined />}
          type="primary"
          tooltip={`current app version ${appVersion}`}
          /*@ts-ignore*/
        />
      </Layout>
      <AppTour />
    </>
  );
};

export default App;
