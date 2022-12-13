import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  useMediaQuery,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sessionActions } from "../store";
import {
  useLocalization,
  useTranslation,
} from "../common/components/LocalizationProvider";
import LoginLayout from "./LoginLayout";
import usePersistedState from "../common/util/usePersistedState";
import {
  handleLoginTokenListeners,
  nativeEnvironment,
  nativePostMessage,
} from "../common/components/NativeInterface";
import LogoImage from "./LogoImage";
import { useCatch } from "../reactHelper";
import "./login.css";
import Logo from "../resources/images/login-logo.png";

const useStyles = makeStyles((theme) => ({
  options: {
    position: "fixed",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  extraContainer: {
    display: "flex",
    gap: theme.spacing(2),
  },
  registerButton: {
    minWidth: "unset",
  },
  resetPassword: {
    cursor: "pointer",
    textAlign: "center",
    marginTop: theme.spacing(2),
  },
}));

const LoginPage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const t = useTranslation();

  const { languages, language, setLanguage } = useLocalization();
  const languageList = Object.entries(languages).map((values) => ({
    code: values[0],
    name: values[1].name,
  }));

  const [failed, setFailed] = useState(false);

  const [email, setEmail] = usePersistedState("loginEmail", "");
  const [password, setPassword] = useState("");

  const registrationEnabled = useSelector(
    (state) => state.session.server.registration
  );
  const languageEnabled = useSelector(
    (state) => !state.session.server.attributes["ui.disableLoginLanguage"]
  );
  const emailEnabled = useSelector(
    (state) => state.session.server.emailEnabled
  );

  const [announcementShown, setAnnouncementShown] = useState(false);
  const announcement = useSelector(
    (state) => state.session.server.announcement
  );

  const generateLoginToken = async () => {
    if (nativeEnvironment) {
      let token = "";
      try {
        const expiration = moment().add(6, "months").toISOString();
        const response = await fetch("/api/session/token", {
          method: "POST",
          body: new URLSearchParams(`expiration=${expiration}`),
        });
        if (response.ok) {
          token = await response.text();
        }
      } catch (error) {
        token = "";
      }
      nativePostMessage(`login|${token}`);
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        body: new URLSearchParams(
          `email=${encodeURIComponent(email)}&password=${encodeURIComponent(
            password
          )}`
        ),
      });
      if (response.ok) {
        const user = await response.json();
        generateLoginToken();
        dispatch(sessionActions.updateUser(user));
        navigate("/");
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setFailed(true);
      setPassword("");
    }
  };

  const handleTokenLogin = useCatch(async (token) => {
    const response = await fetch(
      `/api/session?token=${encodeURIComponent(token)}`
    );
    if (response.ok) {
      const user = await response.json();
      dispatch(sessionActions.updateUser(user));
      navigate("/");
    } else {
      throw Error(await response.text());
    }
  });

  const handleSpecialKey = (e) => {
    if (e.keyCode === 13 && email && password) {
      handlePasswordLogin(e);
    }
  };

  useEffect(() => nativePostMessage("authentication"), []);

  useEffect(() => {
    const listener = (token) => handleTokenLogin(token);
    handleLoginTokenListeners.add(listener);
    return () => handleLoginTokenListeners.delete(listener);
  }, []);

  return (
    <>
      <div class="maincont">
        <div class="logo">
          <img src={Logo} alt="logo" />
        </div>
        <div class="form-cont">
          <div
            class={`form-subcont  ${
              localStorage.getItem("mode") &&
              localStorage.getItem("mode") === "dark"
                ? "form-subcont1"
                : ""
            }`}
          >
            <div
              class={`form-title  ${
                localStorage.getItem("mode") &&
                localStorage.getItem("mode") === "dark"
                  ? "form-title1"
                  : ""
              }`}
            >
              Nice to see you again
            </div>
            <div class="field-cont">
              <div class={"fiele-title"}>{t("userEmail")}</div>
              <div className="input">
                <TextField
                  required
                  error={failed}
                  //label={t("userEmail")}
                  name="email"
                  value={email}
                  autoComplete="email"
                  autoFocus={!email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyUp={handleSpecialKey}
                  helperText={failed && "Invalid username or password"}
                />
              </div>
            </div>
            <div class="field-cont">
              <div class="fiele-title">{t("userPassword")}</div>
              <div className="input">
                <TextField
                  required
                  error={failed}
                  //label={t("userPassword")}
                  name="password"
                  placeholder="password"
                  value={password}
                  type="password"
                  autoComplete="current-password"
                  autoFocus={!!email}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleSpecialKey}
                />
              </div>
            </div>
            <div class="remember-cont">
              {/* <div class="remember-text">
                <input
                  type="checkbox"
                  id="remenber"
                  name="remenber"
                  value="remenber"
                />
                <label for="remenber">Remenber Me</label>
              </div> */}
              <div
                class="forget-text"
                onClick={() => navigate("/register")}
                disabled={!registrationEnabled}
              >
                {t("loginRegister")}
              </div>

              {emailEnabled && (
                <div
                  onClick={() => navigate("/reset-password")}
                  class="forget-text"
                >
                  {t("loginReset")}
                </div>
              )}
            </div>
            <div style={{ paddingBottom: 30 }}>
              {languageEnabled && (
                <FormControl fullWidth>
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
              )}
            </div>
            <div class="login-btn">
              <button
                onClick={handlePasswordLogin}
                onKeyUp={handleSpecialKey}
                disabled={!email || !password}
              >
                {t("loginLogin")}
              </button>
            </div>
          </div>
        </div>
        {/* <div>
          <div class="title">Our Vision:</div>
          <div class="sub-title">
            In addition to being a mood-booster, giving and receiving
            compliments and positive quotes has uplifting effects on both
            parties. As the giver, giving a compliment can boost your
            self-confidence as well as enhance your social skills and spark
            creativity. Compliments can inspire the giver and give the receiver
            the confidence needed to fulfill their goals. Positive messages
            boost the self-esteem of everyone involved.
          </div>
        </div> */}
        <Snackbar
          open={!!announcement && !announcementShown}
          message={announcement}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setAnnouncementShown(true)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </div>
      {/* <LoginLayout>
      <div className={classes.options}>
        {nativeEnvironment && (
          <Tooltip title={t("settingsServer")}>
            <IconButton onClick={() => navigate("/change-server")}>
              <LockOpenIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <div className={classes.container}>
        {useMediaQuery(theme.breakpoints.down("lg")) && (
          <LogoImage color={theme.palette.primary.main} />
        )}
        <TextField
          required
          error={failed}
          label={t("userEmail")}
          name="email"
          value={email}
          autoComplete="email"
          autoFocus={!email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyUp={handleSpecialKey}
          helperText={failed && "Invalid username or password"}
        />
        <TextField
          required
          error={failed}
          label={t("userPassword")}
          name="password"
          value={password}
          type="password"
          autoComplete="current-password"
          autoFocus={!!email}
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={handleSpecialKey}
        />
        <Button
          onClick={handlePasswordLogin}
          onKeyUp={handleSpecialKey}
          variant="contained"
          color="secondary"
          disabled={!email || !password}
        >
          {t("loginLogin")}
        </Button>
        <div className={classes.extraContainer}>
          <Button
            className={classes.registerButton}
            onClick={() => navigate("/register")}
            disabled={!registrationEnabled}
            color="secondary"
          >
            {t("loginRegister")}
          </Button>
          {languageEnabled && (
            <FormControl fullWidth>
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
          )}
        </div>
        {emailEnabled && (
          <Link
            onClick={() => navigate("/reset-password")}
            className={classes.resetPassword}
            underline="none"
            variant="caption"
          >
            {t("loginReset")}
          </Link>
        )}
      </div>
      <Snackbar
        open={!!announcement && !announcementShown}
        message={announcement}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setAnnouncementShown(true)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </LoginLayout> */}
    </>
  );
};

export default LoginPage;
