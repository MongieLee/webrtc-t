import {defineStore} from "pinia";
import {ref} from "vue";
import LWebrtc from "../services/LWebrtc.js";

const useConnStore = defineStore("conn", () => {
    const wsConn = ref();
    const localPr = ref()
    const connInfo = ref({
        roomId: null,
        roomUsers: []
    })

    return {
        wsConn, localPr, connInfo
    }
});
export default useConnStore;