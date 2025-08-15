import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
`;

const TextArea = styled.textarea`
  height: 150px;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #555;
  background-color: var(--dark-surface);
  color: var(--font-color);
  font-size: 1rem;
  resize: vertical;

  &:focus {
    outline: 2px solid var(--accent-color);
    border-color: var(--accent-color);
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background-color: var(--accent-color);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #535bf2;
  }

  &:disabled {
    background-color: #333;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--dark-surface);
  border-radius: 8px;
  border-left: 4px solid var(--accent-color);
  white-space: pre-wrap;
  word-wrap: break-word;
`;

interface AnalysisFormProps {
  onAnalysisComplete: () => void;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('http://localhost:3001/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to process the request.' }));
        throw new Error(errorData.message || 'Failed to process the request.');
      }

      const data = await response.json();
      setResult(data.argument);
      onAnalysisComplete();
      setText('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FormContainer onSubmit={handleSubmit}>
        <label htmlFor="text-input">Add a new viewpoint to the map:</label>
        <TextArea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., The new policy is a step in the right direction..."
          required
        />
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Add to Map'}
        </SubmitButton>
      </FormContainer>

      {result && (
        <ResultContainer>
          <strong>Successfully Added:</strong>
          <p>{result}</p>
        </ResultContainer>
      )}
      {error && <ResultContainer style={{ borderColor: 'red' }}><strong>Error:</strong><p>{error}</p></ResultContainer>}
    </>
  );
};