<script setup>
import {ref} from "vue"
import ConnectSocket from "../components/WebSocket.vue";
import WebRtc from "../components/WebRtc.vue";
import useUserStore from "../store/user.js";

const videoRef = ref()
const videoRef2 = ref()

let caller;
const openScreen = () => {
}
const wsResList = ref([])

const screenShot = () => {
  canvasRef.value.getContext("2d");
  canvasRef.value.width = videoRef.value.videoWidth;
  canvasRef.value.height = videoRef.value.videoHeight;
  canvasRef.value.getContext('2d').drawImage(videoRef.value,
    0, 0, canvasRef.value.width, canvasRef.value.height);
}
const canvasRef = ref()

let sendChannel;
let receiveChannel;
const createDataChannelA = async () => {
  console.log(RtcPcA.connectionState)
  sendChannel = await RtcPcA.createDataChannel("webrtc-data-channel-A")

  sendChannel.onopen = onSendChannelStateChange
  sendChannel.onclose = onSendChannelStateChange
  console.log("创建RtcPcA data channel")
  console.log(sendChannel)
}
const sendFromDataChannel = async () => {
  console.log(sendChannel)
  if (sendChannel.readyState === "open") {
    sendChannel.send("fuck")
  }
}
const onSendChannelStateChange = (e) => {
  const state = sendChannel.readyState;
  console.log("发送通道状态发生变化:", state)
  console.log(e)
}

const onReceiveChannelStateChange = (e) => {
  const state = receiveChannel.readyState;
  console.log("接收通道状态发生变化:", state)
  console.log(e)
}

const contentStyle = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
};

const userStore = useUserStore()
</script>


<template>
  <div>
    <a-layout>
      <a-layout-header>
        <div style="color: white">WebRTC instance</div>
      </a-layout-header>
      <a-layout-content :style="contentStyle">
        <div style="display: flex;padding-left: 20px">
          <a-card>
            <div>
              当前房间：{{ userStore.userInfo.roomId }}
            </div>
            <div>
              用户名：{{ userStore.userInfo.id }}
            </div>
          </a-card>
        </div>
        <a-card>
          <connect-socket/>
          <web-rtc/>
        </a-card>
      </a-layout-content>
    </a-layout>
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
