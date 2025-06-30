"use client"

import type { User } from "@/types/user"
import type { Submission, SubmissionStatus } from "@/types/submission"
import { logger } from "@/lib/logger"
import { shouldUseRealDatabase } from "@/lib/app-config"

export interface DatabaseResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export class DatabaseService {
  private readonly isClient: boolean
  private readonly useRealDB: boolean

  constructor() {
    this.isClient = typeof window !== 'undefined'
    this.useRealDB = shouldUseRealDatabase()
    console.log('DatabaseService: Initialized', {
      isClient: this.isClient,
      useRealDB: this.useRealDB,
      mode: this.useRealDB ? 'production' : 'demo'
    })
  }

  async authenticateUser(username: string, password: string): Promise<DatabaseResult<User>> {
    logger.info('DatabaseService: Authentication attempt', {
      component: 'DatabaseService',
      action: 'authenticateUser',
      data: { username, useRealDB: this.useRealDB }
    })

    try {
      if (this.useRealDB) {
        // Production mode: Connect to real database
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })

        const result = await response.json()

        if (result.success) {
          logger.info('DatabaseService: Real DB authentication successful', {
            component: 'DatabaseService',
            action: 'authenticateUser',
            userId: result.data.id
          })
          return { success: true, data: result.data }
        } else {
          logger.error('DatabaseService: Real DB authentication failed', {
            component: 'DatabaseService',
            action: 'authenticateUser',
            error: result.error
          })
          return { success: false, error: result.error ?? 'Authentication failed' }
        }
      } else {
        // Demo mode: Use demo data
        console.log('DatabaseService: Using demo authentication for', username)

        // Demo users
        const demoUsers: User[] = [
          {
            id: "1",
            username: "admin",
            password: "demo",
            email: "admin@example.com",
            role: "Label Manager" as const,
            fullName: "Administrator",
            avatar: "/face.png",
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            username: "artist",
            password: "demo",
            email: "artist@example.com",
            role: "Artist" as const,
            fullName: "Sample Artist",
            avatar: "/face.png",
            createdAt: new Date().toISOString()
          }
        ]

        const user = demoUsers.find(u => u.username === username)

        if (user && (password === "demo" || password === "admin123")) {
          logger.info('DatabaseService: Demo authentication successful', {
            component: 'DatabaseService',
            action: 'authenticateUser',
            userId: user.id
          })
          return { success: true, data: user }
        } else {
          logger.warn('DatabaseService: Demo authentication failed', {
            component: 'DatabaseService',
            action: 'authenticateUser',
            username
          })
          return { success: false, error: 'Invalid credentials' }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('DatabaseService: Authentication error', {
        component: 'DatabaseService',
        action: 'authenticateUser',
        error: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }
  async saveSubmission(submission: Omit<Submission, 'id'>): Promise<DatabaseResult<string>> {
    logger.info('DatabaseService: Saving submission', {
      component: 'DatabaseService',
      action: 'saveSubmission',
      data: { useRealDB: this.useRealDB }
    })

    try {
      if (this.useRealDB) {
        // Production mode implementation would go here
        return { success: false, error: 'Real database not implemented yet' }
      } else {
        // Demo mode: Simulate saving
        const submissionId = Date.now().toString()

        // Store in localStorage for demo
        const submissions = this.getStoredSubmissions()
        const newSubmission: Submission = {
          ...submission,
          id: submissionId
        }
        submissions.push(newSubmission)
        localStorage.setItem('demo_submissions', JSON.stringify(submissions))

        logger.info('DatabaseService: Demo submission saved', {
          component: 'DatabaseService',
          action: 'saveSubmission',
          submissionId
        })
        return { success: true, data: submissionId }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('DatabaseService: Save submission error', {
        component: 'DatabaseService',
        action: 'saveSubmission',
        error: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  async getSubmissions(filter?: Record<string, unknown>): Promise<DatabaseResult<Submission[]>> {
    logger.info('DatabaseService: Getting submissions', {
      component: 'DatabaseService',
      action: 'getSubmissions',
      data: { useRealDB: this.useRealDB, filter }
    })

    try {
      if (this.useRealDB) {
        // Production mode implementation would go here
        return { success: false, error: 'Real database not implemented yet' }
      } else {
        // Demo mode: Get from localStorage
        const submissions = this.getStoredSubmissions()
        return { success: true, data: submissions }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('DatabaseService: Get submissions error', {
        component: 'DatabaseService',
        action: 'getSubmissions',
        error: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  async updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<DatabaseResult<boolean>> {
    logger.info('DatabaseService: Updating submission status', {
      component: 'DatabaseService',
      action: 'updateSubmissionStatus',
      data: { id, status, useRealDB: this.useRealDB }
    })

    try {
      if (this.useRealDB) {
        // Production mode implementation would go here
        return { success: false, error: 'Real database not implemented yet' }
      } else {
        // Demo mode: Update in localStorage
        const submissions = this.getStoredSubmissions()
        const index = submissions.findIndex((s: Submission) => s.id === id)
        if (index !== -1) {
          submissions[index].status = status
          localStorage.setItem('demo_submissions', JSON.stringify(submissions))
          return { success: true, data: true }
        } else {
          return { success: false, error: 'Submission not found' }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('DatabaseService: Update submission status error', {
        component: 'DatabaseService',
        action: 'updateSubmissionStatus',
        error: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  private getStoredSubmissions(): Submission[] {
    if (!this.isClient) return []

    const stored = localStorage.getItem('demo_submissions')
    if (!stored) return []

    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  // Test connection method
  async testConnection(): Promise<DatabaseResult<boolean>> {
    logger.info('DatabaseService: Testing connection', {
      component: 'DatabaseService',
      action: 'testConnection',
      data: { useRealDB: this.useRealDB }
    })

    try {
      if (this.useRealDB) {
        // Production mode connection test would go here
        return { success: false, error: 'Real database connection test not implemented yet' }
      } else {
        // Demo mode always works
        return { success: true, data: true }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: errorMessage }
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()