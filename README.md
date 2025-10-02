# Social Media Compliance Checker

A comprehensive web application that helps businesses check if their social media posts and campaigns follow compliance rules before reaching customers. Built with HTML, CSS, JavaScript, and Firebase Firestore.

## 🚀 Features

### Core Functionality
- **Real-time Compliance Checking**: Advanced Trie data structure for fast keyword matching
- **Multi-Platform Support**: Instagram, Twitter, Facebook, LinkedIn, TikTok, Ad Campaigns, Email Marketing
- **Intelligent Detection**: Identifies financial scams, misleading content, health misinformation, and more
- **Risk Assessment**: Categorizes content as Low, Medium, or High risk

### Analytics Dashboard
- **Real-time Analytics**: Track compliance rates and violation patterns
- **Interactive Charts**: Powered by Chart.js for beautiful visualizations
- **Platform Insights**: Compare compliance rates across different social media platforms
- **Violation Tracking**: Monitor top violation reasons and trends

### Business Funnel Integration
- **Sales Funnel Visualization**: Shows impact of compliance on business metrics
- **Brand Protection**: Demonstrates how non-compliant content is blocked
- **ROI Tracking**: Visualizes the journey from prospects to loyal customers

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: Firebase Firestore
- **Charts**: Chart.js
- **Algorithms**: Trie data structure, Hash maps for fast lookups
- **Styling**: Modern CSS with gradients, animations, and responsive design

## 📋 Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" for development
4. Get your Firebase configuration:
   - Go to Project Settings > General > Your apps
   - Add a web app
   - Copy the configuration object

### 2. Configure Firebase

1. Open `firebase-config.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
window.firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

### 3. Local Development

1. **Option A: Simple HTTP Server (Python)**
   ```bash
   # Navigate to project directory
   cd social-media-compliance-checker
   
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **Option B: Node.js HTTP Server**
   ```bash
   # Install http-server globally
   npm install -g http-server
   
   # Navigate to project directory
   cd social-media-compliance-checker
   
   # Start server
   http-server -p 8000
   ```

3. **Option C: Live Server (VS Code Extension)**
   - Install "Live Server" extension in VS Code
   - Right-click on `index.html`
   - Select "Open with Live Server"

### 4. Access the Application

Open your browser and navigate to:
- `http://localhost:8000` (or the port you chose)

## 📁 Project Structure

```
social-media-compliance-checker/
├── index.html              # Landing page
├── checker.html            # Post compliance checker
├── dashboard.html          # Analytics dashboard
├── styles.css              # Main stylesheet
├── firebase-config.js      # Firebase configuration
├── compliance-engine.js    # Core compliance logic with Trie
├── checker.js              # Checker page functionality
├── dashboard.js            # Dashboard with Chart.js
└── README.md              # This file
```

## 🔧 Compliance Rules

The application checks for various types of violations:

### Financial Violations
- "free money", "get rich quick", "guaranteed profit"
- "easy money", "make money fast", "no risk investment"

### Misleading Content
- "fake offer", "limited time only", "act now"
- "too good to be true", "exclusive deal"

### Inappropriate Content
- "abuse", "hate", "discrimination"
- "harassment", "bullying", "violence"

### Health Misinformation
- "miracle cure", "instant weight loss"
- "cure cancer", "secret formula"

### Investment Scams
- "crypto giveaway", "bitcoin doubler"
- "ponzi scheme", "pyramid scheme"

## 📊 Data Structure

### Firestore Collection: `compliance-checks`
```javascript
{
    postId: "post_1234567890_abc123",
    platform: "instagram",
    content: "Sample post content...",
    status: "Compliant" | "Non-Compliant",
    violationReason: "Financial Violation, Misleading Content",
    violations: [
        {
            phrase: "free money",
            type: "Financial Violation",
            position: 15
        }
    ],
    riskLevel: "High" | "Medium" | "Low",
    createdAt: timestamp
}
```

## 🎯 Usage Examples

### Example 1: Compliant Post
```
Platform: Instagram
Content: "Check out our new product launch! We're excited to share this innovation with our community. #newproduct #innovation"
Result: ✅ Compliant
```

### Example 2: Non-Compliant Post
```
Platform: Twitter
Content: "Get rich quick with our amazing free money opportunity! Guaranteed profits!"
Result: ❌ Non-Compliant
Violations: Financial Violation, Misleading Content
```

## 🔍 Algorithm Details

### Trie Data Structure
- **Purpose**: Fast keyword matching for banned phrases
- **Time Complexity**: O(m) for search, where m is the length of the text
- **Space Complexity**: O(n*k) where n is number of banned phrases and k is average phrase length

### Hash Map Optimization
- **Purpose**: Quick pattern matching for regex-based rules
- **Use Cases**: Percentage guarantees, income claims, urgent CTAs

### Heuristic Checks
- **Excessive Capitalization**: Flags posts with >30% capital letters
- **Exclamation Overuse**: Detects more than 3 exclamation marks
- **Suspicious URLs**: Identifies potentially harmful links

## 🚀 Deployment

### Option 1: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy
```

### Option 2: Netlify
1. Drag and drop the project folder to [Netlify](https://netlify.com)
2. Or connect your Git repository for automatic deployments

### Option 3: GitHub Pages
1. Push code to GitHub repository
2. Go to repository Settings > Pages
3. Select source branch and deploy

## 🔒 Security Considerations

1. **Firebase Security Rules**: Update Firestore rules for production
2. **API Keys**: Use environment variables for sensitive data
3. **Input Validation**: All user inputs are sanitized
4. **HTTPS**: Always use HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Firebase not connecting**
   - Check your configuration in `firebase-config.js`
   - Ensure Firestore is enabled in Firebase Console

2. **Charts not displaying**
   - Check browser console for Chart.js errors
   - Ensure internet connection for CDN resources

3. **CORS errors**
   - Use a proper HTTP server, not file:// protocol
   - Check Firebase hosting configuration

### Support

For issues and questions:
1. Check the browser console for error messages
2. Verify Firebase configuration
3. Ensure all files are properly served over HTTP/HTTPS

## 🎉 Demo

The application includes demo data for testing when Firebase is not configured. Simply open the application and navigate through the pages to see the functionality in action.

---

**Built with ❤️ for brand safety and compliance**
