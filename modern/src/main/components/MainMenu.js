import React, { useEffect, useState, useRef, useCallback } from 'react'
import { FaRobot } from 'react-icons/fa6'
import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Toolbar,
  IconButton,
  Button,
  OutlinedInput,
  InputAdornment,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Badge,
  Menu,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ListIcon from '@mui/icons-material/ViewList'
import TuneIcon from '@mui/icons-material/Tune'
import SettingsIcon from '@mui/icons-material/Settings'
import CreateIcon from '@mui/icons-material/Create'
import EmojiEvents from '@mui/icons-material/EmojiEvents'
import NotificationsIcon from '@mui/icons-material/Notifications'
import FolderIcon from '@mui/icons-material/Folder'
import PersonIcon from '@mui/icons-material/Person'
import StorageIcon from '@mui/icons-material/Storage'
import BuildIcon from '@mui/icons-material/Build'
import PeopleIcon from '@mui/icons-material/People'
import TodayIcon from '@mui/icons-material/Today'
import PublishIcon from '@mui/icons-material/Publish'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from '../../common/components/LocalizationProvider'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Logo from '../../resources/images/logo.png'
import NewLogo from '../../resources/images/NewLogo.png'
import {
  useAdministrator,
  useManager,
  useRestriction,
  useDeviceReadonly,
} from '../../common/util/permissions'
import useFeatures from '../../common/util/useFeatures'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import { nativePostMessage } from '../../common/components/NativeInterface'
import { sessionActions, devicesActions } from '../../store'
import { makeStyles } from '@mui/styles'
import LogoutIcon from '@mui/icons-material/Logout'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import AssessmentIcon from '@mui/icons-material/Assessment'
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt'
import FmdGoodIcon from '@mui/icons-material/FmdGood'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import usePersistedState from '../../common/util/usePersistedState'
import DevicesList from '../DevicesList'
import BottomMenu from '../../common/components/BottomMenu'
import EventsDrawer from '../EventsDrawer'
import '../main.css'
import StatusCard from '../StatusCard'
import TimelineIcon from '@mui/icons-material/Timeline'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import RouteIcon from '@mui/icons-material/Route'
import BarChartIcon from '@mui/icons-material/BarChart'
import HomeIcon from '@mui/icons-material/Home'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import LinkIcon from '@mui/icons-material/Link'
import { styled } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import classNames from 'classnames'
import { User } from 'lucide-react'

const MenuItems = ({ title, link, icon, selected }) => {
  const dispatch = useDispatch()
  const deviceOpen = useSelector(state => state.devices.open)

  return (
    <ListItemButton
      sx={{
        color: theme => (theme.palette.mode === 'dark' ? '#fff' : '#0E1726'),
      }}
      key={link}
      component={Link}
      to={link}
      selected={selected}
      onClick={() => {
        if (link !== '/') {
          dispatch(devicesActions.toggleDevice(false))
        }
      }}>
      <ListItemIcon
        sx={{
          color: theme => (theme.palette.mode === 'dark' ? '#fff' : '#0E1726'),
        }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{
          variant: 'subtitle1',
          fontWeight: selected ? 'bold' : 400,
          color: 'inherit',
        }}
        style={{ fontWeight: selected ? 'bold' : 400, fontSize: 18 }}
        primary={title}
      />
    </ListItemButton>
  )
}

// Define the styles for the Card (as a style object)
const CardStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
}

// Create a styled Menu component with the same styles as the Card
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    ...CardStyles,
  },
}))

const useStyles = makeStyles(theme => ({
  last_content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
    padding: '0 50px 30px 50px',
    color: 'grey',
  },
  logocont: {
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'paddingBottom': '10px',
    // padding: "30px 50px",
    '& img': {
      padding: '0 !important',
      margin: '0 !important',
    },
  },

  logoimg: {
    textAlign: 'centre',
    width: 150,
    // height: 70,
    marginRight: 0,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    //minHeight: 45,
    //height: "100%",
    height: 450,
    overflow: 'auto',
    margin: 0,
    padding: 0,
    //backgroundColor: "white",
  },
  sidebarCollapsed: {
    transform: `translateX(-${theme.dimensions.drawerWidthDesktop})`,
    marginLeft: 0,
    [theme.breakpoints.down('md')]: {
      transform: 'translateX(-100vw)',
    },
  },
  toolbarContainer: {
    zIndex: 4,
  },
  toolbar: {
    'display': 'flex',
    'padding': theme.spacing(0, 1),
    '& > *': {
      margin: theme.spacing(0, 1),
    },
  },
  deviceList: {
    flex: 1,
  },
  statusCard: {
    position: 'fixed',
    zIndex: 5,
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${theme.dimensions.drawerWidthDesktop} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${
        theme.dimensions.bottomBarHeight
      }px)`,
    },
    transform: 'translateX(-50%)',
  },
  sidebarToggle: {
    position: 'fixed',
    left: theme.spacing(1.5),
    top: theme.spacing(3),
    borderRadius: '0px',
    minWidth: 0,
    [theme.breakpoints.down('md')]: {
      left: 0,
    },
  },
  sidebarToggleText: {
    marginLeft: theme.spacing(1),
    [theme.breakpoints.only('xs')]: {
      display: 'none',
    },
  },
  sidebarToggleBg: {
    //backgroundColor: "white",
    'color': 'rgba(0, 0, 0, 0.6)',
    '&:hover': {
      //backgroundColor: "white",
    },
  },
  bottomMenu: {
    position: 'fixed',
    left: theme.spacing(1.5),
    bottom: theme.spacing(1.5),
    zIndex: 4,
    width: theme.dimensions.drawerWidthDesktop,
  },
  filterPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    width: theme.dimensions.drawerWidthTablet,
  },
  appbar: {
    //background: "white",
    display: 'flex',
    justifyContent: 'space-between',
    padding: '30px 50px',
  },
  count: {
    display: 'flex',
    width: '30%',
    justifyContent: 'space-between',
  },
  circleCount: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: 'red',
    marginBottom: 10,
  },
  green: {
    backgroundColor: 'green',
  },
  yellow: {
    backgroundColor: 'yellow',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    marginRight: 10,
  },
  root: {
    height: '100%',
  },
  container: {
    margin: 0,
    padding: 20,
    width: '100%',
    height: '100%',
  },
  profileMenu: {
    minWidth: 265,
  },
  profileMenuUser: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: '10px',
  },
  profileMenuItem: {
    'color': theme.palette.text.hint,
    '&:hover': {
      backgroundColor: '#F3F5FF',
    },
  },
  profileMenuIcon: {
    'marginRight': theme.spacing(2),
    'color': theme.palette.text.hint,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  headerMenuItem: {
    '&:hover, &:focus': {
      backgroundColor: theme.palette.background.light,
    },
  },
}))

const isDarkMode = localStorage.getItem('mode') === 'dark'

const SettingsMenu = () => {
  const theme = useTheme()
  const classes = useStyles()
  const t = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const [open, setOpen] = useState(location.pathname.split('/')[1])

  const readonly = useRestriction('readonly')
  const admin = useAdministrator()
  const manager = useManager()
  const userId = useSelector(state => state.session.user.id)
  const user = useSelector(state => state.session.user)
  const deviceOpen = useSelector(state => state.devices.open)
  const dispatch = useDispatch()

  const features = useFeatures()

  const deviceReadonly = useDeviceReadonly()
  const desktop = useMediaQuery(theme.breakpoints.up('md'))
  const phone = useMediaQuery(theme.breakpoints.down('sm'))

  const [mapOnSelect] = usePersistedState('mapOnSelect', false)

  const [mapLiveRoutes] = usePersistedState('mapLiveRoutes', false)

  const selectedDeviceId = useSelector(state => state.devices.selectedId)
  const positions = useSelector(state => state.positions.items)
  const [filteredPositions, setFilteredPositions] = useState([])
  const selectedPosition = filteredPositions.find(
    position => selectedDeviceId && position.deviceId === selectedDeviceId
  )

  const groups = useSelector(state => state.groups.items)
  const devices = useSelector(state => state.devices.items)
  const [filteredDevices, setFilteredDevices] = useState([])

  const [filterKeyword, setFilterKeyword] = useState('')
  const [filterStatuses, setFilterStatuses] = useState([])
  const [filterGroups, setFilterGroups] = useState([])
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '')
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false)

  const filterRef = useRef()
  const [filterAnchorEl, setFilterAnchorEl] = useState(null)

  const [devicesOpen, setDevicesOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)

  const eventHandler = useCallback(() => setEventsOpen(true), [setEventsOpen])
  const eventsAvailable = useSelector(state => !!state.events.items.length)

  const handleClose = () => {
    setDevicesOpen(!devicesOpen)
  }

  const deviceStatusCount = status =>
    Object.values(devices).filter(d => d.status === status).length

  useEffect(() => setDevicesOpen(desktop), [desktop])

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId) {
      setDevicesOpen(false)
    }
  }, [desktop, mapOnSelect, selectedDeviceId])

  const handleOpen = name => {
    if (open === name) {
      setOpen('')
    } else {
      setOpen(name)
    }
  }

  const onClick = useCallback(
    (_, deviceId) => {
      dispatch(devicesActions.select(deviceId))
    },
    [dispatch]
  )

  const deviceGroups = device => {
    const groupIds = []
    let { groupId } = device
    while (groupId) {
      groupIds.push(groupId)
      groupId = groups[groupId].groupId
    }
    return groupIds
  }

  useEffect(() => {
    const filtered = Object.values(devices)
      .filter(
        device =>
          !filterStatuses.length || filterStatuses.includes(device.status)
      )
      .filter(
        device =>
          !filterGroups.length ||
          deviceGroups(device).some(id => filterGroups.includes(id))
      )
      .filter(device => {
        const keyword = filterKeyword.toLowerCase()
        return [
          device.name,
          device.uniqueId,
          device.phone,
          device.model,
          device.contact,
        ].some(s => s && s.toLowerCase().includes(keyword))
      })
    switch (filterSort) {
      case 'name':
        filtered.sort((device1, device2) =>
          device1.name.localeCompare(device2.name)
        )
        break
      case 'lastUpdate':
        filtered.sort((device1, device2) => {
          const time1 = device1.lastUpdate
            ? moment(device1.lastUpdate).valueOf()
            : 0
          const time2 = device2.lastUpdate
            ? moment(device2.lastUpdate).valueOf()
            : 0
          return time2 - time1
        })
        break
      default:
        break
    }
    if (filterSort === 'lastUpdate') {
      filtered.sort((device1, device2) => {
        const time1 = device1.lastUpdate
          ? moment(device1.lastUpdate).valueOf()
          : 0
        const time2 = device2.lastUpdate
          ? moment(device2.lastUpdate).valueOf()
          : 0
        return time2 - time1
      })
    }
    setFilteredDevices(filtered)
    setFilteredPositions(
      filterMap
        ? filtered.map(device => positions[device.id]).filter(Boolean)
        : Object.values(positions)
    )
  }, [
    devices,
    positions,
    filterKeyword,
    filterStatuses,
    filterGroups,
    filterSort,
    filterMap,
  ])

  const handleLogout = async () => {
    const notificationToken = window.localStorage.getItem('notificationToken')
    if (notificationToken) {
      window.localStorage.removeItem('notificationToken')
      const tokens = user.attributes.notificationTokens?.split(',') || []
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter(it => it !== notificationToken).join(',')
                : undefined,
          },
        }
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        })
      }
    }

    await fetch('/api/session', { method: 'DELETE' })
    nativePostMessage('logout')
    navigate('/login')
    dispatch(sessionActions.updateUser(null))
  }

  const pathName = location.pathname.split('/')

  const openMenu = useSelector(state => state.session.openMenu)

  const [profileMenu, setProfileMenu] = useState(null)

  const handleLogoutProfile = () => {
    const dispatch = useDispatch()
    dispatch(sessionActions.logout())
  }

  return (
    <>
      <List>
        {/* <div className={classes.logocont}>
          <div>
            <img src={Logo} alt='logo' className={classes.logoimg} />
          </div>
          <ListItemText
            primaryTypographyProps={{
              fontWeight: "bold",
              variant: "h5",
              //color: "#1875d8",
              color: "#00008B",
            }}
            primary={"O2Club"}
            //style={{ textAlign: "center" }}

            secondary="A Green Reward Program"
            secondaryTypographyProps={{
              //fontWeight: "bold",
              variant: "subtitle2",
              color: "#1875d8",
            }}
          />
        </div> */}
        {openMenu && (
          <div className={classes.logocont}>
            <div>
              <img src={NewLogo} alt='logo' className={classes.logoimg} />
            </div>
          </div>
        )}
        <MenuItems
          title={'Home'}
          link='/'
          icon={<HomeIcon />}
          selected={location.pathname === `/`}
        />
        {!openMenu ? (
          <MenuItems
            title={'Device'}
            link='/settings/device'
            icon={<AddLocationAltIcon />}
            selected={location.pathname === `/settings/device`}
          />
        ) : (
          <Accordion
            //defaultExpanded={location.pathname === "/" ? true : false}
            onChange={() => {
              dispatch(devicesActions.toggleDevice(!deviceOpen))
            }}
            expanded={deviceOpen}
            style={{ border: 'none', boxShadow: 'none', padding: 0 }}
            className='popper-main'>
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    color: theme =>
                      theme.palette.mode === 'dark' ? '#fff' : '#0E1726',
                  }}
                />
              }
              style={{
                border: 'none',
                boxShadow: 'none',
                padding: 0,
                paddingRight: 50,
                margin: 0,
              }}>
              <ListItemButton
                sx={{
                  color: theme =>
                    theme.palette.mode === 'dark' ? '#fff' : '#0E1726',
                }}
                // component={Link}
                // selected={selected}
              >
                <ListItemIcon
                  sx={{
                    color: theme =>
                      theme.palette.mode === 'dark' ? '#fff' : '#0E1726',
                  }}>
                  <AddLocationAltIcon />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    variant: 'body1',
                  }}
                  primary={'Devices'}
                />
              </ListItemButton>
            </AccordionSummary>
            <AccordionDetails
              style={{ border: 'none', boxShadow: 'none', paddingTop: 0 }}
              className={`${classes.details} popper`}>
              <Paper
                square
                elevation={0}
                className={`${classes.sidebar} ${
                  !devicesOpen && classes.sidebarCollapsed
                }`}>
                <Paper
                  square
                  elevation={0}
                  className={classes.toolbarContainer}>
                  <Toolbar className={classes.toolbar} disableGutters>
                    {!desktop && (
                      <IconButton
                        edge='start'
                        sx={{ mr: 0 }}
                        onClick={handleClose}>
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                    <OutlinedInput
                      ref={filterRef}
                      placeholder={t('sharedSearchDevices')}
                      value={filterKeyword}
                      onChange={event => setFilterKeyword(event.target.value)}
                      variant='standard'
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            edge='end'
                            onClick={() =>
                              setFilterAnchorEl(filterRef.current)
                            }>
                            <Badge
                              color='info'
                              variant='dot'
                              invisible={
                                !filterStatuses.length && !filterGroups.length
                              }>
                              <TuneIcon fontSize='small' />
                            </Badge>
                          </IconButton>
                        </InputAdornment>
                      }
                      size='small'
                      fullWidth
                    />
                    <Popover
                      open={!!filterAnchorEl}
                      anchorEl={filterAnchorEl}
                      onClose={() => setFilterAnchorEl(null)}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}>
                      <div className={classes.filterPanel}>
                        <FormControl>
                          <InputLabel>{t('deviceStatus')}</InputLabel>
                          <Select
                            label={t('deviceStatus')}
                            value={filterStatuses}
                            onChange={e => setFilterStatuses(e.target.value)}
                            multiple>
                            <MenuItem value='online'>{`${t(
                              'deviceStatusOnline'
                            )} (${deviceStatusCount('online')})`}</MenuItem>
                            <MenuItem value='offline'>{`${t(
                              'deviceStatusOffline'
                            )} (${deviceStatusCount('offline')})`}</MenuItem>
                            <MenuItem value='unknown'>{`${t(
                              'deviceStatusUnknown'
                            )} (${deviceStatusCount('unknown')})`}</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <InputLabel>{t('settingsGroups')}</InputLabel>
                          <Select
                            label={t('settingsGroups')}
                            value={filterGroups}
                            onChange={e => setFilterGroups(e.target.value)}
                            multiple>
                            {Object.values(groups)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map(group => (
                                <MenuItem key={group.id} value={group.id}>
                                  {group.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        <FormControl>
                          <InputLabel>{t('sharedSortBy')}</InputLabel>
                          <Select
                            label={t('sharedSortBy')}
                            value={filterSort}
                            onChange={e => setFilterSort(e.target.value)}
                            displayEmpty>
                            <MenuItem value=''>{'\u00a0'}</MenuItem>
                            <MenuItem value='name'>{t('sharedName')}</MenuItem>
                            <MenuItem value='lastUpdate'>
                              {t('deviceLastUpdate')}
                            </MenuItem>
                          </Select>
                        </FormControl>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={filterMap}
                                onChange={e => setFilterMap(e.target.checked)}
                              />
                            }
                            label={t('sharedFilterMap')}
                          />
                        </FormGroup>
                      </div>
                    </Popover>
                    <IconButton
                      onClick={() => navigate('/settings/device')}
                      disabled={deviceReadonly}>
                      <AddIcon />
                    </IconButton>
                    {/* {desktop && (
                        <IconButton onClick={handleClose}>
                          <CloseIcon />
                        </IconButton>
                      )} */}
                  </Toolbar>
                </Paper>
                <div className={classes.deviceList}>
                  <DevicesList devices={filteredDevices} />
                </div>
              </Paper>
              {/* {desktop && (
                  <div className={classes.bottomMenu}>
                    <BottomMenu />
                  </div>
                )} */}
              {!features.disableEvents && (
                <EventsDrawer
                  open={eventsOpen}
                  onClose={() => setEventsOpen(false)}
                />
              )}
              {selectedDeviceId && location.pathname === '/' && (
                <div className={classes.statusCard}>
                  <StatusCard
                    deviceId={selectedDeviceId}
                    onClose={() => dispatch(devicesActions.select(null))}
                  />
                </div>
              )}
            </AccordionDetails>
          </Accordion>
        )}
        <MenuItems
          title={t('reportTitle')}
          link='/reports/route'
          icon={<AssessmentIcon />}
          selected={location.pathname === '/reports/route'}
        />
        {/* <Accordion
          //defaultExpanded
          onChange={() => handleOpen("reports")}
          expanded={open === "reports" ? true : false}
          style={{ border: "none", boxShadow: "none", padding: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1875d8" }} />}
            style={{
              border: "none",
              boxShadow: "none",
              padding: 0,
              paddingRight: 50,
              margin: 0,
            }}
          >
            <ListItemButton
              sx={{ color: "#1875d8" }}
              //component={Link}
              //selected={selected}
            >
              <ListItemIcon sx={{ color: "#1875d8" }}>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  fontWeight: "bold",
                  variant: "body1",
                }}
                style={{ fontWeight: "bold" }}
                primary={t("reportTitle")}
              />
            </ListItemButton>
          </AccordionSummary>
          <AccordionDetails
            style={{ border: "none", boxShadow: "none", paddingTop: 0 }}
            className={classes.details}
          >
            <MenuItems
              title={t("reportRoute")}
              link="/reports/route"
              icon={<TimelineIcon />}
              selected={location.pathname === "/reports/route"}
            />
            <MenuItems
              title={t("reportEvents")}
              link="/reports/event"
              icon={<NotificationsActiveIcon />}
              selected={location.pathname === "/reports/event"}
            />
            <MenuItems
              title={t("reportTrips")}
              link="/reports/trip"
              icon={<PlayCircleFilledIcon />}
              selected={location.pathname === "/reports/trip"}
            />
            <MenuItems
              title={t("reportStops")}
              link="/reports/stop"
              icon={<PauseCircleFilledIcon />}
              selected={location.pathname === "/reports/stop"}
            />
            <MenuItems
              title={t("reportSummary")}
              link="/reports/summary"
              icon={<FormatListBulletedIcon />}
              selected={location.pathname === "/reports/summary"}
            />
            <MenuItems
              title={t("reportChart")}
              link="/reports/chart"
              icon={<TrendingUpIcon />}
              selected={location.pathname === "/reports/chart"}
            />
            <MenuItems
              title={t("reportReplay")}
              link="/replay"
              icon={<RouteIcon />}
            />
            {admin && (
              <>
                <List>
                  <MenuItems
                    title={t("statisticsTitle")}
                    link="/reports/statistics"
                    icon={<BarChartIcon />}
                    selected={location.pathname === "/reports/statistics"}
                  />
                </List>
              </>
            )}
          </AccordionDetails>
        </Accordion> */}
        {!features.disableGroups && (
          <MenuItems
            title={t('settingsUsers')}
            link='/settings/users'
            icon={<PeopleIcon />}
            selected={location.pathname === `/settings/users`}
          />
        )}
        {!features.disableDrivers && (
          <MenuItems
            title={t('reportTrips')}
            link='/reports/trip'
            icon={<RouteIcon />}
            selected={location.pathname === `/reports/trip`}
          />
        )}
        <MenuItems
          title={t('sharedGeofences')}
          link='/geofences'
          icon={<CreateIcon />}
          selected={location.pathname.startsWith('/settings/geofence')}
        />
        {!features.disableCalendars && (
          <MenuItems
            title={'Schedule'}
            link='/settings/calendars'
            icon={<TodayIcon />}
            selected={location.pathname.startsWith('/settings/calendar')}
          />
        )}
        {!features.disableMaintenance && (
          <MenuItems
            title={t('sharedMaintenance')}
            link='/settings/maintenances'
            icon={<BusinessCenterIcon />}
            selected={location.pathname.startsWith('/settings/maintenance')}
          />
        )}
        <MenuItems
          title={'Settings'}
          link='/settings/notifications'
          selected={location.pathname.startsWith('/settings/notification')}
          icon={<SettingsIcon />}
        />
        <MenuItems
          title={'Agent'}
          link='/agent'
          selected={location.pathname.startsWith('/agent')}
          icon={<FaRobot size={23} />}
        />
        {/* <Accordion
          //defaultExpanded
          style={{ border: "none", boxShadow: "none", padding: 0 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1875d8" }} />}
            style={{
              border: "none",
              boxShadow: "none",
              padding: 0,
              paddingRight: 50,
              margin: 0,
            }}
          >
            <ListItemButton
              sx={{ color: "#1875d8" }}
              //component={Link}
              //selected={selected}
            >
              <ListItemIcon sx={{ color: "#1875d8" }}>
                <LinkIcon />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  fontWeight: "bold",
                  variant: "body1",
                }}
                style={{ fontWeight: "bold" }}
                primary={"Blockchain"}
              />
            </ListItemButton>
          </AccordionSummary>
          <AccordionDetails
            style={{ border: "none", boxShadow: "none", paddingTop: 0 }}
            className={classes.details}
          >
            {!readonly && (
              <>
                <MenuItems
                  title={"Api Docs"}
                  link="/blockchain/api-docs"
                  icon={<NotificationsIcon />}
                  selected={location.pathname.startsWith(
                    "/blockchain/api-docs"
                  )}
                />
                <MenuItems
                  title={"Tokens"}
                  link="/blockchain/tokens"
                  icon={<PersonIcon />}
                  selected={location.pathname === `/settings/user/${userId}`}
                />
                <MenuItems
                  title={"Logs"}
                  link="/blockchain/logs"
                  icon={<CreateIcon />}
                  selected={location.pathname.startsWith("/settings/geofence")}
                />
              </>
            )}
          </AccordionDetails>
        </Accordion> */}
        {/* <MenuItems
          title={"Reward Engine"}
          link="/blockchain/reward-engine"
          icon={<EmojiEvents />}
          selected={location.pathname.startsWith("/blockchain/reward-engine")}
        /> */}
        {/* <ListItemButton onClick={handleLogout}>
          <ListItemIcon>{<LogoutIcon sx={{ color: "red" }} />}</ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              fontWeight: "bold",
              variant: "body1",
              color: "red",
            }}
            primary={t("loginLogout")}
          />
        </ListItemButton> */}
      </List>
      <div
        style={{ marginTop: 'auto', paddingLeft: '10px', marginTop: '40px' }}>
        {/* <IconButton
          onClick={e => setProfileMenu(e.currentTarget)}
          style={{
            width: '100%',
            justifyContent: 'flex-start',
            padding: '8px',
          }}>
          <div
            style={{
              display: 'flex',
              gap: '35px',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '21px',
                height: '21px',
                borderRadius: '50%',
                border: '1px solid gray',
                backgroundColor: 'lightgray',
              }}>
              <Typography
                sx={{ fontSize: '12px' }}
                variant='h6'
                component={'h6'}>
                <User size={15} />
              </Typography>
            </div>
            <div
              style={{
                fontSize: '17px',
                color: isDarkMode ? '#ffffff' : '#000000',
              }}>
              {user.name}
            </div>
          </div>
        </IconButton> */}
        <StyledMenu
          id='profile-menu'
          open={Boolean(profileMenu)}
          anchorEl={profileMenu}
          onClose={() => setProfileMenu(null)}
          className={classes.headerMenu}
          classes={{ paper: classes.profileMenu }}
          disableAutoFocusItem>
          <div className={classes.profileMenuUser}>
            <Typography
              color={isDarkMode ? '#ffffff' : '#000000'}
              variant='h5'
              weight='medium'>
              {user.name}
            </Typography>
          </div>

          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem
            )}
            sx={{ color: isDarkMode ? '#ffffff' : '#000000' }}
            component={Link}
            to={`/settings/user/${userId}/profile`}
            onClick={() => {
              setProfileMenu(null)
            }}>
            <PersonIcon className={classes.profileMenuIcon} /> Profile
          </MenuItem>
          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem
            )}
            sx={{ color: isDarkMode ? '#ffffff' : '#000000' }}
            component={Link}
            onClick={() => {
              if (localStorage.getItem('mode')) {
                if (localStorage.getItem('mode') === 'dark') {
                  localStorage.setItem('mode', 'light')
                } else {
                  localStorage.setItem('mode', 'dark')
                }
              } else {
                localStorage.setItem('mode', 'dark')
              }
              window.location.reload()
            }}>
            <DarkModeIcon className={classes.profileMenuIcon} />
            {localStorage.getItem('mode') &&
            localStorage.getItem('mode') === 'dark'
              ? 'Light'
              : 'Dark'}
          </MenuItem>
          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem
            )}
            sx={{ color: 'red' }}
            onClick={handleLogoutProfile}>
            <LogoutIcon className={classes.profileMenuIcon} />
            {t('loginLogout')}
          </MenuItem>
        </StyledMenu>
      </div>
    </>
  )
}

export default SettingsMenu
