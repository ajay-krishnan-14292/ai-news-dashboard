class AINewsDashboard {
    constructor() {
        this.newsData = [];
        this.filteredData = [];
        this.currentTab = 'all';
        this.selectedIndex = -1;
        
        // Load configuration
        this.config = typeof DASHBOARD_CONFIG !== 'undefined' ? DASHBOARD_CONFIG : {
            feeds: [
                {
                    name: 'MIT Technology Review',
                    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
                    type: 'news'
                },
                {
                    name: 'ArXiv AI',
                    url: 'https://arxiv.org/rss/cs.AI',
                    type: 'papers'
                },
                {
                    name: 'Towards Data Science',
                    url: 'https://towardsdatascience.com/feed',
                    type: 'blogs'
                },
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
                    name: 'VentureBeat AI',
                    url: 'https://venturebeat.com/category/ai/feed/',
                    type: 'news'
                },
                {
                    name: 'TechCrunch AI',
                    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
                    type: 'news'
                }
            ],
            cacheExpiry: 2 * 60 * 60 * 1000,
            cacheKey: 'ai_news_cache',
            corsProxy: 'https://api.allorigins.win/get?url='
        };
        
        this.feeds = this.config.feeds;
        this.cacheKey = this.config.cacheKey;
        this.cacheExpiry = this.config.cacheExpiry;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.loadNews();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadNews(true);
        });

        // Retry button
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.loadNews(true);
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // News card clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.news-card')) {
                const card = e.target.closest('.news-card');
                const url = card.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            }
        });
    }

    async loadNews(forceRefresh = false) {
        this.showLoading();
        console.log('Starting to load news...');

        try {
            // Check cache first
            if (!forceRefresh) {
                const cached = this.getCachedData();
                if (cached) {
                    console.log('Using cached data');
                    this.newsData = cached;
                    this.filterAndDisplay();
                    return;
                }
            }

            console.log('Fetching from RSS feeds...');
            // Fetch from RSS feeds
            const allNews = [];
            const promises = this.feeds.map(feed => this.fetchRSSFeed(feed));
            
            const results = await Promise.allSettled(promises);
            
            let successfulFeeds = 0;
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                    allNews.push(...result.value);
                    successfulFeeds++;
                    console.log(`✅ ${this.feeds[index].name}: ${result.value.length} items`);
                } else {
                    console.log(`❌ ${this.feeds[index].name}: Failed or no items`);
                }
            });

            console.log(`Total successful feeds: ${successfulFeeds}/${this.feeds.length}`);

            // Sort by date (newest first)
            allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

            // If no news fetched, show sample data
            if (allNews.length === 0) {
                console.log('No RSS feeds loaded, showing sample data');
                allNews.push(...this.getSampleData());
            }

            console.log(`Total news items: ${allNews.length}`);
            this.newsData = allNews;
            this.cacheData(allNews);
            this.filterAndDisplay();

        } catch (error) {
            console.error('Error loading news:', error);
            this.showError();
        }
    }

    async fetchRSSFeed(feed) {
        const proxies = [this.config.corsProxy, ...(this.config.corsProxyFallbacks || [])];
        
        for (let i = 0; i < proxies.length; i++) {
            try {
                const proxyUrl = proxies[i];
                console.log(`Trying proxy ${i + 1}/${proxies.length} for ${feed.name}`);
                
                // Create a timeout promise
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), 15000); // Increased timeout
                });
                
                const fetchPromise = fetch(proxyUrl + encodeURIComponent(feed.url), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'User-Agent': 'Mozilla/5.0 (compatible; AI-News-Dashboard/1.0)',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                const response = await Promise.race([fetchPromise, timeoutPromise]);
                
                if (!response.ok) {
                    console.warn(`HTTP ${response.status} for ${feed.name} with proxy ${i + 1}`);
                    continue; // Try next proxy
                }
                
                const data = await response.json();
                
                if (!data.contents) {
                    console.warn(`No contents in response for ${feed.name}`);
                    continue; // Try next proxy
                }

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
                
                // Check for parsing errors
                const parseError = xmlDoc.querySelector('parsererror');
                if (parseError) {
                    console.warn(`XML parsing error for ${feed.name}:`, parseError.textContent);
                    continue; // Try next proxy
                }
                
                const items = xmlDoc.querySelectorAll('item');
                const news = [];

                items.forEach(item => {
                    const title = item.querySelector('title')?.textContent?.trim();
                    const link = item.querySelector('link')?.textContent?.trim();
                    const description = item.querySelector('description')?.textContent?.trim();
                    const pubDate = item.querySelector('pubDate')?.textContent?.trim();

                    if (title && link) {
                        news.push({
                            title: this.cleanText(title),
                            url: link,
                            description: this.cleanText(description || ''),
                            source: feed.name,
                            type: feed.type,
                            date: pubDate ? new Date(pubDate) : new Date()
                        });
                    }
                });

                console.log(`✅ Successfully fetched ${news.length} items from ${feed.name}`);
                return news;

            } catch (error) {
                console.error(`❌ Error fetching ${feed.name} with proxy ${i + 1}:`, error.message);
                if (i === proxies.length - 1) {
                    // Last proxy failed, return empty array
                    return [];
                }
                // Continue to next proxy
            }
        }
        
        return [];
    }

    cleanText(text) {
        return text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&[a-zA-Z]+;/g, '') // Remove HTML entities
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    filterAndDisplay() {
        this.filteredData = this.currentTab === 'all' 
            ? this.newsData 
            : this.newsData.filter(item => item.type === this.currentTab);

        this.displayNews();
        this.updateLastUpdated();
    }

    displayNews() {
        const container = document.getElementById('news-grid');
        const newsContainer = document.getElementById('news-container');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');

        // Hide loading and error states
        loading.classList.add('hidden');
        error.classList.add('hidden');

        if (this.filteredData.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p>No ${this.currentTab === 'all' ? '' : this.currentTab} content available.</p>
                </div>
            `;
        } else {
            container.innerHTML = this.filteredData.map((item, index) => `
                <div class="news-item" data-url="${item.url}" data-index="${index}" tabindex="0">
                    <h3 class="news-title">${item.title}</h3>
                    ${item.description ? `<p class="news-description">${item.description}</p>` : ''}
                    <div class="news-meta">
                        <span class="news-source">${item.source}</span>
                        <span class="news-date">${this.formatDate(item.date)}</span>
                    </div>
                </div>
            `).join('');
        }

        newsContainer.classList.remove('hidden');
        this.selectedIndex = -1;
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        this.filterAndDisplay();
    }

    handleKeyboard(e) {
        const cards = document.querySelectorAll('.news-card');
        
        switch(e.key) {
            case 'j':
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, cards.length - 1);
                this.updateSelection();
                break;
                
            case 'k':
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.updateSelection();
                break;
                
            case 'Enter':
                if (this.selectedIndex >= 0 && cards[this.selectedIndex]) {
                    const url = cards[this.selectedIndex].dataset.url;
                    if (url) {
                        window.open(url, '_blank');
                    }
                }
                break;
                
            case 'Escape':
                this.selectedIndex = -1;
                this.updateSelection();
                break;
        }
    }

    updateSelection() {
        document.querySelectorAll('.news-card').forEach((card, index) => {
            card.classList.toggle('selected', index === this.selectedIndex);
            if (index === this.selectedIndex) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
        
        if (currentTheme === 'dark') {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('news-container').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
    }

    showError() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('news-container').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
    }

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('last-updated').textContent = now.toLocaleTimeString();
    }

    cacheData(data) {
        const cache = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    }

    getCachedData() {
        const cached = localStorage.getItem(this.cacheKey);
        if (!cached) return null;

        try {
            const cache = JSON.parse(cached);
            const isExpired = Date.now() - cache.timestamp > this.cacheExpiry;
            
            return isExpired ? null : cache.data;
        } catch {
            return null;
        }
    }

    getSampleData() {
        return [
            {
                title: "OpenAI Releases GPT-4 Turbo with Improved Performance",
                url: "https://openai.com/blog/gpt-4-turbo",
                description: "OpenAI has announced the release of GPT-4 Turbo, featuring improved performance and reduced costs.",
                source: "OpenAI Blog",
                type: "blogs",
                date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                title: "Google Introduces Gemini Pro for Advanced AI Tasks",
                url: "https://ai.googleblog.com/2023/12/gemini-pro.html",
                description: "Google's latest AI model Gemini Pro offers enhanced capabilities for complex reasoning tasks.",
                source: "Google AI Blog",
                type: "blogs",
                date: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
            },
            {
                title: "MIT Researchers Develop New Approach to AI Safety",
                url: "https://www.technologyreview.com/2023/12/ai-safety-research",
                description: "A team at MIT has developed a novel framework for ensuring AI systems behave safely and predictably.",
                source: "MIT Technology Review",
                type: "news",
                date: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
            },
            {
                title: "DeepMind's AlphaFold 3 Shows Breakthrough in Protein Structure Prediction",
                url: "https://deepmind.com/blog/alphafold-3",
                description: "The latest version of AlphaFold demonstrates unprecedented accuracy in predicting protein structures.",
                source: "DeepMind Blog",
                type: "blogs",
                date: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
            },
            {
                title: "New Research: Attention Mechanisms in Large Language Models",
                url: "https://arxiv.org/abs/2312.12345",
                description: "A comprehensive study on attention mechanisms and their role in transformer-based language models.",
                source: "ArXiv AI",
                type: "papers",
                date: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
            },
            {
                title: "VentureBeat: AI Startups Raise Record Funding in Q4 2023",
                url: "https://venturebeat.com/ai-funding-q4-2023",
                description: "AI startups have raised over $15 billion in the fourth quarter, marking a new record.",
                source: "VentureBeat AI",
                type: "news",
                date: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            }
        ];
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AINewsDashboard();
}); 