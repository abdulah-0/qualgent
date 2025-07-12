"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const queue_1 = require("../services/queue");
const storage_1 = require("../services/storage");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
exports.jobRoutes = router;
// Submit a new job
router.post('/submit', validation_1.validateJobSubmission, async (req, res) => {
    try {
        const jobData = req.body;
        const jobId = (0, uuid_1.v4)();
        // Create job object
        const job = {
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
        await storage_1.jobStorage.saveJob(job);
        // Add job to queue with grouping by app_version_id
        await queue_1.jobQueue.add('process-test', {
            jobId,
            ...jobData
        }, {
            priority: jobData.priority,
            // Group jobs by app_version_id to batch tests per device
            jobId: `${jobData.app_version_id}-${jobId}`,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000
            }
        });
        console.log(`📝 Job submitted: ${jobId} (org: ${jobData.org_id}, app: ${jobData.app_version_id})`);
        res.status(201).json({
            success: true,
            jobId,
            message: 'Job submitted successfully'
        });
    }
    catch (error) {
        console.error('Error submitting job:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit job',
            error: error.message
        });
    }
});
// Get job status
router.get('/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        // Retrieve job from storage
        const job = await storage_1.jobStorage.getJob(jobId);
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
    }
    catch (error) {
        console.error('Error fetching job:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch job',
            error: error.message
        });
    }
});
// Get all jobs (optional endpoint for debugging)
router.get('/', async (req, res) => {
    try {
        const { org_id, app_version_id, status } = req.query;
        const jobs = await storage_1.jobStorage.getAllJobs({
            org_id: org_id,
            app_version_id: app_version_id,
            status: status
        });
        res.json({
            success: true,
            jobs,
            count: jobs.length
        });
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs',
            error: error.message
        });
    }
});
//# sourceMappingURL=jobs.js.map