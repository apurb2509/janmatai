import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutContainer = styled(motion.div)`
  padding: 8rem 2rem 2rem 2rem;
  max-width: 900px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.9);
`;

const Section = styled(motion.section)`
  margin-bottom: 3rem;
  background: rgba(30, 30, 30, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -1px;
  background: linear-gradient(90deg, #00FFFF, #FF00FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  margin-bottom: 1rem;
`;

const Paragraph = styled.p`
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(220, 220, 220, 0.9);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
`;

const FeatureItem = styled.li`
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  position: relative;
  &:before {
    content: '✦';
    position: absolute;
    left: 0;
    color: #00FFFF;
    font-size: 1rem;
  }
`;

const FeatureTitle = styled.strong`
  color: #fff;
  font-weight: 600;
`;

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const AboutPage: React.FC = () => {
  return (
    <AboutContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Section variants={sectionVariants} initial="hidden" animate="visible">
        <Title>What is Janmat AI?</Title>
        <Paragraph>
          <strong>Janmat AI</strong> is a sophisticated intelligence platform designed to navigate the complex ocean of public discourse. The name itself, "Janmat" (जनमत), is a Hindi word meaning "public opinion." It reflects our core mission: to move beyond simplistic sentiment analysis and provide a deep, strategic understanding of the narratives that shape our world. In an age of information overload, Janmat AI acts as a digital macroscope, revealing the hidden structures and dynamic currents within the global conversation.
        </Paragraph>
      </Section>

      <Section variants={sectionVariants} initial="hidden" animate="visible">
        <Title>The Vision</Title>
        <Paragraph>
          Governments, corporations, and organizations spend billions on traditional methods like surveys and focus groups to understand public sentiment. While valuable, these methods are often slow, expensive, and fail to capture the raw, unfiltered, and rapidly evolving nature of online discourse. Janmat AI was built to bridge this gap. Our vision is to provide a real-time, AI-powered lens that doesn't just tell you 'if' people are positive or negative, but reveals 'why'. It maps the entire battlefield of ideas, identifying the core arguments, the communities making them, and how narratives gain or lose traction over time.
        </Paragraph>
      </Section>

      <Section variants={sectionVariants} initial="hidden" animate="visible">
        <Title>Core Features</Title>
        <Paragraph>
          Janmat AI integrates a suite of advanced technologies to deliver unparalleled insights:
        </Paragraph>
        <FeatureList>
          <FeatureItem>
            <FeatureTitle>Live Narrative Map:</FeatureTitle> A dynamic 3D visualization that represents different arguments as interactive clusters, allowing for an intuitive exploration of the data landscape.
          </FeatureItem>
          <FeatureItem>
            <FeatureTitle>Automated Data Ingestion:</FeatureTitle> A background worker continuously pulls in the latest global news from thousands of sources, ensuring the database is always current and relevant.
          </FeatureItem>
          <FeatureItem>
            <FeatureTitle>AI-Powered Clustering:</FeatureTitle> Using advanced machine learning algorithms, the platform automatically groups semantically similar arguments, revealing the core themes of the conversation without human bias.
          </FeatureItem>
          <FeatureItem>
            <FeatureTitle>AxiomBot (RAG Chatbot):</FeatureTitle> An intelligent conversational agent that allows you to query the entire database in natural language. It first searches for specific data to answer your question and, if none is found, falls back to a general AI to provide a helpful response.
          </FeatureItem>
          <FeatureItem>
            <FeatureTitle>Datewise Sorting:</FeatureTitle> A timeline filter that enables historical analysis, allowing you to see how public opinion on any given topic has evolved over time.
          </FeatureItem>
        </FeatureList>
      </Section>
    </AboutContainer>
  );
};
