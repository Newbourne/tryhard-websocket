export default class SocketObserver {
  constructor (state, config) {
    this.state = state
    this.config = config
    return {
      next: x => { this.send(x) },
      error: e => { this.error(e) },
      complete: () => { this.completed() }
    }
  }
  close () {
    this.state.socket.close()
  }
  send (x) {
    this.state.socket.send(x)
  }
  error (e) {
    if (this.state.socket) {
      this.state.socket.close()
    }
  }
  completed () {
    if (this.state.socket) {
      this.state.socket.close()
    }
  }
}
