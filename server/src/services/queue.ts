import { jobStorage } from './storage';

// Mock Queue implementation for testing
class MockQueue {
  private jobs = new Map<string, any>();
  private jobCounter = 0;

  async add(name: string, data: any, options: any = {}) {
    const jobId = `job_${++this.jobCounter}`;
    const job = {
      id: jobId,
      name,
      data,
      options,
      timestamp: Date.now()
    };
    this.jobs.set(jobId, job);

    // Simulate async job processing
    setTimeout(() => this.processJob(job), 1000);

    return { id: jobId };
  }

  async getWaiting() {
    return Array.from(this.jobs.values()).filter(job => !job.processed);
  }

  async getActive() {
    return Array.from(this.jobs.values()).filter(job => job.processing);
  }

  private async processJob(job: any) {
    job.processing = true;

    // Simulate job processing
    const { jobId } = job.data;

    try {
      await jobStorage.updateJobStatus(jobId, 'running', {
        started_at: new Date().toISOString(),
        assigned_agent: `mock-agent-${Math.floor(Math.random() * 3) + 1}`
      });

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      // 90% success rate
      if (Math.random() > 0.1) {
        await jobStorage.updateJobStatus(jobId, 'completed', {
          completed_at: new Date().toISOString(),
          logs: [
            `Mock test execution for ${job.data.test_path}`,
            `Target: ${job.data.target}`,
            `App version: ${job.data.app_version_id}`,
            'Test completed successfully'
          ]
        });
      } else {
        throw new Error('Mock test failure');
      }
    } catch (error: any) {
      await jobStorage.updateJobStatus(jobId, 'failed', {
        completed_at: new Date().toISOString(),
        error: error.message,
        logs: [
          `Mock test execution for ${job.data.test_path}`,
          `Error: ${error.message}`
        ]
      });
    }

    job.processing = false;
    job.processed = true;
  }
}

// Create job queue (mock implementation)
export const jobQueue = new MockQueue();

// Job data interface
interface JobData {
  jobId: string;
  org_id: string;
  app_version_id: string;
  test_path: string;
  priority: number;
  target: string;
}

console.log('🔧 Mock job queue initialized for testing');
