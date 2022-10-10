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
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  Container,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { makeStyles } from "@mui/styles";
import { useTheme } from "@mui/material/styles";

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
    backgroundColor: "white",
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
    backgroundColor: "white",
    color: "rgba(0, 0, 0, 0.6)",
    "&:hover": {
      backgroundColor: "white",
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
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    padding: "30px 50px",
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
}));

const Header = () => {
  const classes = useStyles();

  return (
    <div className={classes.appbar}>
      <div className={classes.count}>
        <div className={classes.circleCount}>
          <div>
            <div className={`${classes.circle} ${classes.green}`}></div>
          </div>
          <Typography variant="h6" component={"h6"}>
            15 Online
          </Typography>
        </div>
        <div className={classes.circleCount}>
          <div>
            <div className={classes.circle}></div>
          </div>
          <Typography variant="h6" component={"h6"}>
            5 Offline
          </Typography>
        </div>
        <div className={classes.circleCount}>
          <div>
            <div className={`${classes.circle} ${classes.yellow}`}></div>
          </div>
          <Typography variant="h6" component={"h6"}>
            3 Idle
          </Typography>
        </div>
      </div>
      <div className={classes.profile}>
        <div>
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSrf1xjorLVFcNPL_A746ew0_fIzLFTY5Ngw&usqp=CAU"
            alt="logo"
            className={classes.profileImg}
          />
        </div>
        <Typography variant="h6" component={"h6"}>
          Admin
        </Typography>
        <KeyboardArrowDownIcon sx={{ color: "gray", marginLeft: 1 }} />
      </div>
    </div>
  );
};

export default Header;
