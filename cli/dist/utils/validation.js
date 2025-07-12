"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTestFile = validateTestFile;
exports.validateOrgId = validateOrgId;
exports.validateAppVersionId = validateAppVersionId;
exports.validatePriority = validatePriority;
exports.validateTarget = validateTarget;
exports.validateServerUrl = validateServerUrl;
const fs_1 = require("fs");
const path_1 = require("path");
function validateTestFile(testPath) {
    if (!testPath) {
        return { valid: false, error: 'Test path is required' };
    }
    const resolvedPath = (0, path_1.resolve)(testPath);
    if (!(0, fs_1.existsSync)(resolvedPath)) {
        return { valid: false, error: `Test file not found: ${testPath}` };
    }
    // Check if it's a valid test file extension
    const validExtensions = ['.js', '.ts', '.spec.js', '.spec.ts', '.test.js', '.test.ts'];
    const hasValidExtension = validExtensions.some(ext => testPath.endsWith(ext));
    if (!hasValidExtension) {
        return {
            valid: false,
            error: `Test file should have a valid extension: ${validExtensions.join(', ')}`
        };
    }
    return { valid: true };
}
function validateOrgId(orgId) {
    if (!orgId) {
        return { valid: false, error: 'Organization ID is required' };
    }
    if (orgId.length < 2) {
        return { valid: false, error: 'Organization ID must be at least 2 characters long' };
    }
    // Check for valid characters (alphanumeric, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(orgId)) {
        return {
            valid: false,
            error: 'Organization ID can only contain letters, numbers, hyphens, and underscores'
        };
    }
    return { valid: true };
}
function validateAppVersionId(appVersionId) {
    if (!appVersionId) {
        return { valid: false, error: 'App version ID is required' };
    }
    if (appVersionId.length < 3) {
        return { valid: false, error: 'App version ID must be at least 3 characters long' };
    }
    return { valid: true };
}
function validatePriority(priority) {
    const priorityNum = parseInt(priority);
    if (isNaN(priorityNum)) {
        return { valid: false, error: 'Priority must be a number' };
    }
    if (priorityNum < 1 || priorityNum > 10) {
        return { valid: false, error: 'Priority must be between 1 and 10' };
    }
    return { valid: true, value: priorityNum };
}
function validateTarget(target) {
    if (!target) {
        return { valid: false, error: 'Target is required' };
    }
    const validTargets = ['emulator', 'device', 'simulator'];
    if (!validTargets.includes(target.toLowerCase())) {
        return {
            valid: false,
            error: `Target must be one of: ${validTargets.join(', ')}`
        };
    }
    return { valid: true };
}
function validateServerUrl(serverUrl) {
    if (!serverUrl) {
        return { valid: false, error: 'Server URL is required' };
    }
    try {
        new URL(serverUrl);
        return { valid: true };
    }
    catch {
        return { valid: false, error: 'Invalid server URL format' };
    }
}
//# sourceMappingURL=validation.js.map