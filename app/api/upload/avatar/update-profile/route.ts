import { NextRequest, NextResponse } from "next/server";
import { multiDB } from "@/lib/multi-database-service";
import { neon } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { id, username, email, fullName, bio, avatar, socialLinks, role } = data;

        if (!id || !username || !role) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Thiếu thông tin: id, username, và role là bắt buộc"
                },
                { status: 400 }
            );
        }

        // Xác định bảng dựa vào role
        const userTable = role === "Label Manager" ? "label_manager" : "artist";

        // Kết nối trực tiếp đến DB
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Không tìm thấy cấu hình database"
                },
                { status: 500 }
            );
        }

        const sql = neon(dbUrl);

        // Tạo một SQL query cụ thể dựa vào role
        try {
            // Cập nhật dữ liệu người dùng trong DB
            let result;

            // Dùng query theo kiểu template literal để neon có thể xử lý tham số an toàn
            if (userTable === "artist") {
                result = await sql`
          UPDATE artist 
          SET 
            email = ${email},
            real_name = ${fullName},
            bio = ${bio},
            avatar_url = ${avatar},
            social_links = ${JSON.stringify(socialLinks)},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
            } else {
                result = await sql`
          UPDATE label_manager 
          SET 
            email = ${email},
            full_name = ${fullName},
            bio = ${bio},
            avatar_url = ${avatar},
            social_links = ${JSON.stringify(socialLinks)},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
            }

            if (result && result.length > 0) {
                return NextResponse.json({
                    success: true,
                    message: "Cập nhật profile thành công",
                    user: result[0]
                });
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Không tìm thấy người dùng để cập nhật"
                    },
                    { status: 404 }
                );
            }
        } catch (dbError) {
            console.error("Database error:", dbError);
            return NextResponse.json(
                {
                    success: false,
                    message: `Lỗi database: ${dbError instanceof Error ? dbError.message : "Unknown error"}`
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            {
                success: false,
                message: `Lỗi cập nhật profile: ${error instanceof Error ? error.message : "Unknown error"}`
            },
            { status: 500 }
        );
    }
}
