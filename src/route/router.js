import {createRouter, createWebHashHistory} from "vue-router";
import routes from "./routes.js";

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

router.beforeEach((to, from, next) => {
    next();
});

export default router;