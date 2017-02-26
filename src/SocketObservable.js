import Rx from 'rxjs/Rx'
import SocketDisposable from './SocketDisposable'
/*
    - Additional Features
        - Automatic reconnect
        - Cookie integration?
        - Multiple endpoints
        - Multiplexing
        - Heartbeat
*/
export default class SocketObservable {
  constructor (state, config) {
    this.state = state
    return Rx.Observable.create(obs => {
      this.state.socket = config.protocol
        ? new window.WebSocket(config.url, config.protocol)
        : new window.WebSocket(config.url)

      var openHandler = null
      if (config.openObs) {
        openHandler = this.createOpenHandler(config.openObs, this.state.socket)
      }
      var msgHandler = this.createMsgHandler(obs)
      var errHandler = this.createErrHandler(obs)
      var closeHandler = this.createCloseHandler(obs, config.closeObs)

      config.openObs && this.state.socket.addEventListener('open', openHandler, false)
      this.state.socket.addEventListener('message', msgHandler, false)
      this.state.socket.addEventListener('error', errHandler, false)
      this.state.socket.addEventListener('close', closeHandler, false)

      return new SocketDisposable(this.state.socket, config, openHandler, msgHandler, errHandler, closeHandler)
    })
  }
  createOpenHandler (open, socket) {
    return function openHandler (e) {
      open.next(e)
    }
  }
  createMsgHandler (o) {
    return function msgHandler (e) {
      o.next(e)
    }
  }
  createErrHandler (o) {
    return function errHandler (e) {
      o.error(e)
    }
  }
  createCloseHandler (obs, closeObs) {
    return function closeHandler (e) {
      if (closeObs) {
        if (e.code !== 1000 || !e.wasClean) {
          closeObs.error(e)
        } else {
          closeObs.next(e)
        }
      }
      obs.complete()
    }
  }
}
