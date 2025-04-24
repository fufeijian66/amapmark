# 高德地图标记点管理应用

一个基于高德地图API的地标点管理应用，提供地图定位、标记点管理和Excel导入导出功能。

详细文档请查看 [docs/](docs/) 目录。

## 功能特点

- **地图显示**：使用高德地图API展示地图，支持放大缩小和拖动
- **地址搜索**：支持通过搜索框查找地址，自动定位到对应位置
- **标记点管理**：双击地图任意位置添加标记点，包含名称、地址、坐标、关注级别、备注等信息
- **标记点列表**：右侧列表展示所有标记点，支持按关注级别排序和名称搜索
- **标记点编辑**：支持编辑和删除已有标记点
- **数据导入导出**：支持将标记点数据导出为Excel，或从Excel导入标记点数据

## 快速开始

1. 克隆项目
   ```
   git clone <project-repository-url>
   cd amapmark
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 配置环境变量
   - 复制`.env.local.example`为`.env.local`
   - 填写MySQL数据库和高德地图API密钥信息

4. 启动开发服务器
   ```
   npm run dev
   ```

5. 打开浏览器访问`http://localhost:3000`

## 技术栈

- **前端框架**：Next.js 15.3.1
- **地图API**：高德地图JavaScript API 2.0
- **UI组件库**：Ant Design 5.24+
- **数据库**：MySQL
- **ORM工具**：Drizzle ORM
- **Excel处理**：XLSX

## 许可证

[MIT](LICENSE)
