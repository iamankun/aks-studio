// @ts-check
/**
 * API route để ghi log hoạt động từ client
 */

import { NextResponse } from 'next/server';
import { neon } from "@neondatabase/serverless";

// Load environment variables
const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Handler POST request để ghi log hoạt động từ client
 * 
 * @param {Request} req - Request object
 */
export async function POST(req) {
    try {
        // Parse body
        const body = await req.json();

        // Validate input
        if (!body.action) {
            return NextResponse.json(
                { error: 'Missing required field: action' },
                { status: 400 }
            );
        }

        // Prepare user info
        const username = body.username || 'anonymous';
        const email = body.email || null;
        const userId = body.userId || null;

        // Prepare log data
        const action = body.action;
        const description = body.description || null;
        const entityType = body.entityType || 'client';
        const entityId = body.entityId || null;
        const status = body.status || 'success';
        const resultValue = body.result || null;
        const details = body.details || {};

        // Prepare request info
        const headers = req.headers;
        const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
        const userAgent = headers.get('user-agent') || 'unknown';

        // Connect to database
        if (!DATABASE_URL) {
            console.error('DATABASE_URL not found');
            return NextResponse.json(
                { error: 'Database configuration error' },
                { status: 500 }
            );
        }

        const sql = neon(DATABASE_URL);

        // Insert log into database
        const insertResult = await sql`
      INSERT INTO nhat_ky_studio (
        username, 
        email, 
        user_id, 
        action, 
        description, 
        ip_address, 
        user_agent, 
        entity_type, 
        entity_id, 
        status, 
        result, 
        details
      ) VALUES (
        ${username}, 
        ${email}, 
        ${userId}, 
        ${action}, 
        ${description}, 
        ${ip}, 
        ${userAgent}, 
        ${entityType}, 
        ${entityId}, 
        ${status}, 
        ${resultValue}, 
        ${JSON.stringify(details)}
      ) RETURNING id
    `;

        return NextResponse.json(
            { success: true, id: insertResult[0]?.id || 'unknown' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error logging activity:', error);
        return NextResponse.json(
            { error: 'Failed to log activity' },
            { status: 500 }
        );
    }
}

/**
 * Handler GET request để lấy log hoạt động
 * 
 * @param {Request} req - Request object
 */
export async function GET(req) {
    try {
        // Lấy query params
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);
        const username = url.searchParams.get('username');
        const action = url.searchParams.get('action');
        const entityType = url.searchParams.get('entityType');
        const status = url.searchParams.get('status');

        // Connect to database
        if (!DATABASE_URL) {
            console.error('DATABASE_URL not found');
            return NextResponse.json(
                { error: 'Database configuration error' },
                { status: 500 }
            );
        }

        const sql = neon(DATABASE_URL);

        // Build query
        let query = sql`
      SELECT * FROM nhat_ky_studio WHERE 1=1
    `;

        // Add filters
        if (username) {
            query = sql`${query} AND username = ${username}`;
        }

        if (action) {
            query = sql`${query} AND action = ${action}`;
        }

        if (entityType) {
            query = sql`${query} AND entity_type = ${entityType}`;
        }

        if (status) {
            query = sql`${query} AND status = ${status}`;
        }

        // Add order and limit
        query = sql`${query} ORDER BY created_at DESC LIMIT ${limit}`;

        // Execute query
        const logs = await query;

        return NextResponse.json(
            { logs: logs },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error getting logs:', error);
        return NextResponse.json(
            { error: 'Failed to get logs' },
            { status: 500 }
        );
    }
}
