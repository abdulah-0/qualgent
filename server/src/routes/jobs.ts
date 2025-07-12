import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { jobQueue } from '../services/queue';
import { jobStorage } from '../services/storage';
import { validateJobSubmission } from '../middleware/validation';

const router = Router();

interface JobSubmissionRequest {
  org_id: string;
  app_version_id: string;
  test_path: string;
  priority: number;
  target: string;
}

interface Job {
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
}

// Submit a new job
router.post('/submit', validateJobSubmission, async (req: Request, res: Response) => {
  try {
    const jobData: JobSubmissionRequest = req.body;
    const jobId = uuidv4();

    // Create job object
    const job: Job = {
      id: jobId,
      status: 'queued',
      org_id: jobData.org_id,
      app_version_id: jobData.app_version_id,
      test_path: jobData.test_path,
      target: jobData.target,
      priority: jobData.priority,
      created_at: new Date().toISOString()
    };

    // Store job in storage
    await jobStorage.saveJob(job);

    // Add job to queue with grouping by app_version_id
    await jobQueue.add(
      'process-test',
      {
        jobId,
        ...jobData
      },
      {
        priority: jobData.priority,
        // Group jobs by app_version_id to batch tests per device
        jobId: `${jobData.app_version_id}-${jobId}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    );

    console.log(`📝 Job submitted: ${jobId} (org: ${jobData.org_id}, app: ${jobData.app_version_id})`);

    res.status(201).json({
      success: true,
      jobId,
      message: 'Job submitted successfully'
    });

  } catch (error: any) {
    console.error('Error submitting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit job',
      error: error.message
    });
  }
});

// Get job status
router.get('/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    // Retrieve job from storage
    const job = await jobStorage.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
    });

  } catch (error: any) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

// Get all jobs (optional endpoint for debugging)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { org_id, app_version_id, status } = req.query;
    
    const jobs = await jobStorage.getAllJobs({
      org_id: org_id as string,
      app_version_id: app_version_id as string,
      status: status as string
    });

    res.json({
      success: true,
      jobs,
      count: jobs.length
    });

  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

export { router as jobRoutes };
