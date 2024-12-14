import React, { useState } from 'react'
import {
  AppBar,
  Breadcrumbs,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  ListItemIcon,
} from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import makeStyles from '@mui/styles/makeStyles'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from './LocalizationProvider'
import { sessionActions } from '../../store'

const useStyles = makeStyles(theme => ({
  desktopRoot: {
    height: '100%',
    display: 'flex',
  },
  mobileRoot: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  desktopDrawer: {
    width: theme.dimensions.drawerWidthDesktop,
  },
  desktopDrawerIcons: { width: 70 },
  mobileDrawer: {
    width: theme.dimensions.drawerWidthTablet,
  },
  desktopToolbar: theme.mixins.toolbar,
  mobileToolbar: {
    zIndex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
}))

const PageTitle = ({ breadcrumbs }) => {
  const theme = useTheme()
  const t = useTranslation()

  const desktop = useMediaQuery(theme.breakpoints.up('md'))

  if (desktop) {
    return (
      <Typography variant='h6' noWrap>
        {t(breadcrumbs[0])}
      </Typography>
    )
  }
  return (
    <Breadcrumbs>
      {breadcrumbs.slice(0, -1).map(breadcrumb => (
        <Typography variant='h6' color='inherit' key={breadcrumb}>
          {t(breadcrumb)}
        </Typography>
      ))}
      <Typography variant='h6' color='textPrimary'>
        {t(breadcrumbs[breadcrumbs.length - 1])}
      </Typography>
    </Breadcrumbs>
  )
}

const PageLayout = ({ menu, breadcrumbs = [], children }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [openDrawer, setOpenDrawer] = useState(false)

  const openMenu = useSelector(state => state.session.openMenu)

  const handleOpenMenu = () => dispatch(sessionActions.updateMenu(!openMenu))

  return (
    <>
      <Hidden mdDown>
        <div className={classes.desktopRoot}>
          <Drawer
            variant='permanent'
            className={`${
              openMenu ? classes.desktopDrawer : classes.desktopDrawerIcons
            }`}
            classes={{
              paper: openMenu
                ? classes.desktopDrawer
                : classes.desktopDrawerIcons,
            }}>
            {breadcrumbs.length > 0 && (
              <>
                <div className={classes.toolbar}>
                  <Toolbar>
                    <IconButton
                      color='inherit'
                      edge='start'
                      sx={{ mr: 2 }}
                      onClick={() => navigate('/')}>
                      <ArrowBackIcon />
                    </IconButton>
                    <PageTitle breadcrumbs={breadcrumbs} />
                  </Toolbar>
                </div>
                <Divider />
              </>
            )}

            <ListItemIcon
              sx={{
                color: '#0E1726',
                padding: '8px 16px 8px 16px',
                cursor: 'pointer',
              }}
              onClick={handleOpenMenu}>
              {/* <IconButton
                color='inherit'
                edge='start'
                sx={{ mr: 2 }}
                onClick={handleOpenMenu}>
                </IconButton> */}
              <MenuIcon />
            </ListItemIcon>

            {menu}
          </Drawer>
          <div className={classes.content}>{children}</div>
        </div>
      </Hidden>

      <Hidden mdUp>
        <div className={classes.mobileRoot}>
          <Drawer
            variant='temporary'
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
            classes={{ paper: classes.mobileDrawer }}>
            {menu}
          </Drawer>
          <AppBar
            className={classes.mobileToolbar}
            position='static'
            color='inherit'>
            <Toolbar>
              <IconButton
                color='inherit'
                edge='start'
                sx={{ mr: 2 }}
                onClick={() => setOpenDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <PageTitle breadcrumbs={breadcrumbs} />
            </Toolbar>
          </AppBar>
          <div className={classes.content}>{children}</div>
        </div>
      </Hidden>
    </>
  )
}

export default PageLayout
