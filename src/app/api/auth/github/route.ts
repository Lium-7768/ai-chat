import { NextResponse } from 'next/server'
import { getGitHubAuthUrl } from '@/lib/github-oauth'

export async function GET() {
  const authUrl = getGitHubAuthUrl()
  return NextResponse.redirect(authUrl)
}
