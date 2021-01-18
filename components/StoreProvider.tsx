import React, { createContext, Dispatch, FC, Reducer } from 'react'
import { GestureResponderEvent } from 'react-native'
import { useReducerAsync, AsyncActionHandlers } from 'use-reducer-async'
import { twitter_callback_origin } from '@env'
// import axios from 'axios'
import jwt_decode from "jwt-decode"

type AsyncAction = { type: 'GET_LOGIN', event?: GestureResponderEvent } | { type: 'GET_LOGOUT', event: GestureResponderEvent }
type Action = { type: 'SET_LOGIN', user?: any, token?: string } | { type: 'SET_LOGOUT' } | { type: 'SET_LANGUAGE', language: number[] }

export interface State {
  type: string
  login: boolean
  language: number[]
  user?: User
  token?: string
}
const initialState = { type: 'INITIALIZE', login: false, language: [5, 1] }

export interface StoreContextState {
  state: State
  dispatch: Dispatch<AsyncAction | Action>
}
export const StoreContext = createContext({} as StoreContextState)

const openNewAuthWindow = async (url: string) => {
  const windowCenteringPos = (w: number, h: number) => {
    const y = window.top.outerHeight / 2 + window.top.screenY - h / 2
    const x = window.top.outerWidth / 2 + window.top.screenX - w / 2
    return `resizable=yes,width=${w},height=${h},left=${x},top=${y},toolbar=no,titlebar=no,menubar=no,scrollbars=no`
  }
  const authWindow = (await window.open(url, 'socialLogin', windowCenteringPos(700, 700))) as Window
  return new Promise<string>((resolve, reject) => {
    window.addEventListener('message', (message: MessageEvent<any>) => {
      authWindow.close()
      return typeof message.data === 'string' ? resolve(message.data) : reject(message)
    }, { capture: true, once: true, passive: true })
  })
}

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'SET_LOGIN':
      const SET_LOGIN = { ...state, ...action, login: true }
      localStorage.setItem('store', JSON.stringify(SET_LOGIN))
      return SET_LOGIN
    case 'SET_LOGOUT':
      const SET_LOGOUT = initialState
      localStorage.setItem('store', JSON.stringify(SET_LOGOUT))
      return SET_LOGOUT
    case 'SET_LANGUAGE':
      const SET_LANGUAGE = { ...state, ...action }
      localStorage.setItem('store', JSON.stringify(SET_LANGUAGE))
      return SET_LANGUAGE
    default:
      throw new Error(`UNKNOWN ACTION TYPE: ${JSON.stringify(action)}`)
  }
}

const asyncActionHandlers: AsyncActionHandlers<Reducer<State, Action>, AsyncAction> = {
  GET_LOGIN: ({ dispatch }) => async (action) => {
    action.event?.preventDefault()
    try {
      const token = await openNewAuthWindow(`${twitter_callback_origin}/auth/twitter`)
      const user: User = jwt_decode(token)
      dispatch({ type: 'SET_LOGIN', user, token })
    } catch (error) {
      console.error(error)
    }
  },
  GET_LOGOUT: ({ dispatch }) => async (action) => {
    action.event.preventDefault()
    // TODO: disable server-side jwt
    dispatch({ type: 'SET_LOGOUT' })
  },
}

const StoreProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducerAsync(reducer, { ...initialState, ...JSON.parse(localStorage.getItem('store') ?? '{}') }, asyncActionHandlers)
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export default StoreProvider
