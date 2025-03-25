// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap modals
    const adminLoginModalEl = document.getElementById('adminLoginModal');
    const resumeUploadModalEl = document.getElementById('resumeUploadModal');
    
    let adminLoginModal, resumeUploadModal;
    
    if (adminLoginModalEl) {
        adminLoginModal = new bootstrap.Modal(adminLoginModalEl);
    }
    
    if (resumeUploadModalEl) {
        resumeUploadModal = new bootstrap.Modal(resumeUploadModalEl);
    }
    
    // Admin Login Form Functionality
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        // Generate CAPTCHA on page load
        generateCaptcha();
        
        // Refresh CAPTCHA button
        const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
        if (refreshCaptchaBtn) {
            refreshCaptchaBtn.addEventListener('click', generateCaptcha);
        }
        
        // Handle form submission
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            const captchaInput = document.getElementById('adminCaptcha').value;
            const captchaValue = sessionStorage.getItem('captcha');
            
            // Simple validation (in a real app, this would be server-side)
            if (username === 'admin' && password === 'admin123' && captchaInput === captchaValue) {
                // Store login state
                sessionStorage.setItem('adminLoggedIn', 'true');
                
                // Redirect to admin panel
                window.location.href = 'admin/index.html';
            } else {
                // Show error message
                alert('Invalid credentials or CAPTCHA. Please try again.');
                
                // Refresh CAPTCHA
                generateCaptcha();
                
                // Clear form
                document.getElementById('adminPassword').value = '';
                document.getElementById('adminCaptcha').value = '';
            }
        });
    }
    
    // Function to generate CAPTCHA
    function generateCaptcha() {
        const captchaDisplay = document.getElementById('captchaDisplay');
        if (!captchaDisplay) return;
        
        // Generate random alphanumeric string
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let captcha = '';
        
        for (let i = 0; i < 6; i++) {
            captcha += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        // Store captcha in session storage
        sessionStorage.setItem('captcha', captcha);
        
        // Display captcha
        captchaDisplay.textContent = captcha;
    }
    
    // View Resume Button Functionality
    const viewResumeBtn = document.getElementById('viewResumeBtn');
    if (viewResumeBtn) {
        viewResumeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the resume content
            const resumeContent = document.getElementById('resumeContent');
            if (!resumeContent) {
                console.error('Resume content not found');
                return;
            }
            
            // Create a new window for viewing the resume
            const resumeWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes');
            if (!resumeWindow) {
                alert('Please allow pop-ups to view the resume');
                return;
            }
            
            // Get necessary styles
            const styles = Array.from(document.styleSheets)
                .map(styleSheet => {
                    try {
                        return Array.from(styleSheet.cssRules)
                            .map(rule => rule.cssText)
                            .join('\n');
                    } catch (e) {
                        // Likely a CORS issue with external stylesheets
                        return `/* Could not access stylesheet ${styleSheet.href} */`;
                    }
                })
                .join('\n');
            
            // Create resume-specific styles
            const resumeStyles = `
                body {
                    font-family: 'Roboto', Arial, sans-serif;
                    background-color: #f8f9fa;
                    padding: 0;
                    margin: 0;
                }
                
                .resume-container {
                    max-width: 1140px;
                    margin: 0 auto;
                    padding: 30px 15px;
                }
                
                .resume-header-bar {
                    background-color: #198754;
                    color: white;
                    padding: 15px 0;
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .resume-header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 1140px;
                    margin: 0 auto;
                    padding: 0 15px;
                }
                
                .resume-title {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                
                .resume-actions-bar {
                    display: flex;
                    gap: 10px;
                }
                
                .resume-actions-bar button {
                    background-color: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background-color 0.3s;
                }
                
                .resume-actions-bar button:hover {
                    background-color: rgba(255, 255, 255, 0.3);
                }
                
                .resume-content {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                    margin-top: 30px;
                    overflow: hidden;
                }
                
                /* Hide the original resume actions */
                .resume-actions {
                    display: none !important;
                }
                
                @media print {
                    .resume-header-bar {
                        display: none !important;
                    }
                    
                    .resume-container {
                        padding: 0;
                    }
                    
                    .resume-content {
                        box-shadow: none;
                        margin-top: 0;
                    }
                }
            `;
            
            // Get the inner content of the resume (excluding the original resume-actions)
            const innerContent = resumeContent.innerHTML;
            
            // Create the resume document
            resumeWindow.document.open();
            resumeWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>John Doe - Resume</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
                    <style>
                        ${styles}
                        ${resumeStyles}
                    </style>
                </head>
                <body>
                    <div class="resume-header-bar">
                        <div class="resume-header-content">
                            <h1 class="resume-title">John Doe - Resume</h1>
                            <div class="resume-actions-bar">
                                <button onclick="window.print()">
                                    <i class="fas fa-print me-2"></i>Print
                                </button>
                                <button onclick="window.close()">
                                    <i class="fas fa-times me-2"></i>Close
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="resume-container">
                        <div class="resume-content">
                            ${innerContent}
                        </div>
                    </div>
                    
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
                </body>
                </html>
            `);
            resumeWindow.document.close();
        });
    }
    
    // Print Resume Functionality
    const printResumeBtn = document.getElementById('printResumeBtn');
    if (printResumeBtn) {
        printResumeBtn.addEventListener('click', function() {
            // Use the more reliable print window approach
            const resumeSection = document.getElementById('resume');
            if (!resumeSection) {
                console.error('Resume section not found');
                return;
            }
            
            // Create a new window for printing
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (!printWindow) {
                alert('Please allow pop-ups to print the resume');
                return;
            }
            
            // Get necessary styles
            const styles = Array.from(document.styleSheets)
                .map(styleSheet => {
                    try {
                        return Array.from(styleSheet.cssRules)
                            .map(rule => rule.cssText)
                            .join('\n');
                    } catch (e) {
                        // Likely a CORS issue with external stylesheets
                        return `/* Could not access stylesheet ${styleSheet.href} */`;
                    }
                })
                .join('\n');
            
            // Create print-specific styles
            const printStyles = `
                @media print {
                    body {
                        padding: 0;
                        margin: 0;
                    }
                    
                    .resume-actions {
                        display: none !important;
                    }
                    
                    .resume-modern {
                        box-shadow: none !important;
                    }
                    
                    .section-title {
                        margin-bottom: 20px !important;
                    }
                    
                    .resume-section {
                        page-break-inside: avoid;
                    }
                }
                
                body {
                    font-family: 'Roboto', Arial, sans-serif;
                    background-color: white;
                    padding: 20px;
                }
                
                .print-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .print-header h1 {
                    color: #198754;
                    margin-bottom: 5px;
                }
                
                .print-header p {
                    color: #6c757d;
                }
                
                .print-footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #6c757d;
                }
                
                .print-button {
                    text-align: center;
                    margin: 20px 0;
                }
                
                .print-button button {
                    background-color: #198754;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                }
                
                @media screen {
                    .print-only {
                        display: block;
                    }
                }
                
                @media print {
                    .print-only {
                        display: none !important;
                    }
                }
            `;
            
            // Get the resume content
            const resumeContent = resumeSection.innerHTML;
            
            // Create the print document
            printWindow.document.open();
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Resume - Print Version</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
                    <style>
                        ${styles}
                        ${printStyles}
                    </style>
                </head>
                <body>
                    <div class="print-only print-header">
                        <h1>Resume</h1>
                        <p>Print-friendly version</p>
                    </div>
                    
                    <div class="print-only print-button">
                        <button onclick="window.print(); return false;">Print Resume</button>
                    </div>
                    
                    ${resumeContent}
                    
                    <div class="print-only print-footer">
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <script>
                        // Auto-print on load
                        window.onload = function() {
                            // Remove any elements with class 'resume-actions'
                            const actionsElements = document.querySelectorAll('.resume-actions');
                            actionsElements.forEach(el => el.style.display = 'none');
                            
                            // Wait a moment for styles to load
                            setTimeout(() => {
                                window.print();
                            }, 1000);
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.navbar-nav a.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default if it's a hash link
            if (this.hash !== '') {
                e.preventDefault();
                
                const hash = this.hash;
                
                // Smooth scroll to the target element
                document.querySelector(hash).scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Update active link in navbar
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
                
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }
                
                // Update URL hash
                history.pushState(null, null, hash);
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        let scrollPosition = window.scrollY + 100; // Offset for navbar height
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;

            try {
                // Remove any existing alerts
                const existingAlerts = this.querySelectorAll('.alert');
                existingAlerts.forEach(alert => alert.remove());

                const response = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                // Create alert element
                const formAlert = document.createElement('div');
                formAlert.className = `alert ${response.ok ? 'alert-success' : 'alert-danger'} mt-3`;
                formAlert.innerHTML = `<i class="fas fa-${response.ok ? 'check-circle' : 'exclamation-circle'} me-2"></i>${data.message || data.error}`;
                
                this.appendChild(formAlert);

                // Reset form if successful
                if (response.ok) {
                    this.reset();
                }

                // Remove alert after 5 seconds
                setTimeout(() => {
                    formAlert.remove();
                }, 5000);

            } catch (error) {
                console.error('Error submitting form:', error);
                // Show server connection error
                const formAlert = document.createElement('div');
                formAlert.className = 'alert alert-danger mt-3';
                formAlert.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Server Connection Error:</strong> Please make sure the server is running and try again.<br>
                    <small class="text-muted">Technical details: ${error.message}</small>
                `;
                this.appendChild(formAlert);
            } finally {
                // Restore button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Add ID to the contact form for the form submission handler
    const contactFormElement = document.querySelector('#contact form');
    if (contactFormElement) {
        contactFormElement.id = 'contactForm';
    }

    // Resume Upload Functionality
    const resumeUploadForm = document.getElementById('resumeUploadForm');
    if (resumeUploadForm) {
        resumeUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const resumeFile = document.getElementById('resumeFile').files[0];
            const resumeTitle = document.getElementById('resumeTitle').value;
            const profileName = document.getElementById('profileName').value;
            const profileEmail = document.getElementById('profileEmail').value;
            const profilePhone = document.getElementById('profilePhone').value;
            const profileLocation = document.getElementById('profileLocation').value;
            
            if (resumeFile) {
                // Show loading indicator
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'alert alert-info mt-3';
                loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Processing resume...';
                resumeUploadForm.appendChild(loadingIndicator);
                
                // Process the resume upload
                processResumeUpload(resumeFile, resumeTitle, profileName, profileEmail, profilePhone, profileLocation, loadingIndicator);
                
                // Start automatic logout countdown after successful upload
                setTimeout(() => {
                    startAutoLogoutCountdown();
                }, 1000);
            }
        });
    }
    
    // Function to process resume upload
    function processResumeUpload(resumeFile, resumeTitle, profileName, profileEmail, profilePhone, profileLocation, loadingIndicator) {
        console.log('Processing resume upload:', {
            name: profileName,
            email: profileEmail,
            phone: profilePhone,
            location: profileLocation
        });
        
        // Create a temporary URL for the uploaded file
        const resumeURL = URL.createObjectURL(resumeFile);
        
        // Update all resume download links
        const resumeDownloadLinks = document.querySelectorAll('.resume-download');
        resumeDownloadLinks.forEach(link => {
            link.href = resumeURL;
            link.download = resumeTitle + '.pdf';
        });
        
        // Store profile information in localStorage without updating UI
        localStorage.setItem('profileName', profileName);
        localStorage.setItem('profileEmail', profileEmail);
        localStorage.setItem('profilePhone', profilePhone);
        localStorage.setItem('profileLocation', profileLocation);
        
        // Hide "View Resume" buttons that don't have download attribute
        const viewResumeButtons = document.querySelectorAll('.view-resume-btn:not([download])');
        viewResumeButtons.forEach(btn => {
            btn.style.display = 'inline-block';
        });
        
        // Store resume information in localStorage
        const resumeInfo = {
            title: resumeTitle,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('resumeInfo', JSON.stringify(resumeInfo));
        
        // Update UI to show last updated information
        const resumeLastUpdatedElements = document.querySelectorAll('.resume-last-updated');
        resumeLastUpdatedElements.forEach(element => {
            element.textContent = new Date().toLocaleDateString();
        });
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success mt-3';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            <strong>Resume uploaded successfully!</strong><br>
            <small>Resume information saved: Title: ${resumeTitle} | Date: ${new Date().toLocaleDateString()}</small><br>
            <button id="viewUploadedResumeBtn" class="btn btn-sm btn-primary mt-2" onclick="window.open('${resumeURL}', '_blank')">
                <i class="fas fa-file-pdf me-1"></i> View Uploaded Resume
            </button>
        `;
        
        // Remove loading indicator and add success message
        loadingIndicator.remove();
        resumeUploadForm.appendChild(successMessage);
    }
    
    // Function to start automatic logout countdown
    function startAutoLogoutCountdown() {
        console.log('Starting automatic logout countdown');
        
        try {
            // Clear any existing countdown
            if (window.logoutCountdownInterval) {
                clearInterval(window.logoutCountdownInterval);
                delete window.logoutCountdownInterval;
            }
            
            // Remove any existing notification
            const existingNotification = document.querySelector('.auto-logout-notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            // Create logout notification
            const logoutNotification = document.createElement('div');
            logoutNotification.className = 'auto-logout-notification';
            logoutNotification.innerHTML = `
                <div class="auto-logout-content">
                    <h5><i class="fas fa-sign-out-alt me-2"></i>Automatic Logout</h5>
                    <p>For security reasons, you will be logged out in <span id="logoutCountdown">15</span> seconds.</p>
                    <div class="progress mb-3">
                        <div id="logoutProgressBar" class="progress-bar bg-danger" role="progressbar" style="width: 100%"></div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button id="cancelLogoutBtn" class="btn btn-sm btn-outline-success">
                            <i class="fas fa-times me-1"></i>Stay Logged In
                        </button>
                        <button id="immediateLogoutBtn" class="btn btn-sm btn-danger">
                            <i class="fas fa-sign-out-alt me-1"></i>Logout Now
                        </button>
                    </div>
                </div>
            `;
            
            // Add to body and show with animation
            document.body.appendChild(logoutNotification);
            requestAnimationFrame(() => {
                logoutNotification.classList.add('show');
            });
            
            // Set up countdown
            let countdownSeconds = 15;
            const countdownElement = document.getElementById('logoutCountdown');
            const progressBar = document.getElementById('logoutProgressBar');
            
            // Store interval ID globally so it can be cleared from other functions
            window.logoutCountdownInterval = setInterval(() => {
                countdownSeconds--;
                
                // Update countdown display
                if (countdownElement) {
                    countdownElement.textContent = countdownSeconds;
                }
                
                // Update progress bar
                if (progressBar) {
                    progressBar.style.width = `${(countdownSeconds / 15) * 100}%`;
                }
                
                // Handle countdown completion
                if (countdownSeconds <= 0) {
                    clearInterval(window.logoutCountdownInterval);
                    delete window.logoutCountdownInterval;
                    performAdminLogout();
                }
            }, 1000);
            
            // Handle cancel button
            const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
            if (cancelLogoutBtn) {
                cancelLogoutBtn.addEventListener('click', () => {
                    clearInterval(window.logoutCountdownInterval);
                    delete window.logoutCountdownInterval;
                    
                    logoutNotification.classList.remove('show');
                    setTimeout(() => {
                        logoutNotification.remove();
                    }, 300);
                    
                    // Show confirmation message
                    const stayLoggedInAlert = document.createElement('div');
                    stayLoggedInAlert.className = 'alert alert-success fixed-top text-center py-2 m-0';
                    stayLoggedInAlert.innerHTML = '<i class="fas fa-check-circle me-2"></i>Automatic logout canceled. You will remain logged in.';
                    document.body.appendChild(stayLoggedInAlert);
                    
                    setTimeout(() => {
                        stayLoggedInAlert.remove();
                    }, 3000);
                });
            }
            
            // Handle immediate logout button
            const immediateLogoutBtn = document.getElementById('immediateLogoutBtn');
            if (immediateLogoutBtn) {
                immediateLogoutBtn.addEventListener('click', () => {
                    clearInterval(window.logoutCountdownInterval);
                    delete window.logoutCountdownInterval;
                    performAdminLogout();
                });
            }
            
        } catch (error) {
            console.error('Error in startAutoLogoutCountdown:', error);
            // Fallback to immediate logout if there's an error
            performAdminLogout();
        }
    }
    
    // Function to perform admin logout
    function performAdminLogout() {
        console.log('Performing admin logout');
        
        try {
            // Clear all admin-related session storage
            sessionStorage.clear();
            console.log('Cleared session storage');
            
            // Clear any active intervals or timeouts
            if (window.logoutCountdownInterval) {
                clearInterval(window.logoutCountdownInterval);
                delete window.logoutCountdownInterval;
            }
            
            // Remove any existing logout notifications
            const existingNotification = document.querySelector('.auto-logout-notification');
            if (existingNotification) {
                existingNotification.remove();
            }
            
            // Remove event listeners for activity tracking
            ['click', 'keypress', 'scroll', 'mousemove'].forEach(eventType => {
                document.removeEventListener(eventType, updateActivity);
            });
            console.log('Removed event listeners');
            
            // Hide any open modals
            const modals = ['resumeUploadModal', 'adminLoginModal', 'editContactInfoModal'];
            modals.forEach(modalId => {
                const modalEl = document.getElementById(modalId);
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) {
                        modal.hide();
                    }
                }
            });
            
            // Update admin login status
            updateAdminLoginStatus();
            console.log('Updated admin login status');
            
            // Show logout confirmation
            const logoutAlert = document.createElement('div');
            logoutAlert.className = 'alert alert-success fixed-top text-center py-2 m-0';
            logoutAlert.innerHTML = '<i class="fas fa-check-circle me-2"></i>You have been logged out successfully.';
            document.body.appendChild(logoutAlert);
            
            // Remove alert after 3 seconds
            setTimeout(() => {
                logoutAlert.remove();
            }, 3000);
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '#home';
                window.location.reload(); // Force page refresh to ensure clean state
            }, 500);
            
        } catch (error) {
            console.error('Error in performAdminLogout:', error);
            alert('An error occurred during logout. Please refresh the page.');
        }
    }
    
    // Function to extract information from PDF
    async function extractInfoFromPDF(pdfFile) {
        return new Promise((resolve, reject) => {
            try {
                // In a real implementation, you would use a PDF parsing library
                // For this demo, we'll simulate extraction with a timeout
                console.log('Extracting information from PDF...');
                
                setTimeout(() => {
                    // Read the file as text to try basic extraction
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const content = e.target.result;
                        
                        // Simple regex patterns to find common information in PDFs
                        // Note: This is a very basic approach and won't work for all PDFs
                        const extractedInfo = {
                            name: extractName(content),
                            email: extractEmail(content),
                            phone: extractPhone(content),
                            location: extractLocation(content)
                        };
                        
                        resolve(extractedInfo);
                    };
                    
                    reader.onerror = function() {
                        reject(new Error('Failed to read PDF file'));
                    };
                    
                    reader.readAsText(pdfFile);
                }, 1000);
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Helper functions for PDF extraction
    function extractName(content) {
        // Look for patterns that might indicate a name
        // This is very basic and would need to be improved for real use
        const namePatterns = [
            /name:\s*([A-Za-z\s.]+)/i,
            /([A-Z][a-z]+\s+[A-Z][a-z]+)/,
            /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m
        ];
        
        for (const pattern of namePatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return null;
    }
    
    function extractEmail(content) {
        const emailPattern = /[\w.-]+@[\w.-]+\.\w+/;
        const match = content.match(emailPattern);
        return match ? match[0] : null;
    }
    
    function extractPhone(content) {
        const phonePatterns = [
            /\+\d[\d\s-]{8,}/,
            /\(\d{3}\)\s*\d{3}[-\s]?\d{4}/,
            /\d{3}[-\s]?\d{3}[-\s]?\d{4}/
        ];
        
        for (const pattern of phonePatterns) {
            const match = content.match(pattern);
            if (match) {
                return match[0];
            }
        }
        
        return null;
    }
    
    function extractLocation(content) {
        const locationPatterns = [
            /([A-Za-z\s]+,\s*[A-Za-z\s]+)/,
            /address:\s*([^,\n]+,[^,\n]+)/i,
            /location:\s*([^,\n]+,[^,\n]+)/i
        ];
        
        for (const pattern of locationPatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return null;
    }
    
    // Function to update profile information throughout the site
    function updateProfileInformation(name, email, phone, location) {
        // Update name in hero section
        const heroName = document.querySelector('#home .hero-content h1 span');
        if (heroName) {
            heroName.textContent = name;
        }
        
        // Update name in resume header
        const resumeHeader = document.querySelector('#resumeContent .resume-header h3');
        if (resumeHeader) {
            resumeHeader.textContent = name;
        }
        
        // Update name in footer
        const footerName = document.querySelector('footer h5');
        if (footerName) {
            footerName.textContent = name;
        }
        
        // Update personal info in about section
        updatePersonalInfoItem('Name:', name);
        updatePersonalInfoItem('Email:', email);
        
        // Update phone display elements
        const aboutPhoneDisplay = document.getElementById('aboutPhoneDisplay');
        if (aboutPhoneDisplay) {
            aboutPhoneDisplay.textContent = phone;
        }
        
        // Update location display elements
        const aboutLocationDisplay = document.getElementById('aboutLocationDisplay');
        if (aboutLocationDisplay) {
            aboutLocationDisplay.textContent = location;
        }
        
        // Update contact section display elements
        const contactPhoneDisplay = document.getElementById('contactPhoneDisplay');
        if (contactPhoneDisplay) {
            contactPhoneDisplay.textContent = phone;
        }
        
        const contactLocationDisplay = document.getElementById('contactLocationDisplay');
        if (contactLocationDisplay) {
            contactLocationDisplay.textContent = location;
        }
        
        // Update resume sidebar display elements
        const resumePhoneDisplay = document.getElementById('resumePhoneDisplay');
        if (resumePhoneDisplay) {
            resumePhoneDisplay.textContent = phone;
        }
        
        const resumeLocationDisplay = document.getElementById('resumeLocationDisplay');
        if (resumeLocationDisplay) {
            resumeLocationDisplay.textContent = location;
        }
        
        // Update personal info in resume sidebar for email (no edit button for this)
        updateResumePersonalInfo('envelope', email);
        
        // Update contact info in contact section for email (no edit button for this)
        updateContactInfo('envelope', 'Email', email);
        
        // Update document title
        document.title = `${name} - Agricultural Engineering Portfolio`;
    }
    
    // Helper function to update personal info items in the about section
    function updatePersonalInfoItem(label, value) {
        const items = document.querySelectorAll('#about .list-unstyled li');
        items.forEach(item => {
            if (item.textContent.includes(label)) {
                const strong = item.querySelector('strong');
                if (strong) {
                    // Keep the strong element and icon, replace the text after it
                    const icon = item.querySelector('i');
                    item.innerHTML = '';
                    if (icon) {
                        item.appendChild(icon.cloneNode(true));
                    }
                    const newStrong = document.createElement('strong');
                    newStrong.textContent = strong.textContent;
                    item.appendChild(newStrong);
                    item.appendChild(document.createTextNode(' ' + value));
                }
            }
        });
    }
    
    // Helper function to update personal info in resume sidebar
    function updateResumePersonalInfo(iconClass, value) {
        const items = document.querySelectorAll('#resumeContent .resume-personal li');
        items.forEach(item => {
            const icon = item.querySelector(`i.fa-${iconClass}`);
            if (icon) {
                // Keep the icon, replace the text
                item.innerHTML = '';
                item.appendChild(icon.cloneNode(true));
                item.appendChild(document.createTextNode(' ' + value));
            }
        });
    }
    
    // Helper function to update contact info in contact section
    function updateContactInfo(iconClass, label, value) {
        const items = document.querySelectorAll('#contact .contact-item');
        items.forEach(item => {
            const icon = item.querySelector(`i.fa-${iconClass}`);
            if (icon) {
                const textDiv = item.querySelector('.contact-text');
                if (textDiv) {
                    const h5 = textDiv.querySelector('h5');
                    const p = textDiv.querySelector('p');
                    if (h5 && p && h5.textContent.includes(label)) {
                        p.textContent = value;
                    }
                }
            }
        });
    }
    
    // Check for stored profile information on page load
    try {
        const storedProfileName = localStorage.getItem('profileName');
        const storedProfileEmail = localStorage.getItem('profileEmail');
        const storedProfilePhone = localStorage.getItem('profilePhone');
        const storedProfileLocation = localStorage.getItem('profileLocation');
        
        // If we have stored profile information, update the page
        if (storedProfileName && storedProfileEmail && storedProfilePhone && storedProfileLocation) {
            updateProfileInformation(storedProfileName, storedProfileEmail, storedProfilePhone, storedProfileLocation);
        }
        
        const storedResumeTitle = localStorage.getItem('resumeTitle');
        const storedResumeUpdated = localStorage.getItem('resumeUpdated');
        
        if (storedResumeTitle && storedResumeUpdated) {
            // Display the last updated info
            const resumeActionsMain = document.querySelector('.resume-actions-main');
            if (resumeActionsMain) {
                const lastUpdated = document.createElement('div');
                lastUpdated.className = 'resume-last-updated text-muted small mt-2 text-center';
                lastUpdated.innerHTML = `<i class="fas fa-info-circle me-1"></i> Resume last updated: ${new Date(storedResumeUpdated).toLocaleDateString()}`;
                resumeActionsMain.parentNode.appendChild(lastUpdated);
            }
        }
    } catch (error) {
        console.error('Error retrieving profile info from localStorage:', error);
    }

    // Admin Logout Functionality
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function() {
            console.log('Admin logout button clicked');
            
            // Clear admin session
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('lastActivity');
            
            // Update admin login status
            updateAdminLoginStatus();
            
            // Remove event listeners for activity tracking
            ['click', 'keypress', 'scroll', 'mousemove'].forEach(eventType => {
                document.removeEventListener(eventType, updateActivity);
            });
            
            // Hide the resume upload modal
            const resumeUploadModalEl = document.getElementById('resumeUploadModal');
            if (resumeUploadModalEl) {
                const modal = bootstrap.Modal.getInstance(resumeUploadModalEl);
                if (modal) {
                    modal.hide();
                }
            }
            
            // Show logout confirmation
            alert('You have been logged out successfully.');
            
            // Redirect to home page
            window.location.href = '#home';
        });
    }

    // Prevent direct access to resume upload modal
    document.addEventListener('show.bs.modal', function(event) {
        const modal = event.target;
        
        // Check if this is the resume upload modal
        if (modal.id === 'resumeUploadModal') {
            // Check if user is authenticated
            const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
            
            if (!isLoggedIn) {
                console.log('Unauthorized attempt to access resume upload modal');
                
                // Prevent modal from showing
                event.preventDefault();
                
                // Show error message
                alert('Authentication required. Please log in as admin first.');
                
                // Show login modal instead
                const adminLoginModalEl = document.getElementById('adminLoginModal');
                if (adminLoginModalEl) {
                    const loginModal = new bootstrap.Modal(adminLoginModalEl);
                    loginModal.show();
                }
            } else {
                // Check for session timeout
                const lastActivity = parseInt(sessionStorage.getItem('lastActivity') || '0');
                const now = Date.now();
                const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
                
                if (lastActivity > 0 && (now - lastActivity) > SESSION_TIMEOUT) {
                    console.log('Session timeout detected when accessing resume upload modal');
                    
                    // Prevent modal from showing
                    event.preventDefault();
                    
                    // Clear admin session
                    sessionStorage.removeItem('adminLoggedIn');
                    sessionStorage.removeItem('lastActivity');
                    
                    // Show timeout message
                    alert('Your session has expired due to inactivity. Please log in again.');
                    
                    // Show login modal instead
                    const adminLoginModalEl = document.getElementById('adminLoginModal');
                    if (adminLoginModalEl) {
                        const loginModal = new bootstrap.Modal(adminLoginModalEl);
                        loginModal.show();
                    }
                } else {
                    // Update last activity
                    sessionStorage.setItem('lastActivity', now.toString());
                }
            }
        }
    });

    // Check admin login status on page load
    function updateAdminLoginStatus() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        const adminButtons = document.querySelectorAll('a[data-bs-target="#adminLoginModal"]');
        
        adminButtons.forEach(button => {
            if (isLoggedIn) {
                button.innerHTML = '<i class="fas fa-user-shield me-2"></i>Admin (Logged In)';
                button.classList.add('btn-success');
                button.classList.remove('btn-outline-success');
                
                // Change target to resume upload modal
                button.setAttribute('data-bs-target', '#resumeUploadModal');
            } else {
                button.innerHTML = '<i class="fas fa-lock me-2"></i>Admin';
                button.classList.add('btn-outline-success');
                button.classList.remove('btn-success');
                
                // Reset target to admin login modal
                button.setAttribute('data-bs-target', '#adminLoginModal');
            }
        });
        
        // Show/hide edit buttons based on login status
        const editButtons = document.querySelectorAll('.edit-info-btn');
        editButtons.forEach(button => {
            button.style.display = isLoggedIn ? 'inline-block' : 'none';
        });
    }
    
    // Update admin login status on page load
    updateAdminLoginStatus();
    
    // Update admin login status when storage changes (for multi-tab support)
    window.addEventListener('storage', function(e) {
        if (e.key === 'adminLoggedIn') {
            updateAdminLoginStatus();
        }
    });
    
    // Handle edit contact info buttons
    const editInfoButtons = document.querySelectorAll('.edit-info-btn');
    const editContactInfoModal = new bootstrap.Modal(document.getElementById('editContactInfoModal'));
    const editContactInfoForm = document.getElementById('editContactInfoForm');
    const editFieldType = document.getElementById('editFieldType');
    const phoneEditField = document.getElementById('phoneEditField');
    const locationEditField = document.getElementById('locationEditField');
    const editPhone = document.getElementById('editPhone');
    const editLocation = document.getElementById('editLocation');
    
    editInfoButtons.forEach(button => {
        // Initially hide edit buttons (will be shown after login)
        button.style.display = 'none';
        
        button.addEventListener('click', function() {
            const field = this.getAttribute('data-field');
            editFieldType.value = field;
            
            // Show/hide appropriate fields
            phoneEditField.style.display = field === 'phone' ? 'block' : 'none';
            locationEditField.style.display = field === 'location' ? 'block' : 'none';
            
            // Pre-fill current values
            if (field === 'phone') {
                editPhone.value = localStorage.getItem('profilePhone') || document.getElementById('aboutPhoneDisplay').textContent.trim();
            } else if (field === 'location') {
                editLocation.value = localStorage.getItem('profileLocation') || document.getElementById('aboutLocationDisplay').textContent.trim();
            }
            
            // Show the modal
            editContactInfoModal.show();
        });
    });
    
    // Handle form submission
    if (editContactInfoForm) {
        editContactInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const field = editFieldType.value;
            let newValue = '';
            
            if (field === 'phone') {
                newValue = editPhone.value.trim();
                localStorage.setItem('profilePhone', newValue);
            } else if (field === 'location') {
                newValue = editLocation.value.trim();
                localStorage.setItem('profileLocation', newValue);
            }
            
            // Update all instances of this information throughout the site
            updateContactInfoDisplay(field, newValue);
            
            // Hide the modal
            editContactInfoModal.hide();
            
            // Show success message
            showUpdateSuccessMessage(field);
        });
    }
    
    // Function to update contact info display throughout the site
    function updateContactInfoDisplay(field, value) {
        if (field === 'phone') {
            // Update about section
            const aboutPhoneDisplay = document.getElementById('aboutPhoneDisplay');
            if (aboutPhoneDisplay) {
                aboutPhoneDisplay.textContent = value;
            }
            
            // Update contact section
            const contactPhoneDisplay = document.getElementById('contactPhoneDisplay');
            if (contactPhoneDisplay) {
                contactPhoneDisplay.textContent = value;
            }
            
            // Update resume section
            const resumePhoneDisplay = document.getElementById('resumePhoneDisplay');
            if (resumePhoneDisplay) {
                resumePhoneDisplay.textContent = value;
            }
        } else if (field === 'location') {
            // Update about section
            const aboutLocationDisplay = document.getElementById('aboutLocationDisplay');
            if (aboutLocationDisplay) {
                aboutLocationDisplay.textContent = value;
            }
            
            // Update contact section
            const contactLocationDisplay = document.getElementById('contactLocationDisplay');
            if (contactLocationDisplay) {
                contactLocationDisplay.textContent = value;
            }
            
            // Update resume section
            const resumeLocationDisplay = document.getElementById('resumeLocationDisplay');
            if (resumeLocationDisplay) {
                resumeLocationDisplay.textContent = value;
            }
        }
    }
    
    // Function to show success message after updating contact info
    function showUpdateSuccessMessage(field) {
        const fieldName = field === 'phone' ? 'Phone Number' : 'Location';
        
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success fixed-top text-center py-2 m-0';
        successMessage.innerHTML = `<i class="fas fa-check-circle me-2"></i>${fieldName} updated successfully!`;
        
        // Add to body
        document.body.appendChild(successMessage);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }
});

// Back to top button functionality
window.addEventListener('scroll', function() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
});

// Helper function to get text content from elements matching a selector
function getTextContent(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const text = element.textContent.trim();
        
        // For email addresses
        if (text.includes('@')) {
            const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
            return emailMatch ? emailMatch[0] : text;
        }
        
        // For phone numbers
        if (text.includes('+')) {
            const phoneMatch = text.match(/\+[\d\s]+/);
            return phoneMatch ? phoneMatch[0] : text;
        }
        
        // For location
        if (text.includes('New York') || text.includes('NY')) {
            const locationMatch = text.match(/[A-Za-z\s]+,\s[A-Za-z\s]+/);
            return locationMatch ? locationMatch[0] : text;
        }
        
        return text;
    }
    return '';
} 