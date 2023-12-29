<template>
    <div class="particles">
        <div class="login-page">
            <div class="login-box">
                <el-form ref="loginForm" :model="loginFormData" :rules="loginFormRules" label-width="80px">
                    <h2>登录</h2>
                    <el-form-item label="账号" prop="uid">
                        <el-input v-model="loginFormData.uid" style="width: 200px"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="loginFormData.password" show-password style="width: 200px"
                                  type="password"></el-input>
                    </el-form-item>
                    <div style="text-align: -webkit-center">
                        <el-button :disabled="loginFormData.uid === '' || loginFormData.password === ''" type="primary"
                                   @click="onSubmit">登录
                        </el-button>
                        <el-button style="text-align: -webkit-center" @click="onClearForm">清空</el-button>
                    </div>
                </el-form>
            </div>

        </div>
    </div>

</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {ElForm, ElFormItem, ElInput, ElButton, ElMessage} from 'element-plus';

export default defineComponent({
    name: 'LoginPage',
    components: {
        ElForm,
        ElFormItem,
        ElInput,
        ElButton,
        ElMessage,
    },
    data() {
        return {
            loginFormData: {
                uid: '',
                password: '',
            },
            loginFormRules: {
                uid: [{required: true, message: '请输入账号', trigger: 'blur'}],
                password: [{required: true, message: '请输入密码', trigger: 'blur'}],
            },
        };
    },
    methods: {
        onClearForm() {
            this.loginFormData.uid = '';
            this.loginFormData.password = '';
        },
        async onSubmit() {
            const user = {
                "uid": this.loginFormData.uid,
                "pwd": this.loginFormData.password
            };
            console.log(user);
            if (this.loginFormData.uid === 'user02') {
                ElMessage.success("您好！user02");
                this.$router.push({
                    path: '/user',
                    query: {
                        name: 'user02'
                    }
                });
            } else if (this.loginFormData.uid === 'user01') {
                ElMessage.success("您好！user01");
                this.$router.push({
                    path: '/user',
                    query: {
                        name: 'user01'
                    }
                });
            } else {
                ElMessage.error("系统内部无此账户！请使用user01或user02登录！");
            }
        },
    },
    setup() {
        const options = {
            background: {
                color: {
                    value: "#000",//粒子颜色
                },
            },
            fpsLimit: 60,
            interactivity: {
                events: {
                    onClick: {
                        enable: true,
                        mode: "push",//可用的click模式有: "push", "remove", "repulse", "bubble"。
                    },
                    onHover: {
                        enable: true,
                        mode: "grab",//可用的hover模式有: "grab", "repulse", "bubble"。
                    },
                    resize: true,
                },
                modes: {
                    bubble: {
                        distance: 400,
                        duration: 2,
                        opacity: 0.9,
                        size: 40,
                    },
                    push: {
                        quantity: 4,
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4,
                    },
                },
            },
            particles: {
                color: {
                    value: "#ffffff",
                },
                links: {
                    color: "#ffffff",//'#dedede'。线条颜色。
                    distance: 160,//线条长度
                    enable: true,//是否有线条
                    opacity: 0.9,//线条透明度。
                    width: 1,//线条宽度。
                },
                collisions: {
                    enable: false,
                },
                move: {
                    direction: "none",
                    enable: true,
                    outMode: "bounce",
                    random: false,
                    speed: 1,//粒子运动速度。
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                        area: 800,
                    },
                    value: 75,//粒子数量。
                },
                opacity: {
                    value: 1,//粒子透明度。
                },
                shape: {
                    type: "circle", //可用的粒子外观类型有："circle","edge","triangle", "polygon","star"
                },
                size: {
                    random: true,
                    value: 5,
                },
            },
            detectRetina: true,
        };
        return {
            options,
        };
    },
});
</script>

<style>
html, body {
    margin: 0;
    padding: 0;
}
</style>

<style scoped>
.login-page {
    background-image: url('./resources/login_background.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    opacity: 0.9;
}

.login-box {
    background-color: rgba(255, 255, 255, 0.6);
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
    opacity: 1;

}

.particles {
    background: rgba(0, 0, 0, 0.7);
    opacity: 0.9;
}

h2 {
    text-align: center;
    margin-bottom: 20px;
}
</style>
