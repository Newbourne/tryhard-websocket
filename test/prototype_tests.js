import tape from 'tape'
import _test from 'tape-promise'
import sinon from 'sinon'
import Rx from 'rxjs/Rx'

import { 
	SocketManager,
  SocketObservable,
  SocketSubject,
  DimplesClientSocket
} from './prototype'

import { WebSocket as MockWebSocket, Server } from 'mock-socket'

// shim WebSocket
global.window = { WebSocket: MockWebSocket }

const test = _test(tape)

test("WebSocket Prototype Tests", (t) => {
	t.test('should test the socket manager open and close observers', (t) => {
    t.plan(2)
		const mockServer = new Server('ws://localhost:8080');
		mockServer.on('connection', server => {
			// simulate latency
			setTimeout(() => {
				mockServer.send('test');
			}, 1000)
		});

		var manager = new SocketManager({ url: "ws://localhost:8080" })

		var openObsSpy = { next: sinon.spy() }
		var closeObsSpy = { next: sinon.spy() }

		manager.OpenObserver = openObsSpy 
		manager.CloseObserver = closeObsSpy

		manager.connect({
			next: (msg) => {
				if (msg === 'test') {
					setTimeout(() => {
						manager.disconnect()
					}, 2000)
				}
			}, 
			error: (err) => {
				t.fail(err)
			},
			complete: () => {
				t.equal(openObsSpy.next.calledOnce, true)
				t.equal(closeObsSpy.next.calledOnce, true)
        setTimeout(() => { t.end() }, 1000)
			}
		})
	})

  t.test('should test the socket manager disposes properly and removes event listeners', (t) => {
    t.plan(1)
    const mockServer = new Server('ws://localhost:8081');
    var manager = new SocketManager({ url: "ws://localhost:8081" })

    var openObsSpy = { next: sinon.spy() }
    var closeObsSpy = { next: sinon.spy() }
    var messageObsSpy = { 
      next: sinon.spy()
    }

    manager.OpenObserver = openObsSpy 
    manager.CloseObserver = closeObsSpy

    manager.connect(messageObsSpy)
    manager.dispose()

    // any better way to check event listener removal?
    t.equal(manager._socket, null)
    t.end()
  })

	t.test('should test the socket manager error observer and dispose socket', (t) => {
    t.plan(2)
    var errObs = sinon.spy()
    var completeObs = sinon.spy()

    var manager = new SocketManager({ url: "ws://localhost:8082" })

		manager.connect({
			next: (msg) => {
				t.fail('no message should be received')
			}, 
			error: (e) => {
        errObs()
      },
			complete: completeObs
    })

    setTimeout(() => {
      t.equal(errObs.calledOnce, true)
      t.equal(completeObs.calledOnce, true)
      t.end()
    }, 1000)
	})

	t.test('should test the socket observable and close accordingly', (t) => {
    t.plan(0)
    const mockServer = new Server('ws://localhost:8083');
    mockServer.on('connection', server => {
      setTimeout(() => {
        mockServer.send('test')
      }, 1000)
    })

		var manager = new SocketManager({ url: "ws://localhost:8083" })
    var observable = new SocketObservable(manager)

    observable.subscribe({
      error: (err) => {
        t.fail('error thrown ' + err)
      },
      complete: () => {
        t.end()
      }
    })

    observable.connect()

    setTimeout(() => {
      manager.disconnect()
    }, 2000)
	})

  t.test('should test socket subject', (t) => {
    t.plan(2)
    const mockServer = new Server('ws://localhost:8084');
    mockServer.on('connection', server => {
      setTimeout(() => {
        mockServer.send('test')
      }, 1000)

      mockServer.on('message', (msg) => {
        t.comment('server received ' + msg)
      })
    })

    var openSpy = { next: sinon.spy() }
    var closeSpy = { next: sinon.spy() }

    var subject = new SocketSubject(
      { url: "ws://localhost:8084" }, 
      openSpy, 
      closeSpy)

    subject.next('client message')

    setTimeout(() => {
      t.equal(openSpy.next.calledOnce, true)
      t.notOk(closeSpy.next.called, true)
      t.end()
    }, 5000)
  })

  t.test('should test DimplesClientSocket', (t) => {
    const mockServer = new Server('ws://localhost:8085');
    mockServer.on('connection', server => {
      setTimeout(() => {
        mockServer.send('test')
      }, 1000)

      mockServer.on('message', (msg) => {
        t.comment('server received ' + msg)
      })
    })

    var client = new DimplesClientSocket({ url: "ws://localhost:8085" })

    client.send('client message')

    setTimeout(() => {
      t.end()
    }, 5000)    
  })
  // buffer tests
  // multicast?
})