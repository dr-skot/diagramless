#!/bin/bash
# Script to deploy both frontend and backend to Railway

echo "Deploying backend..."
railway up --service diagramless-backend --detach

echo "Deploying frontend..."
railway up --service diagramless --detach

echo "Deployment in progress!"
echo "To view logs, use:"
echo "  railway logs --service diagramless-backend"
echo "  railway logs --service diagramless"
