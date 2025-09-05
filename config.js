// Configuration Management for Flocalize
// This file handles API keys and configuration securely

class Config {
    constructor() {
        this.apiKeys = {};
        this.loadConfig();
    }

    loadConfig() {
        // In production, load from environment variables
        // In development, you can use a .env file or secure config
        
        // Method 1: Environment variables (recommended for production)
        this.apiKeys = {
            geoapify: process.env.GEOAPIFY_API_KEY || this.getFromLocalStorage('geoapify_key'),
            safegraph: process.env.SAFEGRAPH_API_KEY || this.getFromLocalStorage('safegraph_key'),
            foursquare: process.env.FOURSQUARE_API_KEY || this.getFromLocalStorage('foursquare_key'),
            instagram: process.env.INSTAGRAM_ACCESS_TOKEN || this.getFromLocalStorage('instagram_token'),
            googlePlaces: process.env.GOOGLE_PLACES_API_KEY || this.getFromLocalStorage('google_places_key'),
            census: process.env.CENSUS_API_KEY || this.getFromLocalStorage('census_key')
        };

        // Validate required keys
        this.validateConfig();
    }

    getFromLocalStorage(key) {
        // For development only - store keys in localStorage
        // Never use this in production!
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    }

    validateConfig() {
        const required = ['geoapify'];
        const missing = required.filter(key => !this.apiKeys[key]);
        
        if (missing.length > 0) {
            console.warn(`Missing API keys: ${missing.join(', ')}`);
            this.showApiKeySetupDialog();
        }
    }

    showApiKeySetupDialog() {
        // Show user-friendly dialog for API key setup
        const message = `
            API Configuration Required:
            
            Please set up your API keys by either:
            1. Creating a .env file with your keys
            2. Setting them in localStorage for development
            3. Configuring environment variables for production
            
            See .env.example for the required format.
        `;
        
        if (typeof alert !== 'undefined') {
            alert(message);
        } else {
            console.error(message);
        }
    }

    get(service) {
        return this.apiKeys[service];
    }

    // Development helper function
    setDevelopmentKey(service, key) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`${service}_key`, key);
            this.apiKeys[service] = key;
        }
    }
}

// Export for use in other files
const config = new Config();

// For browser environments
if (typeof window !== 'undefined') {
    window.FloCalizeConfig = config;
}

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}
