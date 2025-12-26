'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction } from '@/lib/auth-actions'
import { User, Mail, Calendar, Save } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Profile } from '@/lib/database'

interface ProfileFormProps {
  user: SupabaseUser
  profile: Profile
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('bio', bio)
      formData.append('avatar_url', avatarUrl)

      await updateProfileAction(formData)
      setMessage('Profile updated successfully!')
      router.refresh()
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-zinc-200 flex items-center justify-center">
              <User className="h-8 w-8 text-zinc-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="avatar_url" className="block text-sm font-medium text-zinc-700 mb-2">
            Avatar URL
          </label>
          <input
            id="avatar_url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>

      {/* Email (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
          <input
            type="email"
            value={user.email || ''}
            disabled
            className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg bg-zinc-50 text-zinc-500 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Email cannot be changed from this form
        </p>
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-zinc-700 mb-2">
          Username
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={4}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
          disabled={loading}
        />
        <p className="text-xs text-zinc-500 mt-1">
          {bio.length}/500 characters
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-zinc-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-900 mb-2">Account Information</h3>
        <div className="flex items-center text-sm text-zinc-600">
          <Calendar className="h-4 w-4 mr-2" />
          Member since {new Date(profile.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-lg hover:bg-zinc-800 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.startsWith('Error') 
            ? 'text-red-600 bg-red-50 border border-red-200' 
            : 'text-green-600 bg-green-50 border border-green-200'
        }`}>
          {message}
        </div>
      )}
    </form>
  )
}