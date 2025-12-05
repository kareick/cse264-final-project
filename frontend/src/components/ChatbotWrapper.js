"use client";

import { useAuth } from '@/contexts/AuthContext';
import Chatbot from './Chatbot';

export default function ChatbotWrapper() {
  const { user, loading } = useAuth();

  // Don't render anything while loading or if user is not logged in
  if (loading || !user) {
    return null;
  }

  // Only render chatbot for paid users
  if (user.role === 'paid') {
    return <Chatbot />;
  }

  return null;
}

