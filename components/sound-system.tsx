"use client"

import { useEffect } from "react"

export function SoundSystem() {
  const playRandomSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    const sounds = [
      // Drum sounds
      () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(60, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.1)
        oscillator.type = "triangle"

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      },
      // Cheng sound
      () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3)
        oscillator.type = "sawtooth"

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      },
      // Guitar pluck
      () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(330, audioContext.currentTime)
        oscillator.type = "square"

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.4)
      },
      // Piano note
      () => {
        ;[523.25, 659.25, 783.99].forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
            oscillator.type = "sine"

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.5)
          }, index * 50)
        })
      },
      // Snap sound
      () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.05)
        oscillator.type = "square"

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.05)
      },
    ]

    const randomSound = sounds[Math.floor(Math.random() * sounds.length)]
    randomSound()
  }

  const createMusicNoteAnimation = (x: number, y: number) => {
    const notes = ["♪", "♫", "♬", "♩", "♭", "♯", "𝄞", "𝄢"]

    for (let i = 0; i < 6; i++) {
      const note = document.createElement("div")
      note.innerHTML = notes[Math.floor(Math.random() * notes.length)]
      note.className = "music-note"
      note.style.position = "fixed"
      note.style.fontSize = `${1.2 + Math.random() * 0.8}rem`
      note.style.color = `hsl(${280 + Math.random() * 40}, 70%, ${60 + Math.random() * 20}%)`
      note.style.opacity = "1"
      note.style.transition = "transform 1.5s ease-out, opacity 1.5s ease-out"
      note.style.pointerEvents = "none"
      note.style.zIndex = "9999"
      note.style.userSelect = "none"
      document.body.appendChild(note)

      const startX = x + (Math.random() - 0.5) * 40
      const startY = y + (Math.random() - 0.5) * 30
      note.style.left = `${startX}px`
      note.style.top = `${startY}px`

      const angle = (Math.random() - 0.5) * 120
      const distance = 60 + Math.random() * 80
      const rotation = (Math.random() - 0.5) * 360

      void note.offsetWidth

      note.style.transform = `translate(${Math.sin((angle * Math.PI) / 180) * distance}px, -${Math.cos((angle * Math.PI) / 180) * distance + 40}px) scale(0.3) rotate(${rotation}deg)`
      note.style.opacity = "0"

      setTimeout(() => {
        note.remove()
      }, 1500)
    }
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      playRandomSound()
      createMusicNoteAnimation(e.clientX, e.clientY)
    }

    // Add click listener to entire document
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return null
}
