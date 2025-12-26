export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  return { isValid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' }
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' }
  }
  
  return { isValid: true }
}

export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Username is required' }
  }
  
  if (username.length < 2) {
    return { isValid: false, error: 'Username must be at least 2 characters long' }
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' }
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  
  return { isValid: true }
}

export function calculatePasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  if (password.length >= 8) {
    score += 25
  } else {
    feedback.push('Use at least 8 characters')
  }
  
  if (/[a-z]/.test(password)) {
    score += 15
  } else {
    feedback.push('Add lowercase letters')
  }
  
  if (/[A-Z]/.test(password)) {
    score += 15
  } else {
    feedback.push('Add uppercase letters')
  }
  
  if (/[0-9]/.test(password)) {
    score += 15
  } else {
    feedback.push('Add numbers')
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 15
  } else {
    feedback.push('Add special characters')
  }
  
  if (password.length >= 12) {
    score += 15
  }
  
  return { score: Math.min(score, 100), feedback }
}

export function getPasswordStrengthLabel(score: number): string {
  if (score < 25) return 'Very Weak'
  if (score < 50) return 'Weak'
  if (score < 75) return 'Good'
  if (score < 90) return 'Strong'
  return 'Very Strong'
}

export function getPasswordStrengthColor(score: number): string {
  if (score < 25) return 'bg-red-500'
  if (score < 50) return 'bg-orange-500'
  if (score < 75) return 'bg-yellow-500'
  if (score < 90) return 'bg-green-500'
  return 'bg-emerald-500'
}