# tryhard-websocket
TryHard WebSocket Rx

### ToDo
- Support close event codes
- Add support to suspend subscriptions until socket connected.
<<<<<<< HEAD
  - This will allow subscriptions before connect is executed.
=======
 - This will allow subscriptions before connect is executed.
>>>>>>> d5af893f82893a00b9e4c3107a1186d0bc2bb66b
- Support auto-reconnect
- Support multi-casting
- Support multiple endpoints

```
import TryHardWebSocket from './../src'

var socket = new TryHardWebSocket({
 url: 'ws://localhost:1000',
 openObs: {
  next: x => { /* connection opened */ }
  // error: [ NOT SUPPORTED ]
  // complete: [ NOT SUPPORTED ]
 },
 closedObs: {
  next: x => { /* connection closed (cleanly) */ },
  error: x => { /* connection closed (critical) */ }
  // complete: [ NOT SUPPORTED ]
 }
})

socket.connect()

socket.subscribe(
 (x) => { /* message */ },
 (e) => { /* error */ },
 () => { /* done */ }
)

socket.send('HELP ME')
socket.sendJson({ data: 'Welp' })

```
