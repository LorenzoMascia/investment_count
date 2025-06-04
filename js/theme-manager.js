class ThemeManager {
  static init() {
    // Controlla se c'è una preferenza salvata
    const savedTheme = localStorage.getItem('themePreference');
    const darkToggle = document.getElementById('darkToggle');
    
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      darkToggle.checked = true;
    } else if (savedTheme === 'light') {
      document.body.setAttribute('data-theme', 'light');
      darkToggle.checked = false;
    } else {
      // Usa la preferenza del sistema
      this.setSystemPreference();
    }
  }

  static toggle() {
    const darkToggle = document.getElementById('darkToggle');
    if (darkToggle.checked) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('themePreference', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('themePreference', 'light');
    }
  }

  static setSystemPreference() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkToggle = document.getElementById('darkToggle');
    
    if (prefersDark) {
      document.body.setAttribute('data-theme', 'dark');
      darkToggle.checked = true;
    } else {
      document.body.setAttribute('data-theme', 'light');
      darkToggle.checked = false;
    }
    
    localStorage.setItem('themePreference', prefersDark ? 'dark' : 'light');
  }
}