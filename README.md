# Portfolio Website

A modern, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS. Features dark mode, smooth animations, and a beautiful UI design.

## 🚀 Features

- **Modern Design**: Clean and professional design with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Fast Performance**: Built with Next.js for optimal performance
- **SEO Optimized**: Meta tags and structured data for better SEO
- **Contact Form**: Functional contact form for easy communication
- **Project Showcase**: Beautiful project cards with links to live demos and code
- **Skills Section**: Interactive skills display with progress bars
- **Smooth Animations**: Framer Motion animations for enhanced user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Customization

### Personal Information
Update the following files with your personal information:

1. **`app/layout.tsx`** - Update metadata (title, description)
2. **`components/Hero.tsx`** - Update name, title, and description
3. **`components/About.tsx`** - Update personal information and bio
4. **`components/Contact.tsx`** - Update contact details and social links
5. **`components/Projects.tsx`** - Add your own projects
6. **`components/Skills.tsx`** - Update skills and proficiency levels

### Styling
- Colors can be customized in `tailwind.config.js`
- Global styles are in `app/globals.css`
- Component-specific styles use Tailwind CSS classes

### Projects
Add your projects in the `components/Projects.tsx` file:

```typescript
const projects = [
  {
    title: 'Your Project Name',
    description: 'Project description...',
    technologies: ['React', 'Node.js', 'MongoDB'],
    github: 'https://github.com/yourusername/project',
    live: 'https://your-project.vercel.app',
    featured: true
  }
]
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
2. **Connect your repository to Vercel**
3. **Deploy automatically**

Vercel will automatically detect Next.js and deploy your site with optimal settings.

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── Header.tsx           # Navigation header
│   ├── Hero.tsx             # Hero section
│   ├── About.tsx            # About section
│   ├── Skills.tsx           # Skills section
│   ├── Projects.tsx         # Projects showcase
│   ├── Contact.tsx          # Contact form
│   ├── Footer.tsx           # Footer
│   └── ThemeProvider.tsx    # Dark/light mode provider
├── public/                  # Static assets
├── package.json
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── README.md
```

## 🎯 Features in Detail

### Hero Section
- Animated introduction with your name and title
- Call-to-action buttons
- Social media links
- Smooth scroll indicator

### About Section
- Personal information cards
- Professional bio
- Key personality traits
- Responsive layout

### Skills Section
- Categorized skills (Frontend, Backend, Tools)
- Progress bars with animations
- Additional skills tags
- Interactive hover effects

### Projects Section
- Project cards with images
- Technology tags
- Links to live demos and code
- Featured project highlighting

### Contact Section
- Contact information cards
- Functional contact form
- Social media links
- Professional presentation

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for any environment variables:

```env
NEXT_PUBLIC_SITE_URL=https://your-portfolio.vercel.app
```

### SEO Optimization
Update the metadata in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Your Name - Portfolio',
  description: 'Your professional portfolio description',
  keywords: ['developer', 'portfolio', 'web development'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Your Name - Portfolio',
    description: 'Your professional portfolio description',
    url: 'https://your-portfolio.vercel.app',
    siteName: 'Your Name Portfolio',
  },
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Lucide React](https://lucide.dev/) for beautiful icons

---

Made with ❤️ by [Your Name] 