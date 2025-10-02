// Checker Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const complianceEngine = new ComplianceEngine();
    const form = document.getElementById('complianceForm');
    const contentTextarea = document.getElementById('content');
    const charCount = document.getElementById('charCount');
    const resultContainer = document.getElementById('result');
    const checkButton = document.getElementById('checkButton');

    // Character count functionality
    contentTextarea.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        // Change color based on length
        if (count > 2000) {
            charCount.style.color = '#ef4444';
        } else if (count > 1500) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#666';
        }
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const content = formData.get('content').trim();
        const platform = formData.get('platform');

        if (!content || !platform) {
            showError('Please fill in all required fields.');
            return;
        }

        // Show loading state
        showLoading(true);

        try {
            // Check compliance
            const result = await checkCompliance(content, platform);
            
            // Save to Firebase
            await saveToFirestore(content, platform, result);
            
            // Display result
            displayResult(result, content, platform);
            
        } catch (error) {
            console.error('Error checking compliance:', error);
            showError('An error occurred while checking compliance. Please try again.');
        } finally {
            showLoading(false);
        }
    });

    // Check compliance function
    async function checkCompliance(content, platform) {
        // Simulate API delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return complianceEngine.checkCompliance(content, platform);
    }

    // Save result to Firestore
    async function saveToFirestore(content, platform, result) {
        try {
            if (!window.db) {
                console.warn('Firestore not initialized. Skipping data save.');
                showFirebaseWarning();
                return;
            }

            const { addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const docData = {
                postId: generatePostId(),
                platform: platform,
                content: content.substring(0, 500), // Limit content length for storage
                status: result.isCompliant ? 'Compliant' : 'Non-Compliant',
                violationReason: result.violations.map(v => v.type).join(', ') || 'None',
                violations: result.violations,
                riskLevel: result.riskLevel,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(window.db, 'compliance-checks'), docData);
            console.log('✓ Compliance check saved to Firestore successfully');
            
        } catch (error) {
            console.error('✗ Error saving to Firestore:', error);
            showFirebaseError(error);
            // Don't throw error - allow the app to continue working without Firebase
        }
    }

    // Generate unique post ID
    function generatePostId() {
        return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Show Firebase connection warning
    function showFirebaseWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'firebase-warning';
        warningDiv.innerHTML = `
            <div style="background: #fef3cd; border: 1px solid #d97706; color: #92400e; padding: 0.75rem; border-radius: 8px; margin: 1rem 0; font-size: 0.9rem;">
                <strong>⚠️ Firebase Not Connected:</strong> Data is not being saved. Check your Firebase configuration and security rules.
            </div>
        `;
        
        const formContainer = document.querySelector('.form-container');
        if (formContainer && !document.querySelector('.firebase-warning')) {
            formContainer.insertBefore(warningDiv, formContainer.firstChild);
            
            // Remove warning after 8 seconds
            setTimeout(() => {
                if (warningDiv.parentNode) {
                    warningDiv.parentNode.removeChild(warningDiv);
                }
            }, 8000);
        }
    }

    // Show Firebase error details
    function showFirebaseError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'firebase-error';
        errorDiv.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem; border-radius: 8px; margin: 1rem 0; font-size: 0.9rem;">
                <strong>🔥 Firebase Connection Error:</strong><br>
                ${error.code ? `Error Code: ${error.code}<br>` : ''}
                Check your Firestore security rules and network connection.<br>
                <small>The app will continue to work without data persistence.</small>
            </div>
        `;
        
        const formContainer = document.querySelector('.form-container');
        if (formContainer && !document.querySelector('.firebase-error')) {
            formContainer.insertBefore(errorDiv, formContainer.firstChild);
            
            // Remove error after 10 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 10000);
        }
    }

    // Display compliance result
    function displayResult(result, content, platform) {
        resultContainer.innerHTML = '';
        resultContainer.style.display = 'block';
        
        // Add appropriate class for styling
        resultContainer.className = 'result-container ' + (result.isCompliant ? 'compliant' : 'non-compliant');
        
        // Create highlighted text if there are violations
        const highlightedContent = result.violations.length > 0 ? 
            complianceEngine.createHighlightedText(content, result.violations) : 
            content;
        
        // Create result HTML
        const resultHTML = `
            <div class="result-header">
                <div class="result-icon">
                    <span class="material-symbols-outlined" style="color: ${result.isCompliant ? '#16A34A' : '#DC2626'}">${result.isCompliant ? 'check_circle' : 'cancel'}</span>
                </div>
                <div class="result-title ${result.isCompliant ? 'compliant' : 'non-compliant'}">
                    ${result.isCompliant ? 'Content is Compliant' : 'Content Violates Compliance Rules'}
                </div>
            </div>
            
            <div class="result-summary">
                <p><strong>Platform:</strong> ${platform.charAt(0).toUpperCase() + platform.slice(1)}</p>
                <p><strong>Risk Level:</strong> <span class="risk-${result.riskLevel.toLowerCase()}">${result.riskLevel}</span></p>
                <p><strong>Summary:</strong> ${result.summary}</p>
            </div>
            
            ${result.violations.length > 0 ? createHighlightedTextSection(highlightedContent) : ''}
            ${result.violations.length > 0 ? createViolationDetails(result.violations) : ''}
            
            <div class="result-actions">
                <button onclick="checkAnotherPost()" class="secondary-button">Check Another Post</button>
                <a href="index.html" class="cta-button">View Dashboard</a>
            </div>
        `;
        
        resultContainer.innerHTML = resultHTML;
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Create highlighted text section
    function createHighlightedTextSection(highlightedContent) {
        return `
            <div class="highlighted-text-section">
                <h4>Your Content with Violations Highlighted:</h4>
                <div class="highlighted-content">${highlightedContent}</div>
                <p class="highlight-legend">
                    <small>Hover over highlighted text to see violation type</small>
                </p>
            </div>
        `;
    }

    // Create violation details HTML with word positions
    function createViolationDetails(violations) {
        const violationsByType = {};
        violations.forEach(violation => {
            if (!violationsByType[violation.type]) {
                violationsByType[violation.type] = [];
            }
            violationsByType[violation.type].push(violation);
        });

        let detailsHTML = '<div class="violation-details">';
        detailsHTML += '<h4>Violation Details:</h4>';
        
        Object.keys(violationsByType).forEach(type => {
            detailsHTML += `<div class="violation-category">`;
            detailsHTML += `<h5>${type}</h5>`;
            detailsHTML += `<ul class="violation-list">`;
            
            violationsByType[type].forEach(violation => {
                detailsHTML += `<li>`;
                detailsHTML += `<strong>Issue:</strong> ${violation.phrase}`;
                
                // Show word position if available, otherwise fall back to character position
                if (violation.wordPosition) {
                    detailsHTML += ` <em>(${violation.wordPosition})</em>`;
                } else if (violation.position !== undefined) {
                    detailsHTML += ` <em>(Character: ${violation.position})</em>`;
                }
                detailsHTML += `</li>`;
            });
            
            detailsHTML += `</ul></div>`;
        });
        
        detailsHTML += '</div>';
        return detailsHTML;
    }

    // Show loading state
    function showLoading(isLoading) {
        const buttonText = checkButton.querySelector('.button-text');
        const loadingSpinner = checkButton.querySelector('.loading-spinner');
        
        if (isLoading) {
            buttonText.style.display = 'none';
            loadingSpinner.style.display = 'inline';
            checkButton.disabled = true;
        } else {
            buttonText.style.display = 'inline';
            loadingSpinner.style.display = 'none';
            checkButton.disabled = false;
        }
    }

    // Show error message
    function showError(message) {
        resultContainer.innerHTML = `
            <div class="error-message">
                <div class="result-header">
                    <div class="result-icon">⚠️</div>
                    <div class="result-title non-compliant">Error</div>
                </div>
                <p>${message}</p>
            </div>
        `;
        resultContainer.style.display = 'block';
        resultContainer.className = 'result-container non-compliant';
    }

    // Global function to check another post
    window.checkAnotherPost = function() {
        form.reset();
        resultContainer.style.display = 'none';
        charCount.textContent = '0';
        contentTextarea.focus();
    };

    // Add some example content for demo purposes
    const exampleButton = document.createElement('button');
    exampleButton.type = 'button';
    exampleButton.className = 'secondary-button';
    exampleButton.textContent = 'Load Example';
    exampleButton.style.marginTop = '1rem';
    exampleButton.onclick = function() {
        document.getElementById('platform').value = 'instagram';
        contentTextarea.value = 'Get rich quick with our amazing free money opportunity! Click here now for guaranteed profits! 🤑💰';
        contentTextarea.dispatchEvent(new Event('input'));
    };
    
    form.appendChild(exampleButton);
});

// Add CSS for risk levels
const style = document.createElement('style');
style.textContent = `
    .risk-low { color: #22c55e; font-weight: bold; }
    .risk-medium { color: #f59e0b; font-weight: bold; }
    .risk-high { color: #ef4444; font-weight: bold; }
    
    .violation-category {
        margin-bottom: 1rem;
        padding: 1rem;
        background: rgba(239, 68, 68, 0.05);
        border-radius: 8px;
        border-left: 3px solid #ef4444;
    }
    
    .violation-category h5 {
        color: #ef4444;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }
    
    .error-message {
        text-align: center;
        padding: 2rem;
    }
    
    .result-actions {
        margin-top: 2rem;
        text-align: center;
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .result-actions button,
    .result-actions a {
        margin: 0;
    }
    
    .result-actions .secondary-button {
        background: #FFFFFF !important;
        color: #1F2937 !important;
        border: 2px solid #374151 !important;
        font-weight: 700 !important;
        padding: 12px 24px !important;
        border-radius: 12px !important;
        text-decoration: none !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
    }
    
    .result-actions .secondary-button:hover {
        background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%) !important;
        color: #FFFFFF !important;
        border-color: #8B5CF6 !important;
        transform: translateY(-3px) scale(1.05) !important;
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4) !important;
    }
`;
document.head.appendChild(style);
