interface SubmitOptions {
    orgId: string;
    appVersionId: string;
    test: string;
    target: string;
    priority: string;
    server: string;
}
export declare function submitCommand(options: SubmitOptions): Promise<void>;
export {};
//# sourceMappingURL=submit.d.ts.map