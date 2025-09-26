import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  styled,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";
import PublishIcon from "@mui/icons-material/Publish";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PendingIcon from "@mui/icons-material/Pending";

import { useTranslation } from "../common/components/LocalizationProvider";
import RemoveDialog from "../common/components/RemoveDialog";
import PositionValue from "../common/components/PositionValue";
import { useDeviceReadonly, useRestriction } from "../common/util/permissions";
import usePersistedState from "../common/util/usePersistedState";
import usePositionAttributes from "../common/attributes/usePositionAttributes";
import { devicesActions } from "../store";
import { useCatch, useCatchCallback } from "../reactHelper";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DensityMediumOutlinedIcon from "@mui/icons-material/DensityMediumOutlined";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import InfoIcon from "@mui/icons-material/InfoOutlined";

const useStyles = makeStyles((theme) => ({
  card: {
    width: theme.dimensions.statusCard,
    padding: 3,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: "flex",
    marginBottom: 13,
  },
  mediaButton: {
    color: theme.palette.colors.white,
    mixBlendMode: "difference",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1, 1, 0, 2),
    justifyContent: "space-between",
  },
  content: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  negative: {
    color: theme.palette.colors.negative,
  },
  icon: {
    width: "25px",
    height: "25px",
    filter: "brightness(0) invert(1)",
  },
  table: {
    "& .MuiTableCell-sizeSmall": {
      paddingLeft: 0,
      paddingRight: 0,
      border: "none",
    },
    borderCollapse: "separate",
    borderSpacing: "0 2px",
    width: "100%",
    "& .MuiTableBody-root": {
      borderRadius: "8px",
      overflow: "hidden",
    },
    "& .MuiTableRow-root": {
      border: "none",
    },
  },
  cell: {
    borderBottom: "none",
    padding: 1,
  },
  actions: {
    justifyContent: "space-between",
  },
  customScrollbar: {
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#c1c1c1',
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#a8a8a8',
    },
    scrollbarWidth: 'thin',
    scrollbarColor: '#c1c1c1 #f1f1f1',
  },
}));

const StatusRow = ({ name, content, isAlternate = false }) => {
  const classes = useStyles();
  const isDarkMode = localStorage.getItem("mode") === "dark";

  return (
    <TableRow 
      sx={{ 
        marginBottom: 0,
        backgroundColor: isAlternate ? (isDarkMode ? '#f8f8f8' : '#fcfdff') : (isDarkMode ? '#ffffff' : '#ffffff'),
        '&:hover': {
          backgroundColor: isDarkMode ? '#f0f0f0' : '#f7faff',
          transition: 'background-color 0.2s ease',
        },
        borderRadius: '4px',
        transition: 'background-color 0.3s ease',
        border: 'none',
      }}
    >
      <TableCell 
        className={classes.cell}
        sx={{ 
          borderBottom: 'none',
          padding: '8px 12px',
          borderRight: 'none',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ 
            color: isDarkMode ? "#000000" : "#444444",
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          {name}
        </Typography>
      </TableCell>
      <TableCell 
        className={classes.cell}
        sx={{ 
          borderBottom: 'none',
          padding: '8px 12px',
          border: 'none',
        }}
      >
        <Typography
          variant="body2"
          sx={{ 
            color: isDarkMode ? "#000000" : "#666666",
            fontWeight: 500,
            fontSize: '0.85rem',
          }}
        >
          {content}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({ deviceId, onClose }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction("readonly");
  const deviceReadonly = useDeviceReadonly();

  const device = useSelector((state) => state.devices.items[deviceId]);
  const position = useSelector((state) => state.positions.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const [positionItems] = usePersistedState("positionItems", [
    "speed",
    "address",
    "totalDistance",
    "course",
  ]);

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);
  const isDarkMode = localStorage.getItem("mode") === "dark";

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch("/api/devices");
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: "",
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch("/api/geofences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: position.deviceId,
          geofenceId: item.id,
        }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
    }
  }, [navigate]);

  // Define the styles for the Card (as a style object)
  const CardStyles = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  };

  // Create a styled Menu component with the same styles as the Card
  const StyledMenu = styled(Menu)(({ theme }) => ({
    "& .MuiPaper-root": {
      ...CardStyles,
    },
  }));

  return (
    <>
      {device && (
        <Draggable handle={`.${classes.media}, .${classes.header}`}>
          <Card elevation={3} className={classes.card}>
            <div className={classes.header} style={{ paddingBottom: 7 }}>
              <Typography variant="h5" sx={{ color: "#000" }}>
                {device.name ? device.name : ""}
              </Typography>
              <IconButton size="small" onClick={onClose} onTouchStart={onClose}>
                <HighlightOffIcon sx={{ color: "#000" }} fontSize="medium" />
              </IconButton>
            </div>
            {deviceImage && (
              <CardMedia
                className={classes.media}
                image={`/api/media/${device.uniqueId}/${deviceImage}`}
              >
              </CardMedia>
            )}
            {position && (
              <CardContent className={classes.content}>
                <div
                  className={classes.customScrollbar}
                  style={{
                    maxHeight: 200,
                    overflow: "auto",
                    width: "100%",
                    color: isDarkMode ? "#000000" : "inherit",
                    borderRadius: "8px",
                    padding: "10px 6px",
                    backgroundColor: isDarkMode ? "#ffffff" : "#ffffff",
                    boxShadow: "none",
                  }}
                >
                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      {positionItems
                        .filter(
                          (key) =>
                            position.hasOwnProperty(key) ||
                            position.attributes.hasOwnProperty(key)
                        )
                        .map((key, index) => (
                          <StatusRow
                            key={key}
                            name={positionAttributes[key].name}
                            content={
                              <PositionValue
                                position={position}
                                property={
                                  position.hasOwnProperty(key) ? key : null
                                }
                                attribute={
                                  position.hasOwnProperty(key) ? null : key
                                }
                              />
                            }
                            isAlternate={index % 2 === 0}
                          />
                        ))}
                      <StatusRow
                        key={"key"}
                        name={"Identifier"}
                        content={device.uniqueId}
                        isAlternate={positionItems.filter(
                          (key) =>
                            position.hasOwnProperty(key) ||
                            position.attributes.hasOwnProperty(key)
                        ).length % 2 === 0}
                      />
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
            <CardActions classes={{ root: classes.actions }} disableSpacing>
              <IconButton
                onClick={() => setRemoving(true)}
                disabled={deviceReadonly}
              >
                {/* <DeleteIcon /> */}
                <DeleteOutlineOutlinedIcon sx={{ color: "#000" }} />
              </IconButton>
              <IconButton
                onClick={() => navigate(`/settings/device/${deviceId}`)}
                disabled={deviceReadonly}
              >
                <EditOutlinedIcon sx={{ color: "#000" }} />
                {/* <EditIcon /> */}
              </IconButton>
              <IconButton
                onClick={() => navigate("/replay")}
                disabled={!position}
              >
                <HistoryOutlinedIcon sx={{ color: "#000" }} />
                {/* <ReplayIcon /> */}
              </IconButton>
              <IconButton
                onClick={() => navigate(`/settings/command-send/${deviceId}`)}
                disabled={readonly}
              >
                <MenuBookOutlinedIcon sx={{ color: "#000" }} />
                {/* <PublishIcon /> */}
              </IconButton>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                disabled={!position}
              >
                {/* <PendingIcon /> */}
                <InfoIcon sx={{ color: "#000" }} />
              </IconButton>
            </CardActions>
          </Card>
        </Draggable>
      )}
      {position && (
        <StyledMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          // className={classes.card}
        >
          <MenuItem
            onClick={() => {
              navigate(`/device/${deviceId}/${position.id}`);
            }}
          >
            <Typography color={isDarkMode?"#000000":"#000000"}>{t("sharedShowDetails")}</Typography>
          </MenuItem>
          <MenuItem sx={{color:"#000000"}} onClick={handleGeofence}>
            {t("sharedCreateGeofence")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            sx={{color:"#000000"}}
            href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
          >
            {t("linkGoogleMaps")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            sx={{color:"#000000"}}
            href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
          >
            {t("linkAppleMaps")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            sx={{color:"#000000"}}
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            {t("linkStreetView")}
          </MenuItem>
        </StyledMenu>
      )}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;
