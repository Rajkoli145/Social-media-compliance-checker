// Dashboard JavaScript with Chart.js Integration
document.addEventListener('DOMContentLoaded', function() {
    let complianceChart = null;
    let platformChart = null;
    let currentData = []; // Store current data for modal display
    
    // Initialize dashboard
    initializeDashboard();
    
    // Initialize modal functionality
    initializeModal();
    
    // Refresh button functionality
    document.getElementById('refreshData').addEventListener('click', function() {
        this.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span> Refreshing...';
        this.disabled = true;
        
        setTimeout(() => {
            loadDashboardData();
            this.innerHTML = '<span class="material-symbols-outlined">refresh</span> Refresh Data';
            this.disabled = false;
        }, 1000);
    });


    async function initializeDashboard() {
        try {
            await loadDashboardData();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            showErrorMessage('Failed to load dashboard data. Please check your connection.');
            // Show empty state instead of demo data
            processAndDisplayData([], 0, 0);
        }
    }

    async function loadDashboardData() {
        try {
            if (!window.db) {
                console.warn('Firestore not initialized. Showing empty state.');
                processAndDisplayData([], 0, 0);
                return;
            }

            const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Load compliant posts (using correct collection path)
            const compliantQuery = query(
                collection(window.db, 'compliant'),
                orderBy('createdAt', 'desc')
            );
            
            // Load non-compliant posts (using correct collection path)
            const nonCompliantQuery = query(
                collection(window.db, 'non-compliant'),
                orderBy('createdAt', 'desc')
            );
            
            // Execute both queries in parallel
            const [compliantSnapshot, nonCompliantSnapshot] = await Promise.all([
                getDocs(compliantQuery),
                getDocs(nonCompliantQuery)
            ]);
            
            // Process compliant results
            const compliantData = [];
            compliantSnapshot.forEach((doc) => {
                compliantData.push({ id: doc.id, ...doc.data(), subcollection: 'compliant' });
            });
            
            // Process non-compliant results
            const nonCompliantData = [];
            nonCompliantSnapshot.forEach((doc) => {
                nonCompliantData.push({ id: doc.id, ...doc.data(), subcollection: 'non-compliant' });
            });
            
            // Combine all data
            const allData = [...compliantData, ...nonCompliantData];
            
            if (allData.length === 0) {
                // Show empty state when no real data exists
                console.log('No Firebase data found in subcollections, showing empty state...');
                processAndDisplayData([], 0, 0);
                return;
            }

            console.log(`Found ${compliantData.length} compliant and ${nonCompliantData.length} non-compliant records from subcollections`);
            processAndDisplayData(allData, compliantData.length, nonCompliantData.length);
            
        } catch (error) {
            console.error('Error loading data from Firestore subcollections:', error);
            showErrorMessage('Error loading data from database subcollections. Showing empty state.');
            processAndDisplayData([], 0, 0);
        }
    }



    function processAndDisplayData(data, compliantCount = null, nonCompliantCount = null) {
        // Store current data for modal display
        currentData = data;
        
        // Calculate statistics with subcollection counts if provided
        const stats = calculateStats(data, compliantCount, nonCompliantCount);
        
        // Update stat cards
        updateStatCards(stats);
        
        // Update charts
        updateComplianceChart(stats);
        updatePlatformChart(stats);
        
        // Update violations table
        updateViolationsTable(stats.violationStats);
        
        
        // Make stat cards clickable
        makeStatCardsClickable();
    }

    function calculateStats(data, compliantCount = null, nonCompliantCount = null) {
        // Use subcollection counts if provided, otherwise calculate from data
        let totalPosts, compliantPosts, nonCompliantPosts;
        
        if (compliantCount !== null && nonCompliantCount !== null) {
            // Use subcollection counts for better performance
            compliantPosts = compliantCount;
            nonCompliantPosts = nonCompliantCount;
            totalPosts = compliantPosts + nonCompliantPosts;
        } else {
            // Fallback to calculating from data
            totalPosts = data.length;
            compliantPosts = data.filter(item => item.status === 'Compliant').length;
            nonCompliantPosts = totalPosts - compliantPosts;
        }
        
        const complianceRate = totalPosts > 0 ? Math.round((compliantPosts / totalPosts) * 100) : 0;

        // Platform statistics
        const platformStats = {};
        data.forEach(item => {
            if (!platformStats[item.platform]) {
                platformStats[item.platform] = { total: 0, compliant: 0, nonCompliant: 0 };
            }
            platformStats[item.platform].total++;
            
            // Use subcollection info if available, otherwise use status
            if (item.subcollection === 'compliant' || item.status === 'Compliant') {
                platformStats[item.platform].compliant++;
            } else {
                platformStats[item.platform].nonCompliant++;
            }
        });

        // Violation statistics
        const violationStats = {};
        data.filter(item => item.status === 'Non-Compliant').forEach(item => {
            const reasons = item.violationReason.split(', ');
            reasons.forEach(reason => {
                if (reason && reason !== 'None') {
                    violationStats[reason] = (violationStats[reason] || 0) + 1;
                }
            });
        });

        const nonComplianceRate = totalPosts > 0 ? Math.round((nonCompliantPosts / totalPosts) * 100) : 0;

        return {
            totalPosts,
            compliantPosts,
            nonCompliantPosts,
            complianceRate,
            nonComplianceRate,
            platformStats,
            violationStats
        };
    }

    function updateStatCards(stats) {
        document.getElementById('totalPosts').textContent = stats.totalPosts;
        document.getElementById('compliantPosts').textContent = stats.compliantPosts;
        document.getElementById('nonCompliantPosts').textContent = stats.nonCompliantPosts;
        document.getElementById('complianceRate').textContent = stats.complianceRate + '%';
        document.getElementById('nonComplianceRate').textContent = stats.nonComplianceRate + '%';
    }

    function updateComplianceChart(stats) {
        const ctx = document.getElementById('complianceChart').getContext('2d');
        
        if (complianceChart) {
            complianceChart.destroy();
        }

        complianceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Compliant', 'Non-Compliant'],
                datasets: [{
                    data: [stats.compliantPosts, stats.nonCompliantPosts],
                    backgroundColor: ['#22c55e', '#ef4444'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 20
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 25,
                            usePointStyle: true,
                            font: {
                                size: 14,
                                family: 'Comic Sans MS'
                            },
                            boxWidth: 15,
                            boxHeight: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function updatePlatformChart(stats) {
        const ctx = document.getElementById('platformChart').getContext('2d');
        
        if (platformChart) {
            platformChart.destroy();
        }

        const platforms = Object.keys(stats.platformStats);
        
        // Calculate compliant and non-compliant rates for each platform
        const compliantRates = platforms.map(platform => {
            const platformData = stats.platformStats[platform];
            const rate = platformData.total > 0 ? Math.round((platformData.compliant / platformData.total) * 100) : 0;
            console.log(`${platform}: Compliant ${rate}%`);
            return rate;
        });
        
        const nonCompliantRates = platforms.map(platform => {
            const platformData = stats.platformStats[platform];
            const rate = platformData.total > 0 ? Math.round(((platformData.total - platformData.compliant) / platformData.total) * 100) : 0;
            console.log(`${platform}: Non-Compliant ${rate}%`);
            return rate;
        });

        platformChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')),
                datasets: [
                    {
                        label: 'Compliant (%)',
                        data: compliantRates,
                        backgroundColor: '#22c55e', // Green for compliant
                        borderColor: '#16a34a',
                        borderWidth: 2
                    },
                    {
                        label: 'Non-Compliant (%)',
                        data: nonCompliantRates,
                        backgroundColor: '#ef4444', // Red for non-compliant
                        borderColor: '#dc2626',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 20
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: 12,
                                family: 'Comic Sans MS'
                            },
                            maxRotation: 0,
                            minRotation: 0
                        }
                    },
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: {
                            font: {
                                size: 12,
                                family: 'Comic Sans MS'
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 12,
                                family: 'Comic Sans MS'
                            },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const platform = platforms[context.dataIndex];
                                const platformData = stats.platformStats[platform];
                                const datasetLabel = context.dataset.label;
                                const value = context.parsed.y;
                                
                                if (datasetLabel === 'Compliant (%)') {
                                    return `Compliant: ${value}% (${platformData.compliant}/${platformData.total})`;
                                } else {
                                    return `Non-Compliant: ${value}% (${platformData.total - platformData.compliant}/${platformData.total})`;
                                }
                            }
                        }
                    },
                    datalabels: {
                        display: function(context) {
                            return context.parsed.y > 0; // Only show labels for non-zero values
                        },
                        anchor: 'end',
                        align: 'top',
                        formatter: function(value) {
                            return value > 0 ? value + '%' : '';
                        },
                        font: {
                            size: 10,
                            weight: 'bold',
                            family: 'Comic Sans MS'
                        },
                        color: '#374151'
                    }
                }
            }
        });
    }

    function updateViolationsTable(violationStats) {
        const tableContainer = document.getElementById('violationsTable');
        
        if (Object.keys(violationStats).length === 0) {
            tableContainer.innerHTML = '<p>No violations found. Great job! 🎉</p>';
            return;
        }

        // Sort violations by count
        const sortedViolations = Object.entries(violationStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10); // Top 10

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Violation Type</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const totalViolations = Object.values(violationStats).reduce((a, b) => a + b, 0);

        sortedViolations.forEach(([type, count]) => {
            const percentage = Math.round((count / totalViolations) * 100);
            tableHTML += `
                <tr>
                    <td>${type}</td>
                    <td>${count}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        tableContainer.innerHTML = tableHTML;
    }



    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-banner';
        errorDiv.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <strong>⚠️ ${message}</strong>
            </div>
        `;
        
        const dashboardHeader = document.querySelector('.dashboard-header');
        dashboardHeader.appendChild(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }


    // Modal functionality
    function initializeModal() {
        const modal = document.getElementById('postDetailsModal');
        const closeModal = document.getElementById('closeModal');
        
        // Close modal when clicking the X
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    function makeStatCardsClickable() {
        const compliantCard = document.querySelector('.stat-card.compliant');
        const nonCompliantCard = document.querySelector('.stat-card.non-compliant');
        
        // Add clickable class and event listeners
        if (compliantCard) {
            compliantCard.classList.add('clickable');
            compliantCard.addEventListener('click', () => showPostDetails('compliant'));
        }
        
        if (nonCompliantCard) {
            nonCompliantCard.classList.add('clickable');
            nonCompliantCard.addEventListener('click', () => showPostDetails('non-compliant'));
        }
    }
    
    function showPostDetails(type) {
        const modal = document.getElementById('postDetailsModal');
        const modalTitle = document.getElementById('modalTitle');
        const postsList = document.getElementById('postsList');
        
        let filteredPosts;
        let title;
        
        if (type === 'compliant') {
            filteredPosts = currentData.filter(post => post.status === 'Compliant');
            title = `✅ Compliant Posts (${filteredPosts.length})`;
        } else {
            filteredPosts = currentData.filter(post => post.status === 'Non-Compliant');
            title = `❌ Non-Compliant Posts (${filteredPosts.length})`;
        }
        
        modalTitle.textContent = title;
        
        if (filteredPosts.length === 0) {
            postsList.innerHTML = '<p style="text-align: center; color: #6b7280; font-style: italic;">No posts found in this category.</p>';
        } else {
            postsList.innerHTML = filteredPosts.map(post => createPostItemHTML(post)).join('');
        }
        
        modal.style.display = 'block';
    }
    
    function createPostItemHTML(post) {
        const formattedDate = new Date(post.createdAt).toLocaleString();
        const isCompliant = post.status === 'Compliant';
        
        // Process content to highlight violation words
        let processedContent = post.content || 'No content available';
        let violationsHTML = '';
        let violationDetails = [];
        
        if (!isCompliant && post.violationReason && post.violationReason !== 'None') {
            // Re-analyze content to find specific violation words
            const violationData = analyzeContentViolations(post.content, post.violationReason);
            processedContent = violationData.highlightedContent;
            violationDetails = violationData.violations;
            
            if (violationDetails.length > 0) {
                violationsHTML = `
                    <div class="post-violations">
                        <h4>⚠️ Specific Violations Found:</h4>
                        <div class="violation-details">
                            ${violationDetails.map(violation => `
                                <div class="violation-item">
                                    <span class="violation-word">${violation.phrase}</span>
                                    <span class="violation-type">${violation.type}</span>
                                    <span class="violation-position">${violation.position}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                // Fallback to original violation display
                const violations = post.violationReason.split(', ');
                violationsHTML = `
                    <div class="post-violations">
                        <h4>⚠️ Violations Found:</h4>
                        <ul class="violation-list">
                            ${violations.map(violation => `<li>${violation}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        }
        
        return `
            <div class="post-item">
                <div class="post-header">
                    <span class="post-platform">${post.platform.charAt(0).toUpperCase() + post.platform.slice(1).replace('-', ' ')}</span>
                    <span class="post-status ${isCompliant ? 'compliant' : 'non-compliant'}">
                        ${isCompliant ? '✅ Compliant' : '❌ Non-Compliant'}
                    </span>
                </div>
                <div class="post-content">
                    "${processedContent}"
                </div>
                ${violationsHTML}
                <div class="post-timestamp">
                    📅 ${formattedDate}
                </div>
            </div>
        `;
    }
    
    function analyzeContentViolations(content, violationReason) {
        if (!content) return { highlightedContent: 'No content available', violations: [] };
        
        // Create a simple compliance engine instance for analysis
        const violations = findViolationWords(content);
        
        let highlightedContent = content;
        const violationData = [];
        
        // Sort violations by position (descending) to avoid position shifts when highlighting
        violations.sort((a, b) => b.position - a.position);
        
        violations.forEach(violation => {
            const violationClass = getViolationClass(violation.type);
            const highlightedPhrase = `<span class="violation-highlight ${violationClass}" title="${violation.type}">${violation.originalPhrase}</span>`;
            
            // Replace the violation phrase with highlighted version
            const beforeText = highlightedContent.substring(0, violation.position);
            const afterText = highlightedContent.substring(violation.position + violation.originalPhrase.length);
            highlightedContent = beforeText + highlightedPhrase + afterText;
            
            violationData.push({
                phrase: violation.originalPhrase,
                type: violation.type,
                position: violation.wordPosition || `Position ${violation.position + 1}`
            });
        });
        
        return { highlightedContent, violations: violationData };
    }
    
    function findViolationWords(content) {
        const violations = [];
        const text = content.toLowerCase();
        
        // Define violation patterns and their types
        const violationPatterns = {
            'Financial Violation': [
                'free money', 'get rich quick', 'guaranteed profit', 'easy money',
                'make money fast', 'no risk investment', 'instant cash', 'free cash',
                'money back guarantee', 'risk free', 'guaranteed returns', 'quick cash',
                'guaranteed', '500%', 'returns'
            ],
            'Misleading Content': [
                'fake offer', 'limited time only', 'act now', 'urgent',
                'this is not a scam', 'too good to be true', 'exclusive deal',
                'secret method', 'doctors hate this', 'one weird trick', 'miracle'
            ],
            'Inappropriate Content': [
                'abuse', 'hate', 'discrimination', 'harassment', 'bullying',
                'violence', 'threat', 'spam', 'scam', 'fraud'
            ],
            'Health Misinformation': [
                'miracle cure', 'instant weight loss', 'lose weight overnight',
                'cure cancer', 'fda approved', 'doctor recommended', 'medical breakthrough',
                'secret formula', 'ancient remedy', 'cure', 'solve all your health problems'
            ],
            'Investment Scam': [
                'crypto giveaway', 'bitcoin doubler', 'investment opportunity',
                'ponzi scheme', 'pyramid scheme', 'mlm opportunity', 'passive income guaranteed',
                'crypto trading bot', 'secret crypto'
            ]
        };
        
        // Search for violation patterns
        Object.entries(violationPatterns).forEach(([violationType, patterns]) => {
            patterns.forEach(pattern => {
                const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                let match;
                
                while ((match = regex.exec(content)) !== null) {
                    violations.push({
                        phrase: pattern,
                        type: violationType,
                        position: match.index,
                        originalPhrase: match[0],
                        wordPosition: getWordPosition(content, match.index, match.index + match[0].length - 1)
                    });
                }
            });
        });
        
        return violations;
    }
    
    function getWordPosition(text, startChar, endChar) {
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
    
    function getViolationClass(violationType) {
        const classMap = {
            'Financial Violation': 'financial-violation',
            'Misleading Content': 'misleading-violation',
            'Inappropriate Content': 'inappropriate-violation',
            'Health Misinformation': 'health-violation',
            'Investment Scam': 'investment-violation'
        };
        return classMap[violationType] || 'general-violation';
    }

    // Auto-refresh data every 30 seconds
    setInterval(() => {
        loadDashboardData();
    }, 30000);
});

// Add custom styles for the dashboard
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .chart-container {
        height: 300px;
    }
    
    .chart-container canvas {
        max-height: 250px;
    }
    
    .violations-table table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    
    .violations-table th {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem;
        text-align: left;
    }
    
    .violations-table td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e1e8ff;
    }
    
    .violations-table tr:hover {
        background: #f8f9ff;
    }
    
    
    .error-banner {
        animation: slideDown 0.5s ease;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Violation highlighting styles */
    .violation-highlight {
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: bold;
        cursor: help;
        position: relative;
        animation: violationPulse 2s ease-in-out;
    }
    
    .financial-violation {
        background-color: #fee2e2;
        color: #dc2626;
        border: 1px solid #fca5a5;
    }
    
    .misleading-violation {
        background-color: #fef3c7;
        color: #d97706;
        border: 1px solid #fcd34d;
    }
    
    .inappropriate-violation {
        background-color: #fce7f3;
        color: #be185d;
        border: 1px solid #f9a8d4;
    }
    
    .health-violation {
        background-color: #ecfdf5;
        color: #059669;
        border: 1px solid #6ee7b7;
    }
    
    .investment-violation {
        background-color: #ede9fe;
        color: #7c3aed;
        border: 1px solid #c4b5fd;
    }
    
    .general-violation {
        background-color: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
    }
    
    @keyframes violationPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    /* Violation details styling */
    .violation-details {
        margin-top: 0.5rem;
    }
    
    .violation-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        margin: 0.25rem 0;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #ef4444;
    }
    
    .violation-word {
        font-weight: bold;
        color: #dc2626;
        background: #fee2e2;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
    }
    
    .violation-type {
        background: #3b82f6;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .violation-position {
        color: #6b7280;
        font-size: 0.75rem;
        font-style: italic;
    }
    
    /* Enhanced post content styling */
    .post-content {
        line-height: 1.6;
        margin: 0.75rem 0;
    }
    
    /* Tooltip for violation highlights */
    .violation-highlight:hover::after {
        content: attr(title);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        white-space: nowrap;
        z-index: 1000;
        opacity: 0;
        animation: tooltipFadeIn 0.3s ease forwards;
    }
    
    @keyframes tooltipFadeIn {
        to { opacity: 1; }
    }
`;
document.head.appendChild(dashboardStyles);
