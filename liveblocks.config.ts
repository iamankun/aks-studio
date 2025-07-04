import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
    publicApiKey: process.env.LIVEBLOCKS_PUBLIC_KEY || "pk_dev_123",
});

// Create the context without specifying types, to avoid complex type issues
export const {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useStorage,
    useMutation,
} = createRoomContext(client);
