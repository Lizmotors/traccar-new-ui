import React, { useEffect, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import Header from "../common/components/Header";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useHistory,
} from "react-router-dom";
import useFeatures from "../common/util/useFeatures";

import PreferencesPage from "./PreferencesPage";
import AccumulatorsPage from "./AccumulatorsPage";
import CommandSendPage from "./CommandSendPage";
import GeofencePage from "./GeofencePage";
import DriversPage from "./DriversPage";
import DriverPage from "./DriverPage";
import CalendarsPage from "./CalendarsPage";
import CalendarPage from "./CalendarPage";
import ComputedAttributesPage from "./ComputedAttributesPage";
import ComputedAttributePage from "./ComputedAttributePage";
import MaintenancesPage from "./MaintenancesPage";
import MaintenancePage from "./MaintenancePage";
import CommandsPage from "./CommandsPage";
import CommandPage from "./CommandPage";
import ServerPage from "./ServerPage";
import UsersPage from "./UsersPage";
import DevicePage from "./DevicePage";
import UserPage from "./UserPage";
import NotificationsPage from "./NotificationsPage";
import NotificationPage from "./NotificationPage";
import GroupsPage from "./GroupsPage";
import GroupPage from "./GroupPage";
import { useTranslation } from "../common/components/LocalizationProvider";
import "./style.css";
import { useSelector, useDispatch } from "react-redux";

const SettingsMain = () => {
  const t = useTranslation();
  const [value, setValue] = useState(0);
  let location = useLocation();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.session.user.id);

  const features = useFeatures();

  const handleChange = (event, newValue) => {
    setValue(newValue);
    navigate(newValue);
  };

  useEffect(() => {
    if (location.pathname == "/settings/notification") {
      setValue("/settings/notifications");
    } else if (location.pathname == "/settings/group") {
      setValue("/settings/groups");
    } else if (location.pathname == "/settings/driver") {
      setValue("/settings/drivers");
    } else if (location.pathname == "/settings/attribute") {
      setValue("/settings/attributes");
    } else if (location.pathname == "/settings/command") {
      setValue("/settings/commands");
    } else if (location.pathname.includes("/settings/device")) {
      setValue("/settings/device");
    } else if (location.pathname.includes("/settings/calendar")) {
      setValue("/settings/calendars");
    } else if (location.pathname.includes("/settings/user")) {
      setValue("/settings/users");
    } else if (location.pathname.includes("/settings/maintenance")) {
      setValue("/settings/maintenances");
    } else {
      setValue(location?.pathname);
    }
  }, [location]);

  return (
    <div>
      <PageLayout
        menu={<SettingsMenu />}
        //breadcrumbs={["sharedDeviceAccumulators"]}
      >
        <Header />
        <TabContext value={value}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            style={{ margin: 20, textTransform: "initial" }}
          >
            <Tab label={t("sharedPreferences")} value="/settings/preferences" />
            <Tab
              label={t("sharedNotifications")}
              value="/settings/notifications"
            />
            <Tab label={t("settingsGroups")} value="/settings/groups" />
            <Tab label={t("sharedDrivers")} value="/settings/drivers" />
            <Tab label={"Attributes"} value="/settings/attributes" />
            {!features.disableCalendars && (
              <Tab label={"Calendars"} value="/settings/calendars" />
            )}
            {!features.disableGroups && (
              <Tab label={"Users"} value="/settings/users" />
            )}
            {!features.disableMaintenance && (
              <Tab
                label={t("sharedMaintenance")}
                value="/settings/maintenances"
              />
            )}
            <Tab label={"Commands"} value="/settings/commands" />
            <Tab label="Device" value="/settings/device" />
            <Tab label="Account" value={`/settings/user/${userId}`} />
          </Tabs>
          <Routes>
            <Route
              exact
              path={`accumulators/:deviceId`}
              element={<AccumulatorsPage />}
            />
            <Route path={`calendars`} element={<CalendarsPage />} />
            <Route path="calendar/:id" element={<CalendarPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="commands" element={<CommandsPage />} />
            <Route path="command/:id" element={<CommandPage />} />
            <Route path="command" element={<CommandPage />} />
            <Route
              path="command-send/:deviceId"
              element={<CommandSendPage />}
            />
            <Route
              exact
              path="attributes"
              element={<ComputedAttributesPage />}
            />
            <Route path="attribute/:id" element={<ComputedAttributePage />} />
            <Route path="attribute" element={<ComputedAttributePage />} />
            <Route path="device/:id" element={<DevicePage />} />
            <Route path="device" element={<DevicePage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="driver/:id" element={<DriverPage />} />
            <Route path="driver" element={<DriverPage />} />
            <Route path="geofence/:id" element={<GeofencePage />} />
            <Route path="geofence" element={<GeofencePage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="group/:id" element={<GroupPage />} />
            <Route path="group" element={<GroupPage />} />
            <Route path="maintenances" element={<MaintenancesPage />} />
            <Route path="maintenance/:id" element={<MaintenancePage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="notification/:id" element={<NotificationPage />} />
            <Route path="notification" element={<NotificationPage />} />
            <Route path="preferences" element={<PreferencesPage />} />
            <Route path="server" element={<ServerPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="user/:id" element={<UserPage />} />
            <Route path="user" element={<UserPage />} />
          </Routes>
        </TabContext>
      </PageLayout>
    </div>
  );
};

export default SettingsMain;
