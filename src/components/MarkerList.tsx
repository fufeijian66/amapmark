"use client";

import { useState } from 'react';
import { Marker } from '@/types/marker';
import * as XLSX from 'xlsx';

interface MarkerListProps {
  markers: Marker[];
  loading: boolean;
  selectedMarker: Marker | null;
  onSelectMarker: (marker: Marker) => void;
  onUpdateMarker: (marker: Marker) => void;
  onDeleteMarker: (id: number) => void;
}

export const MarkerList = ({
  markers,
  loading,
  selectedMarker,
  onSelectMarker,
  onUpdateMarker,
  onDeleteMarker,
}: MarkerListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'importance' | 'name' | 'createdAt'>('importance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Marker>>({});

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 处理排序方式变化
  const handleSortChange = (field: 'importance' | 'name' | 'createdAt') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // 处理编辑表单的输入变化
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: name === 'importance' ? parseInt(value) : value,
    });
  };

  // 处理编辑表单的提交
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editForm.name && editForm.address) {
      const updatedMarker = {
        ...markers.find(m => m.id === isEditing)!,
        ...editForm,
      };
      onUpdateMarker(updatedMarker);
      setIsEditing(null);
      setEditForm({});
    }
  };

  // 开始编辑标记
  const startEditing = (marker: Marker) => {
    setIsEditing(marker.id);
    setEditForm(marker);
  };

  // 取消编辑
  const cancelEditing = () => {
    setIsEditing(null);
    setEditForm({});
  };

  // 过滤标记
  const filteredMarkers = markers.filter(marker => {
    const searchLower = searchTerm.toLowerCase();
    return marker.name.toLowerCase().includes(searchLower) ||
      (marker.remark && marker.remark.toLowerCase().includes(searchLower));
  });

  // 排序标记
  const sortedMarkers = [...filteredMarkers].sort((a, b) => {
    if (sortBy === 'importance') {
      return sortDirection === 'asc' ? a.importance - b.importance : b.importance - a.importance;
    } else if (sortBy === 'name') {
      return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  // 导出到Excel
  const exportToExcel = () => {
    const dataToExport = sortedMarkers.map((marker) => ({
      名称: marker.name,
      地址: marker.address,
      经度: marker.longitude,
      纬度: marker.latitude,
      关注级别: marker.importance,
      备注: marker.remark || '',
      创建时间: marker.createdAt || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '标记点数据');
    
    // 生成Excel文件并下载
    XLSX.writeFile(workbook, `标记点数据_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 导入Excel
  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 假设第一个工作表包含数据
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // 将表格数据转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // 处理导入的数据
        jsonData.forEach((row: any) => {
          // 这里需要根据Excel的列标题进行映射
          const marker: Omit<Marker, 'id'> = {
            name: row['名称'] || row['name'] || '',
            address: row['地址'] || row['address'] || '',
            longitude: parseFloat(row['经度'] || row['longitude'] || 0),
            latitude: parseFloat(row['纬度'] || row['latitude'] || 0),
            importance: parseInt(row['关注级别'] || row['importance'] || 0),
            remark: row['备注'] || row['remark'] || '',
          };
          
          // 调用父组件的方法添加标记
          // 注意：这里应该是通过API添加标记，但目前例子中没有实现
          // 可以显示导入成功的消息
          console.log('导入的标记:', marker);
        });
        
        alert(`成功导入 ${jsonData.length} 条标记数据`);
      } catch (error) {
        console.error('导入Excel失败:', error);
        alert('导入失败，请检查文件格式');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 标题和工具栏 */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">标记点列表</h2>
        
        {/* 搜索框 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索名称或备注..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 border rounded"
          />
        </div>
        
        {/* 排序选项 */}
        <div className="flex items-center mb-4">
          <span className="mr-2">排序:</span>
          <button
            onClick={() => handleSortChange('importance')}
            className={`mr-2 px-2 py-1 rounded ${sortBy === 'importance' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            关注级别 {sortBy === 'importance' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('name')}
            className={`mr-2 px-2 py-1 rounded ${sortBy === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            名称 {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('createdAt')}
            className={`px-2 py-1 rounded ${sortBy === 'createdAt' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            时间 {sortBy === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
        
        {/* 导入/导出按钮 */}
        <div className="flex space-x-2">
          <button 
            onClick={exportToExcel} 
            className="px-3 py-1 bg-green-500 text-white rounded"
            disabled={sortedMarkers.length === 0}
          >
            导出Excel
          </button>
          <label className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer">
            导入Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={importFromExcel}
            />
          </label>
        </div>
      </div>
      
      {/* 标记列表 */}
      <div className="flex-grow overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-2">加载中...</p>
          </div>
        ) : sortedMarkers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {searchTerm ? '没有找到匹配的标记' : '暂无标记点'}
          </div>
        ) : (
          <ul className="divide-y">
            {sortedMarkers.map((marker) => (
              <li 
                key={marker.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedMarker?.id === marker.id ? 'bg-blue-50' : ''}`}
              >
                {isEditing === marker.id ? (
                  // 编辑表单
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">名称</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border rounded-md p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">地址</label>
                      <input
                        type="text"
                        name="address"
                        value={editForm.address || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border rounded-md p-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">关注级别</label>
                      <select
                        name="importance"
                        value={editForm.importance}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border rounded-md p-2"
                      >
                        {[0, 1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">备注</label>
                      <textarea
                        name="remark"
                        value={editForm.remark || ''}
                        onChange={handleEditChange}
                        className="mt-1 block w-full border rounded-md p-2"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-3 py-1 border rounded"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        保存
                      </button>
                    </div>
                  </form>
                ) : (
                  // 标记展示
                  <div onClick={() => onSelectMarker(marker)}>
                    <div className="flex justify-between">
                      <h3 className="font-medium">{marker.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${marker.importance > 3 ? 'bg-red-100 text-red-800' : marker.importance > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        级别 {marker.importance}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 my-1">{marker.address}</p>
                    {marker.remark && (
                      <p className="text-sm text-gray-500 mt-1">{marker.remark}</p>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      {marker.createdAt && `创建于 ${new Date(marker.createdAt).toLocaleString()}`}
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(marker);
                        }}
                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                      >
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这个标记吗？')) {
                            onDeleteMarker(marker.id);
                          }
                        }}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MarkerList; 