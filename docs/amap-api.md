# 高德地图API使用说明

本文档介绍了本项目中使用的高德地图API的核心功能和配置方法。

## 申请高德地图API密钥

1. 访问[高德开放平台](https://lbs.amap.com/)
2. 注册并登录
3. 在控制台中创建新应用，应用类别选择"Web端(JS API)"
4. 获取API Key和安全密钥
5. 配置白名单（可选，开发环境可配置为"*"）

## 配置密钥

在项目根目录创建`.env.local`文件，添加以下配置：

```
NEXT_PUBLIC_AMAP_KEY=your_amap_key_here
NEXT_PUBLIC_AMAP_SECURITY_CODE=your_amap_security_code_here
```

## 安全密钥配置

为了保证高德地图API的安全使用，我们在`src/app/layout.tsx`中添加了安全密钥配置：

```tsx
<head>
  {/* 配置高德地图安全密钥 */}
  <script dangerouslySetInnerHTML={{
    __html: `
      window._AMapSecurityConfig = {
        securityJsCode: '${process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || ''}'
      }
    `
  }} />
</head>
```

## 地图组件实现

我们使用`@amap/amap-jsapi-loader`加载高德地图API，核心加载代码如下：

```tsx
const loadMap = async () => {
  try {
    setLoading(true);
    const AMapLoader = (await import('@amap/amap-jsapi-loader')).default;
    const AMapInstance = await AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY || '',
      version: '2.0',
      plugins: [
        'AMap.ToolBar',
        'AMap.Scale',
        'AMap.HawkEye',
        'AMap.Geolocation',
        'AMap.Autocomplete',
        'AMap.PlaceSearch'
      ],
    });

    // 创建地图实例
    const mapInstance = new AMapInstance.Map(mapContainerRef.current, {
      viewMode: '2D',
      zoom: 11,
      resizeEnable: true,
    });

    // ...
  } catch (error) {
    console.error('Failed to load AMap:', error);
  } finally {
    setLoading(false);
  }
};
```

## 主要功能实现

### 地图初始化

```tsx
// 创建地图实例
const mapInstance = new AMapInstance.Map(mapContainerRef.current, {
  viewMode: '2D',
  zoom: 11,
  resizeEnable: true,
});

// 添加工具条
mapInstance.addControl(new AMapInstance.ToolBar());
// 添加比例尺
mapInstance.addControl(new AMapInstance.Scale());
```

### 搜索地址

```tsx
const handleSearch = () => {
  if (!AMap || !searchInputRef.current || !searchInputRef.current.value) return;

  const value = searchInputRef.current.value;
  
  // 创建搜索插件实例
  const autoComplete = new AMap.Autocomplete({
    city: '全国'
  });
  
  // 进行搜索
  autoComplete.search(value, (status: string, result: any) => {
    if (status === 'complete' && result.tips) {
      setSearchResult(result.tips);
    }
  });
};
```

### 创建标记点

```tsx
// 创建标记
const aMapMarker = new AMap.Marker({
  position: [marker.longitude, marker.latitude],
  title: marker.name,
  label: {
    content: marker.name,
    direction: 'top'
  },
});

// 点击标记事件
aMapMarker.on('click', () => {
  onSelectMarker(marker);
});

// 将标记添加到图层
markerLayerRef.current.addOverlay(aMapMarker);
```

### 双击地图添加新标记

```tsx
// 地图双击事件 - 添加新标记
mapInstance.on('dblclick', (e: any) => {
  const { lng, lat } = e.lnglat;
  showMarkerInfoWindow(null, lng, lat);
});
```

### 信息窗体

```tsx
// 创建信息窗口实例
const infoWindow = new AMap.InfoWindow({
  content: content,
  offset: new AMap.Pixel(0, -30)
});

// 打开信息窗口
infoWindow.open(map, [lng, lat]);
```

## 关键API参考

### 地图初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| viewMode | string | 视图模式，可选2D和3D |
| zoom | number | 地图缩放级别，范围3-18 |
| center | [number, number] | 地图中心点坐标，格式为[经度, 纬度] |
| resizeEnable | boolean | 是否自动监控地图容器尺寸变化 |

### 常用插件

| 插件名称 | 说明 |
|---------|------|
| AMap.ToolBar | 地图工具条，包含缩放和平移工具 |
| AMap.Scale | 地图比例尺 |
| AMap.HawkEye | 鹰眼控件，显示缩略地图 |
| AMap.Geolocation | 定位功能 |
| AMap.Autocomplete | 输入提示，根据输入关键字提示地点 |
| AMap.PlaceSearch | 地点搜索服务 |

### 事件系统

| 事件名称 | 说明 |
|---------|------|
| click | 单击地图事件 |
| dblclick | 双击地图事件 |
| rightclick | 右键单击地图事件 |
| mousemove | 鼠标在地图上移动事件 |
| mousewheel | 鼠标滚轮事件 |
| dragstart | 开始拖拽地图事件 |
| dragging | 拖拽地图过程事件 |
| dragend | 结束拖拽地图事件 |

## 调试技巧

1. 使用控制台检查地图加载状态
2. 验证API Key和安全密钥是否正确配置
3. 检查网络请求，确保地图API请求成功
4. 使用浏览器开发者工具的Elements面板检查地图容器尺寸

## 常见问题

### 地图加载失败

- 检查网络连接
- 验证API Key和安全密钥
- 确认是否配置了正确的白名单

### 标记点无法显示

- 检查坐标是否正确
- 验证图层是否正确添加到地图上
- 确认标记点是否被添加到了图层中

### 搜索功能不工作

- 确认AMap.Autocomplete插件已正确加载
- 检查搜索参数是否正确

## 参考链接

- [高德地图JavaScript API参考手册](https://lbs.amap.com/api/javascript-api/reference/core)
- [高德地图JavaScript API示例中心](https://lbs.amap.com/demo/javascript-api/example/map-lifecycle/map-show)
- [高德地图API错误码](https://lbs.amap.com/api/javascript-api/reference/errorcode) 