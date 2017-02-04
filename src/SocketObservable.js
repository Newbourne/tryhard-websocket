import Rx from 'rxjs/Rx'

/*
    Keep the signatures as fluid to WebSocket as possible.
    - (Future) Additional Features
        - Automatic reconnect. (when server resets, the connection should as well)
        - Cookie integration?
        - Multiple endpoints
        - Multiplexing
        - Heartbeat
*/
class SocketDisposable{
  constructor(socket, msgFn, errFn, closeFn, close) {
    this.socket = socket
    this.msgFn = msgFn
    this.errFn = errFn
    this.closeFn = closeFn
    this.closeOsb = close
    this.isDisposed = false
  }
  dispose() {
    if (!this.isDisposed) {
      this.isDisposed = true
      this.close(this.socket, this.closeOsb)

      this.socket.removeEventListener('message', this.msgFn, false)
      this.socket.removeEventListener('error', this.errFn, false)
      this.socket.removeEventListener('close', this.closeFn, false)
    }
  }
  close(socket, closingObserver, code, reason) {
    if (socket) {
      if (closingObserver) {
        closingObserver.onNext()
        closingObserver.onCompleted()
      }
      if (!code) {
        socket.close()
      } else {
        socket.close(code, reason)
      }
    }
  }
}

export default class SocketObservable {
  constructor(state, url, protocol, openObserver, closingObserver) {
    this.url = url
    this.protocol = protocol
    this.socket = null
    this.open = openObserver
    this.close = closingObserver
    this.state = state

    return Rx.Observable.create(obs => {
      this.state.socket = this.protocol ? new window.WebSocket(this.url, this.protocol) : new window.WebSocket(this.url)

      var openHandler = this.createOpenHandler(this.open, this.state.socket)
      var msgHandler = this.createMsgHandler(obs)
      var errHandler = this.createErrHandler(obs)
      var closeHandler = this.createCloseHandler(obs)

      this.open && this.state.socket.addEventListener('open', openHandler, false)
      this.state.socket.addEventListener('message', msgHandler, false)
      this.state.socket.addEventListener('error', errHandler, false)
      this.state.socket.addEventListener('close', closeHandler, false)

      return new SocketDisposable(this.state.socket, msgHandler, errHandler, closeHandler, this.close);
    })
  }
  createOpenHandler(open, socket) {
    return function openHandler(e) {
      open.next(e);
      open.complete();
      socket.removeEventListener('open', openHandler, false);
    }
  }
  createMsgHandler(o) { 
    return function msgHandler(e) {
      if (e.data){
        o.next(e.data)
      } else {
        o.next(e) 
      }
    } 
  }
  createErrHandler(o) { 
    return function errHandler(e) {
      o.error(e)
    } 
  }
  createCloseHandler(obs) {
    return function closeHandler(e) {
      if (e.code !== 1000 || !e.wasClean) {
        return obs.error(e)
      }
      obs.complete()
    }
  }
}