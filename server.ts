import express from 'express';
import dotenv from 'dotenv';

dotenv.config(); // 加载 .env 文件中的环境变量

const app = express();
const port = process.env.PORT || 3001; // 从环境变量读取端口或使用默认值

app.use(express.json()); // 解析 JSON 请求体
app.use(express.static('.')); // 托管前端静态文件 (index.html, style.css, script.js)

// ---- API 路由 ----

// 获取地点列表 (支持分页、搜索、排序)
app.get('/api/locations', (req, res) => {
    // TODO: 实现数据库查询逻辑 (Drizzle ORM)
    // 解析查询参数: req.query.page, req.query.limit, req.query.search, req.query.sort
    console.log('Query Params:', req.query);

    // 暂时返回模拟数据
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const searchParams = {
        search: req.query.search as string,
        sort: req.query.sort as string
    };
    const mockData = generateMockData(page, limit, searchParams); // 使用前端的模拟数据函数 (仅用于演示)

    res.json(mockData);
});

// 添加新地点
app.post('/api/locations', (req, res) => {
    // TODO: 实现数据库插入逻辑 (Drizzle ORM)
    const newLocation = req.body;
    console.log('Adding Location:', newLocation);
    // 假设插入成功，返回新数据（需要包含数据库生成的 ID）
     newLocation.id = Date.now().toString(); // 模拟生成ID
    res.status(201).json(newLocation);
});

// 更新地点信息
app.put('/api/locations/:id', (req, res) => {
    // TODO: 实现数据库更新逻辑 (Drizzle ORM)
    const { id } = req.params;
    const updatedData = req.body;
    console.log(`Updating Location ${id}:`, updatedData);
     // 假设更新成功
    res.json({ ...updatedData, id });
});

// 删除地点
app.delete('/api/locations/:id', (req, res) => {
    // TODO: 实现数据库删除逻辑 (Drizzle ORM)
    const { id } = req.params;
    console.log(`Deleting Location ${id}`);
    // 假设删除成功
    res.status(204).send(); // No Content
});

// 导出地点列表 (Excel)
app.get('/api/locations/export', (req, res) => {
    // TODO: 实现导出逻辑
    // 1. 获取需要导出的数据（可能需要根据查询参数过滤）
    // 2. 使用 xlsx 库生成 Excel 文件 buffer
    // 3. 设置正确的响应头 (Content-Type, Content-Disposition)
    // 4. 发送 buffer
    console.log('Exporting locations with params:', req.query);
    res.status(501).send('Export not implemented yet.'); // 501 Not Implemented
});

// 导入地点 (Excel)
app.post('/api/locations/import', (req, res) => {
    // TODO: 实现导入逻辑
    // 1. 处理文件上传 (需要配置 multer 或类似中间件)
    // 2. 使用 xlsx 库解析 Excel 文件
    // 3. 将数据存入数据库
    // 4. 返回导入结果 (成功数量、失败数量等)
    console.log('Importing locations...');
    res.status(501).send('Import not implemented yet.'); // 501 Not Implemented
});


// ---- 启动服务器 ----
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});


// --- 模拟数据生成函数 (复制自前端，仅用于后端 API 演示) ---
// 定义参数类型 (为了配合 TypeScript)
interface SearchParams {
    search?: string;
    sort?: string;
}

function generateMockData(page: number, limit: number, params: SearchParams) {
    const mockLocations = [];
    const startId = (page - 1) * limit + 1;
    for (let i = 0; i < limit; i++) {
        const id = startId + i;
        const mockName = `服务器模拟地点 ${id}`;
        const mockNotes = `这是服务器地点 ${id} 的备注`;
         if (params.search) {
             const searchTerm = params.search.toLowerCase();
             if (!mockName.toLowerCase().includes(searchTerm) && !mockNotes.toLowerCase().includes(searchTerm)) {
                 continue;
             }
         }
        mockLocations.push({
            id: id.toString(),
            name: mockName,
            address: `服务器模拟地址 - ${id} 号`,
            latitude: 39.90923 + (Math.random() - 0.5) * 0.1 * page,
            longitude: 116.397428 + (Math.random() - 0.5) * 0.1 * page,
            importance_level: Math.ceil(Math.random() * 5),
            notes: mockNotes
        });
    }
    if(params.sort === 'level-asc') {
        mockLocations.sort((a, b) => a.importance_level - b.importance_level);
    } else if (params.sort === 'level-desc') {
        mockLocations.sort((a, b) => b.importance_level - a.importance_level);
    }
    const hasMore = page < 5; // 假设最多5页模拟数据
    return { locations: mockLocations, hasMore };
} 