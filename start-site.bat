@echo off
title Birthday Site - local preview
start "" http://localhost:8787
node "%~dp0serve.js"
