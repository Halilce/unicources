// UniCourse - Ana Uygulama

class UniCourseApp {
    constructor() {
        this.storage = new StorageManager();
        this.ui = new UIManager();
        this.currentCourseId = null;
        this.currentMaterialId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.applySettings();
        
        // Add demo data if empty
        if (this.storage.getCourses().length === 0) {
            this.addDemoData();
        }
    }

    setupEventListeners() {
        // Course management
        document.addEventListener('click', (e) => {
            if (e.target.closest('#saveCourse')) {
                this.saveCourse();
            }
        });

        // Material management
        document.addEventListener('click', (e) => {
            if (e.target.closest('#saveMaterial')) {
                this.saveMaterial();
            }
        });

        // Search and filters
        this.setupSearchListeners();

        // Settings
        this.setupSettingsListeners();
    }

    setupSearchListeners() {
        const courseSearch = document.getElementById('courseSearch');
        const courseFilter = document.getElementById('courseFilter');
        const materialSearch = document.getElementById('materialSearch');
        const materialCourseFilter = document.getElementById('materialCourseFilter');
        const materialTypeFilter = document.getElementById('materialTypeFilter');

        if (courseSearch) {
            courseSearch.addEventListener('input', debounce(() => this.filterCourses(), 300));
        }
        
        if (courseFilter) {
            courseFilter.addEventListener('change', () => this.filterCourses());
        }

        if (materialSearch) {
            materialSearch.addEventListener('input', debounce(() => this.filterMaterials(), 300));
        }
        
        if (materialCourseFilter) {
            materialCourseFilter.addEventListener('change', () => this.filterMaterials());
        }
        
        if (materialTypeFilter) {
            materialTypeFilter.addEventListener('change', () => this.filterMaterials());
        }
    }

    setupSettingsListeners() {
        const themeSelect = document.getElementById('themeSelect');
        const exportData = document.getElementById('exportData');
        const importData = document.getElementById('importData');
        const clearAllData = document.getElementById('clearAllData');

        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        }

        if (exportData) {
            exportData.addEventListener('click', () => this.exportData());
        }

        if (importData) {
            importData.addEventListener('click', () => this.importData());
        }

        if (clearAllData) {
            clearAllData.addEventListener('click', () => this.clearAllData());
        }
    }

    loadInitialData() {
        this.showDashboard();
        this.updateStats();
        this.ui.updateMaterialFilters(this.storage.getCourses());
    }

    applySettings() {
        const settings = this.storage.getSettings();
        this.ui.applyTheme(settings.theme);
    }

    // Dashboard Management
    showDashboard() {
        this.updateStats();
        this.loadRecentCourses();
    }

    updateStats() {
        const stats = this.storage.getStatistics();
        this.ui.updateStatistics(stats);
    }

    loadRecentCourses() {
        const courses = this.storage.getCourses();
        this.ui.renderRecentCourses(courses);
    }

    getMaterialCount(courseId) {
        return this.storage.getMaterialsByCourse(courseId).length;
    }

    // Course Management
    loadCourses() {
        const courses = this.storage.getCourses();
        this.ui.renderCourses(courses);
    }

    filterCourses() {
        const searchTerm = document.getElementById('courseSearch')?.value || '';
        const category = document.getElementById('courseFilter')?.value || '';
        
        let courses = this.storage.getCourses();
        
        // Apply filters
        if (searchTerm) {
            courses = fuzzySearch(searchTerm, courses, ['name', 'code', 'instructor', 'description']);
        }
        
        if (category) {
            courses = courses.filter(course => course.category === category);
        }
        
        this.ui.renderCourses(courses);
    }

    saveCourse() {
        const courseData = {
            name: document.getElementById('courseName')?.value || '',
            code: document.getElementById('courseCode')?.value || '',
            category: document.getElementById('courseCategory')?.value || '',
            description: document.getElementById('courseDescription')?.value || '',
            instructor: document.getElementById('courseInstructor')?.value || ''
        };

        // Validation
        const validation = this.ui.validateForm('courseForm', {
            courseName: { required: true, label: 'Ders Adı' },
            courseCategory: { required: true, label: 'Kategori' }
        });

        if (!validation.isValid) {
            this.ui.showAlert(validation.errors.join(', '), 'danger');
            return;
        }

        const course = {
            id: this.currentCourseId || generateId(),
            ...courseData,
            createdAt: this.currentCourseId ? 
                this.storage.getCourseById(this.currentCourseId).createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save course
        const success = this.storage.saveCourse(course);
        
        if (success) {
            const message = this.currentCourseId ? 'Ders başarıyla güncellendi!' : 'Ders başarıyla eklendi!';
            this.ui.showAlert(message, 'success');
            
            this.loadCourses();
            this.updateStats();
            this.resetCourseForm();
            this.ui.hideModal('courseModal');
            this.ui.updateMaterialFilters(this.storage.getCourses());
        } else {
            this.ui.showAlert('Ders kaydedilirken hata oluştu!', 'danger');
        }
    }

    editCourse(courseId) {
        const course = this.storage.getCourseById(courseId);
        if (!course) {
            this.ui.showAlert('Ders bulunamadı!', 'danger');
            return;
        }

        this.currentCourseId = courseId;
        this.ui.populateForm('courseForm', {
            courseName: course.name,
            courseCode: course.code,
            courseCategory: course.category,
            courseDescription: course.description,
            courseInstructor: course.instructor
        });

        this.ui.showModal('courseModal');
    }

    deleteCourse(courseId) {
        this.ui.confirmDialog(
            'Bu dersi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ilgili tüm materyaller de silinecektir.',
            () => {
                // Delete course materials first
                const materials = this.storage.getMaterialsByCourse(courseId);
                materials.forEach(material => this.storage.deleteMaterial(material.id));

                // Delete course
                const success = this.storage.deleteCourse(courseId);
                
                if (success) {
                    this.ui.showAlert('Ders ve ilgili materyaller başarıyla silindi!', 'success');
                    this.loadCourses();
                    this.updateStats();
                    this.ui.updateMaterialFilters(this.storage.getCourses());
                } else {
                    this.ui.showAlert('Ders silinirken hata oluştu!', 'danger');
                }
            }
        );
    }

    resetCourseForm() {
        this.currentCourseId = null;
        this.ui.resetForm('courseForm');
    }

    // Material Management
    loadMaterials() {
        const materials = this.storage.getMaterials();
        this.ui.renderMaterials(materials);
    }

    filterMaterials() {
        const searchTerm = document.getElementById('materialSearch')?.value || '';
        const courseFilter = document.getElementById('materialCourseFilter')?.value || '';
        const typeFilter = document.getElementById('materialTypeFilter')?.value || '';
        
        let materials = this.storage.getMaterials();
        
        // Apply filters
        if (searchTerm) {
            materials = fuzzySearch(searchTerm, materials, ['name', 'description']);
        }
        
        if (courseFilter) {
            materials = materials.filter(material => material.courseId === courseFilter);
        }
        
        if (typeFilter) {
            materials = materials.filter(material => material.type === typeFilter);
        }
        
        this.ui.renderMaterials(materials);
    }

    saveMaterial() {
        const materialData = {
            name: document.getElementById('materialName')?.value || '',
            courseId: document.getElementById('materialCourse')?.value || '',
            type: document.getElementById('materialType')?.value || '',
            url: document.getElementById('materialUrl')?.value || '',
            description: document.getElementById('materialDescription')?.value || ''
        };

        // Validation
        const validation = this.ui.validateForm('materialForm', {
            materialName: { required: true, label: 'Materyal Adı' },
            materialCourse: { required: true, label: 'Ders' },
            materialType: { required: true, label: 'Tür' },
            materialUrl: { required: true, url: true, label: 'URL' }
        });

        if (!validation.isValid) {
            this.ui.showAlert(validation.errors.join(', '), 'danger');
            return;
        }

        const material = {
            id: this.currentMaterialId || generateId(),
            ...materialData,
            downloads: this.currentMaterialId ? 
                this.storage.getMaterialById(this.currentMaterialId).downloads || 0 : 0,
            createdAt: this.currentMaterialId ? 
                this.storage.getMaterialById(this.currentMaterialId).createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save material
        const success = this.storage.saveMaterial(material);
        
        if (success) {
            const message = this.currentMaterialId ? 'Materyal başarıyla güncellendi!' : 'Materyal başarıyla eklendi!';
            this.ui.showAlert(message, 'success');
            
            this.loadMaterials();
            this.updateStats();
            this.resetMaterialForm();
            this.ui.hideModal('materialModal');
        } else {
            this.ui.showAlert('Materyal kaydedilirken hata oluştu!', 'danger');
        }
    }

    editMaterial(materialId) {
        const material = this.storage.getMaterialById(materialId);
        if (!material) {
            this.ui.showAlert('Materyal bulunamadı!', 'danger');
            return;
        }

        this.currentMaterialId = materialId;
        this.ui.populateForm('materialForm', {
            materialName: material.name,
            materialCourse: material.courseId,
            materialType: material.type,
            materialUrl: material.url,
            materialDescription: material.description
        });

        this.ui.showModal('materialModal');
    }

    deleteMaterial(materialId) {
        this.ui.confirmDialog(
            'Bu materyali silmek istediğinizden emin misiniz?',
            () => {
                const success = this.storage.deleteMaterial(materialId);
                
                if (success) {
                    this.ui.showAlert('Materyal başarıyla silindi!', 'success');
                    this.loadMaterials();
                    this.updateStats();
                } else {
                    this.ui.showAlert('Materyal silinirken hata oluştu!', 'danger');
                }
            }
        );
    }

    openMaterial(materialId) {
        const material = this.storage.getMaterialById(materialId);
        if (!material) {
            this.ui.showAlert('Materyal bulunamadı!', 'danger');
            return;
        }

        // Increment download count
        material.downloads = (material.downloads || 0) + 1;
        this.storage.saveMaterial(material);
        
        // Update UI
        this.loadMaterials();
        this.updateStats();

        // Open URL in new tab
        window.open(material.url, '_blank');
    }

    resetMaterialForm() {
        this.currentMaterialId = null;
        this.ui.resetForm('materialForm');
    }

    // Settings Management
    loadSettings() {
        const settings = this.storage.getSettings();
        
        const themeSelect = document.getElementById('themeSelect');
        const itemsPerPage = document.getElementById('itemsPerPage');
        
        if (themeSelect) themeSelect.value = settings.theme;
        if (itemsPerPage) itemsPerPage.value = settings.itemsPerPage;
    }

    changeTheme(theme) {
        this.storage.updateSetting('theme', theme);
        this.ui.applyTheme(theme);
    }

    // Data Management
    exportData() {
        const data = this.storage.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        const filename = `unicourse-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        this.ui.downloadFile(jsonString, filename);
        this.ui.showAlert('Veriler başarıyla dışa aktarıldı!', 'success');
    }

    importData() {
        this.ui.handleFileUpload((data) => {
            const success = this.storage.importData(data);
            
            if (success) {
                this.ui.showAlert('Veriler başarıyla içe aktarıldı!', 'success');
                this.loadInitialData();
                this.applySettings();
                
                // Refresh current section
                const currentSection = this.ui.getCurrentSection();
                if (currentSection === 'courses') {
                    this.loadCourses();
                } else if (currentSection === 'materials') {
                    this.loadMaterials();
                }
            } else {
                this.ui.showAlert('Veriler içe aktarılırken hata oluştu!', 'danger');
            }
        });
    }

    clearAllData() {
        this.ui.confirmDialog(
            'Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            () => {
                const success = this.storage.clearAllData();
                
                if (success) {
                    this.ui.showAlert('Tüm veriler temizlendi!', 'success');
                    this.loadInitialData();
                    
                    // Refresh current section
                    const currentSection = this.ui.getCurrentSection();
                    if (currentSection === 'courses') {
                        this.loadCourses();
                    } else if (currentSection === 'materials') {
                        this.loadMaterials();
                    }
                } else {
                    this.ui.showAlert('Veriler temizlenirken hata oluştu!', 'danger');
                }
            }
        );
    }

    // Demo Data
    addDemoData() {
        const demoCourses = [
            {
                id: generateId(),
                name: 'Matematik 101',
                code: 'MAT101',
                category: 'matematik',
                description: 'Temel matematik dersi - limit, türev ve integral konuları',
                instructor: 'Prof. Dr. Ahmet Yılmaz',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Fizik Temelleri',
                code: 'FIZ100',
                category: 'fizik',
                description: 'Fizik biliminin temel konuları - mekanik, termodinamik',
                instructor: 'Dr. Fatma Kaya',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        demoCourses.forEach(course => this.storage.saveCourse(course));

        const demoMaterials = [
            {
                id: generateId(),
                name: 'Calculus Ders Notları',
                courseId: demoCourses[0].id,
                type: 'pdf',
                url: 'https://example.com/calculus-notes.pdf',
                description: 'Calculus konusunda detaylı ders notları ve çözümlü örnekler',
                downloads: 15,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                name: 'Newton Yasaları Eğitim Videosu',
                courseId: demoCourses[1].id,
                type: 'video',
                url: 'https://example.com/newton-laws.mp4',
                description: 'Newton yasalarını açıklayan detaylı eğitim videosu',
                downloads: 23,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        demoMaterials.forEach(material => this.storage.saveMaterial(material));
    }

    // Section Management (Override UI calls)
    showSection(sectionName) {
        this.ui.showSection(sectionName);
        
        // Load section-specific data
        switch(sectionName) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'courses':
                this.loadCourses();
                break;
            case 'materials':
                this.loadMaterials();
                this.ui.updateMaterialFilters(this.storage.getCourses());
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }
}

// Auto-initialize when components are loaded
window.addEventListener('componentsLoaded', () => {
    window.app = new UniCourseApp();
});