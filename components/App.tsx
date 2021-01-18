import React, { FC } from 'react'
import { Avatar, Button, Card, Header, SocialIcon, Text } from 'react-native-elements'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { StyleSheet, View } from 'react-native'
import StoreProvider, { StoreContext } from './StoreProvider'
import AxiosProvider from './AxiosProvider'
import LanguageSwitcher from './LanguageSwitcher'
import TranslateContainer from './TranslateContainer'

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: any
  }
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export const languages: ILanguages[] = [
  { language: "DE", name: "German", flag: "🇩🇪" },
  { language: "EN", name: "English", flag: "🇺🇸" },
  { language: "ES", name: "Spanish", flag: "🇪🇸" },
  { language: "FR", name: "French", flag: "🇫🇷" },
  { language: "IT", name: "Italian", flag: "🇮🇹" },
  { language: "JA", name: "Japanese", flag: "🇯🇵" },
  { language: "NL", name: "Dutch", flag: "🇳🇱" },
  { language: "PL", name: "Polish", flag: "🇵🇱" },
  { language: "PT", name: "Portuguese", flag: "🇵🇹" },
  { language: "RU", name: "Russian", flag: "🇷🇺" },
  { language: "ZH", name: "Chinese", flag: "🇨🇳" },
  { language: "KO", name: "Korean", flag: "🇰🇷" }
]

const App: FC = () =>
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <StoreProvider>
      <StoreContext.Consumer>
        {({ state, dispatch }) => (
          <AxiosProvider>
            <>
              <Header
                style={styles.container}
                backgroundColor='rgba(27,30,37,0.9)'
                leftComponent={state.login
                  ? <Button title='Sign out' type='outline' buttonStyle={{ paddingVertical: 2, paddingHorizontal: 10 }} onPress={(event) => dispatch({ type: 'GET_LOGOUT', event })} >Sign out</Button>
                  : <></>
                }
                rightComponent={state.login
                  ? <Avatar size='small' rounded source={{ uri: state.user?.photo }} />
                  : <Button title='Sign in' type='outline' buttonStyle={{ paddingVertical: 2, paddingHorizontal: 10 }} onPress={(event) => dispatch({ type: 'GET_LOGIN', event })} >SignIn</Button>
                }
              />
              <View style={styles.container}>
                <Text h1>DeepL Translator</Text>
                {state.login ?
                  <>
                    <LanguageSwitcher />
                    <TranslateContainer />
                  </> : <>
                    <SocialIcon button type='twitter' style={{ width: 300, height: 40, margin: 10 }} onPress={() => dispatch({ type: 'GET_LOGIN' })} title='Signin with Twitter' />
                  </>
                }
                {window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
                  <Card containerStyle={{ width: '80%' }}>
                    <Card.Title>DEBUG: store</Card.Title>
                    <Text>{JSON.stringify(state, null, 2)}</Text>
                  </Card>
                }
              </View>
            </>
          </AxiosProvider>
        )}
      </StoreContext.Consumer>
    </StoreProvider>
  </SafeAreaProvider>

export default App
