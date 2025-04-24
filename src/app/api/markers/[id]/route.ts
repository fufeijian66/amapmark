import { NextResponse } from 'next/server';
import { db, schema, eq } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/markers/[id] - 获取单个标记点
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的ID' },
        { status: 400 }
      );
    }

    const marker = await db.select()
      .from(schema.markers)
      .where(eq(schema.markers.id, id))
      .limit(1);

    if (marker.length === 0) {
      return NextResponse.json(
        { error: '标记点不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(marker[0]);
  } catch (error) {
    console.error('获取标记点失败:', error);
    return NextResponse.json(
      { error: '获取标记点失败' },
      { status: 500 }
    );
  }
}

// PUT /api/markers/[id] - 更新标记点
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // 验证必要字段
    if (!data.name || !data.address || data.longitude === undefined || data.latitude === undefined) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }

    // 检查记录是否存在
    const existingMarker = await db.select()
      .from(schema.markers)
      .where(eq(schema.markers.id, id))
      .limit(1);

    if (existingMarker.length === 0) {
      return NextResponse.json(
        { error: '标记点不存在' },
        { status: 404 }
      );
    }

    // 更新标记点
    const updatedMarker = {
      name: data.name,
      address: data.address,
      longitude: data.longitude,
      latitude: data.latitude,
      importance: data.importance !== undefined ? data.importance : existingMarker[0].importance,
      remark: data.remark !== undefined ? data.remark : existingMarker[0].remark,
      updatedAt: new Date().toISOString(),
    };

    await db.update(schema.markers)
      .set(updatedMarker)
      .where(eq(schema.markers.id, id));

    // 获取更新后的记录
    const updatedRecord = await db.select()
      .from(schema.markers)
      .where(eq(schema.markers.id, id))
      .limit(1);

    return NextResponse.json(updatedRecord[0]);
  } catch (error) {
    console.error('更新标记点失败:', error);
    return NextResponse.json(
      { error: '更新标记点失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/markers/[id] - 删除标记点
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的ID' },
        { status: 400 }
      );
    }

    // 检查记录是否存在
    const existingMarker = await db.select()
      .from(schema.markers)
      .where(eq(schema.markers.id, id))
      .limit(1);

    if (existingMarker.length === 0) {
      return NextResponse.json(
        { error: '标记点不存在' },
        { status: 404 }
      );
    }

    // 删除记录
    await db.delete(schema.markers)
      .where(eq(schema.markers.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除标记点失败:', error);
    return NextResponse.json(
      { error: '删除标记点失败' },
      { status: 500 }
    );
  }
} 