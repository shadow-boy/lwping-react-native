import React from 'react'
import { Button, ScrollView, Text, View } from 'react-native'

import {
  ICMP,
  type ICMPResult,
} from 'lwping'

const hostList: string[] = [
  "95.179.230.211",
  "45.32.78.62",
  "95.179.166.91",
  "149.28.49.39",
  "78.141.234.137",
  "217.69.9.129",
  "207.148.78.149",
  "95.179.210.148",
  "216.128.131.65",
  "95.179.138.218",
  "45.77.152.123",
  "149.28.77.119",
  "45.32.230.6",
  "144.202.22.127",
  "149.28.134.97",
  "45.32.47.44",
  "108.61.166.188",
  "207.246.64.166",
  "80.240.29.4",
  "136.244.92.168",
  "149.28.254.44",
  "78.141.222.58",
  "207.148.126.182",
  "140.82.24.140",
  "108.61.217.149",
  "217.69.3.32",
  "136.244.95.54",
  "45.77.226.32",
  "92.223.30.55",
  "92.38.149.76",
  "205.185.119.188",
  "45.65.9.20",
  "45.79.22.46",
  "45.56.73.9",
  "139.144.21.181",
  "139.144.21.11",
  "143.42.120.169",
  "143.42.120.205",
  "67.205.146.238",
  "167.71.182.205",
  "143.110.192.42",
  "164.92.96.64",
  "109.166.37.94",
  "5.180.77.104",
  "172.105.224.94",
  "172.105.224.126",
  "172.233.93.114",
  "139.144.120.76",
  "45.118.134.147",
  "45.118.134.74",
  "45.118.134.64",
  "192.53.174.30",
  "146.190.94.149",
  "139.144.151.161",
  "139.144.151.162",
  "213.168.250.17",
  "176.58.120.251",
  "178.79.176.31",
  "5.8.33.52",
  "46.101.8.153",
  "172.104.144.9",
  "192.46.235.237",
  "139.162.152.119",
  "134.122.74.139",
  "172.233.255.222",
  "172.232.54.177",
  "172.232.63.136",
  "172.105.22.247",
  "172.105.6.131",
  "172.105.22.74",
  "172.105.103.11",
  "138.197.130.14",
  "172.105.254.79",
  "172.105.191.245",
  "170.64.182.118",
  "172.233.32.96",
  "134.209.81.80",
  "170.187.235.61",
  "170.187.235.137",
  "170.187.235.31",
  "192.46.214.249",
  "45.79.127.155",
  "159.65.156.153",
  "45.136.244.46",
  "45.140.169.198",
  "5.188.6.46",
  "95.85.72.219",
  "95.85.72.215",
  "95.85.72.218",
  "95.174.68.172",
  "95.174.68.220",
  "172.232.194.240",
  "172.232.194.241",
  "172.232.194.238",
  "172.232.146.8",
  "172.232.146.9",
  "172.232.147.142",
  "172.233.24.246",
  "172.233.24.241",
  "172.233.24.240",
  "172.233.24.238",
]

type ResultMap = Record<string, ICMPResult>

export default class AppHostList extends React.Component<Record<string, never>, {
  isRunning: boolean,
  results: ResultMap,
}> {
  private instances: Record<string, ICMP>
  private pendingQueue: string[]
  private readonly maxConcurrent = 8

  constructor(props: Record<string, never>) {
    super(props)
    this.state = {
      isRunning: false,
      results: {},
    }
    this.instances = {}
    this.pendingQueue = []
  }

  componentWillUnmount(): void {
    this.stopAll()
  }

  start = () => {
    if (this.state.isRunning) return
    // 清空历史与实例
    this.stopAll()
    this.instances = {}
    this.pendingQueue = [...hostList]
    this.setState({ isRunning: true, results: {} }, () => {
      this.fillSlots()
    })
  }

  stop = () => {
    this.stopAll()
    this.setState({ isRunning: false })
  }

  private fillSlots = () => {
    const { isRunning } = this.state
    if (!isRunning) return

    while (Object.keys(this.instances).length < this.maxConcurrent && this.pendingQueue.length > 0) {
      const host = this.pendingQueue.shift() as string
      if (!host) break
      this.startHost(host)
    }

    // 若没有活跃实例且队列为空，则结束
    if (Object.keys(this.instances).length === 0 && this.pendingQueue.length === 0) {
      this.setState({ isRunning: false })
    }
  }

  private startHost = (host: string) => {
    const existed = this.instances[host]
    if (existed && existed.isRunning()) return

    const icmp = new ICMP({ host, packetSize: 64, timeout: 1000, count: 3 })
    this.instances[host] = icmp
    icmp.ping((res) => {
      // eslint-disable-next-line no-console
      console.log(`[${host}] ping.result`, res)
      this.setState(prev => ({
        results: {
          ...prev.results,
          [host]: res,
        },
      }))

      if (res.isEnded) {
        icmp.stop()
        delete this.instances[host]
        // 补位
        this.fillSlots()
      }
    })
  }

  private stopAll = () => {
    Object.values(this.instances).forEach(i => i?.stop())
    this.instances = {}
    this.pendingQueue = []
  }

  render(): React.ReactNode {
    const { isRunning, results } = this.state
    const completed = hostList.reduce((acc, h) => acc + (results[h]?.isEnded ? 1 : 0), 0)
    const active = Object.keys(this.instances).length
    return (
      <View style={{ flex: 1, paddingTop: 60 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
          <Button title={isRunning ? 'Running...' : 'Start'} onPress={this.start} disabled={isRunning} />
          <Button title="Stop" onPress={this.stop} disabled={!isRunning} />
        </View>
        <Text style={{ textAlign: 'center', marginTop: 8 }}>
          {isRunning ? `Pinging... ${completed}/${hostList.length} (active ${active}/${this.maxConcurrent})` : 'Idle'}
        </Text>

        <ScrollView style={{ flex: 1, marginTop: 12 }} contentContainerStyle={{ padding: 12 }}>
          {hostList.map((host) => {
            const r = results[host]
            return (
              <View key={host} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
                <Text style={{ fontWeight: '600' }}>{host}</Text>
                <Text selectable>
                  {r ? `status=${r.status}, rtt=${r.rtt}, ttl=${r.ttl}, ended=${r.isEnded}` : 'pending'}
                </Text>
              </View>
            )
          })}
        </ScrollView>
      </View>
    )
  }
}


