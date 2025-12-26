/**
 * Request throttling utility to prevent 403 errors from Google Books API
 * Implements a simple queue system with configurable delays
 */

interface QueuedRequest {
  url: string
  options: RequestInit
  resolve: (response: Response) => void
  reject: (error: Error) => void
}

class RequestThrottler {
  private queue: QueuedRequest[] = []
  private processing = false
  private lastRequestTime = 0
  private minDelay: number

  constructor(minDelayMs: number = 300) {
    this.minDelay = minDelayMs
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const request = this.queue.shift()!
      
      // Ensure minimum delay between requests
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      
      if (timeSinceLastRequest < this.minDelay) {
        const delayNeeded = this.minDelay - timeSinceLastRequest
        await new Promise(resolve => setTimeout(resolve, delayNeeded))
      }

      try {
        const response = await fetch(request.url, request.options)
        this.lastRequestTime = Date.now()
        request.resolve(response)
      } catch (error) {
        request.reject(error as Error)
      }
    }

    this.processing = false
  }

  getQueueLength(): number {
    return this.queue.length
  }

  clear(): void {
    this.queue.forEach(request => {
      request.reject(new Error('Request queue cleared'))
    })
    this.queue = []
    this.processing = false
  }
}

// Create a singleton throttler for Google Books API
export const googleBooksThrottler = new RequestThrottler(400) // 400ms between requests

// Throttled fetch function for Google Books API
export async function throttledFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Only throttle Google Books API requests
  if (url.includes('googleapis.com/books')) {
    return googleBooksThrottler.fetch(url, options)
  }
  
  // Use regular fetch for other APIs
  return fetch(url, options)
}