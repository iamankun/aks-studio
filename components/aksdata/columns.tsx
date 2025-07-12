"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Music, FileText, ImageIcon, MoreHorizontal, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define the data shape based on our API response
export type SubmissionFile = {
  id: string
  name: string
  type: 'folder' | 'audio' | 'image' | 'document' | 'other'
  size: string
  artist_name?: string
  status?: string
  submission_date?: string
}

// Helper to get the right icon for the file type
const TypeIcon = ({ type }: { type: SubmissionFile['type'] }) => {
  switch (type) {
    case 'audio': return <Music className="h-4 w-4 text-blue-500" />;
    case 'image': return <ImageIcon className="h-4 w-4 text-green-500" />;
    case 'document': return <FileText className="h-4 w-4 text-purple-500" />;
    case 'folder': return <Folder className="h-4 w-4 text-yellow-500" />;
    default: return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

// Helper to get the right badge variant for the status
const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const columns: ColumnDef<SubmissionFile>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <TypeIcon type={row.original.type} />,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Track Title",
  },
  {
    accessorKey: "artist_name",
    header: "Artist",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "unknown";
      const variant = getBadgeVariant(status);
      return <Badge variant={variant} className="capitalize">{status}</Badge>;
    },
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "submission_date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.submission_date;
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const submission = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(submission.id)}>Copy ID</DropdownMenuItem>
            <DropdownMenuItem>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]