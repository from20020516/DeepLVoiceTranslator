import React, { FC, useContext } from 'react'
import { StoreContext } from './StoreProvider'
import { Button, Text } from 'react-native-elements'
import { languages } from './App'
import { Picker } from '@react-native-picker/picker'
import { View } from 'react-native'

const LanguageSwitcher: FC = () => {
  const { state, dispatch } = useContext(StoreContext)
  return (
    <View style={{ flexDirection: 'row', padding: 15 }}>
      <View style={{ alignItems: 'center' }}>
        <Text>Source Language:</Text>
        <Picker
          selectedValue={languages[state.language[0]].language}
          style={{ height: 20, width: 150 }}
          onValueChange={(_, index) => dispatch({ type: 'SET_LANGUAGE', language: [index, state.language[1]] })}
        >
          {languages.map((data, index) => <Picker.Item key={index} label={data.name} value={data.language} />)}
        </Picker>
      </View>
      <Button title='⇔' style={{ padding: 3 }} onPress={() => dispatch({ type: 'SET_LANGUAGE', language: state.language.reverse().map((i) => i) })} />
      <View style={{ alignItems: 'center' }}>
        <Text>Target Language:</Text>
        <Picker
          selectedValue={languages[state.language[1]].language}
          style={{ height: 20, width: 150 }}
          onValueChange={(_, index) => dispatch({ type: 'SET_LANGUAGE', language: [state.language[0], index] })}
        >
          {languages.map((data, index) => <Picker.Item key={index} label={data.name} value={data.language} />)}
        </Picker>
      </View>
    </View>
  )
}

export default LanguageSwitcher
