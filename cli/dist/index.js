#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const submit_1 = require("./commands/submit");
const status_1 = require("./commands/status");
const program = new commander_1.Command();
program
    .name('qgjob')
    .description('CLI tool for QGJob Test Orchestration System')
    .version('1.0.0');
// Submit command
program
    .command('submit')
    .description('Submit a test job to the orchestration system')
    .requiredOption('--org-id <orgId>', 'Organization ID')
    .requiredOption('--app-version-id <appVersionId>', 'Application version ID')
    .requiredOption('--test <testPath>', 'Path to the test file')
    .option('--target <target>', 'Target device type', 'emulator')
    .option('--priority <priority>', 'Job priority (1-10)', '1')
    .option('--server <serverUrl>', 'Server URL', 'http://localhost:3000')
    .action(submit_1.submitCommand);
// Status command
program
    .command('status')
    .description('Check the status of a submitted job')
    .requiredOption('--job-id <jobId>', 'Job ID to check status for')
    .option('--server <serverUrl>', 'Server URL', 'http://localhost:3000')
    .action(status_1.statusCommand);
// Parse command line arguments
program.parse();
//# sourceMappingURL=index.js.map