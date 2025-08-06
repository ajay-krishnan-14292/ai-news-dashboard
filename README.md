# 🤖 AI News Dashboard

A lightweight, self-hosted website that aggregates and displays the latest AI-related news, blogs, articles, and videos from popular sources. Built with vanilla HTML, CSS, and JavaScript for maximum simplicity and portability.

## ✨ Features

- **RSS Feed Aggregation**: Pulls content from popular AI news sources
- **Content Filtering**: Filter by News, Blogs, Videos, and Papers
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Keyboard Navigation**: Use J/K to navigate, Enter to open links
- **Responsive Design**: Works on desktop and mobile devices
- **Local Caching**: 2-hour cache to avoid rate limits
- **No Backend Required**: Pure static site with client-side processing

## 🚀 Quick Start

1. **Clone or download** the files to your local machine
2. **Open `index.html`** in your web browser
3. **That's it!** The dashboard will automatically load AI news from RSS feeds

## 📁 File Structure

```
ai-news-dashboard/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and themes
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## 🔧 Customization

### Adding/Removing RSS Feeds

Edit the `feeds` array in `script.js`:

```javascript
this.feeds = [
    {
        name: 'Your Source Name',
        url: 'https://your-source.com/rss-feed-url',
        type: 'news' // or 'blogs', 'videos', 'papers'
    },
    // Add more feeds here...
];
```

### Supported Feed Types

- `news`: General AI news articles
- `blogs`: Technical blog posts and tutorials
- `videos`: Video content (YouTube channels, etc.)
- `papers`: Academic papers and research

### Popular AI RSS Feeds

Here are some recommended feeds you can add:

**News Sources:**
- MIT Technology Review AI: `https://www.technologyreview.com/topic/artificial-intelligence/feed`
- VentureBeat AI: `https://venturebeat.com/category/ai/feed/`
- TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`

**Blog Sources:**
- Google AI Blog: `https://ai.googleblog.com/feeds/posts/default`
- OpenAI Blog: `https://openai.com/blog/rss.xml`
- DeepMind Blog: `https://deepmind.com/blog/feed/basic/`
- Anthropic Blog: `https://www.anthropic.com/feed.xml`

**Research Papers:**
- ArXiv AI: `https://arxiv.org/rss/cs.AI`
- ArXiv Machine Learning: `https://arxiv.org/rss/cs.LG`

### Customizing the Theme

Edit the CSS variables in `styles.css`:

```css
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --accent-color: #007bff;
    /* Add more custom colors... */
}
```

## 🎮 Keyboard Shortcuts

- **J** or **↓**: Navigate down
- **K** or **↑**: Navigate up
- **Enter**: Open selected article
- **Escape**: Clear selection

## 🌐 Deployment

### Local Development

Simply open `index.html` in your browser. No server required!

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts** to connect your GitHub account and deploy

### Netlify Deployment

1. **Drag and drop** the folder to [Netlify Drop](https://app.netlify.com/drop)
2. **Or connect** your GitHub repository to Netlify

### GitHub Pages

1. **Push** your code to a GitHub repository
2. **Go to Settings** → Pages
3. **Select source** as "Deploy from a branch"
4. **Choose main branch** and save

## 🔍 Troubleshooting

### CORS Issues

The dashboard uses a CORS proxy (`api.allorigins.win`) to fetch RSS feeds. If you encounter issues:

1. **Check browser console** for error messages
2. **Try refreshing** the page
3. **Check your internet connection**

### Feed Not Loading

Some RSS feeds may be temporarily unavailable. The dashboard will:
- Show cached content if available
- Display an error message if all feeds fail
- Allow manual refresh via the refresh button

### Performance

- **First load**: May take 10-15 seconds to fetch all feeds
- **Subsequent loads**: Uses cached data (2-hour expiry)
- **Mobile**: Optimized for mobile devices with responsive design

## 🛠️ Technical Details

### Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Data Source**: RSS feeds via CORS proxy
- **Caching**: LocalStorage with 2-hour expiry
- **Styling**: CSS Grid and Flexbox for responsive layout

### Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

### Dependencies

- **None!** Pure vanilla JavaScript
- **CORS Proxy**: `api.allorigins.win` for RSS feed access

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to:
- Add new RSS feeds
- Improve the UI/UX
- Fix bugs
- Add new features

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Try refreshing the page
3. Clear browser cache and try again
4. Open an issue on GitHub if the problem persists

---

**Happy AI News Reading! 🤖📰** 