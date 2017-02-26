 // NOT USED
export default class SocketHeart {
  constructor (subject) {
    this.subject = subject
    this.subject.subscribe(
      this.onNext.bind(this),
      this.onError.bind(this),
      this.onCompleted.bind(this)
    )
  }
  onNext (msg) {
    if (msg && msg.command && msg.command === 'HEARTBEAT') {
      this.subject.sendJson({
        command: 'HEARTBEAT'
      })
    }
  }
  onError (err) {
    console.log('HEARTBEAT ERROR', err)
  }
  onCompleted () {
    console.log('HEARTBEAT COMPLETED')
  }
}
