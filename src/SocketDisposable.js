import Rx from 'rxjs/Rx'

class SocketDisposable {
  constructor(url, protocol, msgFn, errFn, closeFn, close) {
    this.url = url
    this.protocol = protocol

    this.msgFn = msgFn
    this.errFn = errFn
    this.closeFn = closeFn
    this.closeObs = close
    this.isDisposed = false

    this.socket = this.protocol ? new WebSocket(this.url, this.protocol) : new WebSocket(this.url)

    var openHandler = this.createOpenHandler(this.open, this.socket)
    var msgHandler = this.createMsgHandler(obs)
    var errHandler = this.createErrHandler(obs)
    var closeHandler = this.createCloseHandler(obs)

    this.open && this.socket.addEventListener('open', openHandler, false)
    this.socket.addEventListener('message', msgHandler, false)
    this.socket.addEventListener('error', errHandler, false)
    this.socket.addEventListener('close', closeHandler, false)
  }
  dispose() {
    if (!this.isDisposed) {
      this.isDisposed = true

      if (this.socket) {
        if (this.closeObs) {
          this.closeObs.onNext()
        }
        this.socket.close()
      }

      this.socket.removeEventListener('message', this.msgFn, false)
      this.socket.removeEventListener('error', this.errFn, false)
      this.socket.removeEventListener('close', this.closeFn, false)
    }
  }
}
class uSocketObserver {
  constructor(res) {
    this.socket
    return Rx.Observer.create(
      x => { this.send(x) },
      e => { this.error(e) },
      () => { this.completed() })
  }
  send(x) {
    console.log('send message through socket', x)
  }
  error(e) {
    console.log('error socket observer', e)
  }
  completed(){
    console.log('completed observer')
  }
}
class uSocketSubject {
  constructor(res) {
    this.subject = new Rx.AsyncSubject()
    this.subject.onNext(res)
  }
  subscribe(onNext, onError, onCompleted) {
    this.subject.subscribe(onNext, onError, onCompleted)
  }
  sendJson(msg) {
    this.subject.onNext(JSON.stringify(msg))
  }
}

export default class uSocket {
  constructor(url, protocol) {
    return Rx.Observable.using(
      () => { return new SocketDisposable(url, protocol) },
      (res) => {
        return new uSocketSubject(res)
      }
    )
  }
}