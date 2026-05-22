@echo off
echo ============================================
echo  Starting WealthWise AI Server
echo ============================================
echo.
echo  The chatbot will use:
echo   - Comprehensive financial knowledge base
echo   - Real-time web search (DuckDuckGo, Wikipedia, Yahoo Finance, Google News)
echo   - SA-specific tax, investment, retirement, and estate planning data
echo.
echo  Opening app in browser...
start "" http://localhost:3456
echo.
cd /d "%~dp0"
node server.js
pause
