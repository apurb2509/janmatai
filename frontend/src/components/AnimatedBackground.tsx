import React from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';

const BackgroundContainer = styled.div`
 position: fixed;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 overflow: hidden;
 z-index: -1;
 background: linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%);
`;

const GradientBlob = styled(motion.div)<{ color: string; top?: string; left?: string; right?: string; bottom?: string; size: string; }>`
 position: absolute;
 background: radial-gradient(circle, ${props => props.color} 20%, transparent 70%);
 border-radius: 50%;
 width: ${props => props.size};
 height: ${props => props.size};
 filter: blur(150px);
 mix-blend-mode: color-dodge;
 opacity: 0.7;
 top: ${props => props.top};
 left: ${props => props.left};
 right: ${props => props.right};
 bottom: ${props => props.bottom};
 will-change: transform;
`;

export const AnimatedBackground: React.FC = () => {
 const { scrollYProgress } = useScroll();

 // Neon Blue
 const y1 = useTransform(scrollYProgress, [0, 1], [-180, 220]);
 const x1 = useTransform(scrollYProgress, [0, 1], [-120, 120]);
 const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 40]);

 // Neon Pink
 const y2 = useTransform(scrollYProgress, [0, 1], [220, -180]);
 const x2 = useTransform(scrollYProgress, [0, 1], [60, -140]);
 const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -50]);

 // Neon Green
 const y3 = useTransform(scrollYProgress, [0, 1], [-220, 180]);
 const x3 = useTransform(scrollYProgress, [0, 1], [140, -60]);
 const rotate3 = useTransform(scrollYProgress, [0, 1], [-30, 30]);

 // Neon Purple
 const y4 = useTransform(scrollYProgress, [0, 1], [120, -120]);
 const x4 = useTransform(scrollYProgress, [0, 1], [-160, 160]);
 const rotate4 = useTransform(scrollYProgress, [0, 1], [50, -20]);

 return (
   <BackgroundContainer>
     <GradientBlob style={{ y: y1, x: x1, rotate: rotate1 }} color="#00FFFF" size="600px" top="5%" left="10%" /> {/* Cyan */}
     <GradientBlob style={{ y: y2, x: x2, rotate: rotate2 }} color="#FF00FF" size="700px" top="40%" left="40%" /> {/* Magenta */}
     <GradientBlob style={{ y: y3, x: x3, rotate: rotate3 }} color="#00FF00" size="550px" bottom="10%" right="5%" /> {/* Lime */}
     <GradientBlob style={{ y: y4, x: x4, rotate: rotate4 }} color="#FF00FF" size="500px" bottom="40%" right="50%" /> {/* Fuchsia */}
   </BackgroundContainer>
 );
};
