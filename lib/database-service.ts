"use client"

import type { User } from "@/types/user"
import type { Submission, SubmissionStatus } from "@/types/submission"
import { logger } from "@/lib/logger"
import { shouldUseRealDatabase } from "@/lib/app-config"
import { neon } from "@neondatabase/serverless"

export interface DatabaseResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export class DatabaseService {
  private readonly isClient: boolean
  private readonly useRealDB: boolean
  private neonSql: ReturnType<typeof neon> | null = null

  constructor() {
    this.isClient = typeof window !== 'undefined'
    this.useRealDB = shouldUseRealDatabase()
    this.initializeNeonConnection()
    console.log('DatabaseService: Initialized', {
      isClient: this.isClient,
      useRealDB: this.useRealDB,
      mode: this.useRealDB ? 'production' : 'demo'
    })
  }

  private initializeNeonConnection() {
    if (!this.isClient && this.useRealDB && process.env.DATABASE_URL) {
      try {
        this.neonSql = neon(process.env.DATABASE_URL)
        console.log('✅ Neon connection initialized in DatabaseService')
      } catch (error) {
        console.error('❌ Failed to initialize Neon connection:', error)
      }
    }
  }

  async authenticateUser(username: string, password: string): Promise<DatabaseResult<User>> {
    logger.info('DatabaseService: Authentication attempt', {
      component: 'DatabaseService',
      action: 'authenticateUser',
      data: { username, useRealDB: this.useRealDB }
    })

    try {
      if (this.useRealDB) {
        // Production mode: Use API endpoint (simpler and more reliable)
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
            userId: result.user?.id
          })
          return { success: true, data: result.user }
        } else {
          logger.error('DatabaseService: Real DB authentication failed', {
            component: 'DatabaseService',
            action: 'authenticateUser',
            error: result.message
          })
          return { success: false, error: result.message ?? 'Authentication failed' }
        }
      } else {
        // Demo mode
        return this.authenticateUserDemo(username, password)
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

  private authenticateUserDemo(username: string, password: string): DatabaseResult<User> {
    // Demo authentication logic
    const demoUsers: User[] = [
      {
        id: "demo-admin",
        username: "admin",
        password: "", // Don't store real passwords
        email: "admin@aksstudio.com",
        role: "Label Manager",
        fullName: "Demo Administrator",
        createdAt: new Date().toISOString(),
        avatar: "/face.png",
        bio: "Demo administrator account",
        isrcCodePrefix: "DEMO"
      }
    ]

    const user = demoUsers.find(u => u.username === username)
    const validPassword = (username === "admin" && password === "demo123")

    if (user && validPassword) {
      logger.info('DatabaseService: Demo authentication successful', {
        component: 'DatabaseService',
        action: 'authenticateUserDemo',
        username
      })
      return { success: true, data: user }
    }

    return { success: false, error: 'Invalid demo credentials' }
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

  async updateSubmission(id: string, updateData: Partial<Submission>): Promise<DatabaseResult<Submission>> {
    logger.info('DatabaseService: Updating submission', {
      component: 'DatabaseService',
      action: 'updateSubmission',
      data: { id, useRealDB: this.useRealDB }
    })

    try {
      if (this.useRealDB) {
        // Production mode: Use the API endpoint
        const response = await fetch(`/api/submissions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        const result = await response.json()

        if (result.success) {
          logger.info('DatabaseService: Real DB submission updated', {
            component: 'DatabaseService',
            action: 'updateSubmission',
            submissionId: id
          })
          return { success: true, data: result.data }
        } else {
          logger.error('DatabaseService: Real DB submission update failed', {
            component: 'DatabaseService',
            action: 'updateSubmission',
            error: result.error
          })
          return { success: false, error: result.error ?? 'Update failed' }
        }
      } else {
        // Demo mode: Update in localStorage
        const submissions = this.getStoredSubmissions()
        const index = submissions.findIndex((s: Submission) => s.id === id)

        if (index !== -1) {
          // Update only the fields that are provided
          submissions[index] = {
            ...submissions[index],
            ...updateData,
            // Always update the submissionDate as lastUpdated equivalent
            submissionDate: new Date().toISOString()
          }

          localStorage.setItem('demo_submissions', JSON.stringify(submissions))

          logger.info('DatabaseService: Demo submission updated', {
            component: 'DatabaseService',
            action: 'updateSubmission',
            submissionId: id
          })

          return { success: true, data: submissions[index] }
        } else {
          logger.warn('DatabaseService: Demo submission not found', {
            component: 'DatabaseService',
            action: 'updateSubmission',
            submissionId: id
          })

          return { success: false, error: 'Submission not found' }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('DatabaseService: Update submission error', {
        component: 'DatabaseService',
        action: 'updateSubmission',
        error: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  async deleteSubmission(id: string): Promise<DatabaseResult<boolean>> {
    logger.info('DatabaseService: Deleting submission', {
      component: 'DatabaseService',
      action: 'deleteSubmission',
      data: { id, useRealDB: this.useRealDB }
    })

    try {
      if (this.useRealDB) {
        // Production mode: Use the API endpoint
        const response = await fetch(`/api/submissions/${id}`, {
          method: 'DELETE'
        })

        const result = await response.json()

        if (result.success) {
          logger.info('DatabaseService: Real DB submission deleted', {
            component: 'DatabaseService',
            action: 'deleteSubmission',
            submissionId: id
          })
          return { success: true, data: true }
        } else {
          logger.error('DatabaseService: Real DB submission deletion failed', {
            component: 'DatabaseService',
            action: 'deleteSubmission',
            error: result.error
          })
          return { success: false, error: result.error ?? 'Deletion failed' }
        }
      } else {
        // Demo mode: Delete from localStorage
        const submissions = this.getStoredSubmissions()
        const initialLength = submissions.length
        const updatedSubmissions = submissions.filter((s: Submission) => s.id !== id)

        if (updatedSubmissions.length === initialLength) {
          // No submission was removed
          logger.warn('DatabaseService: Demo submission not found for deletion', {
            component: 'DatabaseService',
            action: 'deleteSubmission',
            submissionId: id
          })

          return { success: false, error: 'Submission not found' }
        }

        localStorage.setItem('demo_submissions', JSON.stringify(updatedSubmissions))

        logger.info('DatabaseService: Demo submission deleted', {
          component: 'DatabaseService',
          action: 'deleteSubmission',
          submissionId: id
        })

        return { success: true, data: true }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('DatabaseService: Delete submission error', {
        component: 'DatabaseService',
        action: 'deleteSubmission',
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
      if (this.useRealDB && this.neonSql) {
        // Test Neon connection
        const result = await this.neonSql`SELECT NOW() as current_time`
        console.log('✅ Neon database connection test successful:', result[0]?.current_time)
        return { success: true, data: true }
      } else if (this.useRealDB) {
        // Try API endpoint test
        const response = await fetch('/api/database-status')
        const result = await response.json()
        return { success: result.success, data: result.success }
      } else {
        // Demo mode always works
        return { success: true, data: true }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Database connection test failed:', errorMessage)
      return { success: false, error: errorMessage }
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()