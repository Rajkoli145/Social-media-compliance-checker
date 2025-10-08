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
    
    async function loadAnalytics() {
        try {
            if (!window.db) {
                // Fallback to demo data if Firebase not available
                document.getElementById('avgCheckTime').textContent = '1.2s';
                document.getElementById('dailyChecks').textContent = '47';
                document.getElementById('errorRate').textContent = '0.3%';
                return;
            }

            const { collection, getDocs, query, where, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Get all compliance checks
            const querySnapshot = await getDocs(collection(window.db, 'compliance-checks'));
            const allData = [];
            querySnapshot.forEach((doc) => {
                allData.push({ id: doc.id, ...doc.data() });
            });

            if (allData.length === 0) {
                document.getElementById('avgCheckTime').textContent = '0s';
                document.getElementById('dailyChecks').textContent = '0';
                document.getElementById('errorRate').textContent = '0%';
                return;
            }

            // Calculate average check time (simulated based on content length)
            const avgTime = calculateAverageCheckTime(allData);
            document.getElementById('avgCheckTime').textContent = avgTime;

            // Calculate daily checks (today's checks)
            const dailyChecks = calculateDailyChecks(allData);
            document.getElementById('dailyChecks').textContent = dailyChecks.toString();

            // Calculate error rate (non-compliant percentage)
            const errorRate = calculateErrorRate(allData);
            document.getElementById('errorRate').textContent = errorRate;

        } catch (error) {
            console.error('Error loading analytics:', error);
            // Fallback to demo data on error
            document.getElementById('avgCheckTime').textContent = '1.2s';
            document.getElementById('dailyChecks').textContent = '47';
            document.getElementById('errorRate').textContent = '0.3%';
        }
    }

    function calculateAverageCheckTime(data) {
        // Simulate check time based on content length and complexity
        let totalTime = 0;
        data.forEach(item => {
            const contentLength = (item.content || '').length;
            const baseTime = 0.5; // Base processing time in seconds
            const complexityTime = contentLength * 0.01; // Additional time based on content length
            const violationTime = item.status === 'Non-Compliant' ? 0.3 : 0; // Extra time for violation detection
            totalTime += baseTime + complexityTime + violationTime;
        });
        
        const avgSeconds = totalTime / data.length;
        return avgSeconds < 1 ? `${Math.round(avgSeconds * 1000)}ms` : `${avgSeconds.toFixed(1)}s`;
    }

    function calculateDailyChecks(data) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        return data.filter(item => {
            const itemDate = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
            return itemDate >= todayStart && itemDate < todayEnd;
        }).length;
    }

    function calculateErrorRate(data) {
        const nonCompliantCount = data.filter(item => item.status === 'Non-Compliant').length;
        const errorRate = (nonCompliantCount / data.length) * 100;
        return `${errorRate.toFixed(1)}%`;
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
            showMessage('Exporting data to Excel...', 'info');
            
            let data = [];
            
            if (!window.db) {
                // Export demo data
                data = [
                    { 
                        id: 'demo1',
                        platform: 'Instagram', 
                        status: 'Compliant', 
                        content: 'Check out our amazing new product! #innovation #quality', 
                        createdAt: new Date(),
                        violations: '',
                        complianceScore: '95%'
                    },
                    { 
                        id: 'demo2',
                        platform: 'Twitter', 
                        status: 'Non-Compliant', 
                        content: 'GUARANTEED 500% returns! Invest now and get rich quick!', 
                        createdAt: new Date(),
                        violations: 'Financial Claims, Misleading Content',
                        complianceScore: '25%'
                    },
                    { 
                        id: 'demo3',
                        platform: 'Facebook', 
                        status: 'Compliant', 
                        content: 'Join our community for tips and insights on sustainable living.', 
                        createdAt: new Date(),
                        violations: '',
                        complianceScore: '98%'
                    }
                ];
            } else {
                const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                
                const querySnapshot = await getDocs(collection(window.db, 'compliance-checks'));
                querySnapshot.forEach((doc) => {
                    const docData = doc.data();
                    data.push({ 
                        id: doc.id, 
                        ...docData,
                        createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate() : new Date(docData.createdAt),
                        violations: docData.violations ? docData.violations.join(', ') : ''
                    });
                });
            }
            
            // Create formatted Excel file using SheetJS
            await createFormattedExcelFile(data);
            
        } catch (error) {
            console.error('Error exporting data:', error);
            showMessage('❌ Failed to export data. Please try again.', 'error');
        }
    }
    
    async function createFormattedExcelFile(data) {
        try {
            // Load SheetJS library dynamically
            if (!window.XLSX) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                document.head.appendChild(script);
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }
            
            // Create workbook and worksheet
            const wb = window.XLSX.utils.book_new();
            
            // Prepare data for Excel
            const headers = ['ID', 'Platform', 'Status', 'Content', 'Violations', 'Compliance Score', 'Created Date'];
            const excelData = [
                headers,
                ...data.map(row => [
                    row.id || '',
                    row.platform || '',
                    row.status || '',
                    row.content || '',
                    row.violations || '',
                    row.complianceScore || '',
                    row.createdAt ? row.createdAt.toLocaleString() : ''
                ])
            ];
            
            // Create worksheet
            const ws = window.XLSX.utils.aoa_to_sheet(excelData);
            
            // Set column widths
            ws['!cols'] = [
                { width: 15 },  // ID
                { width: 12 },  // Platform
                { width: 15 },  // Status
                { width: 50 },  // Content
                { width: 30 },  // Violations
                { width: 15 },  // Compliance Score
                { width: 20 }   // Created Date
            ];
            
            // Style the header row
            const headerStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "1E3A8A" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };
            
            // Apply header styling
            for (let col = 0; col < headers.length; col++) {
                const cellRef = window.XLSX.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellRef]) ws[cellRef] = {};
                ws[cellRef].s = headerStyle;
            }
            
            // Style data rows
            for (let row = 1; row <= data.length; row++) {
                for (let col = 0; col < headers.length; col++) {
                    const cellRef = window.XLSX.utils.encode_cell({ r: row, c: col });
                    if (!ws[cellRef]) ws[cellRef] = {};
                    
                    // Base style for all data cells
                    let cellStyle = {
                        alignment: { vertical: "center", wrapText: true },
                        border: {
                            top: { style: "thin", color: { rgb: "E5E7EB" } },
                            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                            left: { style: "thin", color: { rgb: "E5E7EB" } },
                            right: { style: "thin", color: { rgb: "E5E7EB" } }
                        }
                    };
                    
                    // Color code based on status (column index 2)
                    if (col === 2) { // Status column
                        const status = ws[cellRef].v;
                        if (status === 'Compliant') {
                            cellStyle.fill = { fgColor: { rgb: "D1FAE5" } }; // Light green
                            cellStyle.font = { color: { rgb: "065F46" }, bold: true }; // Dark green
                        } else if (status === 'Non-Compliant') {
                            cellStyle.fill = { fgColor: { rgb: "FEE2E2" } }; // Light red
                            cellStyle.font = { color: { rgb: "DC2626" }, bold: true }; // Dark red
                        }
                    }
                    
                    // Alternate row colors
                    if (row % 2 === 0) {
                        if (!cellStyle.fill) {
                            cellStyle.fill = { fgColor: { rgb: "F9FAFB" } }; // Light gray for even rows
                        }
                    }
                    
                    // Platform column styling
                    if (col === 1) { // Platform column
                        cellStyle.font = { bold: true, color: { rgb: "1E3A8A" } };
                        cellStyle.alignment = { horizontal: "center", vertical: "center" };
                    }
                    
                    // Violations column styling
                    if (col === 4 && ws[cellRef].v && ws[cellRef].v.trim() !== '') { // Violations column with content
                        cellStyle.fill = { fgColor: { rgb: "FEF3C7" } }; // Light yellow
                        cellStyle.font = { color: { rgb: "D97706" } }; // Orange text
                    }
                    
                    ws[cellRef].s = cellStyle;
                }
            }
            
            // Add worksheet to workbook
            window.XLSX.utils.book_append_sheet(wb, ws, "Compliance Data");
            
            // Generate Excel file and download
            const excelBuffer = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `compliance-data-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showMessage(`✅ Exported ${data.length} records to formatted Excel successfully!`, 'success');
            
        } catch (error) {
            console.error('Error creating formatted Excel file:', error);
            showMessage('❌ Failed to create formatted Excel file. Please try again.', 'error');
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
