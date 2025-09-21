// UniCourse - Veri Yönetimi

class StorageManager {
    constructor() {
        this.coursesKey = 'unicourse_courses';
        this.materialsKey = 'unicourse_materials';
        this.settingsKey = 'unicourse_settings';
        this.initializeStorage();
    }

    initializeStorage() {
        // Eğer veriler yoksa boş array/object oluştur
        if (!this.getCourses()) {
            this.saveCourses([]);
        }
        if (!this.getMaterials()) {
            this.saveMaterials([]);
        }
        if (!this.getSettings()) {
            this.saveSettings({
                theme: 'light',
                itemsPerPage: 25
            });
        }
    }

    // Generic Storage Methods
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    }

    delete(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage delete error:', error);
            return false;
        }
    }

    // Course Methods
    saveCourses(courses) {
        return this.save(this.coursesKey, courses);
    }

    getCourses() {
        return this.load(this.coursesKey) || [];
    }

    saveCourse(course) {
        const courses = this.getCourses();
        const existingIndex = courses.findIndex(c => c.id === course.id);
        
        if (existingIndex !== -1) {
            courses[existingIndex] = course;
        } else {
            courses.push(course);
        }
        
        return this.saveCourses(courses);
    }

    deleteCourse(courseId) {
        const courses = this.getCourses();
        const filteredCourses = courses.filter(c => c.id !== courseId);
        return this.saveCourses(filteredCourses);
    }

    getCourseById(courseId) {
        const courses = this.getCourses();
        return courses.find(c => c.id === courseId);
    }

    // Material Methods
    saveMaterials(materials) {
        return this.save(this.materialsKey, materials);
    }

    getMaterials() {
        return this.load(this.materialsKey) || [];
    }

    saveMaterial(material) {
        const materials = this.getMaterials();
        const existingIndex = materials.findIndex(m => m.id === material.id);
        
        if (existingIndex !== -1) {
            materials[existingIndex] = material;
        } else {
            materials.push(material);
        }
        
        return this.saveMaterials(materials);
    }

    deleteMaterial(materialId) {
        const materials = this.getMaterials();
        const filteredMaterials = materials.filter(m => m.id !== materialId);
        return this.saveMaterials(filteredMaterials);
    }

    getMaterialById(materialId) {
        const materials = this.getMaterials();
        return materials.find(m => m.id === materialId);
    }

    getMaterialsByCourse(courseId) {
        const materials = this.getMaterials();
        return materials.filter(m => m.courseId === courseId);
    }

    // Settings Methods
    saveSettings(settings) {
        return this.save(this.settingsKey, settings);
    }

    getSettings() {
        return this.load(this.settingsKey) || {
            theme: 'light',
            itemsPerPage: 25
        };
    }

    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    }

    // Statistics Methods
    getStatistics() {
        const courses = this.getCourses();
        const materials = this.getMaterials();
        
        // Bu hafta eklenen materyaller
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const thisWeekMaterials = materials.filter(material => {
            const materialDate = new Date(material.createdAt);
            return materialDate >= oneWeekAgo;
        });

        // Toplam indirmeler
        const totalDownloads = materials.reduce((sum, m) => sum + (m.downloads || 0), 0);

        return {
            totalCourses: courses.length,
            totalMaterials: materials.length,
            thisWeekMaterials: thisWeekMaterials.length,
            totalDownloads: totalDownloads
        };
    }

    // Data Export/Import
    exportData() {
        const data = {
            courses: this.getCourses(),
            materials: this.getMaterials(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        return data;
    }

    importData(data) {
        try {
            if (data.courses && Array.isArray(data.courses)) {
                this.saveCourses(data.courses);
            }
            
            if (data.materials && Array.isArray(data.materials)) {
                this.saveMaterials(data.materials);
            }
            
            if (data.settings && typeof data.settings === 'object') {
                this.saveSettings(data.settings);
            }
            
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        this.saveCourses([]);
        this.saveMaterials([]);
        this.saveSettings({
            theme: 'light',
            itemsPerPage: 25
        });
        return true;
    }

    // Backup methods
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            data: this.exportData()
        };
        
        return backup;
    }

    restoreBackup(backup) {
        if (backup && backup.data) {
            return this.importData(backup.data);
        }
        return false;
    }
}