import { TabContext } from "@mui/lab"
import Header from "../common/components/Header"
import PageLayout from "../common/components/PageLayout"
import SettingsMenu from "../main/components/MainMenu"
import { Tabs } from "@mui/material"

export default function AgentPage() {
	return <div>
		<PageLayout
			menu={<SettingsMenu />}
		//breadcrumbs={["sharedDeviceAccumulators"]}
		>
			<Header />
			<div className='header-padding'>
			</div>
			<div>Agent</div>
		</PageLayout>
	</div>
}
