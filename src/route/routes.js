const routes = [
    {
        path: "/",
        name: "home",
        component: () => import("../pages/Index.vue")
    },
    {
        path: "/login",
        name: "goodsDetail",
        component: () => import("../pages/Login.vue")
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: to => {
            return {path: '/'}
        },
    }
]

export default routes;