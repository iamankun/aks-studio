import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Use null for initial state to identify pre-hydration state
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    // Handler function to update state based on media query
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    handleResize()

    // Set up event listener
    window.addEventListener("resize", handleResize)

    // Set up media query listener for more reliable changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      mql.removeEventListener("change", handleResize)
    }
  }, [])

  // Return false during SSR, and real value after hydration
  return isMobile === null ? false : isMobile
}
