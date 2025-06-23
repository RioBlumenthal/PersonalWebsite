"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ExperienceCardProps {
  title: string;
  organization: string;
  location: string;
  date: string;
  points: string[];
  delay?: number;
  children?: ReactNode;
}

export default function ExperienceCard({
  title,
  organization,
  location,
  date,
  points,
  delay = 0,
  children
}: ExperienceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="experience-card"
    >
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <h4 className="card-organization">{organization}</h4>
        </div>
        <div className="card-meta">
          <span className="card-location">{location}</span>
          <span className="card-date">{date}</span>
        </div>
      </div>
      {points.length > 0 && (
        <ul className="card-points">
          {points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      )}
      {children}
    </motion.div>
  );
} 