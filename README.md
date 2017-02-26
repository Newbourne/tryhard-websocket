# tryhard-websocket
TryHard WebSocket Rx

### ToDo
- Support close event codes
- Add support to suspend subscriptions until socket connected.
 - This will allow subscriptions before connect is executed.
- Support auto-reconnect
- Support multi-casting
- Support multiple endpoints

```
import TryHardWebSocket from './../src'

var socket = new TryHardWebSocket({
 url: 'ws://localhost:1000',
 openObs: {
  next: x => openObs(),
  complete: () => openObsCompleted()
 }
})

socket.connect()

socket.subscribe(
 (x) => { /* noop */ },
 (e) => { errObs() },
 () => { completeObs() }
)
```
