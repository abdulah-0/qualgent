"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobStorage = void 0;
const redis_1 = require("./redis");
class JobStorage {
    constructor() {
        this.JOB_PREFIX = 'job:';
        this.JOB_LIST_KEY = 'jobs:all';
        this.ORG_JOBS_PREFIX = 'jobs:org:';
        this.APP_JOBS_PREFIX = 'jobs:app:';
    }
    async saveJob(job) {
        const jobKey = this.getJobKey(job.id);
        try {
            // Save job data
            await redis_1.redisClient.hSet(jobKey, {
                id: job.id,
                status: job.status,
                org_id: job.org_id,
                app_version_id: job.app_version_id,
                test_path: job.test_path,
                target: job.target,
                priority: job.priority.toString(),
                created_at: job.created_at,
                ...(job.assigned_agent && { assigned_agent: job.assigned_agent }),
                ...(job.started_at && { started_at: job.started_at }),
                ...(job.completed_at && { completed_at: job.completed_at }),
                ...(job.logs && { logs: JSON.stringify(job.logs) }),
                ...(job.error && { error: job.error })
            });
            // Add to various indexes for efficient querying
            await Promise.all([
                redis_1.redisClient.lPush(this.JOB_LIST_KEY, job.id),
                redis_1.redisClient.lPush(`${this.ORG_JOBS_PREFIX}${job.org_id}`, job.id),
                redis_1.redisClient.lPush(`${this.APP_JOBS_PREFIX}${job.app_version_id}`, job.id)
            ]);
            // Set expiration for job data (30 days)
            await redis_1.redisClient.expire(jobKey, 30 * 24 * 60 * 60);
        }
        catch (error) {
            console.error('Error saving job:', error);
            throw error;
        }
    }
    async getJob(jobId) {
        const jobKey = this.getJobKey(jobId);
        try {
            const jobData = await redis_1.redisClient.hGetAll(jobKey);
            if (!jobData || Object.keys(jobData).length === 0) {
                return null;
            }
            return this.parseJobData(jobData);
        }
        catch (error) {
            console.error('Error getting job:', error);
            throw error;
        }
    }
    async updateJobStatus(jobId, status, updates = {}) {
        const jobKey = this.getJobKey(jobId);
        try {
            const updateData = {
                status,
            };
            // Add other updates, converting to strings
            Object.entries(updates).forEach(([key, value]) => {
                if (key === 'logs' && Array.isArray(value)) {
                    updateData[key] = JSON.stringify(value);
                }
                else if (value !== undefined) {
                    updateData[key] = String(value);
                }
            });
            await redis_1.redisClient.hSet(jobKey, updateData);
        }
        catch (error) {
            console.error('Error updating job status:', error);
            throw error;
        }
    }
    async getAllJobs(filters = {}) {
        try {
            let jobIds = [];
            if (filters.org_id) {
                jobIds = await redis_1.redisClient.lRange(`${this.ORG_JOBS_PREFIX}${filters.org_id}`, 0, -1);
            }
            else if (filters.app_version_id) {
                jobIds = await redis_1.redisClient.lRange(`${this.APP_JOBS_PREFIX}${filters.app_version_id}`, 0, -1);
            }
            else {
                jobIds = await redis_1.redisClient.lRange(this.JOB_LIST_KEY, 0, -1);
            }
            const jobs = [];
            for (const jobId of jobIds) {
                const job = await this.getJob(jobId);
                if (job && (!filters.status || job.status === filters.status)) {
                    jobs.push(job);
                }
            }
            // Sort by created_at descending (newest first)
            return jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        catch (error) {
            console.error('Error getting all jobs:', error);
            throw error;
        }
    }
    getJobKey(jobId) {
        return `${this.JOB_PREFIX}${jobId}`;
    }
    parseJobData(data) {
        return {
            id: data.id,
            status: data.status,
            org_id: data.org_id,
            app_version_id: data.app_version_id,
            test_path: data.test_path,
            target: data.target,
            priority: parseInt(data.priority),
            created_at: data.created_at,
            ...(data.assigned_agent && { assigned_agent: data.assigned_agent }),
            ...(data.started_at && { started_at: data.started_at }),
            ...(data.completed_at && { completed_at: data.completed_at }),
            ...(data.logs && { logs: JSON.parse(data.logs) }),
            ...(data.error && { error: data.error })
        };
    }
}
exports.jobStorage = new JobStorage();
//# sourceMappingURL=storage.js.map