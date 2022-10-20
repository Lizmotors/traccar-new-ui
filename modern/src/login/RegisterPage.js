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
import { snackBarDurationShortMs } from "../common/util/duration";
import { useCatch } from "../reactHelper";

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

const RegisterPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = useCatch(async () => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
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
          <div>CROPMED</div>
        </div>
        <div class="form-cont">
          <div class="form-subcont">
            <div class="form-title">Nice to see you again</div>
            <div className={classes.header}>
              <IconButton color="primary" onClick={() => navigate("/login")}>
                <ArrowBackIcon />
              </IconButton>
              <Typography className={classes.title} color="primary">
                {t("loginRegister")}
              </Typography>
            </div>
            <div class="field-cont">
              <div class="fiele-title">{t("sharedName")}</div>
              <div className="input">
                <TextField
                  required
                  //label={t("sharedName")}
                  name="name"
                  value={name}
                  autoComplete="name"
                  autoFocus
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </div>
            <div class="field-cont">
              <div class="fiele-title">{t("userEmail")}</div>
              <div className="input">
                <TextField
                  required
                  type="email"
                  //label={t("userEmail")}
                  name="email"
                  value={email}
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>
            <div class="field-cont">
              <div class="fiele-title">{t("userPassword")}</div>
              <div className="input">
                <TextField
                  required
                  //label={t("userPassword")}
                  name="password"
                  value={password}
                  type="password"
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <div class="login-btn">
              <button
                onClick={handleSubmit}
                disabled={
                  !name || !/(.+)@(.+)\.(.{2,})/.test(email) || !password
                }
              >
                {t("loginRegister")}
              </button>
            </div>
          </div>
        </div>
        <div>
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
        </div>
        <Snackbar
          open={snackbarOpen}
          onClose={() => navigate("/login")}
          autoHideDuration={snackBarDurationShortMs}
          message={t("loginCreated")}
        />
      </div>
      {/* <LoginLayout>
        <div className={classes.container}>
          <div className={classes.header}>
            <IconButton color="primary" onClick={() => navigate("/login")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography className={classes.title} color="primary">
              {t("loginRegister")}
            </Typography>
          </div>
          <TextField
            required
            label={t("sharedName")}
            name="name"
            value={name}
            autoComplete="name"
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            required
            type="email"
            label={t("userEmail")}
            name="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            required
            label={t("userPassword")}
            name="password"
            value={password}
            type="password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            disabled={!name || !/(.+)@(.+)\.(.{2,})/.test(email) || !password}
            fullWidth
          >
            {t("loginRegister")}
          </Button>
        </div>
        <Snackbar
          open={snackbarOpen}
          onClose={() => navigate("/login")}
          autoHideDuration={snackBarDurationShortMs}
          message={t("loginCreated")}
        />
      </LoginLayout> */}
    </>
  );
};

export default RegisterPage;
