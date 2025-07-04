"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { useOthers, useMyPresence, useStorage, useMutation } from "@/liveblocks.config";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";

interface WhiteboardProps {
    readonly className?: string;
}

export function Whiteboard({ className }: WhiteboardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [myPresence, updateMyPresence] = useMyPresence();
    const others = useOthers();

    // We need to cast storage to any to avoid typing issues
    const notes = useStorage((root: any) => root?.notes);
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);

    // Check when storage is loaded
    useEffect(() => {
        if (notes) {
            setIsStorageLoaded(true);
        }
    }, [notes]);

    // Create a new note
    const createNote = useMutation(({ storage }: any) => {
        if (!isStorageLoaded) return;

        const id = nanoid();
        const noteData = new LiveObject({
            x: Math.random() * 400,
            y: Math.random() * 400,
            text: "Ghi chú mới",
            selectedBy: null,
            id,
        });

        // We need to use any type to avoid typing issues
        const notesMap = storage.get("notes");
        notesMap.set(id, noteData);
    }, [isStorageLoaded]);

    // Delete a note
    const deleteNote = useMutation(({ storage }: any, noteId: string) => {
        if (!isStorageLoaded) return;

        const notesMap = storage.get("notes");
        notesMap.delete(noteId);
    }, [isStorageLoaded]);

    // Update cursor position
    const updateCursor = useCallback(
        (event: React.MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            updateMyPresence({ cursor: { x, y } });
        },
        [updateMyPresence]
    );

    // Remove cursor when leaving whiteboard
    const removeCursor = useCallback(() => {
        updateMyPresence({ cursor: null });
    }, [updateMyPresence]);

    // Show loading state if storage isn't loaded yet
    if (!isStorageLoaded) {
        return (
            <div className={`relative w-full h-[600px] bg-gray-100 dark:bg-gray-800 border rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
                <div className="text-lg">Đang tải bảng ghi chú...</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[600px] bg-gray-100 dark:bg-gray-800 border rounded-lg overflow-hidden ${className}`}
            onMouseMove={updateCursor}
            onMouseLeave={removeCursor}
            role="application"
            aria-label="Bảng ghi chú cộng tác"
        >
            {/* Display other users' cursors */}
            {others.map(({ connectionId, presence }: any) => {
                if (!presence?.cursor) return null;

                return (
                    <div
                        key={connectionId}
                        className="absolute w-4 h-4 rounded-full bg-blue-500 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                            left: presence.cursor.x,
                            top: presence.cursor.y,
                        }}
                    />
                );
            })}

            {/* Display notes */}
            {notes && Array.from(notes.entries()).map(([noteId, note]: [string, any]) => (
                <div
                    key={noteId}
                    className="absolute min-w-[200px] min-h-[100px] p-4 bg-yellow-100 shadow-md rounded-md cursor-move"
                    style={{
                        left: note.get("x"),
                        top: note.get("y"),
                    }}
                >
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold">Ghi chú</span>
                        <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteNote(noteId)}
                            aria-label="Xóa ghi chú"
                        >
                            ×
                        </button>
                    </div>
                    <div className="p-2 bg-white rounded">
                        {note.get("text")}
                    </div>
                </div>
            ))}

            {/* Button to create a new note */}
            <button
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
                onClick={() => createNote()}
            >
                Tạo ghi chú mới
            </button>
        </div>
    );
}
