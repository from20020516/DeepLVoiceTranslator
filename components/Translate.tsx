import React, { memo, useEffect, useState } from 'react'
import { Badge, Card, Text } from 'react-native-elements'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { api_endpoint } from '@env'
import { View, TextInput } from 'react-native'
import axios from 'axios'

const Translate = memo((props: { data: ITranslation }) => {
  const { source, target, text, time } = props.data
  const [copied, setCopied] = useState<boolean>(false)
  const [sourceText, setSourceText] = useState<string>(text)
  const [targetText, setTargetText] = useState<string>('…')

  const getTranslate = async () =>
    setTargetText((await axios.post<string>(`${api_endpoint}/translate`, { text: sourceText, source, target })).data)

  useEffect(() => {
    getTranslate()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => setCopied(false), 1000)
    return () => clearTimeout(timeoutId)
  }, [copied])

  return (
    <View>
      <View>
        <Text style={{ fontWeight: 'normal', paddingBottom: 2 }}>[ {time} ] {source} ▷ {target}</Text>
        <TextInput value={sourceText} onChangeText={(e) => setSourceText(e)} onSubmitEditing={() => getTranslate()} />
        <CopyToClipboard text={targetText} onCopy={() => {
          setCopied(true)
        }}>
          <View style={copied && { backgroundColor: 'whitesmoke' }}>
            {copied && <Badge
              status='success'
              value=' Copied! '
              containerStyle={{ position: 'absolute', right: 0 }} />}
            <Text style={{ fontStyle: 'italic' }}>{targetText}</Text>
          </View>
        </CopyToClipboard>
      </View>
      <Card.Divider style={{ marginTop: 15 }} />
    </View>
  )
})

export default Translate
