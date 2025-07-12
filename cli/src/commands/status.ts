import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';

interface StatusOptions {
  jobId: string;
  server: string;
}

interface JobStatusResponse {
  success: boolean;
  job: {
    id: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    org_id: string;
    app_version_id: string;
    test_path: string;
    target: string;
    priority: number;
    assigned_agent?: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    logs?: string[];
    error?: string;
  };
  message?: string;
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  const spinner = ora('Fetching job status...').start();

  try {
    const response = await axios.get<JobStatusResponse>(
      `${options.server}/api/jobs/${options.jobId}`,
      {
        timeout: 10000
      }
    );

    if (response.data.success && response.data.job) {
      spinner.succeed(chalk.green('Job status retrieved successfully!'));
      
      const job = response.data.job;
      
      // Display job information
      console.log(chalk.blue.bold('\n📋 Job Information'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`${chalk.bold('Job ID:')} ${job.id}`);
      console.log(`${chalk.bold('Status:')} ${getStatusDisplay(job.status)}`);
      console.log(`${chalk.bold('Organization:')} ${job.org_id}`);
      console.log(`${chalk.bold('App Version:')} ${job.app_version_id}`);
      console.log(`${chalk.bold('Test Path:')} ${job.test_path}`);
      console.log(`${chalk.bold('Target:')} ${job.target}`);
      console.log(`${chalk.bold('Priority:')} ${job.priority}`);
      
      if (job.assigned_agent) {
        console.log(`${chalk.bold('Assigned Agent:')} ${job.assigned_agent}`);
      }
      
      // Display timestamps
      console.log(chalk.blue.bold('\n⏰ Timeline'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`${chalk.bold('Created:')} ${new Date(job.created_at).toLocaleString()}`);
      
      if (job.started_at) {
        console.log(`${chalk.bold('Started:')} ${new Date(job.started_at).toLocaleString()}`);
      }
      
      if (job.completed_at) {
        console.log(`${chalk.bold('Completed:')} ${new Date(job.completed_at).toLocaleString()}`);
      }
      
      // Display logs if available
      if (job.logs && job.logs.length > 0) {
        console.log(chalk.blue.bold('\n📝 Logs'));
        console.log(chalk.gray('─'.repeat(50)));
        job.logs.forEach((log, index) => {
          console.log(`${chalk.gray(`[${index + 1}]`)} ${log}`);
        });
      }
      
      // Display error if failed
      if (job.status === 'failed' && job.error) {
        console.log(chalk.red.bold('\n❌ Error'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.red(job.error));
      }
      
    } else {
      spinner.fail(chalk.red(`Job not found: ${options.jobId}`));
      process.exit(1);
    }

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch job status'));
    
    if (error.response) {
      if (error.response.status === 404) {
        console.error(chalk.red(`Job not found: ${options.jobId}`));
      } else {
        console.error(chalk.red(`Server error (${error.response.status}): ${error.response.data?.message || error.response.statusText}`));
      }
    } else if (error.request) {
      console.error(chalk.red(`Network error: Unable to connect to server at ${options.server}`));
      console.error(chalk.gray('Make sure the server is running and accessible'));
    } else {
      console.error(chalk.red(`Error: ${error.message}`));
    }
    
    process.exit(1);
  }
}

function getStatusDisplay(status: string): string {
  switch (status) {
    case 'queued':
      return chalk.yellow('⏳ Queued');
    case 'running':
      return chalk.blue('🔄 Running');
    case 'completed':
      return chalk.green('✅ Completed');
    case 'failed':
      return chalk.red('❌ Failed');
    default:
      return chalk.gray(`❓ ${status}`);
  }
}
