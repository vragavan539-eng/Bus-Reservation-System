import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { chatAPI } from '../services/newModulesApi';

// Add <LiveChatWidget /> once near the bottom of App.js so it's visible on every page.
// Assumes user is logged in when opened; wrap the button in an auth check if needed.
export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const openChat = async () => {
    setOpen(true);
    if (!session) {
      const res = await chatAPI.startSession('General Support');
      setSession(res.data);
      const msgs = await chatAPI.getMessages(res.data._id);
      setMessages(msgs.data);
    }
  };

  useEffect(() => {
    const handler = () => openChat();
    document.addEventListener('open-busgo-chat', handler);
    return () => document.removeEventListener('open-busgo-chat', handler);
   
  }, [session]);

  useEffect(() => {
    if (!open || !session) return;
    const interval = setInterval(() => {
      chatAPI.getMessages(session._id).then(r => setMessages(r.data)).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [open, session]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !session) return;
    const msg = text;
    setText('');
    setMessages(m => [...m, { sender: 'user', message: msg, createdAt: new Date() }]);
    setTyping(true);
    try {
      const res = await chatAPI.sendMessage(session._id, msg);
      if (res.data.botMessage) {
        setMessages(m => [...m, res.data.botMessage]);
      }
    } catch (err) {
      // ignore — next poll will retry fetching messages
    } finally {
      setTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, fontFamily: "'Inter',sans-serif" }}>
      {open && (
        <div style={{
          width: 320, height: 420, background: '#fff', borderRadius: 18, boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', marginBottom: 14, overflow: 'hidden', border: '1px solid #e2e8f0',
        }}>
          <div style={{ background: 'linear-gradient(135deg,#f97316,#ea6c0a)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: "'Syne',sans-serif" }}>BusGo Support</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Usually replies in a few minutes</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><X size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                background: m.sender === 'user' ? '#f97316' : '#fff',
                color: m.sender === 'user' ? '#fff' : '#1e293b',
                border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                borderRadius: 14, padding: '8px 13px', fontSize: 13, maxWidth: '80%', lineHeight: 1.5,
              }}>{m.message}</div>
            ))}
            {typing && (
              <div style={{ alignSelf: 'flex-start', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '8px 13px', fontSize: 13, color: '#94a3b8' }}>
                Busy is typing...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #f1f5f9' }}>
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message..." style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '9px 14px', fontSize: 13, outline: 'none' }} />
            <button onClick={send} style={{ background: '#f97316', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Send size={15} color="#fff" />
            </button>
          </div>
        </div>
      )}

      <button onClick={() => (open ? setOpen(false) : openChat())} style={{
        width: 58, height: 58, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea6c0a)',
        border: 'none', boxShadow: '0 12px 32px rgba(249,115,22,0.45)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto',
      }}>
        {open ? <X size={24} color="#fff" /> : <MessageCircle size={24} color="#fff" />}
      </button>
    </div>
  );
}