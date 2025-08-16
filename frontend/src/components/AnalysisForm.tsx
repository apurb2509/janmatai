import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FormWrapper = styled(motion.div)`
  max-width: 600px;
  margin: 0 auto;
  margin-top: 2rem;
`;

const FormContainer = styled.form`
  background: rgba(40, 40, 40, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormHeader = styled.h3`
  margin: 0;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
`;

const TextArea = styled.textarea`
  height: 150px;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(20, 20, 20, 0.5);
  color: var(--font-color);
  font-size: 1rem;
  resize: vertical;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #00FFFF;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #00FFFF, #FF00FF);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  &:disabled {
    background: #333;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled(motion.div)<{ $error: boolean }>`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(40, 40, 40, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid ${props => (props.$error ? '#ff6b6b' : '#1dd1a1')};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

export const AnalysisForm: React.FC = () => {
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
      window.dispatchEvent(new CustomEvent('dataUpdated'));
      setText('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <FormContainer onSubmit={handleSubmit}>
        <FormHeader>Add a New Viewpoint to the Map</FormHeader>
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., The new policy is a step in the right direction..."
          required
        />
        <SubmitButton 
          type="submit" 
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? 'Processing...' : 'Add to Map'}
        </SubmitButton>
      </FormContainer>

      {result && (
        <ResultContainer 
          $error={false}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <strong>Successfully Added:</strong>
          <p>{result}</p>
        </ResultContainer>
      )}
      {error && (
        <ResultContainer 
          $error={true}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <strong>Error:</strong>
          <p>{error}</p>
        </ResultContainer>
      )}
    </FormWrapper>
  );
};