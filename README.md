# Diagramless Crossword Application

This is a monorepo containing both the frontend and backend components of the Diagramless Crossword application.

## Project Structure

- `/frontend` - React application for the user interface
- `/backend` - Flask API for fetching crossword puzzles

## Deployment on Railway

This application is designed to be [deployed as a monorepo](https://docs.railway.com/tutorials/deploying-a-monorepo) on Railway, with separate services for the frontend and backend.

### Initial Setup

1. Create a new project in the [Railway Dashboard](https://railway.app/dashboard)
2. Connect your GitHub repository to Railway
3. Set up two services as described below

### Service Configuration

#### Frontend Service (diagramless)

- **Service Name**: `diagramless`
- **Root Directory**: `/frontend`
- **Port**: `8080`
- **Environment Variables**:
  - `REACT_APP_BACKEND_HOST`: `https://${{diagramless-backend.RAILWAY_PUBLIC_DOMAIN}}`

#### Backend Service (diagramless-backend)

- **Service Name**: `diagramless-backend`
- **Root Directory**: `/backend`
- **Port**: `8080`
- **Environment Variables**:
  - `ALLOWED_DOMAINS`: `${{diagramless.RAILWAY_PUBLIC_DOMAIN}}`

### Step-by-Step Setup Instructions

1. **To create the Backend Service**:
   - Click '+ Create' and choose 'Empty Service'
   - Rename the service to `diagramless-backend`
   - Under `Settings`
     - set the root directory to `/backend`
     - under `Public Networking` click `Generate Domain` and use `8080` as the port
   - Under `Variables`, add the following:
     - `ALLOWED_DOMAINS`: `${{diagramless.RAILWAY_PUBLIC_DOMAIN}}`

2**To create the Frontend Service**:
   - Click '+ Create' and choose 'Empty Service'
   - Rename the service to `diagramless`
   - Under `Settings`
     - set the root directory to `/frontend`
     - under `Public Networking` click `Generate Domain` and use `8080` as the port
   - under `Variables`, add the following:
     - `REACT_APP_BACKEND_HOST`: `https://${{diagramless-backend.RAILWAY_PUBLIC_DOMAIN}}`

You may have to click `Deploy` to apply the changes.

### Deployment Script

A deployment script is included in the root directory to simplify deploying both services:

```bash
./deploy.sh
```

This will deploy both the frontend and backend services to Railway.

## Local Development

To run the application locally:

   ```bash
   ./install.sh
   ./start.sh
   ```

## References

- [Railway Monorepo Deployment Documentation](https://docs.railway.app/tutorials/deploying-a-monorepo)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
