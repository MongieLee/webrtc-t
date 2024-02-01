<script setup>
import {useRouter} from "vue-router";

const router = useRouter();
const toLoginPage = () => {
  router.push({path: "/login"})
}
</script>

<template>
  <a-button @click="toLoginPage">去登陆页</a-button>
  <router-view/>
</template>

<style scoped>
</style>
