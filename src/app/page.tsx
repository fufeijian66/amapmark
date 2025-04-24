"use client";

import { useEffect, useState, useRef } from "react";
import MapComponent from "@/components/MapComponent";
import { MarkerList } from "@/components/MarkerList";
import { Marker } from "@/types/marker";

export default function Home() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const mapRef = useRef<{
    locateMarker: (marker: Marker) => void;
    captureMap: () => Promise<string>;
    getDistrictBoundary: () => Promise<unknown>;
  } | null>(null);
  const [isListVisible, setIsListVisible] = useState(true);

  // 加载标记数据
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await fetch("/api/markers");
        if (response.ok) {
          const data = await response.json();
          setMarkers(data);
        }
      } catch (error) {
        console.error("Failed to fetch markers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  // 处理标记选择
  const handleMarkerSelect = (marker: Marker) => {
    setSelectedMarker(marker);
    if (mapRef.current) {
      mapRef.current.locateMarker(marker);
    }
  };

  // 处理添加新标记
  const handleAddMarker = async (marker: Omit<Marker, "id">) => {
    try {
      const response = await fetch("/api/markers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(marker),
      });

      if (response.ok) {
        const newMarker = await response.json();
        setMarkers((prev) => [...prev, newMarker]);
      }
    } catch (error) {
      console.error("Failed to add marker:", error);
    }
  };

  // 处理更新标记
  const handleUpdateMarker = async (marker: Marker) => {
    try {
      const response = await fetch(`/api/markers/${marker.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(marker),
      });

      if (response.ok) {
        setMarkers((prev) =>
          prev.map((m) => (m.id === marker.id ? marker : m))
        );
      }
    } catch (error) {
      console.error("Failed to update marker:", error);
    }
  };

  // 处理删除标记
  const handleDeleteMarker = async (id: number) => {
    try {
      const response = await fetch(`/api/markers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMarkers((prev) => prev.filter((marker) => marker.id !== id));
        if (selectedMarker?.id === id) {
          setSelectedMarker(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete marker:", error);
    }
  };

  return (
    <main className="flex h-screen w-full relative">
      {/* 隐藏/显示按钮 */}
      <button 
        className={`absolute top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md rounded-r-md p-2 border border-gray-300 transition-all ${isListVisible ? 'right-1/4' : 'right-0'}`}
        onClick={() => setIsListVisible(!isListVisible)}
        title={isListVisible ? "隐藏列表" : "显示列表"}
      >
        {isListVisible ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      
      {/* 地图区域 */}
      <div className={`h-full transition-all duration-300 ${isListVisible ? 'w-3/4' : 'w-full'}`}>
        <MapComponent
          ref={mapRef}
          markers={markers}
          onAddMarker={handleAddMarker}
          onSelectMarker={setSelectedMarker}
        />
      </div>

      {/* 列表区域 */}
      <div className={`h-full overflow-auto border-l transition-all duration-300 ${isListVisible ? 'w-1/4' : 'w-0 opacity-0 overflow-hidden'}`}>
        <MarkerList
          markers={markers}
          loading={loading}
          selectedMarker={selectedMarker}
          onSelectMarker={handleMarkerSelect}
          onUpdateMarker={handleUpdateMarker}
          onDeleteMarker={handleDeleteMarker}
          mapRef={mapRef}
        />
      </div>
    </main>
  );
}
