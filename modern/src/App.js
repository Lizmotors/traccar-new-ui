import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { LinearProgress, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import theme from "./common/theme";
import BottomMenu from "./common/components/BottomMenu";
import SocketController from "./SocketController";
import CachingController from "./CachingController";
import "./global.css";

const useStyles = makeStyles(() => ({
  page: {
    flexGrow: 1,
    overflow: "auto",
  },
  menu: {
    zIndex: 1204,
  },
  bodyLight: {
    backgroundColor: "#fff",
    height: "100%",
  },
  bodyDark: {
    backgroundColor: "#112D74",
    height: "100%",
  },
}));

const App = () => {
  const classes = useStyles();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const initialized = useSelector((state) => !!state.session.user);

  return (
    <div
      className={
        localStorage.getItem("mode")
          ? localStorage.getItem("mode") === "dark"
            ? classes.bodyDark
            : classes.bodyLight
          : classes.bodyDark
      }
    >
      <SocketController />
      <CachingController />
      {!initialized ? (
        <LinearProgress />
      ) : (
        <>
          <div className={classes.page}>
            <Outlet />
          </div>
          {!desktop && (
            <div className={classes.menu}>
              <BottomMenu />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
