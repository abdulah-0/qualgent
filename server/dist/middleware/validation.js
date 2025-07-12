"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJobSubmission = validateJobSubmission;
function validateJobSubmission(req, res, next) {
    const { org_id, app_version_id, test_path, priority, target } = req.body;
    const errors = [];
    // Validate org_id
    if (!org_id || typeof org_id !== 'string') {
        errors.push('org_id is required and must be a string');
    }
    else if (org_id.length < 2) {
        errors.push('org_id must be at least 2 characters long');
    }
    else if (!/^[a-zA-Z0-9_-]+$/.test(org_id)) {
        errors.push('org_id can only contain letters, numbers, hyphens, and underscores');
    }
    // Validate app_version_id
    if (!app_version_id || typeof app_version_id !== 'string') {
        errors.push('app_version_id is required and must be a string');
    }
    else if (app_version_id.length < 3) {
        errors.push('app_version_id must be at least 3 characters long');
    }
    // Validate test_path
    if (!test_path || typeof test_path !== 'string') {
        errors.push('test_path is required and must be a string');
    }
    else {
        const validExtensions = ['.js', '.ts', '.spec.js', '.spec.ts', '.test.js', '.test.ts'];
        const hasValidExtension = validExtensions.some(ext => test_path.endsWith(ext));
        if (!hasValidExtension) {
            errors.push(`test_path must have a valid extension: ${validExtensions.join(', ')}`);
        }
    }
    // Validate priority
    if (priority === undefined || priority === null) {
        errors.push('priority is required');
    }
    else if (typeof priority !== 'number' || isNaN(priority)) {
        errors.push('priority must be a number');
    }
    else if (priority < 1 || priority > 10) {
        errors.push('priority must be between 1 and 10');
    }
    // Validate target
    if (!target || typeof target !== 'string') {
        errors.push('target is required and must be a string');
    }
    else {
        const validTargets = ['emulator', 'device', 'simulator'];
        if (!validTargets.includes(target.toLowerCase())) {
            errors.push(`target must be one of: ${validTargets.join(', ')}`);
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    next();
}
//# sourceMappingURL=validation.js.map