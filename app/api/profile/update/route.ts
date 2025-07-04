import { NextRequest, NextResponse } from "next/server";
import { multiDB } from "@/lib/multi-database-service";

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { id, username, email, fullName, bio, avatar, socialLinks, role, table } = data;

        if (!id || !username || !role) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: id, username, and role are required"
                },
                { status: 400 }
            );
        }

        // Determine which table to update based on role
        const userTable = role === "Label Manager" ? "label_manager" : "artist";

        // Initialize neonSql if not already done
        await multiDB.initialize();

        // Update profile in database
        let updateSuccess = false;
        let updatedUser = null;

        // For artist table
        if (userTable === "artist") {
            const result = await multiDB.updateArtistProfile(id, {
                email,
                real_name: fullName,
                bio,
                avatar_url: avatar,
                social_links: socialLinks
            });
            updateSuccess = result.success;
            updatedUser = result.data;
        }
        // For label_manager table
        else if (userTable === "label_manager") {
            const result = await multiDB.updateLabelManagerProfile(id, {
                email,
                full_name: fullName,
                bio,
                avatar_url: avatar, // sẽ được chuyển thành 'avatar' trong service
                social_links: socialLinks
            });
            updateSuccess = result.success;
            updatedUser = result.data;
        }

        if (updateSuccess) {
            return NextResponse.json({
                success: true,
                message: "Profile updated successfully",
                user: updatedUser
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to update profile"
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            {
                success: false,
                message: `Error updating profile: ${error instanceof Error ? error.message : "Unknown error"}`
            },
            { status: 500 }
        );
    }
}
