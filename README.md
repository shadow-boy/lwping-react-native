### lwping

Ping module for React Native. Currently supported platform: iOS.

### Installation

```sh
yarn add lwping
# or
npm i lwping
```

For iOS:

```sh
cd ios && pod install
```

### API

- `class ICMP`
  - constructor(data)
    - **host**: string
    - **count**: number (default 0 = infinite until stopped by implementation; example demos use 3)
    - **packetSize**: number (default 56)
    - **timeout**: number in ms (default 1000)
    - **ttl**: number (default 54)
    - **interval**: number in ms between pings (default 1000)
  - `ping((result: ICMPResult) => void)`
  - `stop()`
  - `isRunning(): boolean`

- `ICMPResult`
  - **rtt**: number
  - **ttl**: number
  - **status**: number (see `PingStatus` export)
  - **isEnded**: boolean

### Quick usage examples

Functional component (see `example/src/App.tsx`):

```tsx
import { useRef, useEffect, useState } from 'react'
import { Button, Text, View } from 'react-native'
import { ICMP, type ICMPResult } from 'lwping'

export default function App() {
  const icmp = useRef<ICMP | null>(new ICMP({ host: '1.1.1.1', packetSize: 64, timeout: 1000, count: 3 }))
  const [result, setResult] = useState<ICMPResult | null>(null)

  useEffect(() => () => icmp.current?.stop(), [])

  return (
    <View>
      <Button title="Ping" onPress={() => icmp.current?.ping(res => setResult(res))} />
      <Text>{JSON.stringify(result)}</Text>
    </View>
  )
}
```

Class component (see `example/src/AppClass.tsx`):

```tsx
import React from 'react'
import { Button, Text, View } from 'react-native'
import { ICMP, type ICMPResult } from 'lwping'

export default class AppClass extends React.Component<{}, { result: ICMPResult | null }> {
  private icmp = new ICMP({ host: '1.1.1.1', packetSize: 64, timeout: 1000, count: 3 })
  state = { result: null }
  componentWillUnmount() { this.icmp.stop() }
  render() {
    return (
      <View>
        <Button title="Ping" onPress={() => this.icmp.ping(res => this.setState({ result: res }))} />
        <Text>{JSON.stringify(this.state.result)}</Text>
      </View>
    )
  }
}
```

Host list demo with limited concurrency (see `example/src/AppHostList.tsx`):

```tsx
// Starts multiple ICMP instances concurrently (default 8 at a time) and displays progress
```

To run the demos in the example app, change the entry in `example/index.js`:

```js
import {AppRegistry} from 'react-native'
import App from './src/AppHostList' // or './src/App' or './src/AppClass'
import {name as appName} from './app.json'
AppRegistry.registerComponent(appName, () => App)
```

### Example app

From `example/`:

```sh
yarn
cd ios && pod install && cd ..
yarn ios
```

If you see no progress after tapping Start in the host list demo, make sure the iOS app is rebuilt so that native changes are applied (clean build folder/DerivedData, then rebuild).

### Contributing

- See [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

### License

MIT

