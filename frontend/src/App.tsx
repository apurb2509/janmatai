import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { AnalysisForm } from './components/AnalysisForm';
import { NarrativeMap } from './components/NarrativeMap';
import { Chatbot } from './components/Chatbot';
import { IngestionForm } from './components/IngestionForm';
import { TimelineFilter } from './components/TimelineFilter';
import { DetailsPanel } from './components/DetailsPanel';
import { AnimatedBackground } from './components/AnimatedBackground';

interface Argument {
  id: number;
  extracted_argument: string;
  cluster_id: number | null;
}

const AppContainer = styled.div`
  padding: 2rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
  padding: 1rem;
`;

const Title = styled.h1`
  font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  font-weight: 800;
  font-size: 4rem;
  letter-spacing: -3px;
  
  /* High-contrast, vibrant gradient */
  background: linear-gradient(90deg, #F3F3F3, #C7C7C7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  
  /* Sharp drop shadow for readability */
  text-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
  
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
  font-weight: 400;
  font-size: 1.25rem;
  color: rgba(220, 220, 220, 0.8); /* Brighter, clearer grey */
  margin-top: 0;
  letter-spacing: 0.5px;
  text-shadow: 0px 1px 5px rgba(0, 0, 0, 0.4);
`;

const GlassPanel = styled.div`
  background: rgba(40, 40, 40, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`;

const MapContainer = styled(GlassPanel)`
  height: 500px;
  width: 100%;
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

const ClusterButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  background-color: #1dd1a1;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
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
    <>
      <AnimatedBackground />
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
            <ClusterButton 
              onClick={handleCluster} 
              disabled={isClustering}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isClustering ? 'Calculating...' : 'Find Clusters'}
            </ClusterButton>
          </Controls>

          <SectionTitle>Data Sources</SectionTitle>
          <IngestionForm onIngestionComplete={fetchArguments} />
          <AnalysisForm onIngestionComplete={fetchArguments} />

          <SectionTitle>AxiomBot (RAG Chatbot)</SectionTitle>
          <Chatbot />
        </main>
      </AppContainer>
    </>
  );
}

export default App;
