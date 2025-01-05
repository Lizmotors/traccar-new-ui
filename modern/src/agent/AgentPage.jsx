import { TabContext } from "@mui/lab";
import Header from "../common/components/Header";
import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "../main/components/MainMenu";
import { Tabs } from "@mui/material";
import AgentChat from "./AgentChat";
import TelematicsAgent from "./TelematicsAgent";
import NewAgent from "./NewAgent";

export default function AgentPage() {
  return (
    <div>
      <PageLayout
        menu={<SettingsMenu />}
      //breadcrumbs={["sharedDeviceAccumulators"]}
      >
        <Header />
        <div className="header-padding"></div>
        <NewAgent />
        {/*
        <TelematicsAgent />
        */}

        {/* <AgentChat /> */}
      </PageLayout>
    </div>
  );
}
