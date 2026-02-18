import { NextResponse } from 'next/server'
import { getSessionDetail } from '@/lib/projects'

/**
 * GET /api/session/[sessionId]?projectPath=xxx
 * 获取单个会话的详细信息
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const { searchParams } = new URL(request.url)
    const projectPath = searchParams.get('projectPath')

    if (!projectPath) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 projectPath 参数',
        },
        { status: 400 }
      )
    }

    const decodedProjectPath = decodeURIComponent(projectPath)
    const decodedSessionId = decodeURIComponent(sessionId)
    const session = getSessionDetail(decodedSessionId, decodedProjectPath)

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: '会话不存在',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: '获取会话详情失败',
      },
      { status: 500 }
    )
  }
}
