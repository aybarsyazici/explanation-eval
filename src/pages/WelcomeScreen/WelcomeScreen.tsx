import React from "react";
import { List, Button, Typography, Modal, Input, Space } from "antd";
import {
  ArrowUpOutlined,
  CoffeeOutlined,
  GlobalOutlined,
  PoweroffOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "./WelcomeScreen.css";
import { NotificationInstance } from "antd/es/notification/interface";
import { useAppVersionContext } from "../../helpers";
import { useTranslation } from "react-i18next";

type WelcomeScreenProps = {
  onMenuSelect: (menu: string) => void;
  toggleDarkMode: () => void;
  className?: string;
  isDarkMode: boolean;
  currentMode: string;
  setCurrentMode?: (mode: string) => void;
  activeTab: string;
  api: NotificationInstance;
  appStep: number;
};


// create a dictionary with app passwords
const passwordDefinitions = {
  appv1xhyu: 0,
  appv2bpog: 1,
  appv3hiec: 2,
  appv4oume: 3,
};

const appVersionToPassword = {
  0: "appv1xhyu",
  1: "appv2bpog",
  2: "appv3hiec",
  3: "appv4oume",
};

const { Text } = Typography;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onMenuSelect,
  toggleDarkMode,
  className,
  isDarkMode,
  currentMode,
  setCurrentMode,
  activeTab,
  api,
  appStep,
}) => {
  // Use the current app's password as the default modal test
  const { changeAppVersion, appVersion } = useAppVersionContext();
  const [modalText, setModalText] = React.useState(
      //@ts-ignore
    appVersion !== -1 ? appVersionToPassword[appVersion] : "",
  );
  // Does the userId cookie exists? If so find it and set it to the userId variable
  const [userId, setUserId] = React.useState(
    document.cookie
      .split(";")
      .find((cookie) => cookie.includes("userId"))
      ?.split("=")[1] || "",
  );
  // Set modal to open if userID or modalText is empty
  const [isModalOpen, setIsModalOpen] = React.useState(
    userId === "" || modalText === "",
  );
  const { t, i18n } = useTranslation();
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    if (modalText in passwordDefinitions && userId !== "") {
      //@ts-ignore
      changeAppVersion(passwordDefinitions[modalText]);
      // Save the userID to a cookie
      document.cookie = `userId=${userId}`;
      api.success({
        message: "Success",
        description:
          //@ts-ignore
          t("AppVersion.Change") + passwordDefinitions[modalText].toString(),
        placement: "top",
      });
      setIsModalOpen(false);
    } else {
      console.log("Invalid version");
      api.error({
        message: "Error",
        description: t("AppVersion.Invalid"),
        placement: "top",
      });
    }
  };
  const handleCancel = () => {
    // Check if the password 
    setIsModalOpen(false);
  };
  // Add one more element to the menuItems array
  const myMenuItems = [
    { key: "app", label: t("WelcomeScreen.Start"), icon: <CoffeeOutlined /> },
    { key: "toggle", label: t("WelcomeScreen.DarkMode"), icon: <SettingOutlined /> },
    {
      key: "lang-switch", label: t("WelcomeScreen.SwitchLang"), icon: <GlobalOutlined />,
    },
    // { key: "sentence-mode", label: t("WelcomeScreen.SwitchMode"), icon: <GlobalOutlined /> },
    { key: "modal", label:  t("Tour.Change"), icon: <PoweroffOutlined /> },
  ];

  const onClickHandler = (key: string) => {
    switch (key) {
      case "toggle":
        toggleDarkMode();
        break;
      case "sentence-mode":
          setCurrentMode && setCurrentMode(currentMode === "word" ? "sentence" : "word");
        break;
      case "tour":
        if (activeTab === "app" && appStep !== 0) {
          api.warning({
            message: "Warning",
            description: t("Tour.Warning"),
            placement: "top",
          });
          return;
        }
        setCurrentMode && setCurrentMode("word");
        break;
      case "modal":
        showModal();
        break;
      case "lang-switch":
        i18n.changeLanguage(i18n.language === "en" ? "fr" : "en");
        break;
      default:
        if (key !== "app") return;
        onMenuSelect(key);
        break;
    }
  };


  return (
    <div
      className={`welcome-screen ${className}`}
      data-theme={isDarkMode ? "dark" : "light"}
    >
      <Modal
        title={t("WelcomeScreen.ChangeAppMessage")}
        open={isModalOpen}
        onCancel={handleCancel}
        maskClosable={false}
        closable={false}
        footer={<Button onClick={handleOk}>{t("WelcomeScreen.Save")}</Button>}
      >
        <Space direction="vertical" style={{ display: 'flex' }}>
          <Input
            addonAfter={t("WelcomeScreen.UserIDLabel")}
            placeholder={t("WelcomeScreen.UserIDMessage")}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Input
            addonAfter={t("WelcomeScreen.PasswordLabel")}
            placeholder={t("WelcomeScreen.PasswordMessage")}
            value={modalText}
            onChange={(e) => setModalText(e.target.value)}
          />
        </Space>
      </Modal>
      <Text className="menu-info-text">
        <ArrowUpOutlined /> {t("WelcomeScreen.HoverMessage")}  <ArrowUpOutlined />
      </Text>
      <span>
        <List
          header={<div>{t("WelcomeScreen.WelcomeMessage")}</div>}
          dataSource={myMenuItems}
          className="menu-list"
          renderItem={(item) => (
            <List.Item>
              <Button
                type="link"
                size="large"
                icon={item.icon}
                onClick={() => onClickHandler(item.key)}
                className="menu-item-button"
                id={"welcome-menu-" + item.key}
              >
                {item.label}
              </Button>
            </List.Item>
          )}
        />
      </span>
    </div>
  );
};

export default WelcomeScreen;
