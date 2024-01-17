class CRTCPeerConnection {
    rtcPc;

    constructor() {
        this.rtcPc = new window.RTCPeerConnection();
    }

    static async isSupport() {
        const result = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if (!result) {
            console.log("当前浏览器不支持WebRTC");
        }
        return Boolean(result);
    }

    async initCallerInfo(callerId, calleeId) {
    }
}

export default CRTCPeerConnection;