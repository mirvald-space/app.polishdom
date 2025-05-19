# PolishDom - Polish Language Learning Platform 🎓

Welcome to PolishDom, a platform for learning Polish language through interactive lessons and quizzes. This project combines modern web technologies to create an engaging learning experience. 🚀

## ✨ Features

- 📝 Multiple question types:
  - Multiple choice questions
  - Fill-in-the-blank exercises
  - True/False questions
- 🎯 Interactive quiz system with:
  - Progress tracking
  - Score calculation
  - Streak counter
  - Hint system
- 🔊 Audio feedback for correct/incorrect answers
- 📱 Responsive design with smooth animations
- 🌓 Dark/Light mode support
- 📊 Real-time progress tracking
- 🔄 Quiz review and reset functionality
- 📚 Theory section with:
  - Markdown content support
  - Text-to-speech functionality
  - Interactive navigation
- 🔐 User authentication and progress tracking with Supabase

## 🛠️ Tech Stack

- ⚡ Next.js 15
- ⚛️ React 19
- 📘 TypeScript
- 🎨 Tailwind CSS with typography plugin
- ✨ Framer Motion for animations
- 🗄️ Supabase for database and authentication
- 🤖 AI Integration:
  - OpenAI
  - Anthropic
  - Google AI
- 🎯 Radix UI Components
- 📝 React Markdown with GFM support
- 🔔 Sonner for toast notifications
- ✅ Zod for schema validation

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/mirvald-space/app.polishdom.git
cd app.polishdom
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your API keys:
     ```
     # Supabase
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     
     # AI APIs (optional)
     GOOGLE_API_KEY=your_google_api_key
     ANTHROPIC_API_KEY=your_anthropic_api_key
     OPENAI_API_KEY=your_openai_api_key
     ```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

## 📁 Project Structure

```
app.polishdom/
├── app/                    # Next.js app directory
│   ├── (preview)/         # Preview routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI components
│   ├── shared/           # Shared components
│   └── auth/             # Authentication components
├── lib/                   # Utility functions and configurations
│   ├── schemas/          # Zod schemas
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database utilities
│   ├── supabase-client.ts # Supabase client
│   └── utils.ts          # Helper functions
├── middleware.ts         # Authentication middleware
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 📊 Database Structure

The application uses Supabase for data storage with the following structure:

- **users** - User information
- **courses** - Available courses
- **modules** - Course modules
- **lessons** - Individual lessons within modules
- **quizzes** - Quizzes for lessons
- **quiz_questions** - Questions for quizzes
- **quiz_options** - Answer options for questions
- **course_progress** - User progress in courses
- **module_progress** - User progress in modules
- **lesson_progress** - User progress in lessons

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request. Let's make this project even better together! 💪

## 📄 License

MIT

## 🌟 About

PolishDom is designed to make Polish language learning accessible and engaging. The platform provides interactive lessons with theory sections and quizzes to help learners practice and reinforce their knowledge. Whether you're a beginner or looking to improve your Polish skills, PolishDom offers a structured approach to learning. 📚

---
Made with ❤️ by Vadym

