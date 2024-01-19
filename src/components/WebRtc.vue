<script setup>
import useConnStore from "../store/conn.js";
import LWebrtc from "../services/LWebrtc.js";
import {eventNames} from "../services/socketEvent.js";
import useUserStore from "../store/user.js";
import {message} from "ant-design-vue";
import {ref} from "vue";

const connStore = useConnStore()
const log = console.log;
const initWebRtcEvent = () => {
  connStore.localPr = new LWebrtc();
  connStore.localPr.localRTCPC.addEventListener("icecandidate", async (event) => {
    if (event.candidate) {
      console.log("icecandidate事件收到答应，应发给服务器做交换：")
      console.log(event.candidate)
      const sendData = {
        type: eventNames.Candidate,
        data: {
          type: eventNames.Candidate,
          roomId: userStore.userInfo.roomId,
          candidate: {
            'sdpMLineIndex': event.candidate.sdpMLineIndex,
            'sdpMid': event.candidate.sdpMid,
            'candidate': event.candidate.candidate,
          },
          to: userStore.otherUsers[0].id
        }
      }
      console.log("Candidate实际发送的数据")
      console.log(sendData)
      console.log("转成json字符串后的数据")
      console.log(JSON.stringify(sendData))
      connStore.wsConn.socket.send(JSON.stringify(sendData))
    }
  })
  connStore.localPr.localRTCPC.addEventListener("iceconnectionstatech", async (event) => {
    console.log(`RtcPcA连接的ICE状态:${connStore.localPr.localRTCPC.iceConnectionState}`);
    console.log('ICE状态改变事件: ', event)
  })
  connStore.localPr.localRTCPC.addEventListener("track", (event) => {
    console.log("开始接受track event:")
    console.log(event)
    // videoRef2.value.style.display = "block"
    if (event.streams.length) {
      videoRef2.value.srcObject = event.streams[0]
    } else {
      message.warn("没有收到流")
    }
  })
  connStore.localPr.localRTCPC.addEventListener("addstream", (event) => {
    console.log("开始接受addstream event:")
    console.log(event)
    // videoRef2.value.style.display = "block"
    // if (event.streams.length) {
    //   videoRef2.value.srcObject = event.streams[0]
    // } else {
    //   message.warn("没有收到流")
    // }
  })
}
const userStore = useUserStore()
const tryConnect = async () => {
  if (userStore.otherUsers.length) {
    const sdp = await connStore.localPr.localRTCPC.createOffer()
    console.log("本地offer sdp内容已生成：", sdp)
    await connStore.localPr.localRTCPC.setLocalDescription(sdp);
    console.log("本地setLocalDescription已完成")
    const sendData = {
      type: eventNames.Offer,
      data: {
        type: eventNames.Offer,
        roomId: userStore.userInfo.roomId,
        to: userStore.otherUsers[0].id,
        sdp: sdp
      }
    }
    console.log(sendData)
    connStore.wsConn.socket.send(JSON.stringify(sendData))
  } else {
    message.info("当前房间没有其他人，无法发起链接")
  }
}

let caller;
const setLocalTracks = () => {
  connStore.localPr.getScrennMedia({
    callback: function (stream) {
      caller = stream
      console.log(stream);
      const videoTracks = stream.getVideoTracks()
      if (videoTracks.length) {
        videoRef.value.style.display = "block"
        videoTracks.forEach(track => {
          console.log("本地track")
          console.log(track)
          connStore.localPr.localRTCPC.addTrack(track)
        })
      }
      videoRef.value.srcObject = stream;
    }
  });
}

const videoRef = ref();
const videoRef2 = ref();
</script>

<template>
  <div>
    <a-row>
      <a-button @click="initWebRtcEvent">初始化WebRTC对象</a-button>
      <a-button @click="tryConnect">尝试链接b</a-button>
      <a-button @click="setLocalTracks">加载本地视频流</a-button>
    </a-row>
    <div style="position: relative;display: flex;">
      <div style="flex: 1">
        <div>本地流</div>
        <video style="display: none;width: 400px;height: 200px;" ref="videoRef" autoplay controls muted
               playsinline></video>
      </div>
      <div style="flex: 1">
        <div>远程流</div>
        <video style="width: 400px;height: 200px;" ref="videoRef2" autoplay controls muted
               playsinline></video>
      </div>

    </div>
  </div>
</template>