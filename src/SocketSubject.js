import Rx from 'rxjs/Rx'
import SocketObservable from './SocketObservable'
import SocketObserver from './SocketObserver'
import SocketHeart from './SocketHeart'

export default class SocketSubject {
	constructor(url, protocol){
		this.url = url
		this.protocol = protocol
		this.state = {
			socket: null
		}
		this.heartbeat = null
		this.setup()
	}
	setup(){
		// how to recycle observer?
		this.openingObserver = {
			next: x => console.log('socket opened'),
			complete: () => console.log('socket closed')
		}
		this.closingObserver = {
			next: x => console.log('socket closed')
		}
		this.subject = Rx.Subject.create(
			new SocketObserver(this.state, this.closingObserver),
			new SocketObservable(this.state, this.url, this.protocol, this.openingObserver, this.closingObserver)
		)
	}
  	// Can't use heartbeating yet. 
  	// This will create another WebSocket instance 
	// enableHeartbeat() {
	// 	if (!this.heartbeat) {
	// 		this.heartbeat = new SocketHeart(this)
	// 	}
	// }
	subscribe(onNext, onError, onCompleted) {
		this.subject.subscribe(onNext, onError, onCompleted)
	}
	sendJson(msg) {
		this.subject.next(JSON.stringify(msg))
	}
	send(msg) {
		this.subject.next(msg)
	}
}