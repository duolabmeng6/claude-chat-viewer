import { NextResponse } from 'next/server'
import { getProjectSessions } from '@/lib/projects'

/**
 * GET /api/sessions/[projectPath]
 * 获取某个项目的所有会话
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectPath: string }> }
) {
  try {
    const { projectPath } = await params
    const decodedPath = decodeURIComponent(projectPath)
    const sessions = getProjectSessions(decodedPath)

    return NextResponse.json({
      success: true,
      sessions,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: '获取会话列表失败',
      },
      { status: 500 }
    )
  }
}
