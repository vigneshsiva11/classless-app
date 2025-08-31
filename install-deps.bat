@echo off
echo Installing missing dependencies for Vercel deployment...
echo.

echo Installing openai package...
npm install openai@^4.28.0

echo.
echo Installing all dependencies...
npm install

echo.
echo Dependencies installed successfully!
echo You can now deploy to Vercel without the "openai module not found" error.
echo.
pause
