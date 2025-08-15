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
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #555;
  background-color: #333;
  color: var(--font-color);
  font-size: 1rem;
  flex-grow: 1;
`;

const IngestButton = styled.button`
  padding: 0.75rem 1.5rem;
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
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/ingest-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (!response.ok) throw new Error('Ingestion failed');
      onIngestionComplete();
      setTopic('');
    } catch (error) {
      console.error(error);
      alert('Failed to ingest research data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IngestContainer onSubmit={handleSubmit}>
      <Input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a topic to research..." />
      <IngestButton type="submit" disabled={isLoading}>{isLoading ? 'Researching...' : 'Research & Ingest'}</IngestButton>
    </IngestContainer>
  );
};