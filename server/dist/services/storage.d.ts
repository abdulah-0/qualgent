export interface Job {
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
interface JobFilters {
    org_id?: string;
    app_version_id?: string;
    status?: string;
}
declare class JobStorage {
    private readonly JOB_PREFIX;
    private readonly JOB_LIST_KEY;
    private readonly ORG_JOBS_PREFIX;
    private readonly APP_JOBS_PREFIX;
    saveJob(job: Job): Promise<void>;
    getJob(jobId: string): Promise<Job | null>;
    updateJobStatus(jobId: string, status: Job['status'], updates?: Partial<Job>): Promise<void>;
    getAllJobs(filters?: JobFilters): Promise<Job[]>;
    private getJobKey;
    private parseJobData;
}
export declare const jobStorage: JobStorage;
export {};
//# sourceMappingURL=storage.d.ts.map