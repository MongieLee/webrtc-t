<script setup>
import useConnStore from "../store/conn.js";
import LWebSocket from "../services/LWebSocket.js";
import {eventNames} from "../services/socketEvent.js";
import useUserStore from "../store/user.js";
import {message} from "ant-design-vue";

const userStore = useUserStore()
const connStore = useConnStore()
const log = console.log;

const handleSocketData = (data) => {
  console.log(data)
  switch (data.type) {
    case "heartPackage":
      // console.log("接收到socket心跳包");
      break;
    case "candidate":
      handleCandidate(data)
      break;
    case "offer":
      handleOffer(data)
      break;
    case "answer":
      handleAnswer(data)
      break
    case "hangUp":
      break;
    case "joinRoom":
      break;
    case "leaveRoom":
      break;
    case "isFull":
      message.warn("房间已满人，无法加入")
      break;
    case "updateUserList":
      updateRoomInfo(data);
      break;
    default:
      break;
  }
}

const handleAnswer = async (data) => {
  const sdp = data.sdp
  await connStore.localPr.localRTCPC.setRemoteDescription(sdp)
  console.log("已收到answer")
}


const handleCandidate = async (data) => {
  console.log("handleCandidate")
  console.log(data)
  await connStore.localPr.localRTCPC.addIceCandidate(data.candidate)
}


// 收到远程请求呼叫
const handleOffer = async (data) => {
  const sdp = data.sdp
  await connStore.localPr.localRTCPC.setRemoteDescription(sdp)
  // 做回应
  const answer = await connStore.localPr.localRTCPC.createAnswer()
  await connStore.localPr.localRTCPC.setLocalDescription(answer)
  const sendData = {
    type: eventNames.Answer,
    data: {
      type: eventNames.Answer,
      roomId: userStore.userInfo.roomId,
      to: userStore.otherUsers[0].id,
      sdp: answer
    }
  }
  console.log("已生成answer并回复")
  connStore.wsConn.socket.send(JSON.stringify(sendData))
}

const updateRoomInfo = (data) => {
  userStore.otherUsers = data.data.filter(i => i.id != userStore.userInfo.id)
  console.log("房间人数已更新", userStore.otherUsers)
}

const connWS = () => {
  if (connStore.wsConn) return
  const webSocket = new LWebSocket();
  connStore.wsConn = webSocket;
  webSocket.addEventListener("open", () => {
    log("webSocket已建立链接!")
    const sendData = {
      type: eventNames.JoinRoom,
      data: {
        roomId: useUserStore().userInfo.roomId,
        id: useUserStore().userInfo.id,
        name: useUserStore().userInfo.id,
      }
    }
    connStore.wsConn.socket.send(JSON.stringify(sendData))
  })

  webSocket.addEventListener("message", (event) => {
    console.log("接收到数据", event)
    handleSocketData(JSON.parse(event.data));
  })

  webSocket.addEventListener("close", () => {
    connStore.wsConn = null;
    log("socket已关闭")
  })

  webSocket.addEventListener("error", (error) => {
    log("socket链接出错", error)
    connStore.wsConn = null;
  })
}
</script>

<template>
  <a-row>
    <a-button @click="connWS">链接Golang WebSocket</a-button>
  </a-row>
</template>