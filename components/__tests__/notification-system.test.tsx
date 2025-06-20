// File: c:\Users\admin\aksstudio\components\__tests__\notification-system.test.tsx
import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import "@testing-library/jest-dom"
import { NotificationSystem, type NotificationData } from "@/components/notification-system" // Adjust path as needed

// Mock AudioContext
const mockAudioContext = {
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    frequency: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    type: "",
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  }),
  destination: {},
  currentTime: 0,
}

global.AudioContext = jest.fn().mockImplementation(() => mockAudioContext)
// @ts-ignore
global.webkitAudioContext = jest.fn().mockImplementation(() => mockAudioContext)


jest.useFakeTimers()

describe("NotificationSystem", () => {
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    mockOnRemove.mockClear()
    mockAudioContext.createOscillator.mockClear()
    mockAudioContext.createGain.mockClear()
  })

  const defaultNotifications: NotificationData[] = [
    {
      id: "1",
      type: "success",
      title: "Success Title",
      message: "Success message.",
      duration: 1000,
      sound: true,
    },
    {
      id: "2",
      type: "error",
      title: "Error Title",
      message: "Error message.",
      duration: 1500,
      sound: false,
    },
    {
      id: "3",
      type: "info",
      title: "Info Title",
      message: "Info message.",
      // No duration, should not auto-remove
    },
     {
      id: "4",
      type: "warning",
      title: "Warning Title",
      message: "Warning message.",
      duration: 500,
      sound: true,
    },
  ]

  test("renders nothing when no notifications are provided", () => {
    const { container } = render(<NotificationSystem notifications={[]} onRemove={mockOnRemove} />)
    expect(container.firstChild).toBeNull()
  })

  test("renders nothing when notifications prop is undefined or null", () => {
    const { container: containerUndefined } = render(<NotificationSystem notifications={undefined} onRemove={mockOnRemove} />)
    expect(containerUndefined.firstChild).toBeNull()
    // @ts-ignore
    const { container: containerNull } = render(<NotificationSystem notifications={null} onRemove={mockOnRemove} />)
    expect(containerNull.firstChild).toBeNull()
  })

  test("renders notifications correctly", () => {
    render(<NotificationSystem notifications={defaultNotifications} onRemove={mockOnRemove} />)
    expect(screen.getByText("Success Title")).toBeInTheDocument()
    expect(screen.getByText("Success message.")).toBeInTheDocument()
    expect(screen.getByText("Error Title")).toBeInTheDocument()
    expect(screen.getByText("Error message.")).toBeInTheDocument()
    expect(screen.getByText("Info Title")).toBeInTheDocument()
    expect(screen.getByText("Info message.")).toBeInTheDocument()
    expect(screen.getByText("Warning Title")).toBeInTheDocument()
    expect(screen.getByText("Warning message.")).toBeInTheDocument()
  })

  test("calls onRemove when close button is clicked", () => {
    render(<NotificationSystem notifications={[defaultNotifications[0]]} onRemove={mockOnRemove} />)
    const closeButton = screen.getByRole("button")
    fireEvent.click(closeButton)
    expect(mockOnRemove).toHaveBeenCalledWith("1")
  })

  test("calls onRemove after specified duration", () => {
    render(<NotificationSystem notifications={[defaultNotifications[0]]} onRemove={mockOnRemove} />)
    expect(mockOnRemove).not.toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(mockOnRemove).toHaveBeenCalledWith("1")
  })

   test("does not call onRemove if duration is not specified", () => {
    render(<NotificationSystem notifications={[defaultNotifications[2]]} onRemove={mockOnRemove} />) // Info notification without duration
    act(() => {
      jest.advanceTimersByTime(5000) // Advance well past typical durations
    })
    expect(mockOnRemove).not.toHaveBeenCalledWith("3")
  })


  test("plays sound if sound prop is true", () => {
    render(<NotificationSystem notifications={[defaultNotifications[0]]} onRemove={mockOnRemove} />)
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4) // Success sound has 4 oscillators
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(4)
  })

  test("does not play sound if sound prop is false", () => {
    render(<NotificationSystem notifications={[defaultNotifications[1]]} onRemove={mockOnRemove} />)
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled()
    expect(mockAudioContext.createGain).not.toHaveBeenCalled()
  })

  test("displays correct icon and colors for success notification", () => {
    render(<NotificationSystem notifications={[defaultNotifications[0]]} onRemove={mockOnRemove} />)
    const notificationDiv = screen.getByText("Success Title").closest("div.flex-1")?.parentElement?.parentElement?.parentElement
    expect(notificationDiv).toHaveClass("bg-green-600 border-green-500 text-green-100")
    expect(notificationDiv?.querySelector("svg")).toHaveClass("lucide-check-circle")
  })

  test("displays correct icon and colors for error notification", () => {
    render(<NotificationSystem notifications={[defaultNotifications[1]]} onRemove={mockOnRemove} />)
    const notificationDiv = screen.getByText("Error Title").closest("div.flex-1")?.parentElement?.parentElement?.parentElement
    expect(notificationDiv).toHaveClass("bg-red-600 border-red-500 text-red-100")
    expect(notificationDiv?.querySelector("svg")).toHaveClass("lucide-alert-circle")
  })

  test("displays correct icon and colors for info notification", () => {
    render(<NotificationSystem notifications={[defaultNotifications[2]]} onRemove={mockOnRemove} />)
    const notificationDiv = screen.getByText("Info Title").closest("div.flex-1")?.parentElement?.parentElement?.parentElement
    expect(notificationDiv).toHaveClass("bg-blue-600 border-blue-500 text-blue-100")
    expect(notificationDiv?.querySelector("svg")).toHaveClass("lucide-info")
  })

  test("displays correct icon and colors for warning notification", () => {
    render(<NotificationSystem notifications={[defaultNotifications[3]]} onRemove={mockOnRemove} />)
    const notificationDiv = screen.getByText("Warning Title").closest("div.flex-1")?.parentElement?.parentElement?.parentElement
    expect(notificationDiv).toHaveClass("bg-yellow-600 border-yellow-500 text-yellow-100")
    expect(notificationDiv?.querySelector("svg")).toHaveClass("lucide-alert-circle") // Warning uses AlertCircle too
  })

  test("handles multiple notifications and their removal", () => {
    render(<NotificationSystem notifications={defaultNotifications} onRemove={mockOnRemove} />)

    // Remove first notification by duration
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(mockOnRemove).toHaveBeenCalledWith("1")
    expect(mockOnRemove).not.toHaveBeenCalledWith("2") // duration 1500
    expect(mockOnRemove).not.toHaveBeenCalledWith("4") // duration 500, but "1" was first with 1000

    // Remove fourth notification by duration (it was shorter than the second)
    // Note: The previous advanceTimersByTime(1000) already covered the 500ms for notification "4".
    // So, we need to check if it was called.
    // If jest.advanceTimersByTime was more granular or if we reset timers, this would be different.
    // For simplicity, we assume the useEffect handles them based on their individual timers.
    // Let's advance specifically for the next shortest.
     act(() => {
      jest.advanceTimersByTime(500) // Total 1500ms from start
    })
    expect(mockOnRemove).toHaveBeenCalledWith("4") // This should have been called earlier
    expect(mockOnRemove).toHaveBeenCalledWith("2")


    // Click to remove the "Info" notification (which has no duration)
    const infoNotification = screen.getByText("Info Title")
    const infoCloseButton = infoNotification.closest("div.p-4")?.querySelector("button")
    if (infoCloseButton) {
        fireEvent.click(infoCloseButton)
    }
    expect(mockOnRemove).toHaveBeenCalledWith("3")
  })

  test("plays correct sound for warning notification", () => {
    render(<NotificationSystem notifications={[defaultNotifications[3]]} onRemove={mockOnRemove} />);
    // Warning sound creates 3 oscillators
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
    expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3);
  });
})
