// components/status-indicator.tsx
interface StatusIndicatorProps {
  status: "connected" | "disconnected" | "checking" | "available" | "unavailable"
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getColor = () => {
    switch (status) {
      case "connected":
      case "available":
        return "bg-green-500"
      case "disconnected":
      case "unavailable":
        return "bg-red-500"
      case "checking":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className={`w-2 h-2 rounded-full ${getColor()}`} />
  )
}
