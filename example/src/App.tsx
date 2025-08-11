import { useRef, useState, useEffect } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

import {
  ICMP,
  type ICMPResult,
} from 'lwping'

export default function App(): React.JSX.Element {
  const
    icmp =
      useRef<ICMP | null>(
        new ICMP({ host: '1.1.1.1', packetSize: 64, timeout: 1000, count: 3 })
      ),

    [result, setResult] =
      useState<ICMPResult | null>(null)

  useEffect(() => {
    const icmpRef = icmp.current
    return () => {
      icmpRef?.stop()
    }
  }, [])

  const onPress = async () => {
    icmp.current?.ping(res => {
      console.log("ping.result--->", res);

      setResult({
        rtt: res.rtt,
        ttl: res.ttl,
        status: res.status,
        isEnded: res.isEnded,
      })
    })
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Ping"
        onPress={onPress}
      />
      <Text>Result:</Text>
      <Text>{JSON.stringify(result)}</Text>
    </View>
  )
}