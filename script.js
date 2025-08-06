class AINewsDashboard {
    constructor() {
        this.newsData = [];
        this.filteredData = [];
        this.currentTab = 'all';
        this.selectedIndex = -1;
        this.page = 1;
        this.isLoading = false;
        this.hasMoreNews = true;
        
        // Load configuration with verified working RSS sources
        this.config = typeof DASHBOARD_CONFIG !== 'undefined' ? DASHBOARD_CONFIG : {
            feeds: [
                // Verified Working AI News Sources
                {
                    name: 'ArXiv AI',
                    url: 'https://arxiv.org/rss/cs.AI',
                    type: 'papers'
                },
                {
                    name: 'ArXiv Machine Learning',
                    url: 'https://arxiv.org/rss/cs.LG',
                    type: 'papers'
                },
                {
                    name: 'ArXiv Computer Vision',
                    url: 'https://arxiv.org/rss/cs.CV',
                    type: 'papers'
                },
                {
                    name: 'ArXiv Neural and Evolutionary Computing',
                    url: 'https://arxiv.org/rss/cs.NE',
                    type: 'papers'
                },
                {
                    name: 'ArXiv Computation and Language',
                    url: 'https://arxiv.org/rss/cs.CL',
                    type: 'papers'
                },
                // Alternative News Sources (more likely to work)
                {
                    name: 'Hacker News',
                    url: 'https://news.ycombinator.com/rss',
                    type: 'news'
                },
                {
                    name: 'Reddit r/MachineLearning',
                    url: 'https://www.reddit.com/r/MachineLearning/.rss',
                    type: 'news'
                },
                {
                    name: 'Reddit r/artificial',
                    url: 'https://www.reddit.com/r/artificial/.rss',
                    type: 'news'
                },
                {
                    name: 'Reddit r/AINews',
                    url: 'https://www.reddit.com/r/AINews/.rss',
                    type: 'news'
                },
                // Working Blog Sources
                {
                    name: 'Google AI Blog',
                    url: 'https://ai.googleblog.com/feeds/posts/default?alt=rss',
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
                    name: 'Microsoft AI Blog',
                    url: 'https://blogs.microsoft.com/ai/feed/',
                    type: 'blogs'
                },
                {
                    name: 'Meta AI Blog',
                    url: 'https://ai.meta.com/blog/rss/',
                    type: 'blogs'
                },
                {
                    name: 'NVIDIA AI Blog',
                    url: 'https://blogs.nvidia.com/feed/',
                    type: 'blogs'
                },
                {
                    name: 'Towards Data Science',
                    url: 'https://towardsdatascience.com/feed',
                    type: 'blogs'
                },
                {
                    name: 'Distill',
                    url: 'https://distill.pub/rss.xml',
                    type: 'blogs'
                },
                // Alternative Tech News Sources
                {
                    name: 'TechCrunch',
                    url: 'https://techcrunch.com/feed/',
                    type: 'news'
                },
                {
                    name: 'VentureBeat',
                    url: 'https://venturebeat.com/feed/',
                    type: 'news'
                },
                {
                    name: 'Wired',
                    url: 'https://www.wired.com/feed/rss',
                    type: 'news'
                },
                {
                    name: 'The Verge',
                    url: 'https://www.theverge.com/rss/index.xml',
                    type: 'news'
                },
                {
                    name: 'Ars Technica',
                    url: 'https://feeds.arstechnica.com/arstechnica/index',
                    type: 'news'
                },
                // YouTube RSS feeds (usually work well)
                {
                    name: 'Two Minute Papers',
                    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg',
                    type: 'videos'
                },
                {
                    name: 'Computerphile',
                    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC9-y-6csu5WGm29I7JiwpnA',
                    type: 'videos'
                },
                {
                    name: '3Blue1Brown',
                    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCYO_jab_esuFRV4b17AJtAw',
                    type: 'videos'
                },
                {
                    name: 'Lex Fridman',
                    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSHZKyawb77ixDdsGog4iWA',
                    type: 'videos'
                },
                {
                    name: 'Sentdex',
                    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCfzlCWGWYyIQ0aLC5wEcGxw',
                    type: 'videos'
                }
            ],
            corsProxy: 'https://api.allorigins.win/get?url=',
            corsProxyFallbacks: [
                'https://cors-anywhere.herokuapp.com/',
                'https://thingproxy.freeboard.io/fetch/',
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://corsproxy.io/?',
                'https://api.codetabs.com/v1/proxy?quest='
            ]
        };
        
        this.feeds = this.config.feeds;
        this.corsProxy = this.config.corsProxy;
        this.corsProxyFallbacks = this.config.corsProxyFallbacks;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.loadNews();
    }

    setupEventListeners() {
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
            if (e.target.closest('.news-item')) {
                const card = e.target.closest('.news-item');
                const url = card.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            }
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Infinite scroll
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    async loadNews(forceRefresh = false) {
        this.showLoading();
        console.log('Starting to load news...');

        try {
            // Always fetch fresh data - no caching
            console.log('Fetching from RSS feeds...');
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
            this.filterAndDisplay();

        } catch (error) {
            console.error('Error loading news:', error);
            this.showError();
        }
    }

    async fetchRSSFeed(feed) {
        const proxies = [this.corsProxy, ...this.corsProxyFallbacks];
        
        for (let i = 0; i < proxies.length; i++) {
            try {
                const proxy = proxies[i];
                console.log(`Trying proxy ${i + 1}/${proxies.length} for ${feed.name}`);
                
                // Create a timeout promise
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), 10000);
                });
                
                const fetchPromise = fetch(proxy + encodeURIComponent(feed.url), {
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
                        const date = this.parseDate(pubDate);
                        news.push({
                            title: this.cleanText(title),
                            url: link,
                            description: this.cleanText(description || ''),
                            source: feed.name,
                            type: feed.type,
                            date: date,
                            image: this.extractImageFromDescription(description),
                            author: this.extractAuthorFromDescription(description) || 'Unknown Author'
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

    parseDate(dateString) {
        if (!dateString) return new Date();
        
        try {
            // Try parsing various date formats
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date;
            }
            
            // Try parsing RFC 822 format
            const rfc822Match = dateString.match(/(\w{3}), (\d{2}) (\w{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2})/);
            if (rfc822Match) {
                const months = {
                    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                };
                const [, , day, month, year, hour, minute, second] = rfc822Match;
                return new Date(parseInt(year), months[month], parseInt(day), 
                              parseInt(hour), parseInt(minute), parseInt(second));
            }
            
            return new Date();
        } catch (error) {
            console.warn('Error parsing date:', dateString, error);
            return new Date();
        }
    }

    extractImageFromDescription(description) {
        if (!description) return null;
        const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
        return imgMatch ? imgMatch[1] : null;
    }

    extractAuthorFromDescription(description) {
        if (!description) return null;
        const authorMatch = description.match(/by\s+([^<>\n]+)/i);
        return authorMatch ? authorMatch[1].trim() : null;
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
                    <div class="news-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.title}" onerror="this.style.display='none'">` : 
                          `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 0.9rem;">No Image</div>`}
                    </div>
                    <div class="news-content">
                        <h3 class="news-title">${item.title}</h3>
                        <div class="news-meta">
                            <span class="news-author">By ${item.author}</span>
                            <span class="news-date">${this.formatDate(item.date)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        newsContainer.classList.remove('hidden');
        this.selectedIndex = -1;
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.filterAndDisplay();
            return;
        }

        const searchTerm = query.toLowerCase();
        this.filteredData = this.newsData.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.author.toLowerCase().includes(searchTerm)
        );

        this.displayNews();
    }

    formatDate(date) {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return 'Unknown date';
        }

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

    handleScroll() {
        if (this.isLoading || !this.hasMoreNews) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 100) {
            this.loadMoreNews();
        }
    }

    async loadMoreNews() {
        if (this.isLoading) return;

        this.isLoading = true;
        console.log('Loading more news...');

        try {
            // Load additional feeds or paginate existing data
            const additionalNews = await this.fetchAdditionalNews();
            
            if (additionalNews.length > 0) {
                this.newsData.push(...additionalNews);
                this.newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
                this.filterAndDisplay();
                console.log(`Loaded ${additionalNews.length} additional news items`);
            } else {
                this.hasMoreNews = false;
                console.log('No more news available');
            }
        } catch (error) {
            console.error('Error loading more news:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async fetchAdditionalNews() {
        // For now, return empty array - can be extended with more sources
        return [];
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
        const cards = document.querySelectorAll('.news-item');
        
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
        document.querySelectorAll('.news-item').forEach((card, index) => {
            card.classList.toggle('selected', index === this.selectedIndex);
            if (index === this.selectedIndex) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
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

    getSampleData() {
        return [
            {
                title: "Local Elections See Record Turnout",
                url: "https://example.com/local-elections",
                description: "Local elections across the country have seen unprecedented voter participation.",
                source: "Local News",
                type: "news",
                date: new Date(Date.now() - 2 * 60 * 60 * 1000),
                image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                author: "Amelia Harper"
            },
            {
                title: "New Study Reveals Health Benefits of Meditation",
                url: "https://example.com/meditation-study",
                description: "A comprehensive study shows significant health improvements from regular meditation practice.",
                source: "Health Research",
                type: "blogs",
                date: new Date(Date.now() - 4 * 60 * 60 * 1000),
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                author: "Ethan Carter"
            },
            {
                title: "Tech Giant Unveils Latest Smartphone",
                url: "https://example.com/new-smartphone",
                description: "The latest smartphone features cutting-edge technology and improved performance.",
                source: "Tech News",
                type: "news",
                date: new Date(Date.now() - 6 * 60 * 60 * 1000),
                image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                author: "Olivia Bennett"
            },
            {
                title: "Global Leaders Meet to Discuss Climate Change",
                url: "https://example.com/climate-summit",
                description: "World leaders gather for crucial climate change discussions and policy agreements.",
                source: "International News",
                type: "news",
                date: new Date(Date.now() - 8 * 60 * 60 * 1000),
                image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                author: "Noah Thompson"
            }
        ];
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AINewsDashboard();
}); 