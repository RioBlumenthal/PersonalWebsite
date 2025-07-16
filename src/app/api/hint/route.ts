import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { secretWord, gameBoard, currentRow } = await request.json();

    // Get the guesses so far (completed rows)
    const guesses = gameBoard.slice(0, currentRow).filter((row: string[]) => row.length > 0);
    
    // Create the prompt for OpenAI
    const prompt = createHintPrompt(secretWord, guesses);
    
    // Call OpenAI API
    const hint = await callOpenAI(prompt);

    return NextResponse.json({ hint });
  } catch (error) {
    console.error('Error generating hint:', error);
    return NextResponse.json(
      { error: 'Failed to generate hint' },
      { status: 500 }
    );
  }
}

function createHintPrompt(secretWord: string, guesses: string[][]): string {
  const secretWordUpper = secretWord.toUpperCase();
  
  let prompt = `You are helping a player with a Wordle game. The secret word is "${secretWordUpper}". `;
  
  if (guesses.length === 0) {
    prompt += `The player hasn't made any guesses yet. Suggest a good starting word with common letters like E, A, R, I, O, T, N, S. Keep it short and friendly.`;
  } else {
    prompt += `The player has made these guesses so far:\n`;
    guesses.forEach((guess, index) => {
      prompt += `Guess ${index + 1}: ${guess.join('').toUpperCase()}\n`;
    });
    prompt += `\nProvide a word-level hint that gives clues about the word itself. Focus on:`;
    prompt += `\n- Word categories (animals, colors, objects, etc.)`;
    prompt += `\n- Word characteristics (starts with vowel, ends with E, etc.)`;
    prompt += `\n- Word associations (related to nature, food, etc.)`;
    prompt += `\n- Word patterns (double letters, common word endings, etc.)`;
    prompt += `\nKeep it under 100 characters and give a clue about the word, not individual letters.`;
    prompt += `\n\nExamples of good hints: "It's a fruit", "Starts with a vowel", "Ends with E", "Has double letters", "It's a color"`;
    prompt += `\nExamples of bad hints: "Focus on position 4" or "Try letter L" (too specific to letters)`;
  }
  
  return prompt;
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Wordle assistant. Provide word-level hints that give clues about the word itself (category, characteristics, patterns). DO NOT suggest specific letters or positions. Focus on what the word IS, not how to spell it. Keep responses under 100 characters.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || 'Try a different approach!';
} 