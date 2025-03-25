document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let allSubmissions = [];
    let currentPage = 1;
    let entriesPerPage = 10;
    let sortField = 'id';
    let sortDirection = 'desc';
    let searchQuery = '';
    
    // DOM Elements
    const tableBody = document.getElementById('tableBody');
    const pagination = document.getElementById('pagination');
    const entriesSelect = document.getElementById('entriesSelect');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportCSV = document.getElementById('exportCSV');
    const startEntry = document.getElementById('startEntry');
    const endEntry = document.getElementById('endEntry');
    const totalEntries = document.getElementById('totalEntries');
    
    // Modal Elements
    const modal = document.getElementById('messageModal');
    const closeModal = document.querySelector('.close');
    const modalName = document.getElementById('modalName');
    const modalEmail = document.getElementById('modalEmail');
    const modalSubject = document.getElementById('modalSubject');
    const modalDate = document.getElementById('modalDate');
    const modalMessage = document.getElementById('modalMessage');
    
    // Initialize
    fetchSubmissions();
    
    // Event Listeners
    entriesSelect.addEventListener('change', function() {
        entriesPerPage = parseInt(this.value);
        currentPage = 1;
        renderTable();
    });
    
    searchBtn.addEventListener('click', function() {
        searchQuery = searchInput.value.trim().toLowerCase();
        currentPage = 1;
        renderTable();
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            renderTable();
        }
    });
    
    refreshBtn.addEventListener('click', fetchSubmissions);
    
    exportCSV.addEventListener('click', exportToCSV);
    
    // Sort table when clicking on headers
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            const field = this.getAttribute('data-sort');
            
            // If clicking the same header, toggle direction
            if (field === sortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            
            // Update sort icons
            updateSortIcons();
            
            // Re-render table with new sort
            renderTable();
        });
    });
    
    // Close modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Functions
    function fetchSubmissions() {
        // Show loading state
        tableBody.innerHTML = '<tr class="loading-row"><td colspan="7">Loading submissions...</td></tr>';
        
        // Fetch data from API
        fetch('http://localhost:5000/api/contact')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.data) {
                    allSubmissions = data.data;
                    renderTable();
                } else {
                    throw new Error('Invalid data format');
                }
            })
            .catch(error => {
                console.error('Error fetching submissions:', error);
                tableBody.innerHTML = `<tr class="error-row"><td colspan="7">Error loading data: ${error.message}. Please try again.</td></tr>`;
            });
    }
    
    function renderTable() {
        // Filter submissions based on search query
        let filteredSubmissions = allSubmissions;
        
        if (searchQuery) {
            filteredSubmissions = allSubmissions.filter(submission => {
                return (
                    submission.name.toLowerCase().includes(searchQuery) ||
                    submission.email.toLowerCase().includes(searchQuery) ||
                    submission.subject.toLowerCase().includes(searchQuery) ||
                    submission.message.toLowerCase().includes(searchQuery)
                );
            });
        }
        
        // Sort submissions
        filteredSubmissions.sort((a, b) => {
            let valueA = a[sortField];
            let valueB = b[sortField];
            
            // Handle date sorting
            if (sortField === 'date' || sortField === 'submission_date') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }
            
            if (valueA < valueB) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        // Calculate pagination
        const totalSubmissions = filteredSubmissions.length;
        const totalPages = Math.ceil(totalSubmissions / entriesPerPage);
        
        // Adjust current page if needed
        if (currentPage > totalPages) {
            currentPage = totalPages || 1;
        }
        
        const start = (currentPage - 1) * entriesPerPage;
        const end = Math.min(start + entriesPerPage, totalSubmissions);
        const paginatedSubmissions = filteredSubmissions.slice(start, end);
        
        // Update table info
        startEntry.textContent = totalSubmissions ? start + 1 : 0;
        endEntry.textContent = end;
        totalEntries.textContent = totalSubmissions;
        
        // Render table rows
        tableBody.innerHTML = '';
        
        if (paginatedSubmissions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7">No submissions found</td></tr>';
            return;
        }
        
        paginatedSubmissions.forEach(submission => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(submission.submission_date);
            const formattedDate = date.toLocaleString();
            
            // Create message preview
            const messagePreview = submission.message.length > 50 
                ? submission.message.substring(0, 50) + '...' 
                : submission.message;
            
            row.innerHTML = `
                <td>${submission.id}</td>
                <td>${escapeHtml(submission.name)}</td>
                <td>${escapeHtml(submission.email)}</td>
                <td>${escapeHtml(submission.subject)}</td>
                <td class="message-preview">${escapeHtml(messagePreview)}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="action-btn view-btn" data-id="${submission.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn delete-btn" data-id="${submission.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const submission = allSubmissions.find(s => s.id === id);
                
                if (submission) {
                    showModal(submission);
                }
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                if (confirm('Are you sure you want to delete this submission?')) {
                    deleteSubmission(id);
                }
            });
        });
        
        // Render pagination
        renderPagination(totalPages);
    }
    
    function renderPagination(totalPages) {
        pagination.innerHTML = '';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        pagination.appendChild(prevBtn);
        
        // Page buttons
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4 && totalPages > 5) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.classList.toggle('active', i === currentPage);
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
            });
            pagination.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
        pagination.appendChild(nextBtn);
    }
    
    function updateSortIcons() {
        document.querySelectorAll('th[data-sort]').forEach(th => {
            const field = th.getAttribute('data-sort');
            const icon = th.querySelector('i');
            
            if (field === sortField) {
                icon.className = sortDirection === 'asc' 
                    ? 'fas fa-sort-up' 
                    : 'fas fa-sort-down';
            } else {
                icon.className = 'fas fa-sort';
            }
        });
    }
    
    function showModal(submission) {
        modalName.textContent = submission.name;
        modalEmail.textContent = submission.email;
        modalSubject.textContent = submission.subject;
        modalDate.textContent = new Date(submission.submission_date).toLocaleString();
        modalMessage.textContent = submission.message;
        
        modal.style.display = 'block';
    }
    
    function deleteSubmission(id) {
        // In a real application, you would send a DELETE request to your API
        // For this example, we'll just remove it from the local array
        fetch(`http://localhost:5000/api/contact/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete submission');
            }
            return response.json();
        })
        .then(data => {
            // Remove from local array
            allSubmissions = allSubmissions.filter(s => s.id !== id);
            renderTable();
            alert('Submission deleted successfully');
        })
        .catch(error => {
            console.error('Error deleting submission:', error);
            alert('Error deleting submission: ' + error.message);
        });
    }
    
    function exportToCSV() {
        // Filter submissions based on search query
        let filteredSubmissions = allSubmissions;
        
        if (searchQuery) {
            filteredSubmissions = allSubmissions.filter(submission => {
                return (
                    submission.name.toLowerCase().includes(searchQuery) ||
                    submission.email.toLowerCase().includes(searchQuery) ||
                    submission.subject.toLowerCase().includes(searchQuery) ||
                    submission.message.toLowerCase().includes(searchQuery)
                );
            });
        }
        
        if (filteredSubmissions.length === 0) {
            alert('No data to export');
            return;
        }
        
        // Create CSV content
        const headers = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Date'];
        let csvContent = headers.join(',') + '\n';
        
        filteredSubmissions.forEach(submission => {
            const row = [
                submission.id,
                `"${submission.name.replace(/"/g, '""')}"`,
                `"${submission.email.replace(/"/g, '""')}"`,
                `"${submission.subject.replace(/"/g, '""')}"`,
                `"${submission.message.replace(/"/g, '""')}"`,
                `"${new Date(submission.submission_date).toLocaleString()}"`
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'contact_submissions.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}); 