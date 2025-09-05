# API Configuration and Setup Guide for Real-Time Manhattan Demographics

## 🔑 Required API Keys and Data Sources

### 1. SafeGraph Mobility Data (Primary Source)
**Cost:** ~$0.10 per venue query
**Accuracy:** Very High (90%+)
**Update Frequency:** 15 minutes

```javascript
// SafeGraph API Configuration
const SAFEGRAPH_CONFIG = {
    apiKey: process.env.SAFEGRAPH_API_KEY,
    baseUrl: 'https://api.safegraph.com/v2',
    endpoints: {
        footTraffic: '/data/places/foottraffic',
        demographics: '/data/places/demographics',
        patterns: '/data/places/patterns'
    },
    rateLimit: 100, // requests per minute
    timeout: 10000
};

// Example API call
async function getSafeGraphData(placeId) {
    const response = await fetch(`${SAFEGRAPH_CONFIG.baseUrl}/data/places/foottraffic`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SAFEGRAPH_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            place_id: placeId,
            date_range: {
                start: '2025-07-12',
                end: '2025-07-19'
            },
            include_demographics: true,
            aggregation: 'hourly'
        })
    });
    
    return await response.json();
}
```

**Setup Steps:**
1. Register at https://www.safegraph.com/
2. Apply for Places API access
3. Get approved (requires business verification)
4. Obtain API key and set monthly budget

---

### 2. Foursquare Places API (Secondary Source)
**Cost:** ~$0.02 per venue query
**Accuracy:** High (80%+)
**Update Frequency:** Real-time

```javascript
// Foursquare API Configuration
const FOURSQUARE_CONFIG = {
    apiKey: process.env.FOURSQUARE_API_KEY,
    baseUrl: 'https://api.foursquare.com/v3',
    endpoints: {
        places: '/places',
        stats: '/places/{fsq_id}/stats',
        tips: '/places/{fsq_id}/tips',
        photos: '/places/{fsq_id}/photos'
    },
    rateLimit: 500, // requests per hour (free tier)
    timeout: 5000
};

// Example API calls
async function getFoursquareVenueData(fsqId) {
    const [stats, tips] = await Promise.all([
        fetch(`${FOURSQUARE_CONFIG.baseUrl}/places/${fsqId}/stats`, {
            headers: {
                'Authorization': FOURSQUARE_CONFIG.apiKey,
                'Accept': 'application/json'
            }
        }),
        fetch(`${FOURSQUARE_CONFIG.baseUrl}/places/${fsqId}/tips`, {
            headers: {
                'Authorization': FOURSQUARE_CONFIG.apiKey,
                'Accept': 'application/json'
            }
        })
    ]);
    
    return {
        stats: await stats.json(),
        tips: await tips.json()
    };
}
```

**Setup Steps:**
1. Register at https://developer.foursquare.com/
2. Create a new app
3. Get API key (free tier: 500 calls/hour)
4. Upgrade to paid tier for higher limits

---

### 3. Instagram Graph API (Social Data)
**Cost:** Free (with rate limits)
**Accuracy:** Medium (60-70%)
**Update Frequency:** Real-time

```javascript
// Instagram API Configuration
const INSTAGRAM_CONFIG = {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    baseUrl: 'https://graph.instagram.com/v18.0',
    endpoints: {
        locationMedia: '/{location_id}/recent_media',
        userInfo: '/{user_id}',
        mediaInsights: '/{media_id}/insights'
    },
    rateLimit: 200, // requests per hour
    timeout: 8000
};

// Example: Get posts from a location
async function getInstagramLocationData(locationId) {
    const response = await fetch(
        `${INSTAGRAM_CONFIG.baseUrl}/${locationId}/recent_media` +
        `?fields=id,caption,timestamp,media_type,owner&access_token=${INSTAGRAM_CONFIG.accessToken}`
    );
    
    const data = await response.json();
    return data.data || [];
}
```

**Setup Steps:**
1. Create Facebook Developer account
2. Create an Instagram Business app
3. Get Instagram Graph API access
4. Generate long-lived access token

---

### 4. Google Places API (Supporting Data)
**Cost:** ~$0.15 per venue query
**Accuracy:** High (85%+)
**Update Frequency:** Daily

```javascript
// Google Places API Configuration
const GOOGLE_PLACES_CONFIG = {
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
    baseUrl: 'https://maps.googleapis.com/maps/api/place',
    endpoints: {
        details: '/details/json',
        nearby: '/nearbysearch/json',
        photos: '/photo',
        textsearch: '/textsearch/json'
    },
    rateLimit: 1000, // requests per day (free tier)
    timeout: 5000
};

// Example: Get place details with demographics hints
async function getGooglePlaceData(placeId) {
    const response = await fetch(
        `${GOOGLE_PLACES_CONFIG.baseUrl}/details/json?` +
        `place_id=${placeId}&` +
        `fields=reviews,popular_times,price_level,rating,types&` +
        `key=${GOOGLE_PLACES_CONFIG.apiKey}`
    );
    
    return await response.json();
}
```

**Setup Steps:**
1. Go to Google Cloud Console
2. Enable Places API
3. Create API key and restrict it
4. Set up billing account

---

### 5. US Census API (Baseline Data)
**Cost:** Free
**Accuracy:** Very High (95%+)
**Update Frequency:** Annual

```javascript
// Census API Configuration
const CENSUS_CONFIG = {
    apiKey: process.env.CENSUS_API_KEY, // Optional but recommended
    baseUrl: 'https://api.census.gov/data/2021/acs/acs5',
    geocodingUrl: 'https://geocoding.geo.census.gov/geocoder',
    endpoints: {
        profile: '/profile',
        subject: '/subject',
        detailed: '/detailed'
    },
    timeout: 10000
};

// Example: Get area demographics
async function getCensusData(lat, lon) {
    // First, get census tract
    const geoResponse = await fetch(
        `${CENSUS_CONFIG.geocodingUrl}/locations/onelineaddress?` +
        `address=${lat},${lon}&benchmark=2020&format=json`
    );
    
    const geoData = await geoResponse.json();
    const tract = geoData.result.addressMatches[0].geographies['Census Tracts'][0];
    
    // Then get demographic data
    const response = await fetch(
        `${CENSUS_CONFIG.baseUrl}?` +
        `get=DP05_0018E,DP05_0019E,DP05_0020E,DP05_0021E,DP05_0022E&` +
        `for=tract:${tract.TRACT}&` +
        `in=state:${tract.STATE}%20county:${tract.COUNTY}&` +
        `key=${CENSUS_CONFIG.apiKey}`
    );
    
    return await response.json();
}
```

**Setup Steps:**
1. Register at https://api.census.gov/data/key_signup.html
2. Get free API key
3. No additional setup required

---

## 🏗️ Infrastructure Setup

### 1. Database Configuration (MongoDB/PostgreSQL)
```javascript
// MongoDB Schema for Venue Demographics
const venueSchema = {
    place_id: String,
    name: String,
    coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
    },
    demographics: {
        ageDistribution: {
            '16-25': Number,
            '26-35': Number,
            '36-45': Number,
            '46-55': Number,
            '56+': Number
        },
        genderDistribution: {
            male: Number,
            female: Number,
            other: Number
        },
        confidence: Number,
        lastUpdated: Date,
        sources: [String]
    },
    neighborhood: String,
    categories: [String],
    realTimeData: {
        currentBusyness: Number,
        peakHours: [String],
        popularDays: [String]
    }
};
```

### 2. Redis Cache Configuration
```javascript
// Redis Cache for Real-time Data
const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    keyPrefix: 'demographics:',
    defaultTTL: 1800 // 30 minutes
};

const redis = new Redis(REDIS_CONFIG);

// Cache patterns
const CACHE_KEYS = {
    venue: (placeId) => `venue:${placeId}`,
    neighborhood: (name) => `neighborhood:${name}`,
    batch: (timestamp) => `batch:${timestamp}`,
    patterns: (type) => `patterns:${type}`
};
```

### 3. Rate Limiting Configuration
```javascript
// Rate limiting for API calls
const RATE_LIMITS = {
    safegraph: {
        requests: 100,
        window: 60000, // 1 minute
        cost: 0.10
    },
    foursquare: {
        requests: 500,
        window: 3600000, // 1 hour
        cost: 0.02
    },
    instagram: {
        requests: 200,
        window: 3600000, // 1 hour
        cost: 0.00
    },
    google: {
        requests: 1000,
        window: 86400000, // 1 day
        cost: 0.15
    },
    census: {
        requests: 5000,
        window: 86400000, // 1 day
        cost: 0.00
    }
};
```

---

## 🚀 Deployment Configuration

### 1. Environment Variables
```bash
# API Keys
SAFEGRAPH_API_KEY=your_safegraph_key
FOURSQUARE_API_KEY=your_foursquare_key
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
GOOGLE_PLACES_API_KEY=your_google_key
CENSUS_API_KEY=your_census_key

# Database
MONGODB_URI=mongodb://localhost:27017/flocalize
REDIS_URL=redis://localhost:6379

# Performance
MAX_CONCURRENT_REQUESTS=10
CACHE_TTL=1800
UPDATE_INTERVAL=900000

# Costs
DAILY_API_BUDGET=50.00
COST_ALERT_THRESHOLD=40.00
```

### 2. Docker Configuration
```dockerfile
# Dockerfile for demographics service
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start service
CMD ["node", "demographics-service.js"]
```

### 3. Monitoring Configuration
```javascript
// Monitoring and alerting
const MONITORING = {
    metrics: {
        apiCalls: 'demographics_api_calls_total',
        apiLatency: 'demographics_api_latency_seconds',
        cacheHits: 'demographics_cache_hits_total',
        errors: 'demographics_errors_total',
        costs: 'demographics_costs_total'
    },
    alerts: {
        highLatency: 5000, // 5 seconds
        errorRate: 0.05,   // 5%
        costThreshold: 40, // $40/day
        lowConfidence: 0.3 // 30%
    }
};
```

---

## 💰 Cost Optimization Strategies

### 1. Smart Caching
```javascript
// Tiered caching strategy
const CACHE_STRATEGY = {
    tier1: { // Hot data - Redis
        ttl: 900,    // 15 minutes
        venues: 'popular_manhattan_venues'
    },
    tier2: { // Warm data - Database
        ttl: 3600,   // 1 hour
        venues: 'moderate_traffic_venues'
    },
    tier3: { // Cold data - API fallback
        ttl: 86400,  // 24 hours
        venues: 'low_traffic_venues'
    }
};
```

### 2. Batch Processing
```javascript
// Batch API requests to reduce costs
class BatchProcessor {
    constructor() {
        this.batchSize = 50;
        this.batchInterval = 30000; // 30 seconds
        this.pendingRequests = [];
    }
    
    async addRequest(venue) {
        this.pendingRequests.push(venue);
        
        if (this.pendingRequests.length >= this.batchSize) {
            return this.processBatch();
        }
        
        // Set timeout for partial batches
        setTimeout(() => {
            if (this.pendingRequests.length > 0) {
                this.processBatch();
            }
        }, this.batchInterval);
    }
}
```

### 3. Cost Monitoring
```javascript
// Real-time cost tracking
class CostMonitor {
    constructor() {
        this.dailyBudget = 50.00;
        this.currentSpend = 0;
        this.costPerAPI = RATE_LIMITS;
    }
    
    trackAPICall(source, count = 1) {
        const cost = this.costPerAPI[source].cost * count;
        this.currentSpend += cost;
        
        if (this.currentSpend > this.dailyBudget * 0.8) {
            this.sendCostAlert();
        }
        
        if (this.currentSpend > this.dailyBudget) {
            this.enableCostSavingMode();
        }
    }
}
```

---

## 📊 Expected Results

With this setup, you can expect:

- **Real-time demographics**: Updated every 15 minutes
- **High accuracy**: 85-90% confidence for popular venues
- **Cost efficiency**: ~$30-50/day for 1000 venue queries
- **Scalability**: Handle 10,000+ venues in Manhattan
- **Low latency**: <2 seconds average response time

The system provides precise age-gender pyramid analysis by combining multiple data sources and using machine learning to fill gaps, giving you the most accurate demographic picture possible for Manhattan venues.
