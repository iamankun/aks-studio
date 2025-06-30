"use client"

import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"
import { logger } from "@/lib/logger"

export interface DatabaseResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

export class DatabaseService {
  private isClient: boolean

  constructor() {
    this.isClient = typeof window !== 'undefined'
    // Temporarily disable logging during construction to prevent potential recursion
    console.log('DatabaseService: Initialized', { isClient: this.isClient })
  }

  async authenticateUser(username: string, password: string): Promise<DatabaseResult<User>> {
    logger.info('DatabaseService: Authentication attempt', {
      component: 'DatabaseService',
      action: 'authenticateUser',
      data: { username }
    })

    try {
      // Demo authentication
      if (username === "ankunstudio" && password === "admin") {
        const user: User = {
          id: "demo-admin",
          username: "ankunstudio",
          password: "admin",
          email: "ankunstudio@ankun.dev",
          role: "Label Manager",
          fullName: "An Kun Studio Digital Music Distribution",
          createdAt: new Date().toISOString(),
          avatar: "/face.png",
          bio: "Digital Music Distribution Platform",
          isrcCodePrefix: "VNA2P"
        }

        logger.info('DatabaseService: Authentication successful', {
          component: 'DatabaseService',
          action: 'authenticateUser',
          userId: user.id
        })

        return { success: true, data: user }
      }

      logger.warn('DatabaseService: Authentication failed', {
        component: 'DatabaseService',
        action: 'authenticateUser',
        data: { username, reason: 'Invalid credentials' }
      })

      return { success: false, error: "Invalid credentials" }
    } catch (error) {
      logger.error('DatabaseService: Authentication error', error, {
        component: 'DatabaseService',
        action: 'authenticateUser'
      })

      return { success: false, error: "Authentication failed" }
    }
  }

  async createSubmission(submission: Submission): Promise<DatabaseResult<Submission>> {
    logger.info('DatabaseService: Creating submission', {
      component: 'DatabaseService',
      action: 'createSubmission',
      data: { submissionId: submission.id, title: submission.songTitle }
    })

    try {
      if (this.isClient) {
        const stored = localStorage.getItem("demo_submissions") || "[]"
        const submissions = JSON.parse(stored)
        submissions.push(submission)
        localStorage.setItem("demo_submissions", JSON.stringify(submissions))

        logger.info('DatabaseService: Submission created successfully', {
          component: 'DatabaseService',
          action: 'createSubmission',
          data: { submissionId: submission.id }
        })
      }
      return { success: true, data: submission }
    } catch (error) {
      logger.error('DatabaseService: Failed to create submission', error, {
        component: 'DatabaseService',
        action: 'createSubmission'
      })

      return { success: false, error: "Failed to create submission" }
    }
  }

  async getSubmissions(filter?: any): Promise<DatabaseResult<Submission[]>> {
    logger.info('DatabaseService: Getting submissions', {
      component: 'DatabaseService',
      action: 'getSubmissions',
      data: { filter }
    })

    try {
      if (this.isClient) {
        const stored = localStorage.getItem("demo_submissions") || "[]"
        const submissions = JSON.parse(stored)

        logger.info('DatabaseService: Retrieved submissions', {
          component: 'DatabaseService',
          action: 'getSubmissions',
          data: { count: submissions.length }
        })

        return { success: true, data: submissions }
      }
      return { success: true, data: [] }
    } catch (error) {
      logger.error('DatabaseService: Failed to get submissions', error, {
        component: 'DatabaseService',
        action: 'getSubmissions'
      })

      return { success: false, error: "Failed to get submissions" }
    }
  }

  async updateSubmissionStatus(id: string, status: string): Promise<DatabaseResult<boolean>> {
    logger.info('DatabaseService: Updating submission status', {
      component: 'DatabaseService',
      action: 'updateSubmissionStatus',
      data: { submissionId: id, newStatus: status }
    })

    try {
      if (this.isClient) {
        const stored = localStorage.getItem("demo_submissions") || "[]"
        const submissions = JSON.parse(stored)
        const index = submissions.findIndex((s: any) => s.id === id)
        if (index >= 0) {
          submissions[index].status = status
          localStorage.setItem("demo_submissions", JSON.stringify(submissions))

          logger.info('DatabaseService: Status updated successfully', {
            component: 'DatabaseService',
            action: 'updateSubmissionStatus',
            data: { submissionId: id, status }
          })
        } else {
          logger.warn('DatabaseService: Submission not found for status update', {
            component: 'DatabaseService',
            action: 'updateSubmissionStatus',
            data: { submissionId: id }
          })
        }
      }
      return { success: true, data: true }
    } catch (error) {
      logger.error('DatabaseService: Failed to update status', error, {
        component: 'DatabaseService',
        action: 'updateSubmissionStatus'
      })

      return { success: false, error: "Failed to update status" }
    }
  }

  async checkConnection(): Promise<DatabaseResult<boolean>> {
    logger.info('DatabaseService: Checking connection', {
      component: 'DatabaseService',
      action: 'checkConnection'
    })

    try {
      // Simple connection test
      return { success: true, data: true }
    } catch (error) {
      logger.error('DatabaseService: Connection check failed', error, {
        component: 'DatabaseService',
        action: 'checkConnection'
      })
      return { success: false, error: "Connection check failed" }
    }
  }
}

export const dbService = new DatabaseService()