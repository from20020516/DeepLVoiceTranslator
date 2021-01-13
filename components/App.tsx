import React, { FC, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Card, Text } from 'react-native-elements'
import { Picker } from '@react-native-picker/picker'
import { auth_key, naver_client_id, naver_client_secret } from '@env'
import axios from 'axios'
import moment from 'moment'
import querystring from 'querystring'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import Translation from './Translation'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const languages: Languages[] = [
  { language: "DE", name: "German" },
  { language: "EN-GB", name: "English (British)" },
  { language: "EN-US", name: "English (American)" },
  { language: "ES", name: "Spanish" },
  { language: "FR", name: "French" },
  { language: "IT", name: "Italian" },
  { language: "JA", name: "Japanese" },
  { language: "NL", name: "Dutch" },
  { language: "PL", name: "Polish" },
  { language: "PT-PT", name: "Portuguese (European)" },
  { language: "PT-BR", name: "Portuguese (Brazilian)" },
  { language: "RU", name: "Russian" },
  { language: "ZH", name: "Chinese" },
  { language: "KO", name: "Korean" }
]
const initialLanguage = JSON.parse(localStorage.getItem('language') ?? '{"source":{"value":"JA","index":6},"target":{"value":"EN-US","index":2}}')

const App: FC = () => {
  const { interimTranscript } = useSpeechRecognition({
    commands: [
      {
        command: '*',
        callback: async (command) => {
          if (command.length) {
            try {
              if (language.source.value === 'KO' || language.target.value === 'KO') {
                const koTranslate = await axios.post<KoTranslationResult>('https://openapi.naver.com/v1/papago/n2mt', querystring.stringify({
                  source: String(language.source.value).toLowerCase(),
                  target: String(language.target.value).toLowerCase(),
                  text: command
                }), {
                  headers: {
                    'X-Naver-Client-Id': naver_client_id,
                    'X-Naver-Client-Secret': naver_client_secret
                  }
                })
                setTranslation([{
                  time: moment().format('HH:mm:ss'),
                  timestamp: moment().unix(),
                  source: command,
                  target: koTranslate.data.message.result.translatedText
                }, ...translation])
              } else {
                const translate = await axios.post<Translation>('https://api.deepl.com/v2/translate', querystring.stringify({
                  auth_key,
                  text: command,
                  target_lang: language.target.value,
                }))
                setTranslation([{
                  time: moment().format('HH:mm:ss'),
                  timestamp: moment().unix(),
                  source: command,
                  target: translate.data.translations[0].text
                }, ...translation])
                getApiUsage()
              }
            } catch (error) {
              console.error(error)
            }
          }
        },
        matchInterim: false
      },
    ]
  })
  const [apiUsage, setApiUsage] = useState<ApiUsage>({ character_count: 0, character_limit: 0 })
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [translation, setTranslation] = useState<TranslationResult[]>([])

  const getApiUsage = async () => setApiUsage((await axios.post<ApiUsage>('https://api.deepl.com/v2/usage', querystring.stringify({ auth_key }))).data)
  const startListening = () => SpeechRecognition.startListening({ language: language.source.value.toString(), continuous: true })

  useEffect(() => {
    getApiUsage()
    return () => SpeechRecognition.abortListening()
  }, [])

  useEffect(() => {
    SpeechRecognition.abortListening()
    localStorage.setItem('language', JSON.stringify(language))
    const timeoutId = setTimeout(() => startListening(), 500)
    return () => clearTimeout(timeoutId)
  }, [language])

  const languageHandler = ({ source, target }: Partial<Language>) => source && setLanguage({ ...language, source }) || target && setLanguage({ ...language, target })

  return (
    <View style={styles.container}>
      <Text h1>DeepL Translator</Text>
      <View style={{ flexDirection: 'row', padding: 15 }}>
        <View style={{ alignItems: 'center' }}>
          <Text>Source Language:</Text>
          <Picker
            selectedValue={language.source.value}
            style={{ height: 20, width: 150 }}
            onValueChange={(value, index) => languageHandler({ source: { value, index } })}
          >
            {languages.map((data, index) => <Picker.Item key={index} label={data.name} value={data.language} />)}
          </Picker>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text>Target Language:</Text>
          <Picker
            selectedValue={language.target.value}
            style={{ height: 20, width: 150 }}
            onValueChange={(value, index) => languageHandler({ target: { value, index } })}
          >
            {languages.map((data, index) => <Picker.Item key={index} label={data.name} value={data.language} />)}
          </Picker>
        </View>
      </View>
      <Card containerStyle={{ width: '80%' }}>
        <Card.Title style={{ height: 20 }}>{interimTranscript || <ActivityIndicator />}</Card.Title>
        <Card.FeaturedSubtitle style={{ textAlign: 'right', color: 'darkgrey' }}>
          {apiUsage?.character_count} / {apiUsage?.character_limit} ({(apiUsage?.character_count / apiUsage?.character_limit).toLocaleString('en-US', { style: 'percent' })})
        </Card.FeaturedSubtitle>
        {translation.map((data) => (
          <Translation key={data.timestamp} data={data} />
        ))}
      </Card>
    </View>
  )
}

export default App
