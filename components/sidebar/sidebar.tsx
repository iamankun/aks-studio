"use client"

export function Sidebar({ currentView, onViewChange }) {
  // Add safety checks
  if (!currentView || !onViewChange) {
    return <div>Loading sidebar...</div>
  }

  return (
    <div className="sidebar">
      {/* Sidebar content goes here */}
      <p>Current View: {currentView}</p>
      <button onClick={() => onViewChange("view1")}>View 1</button>
      <button onClick={() => onViewChange("view2")}>View 2</button>
      <button onClick={() => onViewChange("view3")}>View 3</button>
    </div>
  )
}
