import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export default function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    deployed_at: new Date().toISOString(),
    message: "Nếu mã commit này khớp với GitHub, code của bạn đã được deploy."
  })
}
