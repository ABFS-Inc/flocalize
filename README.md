# Flocalize - Where Your Crowd is Flocking To

A modern web application that helps users discover local venues based on their interests and demographics. Flocalize uses the powerful Geoapify Places API to find the perfect spots where people with similar interests gather.

## 🌟 Features

### User-Centric Discovery
- **Interest-Based Matching**: Select from 6 categories of interests including Entertainment & Nightlife, Food & Dining, Sports & Fitness, Leisure & Relaxation, Shopping & Lifestyle, and Learning & Community
- **Demographic Profiling**: Age group and lifestyle preferences to fine-tune recommendations
- **Smart Location Input**: Manual address entry or automatic geolocation detection

### Interactive Experience
- **Live Map Integration**: Interactive map powered by Geoapify showing all venue recommendations
- **Distance-Based Results**: Venues sorted by proximity with accurate distance calculations
- **Custom Map Markers**: Category-specific icons (restaurants, bars, entertainment, sports, etc.)
- **Venue Details**: Comprehensive information including address, categories, and distance

### Responsive Design
- **Mobile-First**: Optimized for both desktop and mobile browsers
- **Modern UI**: Clean, gradient-based design with smooth animations
- **Intuitive Navigation**: Easy-to-use forms and interactive elements

## 🚀 Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Mapping**: Leaflet.js with Geoapify tiles
- **API Integration**: Geoapify Places API & Geocoding API
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Font Awesome

## 🎯 How It Works

1. **User Input**: Users fill out their demographics (age, lifestyle) and select interests from various categories
2. **Location Detection**: Either manual address input or GPS-based current location
3. **API Processing**: The app converts user interests to Geoapify place categories and searches within the specified radius
4. **Results Display**: Found venues are displayed on an interactive map and in a sortable list
5. **Venue Selection**: Users can click on map markers or venue cards to get detailed information

## 🗺️ Interest Categories Mapping

The app intelligently maps user interests to Geoapify API categories:

- **Entertainment & Nightlife**: `entertainment.culture`, `entertainment.nightclub`, `entertainment.cinema`, etc.
- **Food & Dining**: `catering.restaurant`, `catering.cafe`, `catering.bar`, etc.
- **Sports & Fitness**: `sport.fitness`, `sport.swimming`, `leisure.sports_centre`, etc.
- **Leisure & Relaxation**: `leisure.park`, `leisure.spa`, `tourism.sights`, etc.
- **Shopping & Lifestyle**: `commercial.shopping_mall`, `commercial.marketplace`, etc.
- **Learning & Community**: `education.library`, `activity.community_centre`, etc.

## 🔧 Setup and Usage

1. **Clone/Download**: Get the project files
2. **API Key**: The Geoapify API key is already included for demo purposes
3. **Serve**: Open `index.html` in a web browser or serve from a local web server
4. **Use**: Fill out the form and discover venues in your area!

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔑 API Integration

Uses Geoapify's powerful APIs:
- **Places API**: For finding venues by category and location
- **Geocoding API**: For converting addresses to coordinates
- **Reverse Geocoding**: For converting GPS coordinates to addresses
- **Map Tiles**: For the interactive map display

## 📱 Responsive Features

- **Desktop**: Side-by-side map and venue list layout
- **Mobile**: Stacked layout with touch-friendly interactions
- **Tablet**: Optimized for medium screen sizes

## 🎨 Design Highlights

- **Gradient Backgrounds**: Modern purple-to-blue gradients
- **Card-Based Layout**: Clean, organized information display
- **Interactive Elements**: Hover effects and smooth transitions
- **Color-Coded Markers**: Different icons and colors for venue types
- **Loading States**: Smooth loading animations and feedback

## 🚀 Future Enhancements

- User accounts and saved preferences
- Social features and ratings
- Real-time venue popularity data
- Advanced filtering options
- Event-based recommendations
- Integration with social media check-ins

## 📄 License

This project is created for demonstration purposes. Please ensure you have appropriate Geoapify API usage rights for production use.

---

**Built with ❤️ using Geoapify APIs**
