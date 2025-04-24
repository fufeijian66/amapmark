import { mysqlTable, serial, varchar, float, int, text } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql';

// 位置标记表
export const markers = mysqlTable('markers', {
  id: serial('id').primaryKey(), // 自增主键
  name: varchar('name', { length: 255 }).notNull(), // 名称
  address: text('address').notNull(), // 详细地址
  longitude: float('longitude').notNull(), // 经度
  latitude: float('latitude').notNull(), // 纬度
  importance: int('importance').default(0), // 关注级别
  remark: text('remark'), // 备注
  createdAt: varchar('created_at', { length: 50 }).notNull().default(sql`CURRENT_TIMESTAMP`), // 创建时间
  updatedAt: varchar('updated_at', { length: 50 }).notNull().default(sql`CURRENT_TIMESTAMP`), // 更新时间
}); 