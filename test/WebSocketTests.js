import tape from 'tape'
import _test from 'tape-promise'
import sinon from 'sinon'

import { TryHardWebSocket } from './../src'
import { WebSocket, Server } from 'mock-socket'

const test = _test(tape)

// shim WebSocket
global.window = { WebSocket: WebSocket }

test('websocket tests', (t) => {
  const mockServer = new Server('ws://localhost:1000')
  mockServer.on('connection', server => {
    mockServer.send('connected')
  })

  mockServer.on('message', (m) => {
    // mockServer.close()
  })

  t.test('should connect and trigger open observer once', (t) => {
    t.plan(4)
    var openObs = sinon.spy()
    var openObsCompleted = sinon.spy()
    var errObs = sinon.spy()
    var completeObs = sinon.spy()

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

    setTimeout(() => {
      t.equal(openObs.calledOnce, true)
      t.equal(openObsCompleted.calledOnce, true)
      t.equal(errObs.notCalled, true)
      t.equal(completeObs.notCalled, true)
      t.end()
    }, 500)
  })

  t.test('should connect, then disconnect and trigger close observer', (t) => {
    t.plan(3)
    var msgObs = sinon.spy()
    var errObs = sinon.spy()
    var completeObs = sinon.spy()

    var socket = new TryHardWebSocket('ws://localhost:1000')
    socket.connect()
    socket.subscribe(
      (x) => { msgObs(x) },
      (e) => { errObs() },
      () => { completeObs() }
    )

    setTimeout(() => {
      socket.close()
    }, 200)

    setTimeout(() => {
      t.equal(msgObs.calledOnce, true)
      t.equal(errObs.notCalled, true)
      t.equal(completeObs.calledOnce, true)
      t.end()
    }, 500)
  })

  t.test('should handle connection error using main observer', (t) => {
    t.plan(6)
    var msgObs = sinon.spy()
    var errObs = sinon.spy()
    var completeObs = sinon.spy()
    var closeObsNext = sinon.spy()
    var closeObsErr = sinon.spy()
    var closeObsCompleted = sinon.spy()

    var socket = new TryHardWebSocket({
      url: 'ws://localhost:99999',
      closeObs: {
        next: x => closeObsNext(),
        error: x => closeObsErr(x),
        complete: () => closeObsCompleted()
      }
    })

    socket.connect()

    socket.subscribe(
      (x) => { msgObs(x) },
      (e) => { errObs() },
      () => { completeObs() }
    )

    setTimeout(() => {
      t.equal(msgObs.notCalled, true)
      t.equal(errObs.calledOnce, true)
        // complete not called on error
      t.equal(completeObs.notCalled, true)
      t.equal(closeObsNext.notCalled, true)
      t.equal(closeObsErr.notCalled, true)
        // closed obs complete regardless of main obs result
      t.equal(closeObsCompleted.calledOnce, true)
      t.end()
    }, 100)
  })

  t.test('should connect receive one message', (t) => {
    t.plan(3)
    var msgObs = sinon.spy()
    var errObs = sinon.spy()
    var completeObs = sinon.spy()

    var socket = new TryHardWebSocket('ws://localhost:1000')
    socket.connect()
    socket.subscribe(
      (x) => { msgObs(x) },
      (e) => { errObs() },
      () => { completeObs() }
    )

    setTimeout(() => {
      t.equal(msgObs.calledOnce, true)
      t.equal(errObs.notCalled, true)
      t.equal(completeObs.notCalled, true)
      t.end()
    }, 500)
  })

  t.test('should connect send one message', (t) => {
    t.plan(3)
    var msgObs = sinon.spy()
    var errObs = sinon.spy()
    var completeObs = sinon.spy()

    var socket = new TryHardWebSocket('ws://localhost:1000')

    socket.connect()

    socket.subscribe(
      (x) => { msgObs(x) },
      (e) => { errObs() },
      () => { completeObs() }
    )

    socket.send('some message')

    setTimeout(() => {
      t.equal(msgObs.calledOnce, true)
      t.equal(errObs.notCalled, true)
      t.equal(completeObs.notCalled, true)
      t.end()
    }, 500)
  })

  t.test('should connect send one json message', (t) => {
    t.plan(3)
    var msgObs = sinon.spy()
    var errObs = sinon.spy()
    var completeObs = sinon.spy()

    var socket = new TryHardWebSocket('ws://localhost:1000')

    socket.connect()

    socket.subscribe(
      (x) => { msgObs(x) },
      (e) => { errObs() },
      () => { completeObs() }
    )

    socket.send({ msg: 'some message' })

    setTimeout(() => {
      t.equal(msgObs.calledOnce, true)
      t.equal(errObs.notCalled, true)
      t.equal(completeObs.notCalled, true)
      t.end()
    }, 500)
  })
})
