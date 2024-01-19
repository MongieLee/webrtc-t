<template>
  <div style="height: 100vh;display: flex;align-items: center;justify-content: center">
    <a-form :model="formState"
            name="basic"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 16 }"
            autocomplete="off"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
    >
      <a-form-item
        label="用户名"
        name="username"
        :rules="[{ required: true, message: '请输入用户名' }]"
      >
        <a-input v-model:value="formState.username"/>
      </a-form-item>

      <a-form-item label="房间号" name="roomId"
                   :rules="[{ required: true, message: '请输入房间号' }]">
        <a-input v-model:value="formState.roomId"/>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">进入应用</a-button>
      </a-form-item>
    </a-form>
  </div>

</template>
<script setup>
import {reactive} from 'vue';
import useUserStore from "../store/user.js";
import {useRouter} from "vue-router";

const userStore = useUserStore()
const router = useRouter();
const formState = reactive({
  username: '',
  roomId: '',
});
const onFinish = values => {
  console.log('Success:', values);
  userStore.userInfo.id = values.username;
  userStore.userInfo.roomId = values.roomId;
  console.log(userStore.userInfo)
  router.push({path: "/"});
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
</script>