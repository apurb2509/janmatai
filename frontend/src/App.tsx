import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { AnalysisForm } from './components/AnalysisForm';
import { NarrativeMap } from './components/NarrativeMap';
import { Chatbot } from './components/Chatbot';
import { IngestionForm } from './components/IngestionForm';
import { TimelineFilter } from './components/TimelineFilter';
import { DetailsPanel } from './components/DetailsPanel';

export interface Argument {
  id: number;
  extracted_argument: string;
  cluster_id: number | null;
}

const AppContainer = styled.div`
  padding: 2rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: var(--font-color);
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #aaa;
  margin-top: -1rem;
`;

const MapContainer = styled.div`
  height: 500px;
  width: 100%;
  background-color: var(--dark-surface);
  border-radius: 12px;
  border: 1px solid #333;
  position: relative;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  margin-top: 1.5rem;
`;

const ClusterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background-color: #1dd1a1;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover { background-color: #17a07f; }
  &:disabled { background-color: #333; cursor: not-allowed; }
`;

const SectionTitle = styled.h2`
  text-align: center;
  color: #ccc;
  font-weight: 500;
  margin-top: 4rem;
  margin-bottom: 1rem;
`;

function App() {
  const [args, setArgs] = useState<Argument[]>([]);
  const [isClustering, setIsClustering] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedArgument, setSelectedArgument] = useState<Argument | null>(null);

  const fetchArguments = useCallback(async () => {
    try {
      let url = 'http://localhost:3001/arguments';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setArgs(data);
    } catch (error) { console.error("Failed to fetch arguments:", error); }
  }, [startDate, endDate]);

  const handleCluster = async () => {
    setIsClustering(true);
    try {
      await fetch('http://localhost:3001/cluster', { method: 'POST' });
      await fetchArguments();
    } catch (error) { console.error("Failed to run clustering:", error); } 
    finally { setIsClustering(false); }
  };

  useEffect(() => {
    fetchArguments();
  }, [fetchArguments]);

  return (
    <AppContainer>
      <Header>
        <Title>Janmat AI</Title>
        <Subtitle>The Public Opinion Intelligence Platform</Subtitle>
      </Header>
      <main>
        <SectionTitle>Live Narrative Map</SectionTitle>
        <MapContainer>
          <NarrativeMap arguments={args} onBubbleClick={setSelectedArgument} />
          <DetailsPanel argument={selectedArgument} onClose={() => setSelectedArgument(null)} />
        </MapContainer>
        <Controls>
          <TimelineFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <ClusterButton onClick={handleCluster} disabled={isClustering}>
            {isClustering ? 'Calculating...' : 'Find Clusters'}
          </ClusterButton>
        </Controls>

        <SectionTitle>Data Sources</SectionTitle>
        <IngestionForm onIngestionComplete={fetchArguments} />
        <AnalysisForm onAnalysisComplete={fetchArguments} />

        <SectionTitle>Ask the Data</SectionTitle>
        <Chatbot />
      </main>
    </AppContainer>
  );
}

export default App;