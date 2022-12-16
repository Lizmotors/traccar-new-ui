import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  TextField,
  Button,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "../settings/components/SettingsMenu";
import { useCatch } from "../reactHelper";
import { useAttributePreference } from "../common/util/preferences";
import {
  distanceFromMeters,
  distanceToMeters,
  distanceUnitString,
} from "../common/util/converter";
import Header from "../common/components/Header";
import { backendUrl } from "../common/util/env";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-evenly",
    "& > *": {
      flexBasis: "33%",
    },
  },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const Apis = (props) => {
  const navigate = useNavigate();
  const classes = useStyles();
  const t = useTranslation();

  return (
    <PageLayout
      menu={<SettingsMenu />}
      //breadcrumbs={["sharedDeviceAccumulators"]}
    >
      <Header />
      <div className="header-padding"></div>

      <div style={{ width: "100%", height: "90vh", padding: "10px 25px" }}>
        <h1>Api Docs</h1>
        <iframe
          style={{ width: "100%", height: "100%", border: "none" }}
          src={`${backendUrl}/api-docs/`}
          title="W3Schools Free Online Web Tutorials"
        />
      </div>
    </PageLayout>
  );
};

export default Apis;
