#!/bin/bash

# Colors foe pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Start frontend in background
echo -e "${YELLOW}Starting React (Vite) + Express dev servers...${NC}"

# Start both servers
(cd backend && npm run dev) & BACK_PID=$!
(cd frontend && npm run dev) & FRONT_PID=$!

# Print success indicators
sleep 1

echo -e "${GREEN}Starting Express dev server is running... (PID: $BACK_PID) ${NC}"
echo -e "${GREEN}Starting Vite dev server is running... (PID: $FRONT_PID) ${NC}"

# Cleanup on exit
trap "echo -e '\n${RED} Stopping both servers...${NC}'; kill $BACK_PID $FRONT_PID 2>/dev/null" EXIT

# Keep both running until user stops
wait