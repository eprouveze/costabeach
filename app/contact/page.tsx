"use client";

import { useState } from 'react';
import { toast } from 'react-toastify';
import PublicLandingTemplate from '@/components/templates/PublicLandingTemplate';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent!');
    setEmail('');
    setMessage('');
  };

  return (
    <PublicLandingTemplate>
      <section className="p-4">
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <label className="block mb-2">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </label>
          <label className="block mb-2">
            <span className="text-gray-700">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </label>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Send Message
          </button>
        </form>
      </section>
    </PublicLandingTemplate>
  );
} 