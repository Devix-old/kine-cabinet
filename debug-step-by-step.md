# 🔍 Complete Debugging Guide for 500 Errors

## Overview
This guide provides a systematic approach to debug the 500 Internal Server Error you're experiencing during registration/login.

## 🚨 CRITICAL ISSUE FOUND
**The registration API had a syntax error that was causing 500 errors.** This has been fixed, but follow the debugging steps below to ensure everything is working properly.

---

## Step 1: Run Basic Health Checks

### 1.1 Environment Variables Check
```bash
# Check if required environment variables are set
echo "DATABASE_URL: ${DATABASE_URL:0:20}..."
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:20}..."
echo "NEXTAUTH_URL: ${NEXTAUTH_URL}"
```

**Expected:** All three variables should be set and non-empty.

### 1.2 Database Connection Test
```bash
# Test database connection
npm run test:connection
```

**Expected:** Should show successful connection with user count.

### 1.3 Prisma Schema Check
```bash
# Ensure Prisma client is up to date
npx prisma generate
npx prisma db push
```

**Expected:** No errors, schema should be synchronized.

---

## Step 2: Run Comprehensive Debug Suite

### 2.1 Authentication & Database Debug
```bash
node debug-auth-issues.js
```

**What it tests:**
- ✅ Environment variables
- ✅ Database connection
- ✅ Schema validation
- ✅ Trial plan existence
- ✅ Registration API simulation
- ✅ Login API simulation
- ✅ Database performance
- ✅ Prisma client health

### 2.2 API Endpoint Testing
```bash
node debug-api-endpoints.js
```

**What it tests:**
- ✅ Server health
- ✅ Registration endpoint
- ✅ Login endpoint
- ✅ Database connection via API
- ✅ Error handling
- ✅ Concurrent requests

### 2.3 Database Performance Analysis
```bash
node debug-database-performance.js
```

**What it tests:**
- ✅ Connection pool performance
- ✅ Transaction performance
- ✅ Lock detection
- ✅ Memory usage
- ✅ Query optimization
- ✅ Connection string analysis

---

## Step 3: Manual Testing Steps

### 3.1 Browser Network Tab Analysis
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to register a new user
4. Look for the failed request
5. Check:
   - Request payload
   - Response status
   - Response headers
   - Response body (error details)

### 3.2 Server Logs Analysis
```bash
# Start your development server with detailed logging
npm run dev
```

Look for:
- Database connection errors
- Prisma query errors
- Authentication errors
- Uncaught exceptions

### 3.3 Database Direct Testing
```bash
# Connect to your database directly (replace with your connection details)
psql "postgresql://username:password@host:port/database"

# Test basic queries
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM cabinets;
SELECT COUNT(*) FROM plans;
```

---

## Step 4: Common Issues & Solutions

### 4.1 Missing Trial Plan
**Error:** "Trial plan not found"
**Solution:**
```bash
npm run db:seed
```

### 4.2 Database Connection Issues
**Error:** Connection timeout or refused
**Solutions:**
1. Check DATABASE_URL format
2. Verify database server is running
3. Check firewall/network settings
4. Test connection with pgAdmin

### 4.3 Prisma Client Issues
**Error:** Prisma client not generated
**Solution:**
```bash
npx prisma generate
npx prisma db push
```

### 4.4 Environment Variables
**Error:** Missing or incorrect environment variables
**Solution:**
Create/update `.env.local`:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4.5 Race Conditions
**Error:** Intermittent 500 errors
**Solutions:**
1. Add retry logic to database operations
2. Implement connection pooling
3. Add proper error handling

---

## Step 5: Production Debugging

### 5.1 Enable Detailed Logging
Update your Prisma configuration:
```javascript
// lib/prisma.js
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // ... rest of config
})
```

### 5.2 Monitor Database Performance
```bash
# Check database connection count
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

# Check for long-running queries
SELECT query, state, query_start 
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY query_start;
```

### 5.3 Application Monitoring
- Enable error tracking (Sentry, etc.)
- Monitor API response times
- Track database query performance
- Set up alerts for 500 errors

---

## Step 6: Advanced Debugging

### 6.1 Database Locks Detection
```sql
-- Check for locks
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

### 6.2 Connection Pool Analysis
```bash
# Check current connections
netstat -an | grep :5432 | wc -l

# Monitor connection usage over time
watch -n 1 "netstat -an | grep :5432 | wc -l"
```

### 6.3 Memory Usage Monitoring
```bash
# Monitor Node.js memory usage
node --inspect your-app.js

# Or use process monitoring
htop
# Look for high memory usage or CPU spikes
```

---

## Step 7: Prevention & Best Practices

### 7.1 Database Optimization
1. **Add Indexes:**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_cabinets_nom ON cabinets(nom);
   ```

2. **Connection Pooling:**
   ```javascript
   // Use connection pooling in production
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL + "?connection_limit=5"
       }
     }
   })
   ```

### 7.2 Error Handling
```javascript
// Add retry logic for database operations
async function withRetry(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

### 7.3 Monitoring Setup
1. Set up database monitoring
2. Configure application performance monitoring
3. Set up error alerting
4. Monitor API response times

---

## Quick Troubleshooting Checklist

- [ ] Environment variables are set correctly
- [ ] Database server is running and accessible
- [ ] Prisma schema is up to date
- [ ] Trial plan exists in database
- [ ] No syntax errors in API code
- [ ] Database connection pool is not exhausted
- [ ] No database locks or deadlocks
- [ ] Server has sufficient memory
- [ ] Network connectivity is stable

---

## Emergency Fixes

If you need immediate resolution:

1. **Restart everything:**
   ```bash
   # Stop server
   # Restart database
   # Clear node_modules and reinstall
   npm install
   npx prisma generate
   npm run dev
   ```

2. **Reset database (if safe to do so):**
   ```bash
   npm run db:reset
   npm run db:seed
   ```

3. **Check for corrupted data:**
   ```bash
   npm run clean-test-data
   ```

---

## Getting Help

If issues persist after following this guide:

1. Run all three debug scripts and save outputs
2. Check browser network tab for exact error details
3. Review server logs for stack traces
4. Test with a minimal reproduction case
5. Consider database hosting provider issues

Remember: The syntax error in the registration API has been fixed, so your 500 errors should be resolved. Use this guide to verify everything is working correctly and prevent future issues.
