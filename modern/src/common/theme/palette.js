import { grey, common } from "@mui/material/colors";

// Define the base colors that will be used across themes
const colors = {
  white: common.white,
  black: common.black,
  neutral: grey[500],
  positive: "#4CAF50",
  negative: "#FF5252",
  geometry: "#3bb2d0",
  primary: "#4D6FFF",
  secondary: "#8C7CFF",
};

const isLightMode = localStorage.getItem("mode") === "light";

// Create the theme palette configuration
const palette = {
  mode: isLightMode ? "light" : "dark",
  colors,
  ...colors,
  background: isLightMode
    ? {
        default: common.white,
        paper: common.white,
      }
    : {
        default: "#070818",
        paper: "#040d1b",
        gradient:
          "linear-gradient(135deg,rgb(6, 8, 24) 0%,rgb(9, 10, 24) 100%)",
      },
  primary: {
    main: colors.primary,
    light: "#6B89FF",
    dark: "#3B5BDB",
    ...(isLightMode
      ? {}
      : { gradient: "linear-gradient(90deg, #4D6FFF 0%, #8C7CFF 100%)" }),
    contrastText: common.white,
  },
  secondary: {
    main: colors.secondary,
    light: "#A594FF",
    dark: "#7B68FF",
    ...(isLightMode
      ? {}
      : { gradient: "linear-gradient(90deg, #8C7CFF 0%, #B095FF 100%)" }),
    contrastText: common.white,
  },
  text: {
    primary: isLightMode ? grey[900] : common.white,
    secondary: isLightMode ? grey[700] : "rgba(255, 255, 255, 0.7)",
    disabled: isLightMode ? "rgba(0, 0, 0, 0.38)" : "rgba(255, 255, 255, 0.5)",
  },
  divider: isLightMode ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)",
  error: {
    main: "#FF5252",
    light: "#FF7676",
    dark: "#DB4646",
  },
  success: {
    main: "#4CAF50",
    light: "#6FBF73",
    dark: "#3B8A3F",
  },
};

export default palette;
