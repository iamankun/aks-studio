import { NextRequest, NextResponse } from 'next/server';
import { multiDB } from '@/lib/multi-database-service';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        // Thêm xử lý lỗi cho body parsing
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return NextResponse.json({
                success: false,
                error: 'Invalid request format. Request body too large or malformed'
            }, { status: 400 });
        }

        // Giới hạn kích thước dữ liệu
        const jsonSize = JSON.stringify(body).length;
        if (jsonSize > 10 * 1024 * 1024) { // Giới hạn 10MB
            return NextResponse.json({
                success: false,
                error: 'Request too large. Please reduce image size'
            }, { status: 413 });
        }

        console.log(`Updating submission ${id}:`,
            Object.keys(body).map(key => `${key}: ${typeof body[key]}`).join(', '));

        const updateData = body;
        const result = await multiDB.updateSubmission(id, updateData);

        if (result.success) {
            return NextResponse.json({ success: true, submission: result.submission });
        } else {
            console.log('Update failed with error:', result.error);
            return NextResponse.json({
                success: false,
                error: result.error ?? 'Update failed'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error updating submission:', error);
        return NextResponse.json({
            success: false,
            error: 'Server error: ' + (error instanceof Error ? error.message : String(error))
        }, { status: 500 });
    }
}
