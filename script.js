// Geoapify API Configuration
const GEOAPIFY_API_KEY = 'f8fbedd105f044a282467393a92e58f2';
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v2/places';
const GEOCODING_URL = 'https://api.geoapify.com/v1/geocode/search';

// Global variables
let map;
let userLocation = null;
let markersGroup;
let venues = [];
let manhattanDemographics = null;

// Initialize Manhattan Demographics Engine (if in Manhattan)
if (typeof ManhattanDemographicsEngine !== 'undefined') {
    manhattanDemographics = new ManhattanDemographicsEngine({
        updateInterval: 900000, // 15 minutes
        confidenceThreshold: 0.6,
        enableRealTimeUpdates: true
    });
}

// Demographic scoring system for venues
const DEMOGRAPHIC_PROFILES = {
    // Age-based venue preferences
    ageProfiles: {
        '16-20': {
            primary: ['catering.fast_food', 'entertainment.cinema', 'commercial.shopping_mall', 'sport.fitness'],
            secondary: ['catering.cafe', 'leisure.park', 'activity.community_centre'],
            scoreMultiplier: 1.0
        },
        '21-25': {
            primary: ['entertainment.nightclub', 'catering.bar', 'catering.cafe', 'sport.fitness'],
            secondary: ['entertainment.cinema', 'catering.restaurant', 'commercial.shopping_mall'],
            scoreMultiplier: 1.0
        },
        '26-30': {
            primary: ['catering.restaurant', 'catering.bar', 'sport.fitness', 'office.coworking'],
            secondary: ['entertainment.culture', 'catering.cafe', 'commercial.electronics'],
            scoreMultiplier: 1.0
        },
        '31-35': {
            primary: ['catering.restaurant', 'leisure.spa', 'sport.tennis', 'commercial.books'],
            secondary: ['entertainment.museum', 'leisure.park', 'catering.cafe'],
            scoreMultiplier: 1.0
        },
        '36-40': {
            primary: ['catering.restaurant', 'leisure.park', 'sport.tennis', 'education.library'],
            secondary: ['entertainment.theatre', 'leisure.spa', 'commercial.books'],
            scoreMultiplier: 1.0
        },
        '41-45': {
            primary: ['leisure.park', 'catering.restaurant', 'sport.fitness', 'entertainment.culture'],
            secondary: ['education.library', 'leisure.spa', 'commercial.books'],
            scoreMultiplier: 1.0
        },
        '46-50': {
            primary: ['leisure.park', 'entertainment.culture', 'education.library', 'leisure.spa'],
            secondary: ['catering.restaurant', 'commercial.books', 'tourism.sights'],
            scoreMultiplier: 1.0
        },
        '51-55': {
            primary: ['leisure.park', 'entertainment.museum', 'education.library', 'tourism.sights'],
            secondary: ['leisure.spa', 'commercial.books', 'catering.restaurant'],
            scoreMultiplier: 1.0
        },
        '56-60': {
            primary: ['leisure.park', 'entertainment.museum', 'education.library', 'tourism.sights'],
            secondary: ['leisure.spa', 'commercial.books', 'entertainment.culture'],
            scoreMultiplier: 1.0
        },
        '61+': {
            primary: ['leisure.park', 'education.library', 'entertainment.museum', 'tourism.sights'],
            secondary: ['leisure.spa', 'commercial.books', 'entertainment.culture'],
            scoreMultiplier: 1.0
        }
    },
    
    // Gender-based venue preferences
    genderProfiles: {
        'male': {
            preferred: ['sport.fitness', 'sport.football', 'catering.bar', 'catering.pub'],
            neutral: ['catering.restaurant', 'entertainment.cinema', 'leisure.park'],
            scoreMultiplier: 1.0
        },
        'female': {
            preferred: ['leisure.spa', 'commercial.clothing', 'catering.cafe', 'commercial.shopping_mall'],
            neutral: ['catering.restaurant', 'entertainment.cinema', 'leisure.park'],
            scoreMultiplier: 1.0
        },
        'non-binary': {
            preferred: ['activity.community_centre', 'catering.cafe', 'education.library', 'office.coworking'],
            neutral: ['catering.restaurant', 'entertainment.cinema', 'leisure.park'],
            scoreMultiplier: 1.0
        },
        'prefer-not-to-say': {
            preferred: [],
            neutral: ['catering.restaurant', 'entertainment.cinema', 'leisure.park'],
            scoreMultiplier: 1.0
        }
    },
    
    // Lifestyle-based preferences
    lifestyleProfiles: {
        'student': {
            preferred: ['catering.fast_food', 'catering.cafe', 'education.library', 'office.coworking'],
            timePreferences: ['afternoon', 'evening'],
            budgetFactor: 0.7
        },
        'professional': {
            preferred: ['catering.restaurant', 'catering.bar', 'sport.fitness', 'office.coworking'],
            timePreferences: ['lunch', 'after-work'],
            budgetFactor: 1.2
        },
        'family': {
            preferred: ['leisure.park', 'catering.restaurant', 'commercial.shopping_mall', 'entertainment.cinema'],
            timePreferences: ['weekend', 'afternoon'],
            budgetFactor: 1.0
        },
        'retiree': {
            preferred: ['leisure.park', 'education.library', 'entertainment.museum', 'leisure.spa'],
            timePreferences: ['morning', 'afternoon'],
            budgetFactor: 0.9
        },
        'entrepreneur': {
            preferred: ['office.coworking', 'catering.cafe', 'catering.restaurant', 'activity.community_centre'],
            timePreferences: ['morning', 'lunch', 'networking'],
            budgetFactor: 1.1
        }
    }
};

// Function to calculate demographic score for a venue
function calculateDemographicScore(venue, userProfile) {
    let score = 0;
    const categories = venue.properties.categories || [];
    
    // Age-based scoring
    const ageProfile = DEMOGRAPHIC_PROFILES.ageProfiles[userProfile.age];
    if (ageProfile) {
        categories.forEach(category => {
            if (ageProfile.primary.some(pref => category.includes(pref))) {
                score += 3;
            } else if (ageProfile.secondary.some(pref => category.includes(pref))) {
                score += 1;
            }
        });
    }
    
    // Gender-based scoring
    const genderProfile = DEMOGRAPHIC_PROFILES.genderProfiles[userProfile.gender];
    if (genderProfile) {
        categories.forEach(category => {
            if (genderProfile.preferred.some(pref => category.includes(pref))) {
                score += 2;
            } else if (genderProfile.neutral.some(pref => category.includes(pref))) {
                score += 0.5;
            }
        });
    }
    
    // Lifestyle-based scoring
    const lifestyleProfile = DEMOGRAPHIC_PROFILES.lifestyleProfiles[userProfile.lifestyle];
    if (lifestyleProfile) {
        categories.forEach(category => {
            if (lifestyleProfile.preferred.some(pref => category.includes(pref))) {
                score += 2;
            }
        });
        score *= lifestyleProfile.budgetFactor;
    }
    
    // Demographic preference modifier
    score = applyDemographicPreference(score, userProfile.demographicPreference, categories);
    
    return Math.max(0, score);
}

function applyDemographicPreference(baseScore, preference, categories) {
    let modifier = 1.0;
    
    switch (preference) {
        case 'younger':
            // Boost venues popular with younger demographics
            if (categories.some(cat => cat.includes('nightclub') || cat.includes('fast_food') || cat.includes('fitness'))) {
                modifier = 1.3;
            }
            break;
        case 'older':
            // Boost venues popular with older demographics
            if (categories.some(cat => cat.includes('museum') || cat.includes('library') || cat.includes('park'))) {
                modifier = 1.3;
            }
            break;
        case 'diverse':
            // Boost venues that attract diverse crowds
            if (categories.some(cat => cat.includes('restaurant') || cat.includes('cinema') || cat.includes('park'))) {
                modifier = 1.2;
            }
            break;
        case 'mixed-gender':
            // Boost mixed-gender venues
            if (categories.some(cat => cat.includes('restaurant') || cat.includes('cinema') || cat.includes('community'))) {
                modifier = 1.2;
            }
            break;
        case 'same-gender':
            // This would require more specific venue data
            modifier = 1.0;
            break;
        default:
            modifier = 1.0;
    }
    
    return baseScore * modifier;
}

// Interest to venue category mapping
const INTEREST_MAPPING = {
    // Entertainment & Nightlife
    'entertainment.culture': ['entertainment.culture', 'entertainment.culture.theatre', 'entertainment.culture.arts_centre'],
    'entertainment.nightclub': ['entertainment.nightclub', 'entertainment.adult.nightclub'],
    'entertainment.cinema': ['entertainment.cinema'],
    'entertainment.museum': ['entertainment.museum'],
    'entertainment.theatre': ['entertainment.culture.theatre'],
    
    // Food & Dining
    'catering.restaurant': ['catering.restaurant', 'catering.restaurant.pizza', 'catering.restaurant.italian', 'catering.restaurant.chinese'],
    'catering.cafe': ['catering.cafe', 'catering.cafe.bubble_tea'],
    'catering.bar': ['catering.bar', 'catering.pub'],
    'catering.fast_food': ['catering.fast_food', 'catering.fast_food.burger', 'catering.fast_food.kebab'],
    'catering.pub': ['catering.pub'],
    
    // Sports & Fitness
    'sport.fitness': ['sport.fitness', 'leisure.fitness'],
    'sport.swimming': ['sport.swimming', 'leisure.swimming_pool'],
    'sport.tennis': ['sport.tennis'],
    'sport.football': ['sport.football', 'sport.multi'],
    'leisure.sports_centre': ['leisure.sports_centre', 'sport'],
    
    // Leisure & Relaxation
    'leisure.park': ['leisure.park', 'natural.park'],
    'leisure.spa': ['leisure.spa'],
    'leisure.beach_resort': ['leisure.beach_resort', 'natural.beach'],
    'leisure.picnic': ['leisure.picnic', 'leisure.park'],
    'tourism.sights': ['tourism.sights', 'tourism.attraction'],
    
    // Shopping & Lifestyle
    'commercial.shopping_mall': ['commercial.shopping_mall'],
    'commercial.marketplace': ['commercial.marketplace'],
    'commercial.clothing': ['commercial.clothing'],
    'commercial.books': ['commercial.books'],
    'commercial.electronics': ['commercial.electronics'],
    
    // Learning & Community
    'education.library': ['education.library'],
    'activity.community_centre': ['activity.community_centre'],
    'office.coworking': ['office.coworking'],
    'education.language_school': ['education.language_school'],
    'activity': ['activity']
};

// DOM Elements
const onboardingSection = document.getElementById('onboarding');
const resultsSection = document.getElementById('results');
const userForm = document.getElementById('userForm');
const locationInput = document.getElementById('location');
const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
const backToFormBtn = document.getElementById('backToForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingSpinner = document.getElementById('loadingSpinner');
const venuesList = document.getElementById('venuesList');
const venueModal = document.getElementById('venueModal');
const modalVenueName = document.getElementById('modalVenueName');
const modalVenueDetails = document.getElementById('modalVenueDetails');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    userForm.addEventListener('submit', handleFormSubmit);
    useCurrentLocationBtn.addEventListener('click', getCurrentLocation);
    backToFormBtn.addEventListener('click', showOnboarding);
    
    // Add keyboard event listener for modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !venueModal.classList.contains('hidden')) {
            closeVenueModal();
        }
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(userForm);
    const interests = formData.getAll('interests');
    const location = formData.get('location');
    const radius = formData.get('radius');
    
    // Collect demographic data
    const userProfile = {
        age: formData.get('age'),
        gender: formData.get('gender'),
        lifestyle: formData.get('lifestyle'),
        demographicPreference: formData.get('demographicPreference') || 'similar',
        interests: interests
    };
    
    if (interests.length === 0) {
        alert('Please select at least one interest.');
        return;
    }
    
    if (!location) {
        alert('Please enter a location or use current location.');
        return;
    }
    
    showLoadingOverlay();
    
    try {
        // Geocode the location
        const coordinates = await geocodeLocation(location);
        userLocation = coordinates;
        
        // Get venues based on interests and demographics
        const venueResults = await findVenuesForInterests(interests, coordinates, radius, userProfile);
        
        // Show results
        hideLoadingOverlay();
        showResults(venueResults, coordinates, userProfile);
        
    } catch (error) {
        console.error('Error finding venues:', error);
        hideLoadingOverlay();
        alert('Sorry, we encountered an error finding venues. Please try again.');
    }
}

async function geocodeLocation(locationString) {
    const url = `${GEOCODING_URL}?text=${encodeURIComponent(locationString)}&apiKey=${GEOAPIFY_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
        const [lon, lat] = data.features[0].geometry.coordinates;
        return { lat, lon };
    } else {
        throw new Error('Location not found');
    }
}

async function findVenuesForInterests(interests, coordinates, radius, userProfile) {
    const allVenues = [];
    const uniqueVenues = new Map();
    
    // Convert interests to Geoapify categories
    const categories = [];
    interests.forEach(interest => {
        if (INTEREST_MAPPING[interest]) {
            categories.push(...INTEREST_MAPPING[interest]);
        }
    });
    
    // Remove duplicates
    const uniqueCategories = [...new Set(categories)];
    
    // Search for venues in batches to avoid too many simultaneous requests
    const batchSize = 3;
    for (let i = 0; i < uniqueCategories.length; i += batchSize) {
        const batch = uniqueCategories.slice(i, i + batchSize);
        const batchPromises = batch.map(category => searchVenuesByCategory(category, coordinates, radius));
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(venues => {
            venues.forEach(venue => {
                // Use place_id as unique identifier
                if (!uniqueVenues.has(venue.properties.place_id)) {
                    uniqueVenues.set(venue.properties.place_id, venue);
                }
            });
        });
    }
    
    // Convert to array
    const venuesArray = Array.from(uniqueVenues.values());
    
    // Check if we're in Manhattan and enhance with real-time demographics
    const isInManhattan = manhattanDemographics && 
                         manhattanDemographics.isInManhattan(coordinates);
    
    if (isInManhattan) {
        console.log('Enhancing venues with real-time Manhattan demographics...');
        
        // Process venues with real-time demographics
        const enhancedVenues = await Promise.all(
            venuesArray.map(async (venue) => {
                try {
                    // Get real-time demographics from Manhattan engine
                    const realTimeDemographics = await manhattanDemographics.getVenueDemographics(venue);
                    
                    // Calculate enhanced demographic score
                    const realTimeScore = manhattanDemographics.calculateCompatibilityScore(
                        userProfile, 
                        realTimeDemographics
                    );
                    
                    // Combine traditional scoring with real-time data
                    const traditionalScore = calculateDemographicScore(venue, userProfile);
                    const combinedScore = (realTimeScore * 0.7) + (traditionalScore * 0.3);
                    
                    return {
                        ...venue,
                        demographicScore: combinedScore,
                        realTimeDemographics: realTimeDemographics,
                        isEnhanced: true,
                        enhancementSource: 'manhattan-real-time'
                    };
                } catch (error) {
                    console.warn(`Failed to get real-time demographics for venue ${venue.properties.place_id}:`, error);
                    
                    // Fallback to traditional scoring
                    const demographicScore = calculateDemographicScore(venue, userProfile);
                    return {
                        ...venue,
                        demographicScore: demographicScore,
                        isEnhanced: false,
                        enhancementSource: 'traditional'
                    };
                }
            })
        );
        
        return enhancedVenues.sort((a, b) => (b.demographicScore || 0) - (a.demographicScore || 0));
    } else {
        // Use traditional demographic scoring for non-Manhattan locations
        venuesArray.forEach(venue => {
            const demographicScore = calculateDemographicScore(venue, userProfile);
            venue.demographicScore = demographicScore;
            venue.isEnhanced = false;
            venue.enhancementSource = 'traditional';
        });
        
        return venuesArray.sort((a, b) => (b.demographicScore || 0) - (a.demographicScore || 0));
    }
}

async function searchVenuesByCategory(category, coordinates, radius) {
    const url = `${GEOAPIFY_BASE_URL}?categories=${category}&filter=circle:${coordinates.lon},${coordinates.lat},${radius}&bias=proximity:${coordinates.lon},${coordinates.lat}&limit=50&apiKey=${GEOAPIFY_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.features || [];
    } catch (error) {
        console.error(`Error searching for category ${category}:`, error);
        return [];
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        useCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    // Reverse geocode to get address
                    const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`);
                    const data = await response.json();
                    
                    if (data.features && data.features.length > 0) {
                        const address = data.features[0].properties.formatted;
                        locationInput.value = address;
                    } else {
                        locationInput.value = `${lat}, ${lon}`;
                    }
                } catch (error) {
                    locationInput.value = `${lat}, ${lon}`;
                }
                
                useCurrentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to get your current location. Please enter it manually.');
                useCurrentLocationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function showResults(venueResults, userCoords, userProfile) {
    venues = venueResults;
    
    // Hide onboarding and show results
    onboardingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Initialize map
    initializeMap(userCoords);
    
    // Display venues list with demographic information
    displayVenuesList(venueResults, userCoords, userProfile);
    
    // Add markers to map
    addVenuesToMap(venueResults, userCoords);
}

function initializeMap(coordinates) {
    // Remove existing map if it exists
    if (map) {
        map.remove();
    }
    
    map = L.map('map').setView([coordinates.lat, coordinates.lon], 13);
    
    // Add map tiles
    L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`, {
        attribution: '© Geoapify © OpenStreetMap contributors',
        maxZoom: 20
    }).addTo(map);
    
    // Add user location marker
    L.marker([coordinates.lat, coordinates.lon], {
        icon: L.divIcon({
            className: 'user-location-marker',
            html: '<i class="fas fa-user" style="color: #667eea; font-size: 20px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map).bindPopup('Your Location');
    
    // Initialize markers group
    markersGroup = L.layerGroup().addTo(map);
}

function addVenuesToMap(venues, userCoords) {
    markersGroup.clearLayers();
    
    venues.forEach((venue, index) => {
        const [lon, lat] = venue.geometry.coordinates;
        const props = venue.properties;
        
        // Create custom marker icon based on venue type
        const icon = getVenueIcon(props.categories);
        
        const marker = L.marker([lat, lon], { icon })
            .bindPopup(createVenuePopup(props, index))
            .on('click', () => highlightVenueCard(index));
        
        markersGroup.addLayer(marker);
    });
    
    // Fit map to show all venues
    if (venues.length > 0) {
        const group = new L.featureGroup([...markersGroup.getLayers(), L.marker([userCoords.lat, userCoords.lon])]);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function getVenueIcon(categories) {
    let iconClass = 'fas fa-map-marker-alt';
    let color = '#667eea';
    
    if (categories) {
        if (categories.some(cat => cat.includes('restaurant') || cat.includes('catering'))) {
            iconClass = 'fas fa-utensils';
            color = '#ff6b6b';
        } else if (categories.some(cat => cat.includes('bar') || cat.includes('pub'))) {
            iconClass = 'fas fa-cocktail';
            color = '#ffa726';
        } else if (categories.some(cat => cat.includes('entertainment') || cat.includes('cinema'))) {
            iconClass = 'fas fa-film';
            color = '#ab47bc';
        } else if (categories.some(cat => cat.includes('sport') || cat.includes('fitness'))) {
            iconClass = 'fas fa-dumbbell';
            color = '#26a69a';
        } else if (categories.some(cat => cat.includes('park') || cat.includes('leisure'))) {
            iconClass = 'fas fa-tree';
            color = '#66bb6a';
        } else if (categories.some(cat => cat.includes('shopping') || cat.includes('commercial'))) {
            iconClass = 'fas fa-shopping-bag';
            color = '#42a5f5';
        }
    }
    
    return L.divIcon({
        className: 'venue-marker',
        html: `<i class="${iconClass}" style="color: ${color}; font-size: 16px;"></i>`,
        iconSize: [25, 25],
        iconAnchor: [12, 12]
    });
}

function createVenuePopup(props, venueIndex) {
    const name = props.name || 'Unnamed Venue';
    const address = props.formatted || 'Address not available';
    const categories = props.categories ? props.categories.slice(0, 3).join(', ') : 'No categories';
    
    return `
        <div class="venue-popup">
            <h4>${name}</h4>
            <p><i class="fas fa-map-marker-alt"></i> ${address}</p>
            <p><i class="fas fa-tags"></i> ${categories}</p>
            <button onclick="showVenueDetails(${venueIndex})" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                <i class="fas fa-info-circle"></i> View Full Details
            </button>
        </div>
    `;
}

function displayVenuesList(venues, userCoords, userProfile) {
    loadingSpinner.classList.add('hidden');
    
    if (venues.length === 0) {
        venuesList.innerHTML = '<div class="no-venues"><p>No venues found for your interests in this area. Try expanding your search radius or selecting different interests.</p></div>';
        return;
    }
    
    // Check if we have enhanced venues from Manhattan
    const hasEnhancedVenues = venues.some(venue => venue.isEnhanced);
    
    // Update summary text
    const demographicSummary = document.getElementById('demographicSummary');
    if (demographicSummary) {
        if (hasEnhancedVenues) {
            demographicSummary.textContent = '🔥 Real-time Manhattan demographics • Updated every 15 minutes';
            demographicSummary.style.color = '#e74c3c';
        } else {
            demographicSummary.textContent = 'Venues sorted by demographic compatibility';
            demographicSummary.style.color = '#667eea';
        }
    }
    
    // Calculate distances and maintain demographic sorting
    const venuesWithDistance = venues.map(venue => {
        const [lon, lat] = venue.geometry.coordinates;
        const distance = calculateDistance(userCoords.lat, userCoords.lon, lat, lon);
        return { ...venue, distance };
    });
    
    const venuesHTML = venuesWithDistance.map((venue, index) => {
        const props = venue.properties;
        const name = props.name || 'Unnamed Venue';
        const address = props.formatted || props.address_line2 || 'Address not available';
        const categories = props.categories || [];
        const distance = venue.distance;
        const demographicScore = venue.demographicScore || 0;
        const isEnhanced = venue.isEnhanced || false;
        
        const categoryTags = categories.slice(0, 3).map(cat => 
            `<span class="category-tag">${formatCategory(cat)}</span>`
        ).join('');
        
        // Calculate demographic match percentage
        const matchPercentage = Math.min(100, Math.round((demographicScore / 1.0) * 100));
        const matchClass = matchPercentage >= 70 ? 'high-match' : matchPercentage >= 40 ? 'medium-match' : 'low-match';
        
        // Real-time demographics display
        let realTimeInfo = '';
        if (isEnhanced && venue.realTimeDemographics) {
            const rtDemo = venue.realTimeDemographics;
            const confidence = Math.round(rtDemo.confidence * 100);
            const neighborhood = rtDemo.neighborhood || 'Unknown';
            const lastUpdated = new Date(rtDemo.lastUpdated).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            realTimeInfo = `
                <div class="real-time-demographics">
                    <div class="real-time-header">
                        <span class="real-time-badge">🔴 LIVE</span>
                        <span class="neighborhood-tag">${neighborhood}</span>
                        <span class="confidence-score">${confidence}% confident</span>
                    </div>
                    <div class="age-distribution">
                        ${formatAgeDistribution(rtDemo.ageDistribution)}
                    </div>
                    <div class="last-updated">Updated: ${lastUpdated}</div>
                </div>
            `;
        }
        
        return `
            <div class="venue-card ${isEnhanced ? 'enhanced' : ''}" data-index="${index}" onclick="selectVenue(${index})">
                <div class="venue-name">${name}</div>
                <div class="demographic-match ${matchClass}">
                    <i class="fas fa-users"></i> ${matchPercentage}% demographic match
                    <span class="demographic-score" title="Demographic Score: ${demographicScore.toFixed(1)}">${demographicScore.toFixed(1)}</span>
                </div>
                ${realTimeInfo}
                <div class="venue-address"><i class="fas fa-map-marker-alt"></i> ${address}</div>
                <div class="venue-categories">${categoryTags}</div>
                <div class="venue-distance"><i class="fas fa-route"></i> ${distance.toFixed(1)} km away</div>
                <button class="venue-details-btn" onclick="event.stopPropagation(); showVenueDetails(${index})">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
            </div>
        `;
    }).join('');
    
    venuesList.innerHTML = venuesHTML;
}

function formatAgeDistribution(ageDistribution) {
    if (!ageDistribution) return '';
    
    // Find the top 3 age groups
    const sortedAges = Object.entries(ageDistribution)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    return sortedAges.map(([ageGroup, percentage]) => {
        const percent = Math.round(percentage * 100);
        return `<span class="age-group-indicator" title="${ageGroup}: ${percent}%">
                    ${ageGroup.replace('-', '‑')}: ${percent}%
                </span>`;
    }).join(' ');
}

function formatCategory(category) {
    return category
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d;
}

function selectVenue(index) {
    // Remove previous selection
    document.querySelectorAll('.venue-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Highlight selected venue
    const selectedCard = document.querySelector(`[data-index="${index}"]`);
    selectedCard.classList.add('selected');
    
    // Center map on selected venue
    const venue = venues[index];
    const [lon, lat] = venue.geometry.coordinates;
    map.setView([lat, lon], 16);
    
    // Open popup for selected venue
    const markers = markersGroup.getLayers();
    if (markers[index]) {
        markers[index].openPopup();
    }
}

function highlightVenueCard(index) {
    const venueCard = document.querySelector(`[data-index="${index}"]`);
    if (venueCard) {
        venueCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectVenue(index);
    }
}

function showOnboarding() {
    resultsSection.classList.add('hidden');
    onboardingSection.classList.remove('hidden');
    
    // Reset form if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoadingOverlay() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoadingOverlay() {
    loadingOverlay.classList.add('hidden');
}

function showVenueDetails(index) {
    const venue = venues[index];
    const props = venue.properties;
    const geometry = venue.geometry;
    
    // Set modal title
    modalVenueName.textContent = props.name || 'Unnamed Venue';
    
    // Build comprehensive details
    const detailsHTML = buildVenueDetailsHTML(props, geometry, venue.distance);
    modalVenueDetails.innerHTML = detailsHTML;
    
    // Show modal
    venueModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeVenueModal() {
    venueModal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function buildVenueDetailsHTML(props, geometry, distance) {
    const sections = [];
    
    // Basic Information Section
    const basicInfo = buildBasicInfoSection(props, geometry, distance);
    if (basicInfo) sections.push(basicInfo);
    
    // Address & Location Section
    const locationInfo = buildLocationSection(props, geometry);
    if (locationInfo) sections.push(locationInfo);
    
    // Categories & Classification Section
    const categoriesInfo = buildCategoriesSection(props);
    if (categoriesInfo) sections.push(categoriesInfo);
    
    // Additional Details Section
    const additionalDetails = buildAdditionalDetailsSection(props);
    if (additionalDetails) sections.push(additionalDetails);
    
    // Data Source Section
    const dataSourceInfo = buildDataSourceSection(props);
    if (dataSourceInfo) sections.push(dataSourceInfo);
    
    // Raw Data Section (for debugging/transparency)
    const rawDataInfo = buildRawDataSection(props);
    if (rawDataInfo) sections.push(rawDataInfo);
    
    return sections.join('');
}

function buildBasicInfoSection(props, geometry, distance) {
    const items = [];
    
    if (props.name) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Name:</span>
                <span class="venue-detail-value">${props.name}</span>
            </div>
        `);
    }
    
    if (distance !== undefined) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Distance:</span>
                <span class="venue-detail-value">${distance.toFixed(2)} km away</span>
            </div>
        `);
    }
    
    if (props.place_id) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Place ID:</span>
                <span class="venue-detail-value" style="font-family: monospace; font-size: 0.9em;">${props.place_id}</span>
            </div>
        `);
    }
    
    if (items.length === 0) return '';
    
    return `
        <div class="venue-detail-section">
            <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
            ${items.join('')}
        </div>
    `;
}

function buildLocationSection(props, geometry) {
    const items = [];
    
    // Formatted address
    if (props.formatted) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Full Address:</span>
                <span class="venue-detail-value">${props.formatted}</span>
            </div>
        `);
    }
    
    // Address components
    const addressComponents = [
        { key: 'street', label: 'Street' },
        { key: 'neighbourhood', label: 'Neighbourhood' },
        { key: 'suburb', label: 'Suburb' },
        { key: 'city', label: 'City' },
        { key: 'municipality', label: 'Municipality' },
        { key: 'county', label: 'County' },
        { key: 'state', label: 'State/Province' },
        { key: 'country', label: 'Country' },
        { key: 'country_code', label: 'Country Code' },
        { key: 'postcode', label: 'Postal Code' }
    ];
    
    addressComponents.forEach(component => {
        if (props[component.key]) {
            items.push(`
                <div class="venue-detail-item">
                    <span class="venue-detail-label">${component.label}:</span>
                    <span class="venue-detail-value">${props[component.key]}</span>
                </div>
            `);
        }
    });
    
    // Coordinates
    if (geometry && geometry.coordinates) {
        const [lon, lat] = geometry.coordinates;
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Coordinates:</span>
                <span class="venue-detail-value">
                    <span class="venue-coordinate">Lat: ${lat.toFixed(6)}</span>
                    <span class="venue-coordinate">Lon: ${lon.toFixed(6)}</span>
                </span>
            </div>
        `);
    }
    
    // Additional location properties
    if (props.lon && props.lat) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Property Coords:</span>
                <span class="venue-detail-value">
                    <span class="venue-coordinate">Lat: ${props.lat}</span>
                    <span class="venue-coordinate">Lon: ${props.lon}</span>
                </span>
            </div>
        `);
    }
    
    if (items.length === 0) return '';
    
    return `
        <div class="venue-detail-section">
            <h3><i class="fas fa-map-marker-alt"></i> Location & Address</h3>
            ${items.join('')}
        </div>
    `;
}

function buildCategoriesSection(props) {
    const items = [];
    
    if (props.categories && props.categories.length > 0) {
        const categoryBadges = props.categories.map(cat => 
            `<span class="venue-category-badge">${formatCategory(cat)}</span>`
        ).join('');
        
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Categories:</span>
                <div class="venue-categories-list">${categoryBadges}</div>
            </div>
        `);
    }
    
    if (props.details && props.details.length > 0) {
        const detailBadges = props.details.map(detail => 
            `<span class="venue-detail-badge">${formatCategory(detail)}</span>`
        ).join('');
        
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Details:</span>
                <div class="venue-details-list">${detailBadges}</div>
            </div>
        `);
    }
    
    if (items.length === 0) return '';
    
    return `
        <div class="venue-detail-section">
            <h3><i class="fas fa-tags"></i> Categories & Classification</h3>
            ${items.join('')}
        </div>
    `;
}

function buildAdditionalDetailsSection(props) {
    const items = [];
    
    // All other properties that aren't covered in other sections
    const excludedKeys = new Set([
        'name', 'formatted', 'street', 'neighbourhood', 'suburb', 'city', 
        'municipality', 'county', 'state', 'country', 'country_code', 'postcode',
        'lat', 'lon', 'categories', 'details', 'datasource', 'place_id', 'distance'
    ]);
    
    Object.keys(props).forEach(key => {
        if (!excludedKeys.has(key) && props[key] !== null && props[key] !== undefined && props[key] !== '') {
            let value = props[key];
            
            // Format value based on type
            if (typeof value === 'object') {
                value = JSON.stringify(value, null, 2);
            } else if (typeof value === 'boolean') {
                value = value ? 'Yes' : 'No';
            }
            
            items.push(`
                <div class="venue-detail-item">
                    <span class="venue-detail-label">${formatLabel(key)}:</span>
                    <span class="venue-detail-value">${value}</span>
                </div>
            `);
        }
    });
    
    if (items.length === 0) return '';
    
    return `
        <div class="venue-detail-section">
            <h3><i class="fas fa-plus-circle"></i> Additional Information</h3>
            ${items.join('')}
        </div>
    `;
}

function buildDataSourceSection(props) {
    if (!props.datasource) return '';
    
    const ds = props.datasource;
    const items = [];
    
    if (ds.sourcename) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Source:</span>
                <span class="venue-detail-value">${ds.sourcename}</span>
            </div>
        `);
    }
    
    if (ds.attribution) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Attribution:</span>
                <span class="venue-detail-value">${ds.attribution}</span>
            </div>
        `);
    }
    
    if (ds.license) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">License:</span>
                <span class="venue-detail-value">${ds.license}</span>
            </div>
        `);
    }
    
    if (ds.url) {
        items.push(`
            <div class="venue-detail-item">
                <span class="venue-detail-label">Source URL:</span>
                <span class="venue-detail-value"><a href="${ds.url}" target="_blank">${ds.url}</a></span>
            </div>
        `);
    }
    
    if (items.length === 0) return '';
    
    return `
        <div class="venue-detail-section">
            <h3><i class="fas fa-database"></i> Data Source</h3>
            ${items.join('')}
        </div>
    `;
}

function buildRawDataSection(props) {
    const rawData = JSON.stringify(props, null, 2);
    
    return `
        <div class="venue-detail-section">
            <h3><i class="fas fa-code"></i> Raw Data (Developer View)</h3>
            <div class="venue-detail-item">
                <details>
                    <summary style="cursor: pointer; font-weight: 600; color: #667eea;">
                        <i class="fas fa-chevron-right"></i> Show Raw JSON Data
                    </summary>
                    <pre style="background: #f5f5f5; padding: 1rem; border-radius: 8px; overflow-x: auto; margin-top: 1rem; font-size: 0.85rem; max-height: 300px; overflow-y: auto;">${rawData}</pre>
                </details>
            </div>
        </div>
    `;
}

function formatLabel(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Add some CSS for custom markers
const style = document.createElement('style');
style.textContent = `
    .venue-marker {
        background: white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
    }
    
    .user-location-marker {
        background: white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
    }
    
    .venue-popup h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
    }
    
    .venue-popup p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        color: #666;
    }
    
    .venue-popup i {
        margin-right: 0.5rem;
        color: #667eea;
    }
    
    .no-venues {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
`;
document.head.appendChild(style);
