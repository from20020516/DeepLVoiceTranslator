import React, { FC, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Card, Text } from 'react-native-elements'
import { Picker } from '@react-native-picker/picker'
import { endpoint } from '@env'
import axios from 'axios'
import moment from 'moment'
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
  { language: "EN", name: "English" },
  { language: "ES", name: "Spanish" },
  { language: "FR", name: "French" },
  { language: "IT", name: "Italian" },
  { language: "JA", name: "Japanese" },
  { language: "NL", name: "Dutch" },
  { language: "PL", name: "Polish" },
  { language: "PT", name: "Portuguese" },
  { language: "RU", name: "Russian" },
  { language: "ZH", name: "Chinese" },
  { language: "KO", name: "Korean" }
]
const initialLanguage = JSON.parse(localStorage.getItem('language') ?? '{"source":{"value":"JA","index":6},"target":{"value":"EN","index":1}}')

const App: FC = () => {
  const { interimTranscript } = useSpeechRecognition({
    commands: [
      {
        command: '*',
        callback: async (command) => {
          if (command.length) {
            const translate = await axios.post<string>(`${endpoint}/translate`, {
              text: command,
              target: language.target.value,
              source: language.source.value
            })
            setTranslation([{
              time: moment().format('HH:mm:ss'),
              timestamp: moment().unix(),
              source: command,
              target: translate.data
            }, ...translation])
          }
        },
        matchInterim: false
      },
    ]
  })
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [translation, setTranslation] = useState<TranslationResult[]>([])

  const startListening = () => SpeechRecognition.startListening({ language: language.source.value.toString(), continuous: true })

  useEffect(() => {
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
        {translation.map((data) => (
          <Translation key={data.timestamp} data={data} />
        ))}
      </Card>
    </View>
  )
}

export default App
