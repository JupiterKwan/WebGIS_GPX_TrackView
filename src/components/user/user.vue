<script setup>
import {defineComponent, getCurrentInstance, onMounted} from 'vue';
import {Map, View} from "ol";
import {GCJ02} from 'ol-proj-ch';
// import { ElMessageBox } from 'element-plus'
import {UploadFilled} from '@element-plus/icons-vue'
import {useRoute} from "vue-router";
//or import GCJ02, BD09 or others
// import {GCJ02} from 'ol-proj-ch'
// import {BD09} from 'ol-proj-ch'
// const code1 = GCJ02.CODE    //the code of GCJ02
// const code2 = BD09.CODE     //the code of BD09

const {appContext} = getCurrentInstance();
const global = appContext.config.globalProperties;


</script>

<template>
    <div>
        <el-dialog v-model="uploadDialogVisible">
            <el-upload
                class="upload-demo"
                drag
                action="#"
                :before-upload="handleBeforeUpload"
                :on-success="handleUploadSuccess"
            >
                <el-icon class="el-icon--upload">
                    <upload-filled/>
                </el-icon>
                <div class="el-upload__text">
                    把文件拖在这里 或 <em>点我上传</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        *请上传GPX文件且文件小于3Mb
                    </div>
                </template>
            </el-upload>
        </el-dialog>
    </div>
    <div>
        <el-container class="container">
            <el-aside width="332px" class="aside">
                <el-space direction="vertical" style="padding-left: 5px; padding-top: 10px">
                    <el-card class="box-card" style="width: 300px; margin: 5px 10px;">
                        <el-row><el-text tag="b" style="padding-left: 10px">地图概况</el-text>
                        </el-row>
                        <el-row style="margin: 5px 10px">
                            <el-col>
                                <el-text tag="a">当前地图级别：</el-text>
                                <el-text tag="a">{{ this.mapZoomLevel }}</el-text>
                            </el-col>
                            <el-col>
                                <el-text tag="a">轨迹总路程：</el-text>
                                <el-text tag="a">{{ this.totalLength }} km</el-text>
                            </el-col>
                            <el-col>
                                <el-text tag="a">轨迹数量：</el-text>
                                <el-text tag="a">{{ this.totalGPXLayer }}</el-text>
                            </el-col>
                        </el-row>
                    </el-card>
                    <el-card class="box-card" style="width: 300px; margin: 5px 10px;">
                        <el-row><el-text tag="b" style="padding-left: 10px">功能操作</el-text></el-row>
                        <el-row style="margin: 5px 10px">
                            <el-button @click="addExampleRoute()">AddExample</el-button>
                            <el-button @click="uploadDialogVisible = true">UploadGPX</el-button>

                        </el-row>
                        <el-row style="margin: 10px 10px 5px 10px">
                            <el-button @click="onLogout()">Logout</el-button>
                        </el-row>
                    </el-card>
                    <el-card class="box-card" style="width: 300px; margin: 5px 10px;">
                        <el-row><el-text tag="b" style="padding-left: 10px">详细信息</el-text></el-row>
                        <el-table :data="layerList" style="width: 100%; height: 450px">
                            <el-table-column label="显示" width="80">
                                <template v-slot:default="scope">
                                    <el-switch
                                        :active-value=true
                                        :inactive-value=false
                                        active-color="#02538C"
                                        inactive-color="#B9B9B9"
                                        :value=scope.row.isShowUp
                                        @change="isShowUPSwitch(scope.row)"/>
                                </template>
                            </el-table-column>
                            <el-table-column prop="length" label="路程(km)" width="85"/>
                            <el-table-column prop="name" label="文件名称" width="180"/>
                        </el-table>
                    </el-card>
                </el-space>
            </el-aside>
            <el-main class="main">
                <div id="mapview"></div>
                <div id="scaleLine"></div>
                <div id="mouseCoor"></div>
            </el-main>
        </el-container>
    </div>
</template>

<script>

import {defineComponent} from "vue";
import {Map, View} from "ol";
import VectorLayer from "ol/layer/Vector.js";
import {GPX} from "ol/format.js";
import TileLayer from "ol/layer/Tile.js";
import {OSM, XYZ} from "ol/source.js";
import VectorSource from "ol/source/Vector.js";
import proj4 from 'proj4';
import {GCJ02} from "ol-proj-ch";
import proj from "proj4/lib/Proj.js";
import {render} from "ol/reproj.js";
import {transform} from "ol/proj.js";
import point from "proj4/lib/Point.js";
import {sphere} from "proj4/lib/deriveConstants.js";
import * as geom from "ol/geom.js";
import {LineString, MultiLineString} from "ol/geom.js";
import {getLength} from "ol/sphere.js";
import {MousePosition, OverviewMap, ScaleLine} from "ol/control.js";
import {createStringXY} from "ol/coordinate.js";
import * as control from "ol/control.js";
import units from "proj4/lib/constants/units.js";
import {Circle, Fill, Stroke, Style} from "ol/style.js";
import {useRoute} from "vue-router";
import {ElMessage} from "element-plus";

export default defineComponent({
    name: 'HelloWorld',
    data() {
        return {
            map: null,
            zoomDisplay: '',
            layerList: [],
            uploadDialogVisible: false,
            mouseCoordinates: '',
            mouseCoor: null,
            trackInfo: null,
            route: null,
            totalLength: 0.0,
            totalGPXLayer: 0,
            mapZoomLevel: null,
        }
    },
    mounted() {
        this.route = useRoute();
        this.mapInit();
        this.handleMouseMove();
        window.addEventListener('mousewheel',this.handleScroll);
        this.mapZoomLevel = this.map.getView().getZoom().toFixed(1);
    },
    methods: {
        onLogout() {
            ElMessage.info("已退出登录！");
            this.$router.push({name: 'login'});
        },
        handleScroll(e) {
            this.mapZoomLevel = this.map.getView().getZoom().toFixed(1);
        },
        mapInit() {
            let scaleLineControl = new ScaleLine({
                units: 'metric',
                target: 'scaleLine',
            });
            this.map = new Map({
                target: 'mapview',
                layers: [],
                view: new View({
                    center: [113, 26],
                    zoom: 2,
                    // maxZoom: 13,
                }),
                controls: control.defaults({
                    zoom: true,
                    rotate: true,
                    attribution: false
                }).extend([
                    scaleLineControl,
                ]),
            });

            const basemapLayer1 = new TileLayer({
                source: new XYZ({
                    // 高德地图在线地图服务
                    // url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
                    name: 'basemap',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' + 'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
                }),
                // projection: GCJ02.CODE,
                maxZoom: 13,
            })
            const basemapLayer2 = new TileLayer({
                source: new OSM(),
                minZoom: 13,
            });
            this.map.addLayer(basemapLayer1);
            this.map.addLayer(basemapLayer2);
        },
        async handleUploadSuccess(response, file) {
            console.log(file.raw);
            await this.loadExampleRoute(file.raw);
        },
        handleBeforeUpload(file) {
            // console.log(file);
            // console.log(file.type);
            if (file.type !== 'application/gpx+xml') {
                this.ElMessage.error('只能上传GPX文件');
                return false;
            }
        },
        handleMouseMove() {
            let mousePositionControl = new MousePosition({
                undefinedHTML: "&nbsp;",
                target: "mouseCoor",
                //坐标格式
                coordinateFormat: createStringXY(5),
                //地图投影坐标系（若未设置则输出为默认投影坐标系下的坐标）
                projection: "EPSG:4326",
                //坐标信息显示样式类名，默认是'ol-mouse-position'
                className: "custom-mouse-position",
            });
            this.map.addControl(mousePositionControl);
        },

        async loadExampleRoute(url) {
            return new Promise(async (resolve, reject) => {
                setTimeout(async () => {
                    const lineStyle = new Style({
                        stroke: new Stroke({
                            color: 'red', // 线段的颜色
                            width: 3, // 线段的宽度
                        })
                    });
                    const gpxLayer = await new VectorLayer({
                        source: new VectorSource({
                            url: url,
                            format: new GPX({}),
                        }),
                        style: lineStyle,
                        projection: 'EPSG:4326',
                        name: url,
                    });
                    this.map.addLayer(gpxLayer);
                    resolve(gpxLayer);
                }, 500);
            })
        },
        addRoute(url) {
            this.loadExampleRoute(url).then(async (gpxLayer) => {
                await gpxLayer.getSource().on('change', () => {
                    console.log(gpxLayer);
                    const extent = gpxLayer.getSource().getExtent();
                    this.map.getView().fit(extent, this.map.getView());
                    let layerData = {
                        isShowUp: true,
                        name: null,
                        length: null,
                    };
                    layerData.isShowUp = true;
                    layerData.name = gpxLayer.getProperties().name;
                    layerData.length = this.calcRouteLength(gpxLayer.getProperties().name);
                    console.log()
                    this.layerList.push(layerData);
                    this.totalLength += parseFloat(layerData.length);
                    this.totalGPXLayer += 1;
                    console.log(layerData);
                    console.log(this.layerList);
                });
            })
        },
        async addExampleRoute() {
            if (this.route.query.name === 'user01') {
                await this.addRoute('src/assets/user01/Zepp20220523230849.gpx');
                await this.addRoute('src/assets/user01/Zepp20220523232853.gpx');
            } else {
                await this.addRoute('src/assets/user02/20220517户外步行.gpx');
                await this.addRoute('src/assets/user02/20220518户外步行.gpx');
                await this.addRoute('src/assets/user02/20220519户外步行.gpx');
            }
        },

        calcRouteLength(name) {
            let gpxLayer = null;
            const layers = this.map.getLayers().getArray();
            for (let i = 0; i < layers.length; i++) {
                if (layers[i].get('name') === name) {
                    gpxLayer = layers[i];
                    break;
                }
            }
            console.log(gpxLayer);
            const features = gpxLayer.getSource().getFeatures();
            if (features.length > 0) {
                const geometry = features[0].getGeometry();
                const length = getLength(geometry);
                console.log(length);
                return (length / 1000).toFixed(3);
            } else {
                return null;
            }
        },
        isShowUPSwitch(row) {
            row.isShowUp = row.isShowUp !== true;
            this.getLayerByName(row.name).setVisible(row.isShowUp);
        },
        getLayerByName(layerName) {
            let layers = this.map.getLayers().getArray();
            for (const layer of layers) {
                if (layer.get("name") === layerName) {
                    return layer;
                }
            }
        },

    },
})

</script>

<style>
html, body {
    margin: 0;
    padding: 0;
}
</style>

<style scoped>
#mapview {
    width: 100%;
    height: 100%;
}

#scaleLine {
    position: absolute;
    bottom: 0;
    left: 332px;
    background-color: rgba(71, 32, 32, 0.3);
    padding: 10px;
    z-index: 1;
}

#mouseCoor {
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.3);
    padding: 10px;
    z-index: 1;
}

.main {
    /*top: 3rem;*/
    /*left: 150px;*/
    width: 100vh;
    padding: 0;
//overflow-y: scroll;
}

.container {
    height: 100vh;
}

.aside {
    background-color: #c6e2ff;
    height: 100vh;
}

</style>
