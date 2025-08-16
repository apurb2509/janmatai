import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 2rem auto;
`;

const ChatContainer = styled(motion.div)`
  background: rgba(20, 20, 20, 0.5);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  display: flex;
  flex-direction: column;
  height: 500px;
`;

const ChatHeader = styled.div`
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
`;

const MessageList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Message = styled(motion.div)<{ sender: 'user' | 'ai' }>`
  padding: 0.6rem 1.1rem;
  border-radius: 20px;
  max-width: 80%;
  align-self: ${props => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
  background: ${props => (props.sender === 'user' 
    ? 'linear-gradient(90deg, #00FFFF, #FF00FF)' 
    : 'rgba(50, 50, 50, 0.8)')};
  color: white;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const ChatForm = styled.form`
  display: flex;
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChatInput = styled.input`
  flex-grow: 1;
  border: none;
  background-color: transparent;
  color: var(--font-color);
  padding: 0.75rem;
  font-size: 1rem;
  transition: box-shadow 0.3s ease;
  &:focus {
    outline: none;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
    border-radius: 8px;
  }
`;

const SendButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: #00FFFF;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    color: #555;
    cursor: not-allowed;
  }
`;

interface MessageData {
  sender: 'user' | 'ai';
  text: string;
}

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<MessageData[]>([
    { sender: 'ai', text: "Hey, I am AxiomBot! Ask me a question about the public opinions in the database." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: MessageData = { sender: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputValue }),
      });
      const data = await response.json();
      const aiMessage: MessageData = { sender: 'ai', text: data.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: MessageData = { sender: 'ai', text: "Sorry, I'm having trouble connecting to the server." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <ChatWrapper>
      <ChatContainer
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ChatHeader>AxiomBot</ChatHeader>
        <MessageList ref={messageListRef}>
          <AnimatePresence>
            {messages.map((msg, index) => (
              <Message 
                key={index} 
                sender={msg.sender}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
              >
                {msg.text}
              </Message>
            ))}
          </AnimatePresence>
          {isLoading && <Message sender="ai">Thinking...</Message>}
        </MessageList>
        <ChatForm onSubmit={handleSendMessage}>
          <ChatInput
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask AxiomBot..."
          />
          <SendButton 
            type="submit" 
            disabled={isLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </SendButton>
        </ChatForm>
      </ChatContainer>
    </ChatWrapper>
  );
};
