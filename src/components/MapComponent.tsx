"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Marker } from '@/types/marker';

// 定义搜索结果类型接口
interface SearchTip {
  name: string;
  district: string;
  address: string;
  location?: {
    lng: number;
    lat: number;
  };
}

interface MapComponentProps {
  markers: Marker[];
  onAddMarker: (marker: Omit<Marker, 'id'>) => void;
  onSelectMarker: (marker: Marker) => void;
}

const MapComponent = forwardRef<any, MapComponentProps>(({ markers, onAddMarker, onSelectMarker }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [AMap, setAMap] = useState<any>(null);
  const markerLayerRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchTip[]>([]);
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; lng: number; lat: number } | null>(null);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    locateMarker: (marker: Marker) => {
      if (map) {
        map.setCenter([marker.longitude, marker.latitude]);
        map.setZoom(16);
      }
    }
  }));

  // 初始化地图
  useEffect(() => {
    if (!window) return;

    // 配置高德地图安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || '',
    };

    // 加载高德地图API
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
            'AMap.PlaceSearch',
            'AMap.DistrictSearch'
          ],
        });

        setAMap(AMapInstance);

        // 创建地图实例
        if (mapContainerRef.current) {
          const mapInstance = new AMapInstance.Map(mapContainerRef.current, {
            viewMode: '2D',
            zoom: 18,
            center: [120.169536, 29.330437],
            resizeEnable: true,
            mapStyle: 'satellite',
            layers: [
              new AMapInstance.TileLayer.Satellite(),
              new AMapInstance.TileLayer.RoadNet()
            ]
          });

          // 添加工具条
          mapInstance.addControl(new AMapInstance.ToolBar());
          // 添加比例尺
          mapInstance.addControl(new AMapInstance.Scale());

          // 创建标记图层
          const layer = new AMapInstance.OverlayGroup();
          markerLayerRef.current = layer;
          mapInstance.add(layer);

          // 地图右键事件 - 显示上下文菜单
          mapInstance.on('rightclick', (e: any) => {
            const { lng, lat } = e.lnglat;
            setContextMenu({
              x: e.pixel.x,
              y: e.pixel.y,
              lng,
              lat
            });
          });

          // 点击地图其他区域时关闭上下文菜单
          mapInstance.on('click', () => {
            setContextMenu(null);
          });

          // 初始化行政区域边界显示
          const districtSearch = new AMapInstance.DistrictSearch({
            level: 'district',
            subdistrict: 0
          });

          // 获取当前地图中心点所在区域
          mapInstance.on('moveend', () => {
            const center = mapInstance.getCenter();
            districtSearch.search(center, (status: string, result: any) => {
              if (status === 'complete') {
                const bounds = result.districtList[0].boundaries;
                if (bounds) {
                  // 清除之前的边界
                  mapInstance.remove(markerLayerRef.current);
                  
                  // 创建新的边界
                  const polygon = new AMapInstance.Polygon({
                    path: bounds,
                    strokeWeight: 2,
                    strokeColor: '#FF0000',
                    fillColor: '#FF0000',
                    fillOpacity: 0.1
                  });
                  
                  // 将边界添加到地图
                  polygon.setMap(mapInstance);
                }
              }
            });
          });

          setMap(mapInstance);
        }
      } catch (error) {
        console.error('Failed to load AMap:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMap();

    // 清理函数
    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, []);

  // 更新地图上的标记点
  useEffect(() => {
    if (!map || !AMap || !markerLayerRef.current) return;

    // 清除之前的标记
    markerLayerRef.current.clearOverlays();

    // 遍历markers，为每个marker创建标记
    markers.forEach((marker) => {
      const aMapMarker = new AMap.Marker({
        position: [marker.longitude, marker.latitude],
        title: marker.name,
        icon: new AMap.Icon({
          size: new AMap.Size(32, 32),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
          imageSize: new AMap.Size(32, 32)
        }),
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
    });
  }, [map, AMap, markers, onSelectMarker]);

  // 处理搜索框显示
  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible);
    setSearchResult([]);
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  // 处理搜索
  const handleSearch = () => {
    if (!AMap || !searchInputRef.current || !searchInputRef.current.value) return;

    const value = searchInputRef.current.value;
    
    // 使用AMap.plugin加载AutoComplete插件
    AMap.plugin(['AMap.AutoComplete'], function() {
      // 创建搜索插件实例（注意是AutoComplete而不是Autocomplete）
      const autoComplete = new AMap.AutoComplete({
        city: '全国'
      });
      
      // 进行搜索
      autoComplete.search(value, (status: string, result: { tips?: SearchTip[] }) => {
        if (status === 'complete' && result.tips) {
          setSearchResult(result.tips);
        }
      });
    });
  };

  // 处理搜索结果项点击
  const handleSearchItemClick = (item: SearchTip) => {
    if (!map || !item.location) return;
    
    // 将地图中心设置到搜索位置
    map.setCenter([item.location.lng, item.location.lat]);
    map.setZoom(15);
    
    // 清空搜索结果
    setSearchResult([]);
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  };

  // 展示标记信息窗口
  const showMarkerInfoWindow = (existingMarker: Marker | null, lng?: number, lat?: number) => {
    if (!map || !AMap) return;

    // 创建信息窗口内容
    const content = document.createElement('div');
    content.className = 'marker-info-window';

    // 窗口HTML内容
    content.innerHTML = `
      <div class="p-4 min-w-[300px]">
        <h3 class="font-bold text-lg mb-3">${existingMarker ? '编辑标记' : '添加新标记'}</h3>
        <form id="markerForm">
          <div class="mb-3">
            <label class="block mb-1">名称</label>
            <input type="text" id="name" class="w-full border p-2 rounded" value="${existingMarker?.name || ''}" />
          </div>
          <div class="mb-3">
            <label class="block mb-1">详细地址</label>
            <input type="text" id="address" class="w-full border p-2 rounded" value="${existingMarker?.address || ''}" />
          </div>
          <div class="mb-3">
            <label class="block mb-1">关注级别</label>
            <select id="importance" class="w-full border p-2 rounded">
              ${[0, 1, 2, 3, 4, 5].map(level => 
                `<option value="${level}" ${existingMarker?.importance === level ? 'selected' : ''}>${level}</option>`
              ).join('')}
            </select>
          </div>
          <div class="mb-3">
            <label class="block mb-1">备注</label>
            <textarea id="remark" class="w-full border p-2 rounded">${existingMarker?.remark || ''}</textarea>
          </div>
          <div class="mb-3">
            <label class="block mb-1">坐标</label>
            <div class="flex gap-2">
              <input type="text" id="longitude" class="w-1/2 border p-2 rounded" readonly value="${lng || existingMarker?.longitude || ''}" />
              <input type="text" id="latitude" class="w-1/2 border p-2 rounded" readonly value="${lat || existingMarker?.latitude || ''}" />
            </div>
          </div>
          <div class="flex justify-between">
            <button type="button" id="cancelBtn" class="px-4 py-2 border rounded">取消</button>
            <button type="submit" id="saveBtn" class="px-4 py-2 bg-blue-500 text-white rounded">保存</button>
          </div>
        </form>
      </div>
    `;

    // 创建信息窗口实例
    const infoWindow = new AMap.InfoWindow({
      content: content,
      offset: new AMap.Pixel(0, -30)
    });

    // 打开信息窗口
    infoWindow.open(map, existingMarker ? 
      [existingMarker.longitude, existingMarker.latitude] : 
      [lng, lat]);

    // 表单提交处理
    const handleFormSubmit = (e: Event) => {
      e.preventDefault();
      const nameEl = document.getElementById('name') as HTMLInputElement;
      const addressEl = document.getElementById('address') as HTMLInputElement;
      const importanceEl = document.getElementById('importance') as HTMLSelectElement;
      const remarkEl = document.getElementById('remark') as HTMLTextAreaElement;
      const longitudeEl = document.getElementById('longitude') as HTMLInputElement;
      const latitudeEl = document.getElementById('latitude') as HTMLInputElement;

      // 验证表单
      if (!nameEl.value || !addressEl.value) {
        alert('名称和地址不能为空');
        return;
      }

      // 创建新标记数据
      const newMarker = {
        ...(existingMarker || {}),
        name: nameEl.value,
        address: addressEl.value,
        importance: parseInt(importanceEl.value),
        remark: remarkEl.value,
        longitude: parseFloat(longitudeEl.value),
        latitude: parseFloat(latitudeEl.value),
      };

      // 添加或更新标记
      if (existingMarker) {
        // 这里应该调用更新标记的接口，但由于我们当前的例子是通过父组件传入的方法来处理，所以先略过
      } else {
        // 添加新标记
        onAddMarker(newMarker);
      }

      // 关闭信息窗口
      infoWindow.close();
    };

    // 取消按钮处理
    const handleCancel = () => {
      infoWindow.close();
    };

    // 绑定事件
    setTimeout(() => {
      const form = document.getElementById('markerForm');
      const cancelBtn = document.getElementById('cancelBtn');
      
      if (form) {
        form.addEventListener('submit', handleFormSubmit);
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancel);
      }
    }, 100);
  };

  return (
    <div 
      className="relative w-full h-full"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 地图容器 */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full" 
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* 加载状态 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">加载中...</p>
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <div 
          className="absolute bg-white rounded-md shadow-lg z-20"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y 
          }}
        >
          <button
            className="px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => {
              showMarkerInfoWindow(null, contextMenu.lng, contextMenu.lat);
              setContextMenu(null);
            }}
          >
            创建标记
          </button>
        </div>
      )}
      
      {/* 搜索框 */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSearchToggle}
          className="bg-white p-2 rounded-full shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        {searchVisible && (
          <div className="absolute right-0 mt-2 bg-white rounded-md shadow-lg w-72">
            <div className="p-2 flex">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="搜索地址..."
                className="flex-1 p-2 border rounded-l-md focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-3 rounded-r-md"
              >
                搜索
              </button>
            </div>
            
            {/* 搜索结果列表 */}
            {searchResult.length > 0 && (
              <ul className="max-h-96 overflow-y-auto">
                {searchResult.map((item, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-t"
                    onClick={() => handleSearchItemClick(item)}
                  >
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.district}{item.address}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent; 