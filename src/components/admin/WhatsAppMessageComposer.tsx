"use client";

import React, { useState } from "react";
import { Send, Phone, FileText, Image, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import { getWhatsAppClient } from "@/lib/whatsapp/client";

type MessageType = 'text' | 'template' | 'document' | 'image';

export default function WhatsAppMessageComposer() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageType, setMessageType] = useState<MessageType>('text');
  const [messageText, setMessageText] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentFilename, setDocumentFilename] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+') || cleanPhone.length < 10) {
      toast.error("Phone number must be in international format (+1234567890)");
      return;
    }

    setIsSending(true);

    try {
      const whatsappClient = getWhatsAppClient();
      let messageId: string;

      switch (messageType) {
        case 'text':
          if (!messageText.trim()) {
            toast.error("Please enter a message");
            return;
          }
          messageId = await whatsappClient.sendTextMessage(cleanPhone, messageText);
          break;

        case 'template':
          if (!templateName.trim()) {
            toast.error("Please enter a template name");
            return;
          }
          messageId = await whatsappClient.sendTemplateMessage(cleanPhone, templateName);
          break;

        case 'document':
          if (!documentUrl.trim() || !documentFilename.trim()) {
            toast.error("Please provide document URL and filename");
            return;
          }
          messageId = await whatsappClient.sendDocumentMessage(
            cleanPhone, 
            documentUrl, 
            documentFilename,
            messageText || undefined
          );
          break;

        case 'image':
          if (!imageUrl.trim()) {
            toast.error("Please provide image URL");
            return;
          }
          messageId = await whatsappClient.sendImageMessage(
            cleanPhone, 
            imageUrl, 
            imageCaption || undefined
          );
          break;

        default:
          throw new Error("Invalid message type");
      }

      toast.success(`Message sent successfully! ID: ${messageId}`);
      
      // Clear form
      setMessageText("");
      setTemplateName("");
      setDocumentUrl("");
      setDocumentFilename("");
      setImageUrl("");
      setImageCaption("");
      
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const messageTypeOptions = [
    { value: 'text', label: 'Text Message', icon: MessageSquare },
    { value: 'template', label: 'Template Message', icon: MessageSquare },
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'image', label: 'Image', icon: Image },
  ];

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compose WhatsApp Message</h2>
        
        {/* Phone Number Input */}
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Recipient Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter phone number in international format (e.g., +15551234567)
          </p>
        </div>

        {/* Message Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Message Type</label>
          <div className="grid grid-cols-2 gap-3">
            {messageTypeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setMessageType(option.value as MessageType)}
                  className={`p-3 rounded-md border-2 text-left transition-colors ${
                    messageType === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Content Based on Type */}
        {messageType === 'text' && (
          <div className="mb-6">
            <label htmlFor="messageText" className="block text-sm font-medium text-gray-700 mb-2">
              Message Text
            </label>
            <textarea
              id="messageText"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              placeholder="Enter your message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {messageText.length}/1000 characters
            </p>
          </div>
        )}

        {messageType === 'template' && (
          <div className="mb-6">
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="hello_world"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Template must be pre-approved in Meta Business Manager
            </p>
          </div>
        )}

        {messageType === 'document' && (
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Document URL
              </label>
              <input
                type="url"
                id="documentUrl"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="documentFilename" className="block text-sm font-medium text-gray-700 mb-2">
                Filename
              </label>
              <input
                type="text"
                id="documentFilename"
                value={documentFilename}
                onChange={(e) => setDocumentFilename(e.target.value)}
                placeholder="document.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="documentCaption" className="block text-sm font-medium text-gray-700 mb-2">
                Caption (Optional)
              </label>
              <textarea
                id="documentCaption"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                placeholder="Optional caption for the document..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {messageType === 'image' && (
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="imageCaption" className="block text-sm font-medium text-gray-700 mb-2">
                Caption (Optional)
              </label>
              <textarea
                id="imageCaption"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                rows={2}
                placeholder="Optional caption for the image..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSendMessage}
            disabled={isSending || !phoneNumber.trim()}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSending || !phoneNumber.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </button>
        </div>

        {/* Quick Test Numbers */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Test Numbers</h3>
          <div className="space-x-2">
            <button
              onClick={() => setPhoneNumber("+15551234567")}
              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              US Test
            </button>
            <button
              onClick={() => setPhoneNumber("+818041122101")}
              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              JP Test
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            These are test numbers for development. Use verified numbers in production.
          </p>
        </div>
      </div>
    </div>
  );
}