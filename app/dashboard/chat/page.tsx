'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { MessageSquare, Send, Car, User, ArrowLeft, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah, formatDate } from '@/lib/utils';

export default function InternalChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [activeOtherUserId, setActiveOtherUserId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const currentUserId = (session?.user as any)?.id;

  // Fetch all threads
  useEffect(() => {
    async function loadThreads() {
      if (!session) return;
      setLoading(true);
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setMessages(data);
          // Automatically pick first conversation partner if available
          if (data.length > 0) {
            const first = data[0];
            const otherId = first.senderId === currentUserId ? first.receiverId : first.senderId;
            setActiveOtherUserId(otherId);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadThreads();
  }, [session, currentUserId]);

  // Fetch thread message history when active user changes
  useEffect(() => {
    async function loadConversation() {
      if (!activeOtherUserId) return;
      try {
        const res = await fetch(`/api/messages?otherUserId=${activeOtherUserId}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setThreadMessages(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadConversation();
  }, [activeOtherUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeOtherUserId) return;

    setSending(true);
    try {
      const activeThreadCarId =
        threadMessages.find((m) => m.carListingId)?.carListingId || null;

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: activeOtherUserId,
          carListingId: activeThreadCarId,
          content: newMessage,
        }),
      });

      const sentData = await res.json();
      if (res.ok) {
        setThreadMessages((prev) => [...prev, sentData]);
        setNewMessage('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[65vh] flex flex-col items-center justify-center text-center bg-white">
        <h2 className="text-3xl sm:text-4xl font-semibold text-[#0F172A] tracking-tight">Harap Login</h2>
        <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-md leading-relaxed">
          Anda harus login untuk menggunakan fitur Chat Internal.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium text-sm px-7 py-3 rounded-2xl shadow-md shadow-slate-900/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Login Sekarang
        </Link>
      </div>
    );
  }

  // Deduplicate unique partners from messages array
  const partnersMap = new Map();
  messages.forEach((msg) => {
    const isMeSender = msg.senderId === currentUserId;
    const partner = isMeSender ? msg.receiver : msg.sender;
    if (partner && !partnersMap.has(partner.id)) {
      partnersMap.set(partner.id, {
        partner,
        lastMessage: msg.content,
        carListing: msg.carListing,
        createdAt: msg.createdAt,
      });
    }
  });

  const uniquePartners = Array.from(partnersMap.values());
  const activePartner = uniquePartners.find((p) => p.partner.id === activeOtherUserId)?.partner;
  const activeCar = threadMessages.find((m) => m.carListing)?.carListing;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Dashboard</span>
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[600px] grid grid-cols-1 md:grid-cols-12">
        {/* Left Sidebar (Partners List) */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Pesan Percakapan
            </h2>
            <span className="text-xs text-slate-400">{uniquePartners.length} kontak</span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 text-center py-8">Memuat pesan...</p>
          ) : uniquePartners.length > 0 ? (
            <div className="space-y-2">
              {uniquePartners.map((item) => {
                const isActive = item.partner.id === activeOtherUserId;
                return (
                  <button
                    key={item.partner.id}
                    onClick={() => setActiveOtherUserId(item.partner.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center space-x-3 border ${
                      isActive
                        ? 'bg-slate-800 border-blue-500/60 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                      {item.partner.avatar ? (
                        <img
                          src={item.partner.avatar}
                          alt={item.partner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.partner.name.charAt(0)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">
                          {item.partner.name}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Belum ada percakapan chat aktif.
            </div>
          )}
        </div>

        {/* Right Chat Area */}
        <div className="md:col-span-8 flex flex-col justify-between bg-slate-900">
          {activePartner ? (
            <>
              {/* Header Info */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {activePartner.avatar ? (
                      <img
                        src={activePartner.avatar}
                        alt={activePartner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      activePartner.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activePartner.name}</h3>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      Online • Fitur Chat Internal Terenkripsi
                    </p>
                  </div>
                </div>

                {activeCar && (
                  <Link
                    href={`/cars/${activeCar.id}`}
                    className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-xs hover:border-blue-500 transition-colors"
                  >
                    <Car className="w-4 h-4 text-blue-400" />
                    <div className="text-left max-w-[150px] truncate">
                      <p className="font-semibold text-white truncate">{activeCar.title}</p>
                      <p className="text-[10px] text-blue-400 font-bold">
                        {formatRupiah(activeCar.price)}
                      </p>
                    </div>
                  </Link>
                )}
              </div>

              {/* Message Bubbles Container */}
              <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[450px]">
                {threadMessages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs space-y-1 ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10'
                            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                        <div
                          className={`text-[10px] flex items-center justify-end gap-1 ${
                            isMe ? 'text-blue-200' : 'text-slate-400'
                          }`}
                        >
                          <span>{formatDate(msg.createdAt)}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Instant Reply Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Ketik pesan negosiasi atau pertanyaan mobil..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs p-3 rounded-xl shadow-lg transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-700" />
              <h3 className="text-base font-bold text-white">Pilih Kontak Chat</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Pilih salah satu percakapan di sebelah kiri untuk mulai chatting dengan penjual atau pembeli.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
