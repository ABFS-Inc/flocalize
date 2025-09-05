# 🔐 Security Guidelines for Flocalize

## Critical Security Notice

**⚠️ NEVER commit API keys, secrets, or tokens to version control!**

## What Was Fixed

- **Removed exposed Geoapify API key** from `script.js`
- **Implemented secure configuration system** using `config.js`
- **Created `.gitignore`** to prevent accidental commits of sensitive files
- **Added `.env.example`** template for secure key management

## Sensitive Information to Protect

### 🚨 Never Commit These:
- API Keys (Geoapify, SafeGraph, Foursquare, etc.)
- Access Tokens (Instagram, Google, etc.)
- Client Secrets
- Database credentials
- Private keys
- Authentication tokens

### 📁 Files to Keep Private:
- `.env` (environment variables)
- `config/secrets.json`
- `config/api-keys.json`
- Any file containing real API credentials

## Development Setup

### For Local Development:

1. **Copy the environment template:**
   ```bash
   copy .env.example secrets.env
   ```

2. **Add your API keys to `secrets.env`:**
   ```
   GEOAPIFY_API_KEY=your_actual_geoapify_key
   ANTHROPIC_API_KEY=your_actual_anthropic_key
   XAI_API_KEY=your_actual_xai_key
   # ... other keys
   ```

3. **For browser-based development (temporary method):**
   ```javascript
   // In browser console, set keys for development:
   localStorage.setItem('geoapify_key', 'your_actual_api_key');
   ```

### For Production Deployment:

1. **Set environment variables** on your hosting platform
2. **Never include `.env` files** in production builds
3. **Use secure key management services** for production

## Security Best Practices

### ✅ DO:
- Use environment variables for API keys
- Keep `.env` files in `.gitignore`
- Use secure configuration management
- Rotate API keys regularly
- Monitor API key usage
- Use least-privilege access for keys

### ❌ DON'T:
- Hard-code API keys in source code
- Commit `.env` files to git
- Share API keys in chat/email
- Use production keys in development
- Leave unused API keys active
- Expose keys in browser dev tools

## API Key Management

### Current APIs Used:
1. **Geoapify** - Geocoding and Places API
2. **SafeGraph** - Venue and demographic data
3. **Foursquare** - Venue information
4. **Instagram** - Social media insights
5. **Google Places** - Additional venue data
6. **Census API** - Demographic baseline data

### Key Rotation Schedule:
- **Development keys**: Rotate monthly
- **Production keys**: Rotate quarterly
- **Immediately rotate** if key exposure suspected

## Monitoring & Alerts

### Set up monitoring for:
- Unusual API usage patterns
- Failed authentication attempts
- Rate limit violations
- Unexpected geographic usage

## Emergency Response

### If API Key is Compromised:
1. **Immediately revoke** the exposed key
2. **Generate new key** from provider dashboard
3. **Update all environments** with new key
4. **Review logs** for unauthorized usage
5. **Document incident** for future prevention

## Configuration Files Status

### ✅ Secure Files:
- `config.js` - Secure configuration loader
- `.env.example` - Template (no real keys)
- `.gitignore` - Properly configured

### ⚠️ Files to Monitor:
- `script.js` - Now uses secure config
- `manhattan-demographics-engine.js` - Check for hardcoded keys
- Any new JavaScript files

## Pre-Commit Checklist

Before committing code, verify:
- [ ] No API keys in source code
- [ ] `.env` files not staged for commit
- [ ] New secrets added to `.gitignore`
- [ ] Configuration uses environment variables
- [ ] No hardcoded credentials in comments

## Tools for Security

### Recommended Tools:
- **git-secrets** - Prevent accidental commits
- **truffleHog** - Scan for leaked secrets
- **GitHub secret scanning** - Automatic detection
- **pre-commit hooks** - Automated checks

### Setup git-secrets:
```bash
git secrets --install
git secrets --register-aws
git secrets --add 'api[_-]?key'
git secrets --add 'secret'
git secrets --add 'token'
```

---

**Remember: Security is everyone's responsibility. When in doubt, ask for a security review!**
