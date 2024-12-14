import { createTheme } from '@mui/material/styles'
import palette from './palette'
import dimensions from './dimensions'
import components from './components'

const theme = createTheme({
  palette,
  dimensions,
  components,
  typography: {
    fontFamily: [
      'Roboto',
      'Segoe UI',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})

export default theme
