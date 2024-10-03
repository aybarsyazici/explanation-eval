import React, { useContext, useEffect, useState } from "react";
import { Col, Layout, Row, notification, theme } from "antd";
const { Content } = Layout;
import "./App.css";
import { AppFlow, ResultPage } from "./pages";
import WelcomeScreen from "./pages/WelcomeScreen/WelcomeScreen";
import { AppTour, TourContext } from "./components";
import { AppVersionProvider, useWebSocketContext } from "./helpers";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "../i18n.ts"

type AppProps = {
  setDarkMode: (isDarkMode: boolean) => void;
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

const App: React.FC<AppProps> = ({
  setDarkMode,
}) => {
  const [appStep, setAppStep] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("welcome"); // Set 'welcome' as initial state
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true); // Set 'welcome' as initial state
  const { setDoTour } = useContext(TourContext);
  const { ws } = useWebSocketContext();
  useEffect(() => {
    setDoTour(false);
  }, [setDoTour]);
  // Does cookie for currentMode exist?
  // Read current mode from cookie
  const cookieCurrentMode =
    document.cookie
      .split(";")
      .find((cookie) => cookie.includes("currentMode"))
      ?.split("=")[1] || "word";
  const [currentMode, setCurrentMode] = useState<string>(cookieCurrentMode); // Set 'word' as initial state
  // Set the cookie
  document.cookie = `currentMode=${currentMode}`;

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
    <AppVersionProvider>
      <div className="hover-target-parent">
        <div className="hover-target" onMouseOver={handleHoverOverTop} />
      </div>
      <Layout className="layout">
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
        <Content style={{ padding: "2rem 0rem", overflow: "auto"}}>
          <Row>
            <Col span={2} />
            <Col span={20}>
              {activeTab === "app" && ws !== null && (
                <AppFlow
                  appStep={appStep}
                  setAppStep={setAppStep}
                  api={api}
                  setActivePage={handleMenuSelect}
                  currentMode={currentMode}
              />)}
              {activeTab === "about" && <p>About Us content</p>}
              {activeTab === "result" && (
                <ResultPage setActivePage={handleMenuSelect} />
              )}
            </Col>
            <Col span={2} />
          </Row>
        </Content>
      </Layout>
      <AppTour />
    </AppVersionProvider>
  );
};

export default App;
