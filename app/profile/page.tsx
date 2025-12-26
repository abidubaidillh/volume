import { getCurrentUser } from '@/lib/auth'
import { getProfile } from '@/lib/database'
import { ProfileForm } from '@/components/profile-form'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login?redirect=/profile')
  }

  const profile = await getProfile(user.id)

  if (!profile) {
    redirect('/login?redirect=/profile')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Profile Settings</h1>
            <p className="text-zinc-600">
              Manage your account information and preferences.
            </p>
          </div>

          <ProfileForm user={user} profile={profile} />
        </div>
      </div>
    </div>
  )
}