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

const useStyles = makeStyles((theme) => ({
  card: {
    width: theme.dimensions.popupMaxWidth,
    padding: 10,
    borderRadius: 20,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: "flex",

    //justifyContent: "flex-end",
    //alignItems: "flex-start",
  },
  mediaButton: {
    color: theme.palette.colors.white,
    mixBlendMode: "difference",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1, 1, 0, 2),
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
    },
  },
  cell: {
    borderBottom: "none",
  },
  actions: {
    justifyContent: "space-between",
  },
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();

  return (
    <TableRow sx={{ marginBottom: 50 }}>
      <TableCell className={classes.cell}>
        <Typography variant="h6">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="subtitle1" color="">
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
      throw Error(await response.text());
    }
  }, [navigate]);

  return (
    <>
      {device && (
        <Draggable handle={`.${classes.media}, .${classes.header}`}>
          <Card elevation={3} className={classes.card}>
            {deviceImage ? (
              <CardMedia
                className={classes.media}
                image={`/api/media/${device.uniqueId}/${deviceImage}`}
              >
                <IconButton
                  size="small"
                  onClick={onClose}
                  onTouchStart={onClose}
                >
                  <HighlightOffIcon
                    fontSize="small"
                    className={classes.mediaButton}
                  />
                </IconButton>
              </CardMedia>
            ) : (
              <div className={classes.header} style={{ paddingBottom: 15 }}>
                <Typography variant="h4" color="">
                  {device.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={onClose}
                  onTouchStart={onClose}
                >
                  <HighlightOffIcon fontSize="medium" />
                </IconButton>
              </div>
            )}
            {position && (
              <CardContent className={classes.content}>
                <Table size="small" classes={{ root: classes.table }}>
                  <TableBody>
                    {positionItems
                      .filter(
                        (key) =>
                          position.hasOwnProperty(key) ||
                          position.attributes.hasOwnProperty(key)
                      )
                      .map((key) => (
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
                        />
                      ))}
                    <StatusRow
                      key={"key"}
                      name={"Identifier"}
                      content={device.uniqueId}
                    />
                  </TableBody>
                </Table>
              </CardContent>
            )}
            <CardActions classes={{ root: classes.actions }} disableSpacing>
              <IconButton
                onClick={() => setRemoving(true)}
                disabled={deviceReadonly}
                //className={classes.negative}
              >
                {/* <DeleteIcon /> */}
                <DeleteOutlineOutlinedIcon />
              </IconButton>
              <IconButton
                onClick={() => navigate(`/settings/device/${deviceId}`)}
                disabled={deviceReadonly}
              >
                <EditOutlinedIcon />
                {/* <EditIcon /> */}
              </IconButton>
              <IconButton
                onClick={() => navigate("/replay")}
                disabled={!position}
              >
                <HistoryOutlinedIcon />
                {/* <ReplayIcon /> */}
              </IconButton>
              <IconButton
                onClick={() => navigate(`/settings/command-send/${deviceId}`)}
                disabled={readonly}
              >
                <MenuBookOutlinedIcon />
                {/* <PublishIcon /> */}
              </IconButton>
              <IconButton
                //color="secondary"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                disabled={!position}
              >
                {/* <PendingIcon /> */}
                <DensityMediumOutlinedIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Draggable>
      )}
      {position && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => navigate(`/position/${position.id}`)}>
            <Typography color="secondary">{t("sharedShowDetails")}</Typography>
          </MenuItem>
          <MenuItem onClick={handleGeofence}>
            {t("sharedCreateGeofence")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
          >
            {t("linkGoogleMaps")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
          >
            {t("linkAppleMaps")}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            {t("linkStreetView")}
          </MenuItem>
        </Menu>
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
