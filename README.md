# QGJob Test Orchestration System

A modular and scalable CLI + Backend system that allows organizations to submit and track AppWright end-to-end test jobs across various device targets, supporting grouping by app version, queueing, scheduling, and integration with GitHub Actions CI pipelines.

## 🏗️ Architecture

```
GitHub Actions CI
        |
        v
    [ qgjob CLI ]
        |
        v
   [ REST API Server ]
        |
        v
   [ Redis Queue (BullMQ) ]
        |
        v
   [ Worker/Agent Simulator ]
        |
        v
    [ Job Results / Logs ]
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Redis server
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd qualgent
npm run install:all
```

### 2. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install Redis locally
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt install redis-server && sudo systemctl start redis
```

### 3. Start the Server

```bash
cd server
cp .env.example .env
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Install CLI Tool

```bash
cd cli
npm run build
npm link  # Install globally
```

### 5. Submit Your First Job

```bash
qgjob submit \
  --org-id=qualgent \
  --app-version-id=v1.0.0 \
  --test=tests/onboarding.spec.js \
  --target=emulator
```

### 6. Check Job Status

```bash
qgjob status --job-id=<job-id-from-step-5>
```

## 📋 Features

### CLI Tool (`qgjob`)

- **Submit Test Jobs**: Queue tests with organization, app version, and target device
- **Check Status**: Monitor job progress with detailed logs and error reporting
- **Validation**: Built-in validation for all parameters
- **Error Handling**: Clear error messages and network failure handling

### Backend Server

- **REST API**: Clean endpoints for job submission and status checking
- **Redis Queue**: BullMQ-powered job queueing with retry logic
- **Job Grouping**: Groups tests by `app_version_id` for efficient device usage
- **Health Monitoring**: Health check endpoint for service monitoring
- **Graceful Shutdown**: Proper cleanup on server termination

### Job Processing

- **Concurrent Processing**: Handles multiple jobs simultaneously
- **Retry Logic**: Automatic retry with exponential backoff
- **Status Tracking**: Real-time status updates (queued → running → completed/failed)
- **Logging**: Detailed execution logs for debugging
- **Agent Simulation**: Simulates real AppWright test agents

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
```

### CLI Configuration

The CLI accepts these options:

- `--server`: Server URL (default: http://localhost:3000)
- `--org-id`: Organization identifier (required)
- `--app-version-id`: App version identifier (required)
- `--test`: Path to test file (required)
- `--target`: Device target (emulator/device/simulator, default: emulator)
- `--priority`: Job priority 1-10 (default: 1)

## 📖 API Documentation

### Submit Job

```http
POST /api/jobs/submit
Content-Type: application/json

{
  "org_id": "qualgent",
  "app_version_id": "v1.0.0",
  "test_path": "tests/onboarding.spec.js",
  "priority": 1,
  "target": "emulator"
}
```

### Get Job Status

```http
GET /api/jobs/{jobId}
```

### Health Check

```http
GET /api/health
```

## 🔄 GitHub Actions Integration

### Example Workflow

Add this workflow to `.github/workflows/appwright.yml`:

```yaml
name: AppWright Tests
on: [push]

jobs:
  run-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g qgjob
      - name: Submit test job
        run: |
          # Replace with your actual QGJob server URL
          qgjob submit \
            --org-id=qualgent \
            --app-version-id=${{ github.sha }} \
            --test=tests/onboarding.spec.js \
            --server=https://qgjob.yourcompany.com
```

See `.github/workflows/` for complete examples with job polling and error handling.

## 🧪 Development

### Running Tests

```bash
# CLI tests
cd cli && npm test

# Server tests  
cd server && npm test
```

### Development Mode

```bash
# Start server in dev mode
cd server && npm run dev

# Test CLI in dev mode
cd cli && npm run dev submit --org-id=test --app-version-id=v1 --test=example.spec.js
```

## 📊 Job Lifecycle

1. **Submission**: Job submitted via CLI or API
2. **Queued**: Job added to Redis queue with priority
3. **Processing**: Worker picks up job and updates status to "running"
4. **Execution**: Simulated test execution with logs
5. **Completion**: Status updated to "completed" or "failed" with results

## 🔍 Monitoring

- **Health Endpoint**: `/api/health` - Check service status
- **Job Logs**: Detailed execution logs for each job
- **Queue Metrics**: Monitor queue depth and processing times
- **Error Tracking**: Failed jobs with error details

## 🚀 Deployment

### Docker Deployment

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Build and run server
cd server
docker build -t qgjob-server .
docker run -d -p 3000:3000 --link redis qgjob-server
```

### Production Considerations

- Use Redis Cluster for high availability
- Set up proper logging and monitoring
- Configure environment variables securely
- Use process managers like PM2 for the server
- Set up load balancing for multiple server instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
