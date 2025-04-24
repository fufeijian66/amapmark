# 数据库设置

本文档介绍了如何设置和配置用于高德地图标记点管理应用的MySQL数据库。

## MySQL安装

如果您尚未安装MySQL，请按照以下步骤安装：

### Windows

1. 从[MySQL官网](https://dev.mysql.com/downloads/installer/)下载MySQL安装包
2. 安装MySQL Server，按照向导完成安装
3. 设置root密码并记住它
4. 完成安装后，确保MySQL服务已启动

### macOS

使用Homebrew安装：

```
brew install mysql
brew services start mysql
```

### Linux (Ubuntu)

```
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

## 数据库创建

1. 登录到MySQL：

```
mysql -u root -p
```

2. 创建数据库：

```sql
CREATE DATABASE amapmark;
```

3. 创建一个用户并授予权限（可选）：

```sql
CREATE USER 'amapuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON amapmark.* TO 'amapuser'@'localhost';
FLUSH PRIVILEGES;
```

## 使用Drizzle ORM创建表结构

本项目使用Drizzle ORM来管理数据库模式和迁移。表结构定义在`src/lib/db/schema.js`文件中：

```javascript
import { mysqlTable, serial, varchar, float, int, text } from 'drizzle-orm/mysql-core';

// 位置标记表
export const markers = mysqlTable('markers', {
  id: serial('id').primaryKey(), // 自增主键
  name: varchar('name', { length: 255 }).notNull(), // 名称
  address: text('address').notNull(), // 详细地址
  longitude: float('longitude').notNull(), // 经度
  latitude: float('latitude').notNull(), // 纬度
  importance: int('importance').default(0), // 关注级别
  remark: text('remark'), // 备注
  createdAt: varchar('created_at', { length: 50 }).notNull().default(() => new Date().toISOString()), // 创建时间
  updatedAt: varchar('updated_at', { length: 50 }).notNull().default(() => new Date().toISOString()), // 更新时间
});
```

## 生成和执行数据库迁移

要应用上述表结构到数据库：

1. 确保`.env.local`中包含了正确的数据库连接信息：

```
DB_HOST=localhost
DB_USER=root    # 或者您创建的用户
DB_PASSWORD=your_password
DB_NAME=amapmark
```

2. 执行推送命令以创建表：

```
npx drizzle-kit push
```

## 表结构详解

### markers表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 自增主键 |
| name | varchar(255) | 标记点名称，不能为空 |
| address | text | 详细地址，不能为空 |
| longitude | float | 经度，不能为空 |
| latitude | float | 纬度，不能为空 |
| importance | int | 关注级别，默认为0 |
| remark | text | 备注信息，可为空 |
| created_at | varchar(50) | 创建时间 |
| updated_at | varchar(50) | 更新时间 |

## 直接SQL创建表（可选）

如果您不想使用Drizzle ORM的迁移功能，也可以直接使用以下SQL创建表：

```sql
USE amapmark;

CREATE TABLE markers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  longitude FLOAT NOT NULL,
  latitude FLOAT NOT NULL,
  importance INT DEFAULT 0,
  remark TEXT,
  created_at VARCHAR(50) NOT NULL,
  updated_at VARCHAR(50) NOT NULL
);
```

## 数据库维护

### 备份数据

```
mysqldump -u root -p amapmark > amapmark_backup.sql
```

### 恢复数据

```
mysql -u root -p amapmark < amapmark_backup.sql
```

## 故障排除

如果遇到连接问题，请检查：

1. MySQL服务是否运行
2. 用户名密码是否正确
3. 数据库名称是否正确
4. 防火墙设置是否允许MySQL连接
5. MySQL配置是否允许远程连接 