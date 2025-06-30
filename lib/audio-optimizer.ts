// Audio Performance Fix Script
// Khắc phục vấn đề âm thanh vọng và tối ưu performance

export function optimizeAudioPerformance() {
    // 1. Clear any existing audio contexts
    if (typeof window !== 'undefined') {
        // Mute all videos and audio elements
        const videos = document.querySelectorAll('video')
        const audios = document.querySelectorAll('audio')
        const iframes = document.querySelectorAll('iframe')

        videos.forEach(video => {
            video.muted = true
            video.volume = 0.3 // Reduce volume to prevent echo
            video.pause()
        })

        audios.forEach(audio => {
            audio.muted = true
            audio.volume = 0.3
            audio.pause()
        })

        // Control YouTube iframes
        iframes.forEach(iframe => {
            if (iframe.src.includes('youtube.com')) {
                try {
                    iframe.contentWindow?.postMessage(
                        '{"event":"command","func":"mute","args":""}',
                        'https://www.youtube.com'
                    )
                    iframe.contentWindow?.postMessage(
                        '{"event":"command","func":"setVolume","args":[30]}',
                        'https://www.youtube.com'
                    )
                } catch (e) {
                    console.warn('Could not control YouTube iframe:', e)
                }
            }
        })

        // 2. Debounce user interactions to prevent spam
        let interactionTimeout: NodeJS.Timeout
        const debouncedInteraction = () => {
            clearTimeout(interactionTimeout)
            interactionTimeout = setTimeout(() => {
                // Reset audio contexts after user stops interacting
                videos.forEach(v => v.muted = true)
                audios.forEach(a => a.muted = true)
            }, 1000)
        }

        // 3. Add optimized event listeners
        ['click', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, debouncedInteraction, {
                passive: true,
                capture: false
            })
        })

        // 4. Prevent audio autoplay conflicts
        const preventAutoplay = () => {
            const mediaElements = document.querySelectorAll('video, audio')
            mediaElements.forEach(element => {
                element.removeAttribute('autoplay')
                if (!element.muted) {
                    element.muted = true
                }
            })
        }

        // Run immediately and on DOM changes
        preventAutoplay()
        const observer = new MutationObserver(preventAutoplay)
        observer.observe(document.body, {
            childList: true,
            subtree: true
        })

        return () => {
            observer.disconnect()
            clearTimeout(interactionTimeout)
        }
    }
}

// Utility to check and fix audio performance issues
export function checkAudioHealth() {
    if (typeof window === 'undefined') return { status: 'N/A' }

    const videos = document.querySelectorAll('video')
    const audios = document.querySelectorAll('audio')
    const iframes = document.querySelectorAll('iframe[src*="youtube"]')

    return {
        status: 'OK',
        videoCount: videos.length,
        audioCount: audios.length,
        youtubeCount: iframes.length,
        mutedVideos: Array.from(videos).filter(v => v.muted).length,
        mutedAudios: Array.from(audios).filter(a => a.muted).length,
        recommendations: [
            videos.length > 1 && 'Multiple videos detected - consider reducing',
            audios.length > 0 && 'Audio elements found - ensure proper volume control',
            iframes.length > 1 && 'Multiple YouTube videos - may cause performance issues'
        ].filter(Boolean)
    }
}
