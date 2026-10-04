import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatSessions, createChatSession } from '../services/api';

function ChatBot({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  // Cargar sesión existente o crear nueva
  useEffect(() => {
    if (user && isOpen) {
      loadChatHistory();
    }
  }, [user, isOpen]);

  // Scroll al último mensaje
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const sessions = await getChatSessions();
      if (sessions.length > 0) {
        const activeSession = sessions[0];
        setSessionId(activeSession.id);
        setMessages(activeSession.mensajes || []);
      } else {
        // Crear nueva sesión
        const newSession = await createChatSession();
        setSessionId(newSession.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Agregar mensaje del usuario al estado local
    setMessages(prev => [...prev, { rol: 'usuario', contenido: userMessage }]);

    try {
      const response = await sendChatMessage({
        sesion_id: sessionId,
        mensaje: userMessage
      });

      if (response.mensaje) {
        setMessages(prev => [...prev, response.mensaje]);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setMessages(prev => [...prev, {
        rol: 'asistente',
        contenido: 'Lo siento, hubo un error. Por favor, intenta de nuevo.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && isOpen) {
        // No cerrar para mejor UX
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) {
    return null; // No mostrar el chatbot si no hay usuario
  }

  return (
    <div ref={chatRef} className="chatbot-container">
      {/* Botón flotante */}
      <button
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chatbot"
      >
        {isOpen ? (
          <i className="bi bi-x-lg"></i>
        ) : (
          <i className="bi bi-chat-dots-fill"></i>
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <i className="bi bi-robot"></i>
              <span>Asistente IA</span>
            </div>
            <button
              className="chatbot-minimize"
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-chevron-down"></i>
            </button>
          </div>

          {/* Mensajes */}
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="chatbot-empty">
                <i className="bi bi-robot"></i>
                <p>Asistente de IA</p>
                <p className="text-muted small">Escribe tu consulta...</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chatbot-message ${msg.rol === 'usuario' ? 'user' : 'assistant'}`}
                >
                  <div className="chatbot-message-content">
                    {msg.rol === 'assistant' && (
                      <i className="bi bi-robot"></i>
                    )}
                    <p>{msg.contenido}</p>
                  </div>
                  <small className="chatbot-message-time">
                    {new Date(msg.creado).toLocaleTimeString('es-CL')}
                  </small>
                </div>
              ))
            )}
            {loading && (
              <div className="chatbot-message assistant">
                <div className="chatbot-message-content">
                  <i className="bi bi-robot"></i>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu consulta..."
              rows="1"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={loading ? 'loading' : ''}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <i className="bi bi-send-fill"></i>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Estilos CSS */}
      <style>{`
        .chatbot-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 9999;
        }

        .chatbot-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #db1010;
          color: white;
          border: none;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chatbot-toggle:hover {
          transform: scale(1.05);
          background: #600000;
        }

        .chatbot-toggle.active {
          background: #333;
        }

        .chatbot-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chatbot-header {
          background: #db1010;
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .chatbot-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .chatbot-header-info i {
          font-size: 20px;
        }

        .chatbot-minimize {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0 5px;
        }

        .chatbot-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          background: #f8f9fa;
        }

        .chatbot-empty {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .chatbot-empty i {
          font-size: 48px;
          color: #db1010;
          margin-bottom: 15px;
          display: block;
        }

        .chatbot-message {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
        }

        .chatbot-message.user {
          align-items: flex-end;
        }

        .chatbot-message.assistant {
          align-items: flex-start;
        }

        .chatbot-message-content {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .chatbot-message.user .chatbot-message-content {
          background: #db1010;
          color: white;
        }

        .chatbot-message.assistant .chatbot-message-content {
          background: white;
          border: 1px solid #e9ecef;
          color: #333;
        }

        .chatbot-message-content i {
          font-size: 16px;
          margin-top: 2px;
        }

        .chatbot-message-content p {
          margin: 0;
          word-wrap: break-word;
        }

        .chatbot-message-time {
          font-size: 10px;
          color: #adb5bd;
          margin-top: 4px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #6c757d;
          border-radius: 50%;
          animation: typing 1.4s infinite both;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chatbot-input {
          padding: 12px 15px;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 10px;
          background: white;
          flex-shrink: 0;
        }

        .chatbot-input textarea {
          flex: 1;
          border: 1px solid #ced4da;
          border-radius: 8px;
          padding: 8px 12px;
          resize: none;
          font-size: 14px;
          max-height: 80px;
          outline: none;
          transition: border-color 0.3s;
        }

        .chatbot-input textarea:focus {
          border-color: #db1010;
        }

        .chatbot-input button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #db1010;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
          flex-shrink: 0;
        }

        .chatbot-input button:hover:not(:disabled) {
          background: #600000;
        }

        .chatbot-input button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chatbot-input button.loading {
          background: #6c757d;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .chatbot-window {
            width: 92vw;
            height: 70vh;
            right: -10px;
            bottom: 75px;
          }

          .chatbot-toggle {
            width: 55px;
            height: 55px;
            font-size: 24px;
          }

          .chatbot-message-content {
            max-width: 90%;
          }
        }

        @media (max-width: 480px) {
          .chatbot-window {
            width: 96vw;
            height: 75vh;
            right: 0;
            bottom: 70px;
            border-radius: 12px;
          }

          .chatbot-toggle {
            width: 50px;
            height: 50px;
            font-size: 22px;
          }

          .chatbot-header {
            padding: 12px 16px;
          }

          .chatbot-messages {
            padding: 12px;
          }

          .chatbot-input {
            padding: 10px 12px;
          }

          .chatbot-input textarea {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}

export default ChatBot;