// components/status-indicator.tsx
interface StatusIndicatorProps {
  status: string;
}

export function StatusIndicator({ status: statusType }: StatusIndicatorProps) {
  return (
    <span className={`px-2 py-1 rounded text-sm
        ${statusType === "connected" ? "bg-green-600 text-white" :
            statusType === "checking" ? "bg-yellow-600 text-white" : "bg-red-600 text-white"
        }`}>
      {statusType === "connected" ? "Kết nối" : statusType === "checking" ? "Đang kiểm tra..." : "Chưa kết nối"}
    </span>
  );
}
