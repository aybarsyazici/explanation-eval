import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ConfigProvider, theme } from "antd";
import { catppuccinColors } from "../catppuccin_scheme";
import { TourProvider } from "./components";
import { WebSocketProvider } from "./helpers/WebSocketContext.tsx";
import "./index.css";
const backendUrl = "wss://gelex-backend-a3bfadfb8f41.herokuapp.com/ws/example-simple";
// const backendUrl = 'ws://localhost:8000/ws/example-simple';



const Main = () => {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const cookie = document.cookie
    .split(";")
    .find((cookie) => cookie.includes("darkMode"));
  const cookieDark = cookie ? cookie.split("=")[1] === "true" : false;
  const [isDarkMode, setIsDarkMode] = useState(cookieDark);
  // Set the cookie
  document.cookie = `darkMode=${isDarkMode}`;
  const themeColors = isDarkMode
    ? catppuccinColors.Mocha
    : catppuccinColors.Latte;
  console.log("MAIN MOUNTED")
  return (
    <React.StrictMode>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorText: themeColors.text,
            colorTextSecondary: themeColors.subtext0,
            colorTextTertiary: themeColors.subtext1,
            colorTextQuaternary: themeColors.overlay0,
            colorBorder: themeColors.border,
            colorBorderSecondary: themeColors.overlay1,
            colorFill: themeColors.fill,
            colorFillSecondary: themeColors.overlay2,
            colorFillTertiary: themeColors.surface0,
            colorFillQuaternary: themeColors.surface1,
            colorBgLayout: themeColors.mantle,
            colorBgContainer: themeColors.crust,
            colorBgElevated: themeColors.base,
            colorBgSpotlight: themeColors.peach, // Example, choose as per your preference
            colorBgBlur: "rgba(255, 255, 255, 0.5)", // Assuming a light blur effect
            colorPrimary: themeColors.red,
            colorPrimaryBg: themeColors.pink, // Example, choose as per your preference
            colorPrimaryBgHover: themeColors.mauve, // Example, choose as per your preference
            colorPrimaryBorder: themeColors.blue, // Example, choose as per your preference
            colorPrimaryBorderHover: themeColors.teal, // Example, choose as per your preference
            colorPrimaryHover: themeColors.green, // Example, choose as per your preference
            colorPrimaryActive: themeColors.maroon, // Example, choose as per your preference
            colorPrimaryTextHover: themeColors.yellow, // Example, choose as per your preference
            colorPrimaryText: themeColors.peach, // Example, choose as per your preference
            colorPrimaryTextActive: themeColors.flamingo, // Example, choose as per your preference
            // ... map other Catppuccin colors to corresponding Ant Design theme tokens
          },
        }}
      >
        <WebSocketProvider backendUrl={backendUrl}>
          <TourProvider>
            <App
              setDarkMode={setIsDarkMode}
            />
          </TourProvider>
        </WebSocketProvider>
      </ConfigProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Main />);
