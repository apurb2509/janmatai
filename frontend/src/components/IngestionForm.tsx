import React, { useState } from 'react';
import styled from 'styled-components';

const IngestWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const IngestContainer = styled.form`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: var(--dark-surface);
  border-radius: 12px;
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

const StatusMessage = styled.div<{ $success: boolean }>`
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: ${props => (props.$success ? 'rgba(29, 209, 161, 0.2)' : 'rgba(255, 107, 107, 0.2)')};
  color: ${props => (props.$success ? '#1dd1a1' : '#ff6b6b')};
  border: 1px solid ${props => (props.$success ? '#1dd1a1' : '#ff6b6b')};
`;

export const IngestionForm: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch('http://localhost:3001/ingest-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ingestion failed');
      }

      setStatus({ message: data.message, success: true });
      window.dispatchEvent(new CustomEvent('dataUpdated'));
      setTopic('');
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : 'An unknown error occurred.', success: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IngestWrapper>
      <IngestContainer onSubmit={handleSubmit}>
        <Input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a topic to research..." />
        <IngestButton type="submit" disabled={isLoading}>{isLoading ? 'Researching...' : 'Research & Ingest'}</IngestButton>
      </IngestContainer>
      {status && <StatusMessage $success={status.success}>{status.message}</StatusMessage>}
    </IngestWrapper>
  );
};