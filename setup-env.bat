@echo off
echo Creating .env.local file for CLASS_LESS...
echo.

echo # OpenAI API Key for Whisper transcription > .env.local
echo # Get your key from: https://platform.openai.com/api-keys >> .env.local
echo OPENAI_API_KEY=sk-your-openai-api-key-here >> .env.local
echo. >> .env.local
echo # Google Gemini API Key (fallback for transcription and AI responses) >> .env.local
echo # Get your key from: https://makersuite.google.com/app/apikey >> .env.local
echo GEMINI_API_KEY=your-gemini-api-key-here >> .env.local
echo. >> .env.local
echo # Next.js configuration >> .env.local
echo NEXTAUTH_SECv
RET=your-nextauth-secret-here >> .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local

echo.
echo .env.local file created successfully!
echo.
echo NEXT STEPS:
echo 1. Get your OpenAI API key from: https://platform.openai.com/api-keys
echo 2. Edit .env.local and replace "sk-your-openai-api-key-here" with your actual key
echo 3. Restart your development server: npm run dev
echo.
echo Press any key to continue...
pause > nul
