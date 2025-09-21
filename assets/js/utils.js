// UniCourse - Yardımcı Fonksiyonlar

// ID oluşturucu
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tarih formatı
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR');
}

// Detaylı tarih formatı
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Dosya boyutu formatı
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// URL validasyon
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

// Dosya tipi iconları
function getTypeIcon(type) {
    const icons = {
        pdf: '<i class="fas fa-file-pdf text-danger"></i>',
        video: '<i class="fas fa-video text-info"></i>',
        image: '<i class="fas fa-image text-warning"></i>',
        document: '<i class="fas fa-file-word text-primary"></i>',
        other: '<i class="fas fa-file text-secondary"></i>'
    };
    return icons[type] || icons.other;
}

// Dosya tipi kontrolü
function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) return 'pdf';
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv'].includes(extension)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) return 'image';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
    
    return 'other';
}

// Fuzzy arama algoritması
function fuzzySearch(query, items, keys) {
    if (!query) return items;
    
    const searchTerm = query.toLowerCase();
    
    return items.filter(item => {
        return keys.some(key => {
            const value = getNestedProperty(item, key);
            return value && value.toLowerCase().includes(searchTerm);
        });
    });
}

// Nested property getter
function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, prop) => current && current[prop], obj);
}

// String temizleme
function sanitizeString(str) {
    return str.replace(/[<>\"']/g, '');
}

// Kategori renkleri
function getCategoryColor(category) {
    const colors = {
        matematik: '#007bff',
        fizik: '#28a745',
        kimya: '#ffc107',
        biyoloji: '#17a2b8',
        edebiyat: '#6f42c1',
        tarih: '#fd7e14',
        diger: '#6c757d'
    };
    return colors[category] || colors.diger;
}

// Text truncate
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Validation fonksiyonları
const ValidationUtils = {
    required: (value) => value && value.trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    url: (value) => isValidURL(value),
    minLength: (value, min) => value && value.length >= min,
    maxLength: (value, max) => value && value.length <= max
};

// Debounce fonksiyonu
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle fonksiyonu
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Deep clone
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}