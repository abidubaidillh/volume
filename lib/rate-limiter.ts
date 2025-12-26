interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const key = identifier

    // Clean up expired entries
    if (this.store[key] && now > this.store[key].resetTime) {
      delete this.store[key]
    }

    // Initialize or increment counter
    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      }
      return true
    }

    this.store[key].count++
    return this.store[key].count <= this.maxRequests
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.store[identifier]
    if (!entry) return this.maxRequests
    return Math.max(0, this.maxRequests - entry.count)
  }

  getResetTime(identifier: string): number {
    const entry = this.store[identifier]
    return entry ? entry.resetTime : Date.now()
  }
}

// Create different rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter(60000, 100) // 100 requests per minute
export const authRateLimiter = new RateLimiter(900000, 5) // 5 requests per 15 minutes
export const searchRateLimiter = new RateLimiter(60000, 30) // 30 searches per minute

export function getRateLimitHeaders(limiter: RateLimiter, identifier: string) {
  return {
    'X-RateLimit-Limit': limiter['maxRequests'].toString(),
    'X-RateLimit-Remaining': limiter.getRemainingRequests(identifier).toString(),
    'X-RateLimit-Reset': Math.ceil(limiter.getResetTime(identifier) / 1000).toString()
  }
}