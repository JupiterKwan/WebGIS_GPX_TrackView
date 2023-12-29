import {createApp} from 'vue';
import App from './App.vue';
import router from './router.js';
// import axios from 'axios';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import Particles from 'particles.vue3';
import {ElMessage} from 'element-plus';

const app = createApp(App);

app.use(router);
app.use(Particles);

// 全局错误处理函数
app.config.errorHandler = (err, vm, info) => {
    // 判断错误是否为401
    if (err.response && err.response.status === 401) {
        // 处理401错误逻辑，比如跳转到登录页
        console.log('处理401错误: 登陆超时');
        ElMessage.error("登陆超时！请重新登录！");
        router.push('/');
    } else {
        // 处理其他错误逻辑
        console.log('其他错误');
        console.log(err);
        ElMessage.error("系统内部错误！");
    }
};

app.use(ElementPlus).mount('#app');

