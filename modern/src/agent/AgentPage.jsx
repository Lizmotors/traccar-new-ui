import { TabContext } from "@mui/lab"
import Header from "../common/components/Header"
import PageLayout from "../common/components/PageLayout"
import SettingsMenu from "../main/components/MainMenu"
import { Tabs } from "@mui/material"
import AgentChat from "./AgentChat"
import TelematicsAgent from "./TelematicsAgent"

export default function AgentPage() {
	return <div>
		<PageLayout
			menu={<SettingsMenu />}
		//breadcrumbs={["sharedDeviceAccumulators"]}
		>
			<Header />
			<div className='header-padding'>
			</div>
			<TelematicsAgent />
			{/*
			<AgentChat />
			*/}

		</PageLayout>
	</div>
}
