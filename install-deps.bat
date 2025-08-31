@echo off
echo Installing missing dependencies for Netlify deployment...
echo.

echo Installing openai package...
pnpm add openai@^4.104.0

echo.
echo Updating lock file to fix ERR_PNPM_OUTDATED_LOCKFILE error...
pnpm install --update-lockfile

echo.
echo Dependencies installed successfully!
echo Lock file updated! You can now deploy to Netlify without errors.
echo.
pause
