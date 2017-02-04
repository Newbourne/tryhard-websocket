export default class SocketObserver {
	constructor(state, close) {
		this.state = state
		this.close = close
		return {
			next: x => { this.send(x) },
			error: e => { this.error(e) },
			complete: () => { this.completed() }
		}
	}
	close() {
		this.state.socket.close();
	}
	send(x) {
		// this.state.socket && 
		// this.state.socket.readyState === window.WebSocket.OPEN 
		// && 
		this.state.socket.send(x)
	}
	error(e) {
		if (this.state.socket){
		  if (this.close) {
		    this.close.onError(e);
		  }			
			this.state.socket.close()
		}
	}
	completed(){
		if (this.state.socket){
	      if (this.close) {
	        this.close.onCompleted();
	      }           
			this.state.socket.close()
		}		
	}
}