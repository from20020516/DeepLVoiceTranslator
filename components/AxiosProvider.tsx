import React, { createContext, FC, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api_endpoint } from '@env'
import { StoreContext, State } from './StoreProvider'
import Axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import jwt_decode from 'jwt-decode'

interface AxiosRequestConfigExt extends AxiosRequestConfig { _retry: boolean }
interface AxiosErrorExt extends AxiosError { config: AxiosRequestConfigExt }
type AxiosContextState = { loading: boolean }
export const AxiosContext = createContext({} as AxiosContextState)
export const axios = Axios.create({
  baseURL: api_endpoint,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true
})

const isTokenExpired = (exp?: number): boolean | undefined => exp ? Number(new Date()) > exp * 1000 : undefined
const getStore = () => JSON.parse(localStorage.getItem('store') ?? '{}') as State | undefined

const AxiosProvider: FC = ({ children }) => {
  // WARN: DO NOT USE store state because exist cached value.
  const { dispatch } = useContext(StoreContext)
  const useAxios = () => {
    const [connections, setConnections] = useState(0)
    const inc = useCallback(() => setConnections((connections) => connections + 1), [setConnections])
    const dec = useCallback(() => setConnections((connections) => connections - 1), [setConnections])

    const refreshToken = async (tokenExpired: string) => {
      try {
        const token = (await Axios.post<string>('/auth/refresh', null, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${tokenExpired}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }
        })).data
        dispatch({ type: 'SET_LOGIN', user: jwt_decode<User>(token), token })
        return token
      } catch (error) {
        console.error(error)
        dispatch({ type: 'SET_LOGOUT' })
      }
    }

    const interceptors = useMemo(() => ({
      request: (config: AxiosRequestConfig) => {
        inc()
        const token = getStore()?.token
        if (token) config.headers['Authorization'] = `Bearer ${token}`
        return config
      },
      response: (response: AxiosResponse) => {
        dec()
        return response
      },
      error: async (error: AxiosErrorExt) => {
        dec()
        try {
          // TODO: /auth/refresh
          // const original = error.config
          // if (isTokenExpired(state.user?.exp) && error.response?.status === 401 && original.headers.Authorization) {
          //   const token = await refreshToken(state.token!)
          //   original._retry = true
          //   original.headers['Authorization'] = `Bearer ${token}`
          //   console.log('REQUEST.RETRY:', original)
          //   return await axios(original)
          // }
          dispatch({ type: 'SET_LOGOUT' })
        } catch (error) {
          console.error(error)
          dispatch({ type: 'SET_LOGOUT' })
        }
      }
    }), [inc, dec])

    useEffect(() => {
      const reqInterceptor = axios.interceptors.request.use(interceptors.request, interceptors.error)
      const resInterceptor = axios.interceptors.response.use(interceptors.response, interceptors.error)
      return () => {
        axios.interceptors.request.eject(reqInterceptor)
        axios.interceptors.response.eject(resInterceptor)
      }
    }, [interceptors])

    return [connections > 0]
  }
  const [loading] = useAxios()

  return <AxiosContext.Provider value={{ loading: loading }}>{children}</AxiosContext.Provider>
}

export default AxiosProvider
