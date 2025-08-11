import React from 'react'
import { Button, Text, View } from 'react-native'

import {
  ICMP,
  type ICMPResult,
} from 'lwping'

interface State {
  result: ICMPResult | null
}

export default class AppClass extends React.Component<Record<string, never>, State> {
  private icmp: ICMP | null

  constructor(props: Record<string, never>) {
    super(props)
    this.state = { result: null }
    this.icmp = new ICMP({ host: '1.1.1.1', packetSize: 64, timeout: 1000, count: 3 })
  }

  componentWillUnmount(): void {
    this.icmp?.stop()
  }

  onPress = () => {
    this.icmp?.ping(res => {
      // eslint-disable-next-line no-console
      console.log('ping.result--->', res)
      this.setState({
        result: {
          rtt: res.rtt,
          ttl: res.ttl,
          status: res.status,
          isEnded: res.isEnded,
        },
      })
    })
  }

  render(): React.ReactNode {
    const { result } = this.state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Ping" onPress={this.onPress} />
        <Text>Result:</Text>
        <Text>{JSON.stringify(result)}</Text>
      </View>
    )
  }
}


