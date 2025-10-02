// Compliance Engine with Trie Data Structure for Fast Keyword Matching

class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.violationType = null;
    }
}

class ComplianceTrie {
    constructor() {
        this.root = new TrieNode();
        this.initializeComplianceRules();
    }

    // Insert a banned phrase into the Trie
    insert(phrase, violationType) {
        let current = this.root;
        const normalizedPhrase = phrase.toLowerCase();
        
        for (let char of normalizedPhrase) {
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }
        
        current.isEndOfWord = true;
        current.violationType = violationType;
    }

    // Search for banned phrases in text
    search(text) {
        const violations = [];
        const normalizedText = text.toLowerCase();
        const words = text.split(/\s+/);
        
        for (let i = 0; i < normalizedText.length; i++) {
            let current = this.root;
            let j = i;
            let potentialMatch = '';
            
            while (j < normalizedText.length && current.children[normalizedText[j]]) {
                potentialMatch += normalizedText[j];
                current = current.children[normalizedText[j]];
                
                if (current.isEndOfWord) {
                    // Check if it's a whole word match (not part of another word)
                    const isWholeWord = this.isWholeWordMatch(normalizedText, i, j);
                    if (isWholeWord) {
                        const wordPosition = this.getWordPosition(text, i, j);
                        violations.push({
                            phrase: potentialMatch,
                            type: current.violationType,
                            position: i,
                            wordPosition: wordPosition,
                            originalPhrase: text.substring(i, j + 1)
                        });
                    }
                }
                j++;
            }
        }
        
        return violations;
    }

    // Calculate word position for better user understanding
    getWordPosition(text, startChar, endChar) {
        const beforeText = text.substring(0, startChar);
        const phraseText = text.substring(startChar, endChar + 1);
        
        const wordsBefore = beforeText.trim() ? beforeText.trim().split(/\s+/).length : 0;
        const wordsInPhrase = phraseText.trim().split(/\s+/).length;
        
        const startWord = wordsBefore + 1;
        const endWord = wordsBefore + wordsInPhrase;
        
        return wordsInPhrase === 1 ? 
            `Word ${startWord}` : 
            `Words ${startWord}-${endWord}`;
    }

    // Check if the match is a complete word (not part of another word)
    isWholeWordMatch(text, start, end) {
        const beforeChar = start > 0 ? text[start - 1] : ' ';
        const afterChar = end < text.length - 1 ? text[end + 1] : ' ';
        
        const isWordBoundary = (char) => /[\s\.,!?;:\-\(\)\[\]{}'"@#$%^&*+=<>\/\\|`~]/.test(char);
        
        return isWordBoundary(beforeChar) && isWordBoundary(afterChar);
    }

    // Initialize compliance rules with banned phrases
    initializeComplianceRules() {
        // Financial/Scam related violations
        const financialViolations = [
            'free money', 'get rich quick', 'guaranteed profit', 'easy money',
            'make money fast', 'no risk investment', 'instant cash', 'free cash',
            'money back guarantee', 'risk free', 'guaranteed returns', 'quick cash'
        ];

        // Fake/Misleading content
        const misleadingViolations = [
            'fake offer', 'limited time only', 'act now', 'urgent',
            'this is not a scam', 'too good to be true', 'exclusive deal',
            'secret method', 'doctors hate this', 'one weird trick'
        ];

        // Inappropriate/Offensive content
        const offensiveViolations = [
            'abuse', 'hate', 'discrimination', 'harassment', 'bullying',
            'violence', 'threat', 'spam', 'scam', 'fraud'
        ];

        // Health/Medical misinformation
        const healthViolations = [
            'miracle cure', 'instant weight loss', 'lose weight overnight',
            'cure cancer', 'fda approved', 'doctor recommended', 'medical breakthrough',
            'secret formula', 'ancient remedy'
        ];

        // Cryptocurrency/Investment scams
        const cryptoViolations = [
            'crypto giveaway', 'bitcoin doubler', 'investment opportunity',
            'ponzi scheme', 'pyramid scheme', 'mlm opportunity', 'passive income guaranteed'
        ];

        // Add all violations to the Trie
        financialViolations.forEach(phrase => this.insert(phrase, 'Financial Violation'));
        misleadingViolations.forEach(phrase => this.insert(phrase, 'Misleading Content'));
        offensiveViolations.forEach(phrase => this.insert(phrase, 'Inappropriate Content'));
        healthViolations.forEach(phrase => this.insert(phrase, 'Health Misinformation'));
        cryptoViolations.forEach(phrase => this.insert(phrase, 'Investment Scam'));
    }
}

// Platform-specific compliance rules
class PlatformCompliance {
    constructor() {
        this.platformRules = {
            instagram: {
                maxLength: 2200,
                requiredHashtags: false,
                allowedContentTypes: ['image', 'video', 'story']
            },
            twitter: {
                maxLength: 280,
                requiredHashtags: false,
                allowedContentTypes: ['text', 'image', 'video']
            },
            facebook: {
                maxLength: 63206,
                requiredHashtags: false,
                allowedContentTypes: ['text', 'image', 'video', 'link']
            },
            linkedin: {
                maxLength: 3000,
                requiredHashtags: true,
                allowedContentTypes: ['text', 'image', 'video', 'document']
            },
            tiktok: {
                maxLength: 150,
                requiredHashtags: true,
                allowedContentTypes: ['video']
            },
            'ad-campaign': {
                maxLength: 1000,
                requiredHashtags: false,
                allowedContentTypes: ['text', 'image', 'video']
            },
            'email-marketing': {
                maxLength: 5000,
                requiredHashtags: false,
                allowedContentTypes: ['text', 'image', 'html']
            }
        };
    }

    validatePlatformRules(content, platform) {
        const violations = [];
        const rules = this.platformRules[platform];

        if (!rules) {
            violations.push({
                phrase: 'Unknown Platform',
                type: 'Platform Error',
                position: 0
            });
            return violations;
        }

        // Check content length
        if (content.length > rules.maxLength) {
            violations.push({
                phrase: `Content too long (${content.length}/${rules.maxLength} characters)`,
                type: 'Length Violation',
                position: rules.maxLength
            });
        }

        // Check for required hashtags on certain platforms
        if (rules.requiredHashtags && !content.includes('#')) {
            violations.push({
                phrase: 'Missing required hashtags',
                type: 'Hashtag Requirement',
                position: 0
            });
        }

        return violations;
    }
}

// Main Compliance Engine
class ComplianceEngine {
    constructor() {
        this.trie = new ComplianceTrie();
        this.platformCompliance = new PlatformCompliance();
        this.hashMap = new Map(); // For additional fast lookups
        this.initializeHashMap();
    }

    // Initialize hash map for additional quick checks
    initializeHashMap() {
        const suspiciousPatterns = [
            { pattern: /\b\d+\s*%\s*guaranteed/i, type: 'Unrealistic Guarantee' },
            { pattern: /\$\d+\s*(per|\/)\s*(day|hour|week)/i, type: 'Income Claim' },
            { pattern: /click\s+here\s+now/i, type: 'Urgent Call to Action' },
            { pattern: /limited\s+time\s+offer/i, type: 'Pressure Tactic' },
            { pattern: /\b(buy|purchase)\s+now\b/i, type: 'Aggressive Sales' },
            { pattern: /\bfree\s+trial\b/i, type: 'Potential Subscription Trap' }
        ];

        suspiciousPatterns.forEach((item, index) => {
            this.hashMap.set(`pattern_${index}`, item);
        });
    }

    // Main compliance check function
    checkCompliance(content, platform) {
        const violations = [];
        
        // 1. Check using Trie for banned phrases
        const trieViolations = this.trie.search(content);
        violations.push(...trieViolations);

        // 2. Check platform-specific rules
        const platformViolations = this.platformCompliance.validatePlatformRules(content, platform);
        violations.push(...platformViolations);

        // 3. Check using hash map patterns
        this.hashMap.forEach((patternObj, key) => {
            const matches = content.match(patternObj.pattern);
            if (matches) {
                violations.push({
                    phrase: matches[0],
                    type: patternObj.type,
                    position: content.indexOf(matches[0])
                });
            }
        });

        // 4. Additional heuristic checks
        const heuristicViolations = this.performHeuristicChecks(content);
        violations.push(...heuristicViolations);

        // Determine overall compliance status
        const isCompliant = violations.length === 0;
        
        return {
            isCompliant,
            violations,
            summary: this.generateSummary(violations),
            riskLevel: this.calculateRiskLevel(violations)
        };
    }

    // Perform additional heuristic checks
    performHeuristicChecks(content) {
        const violations = [];

        // Check for excessive capitalization
        const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
        if (capsRatio > 0.3 && content.length > 20) {
            violations.push({
                phrase: 'Excessive capitalization detected',
                type: 'Formatting Violation',
                position: 0
            });
        }

        // Check for excessive exclamation marks
        const exclamationCount = (content.match(/!/g) || []).length;
        if (exclamationCount > 3) {
            violations.push({
                phrase: 'Too many exclamation marks',
                type: 'Formatting Violation',
                position: content.indexOf('!')
            });
        }

        // Check for suspicious URLs
        const urlPattern = /https?:\/\/[^\s]+/gi;
        const urls = content.match(urlPattern);
        if (urls) {
            urls.forEach(url => {
                if (this.isSuspiciousUrl(url)) {
                    violations.push({
                        phrase: url,
                        type: 'Suspicious Link',
                        position: content.indexOf(url)
                    });
                }
            });
        }

        return violations;
    }

    // Check if URL is suspicious
    isSuspiciousUrl(url) {
        const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];
        const suspiciousKeywords = ['free', 'money', 'cash', 'prize', 'winner'];
        
        return suspiciousDomains.some(domain => url.includes(domain)) ||
               suspiciousKeywords.some(keyword => url.toLowerCase().includes(keyword));
    }

    // Generate summary of violations
    generateSummary(violations) {
        if (violations.length === 0) {
            return 'Content passes all compliance checks.';
        }

        const violationTypes = [...new Set(violations.map(v => v.type))];
        return `Found ${violations.length} violation(s) across ${violationTypes.length} categories: ${violationTypes.join(', ')}.`;
    }

    // Calculate risk level based on violations
    calculateRiskLevel(violations) {
        if (violations.length === 0) return 'Low';
        if (violations.length <= 2) return 'Medium';
        return 'High';
    }

    // Get violation statistics for dashboard
    getViolationStats(violations) {
        const stats = {};
        violations.forEach(violation => {
            stats[violation.type] = (stats[violation.type] || 0) + 1;
        });
        return stats;
    }

    // Create highlighted text showing violations
    createHighlightedText(content, violations) {
        if (violations.length === 0) {
            return content;
        }

        // Sort violations by position (descending) to avoid position shifts during replacement
        const sortedViolations = violations
            .filter(v => v.position !== undefined && v.originalPhrase)
            .sort((a, b) => b.position - a.position);

        let highlightedText = content;

        sortedViolations.forEach(violation => {
            const start = violation.position;
            const end = start + violation.originalPhrase.length;
            const originalPhrase = violation.originalPhrase;
            
            // Create highlighted span with color coding based on violation type
            const highlightClass = this.getHighlightClass(violation.type);
            const highlightedPhrase = `<span class="${highlightClass}" title="${violation.type}">${originalPhrase}</span>`;
            
            // Replace the original phrase with highlighted version
            highlightedText = highlightedText.substring(0, start) + 
                             highlightedPhrase + 
                             highlightedText.substring(end);
        });

        return highlightedText;
    }

    // Get CSS class for different violation types
    getHighlightClass(violationType) {
        const typeMap = {
            'Financial Violation': 'violation-financial',
            'Misleading Content': 'violation-misleading',
            'Inappropriate Content': 'violation-inappropriate',
            'Health Misinformation': 'violation-health',
            'Investment Scam': 'violation-investment',
            'Urgent Call to Action': 'violation-urgent',
            'Unrealistic Guarantee': 'violation-guarantee',
            'Income Claim': 'violation-income',
            'Pressure Tactic': 'violation-pressure',
            'Aggressive Sales': 'violation-sales'
        };
        
        return typeMap[violationType] || 'violation-general';
    }
}

// Export for use in other files
window.ComplianceEngine = ComplianceEngine;
