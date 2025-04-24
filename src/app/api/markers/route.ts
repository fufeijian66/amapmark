import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc } from 'drizzle-orm';

// GET /api/markers - 获取所有标记点
export async function GET() {
  try {
    const markers = await db.select().from(schema.markers);
    return NextResponse.json(markers);
  } catch (error) {
    console.error('获取标记点失败:', error);
    return NextResponse.json(
      { error: '获取标记点失败' },
      { status: 500 }
    );
  }
}

// POST /api/markers - 添加新标记点
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 验证必要字段
    if (!data.name || !data.address || data.longitude === undefined || data.latitude === undefined) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }

    // 添加新标记点
    const newMarker = {
      name: data.name,
      address: data.address,
      longitude: data.longitude,
      latitude: data.latitude,
      importance: data.importance || 0,
      remark: data.remark || null,
      // 自动生成时间戳
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 插入记录
    await db.insert(schema.markers).values(newMarker);
    
    // 获取最后一条记录
    const insertedMarkers = await db.select()
      .from(schema.markers)
      .orderBy(desc(schema.markers.id))
      .limit(1);
    
    if (insertedMarkers.length > 0) {
      return NextResponse.json(insertedMarkers[0], { status: 201 });
    } else {
      throw new Error('Failed to retrieve inserted marker');
    }
  } catch (error) {
    console.error('添加标记点失败:', error);
    return NextResponse.json(
      { error: '添加标记点失败' },
      { status: 500 }
    );
  }
} 