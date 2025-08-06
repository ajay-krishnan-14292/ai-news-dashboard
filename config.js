// AI News Dashboard Configuration
// Edit this file to customize your RSS feeds and settings

const DASHBOARD_CONFIG = {
    // RSS Feeds Configuration
    feeds: [
        // News Sources
        {
            name: 'MIT Technology Review',
            url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
            type: 'news'
        },
        {
            name: 'VentureBeat AI',
            url: 'https://venturebeat.com/category/ai/feed/',
            type: 'news'
        },
        {
            name: 'TechCrunch AI',
            url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
            type: 'news'
        },
        
        // Blog Sources
        {
            name: 'Google AI Blog',
            url: 'https://ai.googleblog.com/feeds/posts/default',
            type: 'blogs'
        },
        {
            name: 'OpenAI Blog',
            url: 'https://openai.com/blog/rss.xml',
            type: 'blogs'
        },
        {
            name: 'DeepMind Blog',
            url: 'https://deepmind.com/blog/feed/basic/',
            type: 'blogs'
        },
        {
            name: 'Anthropic Blog',
            url: 'https://www.anthropic.com/feed.xml',
            type: 'blogs'
        },
        {
            name: 'Towards Data Science',
            url: 'https://towardsdatascience.com/feed',
            type: 'blogs'
        },
        
        // Research Papers
        {
            name: 'ArXiv AI',
            url: 'https://arxiv.org/rss/cs.AI',
            type: 'papers'
        },
        {
            name: 'ArXiv Machine Learning',
            url: 'https://arxiv.org/rss/cs.LG',
            type: 'papers'
        }
    ],

    // Cache Settings
    cacheExpiry: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    cacheKey: 'ai_news_cache',

    // UI Settings
    defaultTheme: 'auto', // 'light', 'dark', or 'auto'
    itemsPerPage: 50,
    
    // CORS Proxy (primary and fallback options)
    corsProxy: 'https://corsproxy.io/?',
    
    // Alternative CORS proxies (uncomment to use if primary fails):
    corsProxyFallbacks: [
        'https://api.allorigins.win/get?url=',
        'https://cors-anywhere.herokuapp.com/',
        'https://thingproxy.freeboard.io/fetch/'
    ],
    
    // Keyboard shortcuts
    keyboardShortcuts: {
        next: ['j', 'ArrowDown'],
        previous: ['k', 'ArrowUp'],
        open: ['Enter'],
        clear: ['Escape']
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DASHBOARD_CONFIG;
} 