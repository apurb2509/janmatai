import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  border: 1px solid #333;
  border-radius: 12px;
  background-color: var(--dark-surface);
  display: flex;
  flex-direction: column;
  height: 400px;
`;

const MessageList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Message = styled.div<{ sender: 'user' | 'ai' }>`
  padding: 0.5rem 1rem;
  border-radius: 18px;
  max-width: 80%;
  align-self: ${props => (props.sender === 'user' ? 'flex-end' : 'flex-start')};
  background-color: ${props => (props.sender === 'user' ? 'var(--accent-color)' : '#444')};
  color: white;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ChatForm = styled.form`
  display: flex;
  padding: 0.5rem;
  border-top: 1px solid #333;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  border: none;
  background-color: transparent;
  color: var(--font-color);
  padding: 0.75rem;
  font-size: 1rem;
  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  background-color: var(--accent-color);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  &:disabled {
    background-color: #333;
    cursor: not-allowed;
  }
`;

interface MessageData {
  sender: 'user' | 'ai';
  text: string;
}

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<MessageData[]>([
    { sender: 'ai', text: "Ask me a question about the public opinions in the database." }
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

  return (
    <ChatContainer>
      <MessageList ref={messageListRef}>
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.sender}>
            {msg.text}
          </Message>
        ))}
        {isLoading && <Message sender="ai">Thinking...</Message>}
      </MessageList>
      <ChatForm onSubmit={handleSendMessage}>
        <ChatInput
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Type your question..."
        />
        <SendButton type="submit" disabled={isLoading}>Send</SendButton>
      </ChatForm>
    </ChatContainer>
  );
};