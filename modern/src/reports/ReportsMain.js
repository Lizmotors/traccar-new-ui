import React, { useEffect, useState } from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import PageLayout from '../common/components/PageLayout'
import ReportsMenu from './components/ReportsMenu'
import Header from '../common/components/Header'
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useHistory,
} from 'react-router-dom'

import ChartReportPage from './ChartReportPage'
import EventReportPage from './EventReportPage'
import RouteReportPage from './RouteReportPage'
import StatisticsPage from './StatisticsPage'
import StopReportPage from './StopReportPage'
import SummaryReportPage from './SummaryReportPage'
import TripReportPage from './TripReportPage'
import { useTranslation } from '../common/components/LocalizationProvider'
import './style.css'

import {
  useAdministrator,
  useManager,
  useRestriction,
  useDeviceReadonly,
} from '../common/util/permissions'

const SettingsMain = () => {
  const t = useTranslation()
  const [value, setValue] = useState(0)
  let location = useLocation()
  const navigate = useNavigate()

  const admin = useAdministrator()

  const handleChange = (event, newValue) => {
    setValue(newValue)
    navigate(newValue)
  }

  useEffect(() => {
    if (location.pathname == '/settings/notification') {
      setValue('/settings/notifications')
    } else if (location.pathname == '/settings/group') {
      setValue('/settings/groups')
    } else if (location.pathname == '/settings/driver') {
      setValue('/settings/drivers')
    } else if (location.pathname == '/settings/attribute') {
      setValue('/settings/attributes')
    } else if (location.pathname == '/settings/command') {
      setValue('/settings/commands')
    } else if (location.pathname.includes('/settings/device')) {
      setValue('/settings/device')
    } else {
      setValue(location?.pathname)
    }
  }, [location])

  return (
    <div>
      <PageLayout
        menu={<ReportsMenu />}
        //breadcrumbs={["sharedDeviceAccumulators"]}
      >
        <Header />
        <div className='header-padding'></div>
        <TabContext value={value}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant='scrollable'
            scrollButtons='auto'
            aria-label='scrollable auto tabs example'
            style={{ margin: 20, textTransform: 'initial' }}>
            <Tab label={t('reportRoute')} value='/reports/route' />
            <Tab label={t('reportEvents')} value='/reports/event' />
            <Tab label={t('reportTrips')} value='/reports/trip' />
            <Tab label={t('reportStops')} value='/reports/stop' />
            <Tab label={t('reportSummary')} value='/reports/summary' />
            <Tab label={t('reportChart')} value='/reports/chart' />
            <Tab label={t('reportReplay')} value='/replay' />
            {admin && (
              <Tab label={t('statisticsTitle')} value='/reports/statistics' />
            )}
          </Tabs>
          <Routes>
            <Route path='chart' element={<ChartReportPage />} />
            <Route path='event' element={<EventReportPage />} />
            <Route path='route' element={<RouteReportPage />} />
            <Route path='statistics' element={<StatisticsPage />} />
            <Route path='stop' element={<StopReportPage />} />
            <Route path='summary' element={<SummaryReportPage />} />
            <Route path='trip' element={<TripReportPage />} />
          </Routes>
        </TabContext>
      </PageLayout>
    </div>
  )
}

export default SettingsMain
