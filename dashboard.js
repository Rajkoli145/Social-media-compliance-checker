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
            processAndDisplayData([]);
        }
    }

    async function loadDashboardData() {
        try {
            if (!window.db) {
                console.warn('Firestore not initialized. Showing empty state.');
                processAndDisplayData([]);
                return;
            }

            const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Fetch compliance checks from Firestore
            const q = query(collection(window.db, 'compliance-checks'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });

            if (data.length === 0) {
                // Show empty state instead of demo data
                processAndDisplayData([]);
                return;
            }

            processAndDisplayData(data);
            
        } catch (error) {
            console.error('Error loading data from Firestore:', error);
            showErrorMessage('Error loading data from database. Showing empty state.');
            processAndDisplayData([]);
        }
    }

    function loadDemoData() {
        // Demo data for testing with actual post content
        const demoData = [
            { 
                platform: 'instagram', 
                status: 'Compliant', 
                violationReason: 'None', 
                content: 'Check out our new sustainable product line! 🌱 Made with eco-friendly materials and designed to last. #Sustainability #EcoFriendly',
                createdAt: new Date('2024-10-01T10:30:00')
            },
            { 
                platform: 'twitter', 
                status: 'Non-Compliant', 
                violationReason: 'Financial Violation', 
                content: 'GUARANTEED 500% returns in just 30 days! No risk investment opportunity - DM us now for exclusive access! 💰💰💰',
                createdAt: new Date('2024-10-01T09:15:00')
            },
            { 
                platform: 'facebook', 
                status: 'Compliant', 
                violationReason: 'None', 
                content: 'Join us for our community workshop this Saturday! Learn new skills and meet like-minded people. Registration link in bio.',
                createdAt: new Date('2024-10-01T08:45:00')
            },
            { 
                platform: 'instagram', 
                status: 'Non-Compliant', 
                violationReason: 'Misleading Content', 
                content: 'This miracle cure will solve all your health problems overnight! Doctors hate this one simple trick! Order now!',
                createdAt: new Date('2024-09-30T16:20:00')
            },
            { 
                platform: 'linkedin', 
                status: 'Compliant', 
                violationReason: 'None', 
                content: 'Excited to share insights from our latest industry research. Key findings show 40% improvement in customer satisfaction.',
                createdAt: new Date('2024-09-30T14:10:00')
            },
            { 
                platform: 'twitter', 
                status: 'Non-Compliant', 
                violationReason: 'Financial Violation', 
                content: 'Secret crypto trading bot makes $10,000 daily! Limited time offer - only 50 spots available! Act fast!',
                createdAt: new Date('2024-09-30T12:30:00')
            },
            { 
                platform: 'ad-campaign', 
                status: 'Non-Compliant', 
                violationReason: 'Inappropriate Content', 
                content: 'Lose 50 pounds in 10 days with this weird trick! No diet, no exercise needed. Click here for instant results!',
                createdAt: new Date('2024-09-30T11:00:00')
            },
            { 
                platform: 'instagram', 
                status: 'Compliant', 
                violationReason: 'None', 
                content: 'Behind the scenes of our product development process. Quality and safety are our top priorities. #BTS #Quality',
                createdAt: new Date('2024-09-29T15:45:00')
            },
            { 
                platform: 'facebook', 
                status: 'Non-Compliant', 
                violationReason: 'Health Misinformation', 
                content: 'Vaccines are dangerous! This natural remedy is 100% effective and completely safe. Share to save lives!',
                createdAt: new Date('2024-09-29T13:20:00')
            },
            { 
                platform: 'tiktok', 
                status: 'Compliant', 
                violationReason: 'None', 
                content: 'Quick tutorial on our product features! Swipe for step-by-step instructions. Questions? Drop them below! ⬇️',
                createdAt: new Date('2024-09-29T10:15:00')
            }
        ];

        processAndDisplayData(demoData);
    }

    function processAndDisplayData(data) {
        // Store current data for modal display
        currentData = data;
        
        // Calculate statistics
        const stats = calculateStats(data);
        
        // Update stat cards
        updateStatCards(stats);
        
        // Update charts
        updateComplianceChart(stats);
        updatePlatformChart(stats);
        
        // Update violations table
        updateViolationsTable(stats.violationStats);
        
        // Update business funnel
        updateBusinessFunnel(stats);
        
        // Make stat cards clickable
        makeStatCardsClickable();
    }

    function calculateStats(data) {
        const totalPosts = data.length;
        const compliantPosts = data.filter(item => item.status === 'Compliant').length;
        const nonCompliantPosts = totalPosts - compliantPosts;
        const complianceRate = totalPosts > 0 ? Math.round((compliantPosts / totalPosts) * 100) : 0;

        // Platform statistics
        const platformStats = {};
        data.forEach(item => {
            if (!platformStats[item.platform]) {
                platformStats[item.platform] = { total: 0, compliant: 0 };
            }
            platformStats[item.platform].total++;
            if (item.status === 'Compliant') {
                platformStats[item.platform].compliant++;
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
        const complianceRates = platforms.map(platform => {
            const platformData = stats.platformStats[platform];
            return platformData.total > 0 ? Math.round((platformData.compliant / platformData.total) * 100) : 0;
        });

        platformChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')),
                datasets: [{
                    label: 'Compliance Rate (%)',
                    data: complianceRates,
                    backgroundColor: complianceRates.map(rate => 
                        rate >= 80 ? '#22c55e' : 
                        rate >= 60 ? '#f59e0b' : '#ef4444'
                    ),
                    borderColor: '#667eea',
                    borderWidth: 1
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
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const platform = platforms[context.dataIndex];
                                const platformData = stats.platformStats[platform];
                                return `Compliance Rate: ${context.parsed.y}% (${platformData.compliant}/${platformData.total})`;
                            }
                        }
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

    function updateBusinessFunnel(stats) {
        // Calculate funnel metrics based on compliance data
        const baseProspects = 1000;
        const qualifiedRate = stats.complianceRate / 100;
        const conversionRate = 0.15; // 15% of qualified leads convert
        const loyaltyRate = 0.3; // 30% become loyal customers

        const qualified = Math.round(baseProspects * qualifiedRate);
        const customers = Math.round(qualified * conversionRate);
        const loyal = Math.round(customers * loyaltyRate);
        const blocked = stats.nonCompliantPosts;

        // Update funnel numbers
        document.getElementById('prospectsCount').textContent = baseProspects.toLocaleString();
        document.getElementById('qualifiedCount').textContent = qualified.toLocaleString();
        document.getElementById('customersCount').textContent = customers.toLocaleString();
        document.getElementById('loyalCount').textContent = loyal.toLocaleString();
        document.getElementById('blockedCount').textContent = blocked.toLocaleString();

        // Add animation to funnel boxes
        animateFunnelBoxes();
    }

    function animateFunnelBoxes() {
        const funnelBoxes = document.querySelectorAll('.funnel-box');
        funnelBoxes.forEach((box, index) => {
            setTimeout(() => {
                box.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    box.style.transform = 'scale(1)';
                }, 300);
            }, index * 200);
        });
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
        
        let violationsHTML = '';
        if (!isCompliant && post.violationReason && post.violationReason !== 'None') {
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
        
        return `
            <div class="post-item">
                <div class="post-header">
                    <span class="post-platform">${post.platform.charAt(0).toUpperCase() + post.platform.slice(1).replace('-', ' ')}</span>
                    <span class="post-status ${isCompliant ? 'compliant' : 'non-compliant'}">
                        ${isCompliant ? '✅ Compliant' : '❌ Non-Compliant'}
                    </span>
                </div>
                <div class="post-content">
                    "${post.content || 'No content available'}"
                </div>
                ${violationsHTML}
                <div class="post-timestamp">
                    📅 ${formattedDate}
                </div>
            </div>
        `;
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
    
    .funnel-box {
        transition: transform 0.3s ease;
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
`;
document.head.appendChild(dashboardStyles);
