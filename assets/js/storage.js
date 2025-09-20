class StorageManager {
    constructor() {
        this.storageKey = 'unicourse_data';
        this.initializeStorage();
    }

    // LocalStorage işlemleri
    save(key, data) { }
    load(key) { }
    delete(key) { }
    
    // Kurs işlemleri
    saveCourse(course) { }
    getCourses() { }
    deleteCourse(courseId) { }
    
    // Materyal işlemleri
    saveMaterial(material) { }
    getMaterials(courseId) { }
    deleteMaterial(materialId) { }
}