# QGJob CLI Tool

A command-line interface for the QGJob Test Orchestration System.

## Installation

```bash
npm install -g qgjob
```

## Usage

### Submit a Test Job

Submit a test job to the orchestration system:

```bash
qgjob submit --org-id=qualgent --app-version-id=xyz123 --test=tests/onboarding.spec.js --target=emulator
```

#### Options:
- `--org-id <orgId>` (required): Organization identifier
- `--app-version-id <appVersionId>` (required): Application version identifier
- `--test <testPath>` (required): Path to the test file
- `--target <target>` (optional): Target device type (emulator, device, simulator). Default: emulator
- `--priority <priority>` (optional): Job priority (1-10). Default: 1
- `--server <serverUrl>` (optional): Server URL. Default: http://localhost:3000

### Check Job Status

Check the status of a submitted job:

```bash
qgjob status --job-id=abc456
```

#### Options:
- `--job-id <jobId>` (required): Job ID to check status for
- `--server <serverUrl>` (optional): Server URL. Default: http://localhost:3000

### Help

Get help for all commands:

```bash
qgjob --help
qgjob submit --help
qgjob status --help
```

## Examples

```bash
# Submit a test with default settings
qgjob submit --org-id=myorg --app-version-id=v1.2.3 --test=tests/login.spec.js

# Submit a high-priority test for a real device
qgjob submit --org-id=myorg --app-version-id=v1.2.3 --test=tests/critical.spec.js --target=device --priority=10

# Check job status
qgjob status --job-id=job_12345

# Use custom server
qgjob submit --org-id=myorg --app-version-id=v1.2.3 --test=tests/smoke.spec.js --server=https://qgjob.example.com
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test
```
