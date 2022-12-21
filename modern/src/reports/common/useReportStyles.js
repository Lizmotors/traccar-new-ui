import { makeStyles } from "@mui/styles";

export default makeStyles((theme) => ({
  batteryText: {
    fontSize: "0.75rem",
    fontWeight: "normal",
    lineHeight: "0.875rem",
  },
  positive: {
    color: theme.palette.colors.positive,
  },
  medium: {
    color: theme.palette.colors.medium,
  },
  negative: {
    color: theme.palette.colors.negative,
  },
  neutral: {
    color: theme.palette.colors.neutral,
  },
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  containerMap: {
    flexBasis: "40%",
    flexShrink: 0,
  },
  containerMain: {
    overflow: "auto",
  },
  header: {
    position: "sticky",
    left: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  columnAction: {
    width: "1%",
    paddingLeft: theme.spacing(1),
  },
  filter: {
    display: "inline-flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    padding: theme.spacing(3, 2, 2),
  },
  filterItem: {
    minWidth: 0,
    flex: `1 1 ${theme.dimensions.filterFormWidth}`,
  },
  filterButtons: {
    display: "flex",
    gap: theme.spacing(1),
    flex: `1 1 ${theme.dimensions.filterFormWidth}`,
  },
  filterButton: {
    flexGrow: 1,
  },
  chart: {
    flexGrow: 1,
    overflow: "hidden",
    height: "70vh",
  },
}));
