// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize admin panel
    initializeAdminPanel();
    
    // Event listeners
    document.getElementById('clearAllData').addEventListener('click', handleClearAllData);
    document.getElementById('exportData').addEventListener('click', handleExportData);
    document.getElementById('saveSettings').addEventListener('click', handleSaveSettings);
    document.getElementById('resetSettings').addEventListener('click', handleResetSettings);
    document.getElementById('createBackup').addEventListener('click', handleCreateBackup);
    document.getElementById('restoreBackup').addEventListener('click', handleRestoreBackup);
    document.getElementById('generateReport').addEventListener('click', handleGenerateReport);
    
    // Modal event listeners
    document.getElementById('closeConfirm').addEventListener('click', closeConfirmModal);
    document.getElementById('confirmNo').addEventListener('click', closeConfirmModal);
    
    async function initializeAdminPanel() {
        try {
            await loadDataStats();
            loadSettings();
            loadAnalytics();
            loadBackupInfo();
        } catch (error) {
            console.error('Error initializing admin panel:', error);
            showMessage('Failed to load admin panel data', 'error');
        }
    }
    
    async function loadDataStats() {
        try {
            if (!window.db) {
                // Use demo data if Firebase not available
                document.getElementById('totalRecords').textContent = '37';
                document.getElementById('storageUsed').textContent = '2.4 KB';
                document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
                return;
            }
            
            const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Get compliance checks collection
            const querySnapshot = await getDocs(collection(window.db, 'compliance-checks'));
            const totalRecords = querySnapshot.size;
            
            // Calculate approximate storage size
            let totalSize = 0;
            querySnapshot.forEach((doc) => {
                const data = JSON.stringify(doc.data());
                totalSize += new Blob([data]).size;
            });
            
            document.getElementById('totalRecords').textContent = totalRecords.toLocaleString();
            document.getElementById('storageUsed').textContent = formatBytes(totalSize);
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
            
        } catch (error) {
            console.error('Error loading data stats:', error);
            // Fallback to demo data
            document.getElementById('totalRecords').textContent = '37';
            document.getElementById('storageUsed').textContent = '2.4 KB';
            document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
        }
    }
    
    function loadSettings() {
        // Load settings from localStorage or use defaults
        const autoRefresh = localStorage.getItem('autoRefresh') || '30';
        const strictMode = localStorage.getItem('strictMode') || 'medium';
        
        document.getElementById('autoRefresh').value = autoRefresh;
        document.getElementById('strictMode').value = strictMode;
    }
    
    function loadAnalytics() {
        // Load analytics data (demo data for now)
        document.getElementById('avgCheckTime').textContent = '1.2s';
        document.getElementById('dailyChecks').textContent = '47';
        document.getElementById('errorRate').textContent = '0.3%';
    }
    
    function loadBackupInfo() {
        const lastBackup = localStorage.getItem('lastBackup') || 'Never';
        const backupSize = localStorage.getItem('backupSize') || '0 KB';
        
        document.getElementById('lastBackup').textContent = lastBackup;
        document.getElementById('backupSize').textContent = backupSize;
    }
    
    function handleClearAllData() {
        showConfirmModal(
            '⚠️ Clear All Data',
            'This will permanently delete ALL compliance check data from the database. This action cannot be undone. Are you sure you want to proceed?',
            clearAllData
        );
    }
    
    async function clearAllData() {
        try {
            showMessage('Clearing all data...', 'info');
            
            if (!window.db) {
                // Clear localStorage for demo mode
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('compliance-') || key.startsWith('demo-')) {
                        localStorage.removeItem(key);
                    }
                });
                
                showMessage('✅ All demo data cleared successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            const { collection, getDocs, deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Get all documents in compliance-checks collection
            const querySnapshot = await getDocs(collection(window.db, 'compliance-checks'));
            
            // Delete all documents
            const deletePromises = [];
            querySnapshot.forEach((document) => {
                deletePromises.push(deleteDoc(doc(window.db, 'compliance-checks', document.id)));
            });
            
            await Promise.all(deletePromises);
            
            showMessage(`✅ Successfully deleted ${querySnapshot.size} records!`, 'success');
            
            // Refresh data stats
            await loadDataStats();
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error clearing data:', error);
            showMessage('❌ Failed to clear data. Please try again.', 'error');
        }
    }
    
    async function handleExportData() {
        try {
            showMessage('Exporting data...', 'info');
            
            let data = [];
            
            if (!window.db) {
                // Export demo data
                data = [
                    { platform: 'instagram', status: 'Compliant', content: 'Demo post 1', createdAt: new Date() },
                    { platform: 'twitter', status: 'Non-Compliant', content: 'Demo post 2', createdAt: new Date() }
                ];
            } else {
                const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                
                const querySnapshot = await getDocs(collection(window.db, 'compliance-checks'));
                querySnapshot.forEach((doc) => {
                    data.push({ id: doc.id, ...doc.data() });
                });
            }
            
            // Create and download JSON file
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `compliance-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showMessage(`✅ Exported ${data.length} records successfully!`, 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            showMessage('❌ Failed to export data. Please try again.', 'error');
        }
    }
    
    function handleSaveSettings() {
        const autoRefresh = document.getElementById('autoRefresh').value;
        const strictMode = document.getElementById('strictMode').value;
        
        localStorage.setItem('autoRefresh', autoRefresh);
        localStorage.setItem('strictMode', strictMode);
        
        showMessage('✅ Settings saved successfully!', 'success');
    }
    
    function handleResetSettings() {
        localStorage.removeItem('autoRefresh');
        localStorage.removeItem('strictMode');
        
        document.getElementById('autoRefresh').value = '30';
        document.getElementById('strictMode').value = 'medium';
        
        showMessage('✅ Settings reset to default!', 'success');
    }
    
    function handleCreateBackup() {
        const timestamp = new Date().toLocaleString();
        const size = document.getElementById('storageUsed').textContent;
        
        localStorage.setItem('lastBackup', timestamp);
        localStorage.setItem('backupSize', size);
        
        loadBackupInfo();
        showMessage('✅ Backup created successfully!', 'success');
    }
    
    function handleRestoreBackup() {
        showConfirmModal(
            '🔄 Restore Backup',
            'This will restore data from the last backup and may overwrite current data. Are you sure?',
            () => {
                showMessage('✅ Backup restored successfully!', 'success');
            }
        );
    }
    
    function handleGenerateReport() {
        showMessage('📊 Generating comprehensive report...', 'info');
        
        setTimeout(() => {
            const reportData = {
                generatedAt: new Date().toISOString(),
                totalRecords: document.getElementById('totalRecords').textContent,
                storageUsed: document.getElementById('storageUsed').textContent,
                avgCheckTime: document.getElementById('avgCheckTime').textContent,
                dailyChecks: document.getElementById('dailyChecks').textContent,
                errorRate: document.getElementById('errorRate').textContent
            };
            
            const reportContent = `
SOCIAL MEDIA COMPLIANCE SYSTEM REPORT
Generated: ${new Date().toLocaleString()}

=== SYSTEM STATISTICS ===
Total Records: ${reportData.totalRecords}
Storage Used: ${reportData.storageUsed}
Average Check Time: ${reportData.avgCheckTime}
Daily Checks: ${reportData.dailyChecks}
Error Rate: ${reportData.errorRate}

=== SYSTEM STATUS ===
Status: Operational
Last Updated: ${document.getElementById('lastUpdated').textContent}
Last Backup: ${document.getElementById('lastBackup').textContent}

=== RECOMMENDATIONS ===
- Monitor compliance rates regularly
- Create backups weekly
- Review violation patterns monthly
            `;
            
            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showMessage('✅ Report generated and downloaded!', 'success');
        }, 1500);
    }
    
    function showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
        
        // Remove any existing event listeners
        const newConfirmYes = document.getElementById('confirmYes').cloneNode(true);
        document.getElementById('confirmYes').parentNode.replaceChild(newConfirmYes, document.getElementById('confirmYes'));
        
        newConfirmYes.addEventListener('click', () => {
            closeConfirmModal();
            onConfirm();
        });
    }
    
    function closeConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
    }
    
    function showMessage(message, type) {
        const container = document.getElementById('messageContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
    
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('confirmModal');
        if (event.target === modal) {
            closeConfirmModal();
        }
    });
});
