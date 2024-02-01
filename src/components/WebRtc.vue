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
  connStore.localPr.localRTCPC.addEventListener("datachannel", (event) => {
    const channel = event.channel;
    console.log("rtc的datachannel触发")
    channel.addEventListener("message", (event) => {
      console.log("接收到来自Datachannel的数据")
      console.log(event)
      if (event.data instanceof ArrayBuffer) {
        var a = new TextDecoder().decode(event.data);
        console.log("二进制数据转成字符输出:", a)
      }
    });
    channel.addEventListener("open", (event) => {
      console.log("data channel open event")
      console.log(event)
    });
    channel.addEventListener("close", (event) => {
      console.log("data channel close event")
      console.log(event)
    });
  })
  connStore.localPr.localRTCPC.addEventListener("icecandidate", async (event) => {
    if (event.candidate) {
      console.log("icecandidate事件收到答应，应发给服务器做交换：")
      console.log(event.candidate)
      const sendData = {
        type: eventNames.Candidate,
        data: {
          type: eventNames.Candidate,
          roomId: userStore.userInfo.roomId,
          // candidate: {
          //   'sdpMLineIndex': event.candidate.sdpMLineIndex,
          //   'sdpMid': event.candidate.sdpMid,
          //   'candidate': event.candidate.candidate,
          // },
          candidate: event.candidate,
          to: userStore.otherUsers[0].id
        }
      }
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
      console.log("streams有值")
      console.log(event.streams[0])
      videoRef2.value.srcObject = event.streams[0]
    } else if (event) {
      console.log("track有值")
      videoRef2.value.srcObject = new MediaStream([event.track])
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
  createDataChannel();
  // connStore.localPr.localRTCPC.addEventListener("datachannel", (event) => {
  //   receiveChannel = event.channel;
  //   receiveChannel.onmessage = (event) => {
  //     console.log("receiveChannel.onmessage");
  //     console.log(event);
  //   }
  //   receiveChannel.onclose = onReceiveChannelStateChange
  //   receiveChannel.onopen = onReceiveChannelStateChange
  //   console.log("datachannel event触发")
  // })
}
let receiveChannel;
const onReceiveChannelStateChange = (e) => {
  const state = receiveChannel.readyState;
  console.log("接收通道状态发生变化:", state)
  console.log(e)
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
let channel;
const createDataChannel = async () => {
  channel = await connStore.localPr.localRTCPC.createDataChannel("fuckChannel")
  console.log("datachannel 创建成功")
  console.log(channel)
  channel.onopen = (event) => {
    console.log("datachannel状态发生变化:onopen")
  }
  channel.onerror = (err) => {
    console.log("rtcdata channel error", err)
  }
  channel.onerror = () => {
    console.log("rtcdata channel close")
  }
}

const sendRandomData = async () => {
  if (channel) {
    channel.send("fuck data from datachannel")
  }
}

const getUserVideoIn = async () => {
  console.log(connStore.localPr)
  console.log(connStore.localPr.localDevice)
  console.log(connStore.localPr.localDevice.videoIn)
  if (connStore.localPr.localDevice.videoIn.length) {
    const r = await connStore.localPr.getTargetIdStream(connStore.localPr.localDevice.videoIn[0].id)
    console.log(r)
  }
}

const requestPermissions = async () => {
  const a = await connStore.localPr.requestCamera()
  console.log(a)
  console.log(a.state)
  const b = await navigator.permissions.query({name: 'microphone'});
  console.log(b)
  console.log(b.state)
}
</script>

<template>
  <div>
    <a-row>
      <a-button @click="initWebRtcEvent">初始化WebRTC对象</a-button>
      <a-button @click="tryConnect">尝试链接b</a-button>
      <a-button @click="setLocalTracks">加载本地视频流</a-button>
      <hr/>
      <a-button @click="requestPermissions">申请摄像头权限</a-button>
      <a-button @click="getUserVideoIn">获取用户摄像头</a-button>
      <hr/>
      <a-button @click="createDataChannel">创建DataChannel</a-button>
      <a-button @click="sendRandomData">利用DataChannel发送随机数据</a-button>
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