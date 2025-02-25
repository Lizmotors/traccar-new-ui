import PageLayout from "../common/components/PageLayout";
import SettingsMenu from "../main/components/MainMenu";
import NewAgent from "./NewAgent";

export default function AgentPage() {
  return (
    <div>
      <PageLayout menu={<SettingsMenu />}>
        {/* <div className="header-padding"></div> */}
        <NewAgent />
      </PageLayout>
    </div>
  );
}
