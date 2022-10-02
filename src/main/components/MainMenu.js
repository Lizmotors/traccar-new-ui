import React from "react";
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CreateIcon from "@mui/icons-material/Create";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FolderIcon from "@mui/icons-material/Folder";
import PersonIcon from "@mui/icons-material/Person";
import StorageIcon from "@mui/icons-material/Storage";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import TodayIcon from "@mui/icons-material/Today";
import PublishIcon from "@mui/icons-material/Publish";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "../../common/components/LocalizationProvider";
import {
  useAdministrator,
  useManager,
  useRestriction,
} from "../../common/util/permissions";
import useFeatures from "../../common/util/useFeatures";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { nativePostMessage } from "../../common/components/NativeInterface";
import { sessionActions } from "../../store";
import { makeStyles } from "@mui/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import FmdGoodIcon from "@mui/icons-material/FmdGood";

const MenuItem = ({ title, link, icon, selected }) => (
  <ListItemButton
    sx={{ color: "#1875d8" }}
    key={link}
    component={Link}
    to={link}
    selected={selected}
  >
    <ListItemIcon sx={{ color: "#1875d8" }}>{icon}</ListItemIcon>
    <ListItemText
      primaryTypographyProps={{
        fontWeight: "bold",
        variant: "body1",
      }}
      style={{ fontWeight: "bold" }}
      primary={title}
    />
  </ListItemButton>
);

const useStyles = makeStyles((theme) => ({
  last_content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    height: "100%",
    padding: "0 50px 30px 50px",
    color: "grey",
  },
  logocont: {
    display: "flex",
    alignItems: "center",
    padding: "30px 50px",
  },
  logoimg: {
    width: 70,
    height: 70,
    marginRight: 30,
  },
}));

const SettingsMenu = () => {
  const classes = useStyles();
  const t = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const readonly = useRestriction("readonly");
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);
  const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();

  const features = useFeatures();

  const handleLogout = async () => {
    const notificationToken = window.localStorage.getItem("notificationToken");
    if (notificationToken) {
      window.localStorage.removeItem("notificationToken");
      const tokens = user.attributes.notificationTokens?.split(",") || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((it) => it !== notificationToken).join(",")
                : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch("/api/session", { method: "DELETE" });
    nativePostMessage("logout");
    navigate("/login");
    dispatch(sessionActions.updateUser(null));
  };

  return (
    <>
      <List>
        <div className={classes.logocont}>
          <div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMSx0KZI3nc2gOVLuJOB3-J5JXJDQdrTyVAQ&usqp=CAU"
              alt="logo"
              className={classes.logoimg}
            />
          </div>
          <ListItemText
            primaryTypographyProps={{
              fontWeight: "bold",
              variant: "h5",
              color: "#1875d8",
            }}
            primary={"Telemoto"}
          />
        </div>
        {!readonly && (
          <>
            <MenuItem
              title={t("mapTitle")}
              link="/"
              icon={<FmdGoodIcon />}
              selected={location.pathname === `/`}
            />
            <MenuItem
              title={"Devices"}
              link={`/settings/device`}
              icon={<AddLocationAltIcon />}
              selected={location.pathname === `/settings/device`}
            />
            <MenuItem
              title={t("reportTitle")}
              link="/reports/route"
              icon={<AssessmentIcon />}
              selected={location.pathname.startsWith("/reports/route")}
            />
            {!features.disableGroups && (
              <MenuItem
                title={t("settingsUsers")}
                link="/settings/users"
                icon={<PeopleIcon />}
                selected={location.pathname === `/settings/users`}
              />
            )}
            {!features.disableDrivers && (
              <MenuItem
                title={t("reportTrips")}
                link="/reports/trip"
                icon={<PersonIcon />}
                selected={location.pathname === `/reports/trip`}
              />
            )}
            {!features.disableCalendars && (
              <MenuItem
                title={t("settingsTitle")}
                link="/settings/preferences"
                icon={<SettingsIcon />}
                selected={location.pathname.startsWith("/settings/preferences")}
              />
            )}
          </>
        )}
      </List>
      <div className={classes.last_content}>
        <div style={{ color: "grey" }}>
          <ListItemButton>
            <ListItemIcon>{<ErrorOutlineIcon />}</ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                fontWeight: "bold",
                variant: "body1",
              }}
              primary={"Help Centre"}
            />
          </ListItemButton>
        </div>
        <div>
          <ListItemButton>
            <ListItemIcon>{<ChatBubbleOutlineIcon />}</ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                fontWeight: "bold",
                variant: "body1",
              }}
              primary={"Contact us"}
            />
          </ListItemButton>
        </div>
        <div style={{ color: "red" }}>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>{<LogoutIcon sx={{ color: "red" }} />}</ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                fontWeight: "bold",
                variant: "body1",
              }}
              primary={t("loginLogout")}
            />
          </ListItemButton>
        </div>
      </div>
    </>
  );
};

export default SettingsMenu;
