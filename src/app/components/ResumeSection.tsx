"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ResumeSectionProps {
  title: string;
  children: ReactNode;
  delay?: number;
}

export default function ResumeSection({ title, children, delay = 0 }: ResumeSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="resume-section"
    >
      <h2 className="section-title">{title}</h2>
      <div className="section-content">
        {children}
      </div>
    </motion.div>
  );
} 