const configuration = {
    "iceServers": [{
        "url": "stun:stun.l.google.com:19302"
    }]
};

class LWebrtc {
    // 本地设备列表
    localDevice = {
        audioIn: [],
        audioOut: [],
        videoIn: []
    }

    localRTCPC;

    constructor() {
        this.localRTCPC = new RTCPeerConnection(configuration);
        console.log("本地RTCPeerConnection创建成功!")
    }

    // 默认限制
    // { audio: true, video: true } 简单实例为设置布尔值，比如计算机上并没有视频输入源，video又为true，那么就会报错
    // 此时可以根据[navigator.mediaDevices.enumerateDevices]返回来判断有没有视频输入源，没有则可以设置false
    defaultConstraints = {
        audio: true,
        video: {
            // 如果有多输入源，可以根据deviceId指定设备
            // deviceId: "xxx",

            // 获取移动设备的前置或者后置摄像头
            facingMode: "user", // 前置
            // facingMode: { exact: "environment" }, // 后置

            // 指定屏幕分辨率，deal为理想值，min为最小值，max为最大值
            // 分辨率在不同场景下应该考虑不同的取值，以及不是所有摄像头都支持约束的值，比如多人会议，则应该降低分辨率来保证稳定性
            width: {min: 320, ideal: 1280, max: 1920},
            height: {min: 240, ideal: 720, max: 1080},
            // 也可以简单设置number
            // width: 720, height: 480

            // 指定帧速率 frameRate，比如每秒24张图片才能形成一个基本流畅的视频，速率会对视频质量有影响，类似于FPS的概念
            frameRate: {min: 10, ideal: 15, max: 24},
        }
    }

    /**
     * 获取用户设备上所有摄像头和麦克风信息
     * @returns {Promise<void>}
     */
    initInnerLocalDevice() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.error("当前浏览器不支持获取媒体设备，请更换浏览器");
            alert("当前浏览器不支持获取媒体设备，请更换浏览器");
            return;
        }
        navigator.mediaDevices.getUserMedia(this.defaultConstraints).then((stream) => {
            stream.getTracks().forEach((track) => {
                track.stop();
            })
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                devices.forEach((device) => {
                    const obj = {id: device.deviceId, label: device.label, kind: device.kind};
                    if (device.kind === "audioinput") {
                        if (!this.localDevice.audioIn.find((item) => item.id === device.deviceId)) {
                            this.localDevice.audioIn.push(obj);
                        }
                    } else if (device.kind === "audiooutput") {
                        if (!this.localDevice.audioOut.find((item) => item.id === device.deviceId)) {
                            this.localDevice.audioOut.push(obj);
                        }
                    } else if (device.kind === "videoinput") {
                        if (!this.localDevice.videoIn.find((item) => item.id === device.deviceId)) {
                            this.localDevice.videoIn.push(obj);
                        }
                    }
                })
                console.log(this.localDevice)
            }).catch(this.handleError);
        }).catch(this.handleError)
    }

    /**
     * 基本的错误处理器
     * @param {Error} error
     * @param other
     */
    handleError(error, ...other) {
        console.error("Error: " + error);
        other.length ? console.error("Other: " + other) : null;
    }


    async getLocalUserMedia(constraints = this.defaultConstraints) {
        return await navigator.mediaDevices.getUserMedia(constraints);
    }

    /**
     * 根据设备id获取对应的媒体流
     * @param {*} videoId
     * @param {*} audioId
     * @returns
     */
    async getTargetIdStream(videoId, audioId) {
        const constraints = {
            // audioId: {
            //     deviceId: audioId ? {exact: audioId} : null
            // },
            audioId: false,
            videoId: {
                ...this.defaultConstraints.video,
                deviceId: videoId ? {exact: videoId} : null
            }
        };
        this.stopMediaStream();
        return await this.getLocalUserMedia(constraints);
    }

    /**
     * 停止所有当前运行的媒体流
     */
    stopMediaStream() {
        if (window.stream) {
            window.stream.getTracks(tracks => {
                tracks.forEach(track => {
                    track.stop();
                });
            })
        }
    }

    screenDefaultConstraints = {
        audio: false,
        video: {
            width: 1080,
            height: 1080
        }
    }

    /**
     * 获取屏幕流
     * @param {*} constraints 与上面的约束类似作用，但有一点区别，屏幕约束配置，这里的video不能设置为false，但是可以指定分辨率，audio设置为ture/false的区别是，弹出的视频提示框会不会有使用系统饮品的radio框
     * @param {*} callback 流处理回调
     */
    getScrennMedia({constraints = this.screenDefaultConstraints, callback} = {}) {
        navigator.mediaDevices.getDisplayMedia(constraints)
            .then(stream => {
                callback?.call(this, stream)
            })
            .catch(this.handleError);
    }

    requestCamera = async ()=>{
        const cameraResult = await navigator.permissions.query({ name: 'camera' });
        return cameraResult;
    }
};

export default LWebrtc;