import React from 'react';
import styled from 'styled-components';

interface Argument {
  id: number;
  extracted_argument: string;
  cluster_id: number | null;
}

const PanelContainer = styled.div`
  position: absolute;
  top: 100px;
  right: 20px;
  width: 250px;
  background-color: rgba(36, 36, 36, 0.9);
  border: 1px solid #444;
  border-radius: 12px;
  padding: 1.5rem;
  color: #eee;
  backdrop-filter: blur(5px);
  z-index: 100;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Title = styled.h3`
  margin-top: 0;
  color: #1dd1a1;
`;

const Content = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
`;

interface DetailsPanelProps {
  argument: Argument | null;
  onClose: () => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ argument, onClose }) => {
  if (!argument) {
    return null;
  }

  return (
    <PanelContainer>
      <CloseButton onClick={onClose}>&times;</CloseButton>
      <Title>Argument Details</Title>
      <Content>{argument.extracted_argument}</Content>
    </PanelContainer>
  );
};