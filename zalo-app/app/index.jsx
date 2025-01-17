import { View, Text, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import Welcome from './welcome';

const index = () => {
  const router = useRouter();
  return (
    <Welcome />
  )
}

export default index