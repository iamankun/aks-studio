/**
 * Client-side utilities for logging user activities.
 * These functions send data to the `/api/activity-log` endpoint.
 */

interface LogActivityParams {
    action: string;
    description?: string;
    entityType?: string;
    entityId?: string | number;
    status?: 'success' | 'error' | 'pending' | 'info' | 'failed';
    result?: string;
    details?: Record<string, unknown>;
}

interface LogActivityResult {
    success: boolean;
    id?: string;
    error?: string;
}

/**
 * Sends an activity log to the server.
 * This is the core client-side logging function.
 * @param params - The data to be logged.
 * @returns The result of the logging operation.
 */
export async function logActivity(params: LogActivityParams): Promise<LogActivityResult> {
    try {
        const response = await fetch('/api/activity-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...params,
                // Automatically add some client-side context
                details: {
                    ...params.details,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                },
            }),
        });

        if (!response.ok) {
            let errorMsg = `API Error: ${response.status} ${response.statusText}`;
            // Read the body as text first to avoid reading the stream twice.
            const responseText = await response.text();
            try {
                // Now, try to parse the text as JSON.
                const errorData = JSON.parse(responseText);
                errorMsg = errorData.error || errorMsg;
            } catch {
                // If JSON parsing fails, the response was not JSON.
                // Use the raw text as the error message, if it's not empty.
                errorMsg = responseText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown client-side error';
        // Avoid logging loops. Only log to console here.
        if (process.env.NODE_ENV !== 'production') {
            console.error("Activity log failed:", errorMsg);
        }
        return { success: false, error: errorMsg };
    }
}

export function logLogin(
    method: 'password' | 'sso' | 'token',
    status: 'success' | 'failed' | 'error',
    details: { username: string; [key: string]: unknown }
): Promise<LogActivityResult> {
    return logActivity({
        action: 'login_attempt',
        entityType: 'auth',
        status,
        description: `User '${details.username}' login attempt via ${method} was ${status}.`,
        details,
    });
}

export function logRegistration(
    method: 'email' | 'sso',
    status: 'success' | 'failed' | 'error',
    details: { username: string; [key: string]: unknown }
): Promise<LogActivityResult> {
    return logActivity({
        action: 'registration_attempt',
        entityType: 'auth',
        status,
        description: `User '${details.username}' registration attempt via ${method} was ${status}.`,
        details,
    });
}

export function logUIInteraction(
    elementType: 'button' | 'link' | 'form' | 'tab',
    elementId: string,
    details?: Record<string, unknown>
): Promise<LogActivityResult> {
    return logActivity({
        action: 'ui_interaction',
        entityType: 'ui_element',
        entityId: elementId,
        description: `User interacted with ${elementType} '${elementId}'.`,
        details,
    });
}

export function logSubmissionActivity(
    submissionId: string,
    activity: 'create' | 'update' | 'delete' | 'view',
    status: 'success' | 'failed' | 'error',
    details?: Record<string, unknown>
): Promise<LogActivityResult> {
    return logActivity({
        action: `${activity}_submission`,
        entityType: 'submission',
        entityId: submissionId,
        status,
        description: `Submission '${submissionId}' activity: ${activity} ${status}.`,
        details,
    });
}