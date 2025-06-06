// Utility functions
const Utils = {
  // Currency formatting
  formatCurrency(value, options = {}) {
    const opts = { style: 'currency', currency: 'EUR', ...CONFIG.FORMATS.CURRENCY, ...options };
    return new Intl.NumberFormat('en-US', opts).format(value);
  },
  
  // Percentage formatting
  formatPercentage(value, options = {}) {
    const opts = { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, ...options };
    return new Intl.NumberFormat('en-US', opts).format(value / 100);
  },
  
  // Number formatting
  formatNumber(value, options = {}) {
    const opts = { ...CONFIG.FORMATS.NUMBER, ...options };
    return new Intl.NumberFormat('en-US', opts).format(value);
  },
  
  // Date formatting
  formatDate(date, options = {}) {
    const opts = { year: 'numeric', month: 'long', day: 'numeric', ...options };
    return new Intl.DateTimeFormat('en-US', opts).format(new Date(date));
  },
  
  // Input validation
  validateInput(value, type, min = null, max = null, allowNegative = false) {
    if (value === '' || value === null || value === undefined) {
      return { valid: false, message: CONFIG.VALIDATION_MESSAGES.REQUIRED };
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { valid: false, message: CONFIG.VALIDATION_MESSAGES.INVALID_NUMBER };
    }
    if (!allowNegative && numValue < 0) {
      return { valid: false, message: CONFIG.VALIDATION_MESSAGES.NEGATIVE_NOT_ALLOWED };
    }
    if (min !== null && numValue < min) {
      return { valid: false, message: CONFIG.VALIDATION_MESSAGES.MIN_VALUE.replace('{min}', min) };
    }
    if (max !== null && numValue > max) {
      return { valid: false, message: CONFIG.VALIDATION_MESSAGES.MAX_VALUE.replace('{max}', max) };
    }
    return { valid: true, value: numValue };
  },
  
  // Deep clone object
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = this.deepClone(obj[key]);
      }
    }
    return clonedObj;
  },
  
  // Smooth scroll
  smoothScroll(element, to, duration = 500) {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();
    const animateScroll = (currentTime) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      element.scrollTop = start + change * this.easeInOutQuad(progress);
      if (progress < 1) requestAnimationFrame(animateScroll);
    };
    requestAnimationFrame(animateScroll.bind(this));
  },
  
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    container.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { delay: duration });
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
  },
  
  showAlert(message, type = 'info', dismissible = true) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    const alertId = this.generateId();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} ${dismissible ? 'alert-dismissible' : ''} fade show`;
    alert.id = alertId;
    alert.innerHTML = `
      ${message}
      ${dismissible ? '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' : ''}
    `;
    alertContainer.appendChild(alert);
    if (dismissible) {
      setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
          const bsAlert = bootstrap.Alert.getOrCreateInstance(alertElement);
          bsAlert.close();
        }
      }, 5000);
    }
    return alertId;
  },
  
  hideAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      bsAlert.close();
    }
  },
  
  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  },
  
  average(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  },
  
  standardDeviation(arr) {
    const avg = this.average(arr);
    const squaredDiffs = arr.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(this.average(squaredDiffs));
  },
  
  percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    if (Number.isInteger(index)) return sorted[index];
    const lower = Math.floor(index), upper = Math.ceil(index), weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  },
  
  generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = (i * 360 / count) % 360;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  },
  
  loadFile(accept = '*/*') {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return reject(new Error('No file selected'));
        const reader = new FileReader();
        reader.onload = (e) => resolve({
          name: file.name,
          content: e.target.result,
          type: file.type,
          size: file.size
        });
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
      };
      input.click();
    });
  },
  
  saveFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        this.showToast('Copied to clipboard!', 'success');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast('Copied to clipboard!', 'success');
      }
    } catch (err) {
      this.showToast('Copy error', 'danger');
    }
  },
  
  storage: {
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        window._tempStorage = window._tempStorage || {};
        window._tempStorage[key] = value;
        return false;
      }
    },
    
    get(key, defaultValue = null) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (e) {
        return window._tempStorage?.[key] ?? defaultValue;
      }
    },
    
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        if (window._tempStorage) delete window._tempStorage[key];
      }
    },
    
    clear() {
      try {
        localStorage.clear();
      } catch (e) {
        window._tempStorage = {};
      }
    }
  }
};

window.Utils = Utils;