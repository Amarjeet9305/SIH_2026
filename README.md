# 🌊 INCOIS Ocean Hazard Reporting Platform

A professional, multilingual platform for crowdsourced ocean hazard reporting with real-time mapping, AI analysis, and offline capabilities. Built for coastal communities to report and track ocean hazards like tsunamis, flooding, and coastal erosion.

![Platform Preview](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## ✨ Features

- 🔐 **User Authentication** - Secure registration and login
- 📱 **Media Upload** - Upload photos and videos of hazards
- 🗺️ **Real-time Map** - Interactive dashboard with live hazard reports
- 🔥 **Dynamic Hotspots** - AI-powered threat detection and clustering
- 🌍 **Multilingual Support** - 5 regional languages (English, Hindi, Tamil, Telugu, Bengali)
- 📡 **Offline Mode** - Works in remote coastal areas, syncs when connected
- 🤖 **AI Analysis** - Advanced NLP for hazard detection and severity assessment
- 📊 **Social Media Integration** - Real-time social media monitoring
- 🎨 **Professional UI** - Modern, responsive design

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **A Supabase account** - [Sign up here](https://supabase.com) (free)
- **An OpenRouter account** (optional, for AI features) - [Sign up here](https://openrouter.ai)

### Step 1: Clone the Repository

```bash
# Clone the project
git clone https://github.com/your-username/incois-hazard-platform.git

# Navigate to the project directory
cd incois-hazard-platform
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install
```

### Step 3: Set Up Supabase Database

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: "incois-hazard-platform"
   - Set a database password (save this!)
   - Choose a region close to you
   - Click "Create new project"

2. **Wait for the project to be ready** (2-3 minutes)

3. **Get your project credentials:**
   - Go to Settings → API
   - Copy the "Project URL" and "anon public" key

4. **Set up the database tables:**
   - Go to the SQL Editor in your Supabase dashboard
   - Click "New Query"
   - Copy and paste the following SQL code:

```sql
-- Create reports table
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  hazard_type VARCHAR(50) NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  severity_score INTEGER CHECK (severity_score >= 1 AND severity_score <= 10),
  language VARCHAR(10) DEFAULT 'en',
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending',
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_posts table
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  post_content TEXT NOT NULL,
  location_tag VARCHAR(100),
  sentiment VARCHAR(20),
  post_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_analysis_complete BOOLEAN DEFAULT FALSE,
  is_relevant BOOLEAN DEFAULT FALSE
);

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('hazard-media', 'hazard-media', true);

-- Set up security policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own reports
CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public read access to reports
CREATE POLICY "Anyone can read reports" ON reports
  FOR SELECT USING (true);

-- Allow public read access to social posts
CREATE POLICY "Anyone can read social posts" ON social_posts
  FOR SELECT USING (true);
```

5. **Click "Run" to execute the SQL**

### Step 4: Configure Environment Variables

1. **Create a `.env.local` file** in your project root:

```bash
# Create the file
touch .env.local
```

2. **Add your Supabase credentials** to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AI Analysis (Optional - for advanced features)
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

**How to get these values:**
- `NEXT_PUBLIC_SUPABASE_URL`: From your Supabase project settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From your Supabase project settings → API → anon public key
- `OPENROUTER_API_KEY`: (Optional) Get from [OpenRouter](https://openrouter.ai) for AI features

### Step 5: Run the Application

```bash
# Start the development server
npm run dev
```

The application will start at `http://localhost:3000`

### Step 6: Test the Platform

1. **Open your browser** and go to `http://localhost:3000`
2. **Register a new account** using the sign-up form
3. **Test the report form** by:
   - Capturing your location
   - Selecting a hazard type
   - Adding a description
   - Uploading a photo (optional)
4. **View the dashboard** at `http://localhost:3000/dashboard`
5. **Test offline mode** by disconnecting your internet and submitting a report

## 🎯 How to Use the Platform

### For Citizens/Reporters

1. **Register an Account**
   - Click "Sign Up" on the homepage
   - Enter your details and verify your email

2. **Report a Hazard**
   - Click "Report Ocean Hazard"
   - Allow location access when prompted
   - Select the type of hazard
   - Add a description in your preferred language
   - Upload photos/videos if available
   - Submit the report

3. **View Live Dashboard**
   - Go to the Dashboard to see all reports on the map
   - Use filters to view specific hazard types
   - Toggle between map view and heatmap view

### For Administrators

1. **Monitor Reports**
   - View the real-time dashboard
   - Check hotspot areas with high report density
   - Review AI-analyzed severity scores

2. **Manage Data**
   - Access the Supabase dashboard for detailed data
   - Export reports for analysis
   - Monitor social media integration

## 🌍 Multilingual Support

The platform supports 5 languages:

- **English** (en)
- **Hindi** (hi) - हिन्दी
- **Tamil** (ta) - தமிழ்
- **Telugu** (te) - తెలుగు
- **Bengali** (bn) - বাংলা

Users can select their preferred language when submitting reports.

## 📱 Offline Capabilities

The platform works offline in remote coastal areas:

- Reports are saved locally when offline
- Data automatically syncs when connection is restored
- No data loss during network interruptions
- Perfect for remote fishing communities

## 🛠️ Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Supabase connection errors**
- Check your `.env.local` file has correct credentials
- Verify your Supabase project is active
- Ensure the database tables were created successfully

**3. Media upload not working**
- Check if the `hazard-media` bucket exists in Supabase Storage
- Verify storage policies are set correctly

**4. AI features not working**
- Make sure you have a valid OpenRouter API key
- Check if you have credits in your OpenRouter account

**5. Location not capturing**
- Ensure you're using HTTPS (required for geolocation)
- Check browser permissions for location access

### Getting Help

If you encounter issues:

1. **Check the browser console** for error messages
2. **Verify all environment variables** are set correctly
3. **Check the Supabase logs** in your project dashboard
4. **Ensure all dependencies** are installed with `npm install`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add your environment variables
   - Deploy!

### Deploy to Other Platforms

The platform can be deployed to:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

## 📊 Database Schema

### Reports Table
- `id` - Unique identifier
- `latitude/longitude` - GPS coordinates
- `hazard_type` - Type of hazard reported
- `description` - User description
- `image_url/video_url` - Media attachments
- `severity_score` - AI-calculated severity (1-10)
- `language` - Report language
- `user_id` - Reporter's user ID
- `status` - Report status (pending/verified/rejected)

### Social Posts Table
- `id` - Unique identifier
- `username` - Social media username
- `post_content` - Post text content
- `location_tag` - Geographic location
- `sentiment` - AI-analyzed sentiment
- `is_relevant` - Whether post is hazard-relevant

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **INCOIS** (Indian National Centre for Ocean Information Services)
- **Supabase** for the backend infrastructure
- **OpenRouter** for AI analysis capabilities
- **Leaflet** for mapping functionality
- **Radix UI** for accessible components

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for coastal community safety**

*This platform helps protect coastal communities by enabling real-time hazard reporting and early warning systems.*