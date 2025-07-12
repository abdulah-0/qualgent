"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = statusCommand;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
async function statusCommand(options) {
    const spinner = (0, ora_1.default)('Fetching job status...').start();
    try {
        const response = await axios_1.default.get(`${options.server}/api/jobs/${options.jobId}`, {
            timeout: 10000
        });
        if (response.data.success && response.data.job) {
            spinner.succeed(chalk_1.default.green('Job status retrieved successfully!'));
            const job = response.data.job;
            // Display job information
            console.log(chalk_1.default.blue.bold('\n📋 Job Information'));
            console.log(chalk_1.default.gray('─'.repeat(50)));
            console.log(`${chalk_1.default.bold('Job ID:')} ${job.id}`);
            console.log(`${chalk_1.default.bold('Status:')} ${getStatusDisplay(job.status)}`);
            console.log(`${chalk_1.default.bold('Organization:')} ${job.org_id}`);
            console.log(`${chalk_1.default.bold('App Version:')} ${job.app_version_id}`);
            console.log(`${chalk_1.default.bold('Test Path:')} ${job.test_path}`);
            console.log(`${chalk_1.default.bold('Target:')} ${job.target}`);
            console.log(`${chalk_1.default.bold('Priority:')} ${job.priority}`);
            if (job.assigned_agent) {
                console.log(`${chalk_1.default.bold('Assigned Agent:')} ${job.assigned_agent}`);
            }
            // Display timestamps
            console.log(chalk_1.default.blue.bold('\n⏰ Timeline'));
            console.log(chalk_1.default.gray('─'.repeat(50)));
            console.log(`${chalk_1.default.bold('Created:')} ${new Date(job.created_at).toLocaleString()}`);
            if (job.started_at) {
                console.log(`${chalk_1.default.bold('Started:')} ${new Date(job.started_at).toLocaleString()}`);
            }
            if (job.completed_at) {
                console.log(`${chalk_1.default.bold('Completed:')} ${new Date(job.completed_at).toLocaleString()}`);
            }
            // Display logs if available
            if (job.logs && job.logs.length > 0) {
                console.log(chalk_1.default.blue.bold('\n📝 Logs'));
                console.log(chalk_1.default.gray('─'.repeat(50)));
                job.logs.forEach((log, index) => {
                    console.log(`${chalk_1.default.gray(`[${index + 1}]`)} ${log}`);
                });
            }
            // Display error if failed
            if (job.status === 'failed' && job.error) {
                console.log(chalk_1.default.red.bold('\n❌ Error'));
                console.log(chalk_1.default.gray('─'.repeat(50)));
                console.log(chalk_1.default.red(job.error));
            }
        }
        else {
            spinner.fail(chalk_1.default.red(`Job not found: ${options.jobId}`));
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to fetch job status'));
        if (error.response) {
            if (error.response.status === 404) {
                console.error(chalk_1.default.red(`Job not found: ${options.jobId}`));
            }
            else {
                console.error(chalk_1.default.red(`Server error (${error.response.status}): ${error.response.data?.message || error.response.statusText}`));
            }
        }
        else if (error.request) {
            console.error(chalk_1.default.red(`Network error: Unable to connect to server at ${options.server}`));
            console.error(chalk_1.default.gray('Make sure the server is running and accessible'));
        }
        else {
            console.error(chalk_1.default.red(`Error: ${error.message}`));
        }
        process.exit(1);
    }
}
function getStatusDisplay(status) {
    switch (status) {
        case 'queued':
            return chalk_1.default.yellow('⏳ Queued');
        case 'running':
            return chalk_1.default.blue('🔄 Running');
        case 'completed':
            return chalk_1.default.green('✅ Completed');
        case 'failed':
            return chalk_1.default.red('❌ Failed');
        default:
            return chalk_1.default.gray(`❓ ${status}`);
    }
}
//# sourceMappingURL=status.js.map