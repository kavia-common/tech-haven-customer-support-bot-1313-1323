#!/bin/bash
cd /home/kavia/workspace/code-generation/tech-haven-customer-support-bot-1313-1323/tech_haven_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

