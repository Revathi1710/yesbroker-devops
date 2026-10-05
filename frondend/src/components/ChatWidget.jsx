// ChatWidget.jsx
// Drop-in floating chat button for BrokerView2
// Usage: <ChatWidget broker={broker} />
//
// Install: npm install socket.io-client uuid
//
// Add to your vite.config or index.html if needed:
//   VITE_SOCKET_URL=https://yesbroker-backend.onrender.com

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

// ── Constants ──────────────────────────────────────────
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
const BRAND_RED  = '#e8341c';

// Generate or reuse seeker session ID (persists across page refreshes)
const getSeekerSession = () => {
  let id = sessionStorage.getItem('yb_seeker_id');
  if (!id) { id = uuidv4(); sessionStorage.setItem('yb_seeker_id', id); }
  return id;
};

// ── Styles ─────────────────────────────────────────────
const CHAT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .yb-chat-widget * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }

  /* ── FAB ── */
  .yb-chat-fab {
    position: fixed;
    bottom: 88px;
    right: 24px;
    width: 58px; height: 58px;
    background: ${BRAND_RED};
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 28px rgba(232,52,28,0.42);
    z-index: 9999;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
  }
  .yb-chat-fab:hover { transform: scale(1.1); box-shadow: 0 12px 36px rgba(232,52,28,0.55); }
  .yb-chat-fab-badge {
    position: absolute;
    top: -4px; right: -4px;
    background: #22c55e;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    width: 20px; height: 20px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #fff;
    animation: yb-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes yb-pop {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }

  /* ── Window ── */
  .yb-chat-window {
    position: fixed;
    bottom: 88px;
    right: 24px;
    width: 360px;
    height: 520px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 24px 72px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999;
    animation: yb-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1);
    border: 1px solid rgba(0,0,0,0.06);
  }
  @keyframes yb-slide-up {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 480px) {
    .yb-chat-window {
      bottom: 0; right: 0; left: 0;
      width: 100%; height: 100vh;
      border-radius: 0;
    }
    .yb-chat-fab { bottom: 80px; right: 16px; }
  }

  /* ── Header ── */
  .yb-chat-header {
    background: linear-gradient(135deg, #0f0f1a, #1e1e3f);
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .yb-chat-avatar {
    width: 42px; height: 42px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255,255,255,0.2);
    flex-shrink: 0;
  }

  .yb-chat-header-info { flex: 1; min-width: 0; }

  .yb-chat-broker-name {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .yb-chat-status {
    font-size: 11px;
    color: rgba(255,255,255,0.55);
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 2px;
  }

  .yb-online-dot {
    width: 7px; height: 7px;
    background: #22c55e;
    border-radius: 50%;
    animation: yb-pulse 2s infinite;
  }
  @keyframes yb-pulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .yb-chat-close {
    background: rgba(255,255,255,0.1);
    border: none; border-radius: 50%;
    width: 30px; height: 30px;
    cursor: pointer;
    color: rgba(255,255,255,0.7);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .yb-chat-close:hover { background: rgba(255,255,255,0.2); color: #fff; }

  /* ── Name prompt ── */
  .yb-name-prompt {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28px 24px;
    gap: 12px;
    background: #f8f9fc;
  }

  .yb-name-prompt h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0;
    text-align: center;
  }

  .yb-name-prompt p {
    font-size: 13px;
    color: #64748b;
    text-align: center;
    margin: 0;
    line-height: 1.6;
  }

  .yb-name-input {
    width: 100%;
    height: 48px;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 0 16px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s;
    background: #fff;
    color: #1a1a2e;
  }
  .yb-name-input:focus { border-color: ${BRAND_RED}; box-shadow: 0 0 0 3px rgba(232,52,28,0.1); }

  .yb-name-submit {
    width: 100%;
    height: 48px;
    background: ${BRAND_RED};
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .yb-name-submit:hover { background: #c42d18; transform: translateY(-1px); }

  /* ── Messages ── */
  .yb-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-behavior: smooth;
    background: #f8f9fc;
  }

  .yb-chat-messages::-webkit-scrollbar { width: 4px; }
  .yb-chat-messages::-webkit-scrollbar-track { background: transparent; }
  .yb-chat-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

  .yb-msg-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }
  .yb-msg-row.seeker  { flex-direction: row-reverse; }
  .yb-msg-row.broker  { flex-direction: row; }

  .yb-msg-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .yb-msg-avatar-placeholder {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: ${BRAND_RED};
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 11px; font-weight: 700;
    flex-shrink: 0;
  }

  .yb-msg-bubble {
    max-width: 72%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 13.5px;
    line-height: 1.5;
    word-break: break-word;
  }

  .yb-msg-row.seeker .yb-msg-bubble {
    background: ${BRAND_RED};
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  .yb-msg-row.broker .yb-msg-bubble {
    background: #fff;
    color: #1a1a2e;
    border-bottom-left-radius: 4px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .yb-msg-time {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 3px;
    display: block;
    text-align: right;
  }

  .yb-msg-row.seeker .yb-msg-time { text-align: right; }
  .yb-msg-row.broker .yb-msg-time { text-align: left; }

  /* ── Date divider ── */
  .yb-date-divider {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 6px 0;
  }
  .yb-date-divider::before, .yb-date-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
  .yb-date-divider span {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 600;
    white-space: nowrap;
    letter-spacing: 0.5px;
  }

  /* ── Typing indicator ── */
  .yb-typing {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }
  .yb-typing-dots {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 8px 14px;
    display: flex;
    gap: 4px;
    align-items: center;
  }
  .yb-typing-dot {
    width: 6px; height: 6px;
    background: #94a3b8;
    border-radius: 50%;
    animation: yb-typing 1.2s infinite;
  }
  .yb-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .yb-typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes yb-typing {
    0%,60%,100% { transform: translateY(0); opacity: 0.5; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  /* ── Input area ── */
  .yb-chat-input-area {
    padding: 12px 14px;
    border-top: 1px solid #e8ecf0;
    background: #fff;
    display: flex;
    gap: 8px;
    align-items: flex-end;
    flex-shrink: 0;
  }

  .yb-chat-input {
    flex: 1;
    min-height: 40px;
    max-height: 100px;
    resize: none;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    line-height: 1.4;
    transition: border-color 0.2s;
    color: #1a1a2e;
    background: #f8f9fc;
  }
  .yb-chat-input:focus { border-color: ${BRAND_RED}; background: #fff; }
  .yb-chat-input::placeholder { color: #94a3b8; }

  .yb-chat-send {
    width: 40px; height: 40px;
    background: ${BRAND_RED};
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.15s;
  }
  .yb-chat-send:hover:not(:disabled) { background: #c42d18; transform: scale(1.05); }
  .yb-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Empty state ── */
  .yb-chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 24px;
    background: #f8f9fc;
  }
  .yb-chat-empty-icon { font-size: 2.5rem; }
  .yb-chat-empty p { font-size: 13px; color: #64748b; text-align: center; margin: 0; line-height: 1.6; }
`;

// ── Helpers ────────────────────────────────────────────
const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ── Main Component ─────────────────────────────────────
const ChatWidget = ({ broker }) => {
  const [open,        setOpen]        = useState(false);
  const [connected,   setConnected]   = useState(false);
  const [messages,    setMessages]    = useState([]);
  const [text,        setText]        = useState('');
  const [seekerName,  setSeekerName]  = useState('');
  const [nameInput,   setNameInput]   = useState('');
  const [typing,      setTyping]      = useState(false);
  const [unread,      setUnread]      = useState(0);
  const [joined,      setJoined]      = useState(false);

  const socketRef   = useRef(null);
  const messagesRef = useRef(null);
  const typingTimer = useRef(null);
  const seekerSession = useRef(getSeekerSession());

  const roomId = broker?._id
    ? `${broker._id}__${seekerSession.current}`
    : null;

  // ── Auto-scroll ───────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Connect socket once ───────────────────────────────
  useEffect(() => {
    if (!broker?._id) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setJoined(false);
    });

    socket.on('message_history', (history) => {
      setMessages(history);
    });

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!open && msg.role === 'broker') {
        setUnread(n => n + 1);
      }
    });

    socket.on('typing', ({ senderName: name, role }) => {
      if (role === 'broker') setTyping(true);
    });

    socket.on('stop_typing', () => setTyping(false));

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broker?._id]);

  // ── Join room after name is set ───────────────────────
  const joinRoom = useCallback((name) => {
    if (!roomId || !socketRef.current || joined) return;
    socketRef.current.emit('join_room', {
      roomId,
      brokerId:    broker._id,
      brokerName:  broker.name,
      seekerName:  name,
      seekerSession: seekerSession.current,
    });
    setJoined(true);
  }, [roomId, broker, joined]);

  // ── Open / close ─────────────────────────────────────
  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
    if (seekerName && !joined) joinRoom(seekerName);
  };

  const handleClose = () => setOpen(false);

  // ── Submit name ───────────────────────────────────────
  const handleNameSubmit = (e) => {
    e.preventDefault();
    const name = nameInput.trim() || 'Anonymous';
    setSeekerName(name);
    joinRoom(name);
  };

  // ── Send message ──────────────────────────────────────
  const handleSend = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !roomId || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      roomId,
      senderId:   `seeker:${seekerSession.current}`,
      senderName: seekerName,
      role:       'seeker',
      text:       trimmed,
    });

    setText('');
    socketRef.current.emit('stop_typing', { roomId });
  };

  // ── Typing events ─────────────────────────────────────
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!roomId || !socketRef.current) return;

    socketRef.current.emit('typing', { roomId, senderName: seekerName, role: 'seeker' });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { roomId });
    }, 1500);
  };

  // ── Key handler ───────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Group messages by date ────────────────────────────
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (!broker?._id) return null;

  return (
    <div className="yb-chat-widget">
      <style>{CHAT_STYLES}</style>

      {/* ── FAB ── */}
      {!open && (
        <button className="yb-chat-fab" onClick={handleOpen} aria-label="Open chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
          </svg>
          {unread > 0 && <div className="yb-chat-fab-badge">{unread}</div>}
        </button>
      )}

      {/* ── Chat Window ── */}
      {open && (
        <div className="yb-chat-window">

          {/* Header */}
          <div className="yb-chat-header">
            <img
              src={broker.profileImage}
              alt={broker.name}
              className="yb-chat-avatar"
            />
            <div className="yb-chat-header-info">
              <div className="yb-chat-broker-name">{broker.name}</div>
              <div className="yb-chat-status">
                <div className="yb-online-dot" />
                {connected ? 'Online · Typically replies quickly' : 'Connecting…'}
              </div>
            </div>
            <button className="yb-chat-close" onClick={handleClose} aria-label="Close chat">
              ✕
            </button>
          </div>

          {/* ── Name Prompt (first time) ── */}
          {!seekerName ? (
            <form className="yb-name-prompt" onSubmit={handleNameSubmit}>
              <div style={{ fontSize: '2rem' }}>👋</div>
              <h3>Chat with {broker.name}</h3>
              <p>
                Ask about properties, pricing, or availability.
                What should we call you?
              </p>
              <input
                className="yb-name-input"
                placeholder="Your name (e.g. Ravi Kumar)"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="yb-name-submit">
                Start Chatting →
              </button>
            </form>
          ) : (
            <>
              {/* ── Messages ── */}
              <div className="yb-chat-messages" ref={messagesRef}>

                {/* Welcome message if empty */}
                {messages.length === 0 && (
                  <div className="yb-chat-empty">
                    <div className="yb-chat-empty-icon">🏠</div>
                    <p>
                      Hi {seekerName}! Ask {broker.name} about properties,
                      pricing, availability, or anything real estate.
                    </p>
                  </div>
                )}

                {/* Grouped messages */}
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <React.Fragment key={date}>
                    <div className="yb-date-divider">
                      <span>{date}</span>
                    </div>
                    {msgs.map((msg) => (
                      <MessageBubble
                        key={msg._id}
                        msg={msg}
                        brokerImage={broker.profileImage}
                        seekerName={seekerName}
                      />
                    ))}
                  </React.Fragment>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <div className="yb-typing">
                    <img src={broker.profileImage} alt="" className="yb-msg-avatar" />
                    <div className="yb-typing-dots">
                      <div className="yb-typing-dot" />
                      <div className="yb-typing-dot" />
                      <div className="yb-typing-dot" />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Input Area ── */}
              <div className="yb-chat-input-area">
                <textarea
                  className="yb-chat-input"
                  placeholder={`Message ${broker.name}…`}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  style={{ height: Math.min(100, Math.max(40, text.split('\n').length * 22)) + 'px' }}
                />
                <button
                  className="yb-chat-send"
                  onClick={handleSend}
                  disabled={!text.trim()}
                  aria-label="Send"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── Message Bubble ─────────────────────────────────────
const MessageBubble = ({ msg, brokerImage, seekerName }) => {
  const isSeeker = msg.role === 'seeker';

  return (
    <div className={`yb-msg-row ${msg.role}`}>
      {/* Avatar */}
      {!isSeeker ? (
        <img src={brokerImage} alt="" className="yb-msg-avatar" />
      ) : (
        <div className="yb-msg-avatar-placeholder">
          {(seekerName || 'S').charAt(0).toUpperCase()}
        </div>
      )}

      {/* Bubble + time */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '72%' }}>
        <div className="yb-msg-bubble">{msg.text}</div>
        <span className="yb-msg-time">{formatTime(msg.createdAt)}</span>
      </div>
    </div>
  );
};

export default ChatWidget;