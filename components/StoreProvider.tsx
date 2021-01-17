import React, { createContext, Dispatch, FC, Reducer } from 'react'
import { GestureResponderEvent } from 'react-native'
import { useReducerAsync, AsyncActionHandlers } from 'use-reducer-async'
import { twitter_callback_origin } from '@env'
// import axios from 'axios'

type AsyncAction = { type: 'GET_LOGIN', event?: GestureResponderEvent } | { type: 'GET_LOGOUT', event: GestureResponderEvent }
type Action = { type: 'SET_LOGIN', user?: any } | { type: 'SET_LOGOUT' } | { type: 'SET_LANGUAGE', language: number[] }

interface State {
  type: string
  login: boolean
  language: number[]
  user?: ITwitterUser
}
const initialState = {
  ...{ type: 'INITIALIZE', login: false, language: [5, 1] },
  ...JSON.parse(localStorage.getItem('store') ?? '{}'),
}

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
  const authWindow = (await window.open(url, 'socialLogin', windowCenteringPos(600, 500))) as Window
  const authResult = await new Promise<any>((resolve, reject) => {
    const listener = (message: MessageEvent) => {
      // WARN: unsafe commented out.
      // if (!message.origin.includes(`//${window.location.hostname}`)) reject('Origin Not Allowed.')
      if (!String(message.data?.source).startsWith('react-devtools')) {
        console.log('message:', message)
        resolve({ user: message.data })
        authWindow.close()
      }
    }
    const timer = setInterval(() => {
      if (authWindow.closed) {
        window.removeEventListener('message', listener)
        clearInterval(timer)
        reject('連携に失敗しました。')
      }
    }, 3000)
    window.addEventListener('message', listener, false)
  })
  return authResult
}

const reducer: Reducer<State, Action> = (state, action) => {
  console.log(action.type, action, state)
  switch (action.type) {
    case 'SET_LOGIN':
      const SET_LOGIN = { ...state, ...action, login: true, user: action.user }
      localStorage.setItem('store', JSON.stringify(SET_LOGIN))
      return SET_LOGIN
    case 'SET_LOGOUT':
      localStorage.removeItem('store')
      return { ...initialState, login: false }
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
      const callback = await openNewAuthWindow(`${twitter_callback_origin}/auth/twitter`)
      dispatch({ type: 'SET_LOGIN', user: callback.user })
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
  const [state, dispatch] = useReducerAsync(reducer, initialState, asyncActionHandlers)
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export default StoreProvider
