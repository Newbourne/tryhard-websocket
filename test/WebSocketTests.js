// import tape from 'tape'
// import _test from 'tape-promise'
// import sinon from 'sinon'

// import { DimplesWebSocket } from './../src'
// import { WebSocket, Server } from 'mock-socket'

// const test = _test(tape)

// // shim WebSocket
// global.window = { WebSocket: WebSocket }

// test("websocket tests", (t) => {
//   t.test("should connect receive two message and send quit", (t) => {
//     const mockServer = new Server('ws://localhost:8080');
//     mockServer.on('connection', server => {
//       mockServer.send('test message 1');
//       mockServer.send('test message 2');
//     });

//     mockServer.on('message', (m) => {
//       mockServer.close()
//     })

//     var socket = new DimplesWebSocket("ws://localhost:8080")

//     socket.subscribe(
//       (x) => {
//         t.comment('next from app ' + x)
//       },
//       (e) => {
//         t.comment('error from app', e)
//         t.fail('test should connect')
//       },
//       () => {
//         t.end()
//       }
//     )

//     // send message to server to quit
//     socket.send('quit')
//   })

//   t.test("should connect receive one message, drop and reconnect, receive another message and send quit", (t) => {
//     var messageCounter = 1;

//     const mockServer = new Server('ws://localhost:8081');
//     mockServer.on('connection', server => {
//       setInterval((ctx) => {
//         mockServer.send('message ' + messageCounter);
//         messageCounter = messageCounter+1
//       }, 1000, mockServer)
//     });

//     mockServer.on('message', (m) => {
//       t.comment('server received ' + m)
//       if (m === 'quit'){
//         mockServer.close()
//       }
//     })

//     var socket = new DimplesWebSocket("ws://localhost:8081")

//     socket.subscribe(
//       (x) => {
//         t.comment('next from app ' + x)
//         if (x == 'message 1') {
//           socket.close()
//         }
//         if (x == 'message 2') {
//           // send message to server to quit
//           socket.send('quit')          
//         }
//       },
//       (e) => {
//         t.comment('error from app', e)
//         t.fail('test should connect')
//       },
//       () => {
//         t.comment('complete from app')
//         t.end()
//       }
//     )
//     socket.send('')
//   })    
// })
