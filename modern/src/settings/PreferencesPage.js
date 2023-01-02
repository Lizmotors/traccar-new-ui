import React, { useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Autocomplete,
  TextField,
  createFilterOptions,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CachedIcon from "@mui/icons-material/Cached";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  useLocalization,
  useTranslation,
  useTranslationKeys,
} from "../common/components/LocalizationProvider";
import usePersistedState from "../common/util/usePersistedState";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "./components/SettingsMenu";
import MainMenu from "../main/components/MainMenu";
import usePositionAttributes from "../common/attributes/usePositionAttributes";
import { prefixString, unprefixString } from "../common/util/stringUtils";
import SelectField from "../common/components/SelectField";
import useMapStyles from "../map/core/useMapStyles";
import useMapOverlays from "../map/overlay/useMapOverlays";
import { useCatch } from "../reactHelper";
import Header from "../common/components/Header";
import Grid from "@mui/material/Grid";
import "./style.css";
import Divider from "@mui/material/Divider";

const deviceFields = [
  { id: "name", name: "sharedName" },
  { id: "uniqueId", name: "deviceIdentifier" },
  { id: "phone", name: "sharedPhone" },
  { id: "model", name: "deviceModel" },
  { id: "contact", name: "deviceContact" },
  { id: "geofenceIds", name: "sharedGeofences" },
];

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(5),
    [theme.breakpoints.up("xs")]: {
      marginTop: theme.spacing(10),
      marginBottom: theme.spacing(10),
    },
  },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
  tokenActions: {
    display: "flex",
    flexDirection: "column",
  },
}));

const PreferencesPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const userId = useSelector((state) => state.session.user.id);

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    name: values[1].name,
  }));

  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(
    moment().add(1, "week").locale("en").format(moment.HTML5_FMT.DATE)
  );

  const mapStyles = useMapStyles();
  const [activeMapStyles, setActiveMapStyles] = usePersistedState(
    "activeMapStyles",
    ["locationIqStreets", "osm", "carto"]
  );

  const mapOverlays = useMapOverlays();
  const [selectedMapOverlay, setSelectedMapOverlay] =
    usePersistedState("selectedMapOverlay");

  const positionAttributes = usePositionAttributes(t);
  const [positionItems, setPositionItems] = usePersistedState("positionItems", [
    "speed",
    "address",
    "totalDistance",
    "course",
  ]);

  const [mapGeofences, setMapGeofences] = usePersistedState(
    "mapGeofences",
    true
  );
  const [mapLiveRoutes, setMapLiveRoutes] = usePersistedState(
    "mapLiveRoutes",
    false
  );
  const [mapFollow, setMapFollow] = usePersistedState("mapFollow", false);
  const [mapCluster, setMapCluster] = usePersistedState("mapCluster", true);
  const [mapOnSelect, setMapOnSelect] = usePersistedState("mapOnSelect", false);

  const filter = createFilterOptions();

  const generateToken = useCatch(async () => {
    const expiration = moment(
      tokenExpiration,
      moment.HTML5_FMT.DATE
    ).toISOString();
    const response = await fetch("/api/session/token", {
      method: "POST",
      body: new URLSearchParams(`expiration=${expiration}`),
    });
    if (response.ok) {
      setToken(await response.text());
    } else {
      throw Error(await response.text());
    }
  });

  const alarms = useTranslationKeys((it) => it.startsWith("alarm")).map(
    (it) => ({
      key: unprefixString("alarm", it),
      name: t(it),
    })
  );

  const [devicePrimary, setDevicePrimary] = usePersistedState(
    "devicePrimary",
    "name"
  );
  const [deviceSecondary, setDeviceSecondary] = usePersistedState(
    "deviceSecondary",
    ""
  );

  const [soundEvents, setSoundEvents] = usePersistedState("soundEvents", []);
  const [soundAlarms, setSoundAlarms] = usePersistedState("soundAlarms", [
    "sos",
  ]);

  return (
    <>
      <Container
        //maxWidth="xs"
        className={classes.container}
        style={{ height: "100%" }}
      >
        <div className="main-div">
          <Typography variant="h6" className="main-text">
            {t("sharedPreferences")}
          </Typography>

          <FormControl className="form-div">
            <InputLabel>{t("loginLanguage")}</InputLabel>
            <Select
              label={t("loginLanguage")}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languageList.map((it) => (
                <MenuItem key={it.code} value={it.code}>
                  {it.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <Divider className="divider" />

        <div className="main-div">
          <Typography variant="h6" className="main-text">
            {t("userToken")}
          </Typography>

          <TextField
            className="form-div col-space"
            label={t("userExpirationTime")}
            type="date"
            value={tokenExpiration}
            onChange={(e) => {
              setTokenExpiration(e.target.value);
              setToken(null);
            }}
          />
          <FormControl className="form-div">
            <OutlinedInput
              multiline
              rows={6}
              readOnly
              type="text"
              value={token || ""}
              endAdornment={
                <InputAdornment position="end">
                  <div className={classes.tokenActions}>
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={generateToken}
                      disabled={!!token}
                    >
                      <CachedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => navigator.clipboard.writeText(token)}
                      disabled={!token}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </div>
                </InputAdornment>
              }
            />
          </FormControl>
        </div>

        <Divider className="divider" />

        <div className="main-div">
          <Typography variant="h6" className="main-text">
            {t("mapTitle")}
          </Typography>

          <FormControl className="form-div col-space">
            <InputLabel>{t("mapActive")}</InputLabel>
            <Select
              label={t("mapActive")}
              value={activeMapStyles}
              onChange={(e, child) => {
                const clicked = mapStyles.find(
                  (s) => s.id === child.props.value
                );
                if (clicked.available) {
                  setActiveMapStyles(e.target.value);
                } else if (clicked.id !== "custom") {
                  const query = new URLSearchParams({
                    attribute: clicked.attribute,
                  });
                  navigate(`/settings/user/${userId}?${query.toString()}`);
                }
              }}
              multiple
            >
              {mapStyles.map((style) => (
                <MenuItem key={style.id} value={style.id}>
                  <Typography
                    component="span"
                    color={style.available ? "textPrimary" : "error"}
                  >
                    {style.title}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl className="form-div">
            <InputLabel>{t("mapOverlay")}</InputLabel>
            <Select
              label={t("mapOverlay")}
              value={selectedMapOverlay}
              onChange={(e) => {
                const clicked = mapOverlays.find(
                  (o) => o.id === e.target.value
                );
                if (!clicked || clicked.available) {
                  setSelectedMapOverlay(e.target.value);
                } else if (clicked.id !== "custom") {
                  const query = new URLSearchParams({
                    attribute: clicked.attribute,
                  });
                  navigate(`/settings/user/${userId}?${query.toString()}`);
                }
              }}
            >
              <MenuItem value="">{"\u00a0"}</MenuItem>
              {mapOverlays.map((overlay) => (
                <MenuItem key={overlay.id} value={overlay.id}>
                  <Typography
                    component="span"
                    color={overlay.available ? "textPrimary" : "error"}
                  >
                    {overlay.title}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            className="auto-complete"
            multiple
            freeSolo
            options={Object.keys(positionAttributes)}
            getOptionLabel={(option) =>
              positionAttributes.hasOwnProperty(option)
                ? positionAttributes[option].name
                : option
            }
            value={positionItems}
            onChange={(_, option) => {
              setPositionItems(option);
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              if (params.inputValue && !filtered.includes(params.inputValue)) {
                filtered.push(params.inputValue);
              }
              return filtered;
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder={t("sharedAttributes")} />
            )}
          />
          <FormGroup className="check-cont">
            <FormControlLabel
              control={
                <Checkbox
                  checked={mapGeofences}
                  onChange={(e) => setMapGeofences(e.target.checked)}
                />
              }
              label={t("sharedGeofences")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={mapLiveRoutes}
                  onChange={(e) => setMapLiveRoutes(e.target.checked)}
                />
              }
              label={t("mapLiveRoutes")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={mapFollow}
                  onChange={(e) => setMapFollow(e.target.checked)}
                />
              }
              label={t("deviceFollow")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={mapCluster}
                  onChange={(e) => setMapCluster(e.target.checked)}
                />
              }
              label={t("mapClustering")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={mapOnSelect}
                  onChange={(e) => setMapOnSelect(e.target.checked)}
                />
              }
              label={t("mapOnSelect")}
            />
          </FormGroup>
        </div>

        <Divider className="divider" />

        <div className="main-div">
          <Typography variant="h6" className="main-text">
            {t("deviceTitle")}
          </Typography>

          <SelectField
            customStyle="form-div col-space"
            emptyValue={null}
            value={devicePrimary}
            onChange={(e) => setDevicePrimary(e.target.value)}
            data={deviceFields}
            titleGetter={(it) => t(it.name)}
            label={t("sharedPrimary")}
          />
          <SelectField
            customStyle="form-div"
            emptyValue=""
            value={deviceSecondary}
            onChange={(e) => setDeviceSecondary(e.target.value)}
            data={deviceFields}
            titleGetter={(it) => t(it.name)}
            label={t("sharedSecondary")}
          />
        </div>

        <Divider className="divider" />

        <div className="main-div">
          <Typography variant="h6" className="main-text">
            {t("sharedSound")}
          </Typography>

          <SelectField
            multiple
            customStyle="form-div col-space"
            value={soundEvents}
            onChange={(e) => setSoundEvents(e.target.value)}
            endpoint="/api/notifications/types"
            keyGetter={(it) => it.type}
            titleGetter={(it) => t(prefixString("event", it.type))}
            label={t("reportEventTypes")}
          />
          <SelectField
            multiple
            customStyle="form-div"
            value={soundAlarms}
            onChange={(e) => setSoundAlarms(e.target.value)}
            data={alarms}
            keyGetter={(it) => it.key}
            label={t("sharedAlarms")}
          />
        </div>
      </Container>
    </>
  );
};

export default PreferencesPage;
