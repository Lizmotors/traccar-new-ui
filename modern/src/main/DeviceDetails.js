import React, { useState, useEffect, useCallback } from "react";
import {
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  CardMedia,
  Alert,
  Tooltip,
  Avatar,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import MapView from "../map/core/MapView";
import MapSelectedDevice from "../map/main/MapSelectedDevice";
import MapAccuracy from "../map/main/MapAccuracy";
import MapGeofence from "../map/MapGeofence";
import MapCurrentLocation from "../map/MapCurrentLocation";
import { useTranslation } from "../common/components/LocalizationProvider";
import PoiMap from "../map/main/PoiMap";
import MapPadding from "../map/MapPadding";
import { devicesActions } from "../store";
import MapDefaultCamera from "../map/main/MapDefaultCamera";
import usePersistedState from "../common/util/usePersistedState";
import MapLiveRoutes from "../map/main/MapLiveRoutes";

import MapPositions from "../map/MapPositions";
import MapOverlay from "../map/overlay/MapOverlay";
import MapGeocoder from "../map/geocoder/MapGeocoder";
import MapScale from "../map/MapScale";
import MapNotification from "../map/notification/MapNotification";

import useFeatures from "../common/util/useFeatures";
import "./main.css";
import MainMenu from "./components/MainMenu";
import PageLayout from "../common/components/PageLayout";
import Header from "../common/components/Header";
import "react-circular-progressbar/dist/styles.css";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TimelineIcon from "@mui/icons-material/Timeline";
import AdjustIcon from "@mui/icons-material/Adjust";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { AreaChart, Area } from "recharts";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import SemiCircleProgressBar from "react-progressbar-semicircle";

import "react-circular-progressbar/dist/styles.css";

import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import {
  formatDistance,
  formatSpeed,
  formatHours,
  formatVolume,
  formatTime,
  formatDistanceRewards,
  formatPercentage,
} from "../common/util/formatter";
import ReportFilter from "../reports/components/ReportFilter";
import { useAttributePreference } from "../common/util/preferences";

import ColumnSelect from "../reports/components/ColumnSelect";

import { useCatch, useEffectAsync } from "../reactHelper";
import useReportStyles from "../reports/common/useReportStyles";

import MapRoutePath from "../map/MapRoutePath";
import AddressValue from "../common/components/AddressValue";
import TableShimmer from "../common/components/TableShimmer";
import MapMarkers from "../map/MapMarkers";
import MapCamera from "../map/MapCamera";
import { BASE_URL } from "../env";
import { snackBarDurationLongMs } from "../common/util/duration";
import LoadingButton from "@mui/lab/LoadingButton";
import { useNavigate, useParams } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";

import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import Battery60Icon from "@mui/icons-material/Battery60";
import BatteryCharging60Icon from "@mui/icons-material/BatteryCharging60";
import Battery20Icon from "@mui/icons-material/Battery20";
import BatteryCharging20Icon from "@mui/icons-material/BatteryCharging20";

const columnsArray = [
  ["startTime", "reportStartTime"],
  ["startOdometer", "reportStartOdometer"],
  ["startAddress", "reportStartAddress"],
  ["endTime", "reportEndTime"],
  ["endOdometer", "reportEndOdometer"],
  ["endAddress", "reportEndAddress"],
  ["distance", "sharedDistance"],
  ["averageSpeed", "reportAverageSpeed"],
  ["maxSpeed", "reportMaximumSpeed"],
  ["duration", "reportDuration"],
  ["spentFuel", "reportSpentFuel"],
  ["driverName", "sharedDriver"],
];
const columnsMap = new Map(columnsArray);

const DeviceDetails = (props) => {
  const navigate = useNavigate();
  const classes = useReportStyles();
  const t = useTranslation();

  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up("md"));

  const { id } = useParams();

  const distanceUnit = useAttributePreference("distanceUnit");
  const speedUnit = useAttributePreference("speedUnit");
  const volumeUnit = useAttributePreference("volumeUnit");

  const [result, setResult] = useState();

  const [columns, setColumns] = usePersistedState("tripColumns", [
    "startTime",
    "endTime",
    "distance",
    "averageSpeed",
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [route, setRoute] = useState(null);
  const [rewardsData, setRewardsData] = useState([]);
  const [deviceData, setDeviceData] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);

  const features = useFeatures();

  const [mapOnSelect] = usePersistedState("mapOnSelect", false);

  const [mapLiveRoutes] = usePersistedState("mapLiveRoutes", false);

  const [itemData, setItemData] = useState();

  useEffectAsync(async () => {
    if (id) {
      const response = await fetch(`/api/positions?id=${id}`);
      if (response.ok) {
        const positions = await response.json();
        if (positions.length > 0) {
          setItemData(positions[0]);
        }
      } else {
        throw Error(await response.text());
      }
    }
  }, [id]);

  const deviceSingleData = useSelector((state) => {
    if (itemData) {
      const device = state.devices.items[itemData.deviceId];
      if (device) {
        return device;
      }
    }
    return null;
  });

  const selectedDeviceId = itemData ? itemData.deviceId : "";
  const positions = useSelector((state) => state.positions.items);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId
  );

  const groups = useSelector((state) => state.groups.items);
  const devices = useSelector((state) => state.devices.items);

  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [filterSort, setFilterSort] = usePersistedState("filterSort", "");
  const [filterMap, setFilterMap] = usePersistedState("filterMap", false);

  const [eventsOpen, setEventsOpen] = useState(false);

  const eventsAvailable = useSelector((state) => !!state.events.items.length);

  const eventHandler = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  const onClick = useCallback(
    (_, deviceId) => {
      dispatch(devicesActions.select(deviceId));
    },
    [dispatch]
  );

  const deviceGroups = (device) => {
    const groupIds = [];
    let { groupId } = device;
    while (groupId) {
      groupIds.push(groupId);
      groupId = groups[groupId].groupId;
    }
    return groupIds;
  };

  useEffect(() => {
    const filtered = Object.values(devices)
      .filter(
        (device) =>
          !filterStatuses.length || filterStatuses.includes(device.status)
      )
      .filter(
        (device) =>
          !filterGroups.length ||
          deviceGroups(device).some((id) => filterGroups.includes(id))
      )
      .filter((device) => {
        const keyword = filterKeyword.toLowerCase();
        return [
          device.name,
          device.uniqueId,
          device.phone,
          device.model,
          device.contact,
        ].some((s) => s && s.toLowerCase().includes(keyword));
      });
    switch (filterSort) {
      case "name":
        filtered.sort((device1, device2) =>
          device1.name.localeCompare(device2.name)
        );
        break;
      case "lastUpdate":
        filtered.sort((device1, device2) => {
          const time1 = device1.lastUpdate
            ? moment(device1.lastUpdate).valueOf()
            : 0;
          const time2 = device2.lastUpdate
            ? moment(device2.lastUpdate).valueOf()
            : 0;
          return time2 - time1;
        });
        break;
      default:
        break;
    }
    if (filterSort === "lastUpdate") {
      filtered.sort((device1, device2) => {
        const time1 = device1.lastUpdate
          ? moment(device1.lastUpdate).valueOf()
          : 0;
        const time2 = device2.lastUpdate
          ? moment(device2.lastUpdate).valueOf()
          : 0;
        return time2 - time1;
      });
    }

    let countData = { online: 0, offline: 0, expired: 0, never: 0 };

    setFilteredPositions(
      filterMap
        ? filtered.map((device) => positions[device.id]).filter(Boolean)
        : Object.values(positions)
    );
  }, [
    devices,
    positions,
    filterKeyword,
    filterStatuses,
    filterGroups,
    filterSort,
    filterMap,
  ]);

  const [transVal, setTransVal] = useState(3);

  const createMarkers = () => [
    {
      latitude: selectedItem.startLat,
      longitude: selectedItem.startLon,
      color: "negative",
    },
    {
      latitude: selectedItem.endLat,
      longitude: selectedItem.endLon,
      color: "positive",
    },
  ];

  useEffectAsync(async () => {
    if (selectedItem) {
      const query = new URLSearchParams({
        deviceId: selectedItem.deviceId,
        from: selectedItem.startTime,
        to: selectedItem.endTime,
      });
      const response = await fetch(`/api/reports/route?${query.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        setRoute(await response.json());
      } else {
        throw Error(await response.text());
      }
    } else {
      setRoute(null);
    }
  }, [selectedItem]);

  const handleSubmit = useCatch(async ({ deviceId, from, to, type }) => {
    const query = new URLSearchParams({
      deviceId: selectedDeviceId,
      from,
      to,
    });
    if (type === "export") {
      window.location.assign(`/api/reports/trips/xlsx?${query.toString()}`);
    } else if (type === "mail") {
      const response = await fetch(
        `/api/reports/trips/mail?${query.toString()}`
      );
      if (!response.ok) {
        throw Error(await response.text());
      }
    } else {
      setLoading(true);
      try {
        const response = await fetch(`/api/devices/1`, {
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          setDeviceData(await response.json());
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }

      try {
        const response = await fetch(`/api/reports/trips?${query.toString()}`, {
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          setItems(await response.json());
        } else {
          throw Error(await response.text());
        }
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (selectedDeviceId) {
      handleSubmit({
        from: moment().startOf("day").toISOString(),
        to: moment().endOf("day").toISOString(),
        type: "json",
      });
    }
  }, [selectedDeviceId]);

  const formatValue = (item, key) => {
    switch (key) {
      case "startTime":
      case "endTime":
        return formatTime(item[key], "YYYY-MM-DD HH:mm");
      case "startOdometer":
      case "endOdometer":
      case "distance":
        return formatDistance(item[key], distanceUnit, t);
      case "averageSpeed":
      case "maxSpeed":
        return formatSpeed(item[key], speedUnit, t);
      case "duration":
        return formatHours(item[key]);
      case "spentFuel":
        return formatVolume(item[key], volumeUnit, t);
      case "startAddress":
        return (
          <AddressValue
            latitude={item.startLat}
            longitude={item.startLon}
            originalAddress={item[key]}
          />
        );
      case "endAddress":
        return (
          <AddressValue
            latitude={item.endLat}
            longitude={item.endLon}
            originalAddress={item[key]}
          />
        );
      default:
        return item[key];
    }
  };

  const getRewardsData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/blockChain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const datas = await response.json();
        setRewardsData(datas?.result);
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (datas) => {
    setBtnLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/blockChain/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datas),
      });
      if (response.ok) {
        setBtnLoading(false);
        const datas = await response.json();
        setResult("Payment Done Successfully");
        getRewardsData();
      } else {
        throw Error(await response.text());
      }
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    getRewardsData();
  }, []);

  return (
    <PageLayout menu={<MainMenu />}>
      <Header />
      <div className="header-padding horizontal-padding">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h4" className="bold">
              {deviceSingleData?.name}
            </Typography>
            <Typography variant="button">
              {deviceSingleData?.uniqueId}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            {deviceSingleData?.attributes?.deviceImage ? (
              <CardMedia
                className={classes.media}
                style={{
                  height: 300,
                  display: "flex",
                  borderRadius: 15,
                }}
                image={`/api/media/${deviceSingleData?.uniqueId}/${deviceSingleData?.attributes?.deviceImage}`}
              ></CardMedia>
            ) : (
              <div className="logo-image">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDXPVORv9tYVdmR5AQX5Lishkts7AYTFt0hG5FCgGytyXDubUF2x0K1gxNUtmJQiFSlF4&usqp=CAU"
                  alt="logo"
                />
              </div>
            )}
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ paddingBottom: 5, paddingTop: 5 }}>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div className="flex-cont">
                    <Typography>Odometer</Typography>
                    <TimelineIcon />
                  </div>
                  <Typography variant="h5" className="bold">
                    {itemData?.odometer ? itemData?.odometer : "0"}
                  </Typography>
                  <AreaChart
                    width={140}
                    height={50}
                    data={[
                      {
                        name: "Page A",
                        uv: 1890,
                        pv: 4800,
                        amt: 2400,
                      },
                      {
                        name: "Page B",
                        uv: 3000,
                        pv: 1398,
                        amt: 2210,
                      },
                      {
                        name: "Page C",
                        uv: 2000,
                        pv: 9800,
                        amt: 2290,
                      },
                      {
                        name: "Page D",
                        uv: 2780,
                        pv: 3908,
                        amt: 2000,
                      },
                      {
                        name: "Page E",
                        uv: 2390,
                        pv: 3800,
                        amt: 2181,
                      },
                      {
                        name: "Page F",
                        uv: 3490,
                        pv: 4300,
                        amt: 2500,
                      },
                      {
                        name: "Page G",
                        uv: 4000,
                        pv: 2400,
                        amt: 2100,
                      },
                    ]}
                  >
                    <Area
                      type="monotone"
                      dataKey="uv"
                      stroke="#8884d8"
                      fill="#d0d0e0"
                    />
                  </AreaChart>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div className="flex-cont">
                    <Typography>Charge</Typography>
                    {itemData?.attributes.hasOwnProperty("batteryLevel") && (
                      <Tooltip
                        title={`${t(
                          "positionBatteryLevel"
                        )}: ${formatPercentage(
                          itemData.attributes.batteryLevel
                        )}`}
                      >
                        <IconButton size="small">
                          {itemData.attributes.batteryLevel > 70 ? (
                            itemData.attributes.charge ? (
                              <BatteryChargingFullIcon
                                fontSize="small"
                                className={classes.positive}
                              />
                            ) : (
                              <BatteryFullIcon
                                fontSize="small"
                                className={classes.positive}
                              />
                            )
                          ) : itemData.attributes.batteryLevel > 30 ? (
                            itemData.attributes.charge ? (
                              <BatteryCharging60Icon
                                fontSize="small"
                                className={classes.medium}
                              />
                            ) : (
                              <Battery60Icon
                                fontSize="small"
                                className={classes.medium}
                              />
                            )
                          ) : itemData.attributes.charge ? (
                            <BatteryCharging20Icon
                              fontSize="small"
                              className={classes.negative}
                            />
                          ) : (
                            <Battery20Icon
                              fontSize="small"
                              className={classes.negative}
                            />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                  <Typography variant="h5" className="bold">
                    {itemData?.attributes?.batteryLevel}%
                  </Typography>
                  <AreaChart
                    width={140}
                    height={50}
                    data={[
                      {
                        name: "Page A",
                        uv: 1890,
                        pv: 4800,
                        amt: 2400,
                      },
                      {
                        name: "Page B",
                        uv: 3000,
                        pv: 1398,
                        amt: 2210,
                      },
                      {
                        name: "Page C",
                        uv: 2000,
                        pv: 9800,
                        amt: 2290,
                      },
                      {
                        name: "Page D",
                        uv: 2780,
                        pv: 3908,
                        amt: 2000,
                      },
                      {
                        name: "Page E",
                        uv: 2390,
                        pv: 3800,
                        amt: 2181,
                      },
                      {
                        name: "Page F",
                        uv: 3490,
                        pv: 4300,
                        amt: 2500,
                      },
                      {
                        name: "Page G",
                        uv: 4000,
                        pv: 2400,
                        amt: 2100,
                      },
                    ]}
                  >
                    <Area
                      type="monotone"
                      dataKey="uv"
                      stroke="#8884d8"
                      fill="#d0d0e0"
                    />
                  </AreaChart>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div className="flex-cont">
                    <Typography>Status</Typography>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <AdjustIcon
                      sx={{
                        fontSize: 45,
                        color:
                          deviceSingleData?.status === "offline"
                            ? "red"
                            : "green",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Typography
                      variant="subtitle"
                      className="bold"
                      sx={{ textAlign: "center", paddingTop: 2 }}
                    >
                      {deviceSingleData?.status === "offline" ? "OFF" : "ON"}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <div>
              <div
                style={{
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    height: 170,
                    width: "100%",
                    maxWidth: "100%",
                    borderRadius: 10,
                  }}
                >
                  <MapView>
                    <MapOverlay />
                    <MapGeofence />
                    <MapAccuracy positions={filteredPositions} />
                    {mapLiveRoutes && <MapLiveRoutes />}
                    <MapPositions
                      positions={filteredPositions}
                      onClick={onClick}
                      selectedPosition={selectedPosition}
                      showStatus
                    />
                    <MapDefaultCamera />
                    <MapSelectedDevice />
                    <PoiMap />
                  </MapView>
                  <MapScale />
                  <MapCurrentLocation />
                  <MapGeocoder />
                  {!features.disableEvents && (
                    <MapNotification
                      enabled={eventsAvailable}
                      onClick={eventHandler}
                    />
                  )}
                  {desktop && (
                    <MapPadding
                      left={parseInt(theme.dimensions.drawerWidthDesktop, 10)}
                    />
                  )}
                </div>
                <div style={{ paddingTop: 4 }} className="flex-cont">
                  <div style={{ display: "flex" }}>
                    <LocationOnIcon sx={{ color: "green" }} />
                    <Typography style={{ paddingLeft: 3 }}>
                      {itemData?.address ? itemData?.address : "N/A"}
                    </Typography>
                  </div>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      navigate(`/position/${id}`);
                    }}
                  >
                    <ViewHeadlineIcon />
                  </div>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ paddingBottom: 10 }}>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div className="flex-cont">
                    <Typography>Last Updated</Typography>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <AccessTimeIcon sx={{ fontSize: 45 }} />
                  </div>

                  <div style={{ textAlign: "center", paddingTop: 10 }}>
                    <div>
                      <Typography variant="subtitle" className="bold">
                        {moment(deviceSingleData?.lastUpdate).format(
                          "DD-MM-YYYY"
                        )}
                      </Typography>
                    </div>
                    <Typography variant="subtitle" className="bold">
                      {moment(deviceSingleData?.lastUpdate).format("hh:mm a")}
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 0,
                    }}
                  >
                    <SemiCircleProgressBar
                      diameter={140}
                      percentage={itemData?.speed}
                      //showPercentValue
                    />
                  </div>
                  <div style={{ textAlign: "center", paddingTop: 0 }}>
                    <Typography
                      variant="subtitle"
                      className="bold"
                      sx={{ textAlign: "center" }}
                    >
                      {itemData?.speed}
                    </Typography>
                  </div>
                  <div style={{ textAlign: "center", paddingTop: 15 }}>
                    <Typography
                      variant="subtitle"
                      className="bold"
                      sx={{ textAlign: "center" }}
                    >
                      Speed
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 15,
                      paddingBottom: 15,
                    }}
                  >
                    <SignalCellularAltIcon
                      sx={{
                        fontSize: 60,
                        color:
                          deviceSingleData?.status === "offline"
                            ? "red"
                            : "green",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Typography
                      variant="subtitle"
                      className="bold"
                      sx={{ textAlign: "center", paddingTop: 3 }}
                    >
                      Connectivity
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div className="bar-cont">
                    {[
                      ...Array(
                        itemData?.attributes?.sat
                          ? itemData?.attributes?.sat
                          : 15
                      ).keys(),
                    ].map((ele) => (
                      <div
                        className={`bars ${
                          ele >
                          (itemData?.attributes?.sat
                            ? itemData?.attributes?.sat
                            : 8)
                            ? ""
                            : "active-bar"
                        }`}
                      ></div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Typography
                      variant="subtitle"
                      className="bold"
                      sx={{ textAlign: "center", paddingTop: 3 }}
                    >
                      ON
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 15,
                      paddingBottom: 15,
                    }}
                  >
                    <NotificationsActiveIcon
                      sx={{ fontSize: 60, color: "#ffa600" }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Typography
                      variant="subtitle"
                      className="bold"
                      sx={{ textAlign: "center", paddingTop: 3 }}
                    >
                      Alerts
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ boxShadow: 1, borderRadius: 3 }}>
              <Card sx={{ boxShadow: 1, borderRadius: 3 }}>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 20,
                    }}
                  >
                    <SemiCircleProgressBar
                      diameter={140}
                      percentage={33}
                      showPercentValue
                    />
                  </div>
                  <div style={{ textAlign: "center", paddingTop: 20 }}>
                    <Typography variant="subtitle" className="bold">
                      Coolent
                    </Typography>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        <div className={classes.container}>
          {selectedItem && (
            <div className={classes.containerMap}>
              <MapView>
                <MapGeofence />
                {route && (
                  <>
                    <MapRoutePath positions={route} />
                    <MapMarkers markers={createMarkers()} />
                    <MapCamera positions={route} />
                  </>
                )}
              </MapView>
            </div>
          )}
          <div className={classes.containerMain}>
            <div className={classes.header}>
              <ReportFilter
                ignoreDevice={true}
                includeFilters={true}
                setTransLength={(val) => setTransVal(val)}
                transLength={transVal}
                handleSubmit={handleSubmit}
              >
                <ColumnSelect
                  columns={columns}
                  setColumns={setColumns}
                  columnsArray={columnsArray}
                />
              </ReportFilter>
            </div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.columnAction} />
                  {columns.map((key) => (
                    <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
                  ))}
                  <TableCell>Rewards</TableCell>
                  <TableCell>Transaction Id</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading ? (
                  items
                    .slice(0, transVal === 100 ? items.length : transVal)
                    .map((item) => {
                      const findData = rewardsData.find(
                        (ele) =>
                          item.deviceId == ele.deviceId &&
                          item.startTime == ele.startdate &&
                          item.endTime == ele.endDate
                      );
                      const rewards =
                        Number(
                          formatDistanceRewards(
                            item["distance"],
                            distanceUnit,
                            t
                          )
                        ) / 4;
                      return (
                        <TableRow key={item.startPositionId}>
                          <TableCell
                            className={classes.columnAction}
                            padding="none"
                          >
                            {selectedItem === item ? (
                              <IconButton
                                size="small"
                                onClick={() => setSelectedItem(null)}
                              >
                                <GpsFixedIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                onClick={() => setSelectedItem(item)}
                              >
                                <LocationSearchingIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                          {columns.map((key) => (
                            <TableCell key={key}>
                              {formatValue(item, key)}
                            </TableCell>
                          ))}
                          <TableCell>
                            {findData ? findData?.rewards : rewards}
                          </TableCell>
                          <TableCell>
                            {findData ? findData?.transactionId : ""}
                          </TableCell>
                          <TableCell>
                            {findData ? "Already paid" : "Unpaid"}
                          </TableCell>
                          <TableCell>
                            <LoadingButton
                              loading={btnLoading}
                              onClick={async () => {
                                if (findData) {
                                  window.open(
                                    findData?.transactionLink,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                                } else {
                                  if (
                                    parseFloat(Math.abs(rewards)) >
                                    parseFloat(0)
                                  ) {
                                    handlePayment({
                                      toAccount: deviceData?.phone
                                        ? deviceData?.phone
                                        : "0x9Cc41DA122b93E993Cb113b5E1f8d54A5d42C178",
                                      deviceId: item.deviceId,
                                      startdate: item.startTime,
                                      endDate: item.endTime,
                                      status: "true",
                                      transactionLink: "1",
                                      transactionId: "1",
                                      meters: Number(
                                        formatDistanceRewards(
                                          item["distance"],
                                          distanceUnit,
                                          t
                                        )
                                      ),
                                      rewards: rewards,
                                      amount: String(
                                        rewards * 1000000000000000000
                                      ),
                                    });
                                  } else {
                                    alert("You Trip has not been verified yet");
                                  }
                                }
                              }}
                              variant="outlined"
                              color="secondary"
                              className={classes.filterButton}
                              //disabled={disabled}
                            >
                              <Typography variant="button" noWrap>
                                {findData ? "Track Status" : "Pay Now"}
                              </Typography>
                            </LoadingButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                ) : (
                  <TableShimmer columns={columns.length + 5} startAction />
                )}
              </TableBody>
            </Table>

            <Snackbar
              open={!!result}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              onClose={() => setResult(null)}
              autoHideDuration={snackBarDurationLongMs}
              message={result}
              sx={{ width: 300 }}
            >
              <Alert
                elevation={6}
                onClose={() => setResult(null)}
                severity="success"
                variant="filled"
                sx={{ minWidth: 300, padding: "15px 25px", borderRadius: 5 }}
              >
                {result}
              </Alert>
            </Snackbar>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default DeviceDetails;
