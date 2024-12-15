import { createSlice } from '@reduxjs/toolkit'

const { reducer, actions } = createSlice({
  name: 'session',
  initialState: {
    server: null,
    user: null,
    socket: null,
    openMenu: localStorage.getItem('openMenu')
      ? JSON.parse(localStorage.getItem('openMenu'))
      : false,
  },
  reducers: {
    updateServer(state, action) {
      state.server = action.payload
    },
    updateUser(state, action) {
      state.user = action.payload
    },
    updateSocket(state, action) {
      state.socket = action.payload
    },
    updateMenu(state, action) {
      state.openMenu = action.payload
    },
  },
})

export { actions as sessionActions }
export { reducer as sessionReducer }
