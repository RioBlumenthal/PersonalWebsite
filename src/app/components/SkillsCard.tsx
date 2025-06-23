"use client";

import { motion } from "framer-motion";

interface SkillsCardProps {
  category: string;
  skills: string[];
  delay?: number;
}

export default function SkillsCard({ category, skills, delay = 0 }: SkillsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="skills-card"
    >
      <h3 className="skills-category">{category}</h3>
      <div className="skills-list">
        {skills.map((skill, index) => (
          <motion.span
            key={index}
            className="skill-tag"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay + index * 0.1 }}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
} 