@echo off
title OVERCRITIC - Backend C# (.NET 8)
echo =======================================================
echo          INICIANDO BACKEND C# DO OVERCRITIC
echo =======================================================
echo.
"%LOCALAPPDATA%\Microsoft\dotnet\dotnet.exe" run --project backend/Overcritic.Api.csproj
pause
