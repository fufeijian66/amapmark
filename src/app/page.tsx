"use client";

import { useEffect, useState, useRef } from "react";
import MapComponent from "@/components/MapComponent";
import { MarkerList } from "@/components/MarkerList";
import { Marker } from "@/types/marker";

export default function Home() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const mapRef = useRef<any>(null);

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
    <main className="flex h-screen w-full">
      {/* 地图区域 */}
      <div className="w-3/4 h-full">
        <MapComponent
          ref={mapRef}
          markers={markers}
          onAddMarker={handleAddMarker}
          onSelectMarker={setSelectedMarker}
        />
      </div>

      {/* 列表区域 */}
      <div className="w-1/4 h-full overflow-auto border-l">
        <MarkerList
          markers={markers}
          loading={loading}
          selectedMarker={selectedMarker}
          onSelectMarker={handleMarkerSelect}
          onUpdateMarker={handleUpdateMarker}
          onDeleteMarker={handleDeleteMarker}
        />
      </div>
    </main>
  );
}
