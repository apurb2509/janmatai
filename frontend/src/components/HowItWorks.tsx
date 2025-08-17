import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HowItWorksContainer = styled(motion.div)`
background: rgba(25, 25, 25, 0.4);
backdrop-filter: blur(10px);
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.1);
padding: 2.5rem 3rem;
margin: 3rem 0;
`;

const SectionTitle = styled.h2`
text-align: center;
font-size: 2rem;
font-weight: 700;
color: #9aeaa1;
margin-bottom: 1.5rem;
text-shadow: 0 0 10px rgba(0, 0, 10, 0.3);
`;

const SummaryParagraph = styled.p`
text-align: center;
max-width: 800px;
margin: 0 auto 3rem auto;
font-size: 1.1rem;
line-height: 1.8;
color: rgba(220, 220, 220, 0.9);
`;

const StepsContainer = styled.div`
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 2rem;
`;

const StepCard = styled(motion.div)`
background: rgba(40, 40, 40, 0.5);
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.1);
padding: 1.5rem;
text-align: center;
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
display: flex;
flex-direction: column;
`;

const StepIcon = styled.div`
font-size: 2.5rem;
line-height: 1;
margin-bottom: 1.5rem;
text-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
`;

const StepTitle = styled.h3`
font-size: 1.15rem;
font-weight: 600;
color: #fff;
margin-bottom: 1rem;
`;

const StepDescription = styled.p`
font-size: 0.95rem;
line-height: 1.7;
color: rgba(220, 220, 220, 0.9);
flex-grow: 1;
`;

const cardVariants = {
hidden: { opacity: 0, y: 30 },
visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
    delay: i * 0.2,
    duration: 0.5,
    ease: 'easeOut',
    },
}),
};

const hoverColors = [
'rgba(0, 255, 255, 0.2)', // Cyan
'rgba(255, 0, 255, 0.2)', // Magenta
'rgba(0, 255, 0, 0.2)',   // Lime
'rgba(131, 2, 163, 0.3)'   // Purple
];

const hoverBorderColors = [
'rgba(0, 255, 255, 0.5)',
'rgba(255, 0, 255, 0.5)',
'rgba(0, 255, 0, 0.5)',
'rgba(131, 2, 163, 0.6)'
];

export const HowItWorks: React.FC = () => {
const steps = [
    {
    icon: '📥',
    title: '1. Ingest & Research',
    description: 'To begin, populate the database using the "Data Sources" forms. Use "Research & Ingest" to analyze a broad topic from live news, or paste a specific opinion into the "Add a new viewpoint" form. This builds a custom knowledge base for your analysis.'
    },
    {
    icon: '🧠',
    title: '2. AI-Powered Analysis',
    description: 'Every piece of text you ingest is automatically processed by Google\'s Gemini AI. It extracts the core argument and converts its meaning into a vector embedding—a unique digital fingerprint that allows the system to understand and compare ideas.'
    },
    {
    icon: '🌐',
    title: '3. Discover Narratives',
    description: 'Once you have data, click "Find Clusters". The DBSCAN algorithm groups similar arguments, revealing the dominant narratives in the conversation. These are then visualized as distinct, color-coded clusters on the 3D map for intuitive exploration.'
    },
    {
    icon: '�',
    title: '4. Explore & Query',
    description: 'Interact with the 3D map by clicking any bubble. The camera will zoom in on its cluster and draw connection lines to its peers. For deeper insights, ask AxiomBot a question to get a synthesized, data-driven answer from your unique dataset.'
    }
];

return (
    <HowItWorksContainer>
    <SectionTitle>How Janmat AI Works</SectionTitle>
    <SummaryParagraph>
        Janmat AI is a sophisticated public opinion intelligence platform designed to provide deep, strategic insights into complex public discourse. It functions by automatically ingesting real-time global news via variours sources such as Reddit, NewsAPI.org and user-submitted data, then utilizing a multi-step AI pipeline to analyze the text, extract core arguments, and group them into thematic clusters using machine learning. The primary benefit of Janmat AI is its ability to move beyond simple sentiment analysis; instead of just showing if public opinion is positive or negative, it reveals the underlying why by mapping the entire "battlefield of ideas" in an interactive 3D visualization. This makes it different from other tools by offering a real-time, qualitative understanding of emergent narratives, which can be queried in natural language through its advanced RAG chatbot, AxiomBot.
    </SummaryParagraph>
    <StepsContainer>
        {steps.map((step, index) => (
        <StepCard
            key={index}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            whileHover={{ 
            y: -10,
            scale: 1.03,
            boxShadow: `0 15px 40px ${hoverColors[index]}`,
            borderColor: hoverBorderColors[index]
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
            <StepIcon>{step.icon}</StepIcon>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
        </StepCard>
        ))}
    </StepsContainer>
    </HowItWorksContainer>
);
};
