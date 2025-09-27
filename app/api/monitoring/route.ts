/* Backend Monitoring API */
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock monitoring data for development
    const serviceHealth = {
      overall: 'healthy',
      services: [
        { name: 'The Graph API', status: 'active', responseTime: 150, lastCheck: Date.now() },
        { name: '0G AI Service', status: 'active', responseTime: 200, lastCheck: Date.now() },
        { name: 'Self Protocol', status: 'active', responseTime: 100, lastCheck: Date.now() },
        { name: 'Reputation Oracle', status: 'active', responseTime: 50, lastCheck: Date.now() }
      ]
    }

    const allPipelines = [
      { id: '1', overallStatus: 'completed', totalDuration: 1200 },
      { id: '2', overallStatus: 'completed', totalDuration: 800 },
      { id: '3', overallStatus: 'failed', totalDuration: 500 }
    ]

    const totalPipelines = allPipelines.length
    const completedPipelines = allPipelines.filter(p => p.overallStatus === 'completed').length
    const failedPipelines = allPipelines.filter(p => p.overallStatus === 'failed').length
    const successRate = totalPipelines > 0 ? (completedPipelines / totalPipelines) * 100 : 0

    const completedWithDuration = allPipelines.filter(p => p.totalDuration)
    const avgProcessingTime = completedWithDuration.length > 0 
      ? completedWithDuration.reduce((sum, p) => sum + (p.totalDuration || 0), 0) / completedWithDuration.length
      : 0

    return NextResponse.json({
      system: {
        status: serviceHealth.overall,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      services: {
        health: serviceHealth,
        count: serviceHealth.services.length,
        active: serviceHealth.services.filter(s => s.status === 'active').length,
        degraded: serviceHealth.services.filter(s => s.status === 'error').length,
      },
      pipelines: {
        total: totalPipelines,
        active: 0,
        completed: completedPipelines,
        failed: failedPipelines,
        successRate: Math.round(successRate * 100) / 100,
        avgProcessingTime: Math.round(avgProcessingTime),
      },
      performance: {
        avgResponseTime: serviceHealth.services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / serviceHealth.services.length,
        lastHealthCheck: Math.max(...serviceHealth.services.map(s => s.lastCheck)),
      },
      timestamp: Date.now(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Monitoring data unavailable",
        timestamp: Date.now(),
      },
      { status: 500 }
    )
  }
}
