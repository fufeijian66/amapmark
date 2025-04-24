import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

// 创建MySQL连接池
const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'amapmark',
});

// 创建Drizzle ORM实例
export const db = drizzle(poolConnection, { schema, mode: 'default' });

// 导出数据表和过滤工具
export { schema, eq }; 