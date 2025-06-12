"use client";

import React, { useState } from "react";
import { Users, Upload, Download, Send, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { getWhatsAppClient } from "@/lib/whatsapp/client";

interface Recipient {
  id: string;
  phoneNumber: string;
  name: string;
  status: 'pending' | 'sent' | 'failed';
  messageId?: string;
  error?: string;
}

export default function WhatsAppBroadcast() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [newRecipientPhone, setNewRecipientPhone] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");

  const addRecipient = () => {
    if (!newRecipientPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    const cleanPhone = newRecipientPhone.replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+') || cleanPhone.length < 10) {
      toast.error("Phone number must be in international format (+1234567890)");
      return;
    }

    // Check for duplicates
    if (recipients.find(r => r.phoneNumber === cleanPhone)) {
      toast.error("This phone number is already in the list");
      return;
    }

    const newRecipient: Recipient = {
      id: Date.now().toString(),
      phoneNumber: cleanPhone,
      name: newRecipientName.trim() || cleanPhone,
      status: 'pending'
    };

    setRecipients([...recipients, newRecipient]);
    setNewRecipientPhone("");
    setNewRecipientName("");
    toast.success("Recipient added successfully");
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const addSampleRecipients = () => {
    const sampleRecipients: Recipient[] = [
      {
        id: 'sample1',
        phoneNumber: '+15551234567',
        name: 'Test User 1 (US)',
        status: 'pending'
      },
      {
        id: 'sample2',
        phoneNumber: '+818041122101',
        name: 'Test User 2 (JP)',
        status: 'pending'
      }
    ];

    const newRecipients = sampleRecipients.filter(
      sample => !recipients.find(r => r.phoneNumber === sample.phoneNumber)
    );

    if (newRecipients.length === 0) {
      toast.info("Sample recipients are already in the list");
      return;
    }

    setRecipients([...recipients, ...newRecipients]);
    toast.success(`Added ${newRecipients.length} sample recipients`);
  };

  const handleBroadcast = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }

    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      const whatsappClient = getWhatsAppClient();
      const phoneNumbers = recipients.map(r => r.phoneNumber);
      
      // Reset all statuses to pending
      setRecipients(prev => prev.map(r => ({ ...r, status: 'pending' as const })));
      
      // Send broadcast message
      const results = await whatsappClient.broadcastToNumbers(phoneNumbers, messageText);
      
      // Update recipient statuses based on results
      setRecipients(prev => prev.map(recipient => {
        const result = results.find(r => r.includes(recipient.phoneNumber));
        if (result) {
          const isFailed = result.includes('FAILED');
          return {
            ...recipient,
            status: isFailed ? 'failed' : 'sent',
            messageId: isFailed ? undefined : result.split(': ')[1],
            error: isFailed ? 'Send failed' : undefined
          };
        }
        return { ...recipient, status: 'failed', error: 'No response' };
      }));

      const successCount = results.filter(r => !r.includes('FAILED')).length;
      const failedCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Broadcast sent! ${successCount} successful, ${failedCount} failed`);
      } else {
        toast.error("All messages failed to send");
      }

    } catch (error: any) {
      console.error("Broadcast failed:", error);
      toast.error(`Broadcast failed: ${error.message}`);
      
      // Mark all as failed
      setRecipients(prev => prev.map(r => ({ 
        ...r, 
        status: 'failed' as const, 
        error: error.message 
      })));
    } finally {
      setIsSending(false);
    }
  };

  const clearRecipients = () => {
    setRecipients([]);
    toast.info("Recipients list cleared");
  };

  const exportRecipients = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Phone Number,Status\n"
      + recipients.map(r => `"${r.name}","${r.phoneNumber}","${r.status}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "whatsapp_recipients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: Recipient['status']) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Broadcast WhatsApp Message</h2>
        
        {/* Message Text */}
        <div className="mb-6">
          <label htmlFor="broadcastMessage" className="block text-sm font-medium text-gray-700 mb-2">
            Broadcast Message
          </label>
          <textarea
            id="broadcastMessage"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={4}
            placeholder="Enter your broadcast message here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            {messageText.length}/1000 characters • This message will be sent to all recipients
          </p>
        </div>

        {/* Recipients Management */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Recipients ({recipients.length})
            </h3>
            
            <div className="flex space-x-2">
              <button
                onClick={addSampleRecipients}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Samples
              </button>
              
              {recipients.length > 0 && (
                <>
                  <button
                    onClick={exportRecipients}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </button>
                  
                  <button
                    onClick={clearRecipients}
                    className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Add New Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="tel"
              value={newRecipientPhone}
              onChange={(e) => setNewRecipientPhone(e.target.value)}
              placeholder="+1234567890"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={newRecipientName}
              onChange={(e) => setNewRecipientName(e.target.value)}
              placeholder="Name (optional)"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addRecipient}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </button>
          </div>

          {/* Recipients List */}
          {recipients.length > 0 ? (
            <div className="bg-white rounded-md border border-gray-200">
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipients.map((recipient) => (
                      <tr key={recipient.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {recipient.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {recipient.phoneNumber}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(recipient.status)}`}>
                            {recipient.status}
                          </span>
                          {recipient.error && (
                            <div className="text-xs text-red-500 mt-1">{recipient.error}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <button
                            onClick={() => removeRecipient(recipient.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recipients added yet</p>
              <p className="text-sm">Add recipients to start broadcasting</p>
            </div>
          )}
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            onClick={handleBroadcast}
            disabled={isSending || recipients.length === 0 || !messageText.trim()}
            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSending || recipients.length === 0 || !messageText.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Broadcasting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Broadcast ({recipients.length} recipients)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}