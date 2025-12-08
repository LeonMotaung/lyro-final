<div align="center">
  <img src="https://raw.githubusercontent.com/LeonMotaung/lyro-final/refs/heads/main/public/images/lyro.png" alt="Lyro Maths Logo" width="200"/>
  
  # Lyro Maths
  
  ### Master Grade 12 Maths. Achieve Your Potential.
  
  [![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-5.1.0-lightgrey.svg)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
  
  [Live Demo](#) • [Features](#features) • [Installation](#installation) • [Tech Stack](#tech-stack)
</div>

---

## 📖 About

**Lyro Maths** is a modern, Progressive Web Application (PWA) designed to help Grade 12 students master mathematics. Built with a focus on user experience and accessibility, Lyro provides interactive lessons, step-by-step solutions, practice quizzes, and progress tracking—all aligned with the Grade 12 curriculum.

Whether you're preparing for your final exams, NBT tests, or simply want to improve your mathematical skills, Lyro offers a comprehensive learning platform with a beautiful, intuitive interface.

---

## ✨ Features

### 🎯 Core Features
- **📚 Interactive Lessons** - Engaging content covering Paper 1 (Algebra) and Paper 2 (Trigonometry & Geometry)
- **🔍 Step-by-Step Solutions** - Detailed explanations for complex mathematical problems
- **📝 Practice Quizzes** - Test your knowledge with curriculum-aligned questions
- **📊 Progress Tracking** - Monitor your learning journey and identify areas for improvement
- **📄 Formula Sheet** - Quick access to essential mathematical formulas
- **📑 Past Papers** - Practice with previous examination papers
- **🧮 NBT Prep** - Specialized preparation for National Benchmark Tests

### 🎨 Design & UX
- **Modern Glassmorphism UI** - Premium, state-of-the-art design with smooth animations
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices
- **PWA Support** - Install on your device for offline access and native app-like experience
- **Intuitive Navigation** - Easy-to-use interface with bottom navigation for mobile users

### 🔐 User Management
- **Authentication System** - Secure login and signup functionality
- **Personalized Dashboard** - Track your progress and access personalized content
- **Onboarding Flow** - Smooth introduction for new users

---

## 🚀 Tech Stack

### Backend
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment
- **[Express.js](https://expressjs.com/)** v5.1.0 - Fast, minimalist web framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database for data persistence
- **[Mongoose](https://mongoosejs.com/)** v8.20.0 - Elegant MongoDB object modeling

### Frontend
- **[EJS](https://ejs.co/)** v3.1.10 - Embedded JavaScript templating
- **HTML5 & CSS3** - Modern web standards with custom styling
- **Vanilla JavaScript** - Client-side interactivity
- **[Font Awesome](https://fontawesome.com/)** v6.5.1 - Icon library

### Development Tools
- **[Nodemon](https://nodemon.io/)** v3.1.11 - Auto-restart during development
- **[dotenv](https://www.npmjs.com/package/dotenv)** v17.2.3 - Environment variable management

### PWA Features
- **Service Worker** - Offline functionality and caching
- **Web App Manifest** - Installable on mobile and desktop
- **Responsive Meta Tags** - Optimized for all devices

---

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** (or local MongoDB installation)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/LeonMotaung/lyro-final.git
   cd lyro-final
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📂 Project Structure

```
lyro-final/
├── public/                 # Static assets
│   ├── css/               # Stylesheets
│   │   ├── styles.css     # Global styles
│   │   ├── index.css      # Landing page styles
│   │   ├── learn.css      # Learning dashboard styles
│   │   ├── login.css      # Authentication styles
│   │   └── ...
│   ├── js/                # Client-side JavaScript
│   │   ├── script.js      # Main application logic
│   │   ├── sw.js          # Service worker
│   │   └── ...
│   ├── images/            # Images and icons
│   └── manifest.json      # PWA manifest
├── views/                 # EJS templates
│   ├── index.ejs          # Landing page
│   ├── learn.ejs          # Main learning dashboard
│   ├── login.ejs          # Login page
│   ├── signup.ejs         # Registration page
│   ├── onboarding.ejs     # User onboarding
│   ├── formulas.ejs       # Formula sheet
│   └── settings.ejs       # Settings page
├── index.js               # Express server & routes
├── package.json           # Project dependencies
├── .env                   # Environment variables (not in repo)
└── README.md              # Project documentation
```

---

## 🎯 Usage

### For Students
1. **Sign Up** - Create your account to start learning
2. **Complete Onboarding** - Get familiar with the platform
3. **Choose Your Topic** - Select Paper 1 or Paper 2
4. **Learn & Practice** - Work through lessons and quizzes
5. **Track Progress** - Monitor your improvement over time

### For Developers
- **Development Mode**: `npm run dev` (auto-restart on file changes)
- **Production Mode**: `npm start`
- **Customize**: Modify EJS templates and CSS files to suit your needs

---

## 🌐 PWA Installation

Lyro can be installed as a Progressive Web App on your device:

### On Mobile (Android/iOS)
1. Open Lyro in your mobile browser
2. Tap the browser menu (⋮ or share icon)
3. Select "Add to Home Screen" or "Install App"
4. Enjoy native app-like experience!

### On Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install Lyro Maths"
3. Access from your desktop or start menu

---

## 🎨 Design Philosophy

Lyro embraces modern web design principles:
- **Glassmorphism** - Frosted glass effects for a premium feel
- **Vibrant Color Palette** - Teal and orange accents for visual appeal
- **Micro-animations** - Smooth transitions and hover effects
- **Typography** - Clean, readable fonts optimized for learning
- **Accessibility** - High contrast and semantic HTML

---

## 🔒 Security

- Environment variables for sensitive data
- Secure MongoDB connection with authentication
- Input validation and sanitization
- HTTPS recommended for production deployment

---

## 🚧 Roadmap

- [ ] Add more practice questions and quizzes
- [ ] Implement real-time progress analytics
- [ ] Add video tutorials for complex topics
- [ ] Create a community forum for peer learning
- [ ] Integrate AI-powered personalized recommendations
- [ ] Add support for more grade levels
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Lyro:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Developer

**Leon Motaung**  
Full-Stack Developer | Dewet Technologies

- 🌐 Portfolio: [leonmotaung.com](https://leonmotaung.com)
- 💼 LinkedIn: [linkedin.com/in/motaungleon](https://linkedin.com/in/motaungleon)
- 📧 Email: [motaungleon@gmail.com](mailto:motaungleon@gmail.com)
- 🐙 GitHub: [@LeonMotaung](https://github.com/LeonMotaung)

---

## 🙏 Acknowledgments

- Grade 12 curriculum aligned with South African education standards
- Font Awesome for beautiful icons
- MongoDB Atlas for reliable database hosting
- The open-source community for amazing tools and libraries

---

<div align="center">
  
  ### ⭐ Star this repo if you find it helpful!
  
  **Made with ❤️ by Leon Motaung @ Dewet Technologies 2025**
  
  [Report Bug](https://github.com/LeonMotaung/lyro-final/issues) • [Request Feature](https://github.com/LeonMotaung/lyro-final/issues)
  
</div>
