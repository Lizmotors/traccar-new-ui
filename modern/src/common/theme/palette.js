import { amber, grey, green, indigo, red, common } from "@mui/material/colors";

const colors = {
  white: common.white,
  background: grey[50],
  primary: indigo[900],
  secondary: green[500],
  positive: green[500],
  medium: amber[700],
  negative: red[500],
  neutral: grey[500],
  geometry: "#3bb2d0",
};

export default {
  mode: localStorage.getItem("mode") ? localStorage.getItem("mode") : "dark",
  // ...(localStorage.getItem("mode") && localStorage.getItem("mode") === "light"
  //   ? {
  //       // palette values for dark mode
  //       // primary: deepOrange,
  //       // divider: deepOrange[700],
  //       // background: {
  //       //   default: deepOrange[900],
  //       //   paper: deepOrange[900],
  //       // },

  //       text: {
  //         primary: grey[800],
  //         secondary: grey[500],
  //       },
  //     }
  //   : {
  //       // palette values for light mode
  //       // primary: amber,
  //       // divider: amber[200],
  //       primary: "#112D74",
  //       backgroundColor: {
  //         default: "#112D74",
  //         paper: "#112D74",
  //       },
  //       text: {
  //         primary: "#fff",
  //         secondary: "#fff",
  //       },
  //     }),
  // // background: {
  // //   default: colors.background,
  // // },
  primary: {
    main: colors.primary,
  },
  secondary: {
    main: colors.secondary,
    contrastText: colors.white,
  },
  colors,
};
