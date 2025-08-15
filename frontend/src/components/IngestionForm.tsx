import React, { useState } from 'react';
import styled from 'styled-components';

const IngestContainer = styled.form`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: var(--dark-surface);
  border-radius: 12px;
  max-width: 600px;
  margin: 0 auto;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #555;
  background-color: #333;
  color: var(--font-color);
  font-size: 0.9rem;
`;

const IngestButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background-color: #ff9ff3;
  color: #1a1a1a;
  font-weight: bold;
  cursor: pointer;
  &:disabled {
    background-color: #333;
    cursor: not-allowed;
  }
`;

interface IngestionFormProps {
  onIngestionComplete: () => void;
}

export const IngestionForm: React.FC<IngestionFormProps> = ({ onIngestionComplete }) => {
  const [topic, setTopic] = useState('AI');
  const [subreddit, setSubreddit] = useState('technology');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/ingest-reddit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, subreddit })
      });
      if (!response.ok) throw new Error('Ingestion failed');
      onIngestionComplete();
    } catch (error) {
      console.error(error);
      alert('Failed to ingest data from Reddit.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IngestContainer onSubmit={handleSubmit}>
      <Input type="text" value={subreddit} onChange={e => setSubreddit(e.target.value)} placeholder="Subreddit (e.g., technology)" />
      <Input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g., AI)" />
      <IngestButton type="submit" disabled={isLoading}>{isLoading ? 'Ingesting...' : 'Ingest from Reddit'}</IngestButton>
    </IngestContainer>
  );
};