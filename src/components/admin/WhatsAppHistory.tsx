"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Download, MessageSquare, Calendar, User } from "lucide-react";
import { toast } from "react-toastify";
import { useI18n } from "@/lib/i18n/client";

interface WhatsAppMessage {
  id: string;
  type: 'sent' | 'received';
  phoneNumber: string;
  content: string;
  messageType: 'text' | 'template' | 'document' | 'image';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  messageId?: string;
  error?: string;
}

// Mock data for development
const mockMessages: WhatsAppMessage[] = [
  {
    id: '1',
    type: 'sent',
    phoneNumber: '+15551234567',
    content: '🏖️ Hello from Costa Beach! This is a test message from the community platform.',
    messageType: 'text',
    status: 'sent',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    messageId: 'wamid.ABC123'
  },
  {
    id: '2',
    type: 'sent',
    phoneNumber: '+818041122101',
    content: 'Community Poll: New playground equipment proposal',
    messageType: 'text',
    status: 'delivered',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    messageId: 'wamid.DEF456'
  },
  {
    id: '3',
    type: 'sent',
    phoneNumber: '+15551234567',
    content: 'Document: Monthly Community Report',
    messageType: 'document',
    status: 'read',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    messageId: 'wamid.GHI789'
  },
  {
    id: '4',
    type: 'received',
    phoneNumber: '+15551234567',
    content: 'Thank you for the update!',
    messageType: 'text',
    status: 'sent',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: '5',
    type: 'sent',
    phoneNumber: '+818041122101',
    content: 'Emergency Alert: Maintenance work scheduled',
    messageType: 'text',
    status: 'failed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    error: 'Phone number not verified'
  }
];

export default function WhatsAppHistory() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<WhatsAppMessage[]>(mockMessages);
  const [filteredMessages, setFilteredMessages] = useState<WhatsAppMessage[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'delivered' | 'read' | 'failed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    let filtered = messages;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(message => 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.phoneNumber.includes(searchQuery)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(message => message.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(message => {
        switch (dateFilter) {
          case 'today':
            return message.timestamp >= startOfDay;
          case 'week':
            return message.timestamp >= startOfWeek;
          case 'month':
            return message.timestamp >= startOfMonth;
          default:
            return true;
        }
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredMessages(filtered);
  }, [messages, searchQuery, typeFilter, statusFilter, dateFilter]);

  const exportMessages = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Type,Phone Number,Content,Message Type,Status,Message ID\n"
      + filteredMessages.map(m => 
        `"${m.timestamp.toISOString()}","${m.type}","${m.phoneNumber}","${m.content.replace(/"/g, '""')}","${m.messageType}","${m.status}","${m.messageId || ''}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "whatsapp_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('toast.whatsapp.historyExportSuccess'));
  };

  const getStatusColor = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'read': return 'text-purple-600 bg-purple-100';
      case 'failed': return 'text-red-600 bg-red-100';
    }
  };

  const getTypeIcon = (type: WhatsAppMessage['type']) => {
    return type === 'sent' ? '→' : '←';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Message History</h2>
          
          <button
            onClick={exportMessages}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredMessages.length} of {messages.length} messages
          </div>
        </div>

        {/* Messages List */}
        {filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-lg border border-gray-200 p-4 ${
                  message.type === 'sent' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-mono">
                        {getTypeIcon(message.type)}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {message.phoneNumber}
                        </span>
                      </div>

                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>

                      <span className="inline-flex px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        {message.messageType}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mb-3">
                      <p className="text-gray-900">{message.content}</p>
                      {message.error && (
                        <p className="text-red-600 text-sm mt-1">Error: {message.error}</p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatTimestamp(message.timestamp)}
                        </div>
                        
                        {message.messageId && (
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span className="font-mono text-xs">{message.messageId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-500">
              {messages.length === 0 
                ? "No WhatsApp messages have been sent or received yet."
                : "Try adjusting your filters to see more messages."
              }
            </p>
          </div>
        )}

        {/* Load More (for future pagination) */}
        {filteredMessages.length > 0 && (
          <div className="text-center mt-8">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Load More Messages
            </button>
          </div>
        )}
      </div>
    </div>
  );
}