import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Snackbar,
  IconButton,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginLayout from "./LoginLayout";
import { useTranslation } from "../common/components/LocalizationProvider";
import useQuery from "../common/util/useQuery";
import { snackBarDurationShortMs } from "../common/util/duration";
import { useCatch } from "../reactHelper";
import Logo from "../resources/images/logo-o2-name.png";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    fontSize: theme.spacing(3),
    fontWeight: 500,
    marginLeft: theme.spacing(1),
    textTransform: "uppercase",
  },
}));

const ResetPasswordPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const query = useQuery();

  const token = query.get("passwordReset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();
    let response;
    if (!token) {
      response = await fetch("/api/password/reset", {
        method: "POST",
        body: new URLSearchParams(`email=${encodeURIComponent(email)}`),
      });
    } else {
      response = await fetch("/api/password/update", {
        method: "POST",
        body: new URLSearchParams(
          `token=${encodeURIComponent(token)}&password=${encodeURIComponent(
            password
          )}`
        ),
      });
    }
    if (response.ok) {
      setSnackbarOpen(true);
    } else {
      throw Error(await response.text());
    }
  });

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
            <div className={classes.header}>
              <IconButton color="primary" onClick={() => navigate("/login")}>
                <ArrowBackIcon />
              </IconButton>
              <Typography className={classes.title} color="primary">
                {t("loginReset")}
              </Typography>
            </div>
            <div class="field-cont">
              <div class="fiele-title">
                {!token ? t("userEmail") : t("userPassword")}
              </div>
              <div className="input">
                {!token ? (
                  <TextField
                    required
                    type="email"
                    //label={t("userEmail")}
                    name="email"
                    value={email}
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                ) : (
                  <TextField
                    required
                    //label={t("userPassword")}
                    name="password"
                    value={password}
                    type="password"
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                )}
              </div>
            </div>

            <div class="login-btn">
              <button
                onClick={handleSubmit}
                disabled={!/(.+)@(.+)\.(.{2,})/.test(email) && !password}
              >
                {t("loginReset")}
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
          open={snackbarOpen}
          onClose={() => navigate("/login")}
          autoHideDuration={snackBarDurationShortMs}
          message={!token ? t("loginResetSuccess") : t("loginUpdateSuccess")}
        />
      </div>
      {/* <LoginLayout>
      <div className={classes.container}>
        <div className={classes.header}>
          <IconButton color="primary" onClick={() => navigate('/login')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography className={classes.title} color="primary">
            {t('loginReset')}
          </Typography>
        </div>
        {!token ? (
          <TextField
            required
            type="email"
            label={t('userEmail')}
            name="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        ) : (
          <TextField
            required
            label={t('userPassword')}
            name="password"
            value={password}
            type="password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          disabled={!/(.+)@(.+)\.(.{2,})/.test(email) && !password}
          fullWidth
        >
          {t('loginReset')}
        </Button>
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => navigate('/login')}
        autoHideDuration={snackBarDurationShortMs}
        message={!token ? t('loginResetSuccess') : t('loginUpdateSuccess')}
      />
    </LoginLayout> */}
    </>
  );
};

export default ResetPasswordPage;
