import Rx from 'rxjs/Rx'
import SocketObservable from './SocketObservable'
import SocketObserver from './SocketObserver'

const socketCfg = {
  url: null,
  protocol: null,
  heartbeat: false,
  openObs: null,
  closeObs: null
}
export default class SocketSubject {
  constructor (config) {
    // handle url only
    if (typeof config === 'string' || config instanceof String) {
      socketCfg.url = config
      config = {}
    }
    this.state = {
      socket: {}
    }
    this.heartbeat = null
    this.config = Object.assign(socketCfg, config)
  }
  connect () {
    this.subject = Rx.Subject.create(
      new SocketObserver(this.state, this.config),
      new SocketObservable(this.state, this.config)
    )
  }
  close () {
    this.state.socket.close()
  }
  subscribe (onNext, onError, onCompleted) {
    if (!this.subject && onError) {
      return onError('No connection. Do you even lift bro?')
    }
    this.subject.subscribe(onNext, onError, onCompleted)
  }
  sendJson (msg) {
    this.subject.next(JSON.stringify(msg))
  }
  send (msg) {
    this.subject.next(msg)
  }
}
