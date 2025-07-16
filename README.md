Personal website of Rio Blumenthal!
Made using create-next-app with next.js.

## AI Hints Setup

To enable AI-powered hints in the Wordle game, you need to set up an OpenAI API key:

1. Get an OpenAI API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a `.env.local` file in the root directory
3. Add your API key: `OPENAI_API_KEY=your_api_key_here`
4. Restart your development server

The AI hints will analyze the player's guesses and provide strategic advice without giving away the answer.