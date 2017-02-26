export default class SocketDisposable {
  constructor (socket, config, openHandler, msgHandler, errHandler, closeHandler) {
    this.socket = socket
    this.config = config
    this.openFn = openHandler
    this.msgFn = msgHandler
    this.errFn = errHandler
    this.closeFn = closeHandler
    this.isDisposed = false
  }
  dispose () {
    if (!this.isDisposed) {
      this.isDisposed = true
      this.close(this.socket, this.config.closeObs, null, null)

      if (this.openFn) {
        this.socket.removeEventListener('open', openHandler, false)
      }

      this.socket.removeEventListener('message', this.msgFn, false)
      this.socket.removeEventListener('error', this.errFn, false)
      this.socket.removeEventListener('close', this.closeFn, false)
    }
  }
  close (socket, closingObserver, code, reason) {
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
