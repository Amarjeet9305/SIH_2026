# 🚀 Quick Setup Guide for Beginners

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js installed** (Download from [nodejs.org](https://nodejs.org/))
- [ ] **Git installed** (Download from [git-scm.com](https://git-scm.com/))
- [ ] **A code editor** (VS Code recommended - [code.visualstudio.com](https://code.visualstudio.com/))

## Step-by-Step Setup

### 1. Download and Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (recommended)
3. Run the installer and follow the instructions
4. Open Command Prompt/Terminal and type: `node --version`
5. You should see a version number (like v18.17.0)

### 2. Download and Install Git
1. Go to [git-scm.com](https://git-scm.com/)
2. Download Git for Windows/Mac/Linux
3. Run the installer with default settings
4. Open Command Prompt/Terminal and type: `git --version`
5. You should see a version number

### 3. Get the Project Code
```bash
# Copy this command and paste it in your terminal
git clone https://github.com/your-username/incois-hazard-platform.git

# Move into the project folder
cd incois-hazard-platform
```

### 4. Install Project Dependencies
```bash
# This will install all required packages
npm install
```

### 5. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google/Email
4. Click "New Project"
5. Choose your organization
6. Enter project name: "incois-hazard-platform"
7. Set a strong password (save it!)
8. Choose a region close to you
9. Click "Create new project"
10. Wait 2-3 minutes for setup

### 6. Set Up Database
1. In your Supabase dashboard, click "SQL Editor"
2. Click "New Query"
3. Copy the entire SQL code from the main README.md
4. Paste it in the SQL editor
5. Click "Run" button
6. You should see "Success" message

### 7. Get Your Credentials
1. In Supabase, go to "Settings" → "API"
2. Copy the "Project URL" (looks like: https://abc123.supabase.co)
3. Copy the "anon public" key (long string starting with eyJ...)

### 8. Create Environment File
1. In your project folder, create a new file called `.env.local`
2. Add these lines (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 9. Run the Application
```bash
npm run dev
```

### 10. Open in Browser
1. Open your web browser
2. Go to `http://localhost:3000`
3. You should see the INCOIS platform homepage!

## ✅ Test Your Setup

1. **Register an account** on the platform
2. **Try submitting a hazard report**
3. **Check the dashboard** at `http://localhost:3000/dashboard`
4. **Test offline mode** by disconnecting internet and submitting a report

## 🆘 If Something Goes Wrong

### "Command not found" errors
- Make sure Node.js and Git are installed correctly
- Restart your terminal/command prompt
- Try running commands as administrator (Windows)

### "Cannot find module" errors
```bash
# Delete and reinstall everything
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection errors
- Double-check your `.env.local` file
- Make sure you copied the correct URL and key
- Verify your Supabase project is active

### Port already in use
```bash
# Kill any process using port 3000
npx kill-port 3000
# Then try again
npm run dev
```

## 🎉 Success!

If you can see the platform running at `http://localhost:3000`, congratulations! You've successfully set up the INCOIS Hazard Reporting Platform.

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Explore the platform's capabilities
- Try all the different features
- Share with others who might benefit from it

---

**Need help?** Create an issue in the GitHub repository or contact the development team.
