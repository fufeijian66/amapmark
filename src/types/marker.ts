export interface Marker {
  id: number;
  name: string; // 标记名称
  address: string; // 详细地址
  longitude: number; // 经度
  latitude: number; // 纬度
  importance: number; // 关注级别
  remark?: string; // 备注
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
} 