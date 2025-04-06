<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader'
defineOptions({ name: 'GaodeMap' });
import startIcon from '@/assets/imgs/start.png'

// 定义 Props，并设置默认值
const props = defineProps({
  center: {
    default: () => [116.397428, 39.90923], // 默认中心点（北京）
  },
  zoom: {
    default: 10, // 默认缩放级别
  },
  markers: {
    default: () => [
      { 
        position: [116.397428, 39.90923], 
        title: '', 
        icon: startIcon ,
        label: { content: '你的位置' }
      }, // 默认一个标记点
    ],
  },
  routes: {
    default: () => [
      {
        points: [],
        color: '#D4AF37'
      }
    ],
  },
  mode: {
    default: 'passenger', // 默认模式
  },
  startPoint: {
    default: undefined,
  },
  endPoint: {
    default: undefined,
  },
  onMarkerClick: {
    default: undefined,
  },
  className: {
    default: '', // 默认无额外类名
  },
});

// 定义 Emits，用于向父组件传递事件
const emit = defineEmits([
  'map-click', 
  'update:startPoint', 
  'update:endPoint', 
  'update:distance',
  'amap-loaded',
]);

// 定义变量
const mapContainer = ref(null);
let map = null;
const markerInstances = ref([]);
const routeInstances = ref([]);
const initMap = async () => {
  try{
    // 设置安全配置
    window._AMapSecurityConfig = {
      securityJsCode: 'be310748cec588839440e8c524b4960c', // 可选
    };
    // 加载高德 SDK
    const AMap = await AMapLoader.load({
      key: '3c4e0b8561ee211e69f3a55f78794dc2',       // 必填
      version: '2.0',          // 指定版本
      plugins: [
        'AMap.Scale', 
        "AMap.Bounds", 
        'AMap.Marker', 
        'AMap.Polyline', 
        'Amap.PlaceSearch', 
        'Amap.AutoComplete',
        'AMap.Geocoder',
        'AMap.Driving'
      ], // 按需加载插件
    });

    // 2. 初始化地图（AMap 已注入类型）
    if (!mapContainer.value) return;
    map = new AMap.Map(mapContainer.value, {
      zoom: props.zoom,
      center: props.center,
      viewMode: '3D',
      mapStyle: 'amap://styles/fresh'
    });

    // map.setLimitBounds(map.getBounds());

    //异步加载控件
    AMap.plugin('AMap.ToolBar',function() { 
      var toolbar = new AMap.ToolBar({ position: "LB", offset: [20, 50] }); //缩放工具条实例化
      map.addControl(toolbar); //添加控件
    });

    AMap.plugin(['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geocoder', 'AMap.Driving'], () => {
      emit('amap-loaded', map); // 插件加载完成后再发出事件
    });

    // 初始加载标记点和路线
    updateMarkers();
    // updateRoutes();

    // 乘客模式：点击地图选择起点/终点
    if (props.mode === 'passenger') {
      map?.on('click', (e) => {
        const { lng, lat } = e.lnglat;
        const position = [lng, lat];
        console.log(`乘客选择位置: [${lng}, ${lat}]`);
        emit('map-click', position); // 通知父组件点击位置
        // 可通过 emit 通知父组件
      });
    }
  } catch(err) {
    console.error('地图加载失败:', err);
  }
}

// 更新标记点
const updateMarkers = () => {
  if (markerInstances.value.length > 0) {
    map.remove(markerInstances.value);
    markerInstances.value = [];
  }

  // 由于已设置默认值，props.markers 一定存在且是数组
  markerInstances.value = props.markers.map((m) => {
    const icon = new AMap.Icon({
      size: new AMap.Size(50, 50), //图标尺寸
      image: m.icon, //Icon 的图像
      imageOffset: new AMap.Pixel(0, 0), //图像相对展示区域的偏移量，适于雪碧图等
      imageSize: new AMap.Size(50, 50), //根据所设置的大小拉伸或压缩图片
    })
    const marker = new AMap.Marker({
      position: new AMap.LngLat(m.position[0], m.position[1]),
      icon: icon,
      title: m.title,
      offset: new AMap.Pixel(-25, -34), //偏移量
    });
    if (props.onMarkerClick) {
      marker.on('click', () => props.onMarkerClick(m));
    }
    return marker;
  });
  if (map) {
    map.add(markerInstances.value);
    // 调整地图视野以包含所有标记点
    if (markerInstances.value.length > 0) {
      map.setFitView(markerInstances.value, false, [50, 50, 50, 50]);
    }
  }
};

// 更新路线
const updateRoutes = () => {
  // 清除旧路线
  if (routeInstances.value.length > 0) {
    console.log('Clearing old routes:', routeInstances.value);
    try {
      // 验证 map 状态
      console.log('Map instance:', map);
      // 验证路线是否在地图上
      const overlays = map.getAllOverlays('polyline');
      console.log('Current polylines on map:', overlays);

      map.remove(routeInstances.value);
    } catch (error) {
      console.error('Failed to remove routes:', error);
      // 备用方案：直接清除地图上的所有覆盖物
      map.clearMap();
      console.log('Cleared map using clearMap');
    }
    routeInstances.value = [];
  }

  // 确保 props.routes 是数组
  const routes = Array.isArray(props.routes) ? props.routes : [];
  if (routes.length === 0) return;

  // 获取第一个路线
  const route = routes[0];
  if (!route) return;

  // 确保 points 是数组
  const paths = Array.isArray(route.points) ? route.points : [];
  if (paths.length === 0) return;

  // 创建新路线
  const polyline = new AMap.Polyline({
    path: paths,
    strokeColor: route.color || '#00f',
    strokeWeight: 8,
    strokeOpacity: 0.8,
    lineJoin: 'round',
    lineCap: 'round'
  });

  // 将新路线添加到数组
  routeInstances.value.push(polyline);

  if (map) {
    map.add(polyline);
    map.setFitView([...markerInstances.value, ...routeInstances.value], false, [50, 50, 50, 50]);
  }
};

// 监听 Props 变化
watch(
  () => props.markers,
  (newMarkers, oldMarkers) => {
    if (JSON.stringify(newMarkers) !== JSON.stringify(oldMarkers)) {
      updateMarkers();
    }
  },
  { deep: true }
);
// 路线
watch(
  () => props.routes,
  (newRoutes, oldRoutes) => {
    if (JSON.stringify(newRoutes) !== JSON.stringify(oldRoutes)) {
      updateRoutes();
    }
  },
  { deep: true }
);
watch(() => props.center, (newCenter) => map?.setCenter(newCenter));
watch(() => props.zoom, (newZoom) => map?.setZoom(newZoom));

// 监听宽高变化
watch(
  () => props.className,
  () => {
    if (map) {
      map.setFitView();
    }
  }
);

// 生命周期钩子
onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.destroy();
  }
});
</script>

<template>
  <div ref="mapContainer" class="h-full" :class="props.className"></div>
</template>

<style scoped></style>
