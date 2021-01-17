import React, { FC, useContext, useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { StoreContext } from './StoreProvider'
import { Card } from 'react-native-elements'
import { languages } from './App'
import moment from 'moment'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import Translate from './Translate'

const TranslateContainer: FC = () => {
  const { state } = useContext(StoreContext)
  const { interimTranscript } = useSpeechRecognition({
    commands: [
      {
        command: '*',
        callback: async (command) => {
          if (command.length) {
            setTranslation([{
              time: moment().format('HH:mm:ss'),
              timestamp: moment().unix(),
              text: command,
              source: languages[state.language[0]].language,
              target: languages[state.language[1]].language
            }, ...translation])
          }
        },
        matchInterim: false
      },
    ]
  })
  const [translation, setTranslation] = useState<ITranslation[]>([])
  const startListening = () => SpeechRecognition.startListening({ language: languages[state.language[0]].language, continuous: true })

  useEffect(() => {
    return () => SpeechRecognition.abortListening()
  }, [])

  useEffect(() => {
    SpeechRecognition.abortListening()
    const timeoutId = setTimeout(() => startListening(), 500)
    return () => clearTimeout(timeoutId)
  }, [state.language])

  return (
    <Card containerStyle={{ width: '80%' }}>
      <Card.Title style={{ height: 20 }}>{interimTranscript || <ActivityIndicator />}</Card.Title>
      {translation.map((data) => <Translate key={data.timestamp} data={data} />)}
    </Card>
  )
}

export default TranslateContainer
