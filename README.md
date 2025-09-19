# Josh Gray's Blog

A personal blog focused on software engineering principles, best practices, and leadership insights.

## 🚀 About

This blog explores software engineering concepts through practical examples and real-world applications. Topics include:

- Software engineering principles and methodologies
- Code quality and technical debt management
- Engineering leadership and team dynamics
- Industry insights and commentary

**Live Site**: [https://joshwgray.github.io/](https://joshwgray.github.io/)

## 🛠 Technology Stack

- **Static Site Generator**: [Hugo](https://gohugo.io/) (v0.141.0+)
- **Theme**: [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Content**: Markdown

## 📝 Content Creation

### Writing a New Post

1. Create a new markdown file in `content/posts/`:
```bash
hugo new posts/your-post-title.md
```

2. Edit the front matter and content:
```markdown
+++
date = '2025-09-19T19:33:00Z'
draft = false
title = 'Your Post Title'
tags = ['software-engineering', 'leadership']
categories = ['Engineering']
+++

Your content here...
```

3. Preview locally:
```bash
hugo server -D
```

4. Commit and push to deploy automatically via GitHub Actions

### Content Guidelines

- Use clear, descriptive titles
- Include relevant tags and categories
- Add practical examples and code snippets
- Maintain consistent formatting and structure
- Follow the established voice and tone

## 🏗 Local Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) (v0.141.0 or higher)
- [Git](https://git-scm.com/)

### Setup

1. **Clone the repository**:
```bash
git clone https://github.com/joshwgray/joshwgray.github.io.git
cd joshwgray.github.io
```

2. **Initialize theme submodule**:
```bash
git submodule update --init --recursive
```

3. **Start development server**:
```bash
hugo server -D
```

4. **Visit your local site**: http://localhost:1313

### Project Structure

```
├── .github/workflows/    # GitHub Actions CI/CD
├── archetypes/          # Content templates
├── content/             # Blog posts and pages
│   ├── about.md         # About page
│   └── posts/           # Blog posts
├── static/              # Static assets
├── themes/PaperMod/     # Theme submodule
├── hugo.toml           # Hugo configuration
└── README.md           # This file
```

## 🚀 Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

### Manual Deployment

If needed, you can build manually:

```bash
# Build for production
hugo --gc --minify

# The generated site will be in /public/
```

## 📊 Performance

- **Lighthouse Score**: 100/100 (Performance, Accessibility, Best Practices, SEO)
- **Build Time**: ~2-3 seconds
- **Page Load**: <1 second average

## 🔧 Configuration

Key configuration options in `hugo.toml`:

- **Theme settings**: PaperMod configuration
- **Navigation**: Menu structure and links
- **Features**: Reading time, share buttons, code copy buttons
- **SEO**: Meta tags and social sharing

## 📈 Analytics

Analytics and performance monitoring can be configured through:
- Google Analytics (add tracking ID to hugo.toml)
- Plausible Analytics (privacy-focused alternative)
- GitHub Pages built-in analytics

## 🤝 Contributing

This is a personal blog, but feedback and suggestions are welcome:

1. **Issues**: Report bugs or suggest improvements
2. **Discussions**: Share ideas or ask questions
3. **Pull Requests**: Fix typos or suggest content improvements

## 📄 License

- **Content**: All blog posts and original content © Josh Gray
- **Code**: Hugo configuration and customizations are MIT licensed
- **Theme**: PaperMod theme is MIT licensed

## 📬 Contact

- **Website**: [joshwgray.github.io](https://joshwgray.github.io/)
- **GitHub**: [@joshwgray](https://github.com/joshwgray)

---

*Built with ❤️ using Hugo and deployed with GitHub Pages*