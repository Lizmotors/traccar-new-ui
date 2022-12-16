import {
  Paper,
  Toolbar,
  IconButton,
  Button,
  OutlinedInput,
  InputAdornment,
  Popover,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  Container,
  Typography,
  AppBar,
} from "@mui/material";
import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  ModeCommentOutlined as MailIcon,
  MenuOpen as MenuOpenIcon,
  NotificationsNone as NotificationsIcon,
  Person as AccountIcon,
  Search as SearchIcon,
  Send as SendIcon,
  ExpandMoreOutlined as ArrowDownIcon,
} from "@mui/icons-material";
import classNames from "classnames";
import { useTranslation } from "./LocalizationProvider";
import LogoutIcon from "@mui/icons-material/Logout";
import { useSelector, useDispatch } from "react-redux";
import { nativePostMessage } from "./NativeInterface";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sessionActions } from "../../store";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const useStyles = makeStyles((theme) => ({
  sidebar: {
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 3,
    margin: theme.spacing(1.5),
    width: theme.dimensions.drawerWidthDesktop,
    bottom: theme.dimensions.bottomBarHeight,
    transition: "transform .5s ease",
    //backgroundColor: "white",
    [theme.breakpoints.down("md")]: {
      width: "100%",
      margin: 0,
    },
  },
  sidebarCollapsed: {
    transform: `translateX(-${theme.dimensions.drawerWidthDesktop})`,
    marginLeft: 0,
    [theme.breakpoints.down("md")]: {
      transform: "translateX(-100vw)",
    },
  },
  toolbarContainer: {
    zIndex: 4,
  },
  toolbar: {
    display: "flex",
    padding: theme.spacing(0, 1),
    "& > *": {
      margin: theme.spacing(0, 1),
    },
  },
  deviceList: {
    flex: 1,
  },
  statusCard: {
    position: "fixed",
    zIndex: 5,
    [theme.breakpoints.up("md")]: {
      left: `calc(50% + ${theme.dimensions.drawerWidthDesktop} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down("md")]: {
      left: "50%",
      bottom: `calc(${theme.spacing(3)} + ${
        theme.dimensions.bottomBarHeight
      }px)`,
    },
    transform: "translateX(-50%)",
  },
  sidebarToggle: {
    position: "fixed",
    left: theme.spacing(1.5),
    top: theme.spacing(3),
    borderRadius: "0px",
    minWidth: 0,
    [theme.breakpoints.down("md")]: {
      left: 0,
    },
  },
  sidebarToggleText: {
    marginLeft: theme.spacing(1),
    [theme.breakpoints.only("xs")]: {
      display: "none",
    },
  },
  sidebarToggleBg: {
    //backgroundColor: "white",
    //color: "rgba(0, 0, 0, 0.6)",
    "&:hover": {
      //backgroundColor: "white",
    },
  },
  bottomMenu: {
    position: "fixed",
    left: theme.spacing(1.5),
    bottom: theme.spacing(1.5),
    zIndex: 4,
    width: theme.dimensions.drawerWidthDesktop,
  },
  filterPanel: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: theme.dimensions.drawerWidthTablet,
  },
  appbar: {
    //background: "white",
    display: "flex",
    justifyContent: "flex-end",
    padding: "15px 50px",
    borderBottom: "1px solid #d9d2d2",
  },
  count: {
    display: "flex",
    width: "30%",
    justifyContent: "space-between",
  },
  circleCount: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "red",
    marginBottom: 10,
  },
  green: {
    backgroundColor: "green",
  },
  yellow: {
    backgroundColor: "yellow",
  },
  profile: {
    display: "flex",
    alignItems: "center",
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    marginRight: 10,
  },
  root: {
    height: "100%",
  },
  container: {
    margin: 0,
    padding: 20,
    width: "100%",
    height: "100%",
  },
  headerMenu: {
    marginTop: theme.spacing(4),
  },
  headerMenuList: {
    display: "flex",
    flexDirection: "column",
  },
  headerMenuItem: {
    "&:hover, &:focus": {
      backgroundColor: theme.palette.background.light,
      // color: "white",
    },
  },
  headerMenuButton: {
    marginLeft: 7.5,
    padding: theme.spacing(0.5),
    //color: "white",
    [theme.breakpoints.down("xs")]: {
      marginLeft: theme.spacing(0.5),
    },
  },
  headerMenuButtonSandwich: {
    // marginLeft: 25,
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
    },
    padding: theme.spacing(0.5),
  },
  headerMenuButtonCollapse: {
    marginRight: 57.56,
    [theme.breakpoints.down("xs")]: {
      marginRight: 10,
    },
  },
  profileArrow: {
    marginLeft: 2,
  },
  headerIcon: {
    fontSize: 24,
    color: "#616161",
  },
  headerIconCollapse: {
    color: "#616161",
  },
  profileMenu: {
    minWidth: 265,
  },
  profileMenuUser: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
  profileMenuItem: {
    color: theme.palette.text.hint,
  },
  profileMenuIcon: {
    marginRight: theme.spacing(2),
    color: theme.palette.text.hint,
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
  profileMenuLink: {
    fontSize: 16,
    textDecoration: "none",
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

const Header = () => {
  const classes = useStyles();
  const t = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  var [profileMenu, setProfileMenu] = useState(null);

  const user = useSelector((state) => state.session.user);

  const userId = useSelector((state) => state.session.user.id);

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
    <AppBar position="fixed" color="inherit">
      <div className={classes.appbar}>
        <IconButton
          aria-haspopup="true"
          color="inherit"
          className={classNames(classes.headerMenuButton, classes.profileArrow)}
          aria-controls="profile-menu"
          onClick={(e) => setProfileMenu(e.currentTarget)}
        >
          <div
            className={classes.profile}
            style={{ cursor: "pointer" }}
            onClick={() => {
              // if (localStorage.getItem("mode")) {
              //   if (localStorage.getItem("mode") === "dark") {
              //     localStorage.setItem("mode", "light");
              //   } else {
              //     localStorage.setItem("mode", "dark");
              //   }
              // } else {
              //   localStorage.setItem("mode", "dark");
              // }
              // window.location.reload();
              // console.log("call");
            }}
          >
            <div>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSrf1xjorLVFcNPL_A746ew0_fIzLFTY5Ngw&usqp=CAU"
                alt="logo"
                className={classes.profileImg}
              />
            </div>
            <Typography variant="h6" component={"h6"}>
              {user.name}
            </Typography>
            <KeyboardArrowDownIcon sx={{ color: "gray", marginLeft: 1 }} />
          </div>
        </IconButton>

        <Menu
          id="profile-menu"
          open={Boolean(profileMenu)}
          anchorEl={profileMenu}
          onClose={() => setProfileMenu(null)}
          className={classes.headerMenu}
          classes={{ paper: classes.profileMenu }}
          disableAutoFocusItem
        >
          <div className={classes.profileMenuUser}>
            <Typography variant="h4" weight="medium">
              {user.name}
            </Typography>
          </div>

          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem
            )}
            component={Link}
            to={`/settings/user/${userId}/profile`}
            onClick={() => {
              setProfileMenu(null);
            }}
          >
            <AccountIcon className={classes.profileMenuIcon} /> Profile
          </MenuItem>
          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem
            )}
            onClick={() => {
              if (localStorage.getItem("mode")) {
                if (localStorage.getItem("mode") === "dark") {
                  localStorage.setItem("mode", "light");
                } else {
                  localStorage.setItem("mode", "dark");
                }
              } else {
                localStorage.setItem("mode", "dark");
              }
              window.location.reload();
              console.log("call");
            }}
          >
            <DarkModeIcon className={classes.profileMenuIcon} />{" "}
            {localStorage.getItem("mode") &&
            localStorage.getItem("mode") === "dark"
              ? "Light"
              : "Dark"}
          </MenuItem>
          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem
            )}
            sx={{ color: "red" }}
            onClick={handleLogout}
          >
            <LogoutIcon className={classes.profileMenuIcon} />{" "}
            {t("loginLogout")}
          </MenuItem>
        </Menu>
      </div>
    </AppBar>
  );
};

export default Header;
