/* Backend Services Dashboard */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ServiceHealth {
  overall: 'healthy' | 'degraded' | 'down'
  services: Array<{
    name: string
    status: 'active' | 'inactive' | 'error'
    lastCheck: number
    responseTime?: number
  }>
  timestamp: number
}

interface MonitoringData {
  system: {
    status: string
    uptime: number
    memory: any
    version: string
    environment: string
  }
  services: {
    health: ServiceHealth
    count: number
    active: number
    degraded: number
  }
  pipelines: {
    total: number
    active: number
    completed: number
    failed: number
    successRate: number
    avgProcessingTime: number
  }
  performance: {
    avgResponseTime: number
    lastHealthCheck: number
  }
  timestamp: number
}

export default function BackendDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        const response = await fetch('/api/monitoring')
        if (!response.ok) throw new Error('Failed to fetch monitoring data')
        const data = await response.json()
        setMonitoringData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchMonitoringData()
    const interval = setInterval(fetchMonitoringData, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Backend Services Dashboard</h1>
          <p>Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  if (error || !monitoringData) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Backend Services Dashboard</h1>
          <p className="text-red-500">Error: {error || 'Failed to load monitoring data'}</p>
        </div>
      </div>
    )
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatMemory = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(2)} MB`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'bg-green-500'
      case 'degraded':
        return 'bg-yellow-500'
      case 'down':
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backend Services Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of all backend services and data processing pipelines
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(monitoringData.system.status)}`} />
              <span className="font-semibold capitalize">{monitoringData.system.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {monitoringData.system.environment}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(monitoringData.system.uptime)}</div>
            <p className="text-xs text-muted-foreground">v{monitoringData.system.version}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMemory(monitoringData.system.memory.heapUsed)}</div>
            <p className="text-xs text-muted-foreground">
              of {formatMemory(monitoringData.system.memory.heapTotal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData.pipelines.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {monitoringData.pipelines.completed} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {monitoringData.services.health.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                  {service.responseTime !== undefined && (
                    <div className="text-sm text-muted-foreground">
                      {service.responseTime}ms
                    </div>
                  )}
                  <Badge variant={service.status === 'active' ? 'default' : 'destructive'}>                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Pipelines</span>
                <span className="font-medium">{monitoringData.pipelines.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active</span>
                <span className="font-medium text-blue-600">{monitoringData.pipelines.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span className="font-medium text-green-600">{monitoringData.pipelines.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Failed</span>
                <span className="font-medium text-red-600">{monitoringData.pipelines.failed}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-medium">{monitoringData.pipelines.successRate}%</span>
              </div>
              <Progress value={monitoringData.pipelines.successRate} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Avg Processing Time: {monitoringData.pipelines.avgProcessingTime}ms
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(monitoringData.performance.avgResponseTime)}ms</div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{monitoringData.services.active}/{monitoringData.services.count}</div>
              <p className="text-sm text-muted-foreground">Services Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Date(monitoringData.performance.lastHealthCheck).toLocaleTimeString()}
              </div>
              <p className="text-sm text-muted-foreground">Last Health Check</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
