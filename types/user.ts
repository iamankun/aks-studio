export interface User {
  id: string
  username: string
  password?: string
  email: string
  role: "Label Manager" | "Artist" | "Label Manager & Artist"
  fullName: string
  createdAt: string
  avatar?: string
  bio?: string
  socialLinks?: {
    facebook?: string
    youtube?: string
    spotify?: string
    appleMusic?: string
    tiktok?: string
    instagram?: string
  }
  isrcCodePrefix?: string
}

// Database mapping interface
/**
 * Represents a user record as stored in the database.
 *
 * @property id - Unique identifier for the user.
 * @property username - The user's login name.
 * @property password - The user's hashed password.
 * @property email - The user's email address.
 * @property role - The user's role (e.g., admin, editor, user).
 * @property full_name - The user's full name.
 * @property created_at - Timestamp of when the user was created (ISO string).
 * @property updated_at - Timestamp of the last update to the user (ISO string).
 * @property avatar_url - (Optional) URL to the user's avatar image.
 * @property bio - (Optional) Short biography or description of the user.
 * @property social_links - (Optional) Social media links or related data.
 * @property isrc_code_prefix - (Optional) ISRC code prefix associated with the user.
 */
export interface DbUser {
  id: string
  username: string
  password: string
  email: string
  role: string
  full_name: string
  created_at: string
  updated_at: string
  avatar_url?: string
  bio?: string
  social_links?: {
    facebook?: string
    youtube?: string
    spotify?: string
    appleMusic?: string
    tiktok?: string
    instagram?: string
  }
  isrc_code_prefix?: string
}

// Legacy compatibility - these interfaces are deprecated
// Use the main User interface instead
export type Label_Manager = User
export type Artist = User
