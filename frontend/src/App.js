import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import './App.css';

function App() {
  const [message, setMessage] =
    useState('');

  const [conversations, setConversations] =
  useState([]);

const [currentChatId, setCurrentChatId] =
  useState(null);
  const [loading, setLoading] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  

  const [personality, setPersonality] =
    useState('coder');

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentChat =
  conversations.find(
    (chat) => chat.id === currentChatId
  ) || {
    messages: [],
  };

  /* -----------------------------
     LOAD SAVED DATA
  ----------------------------- */

  useEffect(() => {
  const savedChats =
    localStorage.getItem(
      'conversations'
    );

  if (savedChats) {
    const chats =
      JSON.parse(savedChats);

    setConversations(chats);

    if (chats.length > 0) {
      setCurrentChatId(
        chats[0].id
      );
    }
  } else {
    const firstChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
    };

    setConversations([
      firstChat,
    ]);

    setCurrentChatId(
      firstChat.id
    );
  }
}, []);

    
  /* -----------------------------
     SAVE DATA
  ----------------------------- */

  useEffect(() => {
  localStorage.setItem(
    'conversations',
    JSON.stringify(
      conversations
    )
  );

  scrollToBottom();
}, [conversations]);
  /* -----------------------------
     AUTO SCROLL
  ----------------------------- */

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  /* -----------------------------
     AI PERSONALITIES
  ----------------------------- */

  const personalities = {
  coder: `
You are an expert coding assistant.

IMPORTANT RULES:
- Give code ONLY when user asks for code/programming.
- For normal questions, answer normally.
- Use markdown code blocks for code.
- Keep answers short unless user asks detailed explanation.
`,

  teacher: `
You are a friendly teacher.

IMPORTANT RULES:
- Explain simply.
- Do NOT generate code unless user asks.
- Keep answers clear and concise.
`,

  interviewer: `
You are a professional interviewer.

IMPORTANT RULES:
- Ask interview questions.
- Do not generate code unless requested.
`,

  doctor: `
You are a helpful health assistant.

IMPORTANT RULES:
- Give health guidance only.
- Do not generate code.
`,

  storyteller: `
You are a creative storyteller.

IMPORTANT RULES:
- Tell engaging stories.
- Do NOT generate code.
- Use paragraphs like a real novel.
`,
};

  /* -----------------------------
     SEND MESSAGE
  ----------------------------- */

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: 'user',
      text: message,
    };

    const updatedMessages = [
  ...currentChat.messages,
  userMessage,
];

    setConversations(
  conversations.map((chat) =>
    chat.id === currentChatId
      ? {
          ...chat,
          title:
            chat.title ===
            'New Chat'
              ? message.substring(
                  0,
                  30
                )
              : chat.title,
          messages:
            updatedMessages,
        }
      : chat
  )
);

   ;

    
    setLoading(true);

    try {const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://my-ai-chatbot-js9d.onrender.com";

const response = await axios.post(
  `${API_URL}/chat`,
  {
          messages: [
            {
              role: 'system',
              content:
                personalities[
                  personality
                ],
            },

            ...updatedMessages.map(
              (msg) => ({
                role:
                  msg.sender ===
                  'user'
                    ? 'user'
                    : 'assistant',

                content: msg.text,
              })
            ),
          ],
        }
      );

      const botReply =
        response.data.reply;

      const botMessage = {
        sender: 'bot',
        text: botReply,
      };

      setConversations(
  conversations.map((chat) =>
    chat.id === currentChatId
      ? {
          ...chat,
          messages: [
            ...chat.messages,
            botMessage,
          ],
        }
      : chat
  )
);
    } catch (error) {
      console.log(error);

      
    }

    setLoading(false);
  };

  /* -----------------------------
     ENTER KEY
  ----------------------------- */

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  /* -----------------------------
     CLEAR CHAT
  ----------------------------- */

  const createNewChat = () => {
  const newChat = {
    id: Date.now(),
    title: 'New Chat',
    messages: [],
  };

  setConversations([
    newChat,
    ...conversations,
  ]);

  setCurrentChatId(
    newChat.id
  );
};

  /* -----------------------------
     FILE UPLOAD
  ----------------------------- */

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      
    }
  };

  /* -----------------------------
     SPEECH TO TEXT
  ----------------------------- */

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Speech Recognition not supported'
      );
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setMessage(transcript);
    };

    recognition.start();

    recognitionRef.current =
      recognition;
  };

  /* -----------------------------
     TEXT TO SPEECH
  ----------------------------- */

  const speakText = (text) => {
    // STOP SPEAKING
    if (isSpeaking) {
      window.speechSynthesis.cancel();

      setIsSpeaking(false);

      return;
    }

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    speech.lang = 'en-US';

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    const voices =
      window.speechSynthesis.getVoices();

    const selectedVoice =
      voices.find(
        (voice) =>
          voice.name.includes(
            'Google'
          ) ||
          voice.name.includes(
            'Microsoft'
          )
      );

    if (selectedVoice) {
      speech.voice =
        selectedVoice;
    }

    speech.onend = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);

    window.speechSynthesis.speak(
      speech
    );
  };

  return (
    <div
      className={
        darkMode
          ? 'app dark'
          : 'app'
      }
    >
      {/* SIDEBAR */}

      <div className="sidebar">
        <div>
          <h2>My AI</h2>

          <button
  onClick={createNewChat}
>
  + New Chat
</button>

          {/* PERSONALITY */}

          <select
            value={personality}
            onChange={(e) =>
              setPersonality(
                e.target.value
              )
            }
          >
            <option value="coder">
              👨‍💻 Coder
            </option>

            <option value="teacher">
              👨‍🏫 Teacher
            </option>

            <option value="interviewer">
              💼 Interviewer
            </option>

            <option value="doctor">
              🩺 Doctor
            </option>

            <option value="storyteller">
              📖 Storyteller
            </option>
          </select>

          {/* HISTORY */}

          <div className="history">
            <h3>
              Recent Chats
            </h3>

           {conversations.map(
  (chat) => (
    <div
      key={chat.id}
      className="history-item"
      onClick={() =>
        setCurrentChatId(
          chat.id
        )
      }
    >
      {chat.title}
    </div>
  )
)}
          </div>
        </div>

        {/* DARK MODE */}

        <button
          onClick={() =>
            setDarkMode(
              !darkMode
            )
          }
        >
          {darkMode
            ? '☀ Light'
            : '🌙 Dark'}
        </button>
      </div>

      {/* MAIN CHAT */}

      <div className="main-chat">
        <div className="chat-header">
          <h1>
            AI Assistant
          </h1>
        </div>

        {/* CHAT BOX */}

        <div className="chat-box">
          {currentChat.messages.map(
            (msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender}`}
              >
                <div className="message-content">
                  <ReactMarkdown
                    remarkPlugins={[
                      remarkGfm,
                    ]}
                  >
                    {msg.text}
                  </ReactMarkdown>

                  {msg.sender ===
                    'bot' && (
                    <button
                      className="speak-btn"
                      onClick={() =>
                        speakText(
                          msg.text
                        )
                      }
                    >
                      {isSpeaking
                        ? '⏹ Stop'
                        : '🔊 Read Aloud'}
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="typing">
              AI is typing...
            </div>
          )}

          <div
            ref={chatEndRef}
          ></div>
        </div>

        {/* INPUT AREA */}

        <div className="input-area">
          {/* FILE */}

          <label className="upload-btn">
            📎

            <input
              type="file"
              hidden
              onChange={
                handleFileUpload
              }
            />
          </label>

          {/* MIC */}

          <button
            onClick={
              startListening
            }
          >
            🎤
          </button>

          {/* INPUT */}

          <input
            type="text"
            placeholder="Ask anything..."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyPress
            }
          />

          {/* SEND */}

          <button
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;