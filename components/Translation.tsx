import React, { memo, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Badge, Card, Text } from 'react-native-elements'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const Translation = memo((props: { data: ITranslation }) => {
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => setCopied(false), 3000)
    return () => clearTimeout(timeoutId)
  }, [copied])

  return (
    <View>
      <View style={copied && { backgroundColor: 'whitesmoke' }}>
        <CopyToClipboard text={props.data.target} onCopy={() => {
          setCopied(true)
        }}>
          <View>
            {copied && <Badge
              status='success'
              value=' Copied! '
              containerStyle={{ position: 'absolute', right: 0 }} />}
            <Text style={{ fontWeight: 'bold', paddingBottom: 2 }}>[ {props.data.time} ]</Text>
            <Text>{props.data.source}</Text>
            <Text style={{ fontStyle: 'italic' }}>{props.data.target}</Text>
          </View>
        </CopyToClipboard>
      </View>
      <Card.Divider style={{ marginTop: 15 }} />
    </View>
  )
})

export default Translation
