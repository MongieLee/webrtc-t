// const wsUrl = "ws://192.168.102.110:8080/ws";
const wsUrl = "wss://mongielee.top:8080/ws";
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