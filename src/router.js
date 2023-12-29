import {
    createRouter,
    createWebHashHistory,
} from 'vue-router'
import login from './components/login/login.vue'
import user from './components/user/user.vue'


const routes = [
    {
        path: '/',
        name: 'login',
        component: login
    }, {
        path: '/user',
        name: 'userPage',
        component: user
    }]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router;
