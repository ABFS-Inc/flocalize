
# Flocalize Project Context

## Project Overview
**Flocalize** is an advanced venue discovery web application that uses demographic profiling and intelligent mapping to help users find local venues where people with similar interests and demographics gather. The tagline "Where your crowd is flocking to" captures its core mission of connecting users with venues that match their demographic profile and interests.

## Core Functionality
The application combines user demographics (age, gender, lifestyle) with interest preferences across six categories (Entertainment & Nightlife, Food & Dining, Sports & Fitness, Leisure & Relaxation, Shopping & Lifestyle, Learning & Community) to recommend venues using sophisticated scoring algorithms. Users can input their location manually or use GPS detection, and the app displays results on an interactive Leaflet.js map with distance-based sorting and category-specific markers.

## Technology Architecture
Built with **vanilla JavaScript, HTML5, and CSS3**, the application integrates multiple APIs including Geoapify Places API for venue discovery, geocoding, and map tiles. The frontend features a modern responsive design with gradient-based styling, Font Awesome icons, and mobile-first optimization. A secure configuration system (`config.js`) manages API keys through environment variables and localStorage fallbacks, replacing previously exposed hardcoded credentials. The backend leverages **Python** for data processing and management, utilizing Large Language Models (LLMs) to intelligently curate, analyze, and manage demographic data from multiple sources, ensuring high-quality data refinement and contextual understanding of venue and event information.

## Advanced Demographics Engine
The project includes sophisticated demographic analysis capabilities, particularly for Manhattan venues. The `manhattan-demographics-engine.js` implements real-time demographic profiling using multiple data sources: SafeGraph (35% weight), Foursquare (25%), Instagram analysis (20%), Google Places (15%), and Census data (5%). The `demographics-analyzer.js` provides venue appeal scoring based on review patterns, visit times, social media analysis, and location demographics with confidence weighting and temporal analysis.

## Security & Compliance
Security has been thoroughly addressed with the removal of exposed API keys, implementation of `.gitignore` protection, comprehensive security guidelines, and environment variable management. The system includes privacy-compliant demographic data handling with anonymization, GDPR/CCPA compliance features, user opt-out capabilities, and bias prevention measures in recommendation algorithms.

## Data Sources & Integration
The application is designed to integrate with commercial APIs including SafeGraph for foot traffic data, Foursquare for venue and user preference data, Instagram for location-based content analysis, Google Places for review sentiment, and Census APIs for neighborhood demographics. Cost optimization features include intelligent caching, request batching, and confidence-based data source selection.

## Event & Venue Intelligence
The app incorporates advanced web scraping capabilities to discover audience demographics for events and venues from trustworthy sources. This includes analyzing artist and band audience demographics, venue location patterns, historical venue audience data, and cross-referencing multiple data points to build comprehensive audience profiles. The system can intelligently correlate event lineups with known artist fanbases, venue reputation with typical clientele, and geographic factors to predict and recommend events that match user demographics and interests.

## Community Collaboration Features
Flocalize includes a comprehensive community-driven data platform where users actively contribute to and curate event information. The system features a simple event submission page allowing users to manually add events with detailed demographic and venue information, fostering collaborative data building for the community. Users can also contribute and vote on data sources, suggesting new websites and APIs for the app to monitor for event discovery. The platform implements a democratic voting system where community members can rate the quality and reliability of both event data and data sources, ensuring high-quality, crowd-verified information. Users have access to sophisticated event browsing capabilities, including filterable table views and interactive map displays, allowing them to cherry-pick events based on demographics, location, date, genre, and community ratings.
