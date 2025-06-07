# MindfulMe - Mental Wellness App

A comprehensive mental wellness application built with Next.js, featuring mood tracking, AI chatbot support, and personalized wellness recommendations.

[link](https://mentalwellness.vercel.app/)
## Features

- 🎭 **Mood Tracking** - Track daily emotions with intuitive emoticons
- 🤖 **AI Chatbot** - Emotional support powered by OpenAI
- 📱 **Local Storage** - Works offline with browser storage
- ☁️ **Firebase Integration** - Optional cloud sync
- 🎵 **Music Therapy** - Curated playlists for different moods
- 🫁 **Breathing Exercises** - Guided breathing techniques
- 💭 **Motivational Quotes** - Daily inspiration
- 📊 **Analytics** - Mood patterns and insights

## Getting Started
![image](https://github.com/user-attachments/assets/0cf8d186-12f2-4cfc-98f5-5e80704ca09a)
![image](https://github.com/user-attachments/assets/ce4007d0-b9ee-439c-998f-a7748916c7f5)


### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/mental-wellness-app.git
cd mental-wellness-app
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Run the development server
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables (Optional)

Create a `.env.local` file for additional features:

\`\`\`env
# OpenAI API Key (for chatbot)
OPENAI_API_KEY=your_openai_api_key

# Firebase Config (for cloud sync)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: Firebase Auth
- **Database**: Firestore + Local Storage
- **AI**: OpenAI GPT-4
- **Icons**: Lucide React

## Project Structure

\`\`\`
mental-wellness-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home/Login page
│   ├── dashboard/         # Main dashboard
│   ├── chatbot/          # AI chat interface
│   ├── journal/          # Mood journal
│   └── api/              # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── login-form.tsx    # Authentication
│   ├── mood-tracker.tsx  # Mood selection
│   └── suggestion-cards.tsx # Recommendations
├── lib/                  # Utilities
│   ├── firebase.ts       # Firebase config
│   ├── storage.ts        # Local storage utils
│   └── utils.ts          # General utilities
└── hooks/                # Custom React hooks
\`\`\`

## Features Overview

### 🎭 Mood Tracking
- 8 different mood emoticons
- Optional notes for each entry
- Timestamp tracking
- Local and cloud storage

### 🤖 AI Chatbot
- Emotional support conversations
- Mental health guidance
- Crisis intervention awareness
- Powered by OpenAI GPT-4

### 📊 Analytics
- Mood frequency charts
- Emotional patterns
- Historical data view
- Export capabilities

### 🎵 Wellness Suggestions
- **Music Therapy**: Spotify playlist recommendations
- **Breathing Exercises**: YouTube guided sessions
- **Motivational Quotes**: Mood-specific inspiration

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms
Compatible with any Next.js hosting platform:
- Netlify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

Please open an issue on GitHub or contact the development team for support.
