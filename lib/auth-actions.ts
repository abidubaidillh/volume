'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  if (!email || !password || !username) {
    throw new Error('All fields are required')
  }

  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: username
      }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || '/'

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signOutAction() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function sendMagicLinkAction(formData: FormData) {
  const email = formData.get('email') as string
  const redirectTo = formData.get('redirectTo') as string || '/'

  if (!email) {
    throw new Error('Email is required')
  }

  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
    }
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    throw new Error('Email is required')
  }

  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function updateProfileAction(formData: FormData) {
  const username = formData.get('username') as string
  const bio = formData.get('bio') as string
  const avatar_url = formData.get('avatar_url') as string

  const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  // Check username uniqueness if provided
  if (username) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()

    if (existingProfile) {
      throw new Error('Username already taken')
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...(username && { username }),
      ...(bio !== undefined && { bio }),
      ...(avatar_url !== undefined && { avatar_url })
    })
    .eq('id', user.id)

  if (error) {
    throw new Error('Failed to update profile')
  }

  revalidatePath('/profile')
}