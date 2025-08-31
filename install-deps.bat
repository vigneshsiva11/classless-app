@echo off
echo Installing missing dependencies for Netlify deployment...
echo.

echo Installing openai package...
pnpm add openai@^4.104.0

echo.
echo Installing all dependencies and updating lock file...
pnpm install

echo.
echo Dependencies installed successfully!
echo Lock file updated! You can now deploy to Netlify without errors.
echo.
pause
