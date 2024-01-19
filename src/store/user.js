import {defineStore} from "pinia";
import {reactive, ref} from "vue";

const useUserStore = defineStore("user", () => {
    const userInfo = reactive({
        id: null,
        roomId: null,
    })
    const otherUsers = ref([]);
    return {userInfo, otherUsers}
});
export default useUserStore;