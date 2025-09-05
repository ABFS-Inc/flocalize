# 📸 Instagram API Setup Guide - Step by Step

## 🎯 **Overview**
This guide walks you through ge3. **Create Instagram App**
   - Click **"Create New App"**
   - Enter details:
     ```
     Display Name: Flocalize - Find Your Crowd
     Namespace: flocalize-find-your-crowd
     Category: Travel & Local
     ```stagram API access for demographic analysis of venue locations. We'll be using the **Instagram Basic Display API** and **Instagram Graph API** for location-based content analysis.

---

## 📋 **Prerequisites**
Before starting, ensure you have:
- ✅ A Facebook account (required for Meta Developer Platform)
- ✅ A business email address
- ✅ A website or app description for your project
- ✅ Valid payment method (for potential API costs)
- ✅ Phone number for account verification

---

## 🚀 **Step-by-Step Process**

### **Step 1: Create Meta Developer Account**

1. **Go to Meta for Developers**
   - Visit: https://developers.facebook.com/
   - Click **"Get Started"** in the top right corner

2. **Register Your Account**
   - Log in with your Facebook account
   - Click **"Continue"** to link your Facebook account
   - Accept the Meta Developer Terms and Policies

3. **Verify Your Account**
   - Add your phone number when prompted
   - Enter the verification code sent via SMS
   - Complete the security verification

4. **Complete Developer Profile**
   - Fill in your developer information:
     ```
     Company/Organization: [Your Company Name]
     Website: [Your website or project URL]
     Country: United States
     ```
   - Click **"Submit"**

---

### **Step 2: Create a Facebook App**

1. **Create New App**
   - From the Meta Developer dashboard, click **"Create App"**
   - Select **"Business"** as the app type
   - Click **"Next"**

2. **App Details**
   ```
   App Name: Flocalize
   App Contact Email: [your-email@domain.com]
   Purpose: Find Your Crowd - Location-based demographic analysis for venue discovery
   ```
   - Click **"Create App"**

3. **Verify Your Identity**
   - You may be asked to verify your identity
   - Upload a government-issued ID if requested
   - Wait for approval (usually 1-2 business days)

---

### **Step 3: Add Instagram Products to Your App**

1. **Navigate to App Dashboard**
   - Go to your newly created app in the Meta Developer dashboard
   - You'll see the app overview page

2. **Add Instagram Basic Display**
   - Scroll down to **"Add Products to Your App"**
   - Find **"Instagram Basic Display"**
   - Click **"Set Up"**

3. **Add Instagram Graph API**
   - Also add **"Instagram Graph API"**
   - Click **"Set Up"**

4. **Configure Basic Settings**
   - Go to **Settings → Basic**
   - Add your app domains:
     ```
     App Domains: localhost, yourdomain.com
     Privacy Policy URL: https://yourdomain.com/privacy
     Terms of Service URL: https://yourdomain.com/terms
     ```

---

### **Step 4: Configure Instagram Basic Display**

1. **Go to Instagram Basic Display Settings**
   - In your app dashboard, click **"Instagram Basic Display"**
   - Click **"Basic Display"** in the left sidebar

2. **Create Instagram App**
   - Click **"Create New App"**
   - Enter details:
     ```
     Display Name: Flocalize
     Namespace: flocalize-demographics
     Category: Travel & Local
     ```

3. **Add Instagram Test Users**
   - Go to **"Roles" → "Roles"**
   - Click **"Add Instagram Testers"**
   - Enter Instagram usernames you want to test with
   - These accounts will be able to authorize your app

4. **Configure OAuth Redirect URIs**
   ```
   Valid OAuth Redirect URIs:
   http://localhost:3000/auth/instagram/callback
   https://yourdomain.com/auth/instagram/callback
   ```

---

### **Step 5: Get Your API Credentials**

1. **App ID and Secret**
   - Go to **Settings → Basic**
   - Copy your **App ID** and **App Secret**:
     ```
     App ID: 1234567890123456
     App Secret: abcdef1234567890abcdef1234567890
     ```

2. **Generate Access Token**
   - Go to **Instagram Basic Display → Basic Display**
   - Click **"Generate Token"**
   - Follow the authorization flow
   - Copy the generated access token

3. **Get Long-Lived Access Token**
   - Use the Instagram Graph API to exchange for a long-lived token:
   ```bash
   curl -i -X GET "https://graph.instagram.com/access_token
     ?grant_type=ig_exchange_token
     &client_secret={your-app-secret}
     &access_token={your-short-lived-token}"
   ```

---

### **Step 6: Apply for Advanced Permissions**

1. **Business Verification**
   - Go to **Settings → Advanced**
   - Complete business verification if required
   - This may require business documents

2. **Request Instagram Graph API Permissions**
   - Go to **App Review → Permissions and Features**
   - Request these permissions:
     ```
     ✅ instagram_graph_user_profile
     ✅ instagram_graph_user_media
     ✅ pages_show_list
     ✅ pages_read_engagement
     ```

3. **Submit for Review**
   - Provide detailed use case explanation:
     ```
     Use Case: "Flocalize helps users localize venues where their ideal social 
     flock naturally congregates. We analyze publicly available Instagram location 
     data to understand demographic patterns for venue recommendations, helping 
     users discover where people with similar interests flock together in their local area."
     ```

---

### **Step 7: Set Up Environment Variables**

1. **Create .env File**
   ```bash
   # Instagram API Configuration
   INSTAGRAM_APP_ID=1234567890123456
   INSTAGRAM_APP_SECRET=abcdef1234567890abcdef1234567890
   INSTAGRAM_ACCESS_TOKEN=IGQVJYour-Long-Lived-Token-Here
   INSTAGRAM_API_VERSION=v18.0
   
   # Instagram API Endpoints
   INSTAGRAM_GRAPH_API_BASE=https://graph.instagram.com
   INSTAGRAM_BASIC_DISPLAY_BASE=https://api.instagram.com
   ```

2. **Test Your Setup**
   ```javascript
   // Test API connection
   const testInstagramAPI = async () => {
     const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`);
     const data = await response.json();
     console.log('Instagram API Test:', data);
   };
   ```

---

### **Step 8: Implement Location-Based Queries**

1. **Search for Location-Tagged Posts**
   ```javascript
   const searchLocationPosts = async (locationId) => {
     const url = `https://graph.instagram.com/v18.0/${locationId}/recent_media`;
     const params = new URLSearchParams({
       fields: 'id,caption,timestamp,media_type,permalink',
       access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
       limit: 100
     });
     
     const response = await fetch(`${url}?${params}`);
     return await response.json();
   };
   ```

2. **Analyze Demographics from Posts**
   ```javascript
   const analyzeDemographics = async (posts) => {
     // Analyze hashtags, captions, and user patterns
     // Extract age/gender indicators
     // Return demographic insights
   };
   ```

---

## ⚠️ **Important Considerations**

### **Rate Limits**
- **Basic Display API**: 200 requests per hour per user
- **Graph API**: Varies by app review status
- **Location Queries**: Limited to public data only

### **Privacy Compliance**
- Only access public location data
- Aggregate demographics anonymously
- Comply with Instagram's data use policies
- Implement proper data retention policies

### **Costs**
- **Free Tier**: Basic access with rate limits
- **Business Tier**: Higher limits, requires app review
- **Enterprise**: Contact Meta for custom pricing

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Application Not Authorized"**
   - Ensure your app is in Development mode
   - Add test users to your app
   - Check OAuth redirect URIs

2. **"Invalid Access Token"**
   - Regenerate your access token
   - Exchange for long-lived token
   - Check token expiration

3. **"Permission Denied"**
   - Submit app for review
   - Provide detailed use case
   - Ensure compliance with policies

### **Testing Commands:**
```bash
# Test basic API access
curl -X GET "https://graph.instagram.com/me?fields=id,username&access_token=YOUR_TOKEN"

# Test location search
curl -X GET "https://graph.instagram.com/location_search?distance=1000&lat=40.7128&lng=-74.0060&access_token=YOUR_TOKEN"
```

---

## 📞 **Next Steps**

1. **Complete the setup** following all steps above
2. **Test your API access** with the provided code examples
3. **Integrate with the Demographics Engine** in `manhattan-demographics-engine.js`
4. **Monitor usage** and stay within rate limits
5. **Apply for production access** when ready to go live

---

## 📖 **Additional Resources**

- **Instagram Basic Display API Docs**: https://developers.facebook.com/docs/instagram-basic-display-api
- **Instagram Graph API Docs**: https://developers.facebook.com/docs/instagram-api
- **Meta App Review Process**: https://developers.facebook.com/docs/app-review
- **Instagram Platform Policy**: https://developers.facebook.com/docs/instagram-api/policy

---

**⏰ Estimated Setup Time**: 2-3 hours (plus 1-2 days for verification/review)
**💰 Cost**: Free for basic usage, paid tiers for higher limits
**🔒 Security**: Store all credentials securely in environment variables
