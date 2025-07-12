import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import {
  validateTestFile,
  validateOrgId,
  validateAppVersionId,
  validatePriority,
  validateTarget,
  validateServerUrl
} from '../utils/validation';

interface SubmitOptions {
  orgId: string;
  appVersionId: string;
  test: string;
  target: string;
  priority: string;
  server: string;
}

interface JobSubmissionResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export async function submitCommand(options: SubmitOptions): Promise<void> {
  // Validate all inputs before starting
  const validations = [
    validateOrgId(options.orgId),
    validateAppVersionId(options.appVersionId),
    validateTestFile(options.test),
    validateTarget(options.target),
    validatePriority(options.priority),
    validateServerUrl(options.server)
  ];

  for (const validation of validations) {
    if (!validation.valid) {
      console.error(chalk.red(`❌ ${validation.error}`));
      process.exit(1);
    }
  }

  const spinner = ora('Submitting test job...').start();

  try {
    const priorityValidation = validatePriority(options.priority);
    const priority = priorityValidation.value!;

    // Prepare job payload
    const payload = {
      org_id: options.orgId,
      app_version_id: options.appVersionId,
      test_path: options.test,
      priority: priority,
      target: options.target
    };

    // Submit job to server
    const response = await axios.post<JobSubmissionResponse>(
      `${options.server}/api/jobs/submit`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data.success) {
      spinner.succeed(chalk.green('Job submitted successfully!'));
      console.log(chalk.blue(`Job ID: ${response.data.jobId}`));
      console.log(chalk.gray(`Organization: ${options.orgId}`));
      console.log(chalk.gray(`App Version: ${options.appVersionId}`));
      console.log(chalk.gray(`Test: ${options.test}`));
      console.log(chalk.gray(`Target: ${options.target}`));
      console.log(chalk.gray(`Priority: ${priority}`));
      console.log(chalk.yellow(`\nUse 'qgjob status --job-id ${response.data.jobId}' to check status`));
    } else {
      spinner.fail(chalk.red(`Failed to submit job: ${response.data.message}`));
      process.exit(1);
    }

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to submit job'));
    
    if (error.response) {
      console.error(chalk.red(`Server error (${error.response.status}): ${error.response.data?.message || error.response.statusText}`));
    } else if (error.request) {
      console.error(chalk.red(`Network error: Unable to connect to server at ${options.server}`));
      console.error(chalk.gray('Make sure the server is running and accessible'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    process.exit(1);
  }
}
