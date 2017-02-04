import Rx from 'rxjs'
import tape from 'tape'
import _test from 'tape-promise'
import sinon from 'sinon'

const test = _test(tape)

/*
	config = {
		url: 			string,
		protocol: string,
	}
*/
export class SocketManager {
	constructor(config) {
    // todo - make private
    this._config = config
		this._socket = null
		this._openObs = null
		this._messageObs = null
		this._closeObs = null
    this._isOpen = false
    this._buffer = []
	}
  get Socket() {
    return this._socket
  }
  get OpenObserver() {
    return this._openObs
  }
  set OpenObserver(openObs){
    this._openObs = openObs
  }
  get CloseObserver() {
    return this._closeObs
  }
  set CloseObserver(closeObs){
    this._closeObs = closeObs
  }
  connect(middleObs) {
    this.dispose()
    this._socket = this._config.protocol ? new window.WebSocket(this._config.url, this._config.protocol) : new window.WebSocket(this._config.url)

    var openHandler = (manager) => {
      return function openHandler(e) {
        console.log('open handler called (in manager)')
    	  if (manager._openObs) {
      		manager._openObs.next(e)
      	}
        manager._isOpen = true
      }
    }

    var closeHandler = (manager, obs) => {
      return function closeHandler(e) {
        console.log('close handler called (in manager)')
        manager._isOpen = false
        if (manager._closeObs) {
          manager._closeObs.next(e)
        }
        if (obs.complete) {
          obs.complete()
        }
        manager.dispose()
      }
    }

    var messageHandler = (obs) => {
      return function msgHandler(e) {
        console.log('received message from socket (in manager)', e.data)
        if (obs){
          if (e.data){
            obs.next(e.data)
          } else {
            obs.next(e) 
          }
        }
      } 
    }

    var errorHandler = (obs) => {
      return function errHandler(e) {
        console.log('error handler called (in manager)')
        console.log('error obs', obs.isStopped, obs.error)
        obs.error(e)
      } 
    }

    this._openHandler = openHandler(this)
    this._errorHandler = errorHandler(middleObs)
    this._closeHandler = closeHandler(this, middleObs)
    this._messageHandler = messageHandler(middleObs)

    this._socket.addEventListener('open', this._openHandler,  false)
    this._socket.addEventListener('close', this._closeHandler, false)
    this._socket.addEventListener('message', this._messageHandler, false)
    this._socket.addEventListener('error', this._errorHandler, false)  		
  }
  disconnect() {
  	if (this._socket){
  		this._socket.close()
  	}
  }
  send(message) {
    if (this._socket){
      this._socket.send(message)
    } else {
      this._buffer.push(message)
    }
  }
	dispose() {
    if (this._socket) {
      console.log('socket disposed')
    	this._socket.removeEventListener('open', this._openHandler, false)
    	this._socket.removeEventListener('message', this._messageHandler, false)
    	this._socket.removeEventListener('error', this._errorHandler, false)
    	this._socket.removeEventListener('close', this._closeHandler, false)
      this._socket = null
      this._isOpen = false
    }
	}
}
/*
	todo
		autoreconnect
*/
export class SocketObservable {
	constructor(manager) {
		return Rx.Observable.create(obs => {
      manager.connect(obs)
      return manager
    })
    // REVISIT .RETRY LATER. IT ONLY THROWS ERROR WHEN COUNT REACHED.
    //.retry(100) 	// will stop after 100x attempts, not ideal want endless
    .publish()		// return connectable
    //.multicast() 
	}
}

export class SocketSubject {
	constructor(config, openObs, closeObs) {
		this._openObs = openObs
		this._closeObs = closeObs

		this._manager = new SocketManager(config)
    this._manager.OpenObserver = this._openObs
    this._manager.CloseObserver = this._closeObs

		var observable = new SocketObservable(this._manager)

		var observer = {
			next: (msg) => {
				this._manager.send(msg)
			}
		}

		observable.connect()

		return Rx.Subject.create(
			observer,
			observable
		)
	}
}

export class DimplesClientSocket{
	constructor(config) {
		// add event handler for open
		// add event handler for close
		// add event handler for message
		// add event handler for error

		var openObs = {
			next: (msg) => {
				// fire open event handler
				console.log('dimples client open obs', msg)
			}
		}

		var closeObs = {
			next: (msg) => {
				// fire close event handler
				console.log('dimples client close obs', msg)
			}
		}

		this._subject = new SocketSubject(config, openObs, closeObs)

		this._subject.subscribe({
			next: (msg) => {
				// fire message handler
				console.log('dimples client message obs', msg)
			},
			error: (err) => {
				// fire error handler
				console.log('dimples client error obs', err)
			},
			complete: () => {
				// fire close handler
				console.log('dimples client complete obs')
			}
		})
	}
	send(msg) {
		this._subject.next(msg)
	}
}