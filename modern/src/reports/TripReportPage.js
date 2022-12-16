import React, { useEffect, useState } from "react";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import {
  formatDistance,
  formatSpeed,
  formatHours,
  formatVolume,
  formatTime,
  formatDistanceRewards,
} from "../common/util/formatter";
import ReportFilter from "./components/ReportFilter";
import { useAttributePreference } from "../common/util/preferences";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import ColumnSelect from "./components/ColumnSelect";
import usePersistedState from "../common/util/usePersistedState";
import { useCatch, useEffectAsync } from "../reactHelper";
import useReportStyles from "./common/useReportStyles";
import MapView from "../map/core/MapView";
import MapRoutePath from "../map/MapRoutePath";
import AddressValue from "../common/components/AddressValue";
import TableShimmer from "../common/components/TableShimmer";
import MapMarkers from "../map/MapMarkers";
import MapCamera from "../map/MapCamera";
import MapGeofence from "../map/MapGeofence";
import Header from "../common/components/Header";
import { BASE_URL, BLOCK_BASE_URL } from "../env";
import { snackBarDurationLongMs } from "../common/util/duration";
import LoadingButton from "@mui/lab/LoadingButton";

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

const TripReportPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

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
    const query = new URLSearchParams({ deviceId, from, to });
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
        const response = await fetch(`/api/devices/${deviceId}`, {
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
        //console.log("res", await response.json());
        const datas = await response.json();
        console.log("datas", datas);
        setRewardsData(datas?.result);
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (datas) => {
    //console.log("data", datas);
    setBtnLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/blockChain/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datas),
      });
      if (response.ok) {
        setBtnLoading(false);
        //console.log("res", await response.json());
        const datas = await response.json();
        console.log("data", datas);
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

  console.log("rewa", deviceData);

  return (
    <>
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
            <ReportFilter handleSubmit={handleSubmit}>
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
                items.map((item) => {
                  console.log("item", item, rewardsData);
                  const findData = rewardsData.find(
                    (ele) =>
                      item.deviceId == ele.deviceId &&
                      item.startTime == ele.startdate &&
                      item.endTime == ele.endDate
                  );
                  console.log("fi", findData);
                  const rewards =
                    Number(
                      formatDistanceRewards(item["distance"], distanceUnit, t)
                    ) / 4;
                  console.log("re", rewards / 4);
                  console.log("pa", parseFloat(0));
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
                                parseFloat(Math.abs(rewards)) > parseFloat(0)
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
                                  amount: String(rewards * 1000000000000000000),
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
    </>
  );
};

export default TripReportPage;
