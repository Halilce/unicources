// UniCourse - UI Yönetimi

class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.alertTimeout = 5000;
        this.initializeUI();
    }

    initializeUI() {
        this.setupEventListeners();
        this.setupResponsiveHandlers();
    }

    setupEventListeners() {
        // Sidebar navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-nav .nav-link')) {
                e.preventDefault();
                const link = e.target.closest('.nav-link');
                const section = link.dataset.section;
                this.showSection(section);
                this.updateActiveNavigation(link);
            }
        });

        // Mobile sidebar toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sidebarToggle')) {
                this.toggleMobileSidebar();
            }
        });

        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#themeToggle')) {
                this.toggleTheme();
            }
        });

        // Modal reset handlers
        document.addEventListener('hidden.bs.modal', (e) => {
            if (e.target.id === 'courseModal') {
                this.resetForm('courseForm');
            } else if (e.target.id === 'materialModal') {
                this.resetForm('materialForm');
            }
        });
    }

    setupResponsiveHandlers() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResponsiveLayout();
        });

        this.handleResponsiveLayout();
    }

    handleResponsiveLayout() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        if (window.innerWidth <= 768) {
            mainContent.classList.add('full-width');
            sidebar.classList.remove('show');
        } else {
            mainContent.classList.remove('full-width');
            sidebar.classList.remove('collapsed');
        }
    }

    // Section Management
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = sectionName;
        }
    }

    updateActiveNavigation(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current link
        activeLink.classList.add('active');
    }

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('show');
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Update theme in storage through app instance
        if (window.app && window.app.storage) {
            window.app.storage.updateSetting('theme', newTheme);
        }
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('#themeToggle i');
        
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }

        // Update select element if exists
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = theme;
        }
    }

    // Course Rendering
    renderCourses(courses) {
        const container = document.getElementById('coursesList');
        
        if (!container) return;

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-book fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Henüz ders eklenmemiş</h5>
                        <p class="text-muted">İlk dersinizi eklemek için "Yeni Ders Ekle" butonuna tıklayın.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
    }

    createCourseCard(course) {
        const materialCount = window.app ? window.app.getMaterialCount(course.id) : 0;
        
        return `
            <div class="col-lg-4 col-md-6">
                <div class="card course-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${sanitizeString(course.name)}</h6>
                        <span class="badge bg-light text-dark">${course.code || 'N/A'}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text text-muted">${truncateText(course.description || 'Açıklama yok', 80)}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <small class="text-muted">
                                <i class="fas fa-user"></i> ${course.instructor || 'Belirtilmemiş'}
                            </small>
                            <small class="text-muted">
                                <i class="fas fa-tag"></i> ${course.category}
                            </small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-primary">
                                <i class="fas fa-file-alt"></i> ${materialCount} materyal
                            </span>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="app.editCourse('${course.id}')" title="Düzenle">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="app.deleteCourse('${course.id}')" title="Sil">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Material Rendering
    renderMaterials(materials) {
        const container = document.getElementById('materialsList');
        
        if (!container) return;

        if (materials.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Henüz materyal eklenmemiş</h5>
                    <p class="text-muted">İlk materyalinizi eklemek için "Yeni Materyal Ekle" butonuna tıklayın.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = materials.map(material => this.createMaterialItem(material)).join('');
    }

    createMaterialItem(material) {
        const course = window.app ? window.app.storage.getCourseById(material.courseId) : null;
        const courseName = course ? course.name : 'Bilinmeyen Ders';
        
        return `
            <div class="material-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${sanitizeString(material.name)}</h6>
                        <p class="text-muted mb-1">${truncateText(material.description || 'Açıklama yok', 100)}</p>
                        <div class="d-flex align-items-center text-muted">
                            <small class="me-3">
                                <i class="fas fa-book"></i> ${courseName}
                            </small>
                            <small class="me-3">
                                <i class="fas fa-tag"></i> ${getTypeIcon(material.type)} ${material.type}
                            </small>
                            <small class="me-3">
                                <i class="fas fa-download"></i> ${material.downloads || 0} indirme
                            </small>
                            <small>
                                <i class="fas fa-calendar"></i> ${formatDate(material.createdAt)}
                            </small>
                        </div>
                    </div>
                    <div class="btn-group btn-group-sm ms-3">
                        <button class="btn btn-outline-primary" onclick="app.openMaterial('${material.id}')" title="Aç">
                            <i class="fas fa-external-link-alt"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="app.editMaterial('${material.id}')" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="app.deleteMaterial('${material.id}')" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Statistics Update
    updateStatistics(stats) {
        const elements = {
            totalCourses: document.getElementById('totalCourses'),
            totalMaterials: document.getElementById('totalMaterials'),
            thisWeek: document.getElementById('thisWeek'),
            totalDownloads: document.getElementById('totalDownloads')
        };

        if (elements.totalCourses) elements.totalCourses.textContent = stats.totalCourses || 0;
        if (elements.totalMaterials) elements.totalMaterials.textContent = stats.totalMaterials || 0;
        if (elements.thisWeek) elements.thisWeek.textContent = stats.thisWeekMaterials || 0;
        if (elements.totalDownloads) elements.totalDownloads.textContent = stats.totalDownloads || 0;
    }

    // Recent Courses
    renderRecentCourses(courses) {
        const container = document.getElementById('recentCourses');
        
        if (!container) return;

        if (courses.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">Henüz ders eklenmemiş.</p>';
            return;
        }

        const recentCourses = courses.slice(-5).reverse();
        
        container.innerHTML = recentCourses.map(course => {
            const materialCount = window.app ? window.app.getMaterialCount(course.id) : 0;
            
            return `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <strong>${sanitizeString(course.name)}</strong>
                        <small class="text-muted d-block">${course.category}</small>
                    </div>
                    <div>
                        <span class="badge bg-primary">${materialCount} materyal</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Alert System
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alertId = 'alert-' + Date.now();
        
        const alert = document.createElement('div');
        alert.id = alertId;
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto remove after timeout
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.remove();
            }
        }, this.alertTimeout);
    }

    // Form Management
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    populateForm(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;

        Object.keys(data).forEach(key => {
            const element = form.querySelector(`#${key}`);
            if (element) {
                element.value = data[key] || '';
            }
        });
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
    }

    // Loading States
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Yükleniyor...</span>
                    </div>
                    <p class="mt-3 text-muted">Yükleniyor...</p>
                </div>
            `;
        }
    }

    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '';
        }
    }

    // Filter Updates
    updateMaterialFilters(courses) {
        const courseSelect = document.getElementById('materialCourseFilter');
        const materialCourseSelect = document.getElementById('materialCourse');
        
        if (!courses) return;

        const courseOptions = courses.map(course => 
            `<option value="${course.id}">${sanitizeString(course.name)}</option>`
        ).join('');
        
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Tüm Dersler</option>' + courseOptions;
        }
        
        if (materialCourseSelect) {
            materialCourseSelect.innerHTML = '<option value="">Ders Seçin</option>' + courseOptions;
        }
    }

    // Validation
    validateForm(formId, rules) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        const errors = [];

        Object.keys(rules).forEach(fieldName => {
            const field = form.querySelector(`#${fieldName}`);
            const rule = rules[fieldName];

            if (field && rule) {
                const value = field.value.trim();

                if (rule.required && !value) {
                    isValid = false;
                    errors.push(`${rule.label || fieldName} gerekli`);
                    this.addFieldError(field, `${rule.label || fieldName} gerekli`);
                } else {
                    this.removeFieldError(field);
                }

                if (value && rule.url && !ValidationUtils.url(value)) {
                    isValid = false;
                    errors.push(`${rule.label || fieldName} geçerli bir URL olmalı`);
                    this.addFieldError(field, 'Geçerli bir URL giriniz');
                }
            }
        });

        return { isValid, errors };
    }

    addFieldError(field, message) {
        this.removeFieldError(field);
        
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    removeFieldError(field) {
        field.classList.remove('is-invalid');
        
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Utility Methods
    getCurrentSection() {
        return this.currentSection;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Confirmation Dialogs
    confirmDialog(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }

    // Download File
    downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // File Upload Handler
    handleFileUpload(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    callback(data);
                } catch (error) {
                    this.showAlert('Dosya okuma hatası!', 'danger');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
}