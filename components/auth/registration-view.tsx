"use client"

import type React from "react"
import { useState } from "react"

interface RegistrationViewProps {
  onRegister: (email: string, password_hash: string) => void
}

const RegistrationView: React.FC<RegistrationViewProps> = ({ onRegister }) => {
  const [email, setEmail] = useState("")
  const [password_hash, setPassword] = useState("")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onRegister(email, password_hash)
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password_hash} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default RegistrationView
