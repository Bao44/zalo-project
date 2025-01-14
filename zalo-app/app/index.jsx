import { View, Text, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const index = () => {
  const router = useRouter();
  return (
    <View>
      <Text>index</Text>
      <Button title='welcome' onPress={() => router.push('welcome')}/>
      <Text>hello</Text>
    </View>
  )
}

export default index