import { Response } from 'express'

/**
 * Centralized error handler for API controllers
 * @param res - Express Response object
 * @param error - Error object or unknown error
 * @param context - Context description for logging (e.g., "Creating task", "Fetching columns")
 */
export const handleServerError = (
    res: Response,
    error: any,
    context: string
) => {
    console.error(`[${context}] Error:`, error)
    return res.status(500).json({
        message: `${context} failed.`,
        error: error instanceof Error ? error.message : 'Unknown error',
    })
}
