"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  MessageCircle, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
}

// Mock data for development
const mockStats = {
  overview: [
    {
      title: "Total Messages Sent",
      value: "1,234",
      change: "+12% from last month",
      trend: 'up' as const,
      icon: MessageCircle
    },
    {
      title: "Active Recipients",
      value: "456",
      change: "+8% from last month",
      trend: 'up' as const,
      icon: Users
    },
    {
      title: "Delivery Rate",
      value: "94.2%",
      change: "-1.2% from last month",
      trend: 'down' as const,
      icon: CheckCircle
    },
    {
      title: "Failed Messages",
      value: "72",
      change: "+15% from last month",
      trend: 'down' as const,
      icon: XCircle
    }
  ],
  messageTypes: [
    { type: 'Text Messages', count: 856, percentage: 69.3 },
    { type: 'Document Messages', count: 234, percentage: 19.0 },
    { type: 'Template Messages', count: 98, percentage: 7.9 },
    { type: 'Image Messages', count: 46, percentage: 3.7 }
  ],
  timeDistribution: [
    { hour: '09:00', count: 45 },
    { hour: '10:00', count: 78 },
    { hour: '11:00', count: 92 },
    { hour: '12:00', count: 67 },
    { hour: '13:00', count: 54 },
    { hour: '14:00', count: 89 },
    { hour: '15:00', count: 123 },
    { hour: '16:00', count: 134 },
    { hour: '17:00', count: 156 },
    { hour: '18:00', count: 98 },
    { hour: '19:00', count: 76 },
    { hour: '20:00', count: 45 }
  ],
  recentActivity: [
    {
      action: 'Broadcast sent to 25 recipients',
      timestamp: '5 minutes ago',
      status: 'success'
    },
    {
      action: 'Emergency alert sent',
      timestamp: '2 hours ago',
      status: 'success'
    },
    {
      action: 'Failed to send to +15551234567',
      timestamp: '3 hours ago',
      status: 'error'
    },
    {
      action: 'Document notification sent',
      timestamp: '1 day ago',
      status: 'success'
    }
  ]
};

export default function WhatsAppStats() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Analytics</h2>
          
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockStats.overview.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className={`flex items-center mt-4 ${getTrendColor(stat.trend)}`}>
                  {getTrendIcon(stat.trend)}
                  <span className="text-sm ml-1">{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Message Types Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Message Types</h3>
            <div className="space-y-4">
              {mockStats.messageTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{type.type}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${type.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {mockStats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Distribution Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Message Distribution by Hour</h3>
          <div className="mt-6">
            <div className="flex items-end space-x-2 h-48">
              {mockStats.timeDistribution.map((data, index) => {
                const maxCount = Math.max(...mockStats.timeDistribution.map(d => d.count));
                const height = (data.count / maxCount) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="relative flex-1 w-full flex items-end">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`${data.hour}: ${data.count} messages`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                      {data.hour}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">94.2%</div>
              <div className="text-sm text-gray-600 mt-1">Delivery Rate</div>
              <div className="text-xs text-gray-500 mt-1">1,164 of 1,234 delivered</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2.3s</div>
              <div className="text-sm text-gray-600 mt-1">Avg Response Time</div>
              <div className="text-xs text-gray-500 mt-1">From send to delivery</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">67%</div>
              <div className="text-sm text-gray-600 mt-1">Read Rate</div>
              <div className="text-xs text-gray-500 mt-1">780 of 1,164 read</div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 flex justify-end">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Analytics Report
          </button>
        </div>
      </div>
    </div>
  );
}