import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    // Mock response - ignore incoming text for now
    const mockResponse = {
      scenes: [
        { 
          id: "s1", 
          title: "Rooftop Intro", 
          location: "City Rooftop", 
          timeOfDay: "Night", 
          speakers: ["Rin", "Daichi"], 
          estDurationSec: 42 
        },
        { 
          id: "s2", 
          title: "Hallway Standoff", 
          location: "School Hallway", 
          timeOfDay: "Day", 
          speakers: ["Rin", "Vice Principal"], 
          estDurationSec: 55 
        },
        { 
          id: "s3", 
          title: "Street Chase", 
          location: "Shopping District", 
          timeOfDay: "Sunset", 
          speakers: ["Rin", "Daichi"], 
          estDurationSec: 70 
        }
      ],
      detectedCharacters: ["Rin", "Daichi", "Vice Principal"],
      detectedLocations: ["City Rooftop", "School Hallway", "Shopping District"],
      beats: [
        { sceneId: "s1", t: 0, type: "establish" },
        { sceneId: "s1", t: 8, type: "two-shot" },
        { sceneId: "s1", t: 18, type: "close-up" },
        { sceneId: "s2", t: 0, type: "establish" },
        { sceneId: "s2", t: 12, type: "close-up" },
        { sceneId: "s3", t: 0, type: "establish" },
        { sceneId: "s3", t: 15, type: "wide-shot" }
      ]
    }
    
    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error('Script analyze error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze script' },
      { status: 500 }
    )
  }
}
