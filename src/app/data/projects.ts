export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  github?: string;
  video?: string;
  date: string;
  longDescription?: string;
}

export const projects: Project[] = [
  {
    id: "arduino-connect-4",
    title: "Arduino Connect 4",
    description: "Designed and programmed an LED connect 4 game on a 7x7 grid of 5V individually addressable LEDS put in cardboard.",
    technologies: ["Arduino", "C++", "Electronics"],
    image: "/projects/connect4.png",
    github: "https://github.com/RioBlumenthal/LED-Connect-4",
    video: "https://www.youtube.com/embed/GC4mt7rIG38",
    date: "2023",
    longDescription: "Controlled by a breadboard with buttons connected to an Arduino Uno running a custom script. The project demonstrates hardware integration, LED control, and game logic implementation."
  },
  {
    id: "pcb-led-heart",
    title: "PCB LED Heart",
    description: "Designed a circuit in KiCad and had it cut out by PCBWay. Soldered components and programmed light patterns with Arduino Uno.",
    technologies: ["KiCad", "Arduino", "PCB Design", "Electronics"],
    image: "/projects/pcb.png",
    video: "https://www.youtube.com/embed/ceVoMsNLLWc",
    date: "2023",
    longDescription: "Made in collaboration with WPI's IEEE, this project involved circuit design, PCB manufacturing, component soldering, and programming custom light patterns."
  },
  {
    id: "wordle-unlimited",
    title: "Wordle Unlimited",
    description: "Created the classic NYT game 'Wordle' in Java with additional features like hints, unlimited play, and custom messages.",
    technologies: ["Java", "Data Structures", "UI Design"],
    image: "/projects/wordle.png",
    github: "https://github.com/RioBlumenthal/Wordle",
    date: "2023",
    longDescription: "Based on a Stanford demonstration, I enhanced the game by scraping NYT dictionaries and adding features like hints, reset functionality, and a reveal button. The game includes custom messages based on performance and various quality-of-life improvements."
  },
  {
    id: "automated-emails",
    title: "Automated Emails",
    description: "Used Google Apps Script and OpenAI's API to automatically parse and respond to emails using AI models.",
    technologies: ["Google Apps Script", "OpenAI API", "JavaScript", "AI"],
    image: "/projects/email.png",
    date: "2023",
    longDescription: "Created a framework to automatically process incoming emails and generate responses using OpenAI models and custom response templates. The system streamlines email communication through intelligent automation."
  },
  {
    id: "frc-scouting",
    title: "FRC Scouting System",
    description: "Redesigned FRC team's scouting structure for efficient bot analysis, alliance formation, and match strategy.",
    technologies: ["Google Sheets", "Data Analysis", "Strategy"],
    image: "/projects/scouting.png",
    github: "https://github.com/lasarobotics",
    date: "2023",
    longDescription: "Developed a comprehensive scouting system that helped form alliances, create pick orders, and predict match outcomes. The system contributed significantly to the team's success in 2023."
  },
  {
    id: "ai-tutoring-bot",
    title: "AI Tutoring Bot",
    description: "Developed an AI chatbot for tutoring AP U.S. History students using Llama3 and RAG system.",
    technologies: ["Python", "Llama3", "RAG", "Machine Learning"],
    image: "/projects/tutor.png",
    github: "https://github.com/jake-molnia/NERD",
    date: "2024",
    longDescription: "Collaborated with graduate students to create an intelligent tutoring system. Used the CLASS framework to provide constructive feedback, achieving 97% accuracy in evaluations and outperforming ChatGPT on test data."
  },
  {
    id: "mtg-discord-bot",
    title: "MTG Discord Bot",
    description: "Created a Discord bot using trie structure to identify and display Magic: The Gathering cards from messages.",
    technologies: ["Python", "Discord API", "Scryfall API", "Data Structures"],
    image: "/projects/magic.png",
    github: "https://github.com/davidblumenthal/discord-mtg-card-bot",
    date: "2023",
    longDescription: "Implemented an efficient card recognition system using trie data structure, integrating with Scryfall's API to provide card information in Discord channels."
  },
  {
    id: "strands-solver",
    title: "NYT Strands Solver",
    description: "Created a solver for NYT Strands puzzle using Selenium webscraping and algorithmic solving.",
    technologies: ["Python", "Selenium", "Algorithms"],
    image: "/projects/strands.png",
    github: "https://github.com/RioBlumenthal/Strands-Solver",
    date: "2024",
    longDescription: "Developed a program that scrapes the NYT Strands website for the current board and implements a solving algorithm to find all possible solutions using a dictionary."
  },
  {
    id: "hearts-game",
    title: "Hearts Game and AI",
    description: "Implemented the card game Hearts in Java with multiple levels of AI opponents and testing framework.",
    technologies: ["Java", "AI", "Game Development"],
    image: "/projects/hearts.png",
    github: "https://github.com/RioBlumenthal/hearts",
    date: "2023",
    longDescription: "Created a complete implementation of Hearts with both multiplayer and AI modes. Developed multiple tiers of AI opponents and a testing system to evaluate their performance."
  },
  {
    id: "researchella",
    title: "Researchella",
    description: "Full-stack web app for undergraduates to apply for research positions. Auth0 authentication, AWS hosting, and a modern React/Flask/Oracle stack.",
    technologies: ["Python", "JavaScript", "Flask", "Oracle", "Bootstrap", "React", "Docker", "AWS"],
    image: "/projects/researchella.png",
    date: "2025",
    longDescription: "Collaborated with a group of undergraduates to create a full-stack web application. Implemented Auth0 authentication, and hosted on AWS. Allowed undergraduate students to easily apply for research positions posted by faculty."
  },
  {
    id: "postsmiles",
    title: "PostSmiles",
    description: "Simple social media web app to post things that made you smile. Flask backend, Bootstrap styling, and JS/HTML/CSS frontend.",
    technologies: ["Python", "Flask", "Oracle", "Bootstrap", "JavaScript", "HTML", "CSS"],
    image: "/projects/postsmiles.png",
    date: "2025",
    longDescription: "Developed a simple social media web application to allow users to post things that made them smile. Uses JS, HTML, and CSS for the frontend with a Flask Python backend and Bootstrap for styling."
  },
  {
    id: "snake-ai",
    title: "Snake AI",
    description: "Trained and evaluated a Snake machine learning model using CNN and reinforcement learning.",
    technologies: ["Python", "Machine Learning", "Deep Learning", "CNN", "Reinforcement Learning"],
    image: "/projects/snakeai.png",
    video: "https://www.youtube.com/embed/2PeBIZJyi7g",
    date: "2025",
    longDescription: "Collaborated with other grad students to train and evaluate a Snake machine learning model. Aggregated data from 20+ skilled players into a database to train a convolutional neural network, and compared its performance to a reinforcement learning model we created. Final model consistently outperformed human players."
  }
]; 