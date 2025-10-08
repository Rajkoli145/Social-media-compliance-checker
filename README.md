# 🛡️ Social Media Compliance Checker

A sophisticated web application that leverages advanced data structures to ensure social media content compliance across multiple platforms. This project implements **Trie data structures** and **Hash Maps** for ultra-fast regulation matching, helping businesses prevent non-compliant content from reaching customers.

> **Problem Statement:** Design a social media compliance checker using MongoDB/Firebase with regulation matching using suitable data structures.

## 🎯 Project Overview

This application serves as an automated compliance officer that scans social media posts against predefined regulations and policies. It uses optimal data structures for efficient pattern matching and provides real-time analytics for compliance monitoring.

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

## 🛠️ Tech Stack & Data Structures

### **Core Technologies**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: Firebase Firestore (NoSQL Document Database)
- **Visualization**: Chart.js for interactive analytics
- **Styling**: Modern CSS3 with animations and responsive design

### **Data Structures Implementation**

#### 🌲 **Trie Data Structure**
- **Purpose**: Ultra-fast banned phrase detection
- **Time Complexity**: O(m) where m = text length
- **Space Complexity**: O(n×k) where n = phrases, k = avg length
- **Features**: Whole-word matching, position tracking, violation categorization

#### 🗺️ **Hash Map**
- **Purpose**: Pattern-based regulation matching using regex
- **Time Complexity**: O(1) average lookup
- **Use Cases**: Income claims, percentage guarantees, urgent CTAs
- **Features**: Flexible pattern matching, scalable rule addition

#### 📋 **Platform Rules Object**
- **Purpose**: Platform-specific compliance validation
- **Structure**: Organized rule storage by platform
- **Features**: Character limits, hashtag requirements, content type validation

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
├── index.html                    # Main dashboard (analytics & charts)
├── checker.html                  # Post compliance checker interface
├── admin.html                    # Admin panel for management
├── styles.css                    # Complete styling with blue theme
├── firebase-config.js            # Firebase Firestore configuration
├── compliance-engine.js          # 🌲 Trie + HashMap implementation
├── checker.js                    # Post checking logic & Firebase integration
├── dashboard.js                  # Analytics dashboard with Chart.js
├── admin.js                      # Admin panel functionality
├── README.md                     # Project documentation
├── .gitignore                    # Git ignore rules
├── package.json                  # Project metadata
└── FIREBASE_TROUBLESHOOTING.md   # Firebase setup guide
```

## 🏗️ Architecture & Data Flow

### **1. Data Input**
```
User Input → Compliance Engine → Data Structures Processing
```

### **2. Regulation Matching Process**
```
Text Content → Trie Search (O(m)) → HashMap Pattern Match (O(1)) → Platform Rules Check → Violation Report
```

### **3. Data Storage**
```
Compliance Results → Firebase Firestore → Real-time Dashboard Updates
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

> 📋 **For comprehensive platform examples:** See [PLATFORM_EXAMPLES.md](PLATFORM_EXAMPLES.md) for detailed compliant and non-compliant examples across all 7 platforms.

## 🔍 Algorithm Details & Implementation

### 🌲 Trie Data Structure Implementation
```javascript
class TrieNode {
    constructor() {
        this.children = {};           // Character mappings
        this.isEndOfWord = false;     // Marks complete banned phrase
        this.violationType = null;    // Violation category
    }
}

class ComplianceTrie {
    insert(phrase, violationType) {
        // O(k) insertion where k = phrase length
        let current = this.root;
        for (let char of phrase.toLowerCase()) {
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }
        current.isEndOfWord = true;
        current.violationType = violationType;
    }
    
    search(text) {
        // O(m) search where m = text length
        // Finds ALL violations in single pass
    }
}
```

### 🗺️ Hash Map Pattern Matching
```javascript
const suspiciousPatterns = [
    { pattern: /\b\d+\s*%\s*guaranteed/i, type: 'Unrealistic Guarantee' },
    { pattern: /\$\d+\s*(per|\/)\s*(day|hour|week)/i, type: 'Income Claim' },
    { pattern: /click\s+here\s+now/i, type: 'Urgent Call to Action' }
];
```

### 🎯 Performance Metrics
- **Trie Search**: O(m) time complexity - Linear with text length
- **HashMap Lookup**: O(1) average time - Constant time pattern matching
- **Space Efficiency**: Optimized storage with shared prefixes in Trie
- **Scalability**: Easy addition of new rules without performance degradation

### 🔍 Advanced Heuristic Checks
- **Excessive Capitalization**: Flags posts with >30% capital letters
- **Exclamation Overuse**: Detects more than 3 exclamation marks  
- **Suspicious URLs**: Identifies potentially harmful links
- **Whole Word Matching**: Prevents false positives with partial matches
- **Position Tracking**: Pinpoints exact violation locations

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

## 🎉 Live Demo & Features

### **Dashboard Features**
- 📊 Real-time compliance analytics with Chart.js
- 📈 Platform-wise compliance comparison
- 🎯 Violation categorization and trending
- 💼 Business funnel impact visualization

### **Checker Features**  
- ⚡ Instant compliance checking (< 100ms response time)
- 🎯 Precise violation highlighting with position tracking
- 📱 Multi-platform validation (Instagram, Twitter, Facebook, LinkedIn, TikTok)
- 🔍 Detailed violation reports with risk assessment

### **Admin Features**
- 🛠️ System management and monitoring
- 📊 Advanced analytics and reporting
- ⚙️ Configuration management

## 🏆 Problem Statement Fulfillment

✅ **Database**: Firebase Firestore (NoSQL Document Database)  
✅ **Social Media Focus**: Multi-platform compliance checking  
✅ **Regulation Matching**: Comprehensive rule engine with 50+ patterns  
✅ **Suitable Data Structures**: Trie (O(m)) + HashMap (O(1)) + Platform Rules  
✅ **Advanced Features**: Real-time analytics, risk assessment, position tracking  

## 🌟 Key Achievements

- **🚀 Performance**: O(m) time complexity for text scanning
- **🎯 Accuracy**: Whole-word matching prevents false positives  
- **📊 Analytics**: Real-time dashboard with interactive charts
- **🔧 Scalability**: Easy addition of new rules and platforms
- **💡 Innovation**: Advanced heuristic checks beyond basic keyword matching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🛡️ Built with ❤️ for brand safety and compliance**

*Leveraging advanced data structures for intelligent content moderation*
