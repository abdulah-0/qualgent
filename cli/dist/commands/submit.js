"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitCommand = submitCommand;
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const validation_1 = require("../utils/validation");
async function submitCommand(options) {
    // Validate all inputs before starting
    const validations = [
        (0, validation_1.validateOrgId)(options.orgId),
        (0, validation_1.validateAppVersionId)(options.appVersionId),
        (0, validation_1.validateTestFile)(options.test),
        (0, validation_1.validateTarget)(options.target),
        (0, validation_1.validatePriority)(options.priority),
        (0, validation_1.validateServerUrl)(options.server)
    ];
    for (const validation of validations) {
        if (!validation.valid) {
            console.error(chalk_1.default.red(`❌ ${validation.error}`));
            process.exit(1);
        }
    }
    const spinner = (0, ora_1.default)('Submitting test job...').start();
    try {
        const priorityValidation = (0, validation_1.validatePriority)(options.priority);
        const priority = priorityValidation.value;
        // Prepare job payload
        const payload = {
            org_id: options.orgId,
            app_version_id: options.appVersionId,
            test_path: options.test,
            priority: priority,
            target: options.target
        };
        // Submit job to server
        const response = await axios_1.default.post(`${options.server}/api/jobs/submit`, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        if (response.data.success) {
            spinner.succeed(chalk_1.default.green('Job submitted successfully!'));
            console.log(chalk_1.default.blue(`Job ID: ${response.data.jobId}`));
            console.log(chalk_1.default.gray(`Organization: ${options.orgId}`));
            console.log(chalk_1.default.gray(`App Version: ${options.appVersionId}`));
            console.log(chalk_1.default.gray(`Test: ${options.test}`));
            console.log(chalk_1.default.gray(`Target: ${options.target}`));
            console.log(chalk_1.default.gray(`Priority: ${priority}`));
            console.log(chalk_1.default.yellow(`\nUse 'qgjob status --job-id ${response.data.jobId}' to check status`));
        }
        else {
            spinner.fail(chalk_1.default.red(`Failed to submit job: ${response.data.message}`));
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Failed to submit job'));
        if (error.response) {
            console.error(chalk_1.default.red(`Server error (${error.response.status}): ${error.response.data?.message || error.response.statusText}`));
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
//# sourceMappingURL=submit.js.map