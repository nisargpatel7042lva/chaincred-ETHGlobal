/* Backend Health Check API */
import { NextResponse } from "next/server"
import { backendServices } from "@/lib/backend-services"

export async function GET() {
  try {
    const health = backendServices.getServiceHealth()
    
    return NextResponse.json({
      status: health.overall,
      timestamp: health.timestamp,
      services: health.services,
      uptime: process.uptime(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: Date.now(),
      },
      { status: 500 }
    )
  }
}
