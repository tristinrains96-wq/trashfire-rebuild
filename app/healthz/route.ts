import { NextResponse } from 'next/server'
import { groqPing } from '@/lib/utils'

export async function GET() {
  const services: string[] = ['web']
  const groqStatus = await groqPing()
  
  if (groqStatus) {
    services.push('groq')
  }

  return NextResponse.json({ 
    status: 'ok', 
    services,
    groq: groqStatus ? 'online' : 'stub' 
  })
}
