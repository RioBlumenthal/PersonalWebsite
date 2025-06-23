"use client";

import { motion } from "framer-motion";

interface CourseworkGridProps {
  courses: string[];
  delay?: number;
}

export default function CourseworkGrid({ courses, delay = 0 }: CourseworkGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="coursework-grid"
    >
      {courses.map((course, index) => (
        <motion.div
          key={index}
          className="course-item"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: delay + index * 0.05,
            ease: "easeOut"
          }}
        >
          {course}
        </motion.div>
      ))}
    </motion.div>
  );
} 