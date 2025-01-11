import { createTheme } from "@mui/material/styles";
import palette from "./palette";
import dimensions from "./dimensions";
import components from "./components";

const theme = createTheme({
  palette,
  dimensions,
  components,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 400,
    },
    h2: {
      fontWeight: 400,
    },
    h3: {
      fontWeight: 400,
    },
    h4: {
      fontWeight: 400,
    },
    h5: {
      fontWeight: 400,
    },
    h6: {
      fontWeight: 400,
    },
    subtitle1: {
      fontWeight: 400,
    },
    subtitle2: {
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 4px 8px rgba(0, 0, 0, 0.05)",
    "0px 8px 16px rgba(0, 0, 0, 0.05)",
    "0px 16px 24px rgba(0, 0, 0, 0.05)",
    "0px 24px 32px rgba(0, 0, 0, 0.05)",
  ],
});

// Inject CSS variables for gradients
const style = document.createElement("style");
style.textContent = `
  :root {
    --background-gradient: ${palette.background.gradient};
    --background-paper: ${palette.background.paper};
    --primary-gradient: ${palette.primary.gradient};
    --secondary-gradient: ${palette.secondary.gradient};
  }
`;
document.head.appendChild(style);

export default theme;
