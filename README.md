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

## 🛠️ Tech Stack

- ⚡ Next.js 15
- ⚛️ React 19
- 📘 TypeScript
- 🎨 Tailwind CSS with typography plugin
- ✨ Framer Motion for animations
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
│   ├── quiz.tsx          # Main quiz component
│   ├── quiz-overview.tsx # Quiz review component
│   ├── theory.tsx        # Theory section component
│   ├── question-types.tsx # Question type components
│   ├── audio-player.tsx  # Audio feedback component
│   └── markdown.tsx      # Markdown renderer
├── lib/                   # Utility functions and configurations
│   ├── schemas.ts        # Zod schemas
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request. Let's make this project even better together! 💪

## 📄 License

MIT

## 🌟 About

PolishDom is designed to make Polish language learning accessible and engaging. The platform provides interactive lessons with theory sections and quizzes to help learners practice and reinforce their knowledge. Whether you're a beginner or looking to improve your Polish skills, PolishDom offers a structured approach to learning. 📚

---
Made with ❤️ by Vadym

