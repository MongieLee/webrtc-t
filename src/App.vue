<script setup>
import {onMounted, ref} from "vue"
import Cwebrtc from "./services/CWebrtc"

const instance = new Cwebrtc();
const videoRef = ref()
const videoRef2 = ref()
instance.initInnerLocalDevice();
const configuration = {
  "iceServers": [{
    "url": "stun:stun.l.google.com:19302"
  }]
};

let RtcPcA
let RtcPcB
const init = () => {
  RtcPcA = new RTCPeerConnection(configuration);
  console.log("本地PCA创建成功")
  RtcPcB = new RTCPeerConnection(configuration);
  console.log("本地PCB创建成功")
// 田间返回的Candidate
  RtcPcA.addEventListener("icecandidate", async (event) => {
    if (event.candidate) {
      // 将A的候选信息存到pcb当中
      await RtcPcB.addIceCandidate(event.candidate)
      console.log("------")
      console.log("pca的认证信息已经添加成功到pcb中")
      console.log("------")
    }
  })
  RtcPcA.addEventListener("iceconnectionstatech", async (event) => {
    console.log(`RtcPcA连接的ICE状态:${RtcPcA.iceConnectionState}`);
    console.log('ICE状态改变事件: ', event)
  })
  RtcPcA.addEventListener("datachannel", (event) => {
    const receiveChannel = event.channel;
    receiveChannel.addEventListener("message", (event) => {
      console.log("RtcPcA的dataChannel接受到数据")
      console.log(event)
    })
    receiveChannel.addEventListener("open", (event) => {
      console.log("RtcPcA的dataChannel打开")
      console.log(event)
    })
    receiveChannel.addEventListener("close", (event) => {
      console.log("RtcPcA的dataChannel关闭")
      console.log(event)
    })
  })

  RtcPcB.addEventListener("icecandidate", async (event) => {
    if (event.candidate) {
      // 将B的候选信息存到pca当中
      await RtcPcA.addIceCandidate(event.candidate)
      console.log("------")
      console.log("pcb的认证信息已经添加成功到pca中")
      console.log("------")
    }
  })
  RtcPcB.addEventListener("iceconnectionstatech", async (event) => {
    console.log(`RtcPcB连接的ICE状态:${RtcPcA.iceConnectionState}`);
    console.log('ICE状态改变事件: ', event)
  })
  RtcPcB.addEventListener("track", (event) => {
    console.log("RtcPcB开始接受远端视频流 event:")
    console.log(event)
    if (videoRef2.value.srcObject !== event.streams[0]) {
      videoRef2.value.srcObject = event.streams[0]
    }
  })
  RtcPcB.addEventListener("datachannel", (event) => {
    const receiveChannel = event.channel;
    console.log("RtcPcB-接受端：")
    console.log(event)
  })
}
onMounted(() => {
  init()
})

let caller;
const openScreen = () => {
  instance.getScrennMedia({
    callback: function (stream) {
      caller = stream
      console.log(stream);
      videoRef.value.srcObject = stream;
    }
  });
}
let socket = null;

const wsResList = ref([])

const connectWebsocket = () => {
  socket = new WebSocket("ws://localhost:8080/ws");
  console.log(socket)
  socket.addEventListener("open", () => {
    console.log("socket已建立链接")
  })

  socket.addEventListener("message", (data) => {
    console.log("接收消息", data)
    wsResList.value.push(data)
  })

  socket.addEventListener("close", () => {
    console.log("socket已关闭")
  })

  socket.addEventListener("error", (error) => {
    console.log("socket链接出错", error)
  })
}

const sendMessage = () => {
  if (socket) {
    try {
      socket.send("fuck")
    } catch (e) {
      console.error(e)
    }
  }
}
const screenShot = () => {
  canvasRef.value.getContext("2d");
  canvasRef.value.width = videoRef.value.videoWidth;
  canvasRef.value.height = videoRef.value.videoHeight;
  canvasRef.value.getContext('2d').drawImage(videoRef.value,
    0, 0, canvasRef.value.width, canvasRef.value.height);
}
const canvasRef = ref()

const call = async () => {
  const videoTracks = caller?.getVideoTracks();
  // const audioTracks = caller.getAudioTracks();
  if (videoTracks?.length) {
    videoTracks.forEach((track) => {
      // 将本地流的所有轨道添加到链接中
      RtcPcA.addTrack(track, caller);
    })
    try {
      console.log(`使用的视频设备为：${videoTracks[0].label}`)
      // 创建sender
      const sdp = await RtcPcA.createOffer();
      console.log("RtcPcA创建的offer内容")
      console.log(sdp)
      await RtcPcA.setLocalDescription(sdp)
      console.log("RtcPcA设置本地描述")
      await RtcPcB.setRemoteDescription(sdp)
      const answerSpd = await RtcPcB.createAnswer();
      console.log("RtcPcB创建远程远程答应")
      await onCreateAnswerSuccess(answerSpd)
    } catch (e) {
      console.log("e")
    }
  }
}

const onCreateAnswerSuccess = async (sdp) => {
  console.log("RtcPcB的答应数据");
  console.log(sdp);
  try {
    await RtcPcB.setLocalDescription(sdp)
    console.log("RtcPcB设置本地答应描述");
    await RtcPcA.setRemoteDescription(sdp)
    console.log("RtcPcA设置远程答应描述");
  } catch (e) {
    console.log(e)
  }
}

const close = () => {
  RtcPcA.close();
  RtcPcB.close();
  RtcPcA = null;
  RtcPcB = null;
}

let sendChannel;
const createDataChannel = async () => {
  console.log(RtcPcA.connectionState)
  sendChannel = await RtcPcA.createDataChannel("webrtc-data-channel-A", {ordered: true, maxRetransmits: 3})
  sendChannel.onopen = (event) => {
    console.log(event)
    if (sendChannel) {
      const state = sendChannel.readyState;
      if (state === "open") {
        console.log("open")
      } else {
        console.log(state)
      }
    }
  }
  sendChannel.onclose = (e) => {
    console.log(e)
  }
  console.log("创建RtcPcA data channel")
  console.log(sendChannel)
}
const sendFromDataChannel = async () => {
  console.log(sendChannel)
  if (sendChannel.readyState === "open") {
    sendChannel.send("fuck")
  }
}
</script>

<template>
  <div>
    <div style="display: flex">
      <button @click="openScreen">open Screen</button>
      <button @click="connectWebsocket">connect websocket</button>
      <button @click="sendMessage">send data to websocket</button>
    </div>
    <div style="display: flex">
      <div style="position: relative">
        <video ref="videoRef" autoplay controls muted playsinline></video>
      </div>
      <div style="width: 100px"></div>
      <div style="position: relative">
        <video ref="videoRef2" autoplay controls muted playsinline></video>
      </div>
    </div>
    <div>
      <button @click="call">开始呼叫</button>
      <button @click="close">断开</button>
      <button @click="createDataChannel">创建RtcA和RtcB的Data Channel</button>
      <button @click="sendFromDataChannel">RtcA发送data</button>
    </div>
    <button @click="screenShot">截屏</button>
    <div>
      <div>截屏列表</div>
      <canvas ref="canvasRef" class="m-canvas" style="bottom: 0;right: 2px;"/>
    </div>
    <div v-for="item in wsResList">
      {{ item.data }}
    </div>
  </div>
</template>

<style scoped>
.m-canvas {
  width: 300px;
  height: 300px;
  border: 3px solid green;
}

video {
  width: 600px;
  height: 600px;
}
</style>
