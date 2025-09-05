# Data Source Granularity Examples for Age-Gender Pyramid Analysis

## 🔍 **Expected Information Granularity by Data Source**

This document provides real examples of the demographic data granularity you can expect from each data source for age-gender pyramid analysis.

---

## 1. 📊 **SafeGraph Mobility Data** (Primary Source)

### **Granularity Level: VERY HIGH**
**Sample API Response for "Blue Bottle Coffee, SoHo":**

```json
{
  "place_id": "sg:abc123def456",
  "place_name": "Blue Bottle Coffee",
  "location": {"lat": 40.7230, "lon": -74.0030},
  "date_range": "2025-07-12 to 2025-07-19",
  "visitor_demographics": {
    "age_distribution": {
      "18_24": 0.15,      // 15% of visitors aged 18-24
      "25_29": 0.22,      // 22% of visitors aged 25-29
      "30_34": 0.28,      // 28% of visitors aged 30-34
      "35_39": 0.18,      // 18% of visitors aged 35-39
      "40_44": 0.10,      // 10% of visitors aged 40-44
      "45_49": 0.04,      // 4% of visitors aged 45-49
      "50_54": 0.02,      // 2% of visitors aged 50-54
      "55_plus": 0.01     // 1% of visitors aged 55+
    },
    "gender_distribution": {
      "male": 0.42,       // 42% male visitors
      "female": 0.58      // 58% female visitors
    },
    "income_distribution": {
      "under_50k": 0.12,
      "50k_75k": 0.25,
      "75k_100k": 0.35,
      "100k_150k": 0.20,
      "over_150k": 0.08
    }
  },
  "visit_patterns": {
    "hourly_visits": {
      "monday": [5, 8, 15, 25, 35, 45, 52, 48, 42, 35, 28, 22, 18, 15, 12, 8, 6, 4, 3, 2, 1, 1, 1, 2],
      "tuesday": [4, 7, 14, 28, 38, 47, 55, 51, 44, 36, 29, 24, 19, 16, 13, 9, 7, 5, 3, 2, 1, 1, 1, 2],
      // ... other days
    },
    "demographic_by_hour": {
      "08:00": {"18_24": 0.08, "25_29": 0.18, "30_34": 0.35, "35_39": 0.25, "female": 0.52},
      "12:00": {"18_24": 0.12, "25_29": 0.25, "30_34": 0.28, "35_39": 0.20, "female": 0.61},
      "17:00": {"18_24": 0.18, "25_29": 0.28, "30_34": 0.25, "35_39": 0.15, "female": 0.55}
    }
  },
  "device_counts": {
    "total_devices": 2847,
    "unique_visitors": 1923,
    "repeat_visitors": 924
  },
  "confidence_score": 0.92
}
```

**What This Tells Us:**
- **Precision**: 5-year age buckets, exact gender split
- **Temporal**: Hour-by-hour demographic changes
- **Economic**: Income levels of visitors
- **Behavioral**: Visit frequency and duration patterns
- **Confidence**: Statistical reliability score

---

## 2. 🏢 **Foursquare Places API** (Secondary Source)

### **Granularity Level: HIGH**
**Sample API Response for "Joe's Pizza, Greenwich Village":**

```json
{
  "fsq_id": "4b123abc456def",
  "name": "Joe's Pizza",
  "location": {"lat": 40.7335, "lon": -74.0027},
  "stats": {
    "total_checkins": 15420,
    "unique_visitors": 8934,
    "tips_count": 847,
    "photos_count": 2156
  },
  "demographics": {
    "age_breakdown": {
      "under_25": 0.28,    // 28% under 25
      "25_34": 0.45,       // 45% aged 25-34
      "35_44": 0.18,       // 18% aged 35-44
      "45_plus": 0.09      // 9% aged 45+
    },
    "gender_split": {
      "male": 0.52,
      "female": 0.48
    }
  },
  "popular_hours": {
    "monday": [
      {"hour": 11, "popularity": 25, "demographic_skew": {"25_34": 0.6, "male": 0.48}},
      {"hour": 12, "popularity": 85, "demographic_skew": {"25_34": 0.52, "male": 0.55}},
      {"hour": 13, "popularity": 78, "demographic_skew": {"25_34": 0.48, "male": 0.53}},
      {"hour": 19, "popularity": 92, "demographic_skew": {"under_25": 0.35, "male": 0.49}}
    ]
  },
  "user_analysis": {
    "mayorships": 156,
    "power_users": 89,    // Users with 50+ checkins
    "tourists_vs_locals": {
      "tourists": 0.35,
      "locals": 0.65
    }
  },
  "tips_analysis": {
    "sentiment_by_age": {
      "under_25": {"positive": 0.78, "neutral": 0.15, "negative": 0.07},
      "25_34": {"positive": 0.82, "neutral": 0.12, "negative": 0.06},
      "35_44": {"positive": 0.85, "neutral": 0.11, "negative": 0.04}
    },
    "language_indicators": {
      "work_related": 0.23,    // Tips mentioning work/business
      "date_night": 0.18,      // Tips mentioning dates/romance
      "family": 0.12,          // Tips mentioning family/kids
      "friends": 0.47          // Tips mentioning friends/groups
    }
  }
}
```

**What This Tells Us:**
- **Social Behavior**: Check-in patterns by demographics
- **Sentiment**: How different age groups feel about venues
- **Context**: Work vs. social vs. family visits
- **Local vs. Tourist**: Visitor origin patterns

---

## 3. 📸 **Instagram Location Data** (Tertiary Source)

### **Granularity Level: MEDIUM-HIGH**
**Sample Analysis for "The High Line, Chelsea":**

```json
{
  "location_id": "213385402",
  "location_name": "The High Line",
  "analysis_period": "2025-07-12 to 2025-07-19",
  "posts_analyzed": 1247,
  "demographic_analysis": {
    "estimated_age_distribution": {
      "18_24": 0.32,       // Based on profile analysis
      "25_29": 0.28,
      "30_34": 0.22,
      "35_39": 0.12,
      "40_plus": 0.06
    },
    "estimated_gender_split": {
      "male": 0.38,
      "female": 0.58,
      "non_binary": 0.04
    },
    "confidence_level": 0.68
  },
  "content_analysis": {
    "hashtag_demographics": {
      "#workfromanywhere": {"age_skew": "25_34", "gender_skew": "female", "count": 89},
      "#datenight": {"age_skew": "25_29", "gender_skew": "mixed", "count": 156},
      "#familytime": {"age_skew": "35_39", "gender_skew": "female", "count": 67},
      "#girlstrip": {"age_skew": "18_24", "gender_skew": "female", "count": 203},
      "#businessmeeting": {"age_skew": "30_34", "gender_skew": "male", "count": 34}
    },
    "posting_patterns": {
      "weekend_vs_weekday": {
        "weekend": {"18_24": 0.41, "25_29": 0.31, "female": 0.62},
        "weekday": {"25_34": 0.38, "30_34": 0.28, "male": 0.45}
      },
      "time_of_day": {
        "morning": {"35_plus": 0.45, "family_indicators": 0.28},
        "afternoon": {"25_34": 0.42, "work_indicators": 0.35},
        "evening": {"18_24": 0.38, "social_indicators": 0.67}
      }
    }
  },
  "lifestyle_indicators": {
    "fashion_focused": 0.34,     // Style/outfit posts
    "food_focused": 0.28,        // Food photography
    "fitness_focused": 0.19,     // Workout/health posts
    "travel_focused": 0.41,      // Tourism/exploration
    "professional": 0.15         // Business/networking posts
  },
  "visual_analysis": {
    "group_composition": {
      "solo": 0.23,
      "couple": 0.31,
      "small_group": 0.38,
      "large_group": 0.08
    },
    "estimated_spending_level": {
      "budget": 0.22,
      "moderate": 0.51,
      "premium": 0.27
    }
  }
}
```

**What This Tells Us:**
- **Lifestyle Context**: Why people visit (work, date, family)
- **Social Patterns**: Solo vs. group visits by demographics
- **Temporal Behavior**: When different demographics post
- **Economic Indicators**: Spending patterns from visual cues

---

## 4. 🗺️ **Google Places API** (Supporting Source)

### **Granularity Level: MEDIUM**
**Sample Analysis for "Katz's Delicatessen, Lower East Side":**

```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "name": "Katz's Delicatessen",
  "demographics_from_reviews": {
    "review_analysis": {
      "total_reviews": 8947,
      "reviews_analyzed": 2000,
      "age_indicators": {
        "young_adult": 0.28,     // Language patterns indicating 18-29
        "adult": 0.45,           // Language patterns indicating 30-45
        "mature": 0.27           // Language patterns indicating 45+
      },
      "gender_indicators": {
        "male_language": 0.51,
        "female_language": 0.49
      },
      "visitor_type": {
        "tourists": 0.67,       // Mentions tourism, "visiting NYC"
        "locals": 0.33          // Mentions "neighborhood", "regular"
      }
    },
    "review_keywords_by_demographic": {
      "young_adult": ["instagram", "date", "friends", "cool", "trendy"],
      "adult": ["family", "tradition", "authentic", "quality", "experience"],
      "mature": ["nostalgic", "classic", "memories", "historical", "old-school"]
    }
  },
  "popular_times": {
    "live_data": {
      "current_popularity": 78,
      "typical_wait_time": "45-60 minutes"
    },
    "weekly_pattern": {
      "monday": [12, 15, 25, 35, 45, 55, 65, 75, 78, 65, 45, 35],
      "demographic_overlay": {
        "weekday_lunch": {"adult": 0.52, "business_context": 0.34},
        "weekend_dinner": {"young_adult": 0.41, "tourist": 0.73}
      }
    }
  },
  "price_level": 2,           // $$ (moderate)
  "rating": 4.3,
  "review_sentiment_by_age": {
    "young_adult": {"rating_avg": 4.1, "mentions_wait": 0.67, "mentions_atmosphere": 0.78},
    "adult": {"rating_avg": 4.4, "mentions_tradition": 0.82, "mentions_value": 0.45},
    "mature": {"rating_avg": 4.6, "mentions_nostalgia": 0.89, "mentions_authenticity": 0.91}
  }
}
```

**What This Tells Us:**
- **Language Analysis**: Age/gender patterns in review language
- **Context Clues**: Tourist vs. local, business vs. leisure
- **Satisfaction Patterns**: How different demographics rate venues
- **Wait Tolerance**: Age-related patience levels

---

## 5. 📈 **US Census API** (Baseline Source)

### **Granularity Level: VERY HIGH (Area-Based)**
**Sample Data for "Census Tract 74, Manhattan (SoHo Area)":**

```json
{
  "geography": {
    "tract": "007400",
    "county": "061",
    "state": "36",
    "name": "SoHo/Nolita Area",
    "coordinates": {"lat": 40.7230, "lon": -74.0030}
  },
  "demographics": {
    "total_population": 4782,
    "age_distribution": {
      "under_18": 0.08,        // 8% under 18
      "18_24": 0.12,           // 12% aged 18-24
      "25_29": 0.18,           // 18% aged 25-29
      "30_34": 0.22,           // 22% aged 30-34
      "35_39": 0.16,           // 16% aged 35-39
      "40_44": 0.12,           // 12% aged 40-44
      "45_54": 0.08,           // 8% aged 45-54
      "55_64": 0.03,           // 3% aged 55-64
      "65_plus": 0.01          // 1% aged 65+
    },
    "gender_distribution": {
      "male": 0.48,
      "female": 0.52
    },
    "detailed_age_gender": {
      "male_18_24": 0.055,     // 5.5% of total population
      "female_18_24": 0.065,   // 6.5% of total population
      "male_25_29": 0.085,     // 8.5% of total population
      "female_25_29": 0.095,   // 9.5% of total population
      "male_30_34": 0.105,     // 10.5% of total population
      "female_30_34": 0.115    // 11.5% of total population
      // ... continues for all age groups
    }
  },
  "economic_indicators": {
    "median_household_income": 127500,
    "income_distribution": {
      "under_25k": 0.08,
      "25k_50k": 0.12,
      "50k_75k": 0.15,
      "75k_100k": 0.18,
      "100k_150k": 0.25,
      "150k_200k": 0.14,
      "over_200k": 0.08
    },
    "employment_by_age": {
      "18_24": {"employed": 0.78, "student": 0.45},
      "25_29": {"employed": 0.92, "professional": 0.67},
      "30_34": {"employed": 0.94, "management": 0.34}
    }
  },
  "lifestyle_indicators": {
    "education_level": {
      "high_school": 0.05,
      "some_college": 0.12,
      "bachelors": 0.43,
      "graduate": 0.40
    },
    "commute_patterns": {
      "work_from_home": 0.28,
      "walk_to_work": 0.15,
      "public_transit": 0.52,
      "car": 0.05
    },
    "housing": {
      "rent": 0.78,
      "own": 0.22,
      "median_rent": 4200
    }
  }
}
```

**What This Tells Us:**
- **Baseline Demographics**: Precise population pyramid for the area
- **Economic Context**: Income levels that inform venue preferences
- **Lifestyle Patterns**: Work, education, and housing that affect venue usage
- **Temporal Patterns**: Commute and work patterns

---

## 🎯 **Combined Granularity Example**

### **Real-World Fusion for "Artisanal Coffee Shop in SoHo":**

```json
{
  "venue_id": "blue_bottle_soho",
  "fused_demographics": {
    "age_pyramid": {
      "18_24": {
        "male": 0.065,          // 6.5% of visitors
        "female": 0.085,        // 8.5% of visitors
        "confidence": 0.87,
        "sources": ["safegraph", "foursquare", "instagram"]
      },
      "25_29": {
        "male": 0.095,          // 9.5% of visitors
        "female": 0.125,        // 12.5% of visitors
        "confidence": 0.92,
        "sources": ["safegraph", "foursquare", "instagram", "google"]
      },
      "30_34": {
        "male": 0.125,          // 12.5% of visitors
        "female": 0.155,        // 15.5% of visitors
        "confidence": 0.89,
        "sources": ["safegraph", "foursquare", "census"]
      }
      // ... continues for all age groups
    },
    "temporal_variations": {
      "weekday_morning": {
        "dominant_demographic": "25_34_professional",
        "gender_skew": "slightly_female",
        "confidence": 0.84
      },
      "weekend_afternoon": {
        "dominant_demographic": "18_29_social",
        "gender_skew": "female_dominant",
        "confidence": 0.78
      }
    },
    "context_breakdown": {
      "work_visits": {
        "percentage": 0.42,
        "age_skew": "25_34",
        "gender_split": {"male": 0.45, "female": 0.55}
      },
      "social_visits": {
        "percentage": 0.38,
        "age_skew": "18_29",
        "gender_split": {"male": 0.38, "female": 0.62}
      },
      "tourist_visits": {
        "percentage": 0.20,
        "age_skew": "mixed",
        "gender_split": {"male": 0.48, "female": 0.52}
      }
    }
  },
  "real_time_adjustments": {
    "current_crowd": {
      "estimated_age_median": 28,
      "estimated_gender_split": {"male": 0.41, "female": 0.59},
      "estimated_spending_power": "above_average",
      "estimated_stay_duration": "45_minutes",
      "confidence": 0.76
    }
  }
}
```

This granular data allows for precise age-gender pyramid matching, enabling recommendations like:
- **High Match (85%+)**: Female, 26-30, Professional → Venues with 55%+ female, 25-34 dominant
- **Medium Match (60-84%)**: Male, 22-25, Student → Venues with mixed demographics but youth-friendly
- **Low Match (<60%)**: Male, 45+, Retiree → Venues with primarily young professional crowds

The system combines all these data sources to create the most accurate demographic picture possible for each venue.
