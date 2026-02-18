import { NextResponse } from 'next/server'
import { getAllProjects } from '@/lib/projects'

/**
 * GET /api/projects
 * 获取所有 Claude Code 项目列表
 */
export async function GET() {
  try {
    const projects = getAllProjects()

    return NextResponse.json({
      success: true,
      projects,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: '获取项目列表失败',
      },
      { status: 500 }
    )
  }
}
