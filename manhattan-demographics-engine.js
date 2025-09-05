// Real-Time Manhattan Demographics Integration
// This file provides practical implementation for precise age-gender pyramid analysis

class ManhattanDemographicsEngine {
    constructor(config = {}) {
        this.config = {
            updateInterval: config.updateInterval || 900000, // 15 minutes
            cacheTimeout: config.cacheTimeout || 1800000,   // 30 minutes
            maxConcurrentRequests: config.maxConcurrentRequests || 10,
            confidenceThreshold: config.confidenceThreshold || 0.6,
            ...config
        };

        // Initialize data sources
        this.dataSources = this.initializeDataSources();
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.manhattanBounds = this.getManhattanBounds();
        
        // Start background updates
        this.startBackgroundUpdates();
    }

    initializeDataSources() {
        return {
            // Primary: SafeGraph for foot traffic data
            safegraph: {
                baseUrl: 'https://api.safegraph.com/v2',
                weight: 0.35,
                enabled: true
            },
            
            // Secondary: Foursquare for social data
            foursquare: {
                baseUrl: 'https://api.foursquare.com/v3',
                weight: 0.25,
                enabled: true
            },
            
            // Tertiary: Social media analysis
            instagram: {
                baseUrl: 'https://graph.instagram.com/v18.0',
                weight: 0.20,
                enabled: true
            },
            
            // Supporting: Google Places
            google: {
                baseUrl: 'https://maps.googleapis.com/maps/api/place',
                weight: 0.15,
                enabled: true
            },
            
            // Baseline: Census data
            census: {
                baseUrl: 'https://api.census.gov/data/2021/acs/acs5',
                weight: 0.05,
                enabled: true
            }
        };
    }

    getManhattanBounds() {
        return {
            north: 40.882214,
            south: 40.680258,
            east: -73.907000,
            west: -74.047285,
            neighborhoods: {
                'Financial District': { lat: 40.7074, lon: -74.0113 },
                'SoHo': { lat: 40.7230, lon: -74.0030 },
                'Greenwich Village': { lat: 40.7335, lon: -74.0027 },
                'East Village': { lat: 40.7281, lon: -73.9837 },
                'Chelsea': { lat: 40.7465, lon: -74.0014 },
                'Midtown': { lat: 40.7549, lon: -73.9840 },
                'Upper East Side': { lat: 40.7736, lon: -73.9566 },
                'Upper West Side': { lat: 40.7870, lon: -73.9754 },
                'Harlem': { lat: 40.8116, lon: -73.9465 },
                'Washington Heights': { lat: 40.8518, lon: -73.9365 }
            }
        };
    }

    // Main method to get real-time demographics for a venue
    async getVenueDemographics(venue) {
        const venueKey = this.generateVenueKey(venue);
        
        // Check if within Manhattan bounds
        if (!this.isInManhattan(venue.geometry.coordinates)) {
            return this.getFallbackDemographics();
        }

        // Check cache first
        const cached = this.getCachedData(venueKey);
        if (cached && this.isCacheValid(cached.timestamp)) {
            return cached.data;
        }

        // Avoid duplicate requests
        if (this.pendingRequests.has(venueKey)) {
            return await this.pendingRequests.get(venueKey);
        }

        // Create new request
        const requestPromise = this.fetchRealTimeDemographics(venue);
        this.pendingRequests.set(venueKey, requestPromise);

        try {
            const demographics = await requestPromise;
            this.cacheData(venueKey, demographics);
            return demographics;
        } finally {
            this.pendingRequests.delete(venueKey);
        }
    }

    async fetchRealTimeDemographics(venue) {
        const [lon, lat] = venue.geometry.coordinates;
        const neighborhood = this.getNeighborhood(lat, lon);
        
        // Gather data from multiple sources
        const dataPromises = {};

        // SafeGraph foot traffic data
        if (this.dataSources.safegraph.enabled) {
            dataPromises.footTraffic = this.getSafeGraphData(venue);
        }

        // Foursquare social data
        if (this.dataSources.foursquare.enabled) {
            dataPromises.socialData = this.getFoursquareData(venue);
        }

        // Instagram location analysis
        if (this.dataSources.instagram.enabled) {
            dataPromises.instagramData = this.getInstagramData(venue);
        }

        // Google Places insights
        if (this.dataSources.google.enabled) {
            dataPromises.googleData = this.getGooglePlacesData(venue);
        }

        // Census baseline
        if (this.dataSources.census.enabled) {
            dataPromises.censusData = this.getCensusData(lat, lon);
        }

        // Execute all requests with timeout
        const results = await this.executeWithTimeout(dataPromises, 10000);
        
        // Fuse data sources
        const fusedDemographics = this.fuseDataSources(results, neighborhood);
        
        // Apply real-time adjustments
        const adjustedDemographics = this.applyRealTimeAdjustments(fusedDemographics, venue);
        
        return {
            ...adjustedDemographics,
            neighborhood,
            lastUpdated: new Date().toISOString(),
            dataQuality: this.assessDataQuality(results)
        };
    }

    async getSafeGraphData(venue) {
        try {
            // Mock SafeGraph API call (replace with actual implementation)
            const response = await this.makeAPICall('safegraph', {
                place_id: venue.properties.place_id,
                date_range: this.getLast7Days(),
                demographics: true
            });

            return {
                source: 'safegraph',
                ageDistribution: this.normalizeSafeGraphAges(response.age_groups),
                genderDistribution: this.normalizeSafeGraphGender(response.gender_split),
                visitPatterns: response.visit_patterns,
                footTraffic: response.device_counts,
                confidence: response.confidence_score || 0.8
            };
        } catch (error) {
            console.error('SafeGraph API error:', error);
            return null;
        }
    }

    async getFoursquareData(venue) {
        try {
            // Get Foursquare venue ID (you'd need to map this)
            const fsqId = await this.getFoursquareId(venue);
            if (!fsqId) return null;

            const [stats, tips, photos] = await Promise.all([
                this.makeAPICall('foursquare', { endpoint: `places/${fsqId}/stats` }),
                this.makeAPICall('foursquare', { endpoint: `places/${fsqId}/tips` }),
                this.makeAPICall('foursquare', { endpoint: `places/${fsqId}/photos` })
            ]);

            return {
                source: 'foursquare',
                ageDistribution: this.inferAgeFromTips(tips.results),
                genderDistribution: this.inferGenderFromPhotos(photos.results),
                socialActivity: stats.total_checkins,
                popularTimes: stats.popular_hours,
                confidence: this.calculateFoursquareConfidence(stats, tips, photos)
            };
        } catch (error) {
            console.error('Foursquare API error:', error);
            return null;
        }
    }

    async getInstagramData(venue) {
        try {
            // Find Instagram location ID
            const locationId = await this.getInstagramLocationId(venue);
            if (!locationId) return null;

            const posts = await this.makeAPICall('instagram', {
                endpoint: `${locationId}/recent_media`,
                count: 50
            });

            const demographics = await this.analyzeInstagramPosts(posts.data);

            return {
                source: 'instagram',
                ageDistribution: demographics.ageGroups,
                genderDistribution: demographics.genderSplit,
                postVolume: posts.data.length,
                hashtagTrends: demographics.hashtagAnalysis,
                confidence: demographics.confidence
            };
        } catch (error) {
            console.error('Instagram API error:', error);
            return null;
        }
    }

    async getGooglePlacesData(venue) {
        try {
            const placeId = venue.properties.place_id;
            
            const details = await this.makeAPICall('google', {
                endpoint: 'details/json',
                params: {
                    place_id: placeId,
                    fields: 'reviews,popular_times,price_level,rating'
                }
            });

            const demographics = await this.analyzeGoogleReviews(details.result.reviews || []);

            return {
                source: 'google',
                ageDistribution: demographics.ageIndicators,
                genderDistribution: demographics.genderClues,
                popularTimes: details.result.popular_times,
                priceLevel: details.result.price_level,
                confidence: demographics.confidence
            };
        } catch (error) {
            console.error('Google Places API error:', error);
            return null;
        }
    }

    async getCensusData(lat, lon) {
        try {
            // Get census tract for coordinates
            const tract = await this.getCensusTract(lat, lon);
            
            const demographics = await this.makeAPICall('census', {
                endpoint: 'profile',
                params: {
                    get: 'DP05_0001E,DP05_0018E,DP05_0019E,DP05_0020E,DP05_0021E,DP05_0022E,DP05_0023E',
                    for: `tract:${tract.tract}`,
                    in: `state:${tract.state} county:${tract.county}`
                }
            });

            return {
                source: 'census',
                ageDistribution: this.normalizeCensusAges(demographics[0]),
                genderDistribution: this.normalizeCensusGender(demographics[0]),
                populationDensity: this.calculatePopulationDensity(demographics[0]),
                confidence: 0.9 // Census data is highly reliable
            };
        } catch (error) {
            console.error('Census API error:', error);
            return null;
        }
    }

    fuseDataSources(results, neighborhood) {
        const validSources = Object.values(results).filter(r => r !== null);
        
        if (validSources.length === 0) {
            return this.getFallbackDemographics();
        }

        // Weight sources based on reliability and recency
        const weights = this.calculateSourceWeights(validSources);
        
        // Fuse age distributions
        const ageDistribution = this.fuseAgeDistributions(validSources, weights);
        
        // Fuse gender distributions
        const genderDistribution = this.fuseGenderDistributions(validSources, weights);
        
        // Calculate overall confidence
        const confidence = this.calculateFusedConfidence(validSources, weights);

        return {
            ageDistribution,
            genderDistribution,
            confidence,
            sourceCount: validSources.length,
            primarySource: this.getPrimarySource(validSources),
            neighborhood: neighborhood
        };
    }

    applyRealTimeAdjustments(demographics, venue) {
        const currentHour = new Date().getHours();
        const dayOfWeek = new Date().getDay();
        const categories = venue.properties.categories || [];

        // Time-based adjustments
        const timeAdjustments = this.getTimeAdjustments(currentHour, dayOfWeek, categories);
        
        // Weather adjustments
        const weatherAdjustments = this.getWeatherAdjustments(categories);
        
        // Event adjustments (if there are nearby events)
        const eventAdjustments = this.getEventAdjustments(venue.geometry.coordinates);

        // Apply adjustments
        const adjustedAgeDistribution = this.applyAdjustments(
            demographics.ageDistribution, 
            timeAdjustments.age,
            weatherAdjustments.age,
            eventAdjustments.age
        );

        const adjustedGenderDistribution = this.applyAdjustments(
            demographics.genderDistribution,
            timeAdjustments.gender,
            weatherAdjustments.gender,
            eventAdjustments.gender
        );

        return {
            ...demographics,
            ageDistribution: adjustedAgeDistribution,
            genderDistribution: adjustedGenderDistribution,
            adjustments: {
                time: timeAdjustments,
                weather: weatherAdjustments,
                events: eventAdjustments
            }
        };
    }

    getTimeAdjustments(hour, dayOfWeek, categories) {
        const adjustments = { age: {}, gender: {} };
        
        // Weekend vs weekday patterns
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Venue type specific patterns
        if (categories.some(cat => cat.includes('bar') || cat.includes('nightclub'))) {
            if (hour >= 22 || hour <= 2) {
                adjustments.age['21-25'] = 1.3;
                adjustments.age['26-35'] = 1.2;
                adjustments.age['36+'] = 0.7;
            }
        }
        
        if (categories.some(cat => cat.includes('cafe'))) {
            if (hour >= 7 && hour <= 10) {
                adjustments.age['26-35'] = 1.2; // Working professionals
                adjustments.age['36-45'] = 1.1;
            }
        }
        
        if (categories.some(cat => cat.includes('restaurant'))) {
            if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21)) {
                if (isWeekend) {
                    adjustments.age['family'] = 1.3;
                } else {
                    adjustments.age['professional'] = 1.2;
                }
            }
        }

        return adjustments;
    }

    // Helper methods for data processing
    normalizeSafeGraphAges(ageData) {
        // Convert SafeGraph age format to our standard format
        return {
            '16-25': (ageData['18-24'] || 0) + (ageData['25-29'] || 0) * 0.2,
            '26-35': (ageData['25-29'] || 0) * 0.8 + (ageData['30-34'] || 0) + (ageData['35-39'] || 0) * 0.2,
            '36-45': (ageData['35-39'] || 0) * 0.8 + (ageData['40-44'] || 0) + (ageData['45-49'] || 0) * 0.2,
            '46-55': (ageData['45-49'] || 0) * 0.8 + (ageData['50-54'] || 0) + (ageData['55-59'] || 0) * 0.2,
            '56+': (ageData['55-59'] || 0) * 0.8 + (ageData['60-64'] || 0) + (ageData['65+'] || 0)
        };
    }

    async analyzeInstagramPosts(posts) {
        const demographics = {
            ageGroups: { '16-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 },
            genderSplit: { male: 0, female: 0, other: 0 },
            hashtagAnalysis: {},
            confidence: 0
        };

        for (const post of posts) {
            // Analyze hashtags for age/gender clues
            const hashtags = this.extractHashtags(post.caption);
            const ageClues = this.analyzeHashtagsForAge(hashtags);
            const genderClues = this.analyzeHashtagsForGender(hashtags);
            
            // Update distributions
            Object.keys(ageClues).forEach(ageGroup => {
                demographics.ageGroups[ageGroup] += ageClues[ageGroup];
            });
            
            Object.keys(genderClues).forEach(gender => {
                demographics.genderSplit[gender] += genderClues[gender];
            });
        }

        // Normalize distributions
        demographics.ageGroups = this.normalizeDistribution(demographics.ageGroups);
        demographics.genderSplit = this.normalizeDistribution(demographics.genderSplit);
        demographics.confidence = Math.min(0.8, posts.length / 50); // Max confidence with 50+ posts

        return demographics;
    }

    calculateCompatibilityScore(userProfile, venueDemographics) {
        let score = 0;
        const weights = { age: 0.4, gender: 0.2, lifestyle: 0.3, confidence: 0.1 };

        // Age compatibility
        const userAge = userProfile.age;
        const venueAgeDistribution = venueDemographics.ageDistribution;
        score += venueAgeDistribution[userAge] * weights.age;

        // Gender compatibility
        const userGender = userProfile.gender;
        const venueGenderDistribution = venueDemographics.genderDistribution;
        if (userGender !== 'prefer-not-to-say') {
            score += venueGenderDistribution[userGender] * weights.gender;
        } else {
            score += 0.5 * weights.gender; // Neutral score
        }

        // Lifestyle compatibility (this would need additional venue lifestyle data)
        const lifestyleScore = this.calculateLifestyleCompatibility(userProfile.lifestyle, venueDemographics);
        score += lifestyleScore * weights.lifestyle;

        // Confidence adjustment
        score *= venueDemographics.confidence;

        return Math.min(1.0, Math.max(0.0, score));
    }

    // Background processing
    startBackgroundUpdates() {
        // Update popular venues every 15 minutes
        setInterval(() => {
            this.updatePopularVenues();
        }, this.config.updateInterval);

        // Clean cache every hour
        setInterval(() => {
            this.cleanCache();
        }, 3600000);

        // Update neighborhood patterns daily
        setInterval(() => {
            this.updateNeighborhoodPatterns();
        }, 86400000);
    }

    async updatePopularVenues() {
        // Get list of popular Manhattan venues
        const popularVenues = await this.getPopularManhattanVenues();
        
        // Update their demographics in background
        const updatePromises = popularVenues.map(venue => 
            this.getVenueDemographics(venue).catch(error => {
                console.error(`Failed to update venue ${venue.properties.place_id}:`, error);
                return null;
            })
        );

        await Promise.all(updatePromises);
        console.log(`Updated demographics for ${popularVenues.length} popular venues`);
    }

    // Utility methods
    generateVenueKey(venue) {
        return `venue:${venue.properties.place_id || venue.properties.name}:${Math.floor(Date.now() / this.config.updateInterval)}`;
    }

    isInManhattan(coordinates) {
        const [lon, lat] = coordinates;
        const bounds = this.manhattanBounds;
        return lat >= bounds.south && lat <= bounds.north && 
               lon >= bounds.west && lon <= bounds.east;
    }

    getNeighborhood(lat, lon) {
        const neighborhoods = this.manhattanBounds.neighborhoods;
        let closestNeighborhood = 'Unknown';
        let minDistance = Infinity;

        Object.keys(neighborhoods).forEach(name => {
            const neighborhood = neighborhoods[name];
            const distance = this.calculateDistance(lat, lon, neighborhood.lat, neighborhood.lon);
            if (distance < minDistance) {
                minDistance = distance;
                closestNeighborhood = name;
            }
        });

        return closestNeighborhood;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    getFallbackDemographics() {
        return {
            ageDistribution: {
                '16-25': 0.2,
                '26-35': 0.3,
                '36-45': 0.25,
                '46-55': 0.15,
                '56+': 0.1
            },
            genderDistribution: {
                male: 0.48,
                female: 0.48,
                other: 0.04
            },
            confidence: 0.3,
            source: 'fallback'
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ManhattanDemographicsEngine;
} else {
    window.ManhattanDemographicsEngine = ManhattanDemographicsEngine;
}
