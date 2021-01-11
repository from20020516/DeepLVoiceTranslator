import React, { FC, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const App: FC = () => {
  const { transcript, resetTranscript } = useSpeechRecognition()
  const [texts, setTexts] = useState<string[]>([])

  useEffect(() => {
    SpeechRecognition.startListening({ language: 'ja-JP', continuous: true })
    return () => SpeechRecognition.stopListening()
  })

  useEffect(() => {
    setTexts(transcript.split(' '))
  },[transcript])

  return (
    SpeechRecognition.browserSupportsSpeechRecognition() ? (<View>
      <button onClick={() => resetTranscript()}>Reset</button>
      {
        texts.map((str, index) => (
          <Text key={index}>{index}: {str}</Text>
        ))
      }
    </View>) : (<View>browser doesn't support Web Speech API.</View>)
  )
}

export default App
