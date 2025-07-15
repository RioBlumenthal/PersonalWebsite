"use client";

import ResumeSection from "../components/ResumeSection";
import ExperienceCard from "../components/ExperienceCard";
import SkillsCard from "../components/SkillsCard";
import CourseworkGrid from "../components/CourseworkGrid";

export default function Resume() {
  const education = {
    school: "Worcester Polytechnic Institute",
    degree: "Master of Computer Science, Bachelor of Science in Computer Science",
    location: "Worcester, MA",
    date: "Aug. 2023 – May 2027",
    courses: [
      "Graduate Algorithm Design and Analysis",
      "Graduate Artificial Intelligence",
      "Graduate Machine Learning",
      "Object Oriented Design",
      "Systems Programming",
      "Database Systems",
      "Advanced Database Systems",
      "Software Engineering",
      "Introduction to Program Design",
      "Discrete Mathematics",
      "Algorithms",
      "Advanced Linear Algebra",
      "Introduction to Electrical and Computer Engineering",
      "Computer Graphics"
    ]
  };

  const experiences = [
    {
      title: "Software Engineering Intern",
      organization: "Stealth Power",
      location: "Austin, TX",
      date: "May 2025 – August 2025",
      points: [
        "Updated entire dashboard infrastructure to modern best practices, migrating from create-react-app to Next.js",
        "Created dashboards to view and analyze 100,000+ systems",
        "Integrated AI to allow users to ask queries in plain english, with custom React cards for visualization",
        "Detected and patched three critical security vulnerabilities, and updated authentication to prevent future issues"
      ]
    },
    {
      title: "Algorithm Design and Analysis Teaching Assistant",
      organization: "Worcester Polytechnic Institute",
      location: "Worcester, MA",
      date: "Aug. 2025 – Present",
      points: [
        "Worked with professor to facilitate student engagement and learning",
        "Created challenging homeworks and quizzes for PhD level graduate Algorithms course"
      ]
    },
    {
      title: "Artificial Intelligence Researcher",
      organization: "Worcester Polytechnic Institute",
      location: "Worcester, MA",
      date: "June 2024 – Aug. 2024",
      points: [
        "Collaborated with a team of grad students to create an AI chatbot for tutoring students in AP U.S. History",
        "Used CLASS framework to provide feedback in a constructive manner, which was evaluated as 97% accurate",
        "Created a RAG for knowledge base on top of pretrained Llama2, which together outperformed ChatGPT on test data",
        "Gained experience in AI, research, algorithms, and large-scale collaborative projects"
      ]
    }
  ];

  const projects = [
    {
      title: "Researchella",
      organization: "Python, JS, Flask, Oracle, Bootstrap, React, Docker, AWS",
      location: "",
      date: "Feb. 2025 – March 2025",
      points: [
        "Collaborated with a group of undergraduates to create a full-stack web application",
        "Implemented Auth0 authentication, and hosted on AWS",
        "Allowed undergraduate students to easily apply for research positions posted by faculty"
      ]
    },
    {
      title: "PostSmiles",
      organization: "Python, Flask, Oracle, Bootstrap",
      location: "",
      date: "Jan. 2025 – Feb. 2025",
      points: [
        "Developed a simple social media web application to allow users to post things that made them smile",
        "Uses JS, HTML, and CSS for the frontend with a Flask Python backend and Bootstrap for styling"
      ]
    },
    {
      title: "Snake AI",
      organization: "Python, Machine Learning",
      location: "",
      date: "Jan. 2025 – May. 2025",
      points: [
        "Collaborated with other grad students to train and evaluate a Snake machine learning model",
        "Aggregated data from 20+ skilled players into a database to train a convolutional neural network, and compared its performance to a reinforcement learning model we created",
        "Final model consistently outperformed human players"
      ]
    },
    {
      title: "Logisim Microprocessor",
      organization: "Logisim, Python, Assembly, Machine Code",
      location: "",
      date: "Jan. 2023 – May. 2023",
      points: [
        "Designed, simulated, and programmed a pipelined microprocessor.",
        "Used Logisim to create from transistor level, and used custom Python script to convert readable Assembly to circuit-level code."
      ]
    }
  ];

  const skills = [
    {
      category: "Languages",
      skills: ["Python", "Java", "C/C++", "JavaScript", "TypeScript", "HTML/CSS", "MATLAB", "Assembly", "SQL", "React", "R"]
    },
    {
      category: "Frameworks",
      skills: ["React", "Node.js", "Flask", "JUnit", "Next.js", "Express.js"]
    },
    {
      category: "Developer Tools",
      skills: ["GitHub", "LaTeX", "KiCad", "Oracle", "VS Code", "IntelliJ", "Cursor", "WebStorm"]
    },
    {
      category: "Libraries",
      skills: ["Pandas", "NumPy", "Matplotlib", "PyTorch", "SciKit-learn", "TensorFlow", "OpenCV"]
    }
  ];

  return (
    <div className="resume-container">
      <div className="flex justify-center mb-8">
        <a
          href="/Resume.pdf"
          download
          className="bg-[#89cff0] hover:bg-[#7bb8d9] text-[#171717] px-6 py-3 rounded-lg font-medium transition-colors duration-200 dark:bg-[#0077b6] dark:hover:bg-[#005a8a] dark:text-[#ededed] inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Resume
        </a>
      </div>
      <ResumeSection title="Education" delay={0.1}>
        <div className="section-content">
          <ExperienceCard
            title={education.degree}
            organization={education.school}
            location={education.location}
            date={education.date}
            points={[]}
            delay={0.2}
          >
            <div className="coursework-container">
              <h3 className="coursework-title">Relevant Completed Coursework</h3>
              <CourseworkGrid courses={education.courses} delay={0.3} />
            </div>
          </ExperienceCard>
        </div>
      </ResumeSection>

      <ResumeSection title="Experience" delay={0.4}>
        <div className="section-content experience-grid">
          {experiences.map((exp, index) => (
            <ExperienceCard
              key={index}
              {...exp}
              delay={0.5 + index * 0.1}
            />
          ))}
        </div>
      </ResumeSection>

      <ResumeSection title="Projects" delay={0.6}>
        <div className="section-content projects-grid">
          {projects.map((project, index) => (
            <ExperienceCard
              key={index}
              {...project}
              delay={0.7 + index * 0.1}
            />
          ))}
        </div>
      </ResumeSection>

      <ResumeSection title="Technical Skills" delay={0.8}>
        <div className="skills-grid">
          {skills.map((skillSet, index) => (
            <SkillsCard
              key={index}
              {...skillSet}
              delay={0.9 + index * 0.1}
            />
          ))}
        </div>
      </ResumeSection>
    </div>
  );
} 