import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { secretWord, gameBoard, currentRow } = await request.json();

    // Analyze the current game state
    const gameState = analyzeGameState(secretWord, gameBoard, currentRow);
    
    // Generate AI hint based on game state
    const hint = await generateAIHint(gameState);

    return NextResponse.json({ hint });
  } catch (error) {
    console.error('Error generating hint:', error);
    return NextResponse.json(
      { error: 'Failed to generate hint' },
      { status: 500 }
    );
  }
}

interface GameState {
  secretWord: string;
  gameBoard: string[][];
  currentRow: number;
  greenLetters: { [key: string]: number[] }; // letter -> positions
  yellowLetters: { [key: string]: number[] }; // letter -> positions
  grayLetters: Set<string>;
  remainingLetters: string[];
  pattern: string; // e.g., "G_Y__" where G=green, Y=yellow, _=unknown
}

function analyzeGameState(secretWord: string, gameBoard: string[][], currentRow: number): GameState {
  const greenLetters: { [key: string]: number[] } = {};
  const yellowLetters: { [key: string]: number[] } = {};
  const grayLetters = new Set<string>();
  const remainingLetters: string[] = [];
  
  // Analyze all completed rows
  for (let row = 0; row < currentRow; row++) {
    const guess = gameBoard[row];
    if (!guess || guess.length === 0) continue;
    
    // Get colors for this row (you'll need to implement this based on your color logic)
    const colors = getRowColors(secretWord, guess);
    
    for (let i = 0; i < 5; i++) {
      const letter = guess[i];
      if (colors[i] === 'green') {
        if (!greenLetters[letter]) greenLetters[letter] = [];
        greenLetters[letter].push(i);
      } else if (colors[i] === 'yellow') {
        if (!yellowLetters[letter]) yellowLetters[letter] = [];
        yellowLetters[letter].push(i);
      } else if (colors[i] === 'grey') {
        grayLetters.add(letter);
      }
    }
  }
  
  // Find remaining letters
  for (let i = 0; i < 5; i++) {
    const letter = secretWord[i];
    const isFound = greenLetters[letter]?.includes(i);
    if (!isFound) {
      remainingLetters.push(letter);
    }
  }
  
  // Create pattern
  const pattern = secretWord.split('').map((letter, i) => {
    if (greenLetters[letter]?.includes(i)) return 'G';
    if (yellowLetters[letter]?.some(pos => pos !== i)) return 'Y';
    return '_';
  }).join('');
  
  return {
    secretWord,
    gameBoard,
    currentRow,
    greenLetters,
    yellowLetters,
    grayLetters,
    remainingLetters,
    pattern
  };
}

function getRowColors(secretWord: string, guess: string[]): string[] {
  const colors = new Array(5).fill('grey');
  const letterCounts: { [key: string]: number } = {};
  
  // Count letters in secret word
  for (const letter of secretWord) {
    letterCounts[letter] = (letterCounts[letter] || 0) + 1;
  }
  
  // Mark greens first
  for (let i = 0; i < 5; i++) {
    if (guess[i] === secretWord[i]) {
      colors[i] = 'green';
      letterCounts[guess[i]]--;
    }
  }
  
  // Mark yellows
  for (let i = 0; i < 5; i++) {
    if (colors[i] === 'grey' && letterCounts[guess[i]] > 0) {
      colors[i] = 'yellow';
      letterCounts[guess[i]]--;
    }
  }
  
  return colors;
}

async function generateAIHint(gameState: GameState): Promise<string> {
  // This is where you'd integrate with an AI service
  // For now, I'll create a smart hint based on the game state
  
  const { secretWord, greenLetters, yellowLetters, grayLetters, remainingLetters, pattern } = gameState;
  
  // If all letters are found, congratulate
  if (remainingLetters.length === 0) {
    return "Great job! You've found all the letters. Try to arrange them correctly!";
  }
  
  // If no progress, give a general hint
  if (Object.keys(greenLetters).length === 0 && Object.keys(yellowLetters).length === 0) {
    const commonLetters = ['E', 'A', 'R', 'I', 'O', 'T', 'N', 'S'];
    const suggestedLetter = commonLetters.find(letter => 
      !grayLetters.has(letter) && secretWord.toUpperCase().includes(letter)
    );
    
    if (suggestedLetter) {
      return `Try using common letters like "${suggestedLetter}" in your next guess.`;
    } else {
      return "Try a word with common letters like E, A, R, I, O, T, N, S.";
    }
  }
  
  // If some progress, give specific hints
  if (remainingLetters.length <= 2) {
    const missingPositions = [];
    for (let i = 0; i < 5; i++) {
      if (pattern[i] === '_') {
        missingPositions.push(i + 1);
      }
    }
    
    if (missingPositions.length === 1) {
      return `You're very close! Focus on position ${missingPositions[0]}.`;
    } else if (missingPositions.length === 2) {
      return `You're close! Focus on positions ${missingPositions[0]} and ${missingPositions[1]}.`;
    }
  }
  
  // Give letter-specific hints
  const remainingUnique = [...new Set(remainingLetters)];
  if (remainingUnique.length === 1) {
    const letter = remainingUnique[0];
    const positions = [];
    for (let i = 0; i < 5; i++) {
      if (secretWord[i] === letter && pattern[i] === '_') {
        positions.push(i + 1);
      }
    }
    return `The letter "${letter.toUpperCase()}" appears in position${positions.length > 1 ? 's' : ''} ${positions.join(', ')}.`;
  }
  
  // General strategy hint
  if (Object.keys(yellowLetters).length > 0) {
    const yellowLetter = Object.keys(yellowLetters)[0];
    return `Try moving the "${yellowLetter.toUpperCase()}" to a different position.`;
  }
  
  return "Keep trying! You're making progress.";
} 