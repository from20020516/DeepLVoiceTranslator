import React, { FC, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Button, Card, Text } from 'react-native-elements'
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

const languages: ILanguages[] = [
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
const initialLanguage = JSON.parse(localStorage.getItem('language') ?? '[5,1]')

const App: FC = () => {
  const { interimTranscript } = useSpeechRecognition({
    commands: [
      {
        command: '*',
        callback: async (command) => {
          if (command.length) {
            const translate = await axios.post<string>(`${endpoint}/translate`, {
              text: command,
              source: languages[language[0]].language,
              target: languages[language[1]].language
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
  const [language, setLanguage] = useState<number[]>(initialLanguage)
  const [translation, setTranslation] = useState<ITranslation[]>([])

  const startListening = () => SpeechRecognition.startListening({ language: languages[language[0]].language, continuous: true })

  useEffect(() => {
    return () => SpeechRecognition.abortListening()
  }, [])

  useEffect(() => {
    SpeechRecognition.abortListening()
    localStorage.setItem('language', JSON.stringify(language))
    const timeoutId = setTimeout(() => startListening(), 500)
    return () => clearTimeout(timeoutId)
  }, [language])

  return (
    <View style={styles.container}>
      <Text h1>DeepL Translator</Text>
      <View style={{ flexDirection: 'row', padding: 15 }}>
        <View style={{ alignItems: 'center' }}>
          <Text>Source Language:</Text>
          <Picker
            selectedValue={languages[language[0]].language}
            style={{ height: 20, width: 150 }}
            onValueChange={(value, index) => setLanguage([index, language[1]])}
          >
            {languages.map((data, index) => <Picker.Item key={index} label={data.name} value={data.language} />)}
          </Picker>
        </View>
        <Button title="⇔" style={{ padding: 3 }} onPress={() => setLanguage(language.reverse().map((i) => i))} />
        <View style={{ alignItems: 'center' }}>
          <Text>Target Language:</Text>
          <Picker
            selectedValue={languages[language[1]].language}
            style={{ height: 20, width: 150 }}
            onValueChange={(value, index) => setLanguage([language[0], index])}
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
