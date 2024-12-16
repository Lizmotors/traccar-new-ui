import React, { useState, useEffect, useCallback } from 'react'
import {
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  CardMedia,
  Alert,
  Tooltip,
  Avatar,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
} from '@mui/material'

import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import MapView from '../map/core/MapView'
import MapSelectedDevice from '../map/main/MapSelectedDevice'
import MapAccuracy from '../map/main/MapAccuracy'
import MapGeofence from '../map/MapGeofence'
import MapCurrentLocation from '../map/MapCurrentLocation'
import { useTranslation } from '../common/components/LocalizationProvider'
import PoiMap from '../map/main/PoiMap'
import MapPadding from '../map/MapPadding'
import { devicesActions } from '../store'
import MapDefaultCamera from '../map/main/MapDefaultCamera'
import usePersistedState from '../common/util/usePersistedState'
import MapLiveRoutes from '../map/main/MapLiveRoutes'

import MapPositions from '../map/MapPositions'
import MapOverlay from '../map/overlay/MapOverlay'
import MapGeocoder from '../map/geocoder/MapGeocoder'
import MapScale from '../map/MapScale'
import MapNotification from '../map/notification/MapNotification'

import useFeatures from '../common/util/useFeatures'
import './main.css'
import MainMenu from './components/MainMenu'
import PageLayout from '../common/components/PageLayout'
import Header from '../common/components/Header'
import 'react-circular-progressbar/dist/styles.css'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TimelineIcon from '@mui/icons-material/Timeline'
import AdjustIcon from '@mui/icons-material/Adjust'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import { AreaChart, Area } from 'recharts'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SpeedIcon from '@mui/icons-material/Speed'
import WifiIcon from '@mui/icons-material/Wifi'

import SemiCircleProgressBar from 'react-progressbar-semicircle'
import EventsDrawer from './EventsDrawer'

import 'react-circular-progressbar/dist/styles.css'

import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import LocationSearchingIcon from '@mui/icons-material/LocationSearching'
import {
  formatDistance,
  formatSpeed,
  formatHours,
  formatVolume,
  formatTime,
  formatDistanceRewards,
  formatPercentage,
  formatSpeedVal,
} from '../common/util/formatter'
import ReportFilter from '../reports/components/ReportFilter'
import { useAttributePreference } from '../common/util/preferences'

import ColumnSelect from '../reports/components/ColumnSelect'

import { useCatch, useEffectAsync } from '../reactHelper'
import useReportStyles from '../reports/common/useReportStyles'

import MapRoutePath from '../map/MapRoutePath'
import AddressValue from '../common/components/AddressValue'
import TableShimmer from '../common/components/TableShimmer'
import MapMarkers from '../map/MapMarkers'
import MapCamera from '../map/MapCamera'
import { BASE_URL } from '../env'
import { snackBarDurationLongMs } from '../common/util/duration'
import LoadingButton from '@mui/lab/LoadingButton'
import { useNavigate, useParams } from 'react-router-dom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline'

import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'
import Battery60Icon from '@mui/icons-material/Battery60'
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60'
import Battery20Icon from '@mui/icons-material/Battery20'
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20'
import usePositionAttributes from '../common/attributes/usePositionAttributes'
import PositionValue from '../common/components/PositionValue'
import makeStyles from '@mui/styles/makeStyles'

const columnsArray = [
  ['startTime', 'reportStartTime'],
  ['startOdometer', 'reportStartOdometer'],
  ['startAddress', 'reportStartAddress'],
  ['endTime', 'reportEndTime'],
  ['endOdometer', 'reportEndOdometer'],
  ['endAddress', 'reportEndAddress'],
  ['distance', 'sharedDistance'],
  ['averageSpeed', 'reportAverageSpeed'],
  ['maxSpeed', 'reportMaximumSpeed'],
  ['duration', 'reportDuration'],
  ['spentFuel', 'reportSpentFuel'],
  ['driverName', 'sharedDriver'],
]
const columnsMap = new Map(columnsArray)

const useStyles = makeStyles(theme => ({
  card: {
    width: theme.dimensions.statusCard,
    padding: 3,
    borderRadius: 20,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',

    //justifyContent: "flex-end",
    //alignItems: "flex-start",
  },
  mediaButton: {
    color: theme.palette.colors.white,
    mixBlendMode: 'difference',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  negative: {
    color: theme.palette.colors.negative,
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cell: {
    borderBottom: 'none',
    padding: 1,
  },
  actions: {
    justifyContent: 'space-between',
  },
}))

const StatusRow = ({ name, content }) => {
  const classes = useStyles()

  return (
    <TableRow sx={{ marginBottom: 0 }}>
      <TableCell className={classes.cell}>
        <Typography variant='subtitle2'>{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant='body2' color=''>
          {content}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

const DeviceDetails = props => {
  const navigate = useNavigate()
  const classes = useReportStyles()
  const t = useTranslation()

  const dispatch = useDispatch()
  const theme = useTheme()

  const desktop = useMediaQuery(theme.breakpoints.up('md'))

  const { id, positionId } = useParams()

  const distanceUnit = useAttributePreference('distanceUnit')
  const speedUnit = useAttributePreference('speedUnit')
  const volumeUnit = useAttributePreference('volumeUnit')

  const [result, setResult] = useState()

  const [columns, setColumns] = usePersistedState('tripColumns', [
    'startTime',
    'endTime',
    'distance',
    'averageSpeed',
  ])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [route, setRoute] = useState(null)
  const [rewardsData, setRewardsData] = useState([])
  const [deviceData, setDeviceData] = useState({})
  const [btnLoading, setBtnLoading] = useState(false)

  const features = useFeatures()

  const [mapOnSelect] = usePersistedState('mapOnSelect', false)

  const [mapLiveRoutes] = usePersistedState('mapLiveRoutes', false)

  const itemData = useSelector(state => state.positions.items[id])

  console.log('itemData', itemData)

  // useEffectAsync(async () => {
  //   if (id) {
  //     const response = await fetch(`/api/positions?id=34`);
  //     if (response.ok) {
  //       const positions = await response.json();
  //       if (positions.length > 0) {
  //         //setItemData(positions[0]);
  //       }
  //     } else {
  //       throw Error(await response.text());
  //     }
  //   }
  // }, [id]);

  const deviceSingleData = useSelector(state => {
    if (itemData) {
      const device = state.devices.items[itemData.deviceId]
      if (device) {
        return device
      }
    }
    return null
  })

  const selectedDeviceId = itemData ? itemData.deviceId : ''
  const positions = useSelector(state => state.positions.items)
  const [filteredPositions, setFilteredPositions] = useState([])
  const selectedPosition = filteredPositions.find(
    position => selectedDeviceId && position.deviceId === selectedDeviceId
  )

  const groups = useSelector(state => state.groups.items)
  const devices = useSelector(state => state.devices.items)

  const [filterKeyword, setFilterKeyword] = useState('')
  const [filterStatuses, setFilterStatuses] = useState([])
  const [filterGroups, setFilterGroups] = useState([])
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '')
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false)

  const [eventsOpen, setEventsOpen] = useState(false)

  const eventsAvailable = useSelector(state => !!state.events.items.length)

  const eventHandler = useCallback(() => setEventsOpen(true), [setEventsOpen])

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

    let countData = { online: 0, offline: 0, expired: 0, never: 0 }

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

  const [transVal, setTransVal] = useState(3)

  const createMarkers = () => [
    {
      latitude: selectedItem.startLat,
      longitude: selectedItem.startLon,
      color: 'negative',
    },
    {
      latitude: selectedItem.endLat,
      longitude: selectedItem.endLon,
      color: 'positive',
    },
  ]

  useEffectAsync(async () => {
    if (selectedItem) {
      const query = new URLSearchParams({
        deviceId: selectedItem.deviceId,
        from: selectedItem.startTime,
        to: selectedItem.endTime,
      })
      const response = await fetch(`/api/reports/route?${query.toString()}`, {
        headers: {
          Accept: 'application/json',
        },
      })
      if (response.ok) {
        setRoute(await response.json())
      } else {
        throw Error(await response.text())
      }
    } else {
      setRoute(null)
    }
  }, [selectedItem])

  const handleSubmit = useCatch(async ({ deviceId, from, to, type }) => {
    const query = new URLSearchParams({
      deviceId: selectedDeviceId,
      from,
      to,
    })
    if (type === 'export') {
      window.location.assign(`/api/reports/trips/xlsx?${query.toString()}`)
    } else if (type === 'mail') {
      const response = await fetch(
        `/api/reports/trips/mail?${query.toString()}`
      )
      if (!response.ok) {
        throw Error(await response.text())
      }
    } else {
      setLoading(true)
      try {
        const response = await fetch(`/api/devices/1`, {
          headers: { Accept: 'application/json' },
        })
        if (response.ok) {
          setDeviceData(await response.json())
        } else {
          throw Error(await response.text())
        }
      } finally {
        setLoading(false)
      }

      try {
        const response = await fetch(`/api/reports/trips?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        })
        if (response.ok) {
          setItems(await response.json())
        } else {
          throw Error(await response.text())
        }
      } finally {
        setLoading(false)
      }
    }
  })

  useEffect(() => {
    if (selectedDeviceId) {
      handleSubmit({
        from: moment().startOf('day').toISOString(),
        to: moment().endOf('day').toISOString(),
        type: 'json',
      })
    }
  }, [selectedDeviceId])

  const formatValue = (item, key) => {
    switch (key) {
      case 'startTime':
      case 'endTime':
        return formatTime(item[key], 'YYYY-MM-DD HH:mm')
      case 'startOdometer':
      case 'endOdometer':
      case 'distance':
        return formatDistance(item[key], distanceUnit, t)
      case 'averageSpeed':
      case 'maxSpeed':
        return formatSpeed(item[key], speedUnit, t)
      case 'duration':
        return formatHours(item[key])
      case 'spentFuel':
        return formatVolume(item[key], volumeUnit, t)
      case 'startAddress':
        return (
          <AddressValue
            latitude={item.startLat}
            longitude={item.startLon}
            originalAddress={item[key]}
          />
        )
      case 'endAddress':
        return (
          <AddressValue
            latitude={item.endLat}
            longitude={item.endLon}
            originalAddress={item[key]}
          />
        )
      default:
        return item[key]
    }
  }

  const getRewardsData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/blockChain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (response.ok) {
        const datas = await response.json()
        setRewardsData(datas?.result)
      } else {
        throw Error(await response.text())
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async datas => {
    setBtnLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/blockChain/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datas),
      })
      if (response.ok) {
        setBtnLoading(false)
        const datas = await response.json()
        setResult('Payment Done Successfully')
        // getRewardsData();
      } else {
        throw Error(await response.text())
      }
    } finally {
      setBtnLoading(false)
    }
  }

  useEffect(() => {
    //getRewardsData()
  }, [])

  const [address, setAddress] = useState('')

  const showAddress = useCatch(async () => {
    const query = new URLSearchParams({
      latitude: itemData?.latitude,
      longitude: itemData?.longitude,
    })
    const response = await fetch(`/api/server/geocode?${query.toString()}`)
    if (response.ok) {
      setAddress(await response.text())
    } else {
      throw Error(await response.text())
    }
  })

  const [positionItems] = usePersistedState('positionItems', [
    'speed',
    'address',
    'totalDistance',
    'course',
  ])
  const positionAttributes = usePositionAttributes(t)

  useEffect(() => {
    if (itemData?.latitude && itemData?.longitude) {
      showAddress()
    }
  }, [itemData])

  console.log('itemData', itemData)

  return (
    <PageLayout menu={<MainMenu />}>
      <Header />
      <div className='header-padding horizontal-padding main-div'>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
              <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                <CardContent>
                  <div>
                    {deviceSingleData?.attributes?.deviceImage ? (
                      <div style={{ width: '100%', maxHeight: '200px' }}>
                        <img
                          style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'cover',
                          }}
                          src={`/api/media/${deviceSingleData?.uniqueId}/${deviceSingleData?.attributes?.deviceImage}`}
                          //src='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEQ8QEBIQEBUQEBUWFRUVDxUQFRYQFRYWFxUVFRUYHSggGholHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFw8QFSsaFRkrKy0rLSsrKysrLS0rNzcrLTc3Ky0rNzcrKy0rLS0rLSstKysrKysrKysrKysrKysrK//AABEIALcBEwMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAABAECAwUGBwj/xABFEAABAwIDBAcEBQgKAwAAAAABAAIDBBEFEiEGEzFBByJRYXGBkRQyobEjQkPB0RVEUlNicpLwFhczc4KDk6Ky4SRUwv/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABsRAQEBAAMBAQAAAAAAAAAAAAARARIhUUEC/9oADAMBAAIRAxEAPwD3FERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERARUKIKosb5mjiWjxICwHEoBpvov8AUb+KCWi1smPUjeNRAP8AMasR2loRxqYB/mBBt0WoG09CfzqD/UCktxenIzCVjgeYNx8EE5FrxjNP+tas8VdE73XtPmgkorQbq5AREQEREBERAREQEREBERAREQEREBERAREQERWveGgkkAAXJJsABxJKC5c7tFtbBRhzdZpWj+zYRcfvu4N+fcub2j21dMXRUTssfB0/N/aIewft+nauUDdLDQepJPEknie9BlxDpBxOckxhkDP0Y2ku83u5eAC0lVtPWuOpuT+nM91/IOF/RbbRoJ0AFyfDmuRjnEr31L72fIGR6Xs29h4KCkm0tY5xa1sZPdT5jobcdVYMcrCS18jIrDXMzL5cFtYNmIgMxkmBIubPA7zra9lpZqdgLskmZoOma5J8Sm6kH4zOftWlYzicx0L2eJP/AGoWHRE578nag97iFfPuy4gPs1gOa44Ae9Y/zqnL4kSo6iV7o4wQ50ruqGmwyj3nE8AO/wAVtn7QiMCOImTLpmLi1h/daOtbvJ17BwWhgc5sL5QLSVXUaP0KRuhA/ecLeDT2rYYW2kiaN+0yyX61xdo7gPvV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'
                        />
                        {/* <CardMedia
                          className={classes.media}
                          sx={{
                            // maxWidth: 200,
                            // maxHeight: 200,
                            // display: 'flex',
                            height: 200,
                            borderRadius: 10,
                          }}
                          //image={`/api/media/${deviceSingleData?.uniqueId}/${deviceSingleData?.attributes?.deviceImage}`}
                          image={
                            '/api/media/00000868105047454085/device.png'
                          }></CardMedia> */}
                      </div>
                    ) : (
                      <>
                        <CardMedia
                          className={classes.media}
                          style={{
                            width: '100%',
                            maxHeight: 200,
                            display: 'flex',
                            borderRadius: 10,
                          }}
                          image={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDXPVORv9tYVdmR5AQX5Lishkts7AYTFt0hG5FCgGytyXDubUF2x0K1gxNUtmJQiFSlF4&usqp=CAU`}></CardMedia>
                      </>
                    )}
                  </div>
                  <Typography
                    variant='h5'
                    className='bold'
                    style={{ paddingTop: 2 }}>
                    {deviceSingleData?.name}
                  </Typography>
                  <Typography variant='button'>
                    {deviceSingleData?.uniqueId}
                  </Typography>

                  {itemData && (
                    <Table size='small' classes={{ root: classes.table }}>
                      <TableBody>
                        <div style={{ maxHeight: 500, overflow: 'auto' }}>
                          {positionItems
                            .filter(
                              key =>
                                itemData.hasOwnProperty(key) ||
                                itemData.attributes.hasOwnProperty(key)
                            )
                            .map(key => (
                              <StatusRow
                                key={key}
                                name={positionAttributes[key].name}
                                content={
                                  <PositionValue
                                    position={itemData}
                                    property={
                                      itemData.hasOwnProperty(key) ? key : null
                                    }
                                    attribute={
                                      itemData.hasOwnProperty(key) ? null : key
                                    }
                                  />
                                }
                              />
                            ))}
                        </div>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container spacing={2} sx={{ paddingBottom: 0 }}>
              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      <div className='flex-cont'>
                        <Typography>Odometer</Typography>
                        <TimelineIcon />
                      </div>
                      <Typography
                        sx={{
                          color: '#2A42CB',
                          paddingBottom: 0,
                          typography: { sm: 'h4', xs: 'h6' },
                        }}
                        className='bold'>
                        {itemData?.attributes?.odometer
                          ? formatDistance(
                              itemData?.attributes?.odometer,
                              distanceUnit,
                              t
                            )
                          : '0'}
                      </Typography>
                      {/* <AreaChart
                    width={140}
                    height={50}
                    data={[
                      {
                        name: "Page A",
                        uv: 1890,
                        pv: 4800,
                        amt: 2400,
                      },
                      {
                        name: "Page B",
                        uv: 3000,
                        pv: 1398,
                        amt: 2210,
                      },
                      {
                        name: "Page C",
                        uv: 2000,
                        pv: 9800,
                        amt: 2290,
                      },
                      {
                        name: "Page D",
                        uv: 2780,
                        pv: 3908,
                        amt: 2000,
                      },
                      {
                        name: "Page E",
                        uv: 2390,
                        pv: 3800,
                        amt: 2181,
                      },
                      {
                        name: "Page F",
                        uv: 3490,
                        pv: 4300,
                        amt: 2500,
                      },
                      {
                        name: "Page G",
                        uv: 4000,
                        pv: 2400,
                        amt: 2100,
                      },
                    ]}
                  >
                    <Area
                      type="monotone"
                      dataKey="uv"
                      stroke="#8884d8"
                      fill="#d0d0e0"
                    />
                  </AreaChart> */}
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      <div className='flex-cont'>
                        <Typography>Total Distance</Typography>
                        <TimelineIcon />
                      </div>
                      <Typography
                        sx={{
                          color: '#2A42CB',
                          paddingBottom: 0,
                          typography: { sm: 'h4', xs: 'h6' },
                        }}
                        className='bold'>
                        {itemData?.attributes?.totalDistance
                          ? formatDistance(
                              itemData?.attributes?.totalDistance,
                              distanceUnit,
                              t
                            )
                          : '0'}
                      </Typography>
                      {/* <div className='flex-cont'>
                        <Typography>
                          {itemData?.attributes?.hasOwnProperty('batteryLevel')
                            ? 'Charge'
                            : 'Fuel'}
                        </Typography>
                        {itemData?.attributes?.hasOwnProperty(
                          'batteryLevel'
                        ) && (
                          <Tooltip
                            title={`${t(
                              'positionBatteryLevel'
                            )}: ${formatPercentage(
                              itemData?.attributes?.batteryLevel
                            )}`}>
                            {itemData?.attributes?.batteryLevel > 70 ? (
                              itemData?.attributes?.charge ? (
                                <BatteryChargingFullIcon
                                  fontSize='small'
                                  className={classes.positive}
                                />
                              ) : (
                                <BatteryFullIcon
                                  fontSize='small'
                                  className={classes.positive}
                                />
                              )
                            ) : itemData?.attributes?.batteryLevel > 30 ? (
                              itemData?.attributes?.charge ? (
                                <BatteryCharging60Icon
                                  fontSize='small'
                                  className={classes.medium}
                                />
                              ) : (
                                <Battery60Icon
                                  fontSize='small'
                                  className={classes.medium}
                                />
                              )
                            ) : itemData?.attributes?.charge ? (
                              <BatteryCharging20Icon
                                fontSize='small'
                                className={classes.negative}
                              />
                            ) : (
                              <Battery20Icon
                                fontSize='small'
                                className={classes.negative}
                              />
                            )}
                          </Tooltip>
                        )}
                        {itemData?.attributes?.hasOwnProperty('fuel') && (
                          <Tooltip
                            title={`${t(
                              'positionBatteryLevel'
                            )}: ${formatPercentage(
                              itemData?.attributes?.fuel
                            )}`}>
                            <IconButton size='small'>
                              {itemData?.attributes?.fuel > 70 ? (
                                itemData?.attributes?.fuel ? (
                                  <BatteryChargingFullIcon
                                    fontSize='small'
                                    className={classes.positive}
                                  />
                                ) : (
                                  <BatteryFullIcon
                                    fontSize='small'
                                    className={classes.positive}
                                  />
                                )
                              ) : itemData?.attributes?.fuel > 30 ? (
                                itemData?.attributes?.fuel ? (
                                  <BatteryCharging60Icon
                                    fontSize='small'
                                    className={classes.medium}
                                  />
                                ) : (
                                  <Battery60Icon
                                    fontSize='small'
                                    className={classes.medium}
                                  />
                                )
                              ) : itemData?.attributes?.fuel ? (
                                <BatteryCharging20Icon
                                  fontSize='small'
                                  className={classes.negative}
                                />
                              ) : (
                                <Battery20Icon
                                  fontSize='small'
                                  className={classes.negative}
                                />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                      <Typography
                        sx={{
                          color: '#08D320',
                          paddingBottom: 0,
                          typography: { sm: 'h4', xs: 'h6' },
                        }}
                        className='bold'>
                        {itemData?.attributes?.batteryLevel
                          ? itemData?.attributes?.batteryLevel
                          : itemData?.attributes?.fuel
                          ? itemData?.attributes?.fuel
                          : ''}
                        %
                      </Typography> */}
                      {/* <AreaChart
                    width={140}
                    height={50}
                    data={[
                      {
                        name: "Page A",
                        uv: 1890,
                        pv: 4800,
                        amt: 2400,
                      },
                      {
                        name: "Page B",
                        uv: 3000,
                        pv: 1398,
                        amt: 2210,
                      },
                      {
                        name: "Page C",
                        uv: 2000,
                        pv: 9800,
                        amt: 2290,
                      },
                      {
                        name: "Page D",
                        uv: 2780,
                        pv: 3908,
                        amt: 2000,
                      },
                      {
                        name: "Page E",
                        uv: 2390,
                        pv: 3800,
                        amt: 2181,
                      },
                      {
                        name: "Page F",
                        uv: 3490,
                        pv: 4300,
                        amt: 2500,
                      },
                      {
                        name: "Page G",
                        uv: 4000,
                        pv: 2400,
                        amt: 2100,
                      },
                    ]}
                  >
                    <Area
                      type="monotone"
                      dataKey="uv"
                      stroke="#8884d8"
                      fill="#d0d0e0"
                    />
                  </AreaChart> */}
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      {/* <div className='flex-cont'>
                        <Typography>Status</Typography>
                        <div
                          style={{ display: 'flex', justifyContent: 'center' }}>
                          <AdjustIcon
                            sx={{
                              fontSize: 24,
                              color:
                                deviceSingleData?.status === 'online'
                                  ? 'green'
                                  : 'red',
                            }}
                          />
                        </div>
                      </div>

                      <Typography
                        sx={{
                          paddingTop: 0,
                          color:
                            deviceSingleData?.status === 'online'
                              ? '#089518'
                              : '#FF0000',
                          typography: { sm: 'h4', xs: 'h6' },
                        }}
                        className='bold'>
                        {deviceSingleData?.status === 'online' ? 'ON' : 'OFF'}
                      </Typography> */}
                      <div className='flex-cont'>
                        <Typography>Ignition</Typography>
                        <AdjustIcon
                          sx={{
                            fontSize: 24,
                            color:
                              itemData?.attributes?.ignition === 'true' ||
                              itemData?.attributes?.ignition
                                ? 'green'
                                : 'red',
                          }}
                        />
                      </div>
                      <Typography
                        sx={{
                          color:
                            itemData?.attributes?.ignition === 'true' ||
                            itemData?.attributes?.ignition
                              ? '#089518'
                              : '#FF0000',
                          typography: { sm: 'h4', xs: 'h6' },
                          paddingBottom: 0,
                        }}
                        className='bold'>
                        {itemData?.attributes?.ignition === 'true' ||
                        itemData?.attributes?.ignition
                          ? 'ON'
                          : 'OFF'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <CardContent>
                    <div
                      style={{
                        borderRadius: 10,
                      }}>
                      <div
                        style={{
                          height: 280,
                          width: '100%',
                          maxWidth: '100%',
                          borderRadius: 10,
                        }}>
                        <MapView>
                          <MapOverlay />
                          <MapGeofence />
                          <MapAccuracy positions={filteredPositions} />
                          {mapLiveRoutes && <MapLiveRoutes />}
                          <MapPositions
                            positions={filteredPositions}
                            onClick={onClick}
                            selectedPosition={selectedPosition}
                            showStatus
                          />
                          <MapDefaultCamera />
                          <MapSelectedDevice />
                          <PoiMap />
                        </MapView>
                        <MapScale />
                        <MapCurrentLocation />
                        <MapGeocoder />
                        {!features.disableEvents && (
                          <MapNotification
                            enabled={eventsAvailable}
                            onClick={eventHandler}
                          />
                        )}
                        {desktop && (
                          <MapPadding
                            left={parseInt(
                              theme.dimensions.drawerWidthDesktop,
                              10
                            )}
                          />
                        )}
                      </div>
                      <div
                        style={{ paddingTop: 4, paddingBottom: 0 }}
                        className='flex-cont'>
                        <div style={{ display: 'flex' }}>
                          <LocationOnIcon sx={{ color: '#144BFF' }} />
                          <Typography style={{ paddingLeft: 3 }}>
                            {address ? address : 'N/A'}
                          </Typography>
                        </div>
                        <div
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            navigate(`/position/${positionId}`)
                          }}>
                          <ViewHeadlineIcon />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      {/* <div className='flex-cont'>
                        <Typography>Last Updated</Typography>
                      </div>
                      <div>
                        <AccessTimeIcon
                          sx={{ fontSize: 24, color: '#144BFF' }}
                        />
                      </div>

                      <div style={{ paddingTop: 0 }}>
                        <Typography variant='subtitle2' className='bold'>
                          {moment(deviceSingleData?.lastUpdate).format(
                            'DD-MM-YYYY hh:mm a'
                          )}
                        </Typography>
                      </div> */}
                      <div className='flex-cont'>
                        <Typography>Motion</Typography>
                        <AdjustIcon
                          sx={{
                            fontSize: 24,
                            color:
                              itemData?.attributes?.motion === 'true' ||
                              itemData?.attributes?.motion
                                ? 'green'
                                : 'red',
                          }}
                        />
                      </div>
                      <Typography
                        sx={{
                          color:
                            itemData?.attributes?.motion === 'true' ||
                            itemData?.attributes?.motion
                              ? '#089518'
                              : '#FF0000',
                          typography: { sm: 'h4', xs: 'h6' },
                          paddingBottom: 0,
                        }}
                        className='bold'>
                        {itemData?.attributes?.motion === 'true' ||
                        itemData?.attributes?.motion
                          ? 'ON'
                          : 'OFF'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      <div className='flex-cont'>
                        <Typography>Speed</Typography>
                      </div>
                      {/* <div>
                        <SpeedIcon sx={{ fontSize: 24, color: '#F2590D' }} />
                      </div> */}

                      <div style={{ paddingTop: 0 }}>
                        <Typography
                          sx={{ typography: { sm: 'h4', xs: 'h6' } }}
                          className='bold'
                          color=' #F2590D'>
                          {formatSpeed(itemData?.speed, speedUnit, t)}
                        </Typography>
                      </div>
                      {/* <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          paddingTop: 0,
                        }}>
                        <SemiCircleProgressBar
                          diameter={140}
                          percentage={formatSpeedVal(
                            itemData?.speed,
                            speedUnit,
                            t
                          )}
                          //showPercentValue
                        />
                      </div> */}
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
              {/* <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      <div className='flex-cont'>
                        <Typography>Connectivity</Typography>
                      </div>
                      <div>
                        <WifiIcon
                          sx={{
                            fontSize: 24,
                            color:
                              deviceSingleData?.status === 'online'
                                ? 'green'
                                : 'red',
                          }}
                        />
                      </div>

                      <div style={{ paddingTop: 0 }}>
                        <Typography
                          variant='subtitle2'
                          className='bold'
                          color=' #F2590D'
                          style={{ visibility: 'hidden' }}>
                          aaaaa
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Box>
              </Grid> */}
              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      <div className='flex-cont'>
                        <Typography>Satellites</Typography>
                      </div>
                      {/* <div>
                        <div className='bar-cont'>
                          {[
                            ...Array(
                              itemData?.attributes?.sat
                                ? itemData?.attributes?.sat
                                : 15
                            ).keys(),
                          ].map(ele => (
                            <div
                              className={`bars ${
                                ele >
                                (itemData?.attributes?.sat
                                  ? itemData?.attributes?.sat
                                  : -1)
                                  ? ''
                                  : 'active-bar'
                              }`}></div>
                          ))}
                        </div>
                      </div> */}
                      <div style={{ paddingTop: 0 }}>
                        <Typography
                          sx={{
                            typography: { sm: 'h4', xs: 'h6' },
                          }}
                          // variant='subtitle2'
                          className='bold'
                          color=' #F2590D'>
                          {itemData?.attributes?.sat
                            ? itemData?.attributes?.sat
                            : 0}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        navigate(`/settings/notifications`)
                      }}>
                      <div className='flex-cont'>
                        <Typography>Alerts</Typography>
                      </div>
                      <div style={{ paddingBottom: 3 }}>
                        <NotificationsActiveIcon
                          sx={{
                            fontSize: 24,
                            color: '#F6B500',
                          }}
                        />
                      </div>
                      {/* <div style={{ paddingTop: 0 }}>
                        <Typography
                          variant='subtitle2'
                          className='bold'
                          color=' #F2590D'
                          style={{ visibility: 'hidden' }}>
                          aaaaa
                        </Typography>
                      </div> */}
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      <div className='flex-cont'>
                        <Typography>Last Trip</Typography>
                      </div>
                      {/* <div>
                        <SemiCircleProgressBar
                          diameter={70}
                          percentage={parseInt(
                            itemData?.attributes?.coolantTemp
                              ? itemData?.attributes?.coolantTemp
                              : 0
                          )}
                        />
                      </div> */}
                      <div style={{ paddingTop: 0 }}>
                        <Typography
                          sx={{
                            typography: { sm: 'h4', xs: 'h6' },
                          }}
                          variant='subtitle2'
                          className='bold'
                          color=' #F2590D'>
                          {itemData?.attributes?.tripOdometer
                            ? itemData?.attributes?.tripOdometer
                            : 0}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>

              <Grid item xs={6} md={4}>
                <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
                  <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                    <CardContent>
                      <div className='flex-cont'>
                        <Typography>Last Updated</Typography>
                      </div>

                      <div style={{ paddingBottom: 8 }}>
                        <Typography
                          sx={{
                            // color: '#2A42CB',
                            // paddingBottom: 0,
                            typography: { sm: 'h5', xs: 'h6' },
                          }}
                          className='bold'>
                          {moment(deviceSingleData?.lastUpdate).format(
                            'DD-MM-YYYY hh:mm a'
                          )}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </Grid>

            {/* <Grid container spacing={2} sx={{ paddingBottom: 10 }}> */}
            {/* <Grid item xs={6} md={9}> */}
            {/* </Grid> */}
            {/* </Grid> */}
          </Grid>
        </Grid>

        {/* <Grid container spacing={2}> */}
        <Grid container spacing={2} sx={{ paddingTop: 3 }}>
          <Grid item xs={12} md={12}>
            <Box sx={{ boxShadow: 0, borderRadius: 4 }}>
              <Card sx={{ boxShadow: 0, borderRadius: 4 }}>
                <CardContent>
                  <div className={classes.container}>
                    {selectedItem && (
                      <div className={classes.containerMap}>
                        <MapView>
                          <MapGeofence />
                          {route && (
                            <>
                              <MapRoutePath positions={route} />
                              <MapMarkers markers={createMarkers()} />
                              <MapCamera positions={route} />
                            </>
                          )}
                        </MapView>
                      </div>
                    )}
                    <div className={classes.containerMain}>
                      <div className={classes.header}>
                        <ReportFilter
                          ignoreDevice={true}
                          includeFilters={true}
                          setTransLength={val => setTransVal(val)}
                          transLength={transVal}
                          handleSubmit={handleSubmit}>
                          <ColumnSelect
                            columns={columns}
                            setColumns={setColumns}
                            columnsArray={columnsArray}
                          />
                        </ReportFilter>
                      </div>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell className={classes.columnAction} />
                            {columns.map(key => (
                              <TableCell key={key}>
                                {t(columnsMap.get(key))}
                              </TableCell>
                            ))}
                            {/* <TableCell>Rewards</TableCell>
                <TableCell>Transaction Id</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell> */}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {!loading ? (
                            items
                              .slice(
                                0,
                                transVal === 100 ? items.length : transVal
                              )
                              .map(item => {
                                const findData = rewardsData.find(
                                  ele =>
                                    item.deviceId == ele.deviceId &&
                                    item.startTime == ele.startdate &&
                                    item.endTime == ele.endDate
                                )
                                const rewards =
                                  Number(
                                    formatDistanceRewards(
                                      item['distance'],
                                      distanceUnit,
                                      t
                                    )
                                  ) / 4
                                return (
                                  <TableRow key={item.startPositionId}>
                                    <TableCell
                                      className={classes.columnAction}
                                      padding='none'>
                                      {selectedItem === item ? (
                                        <IconButton
                                          size='small'
                                          onClick={() => setSelectedItem(null)}>
                                          <GpsFixedIcon fontSize='small' />
                                        </IconButton>
                                      ) : (
                                        <IconButton
                                          size='small'
                                          onClick={() => setSelectedItem(item)}>
                                          <LocationSearchingIcon fontSize='small' />
                                        </IconButton>
                                      )}
                                    </TableCell>
                                    {columns.map(key => (
                                      <TableCell key={key}>
                                        {formatValue(item, key)}
                                      </TableCell>
                                    ))}
                                    {/* <TableCell>
                          {findData ? findData?.rewards : rewards}
                        </TableCell>
                        <TableCell>
                          {findData ? findData?.transactionId : ''}
                        </TableCell>
                        <TableCell>
                          {findData ? 'Already paid' : 'Unpaid'}
                        </TableCell>
                        <TableCell>
                          <LoadingButton
                            loading={btnLoading}
                            onClick={async () => {
                              if (findData) {
                                window.open(
                                  findData?.transactionLink,
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              } else {
                                if (
                                  parseFloat(Math.abs(rewards)) > parseFloat(0)
                                ) {
                                  handlePayment({
                                    toAccount: deviceData?.phone
                                      ? deviceData?.phone
                                      : '0x9Cc41DA122b93E993Cb113b5E1f8d54A5d42C178',
                                    deviceId: item.deviceId,
                                    startdate: item.startTime,
                                    endDate: item.endTime,
                                    status: 'true',
                                    transactionLink: '1',
                                    transactionId: '1',
                                    meters: Number(
                                      formatDistanceRewards(
                                        item['distance'],
                                        distanceUnit,
                                        t
                                      )
                                    ),
                                    rewards: rewards,
                                    amount: String(
                                      rewards * 1000000000000000000
                                    ),
                                  })
                                } else {
                                  alert('You Trip has not been verified yet')
                                }
                              }
                            }}
                            variant='outlined'
                            color='secondary'
                            className={classes.filterButton}
                            //disabled={disabled}
                          >
                            <Typography variant='button' noWrap>
                              {findData ? 'Track Status' : 'Pay Now'}
                            </Typography>
                          </LoadingButton>
                        </TableCell> */}
                                  </TableRow>
                                )
                              })
                          ) : (
                            <TableShimmer
                              columns={columns.length + 5}
                              startAction
                            />
                          )}
                        </TableBody>
                      </Table>

                      <Snackbar
                        open={!!result}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        onClose={() => setResult(null)}
                        autoHideDuration={snackBarDurationLongMs}
                        message={result}
                        sx={{ width: 300 }}>
                        <Alert
                          elevation={6}
                          onClose={() => setResult(null)}
                          severity='success'
                          variant='filled'
                          sx={{
                            minWidth: 300,
                            padding: '15px 25px',
                            borderRadius: 5,
                          }}>
                          {result}
                        </Alert>
                      </Snackbar>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
        {!features.disableEvents && (
          <EventsDrawer
            open={eventsOpen}
            onClose={() => setEventsOpen(false)}
          />
        )}
        {/* </Grid> */}
      </div>
    </PageLayout>
  )
}
export default DeviceDetails
