import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, MessageSquare } from 'lucide-react';

export function RoomChat({ room, onSendMessage, isHost }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const defaultMessages = [
    {
      id: 'default-1',
      senderName: 'Hanna (Host)',
      isHost: true,
      text: "Let's start in 5!",
      formattedTime: '7:45 PM',
      bubbleColor: 'peach',
    },
    {
      id: 'default-2',
      senderName: 'MacBook Air',
      isHost: false,
      text: 'Ready! 🍿',
      formattedTime: '7:45 PM',
      bubbleColor: 'lavender',
    },
    {
      id: 'default-3',
      senderName: 'iMac 24"',
      isHost: false,
      text: "Let's go! 🍿",
      formattedTime: '7:46 PM',
      bubbleColor: 'mint',
    }
  ];

  const messages = (room?.chatMessages && room.chatMessages.length > 0)
    ? room.chatMessages
    : defaultMessages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), isHost ? 'peach' : 'lavender');
    setInputText('');
  };

  const handleQuickEmoji = (emoji) => {
    onSendMessage(emoji, isHost ? 'peach' : 'lavender');
  };

  // Map bubble color to Tailwind pastel classes matching reference
  const getBubbleStyle = (color, isMsgHost) => {
    if (color === 'peach' || isMsgHost) {
      return 'bg-pastel-peach border-pastel-peachBorder text-slate-800';
    }
    if (color === 'lavender') {
      return 'bg-pastel-lavender border-pastel-lavenderBorder text-slate-800';
    }
    if (color === 'mint') {
      return 'bg-pastel-mint border-pastel-mintBorder text-slate-800';
    }
    return 'bg-slate-50 border-slate-200 text-slate-800';
  };

  return (
    <div className="card-base p-5 flex flex-col justify-between h-[360px] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Room Chat
        </h3>
        <div className="flex items-center space-x-1">
          {['🍿', '🎬', '🔥', '👏'].map(emoji => (
            <button
              key={emoji}
              onClick={() => handleQuickEmoji(emoji)}
              className="text-xs hover:scale-125 transition-transform p-0.5"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-left">
        {messages.map((msg, index) => {
          const isMsgHost = msg.isHost || msg.senderName?.includes('(Host)');
          const bubbleClass = getBubbleStyle(msg.bubbleColor, isMsgHost);

          return (
            <div
              key={msg.id || index}
              className={`p-3 rounded-2xl border text-xs relative ${bubbleClass} transition-all duration-150`}
            >
              {/* Sender Name */}
              <div className="font-bold text-[11px] text-slate-800 mb-0.5">
                {msg.senderName}
              </div>

              {/* Message Text */}
              <div className="text-[12.5px] text-slate-900 font-medium leading-relaxed">
                {msg.text}
              </div>

              {/* Timestamp at bottom right */}
              <div className="text-[10px] text-slate-400 text-right mt-0.5">
                {msg.formattedTime || 'Just now'}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="relative flex items-center pt-1">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full pl-3.5 pr-11 py-2.5 rounded-full bg-slate-50 border border-slate-200/80 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-xs text-slate-800 transition-all placeholder:text-slate-400 shadow-inner"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="absolute right-1.5 w-8 h-8 rounded-full bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 text-white flex items-center justify-center transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </form>
    </div>
  );
}
