# Backend Setup Guide

## 🚀 Quick Start

### 1. Environment Variables
Pastikan file `.env.local` memiliki variabel berikut:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Books API (Optional but recommended)
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

### 2. Database Setup
Jalankan migration SQL di Supabase Dashboard:

1. Buka Supabase Dashboard → SQL Editor
2. Jalankan file `supabase/schema.sql` (jika belum)
3. Jalankan file `supabase/migrations/001_add_dashboard_tables.sql`

### 3. Test Backend
```bash
# Start development server
npm run dev

# Test backend endpoints
npm run test:backend

# Check health
npm run health
```

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Books API
- `GET /api/books/search?q=query` - Search books
- `GET /api/books/trending?limit=20` - Get trending books

### Dashboard API (Requires Authentication)
- `GET /api/dashboard/stats?userId=uuid` - User reading statistics
- `GET /api/dashboard/activity?userId=uuid` - Recent user activity

### User API (Requires Authentication)
- `GET /api/user/goals?userId=uuid` - Get user reading goals
- `POST /api/user/goals` - Update user reading goals

## 🔧 Backend Features

### ✅ Implemented
- **Authentication**: Supabase Auth integration
- **Rate Limiting**: API request limits per IP
- **Caching**: In-memory cache for better performance
- **Error Handling**: Structured error responses
- **Database Functions**: Optimized SQL functions
- **Health Monitoring**: System health checks

### 🛡️ Security Features
- Row Level Security (RLS) policies
- User authentication verification
- Rate limiting per endpoint
- Input validation
- SQL injection prevention

### 📈 Performance Features
- Response caching (books, stats, trends)
- Database query optimization
- Efficient data structures
- Connection pooling via Supabase

## 🗄️ Database Schema

### Core Tables
- `profiles` - User profiles
- `books_metadata` - Book information cache
- `reviews` - User book reviews

### Dashboard Tables
- `user_goals` - Reading targets (yearly/monthly)
- `reading_list` - User's reading list with status
- `wishlist` - User's wishlist
- `book_genres` - Book categorization
- `reading_sessions` - Reading time tracking

### Functions
- `get_user_reading_stats()` - Calculate user statistics
- `calculate_reading_streak()` - Calculate consecutive reading days
- `is_username_available()` - Check username availability

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check Supabase URL and keys
   - Verify RLS policies are enabled
   - Run migrations if tables are missing

2. **Google Books API Errors**
   - Add API key to environment variables
   - Check API quota limits
   - Verify API key permissions

3. **Rate Limiting Issues**
   - Adjust rate limits in `lib/rate-limiter.ts`
   - Clear cache if needed
   - Check client IP detection

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Test database connection
curl http://localhost:3000/api/health

# Test specific endpoint
curl "http://localhost:3000/api/books/search?q=javascript"
```

## 📝 Development Notes

### Adding New Endpoints
1. Create route file in `app/api/`
2. Add rate limiting if needed
3. Implement error handling
4. Add authentication check for protected routes
5. Update tests in `scripts/test-backend.js`

### Database Changes
1. Create migration file in `supabase/migrations/`
2. Update TypeScript interfaces
3. Add RLS policies
4. Test with sample data

### Performance Optimization
- Use caching for expensive operations
- Implement database indexes
- Optimize SQL queries
- Monitor API response times

## 🔍 Monitoring

### Health Checks
- Database connectivity
- External API status
- Response times
- Cache performance

### Logs
- API request logs
- Error tracking
- Performance metrics
- Security events

Backend siap digunakan! 🎉