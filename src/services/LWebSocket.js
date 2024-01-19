const wsUrl = "ws://127.0.0.1:8080/ws";
const supportEventNameList = ["message", "close", "error", "open"];

class LWebSocket {
    wsUrl = wsUrl;
    socket;

    constructor() {
        this.socket = new WebSocket(this.wsUrl)
    }

    addEventListener(eventName, cb, options) {
        if (supportEventNameList.includes(eventName) && cb) {
            this.socket.addEventListener(eventName, cb, options)
        }
    }
}

export default LWebSocket;