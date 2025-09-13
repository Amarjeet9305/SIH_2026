# 🛠️ Troubleshooting Guide

## Common Issues and Solutions

### 1. Installation Problems

#### "Command not found: npm"
**Problem:** Node.js is not installed or not in PATH
**Solution:**
```bash
# Download and install Node.js from https://nodejs.org/
# Then restart your terminal and try again
npm --version
```

#### "Cannot find module" errors
**Problem:** Dependencies not installed properly
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "Permission denied" errors (Windows)
**Problem:** Insufficient permissions
**Solution:**
- Run Command Prompt as Administrator
- Or use PowerShell as Administrator

### 2. Environment Setup Issues

#### "Missing environment variables"
**Problem:** `.env.local` file not created or incorrect
**Solution:**
1. Create `.env.local` file in project root
2. Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### "Invalid Supabase URL"
**Problem:** Wrong Supabase project URL
**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the exact Project URL (should start with https://)
3. Update your `.env.local` file

### 3. Database Issues

#### "Table doesn't exist"
**Problem:** Database tables not created
**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the complete SQL script from README.md
3. Check for any error messages

#### "Permission denied" for database
**Problem:** Row Level Security policies not set
**Solution:**
1. In Supabase Dashboard → Authentication → Policies
2. Make sure policies are enabled for reports and social_posts tables
3. Or run the SQL script again

### 4. Runtime Issues

#### "Port 3000 already in use"
**Problem:** Another application using port 3000
**Solution:**
```bash
# Option 1: Kill the process
npx kill-port 3000

# Option 2: Use a different port
npm run dev -- -p 3001
```

#### "Module not found" at runtime
**Problem:** Missing dependencies or build issues
**Solution:**
```bash
# Clear Next.js cache and reinstall
rm -rf .next
npm install
npm run dev
```

### 5. Supabase Connection Issues

#### "Invalid API key"
**Problem:** Wrong Supabase anon key
**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the "anon public" key (not the service role key)
3. Update `.env.local` file
4. Restart the development server

#### "CORS error"
**Problem:** Supabase CORS settings
**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Add `http://localhost:3000` to allowed origins
3. Or check if you're using the correct URL

### 6. Feature-Specific Issues

#### Location not capturing
**Problem:** Geolocation API not working
**Solution:**
- Make sure you're using HTTPS (required for geolocation)
- Check browser permissions for location access
- Try a different browser

#### Media upload failing
**Problem:** Supabase Storage not configured
**Solution:**
1. Go to Supabase Dashboard → Storage
2. Create a bucket named "hazard-media"
3. Set it to public
4. Check storage policies

#### AI features not working
**Problem:** OpenRouter API key missing or invalid
**Solution:**
1. Get API key from [OpenRouter](https://openrouter.ai)
2. Add to `.env.local`:
```env
OPENROUTER_API_KEY=your-api-key
```
3. Restart the server

### 7. Browser Issues

#### "This site can't be reached"
**Problem:** Development server not running
**Solution:**
```bash
# Make sure you're in the project directory
cd incois-hazard-platform

# Start the development server
npm run dev

# Check the terminal for the correct URL
```

#### "Mixed content" errors
**Problem:** HTTP/HTTPS mixed content
**Solution:**
- Make sure you're accessing via `http://localhost:3000`
- Check if any external resources are using HTTPS

### 8. Performance Issues

#### Slow loading
**Problem:** Large bundle size or slow network
**Solution:**
```bash
# Build for production to check bundle size
npm run build

# Use production build for better performance
npm run start
```

#### Memory issues
**Problem:** Too many dependencies or memory leaks
**Solution:**
```bash
# Check memory usage
npm run build -- --analyze

# Clear cache
rm -rf .next node_modules
npm install
```

## Quick Diagnostic Commands

### Check if everything is installed
```bash
node --version    # Should show v18+ 
npm --version     # Should show 9+
git --version     # Should show 2.30+
```

### Check environment variables
```bash
npm run check-env
```

### Check if port is available
```bash
# Windows
netstat -an | findstr :3000

# Mac/Linux
lsof -i :3000
```

### Test Supabase connection
```bash
# Add this to a test file and run
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('Supabase client created successfully');
"
```

## Getting Help

### Before asking for help, please:

1. **Check this troubleshooting guide**
2. **Check the browser console** for error messages
3. **Check the terminal** for error messages
4. **Verify your environment variables** are correct
5. **Try the quick diagnostic commands** above

### When asking for help, include:

1. **Your operating system** (Windows/Mac/Linux)
2. **Node.js version** (`node --version`)
3. **Error messages** (copy and paste exactly)
4. **Steps you've already tried**
5. **Screenshots** if relevant

### Where to get help:

1. **GitHub Issues** - Create an issue in this repository
2. **Discord/Slack** - If available
3. **Email** - Contact the development team
4. **Documentation** - Check the main README.md

## Prevention Tips

### To avoid common issues:

1. **Always use the latest LTS version of Node.js**
2. **Keep your dependencies updated**
3. **Use a code editor with good TypeScript support**
4. **Test on different browsers**
5. **Keep your environment variables secure**
6. **Regularly backup your Supabase data**

---

**Still having issues?** Don't worry! The development team is here to help. Create an issue with the information above, and we'll get you up and running quickly.
