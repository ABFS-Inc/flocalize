# 📊 Instagram API Raw Data Examples - Official Documentation

## 🔍 **Official Instagram API Response Examples**

Based on official Meta/Facebook Developer documentation, here are the actual raw data structures and examples you can expect from Instagram's APIs.

---

## 📱 **1. Instagram Graph API (Business/Creator Accounts)**

### **A. User Profile Data (`GET /<IG_USER_ID>`)**

**Example Request:**
```bash
curl -X GET \
  'https://graph.facebook.com/v23.0/17841405822304914?fields=biography,id,username,website,followers_count,follows_count,media_count&access_token=EAACwX...'
```

**Example Response:**
```json
{
  "biography": "Dino data crunching app",
  "id": "17841405822304914",
  "username": "metricsaurus",
  "website": "http://www.metricsaurus.com/",
  "followers_count": 1284,
  "follows_count": 312,
  "media_count": 147
}
```

**Available User Fields:**
```json
{
  "account_type": "BUSINESS",
  "biography": "Your bio text here",
  "followers_count": 1284,
  "follows_count": 312,
  "id": "17841405822304914",
  "ig_id": 1234567890,
  "media_count": 147,
  "name": "Display Name",
  "profile_picture_url": "https://instagram.fxxx-x.fna.fbcdn.net/...",
  "username": "your_username",
  "website": "https://yourwebsite.com"
}
```

---

### **B. Media Object Data (`GET /<IG_MEDIA_ID>`)**

**Example Request:**
```bash
curl -X GET \
  'https://graph.instagram.com/v23.0/17895695668004550?fields=id,media_type,media_url,owner,timestamp,caption,permalink,comments_count,like_count&access_token=IGQVJ...'
```

**Example Response:**
```json
{
  "id": "17918920912340654",
  "media_type": "IMAGE",
  "media_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.29350-15/...",
  "owner": {
    "id": "17841405309211844"
  },
  "timestamp": "2019-09-26T22:36:43+0000",
  "caption": "Beautiful sunset at Central Park! #nyc #sunset #centralpark",
  "permalink": "https://www.instagram.com/p/B3G8xyzF6Hy/",
  "comments_count": 23,
  "like_count": 157
}
```

**Video Media Example:**
```json
{
  "id": "17889498072083520",
  "media_type": "VIDEO",
  "media_url": "https://video-iad3-2.cdninstagram.com/v/t50.2886-16/...",
  "thumbnail_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.29350-15/...",
  "permalink": "https://www.instagram.com/p/B3H9xyzF8Qz/",
  "caption": "Amazing timelapse of Manhattan! #manhattan #timelapse #nyc",
  "timestamp": "2019-09-27T14:22:15+0000",
  "comments_count": 45,
  "like_count": 289,
  "owner": {
    "id": "17841405309211844"
  }
}
```

**Carousel (Multiple Images) Example:**
```json
{
  "id": "17901398872083001",
  "media_type": "CAROUSEL_ALBUM",
  "permalink": "https://www.instagram.com/p/B3J1xyzF9Pq/",
  "caption": "Best spots in SoHo! Swipe to see them all 📸",
  "timestamp": "2019-09-28T16:45:22+0000",
  "comments_count": 67,
  "like_count": 432,
  "children": {
    "data": [
      {
        "id": "17902301472083445",
        "media_type": "IMAGE",
        "media_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.29350-15/..."
      },
      {
        "id": "17903245872083889",
        "media_type": "IMAGE", 
        "media_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.29350-15/..."
      }
    ]
  }
}
```

---

### **C. Media Collection (`GET /<IG_USER_ID>/media`)**

**Example Request:**
```bash
curl -X GET \
  'https://graph.facebook.com/v23.0/17841405822304914/media?fields=id,media_type,media_url,timestamp,caption&limit=25&access_token=EAACwX...'
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "17918920912340654",
      "media_type": "IMAGE",
      "media_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.29350-15/...",
      "timestamp": "2019-09-26T22:36:43+0000",
      "caption": "Beautiful sunset at Central Park! #nyc #sunset #centralpark"
    },
    {
      "id": "17889498072083520", 
      "media_type": "VIDEO",
      "media_url": "https://video-iad3-2.cdninstagram.com/v/t50.2886-16/...",
      "timestamp": "2019-09-25T18:22:15+0000",
      "caption": "Coffee break at my favorite SoHo spot ☕ #coffee #soho #worklife"
    },
    {
      "id": "17901398872083001",
      "media_type": "CAROUSEL_ALBUM",
      "timestamp": "2019-09-24T12:45:22+0000",
      "caption": "Weekend brunch spots in Greenwich Village 🥞 #brunch #village #foodie"
    }
  ],
  "paging": {
    "cursors": {
      "before": "QVFIUmZA0c2FuOXJoSDNTbE1nVF9UZAZDZD",
      "after": "QVFIUmZA0c2FuOXJoSDNTbE1nVF9UZAZDyT"
    },
    "next": "https://graph.instagram.com/v23.0/17841405822304914/media?access_token=EAACwX...&limit=25&after=QVFIUmZA0c2FuOXJoSDNTbE1nVF9UZAZDyT"
  }
}
```

---

### **D. Comments Data (`GET /<IG_MEDIA_ID>/comments`)**

**Example Response:**
```json
{
  "data": [
    {
      "id": "17894560412083912",
      "text": "Amazing shot! 📸",
      "timestamp": "2019-09-26T23:15:33+0000",
      "from": {
        "id": "17841401234567890",
        "username": "photography_lover"
      }
    },
    {
      "id": "17895123456083445",
      "text": "Where exactly is this in Central Park?",
      "timestamp": "2019-09-27T08:22:15+0000", 
      "from": {
        "id": "17841409876543210",
        "username": "nyc_explorer"
      },
      "replies": {
        "data": [
          {
            "id": "17896789012083778",
            "text": "@nyc_explorer It's near Bethesda Fountain!",
            "timestamp": "2019-09-27T09:15:42+0000",
            "from": {
              "id": "17841405822304914",
              "username": "metricsaurus"
            }
          }
        ]
      }
    }
  ],
  "paging": {
    "cursors": {
      "before": "MTczNDU2Nzg5",
      "after": "MTczNDU2Nzg5"
    }
  }
}
```

---

### **E. Hashtag Search (`GET /ig_hashtag_search`)**

**Example Request:**
```bash
curl -X GET \
  'https://graph.facebook.com/v23.0/ig_hashtag_search?user_id=17841405822304914&q=centralpark&access_token=EAACwX...'
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "17873440965854094",
      "name": "centralpark"
    },
    {
      "id": "17873440968754321", 
      "name": "centralparknyc"
    },
    {
      "id": "17873440961254789",
      "name": "centralparkwest"
    }
  ]
}
```

---

### **F. Hashtag Recent Media (`GET /<IG_HASHTAG_ID>/recent_media`)**

**Example Response:**
```json
{
  "data": [
    {
      "id": "17918920912340654",
      "media_type": "IMAGE",
      "media_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.29350-15/...",
      "permalink": "https://www.instagram.com/p/B3G8xyzF6Hy/",
      "timestamp": "2019-09-26T22:36:43+0000",
      "caption": "Beautiful sunset at Central Park! #centralpark #nyc",
      "comments_count": 23,
      "like_count": 157
    },
    {
      "id": "17889498072083520",
      "media_type": "VIDEO", 
      "media_url": "https://video-iad3-2.cdninstagram.com/v/t50.2886-16/...",
      "permalink": "https://www.instagram.com/p/B3H9xyzF8Qz/",
      "timestamp": "2019-09-25T18:22:15+0000",
      "caption": "Morning jog through Central Park 🏃‍♂️ #centralpark #running",
      "comments_count": 12,
      "like_count": 89
    }
  ]
}
```

---

## 🔧 **2. Instagram Basic Display API (Personal Accounts)**

### **A. User Profile (`GET /me`)**

**Example Response:**
```json
{
  "id": "17841405822304914",
  "username": "your_username",
  "account_type": "PERSONAL",
  "media_count": 147
}
```

### **B. User Media (`GET /me/media`)**

**Example Response:**
```json
{
  "data": [
    {
      "id": "17918920912340654",
      "caption": "Sunset at the Brooklyn Bridge 🌅 #brooklyn #sunset",
      "media_type": "IMAGE",
      "media_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.29350-15/...",
      "permalink": "https://www.instagram.com/p/B3G8xyzF6Hy/",
      "timestamp": "2019-09-26T22:36:43+0000"
    },
    {
      "id": "17889498072083520",
      "caption": "Late night pizza in Little Italy 🍕",
      "media_type": "VIDEO",
      "media_url": "https://video-iad3-2.cdninstagram.com/v/t50.2886-16/...",
      "thumbnail_url": "https://scontent-iad3-2.cdninstagram.com/v/t51.29350-15/...",
      "permalink": "https://www.instagram.com/p/B3H9xyzF8Qz/",
      "timestamp": "2019-09-25T20:15:28+0000"
    }
  ],
  "paging": {
    "cursors": {
      "before": "QVFIUmZA0c2FuOXJoSDNTbE1nVF9UZAZDZD",
      "after": "QVFIUmZA0c2FuOXJoSDNTbE1nVF9UZAZDyT"
    },
    "next": "https://graph.instagram.com/me/media?access_token=IGQWRpbnV3..."
  }
}
```

---

## 🚨 **3. Important Data Limitations**

### **What Instagram APIs DON'T Provide:**

❌ **Location Demographics:**
```json
// This data structure DOES NOT EXIST
{
  "location_id": "123456789",
  "demographics": {
    "age_groups": {
      "18_24": 0.25,
      "25_34": 0.35
    },
    "gender": {
      "male": 0.45,
      "female": 0.55
    }
  }
}
```

❌ **User Demographics:**
```json
// This data structure DOES NOT EXIST
{
  "user_id": "17841405822304914",
  "age": 28,
  "gender": "female",
  "location": "Manhattan, NY"
}
```

❌ **Venue Check-ins:**
```json
// This data structure DOES NOT EXIST
{
  "venue_id": "blue-bottle-soho",
  "visitors": [
    {
      "user_id": "17841405822304914",
      "visit_time": "2019-09-26T14:30:00+0000",
      "demographics": {...}
    }
  ]
}
```

---

## 🎯 **4. What We CAN Extract for Demographics**

### **A. Caption and Hashtag Analysis:**

**Raw Post Data:**
```json
{
  "id": "17918920912340654",
  "caption": "Perfect date night spot in SoHo! 💕 The ambiance is amazing and the wine selection is incredible. Can't wait to come back with @boyfriend_username #datenight #soho #wine #couples #romantic #manhattan #nyc #foodie",
  "timestamp": "2019-09-26T19:30:43+0000",
  "location": {
    "id": "106078429456722",
    "name": "SoHo, New York"
  }
}
```

**What We Can Infer:**
```javascript
const demographicIndicators = {
  ageGroup: "25-34", // "date night", "wine" suggests adult demographics
  gender: "likely_female", // "Perfect spot", emotional language patterns
  relationshipStatus: "in_relationship", // "@boyfriend_username", "date night"
  lifestyle: "foodie", // #foodie, detailed food descriptions
  economicLevel: "moderate_to_high", // SoHo location, wine focus
  socialContext: "romantic", // #datenight, #couples, #romantic
  visitPurpose: "leisure"
};
```

### **B. Posting Time Patterns:**

**Raw Timestamp Data:**
```json
{
  "business_posts": [
    {
      "timestamp": "2019-09-26T12:15:43+0000", // Lunch hour
      "caption": "Quick lunch meeting at..."
    },
    {
      "timestamp": "2019-09-26T19:30:43+0000", // Evening
      "caption": "Date night at..."
    },
    {
      "timestamp": "2019-09-27T08:45:22+0000", // Morning
      "caption": "Coffee before work..."
    }
  ]
}
```

**What We Can Infer:**
```javascript
const timePatterns = {
  morningPosts: "working_professional", // 8-9 AM posts suggest commuter
  lunchPosts: "business_context", // 12-1 PM suggests lunch meetings
  eveningPosts: "social_leisure", // 7-9 PM suggests dining/entertainment
  weekendPosts: "leisure_lifestyle" // Saturday/Sunday different patterns
};
```

---

## 📊 **5. Error Response Examples**

### **Rate Limit Exceeded:**
```json
{
  "error": {
    "message": "Application request limit reached",
    "type": "OAuthException",
    "code": 4,
    "error_subcode": 2446079,
    "fbtrace_id": "A2wpnpKR5rWpCzPN7J6UEaW"
  }
}
```

### **Invalid Access Token:**
```json
{
  "error": {
    "message": "Invalid OAuth access token.",
    "type": "OAuthException", 
    "code": 190,
    "fbtrace_id": "Ak7rSVGAhXmJ0cQG9xP4Hgs"
  }
}
```

### **Missing Permissions:**
```json
{
  "error": {
    "message": "Unsupported get request. Object with ID '17841405822304914' does not exist, cannot be loaded due to missing permissions, or does not support this operation.",
    "type": "GraphMethodException",
    "code": 100,
    "fbtrace_id": "B3m7zGvVn4yJ8cW2N9K1PoQ"
  }
}
```

---

## 🔑 **6. Authentication Response Examples**

### **Access Token Response:**
```json
{
  "access_token": "IGQWRpbnV3aDdOZAWEtc2kzcWxMcTNFS05UZAV3b1VGY2ZANaWgyUDk3aG5zVmlSMmxXR1ZAXWTQ3clFGdXJMaVRPOFgZAlBabklHNGdmek55eVZAMa2RJaFR0aXViSTFib1ExaUw",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### **Long-Lived Token Exchange:**
```json
{
  "access_token": "IGQWRpbnV3aDdOZAWEtc2kzcWxMcTNFS05UZAV3b1VGY2ZANaWgyUDk3aG5zVmlSMmxXR1ZAXWTQ3clFGdXJMaVRPOFgZAlBabklHNGdmek55eVZAMa2RJaFR0aXViSTFib1ExaUw",
  "token_type": "bearer",
  "expires_in": 5184000
}
```

---

## 💡 **7. Practical Usage in Our Flocalize App**

### **A. Location-Tagged Post Search:**
```javascript
// Search for posts with location tags in Manhattan
const searchLocationPosts = async (locationName) => {
  const hashtagResponse = await fetch(`https://graph.instagram.com/v23.0/ig_hashtag_search?user_id=${userId}&q=${locationName}&access_token=${accessToken}`);
  
  // Get recent media for location-related hashtags
  const mediaResponse = await fetch(`https://graph.instagram.com/v23.0/${hashtagId}/recent_media?fields=id,caption,timestamp,comments_count,like_count&access_token=${accessToken}`);
  
  return mediaResponse.json();
};
```

### **B. Demographic Pattern Analysis:**
```javascript
// Analyze posting patterns for demographic insights
const analyzeDemographics = (posts) => {
  const patterns = {
    ageIndicators: [],
    genderIndicators: [],
    lifestyleIndicators: [],
    economicIndicators: []
  };
  
  posts.forEach(post => {
    // Analyze caption for demographic clues
    if (post.caption.includes('#datenight') || post.caption.includes('#romantic')) {
      patterns.lifestyleIndicators.push('couples_oriented');
    }
    
    if (post.caption.includes('#business') || post.caption.includes('#meeting')) {
      patterns.lifestyleIndicators.push('professional');
    }
    
    // Analyze posting time
    const hour = new Date(post.timestamp).getHours();
    if (hour >= 9 && hour <= 17) {
      patterns.lifestyleIndicators.push('working_hours');
    }
  });
  
  return patterns;
};
```

---

## 📈 **Summary: Data Available vs. Needed**

### **✅ Available from Instagram API:**
- Individual post content and metadata
- Hashtag-based location search
- Public comments and interactions
- Posting time patterns
- Caption text for analysis

### **❌ NOT Available from Instagram API:**
- Direct age/gender demographics
- Venue visitor demographics
- Real-time crowd analysis
- Income level data
- Precise location check-ins

### **🔧 Our Solution Strategy:**
1. **Extract**: Available Instagram data (posts, hashtags, timing)
2. **Analyze**: Content patterns for demographic indicators
3. **Combine**: With commercial APIs (SafeGraph, Foursquare) for actual demographics
4. **Enhance**: With machine learning for pattern recognition

**This is why our Flocalize app uses multiple data sources - Instagram alone cannot provide the venue demographics we need, but it can provide valuable contextual and lifestyle indicators that we combine with other commercial data sources.**
