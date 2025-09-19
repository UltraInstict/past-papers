// Modern Papers Hub JavaScript
class PapersHub {
    constructor() {
      this.papers = {};
      this.currentView = 'grid';
      this.currentFilters = {
        grade: '',
        subject: '',
        year: '',
        search: ''
      };
      this.searchSuggestions = [];
      
      this.init();
    }
  
    async init() {
      await this.loadPapers();
      this.setupEventListeners();
      this.setupNavigation();
      this.setupTheme();
      this.updateStats();
      this.renderPapers();
      this.populateFilterOptions();
    }
  
    async loadPapers() {
      try {
        const response = await fetch('papers.json');
        this.papers = await response.json();
        this.generateSearchSuggestions();
      } catch (error) {
        console.error('Error loading papers:', error);
        this.showError('Failed to load papers. Please try again later.');
      }
    }
  
    generateSearchSuggestions() {
      const suggestions = new Set();
      
      Object.keys(this.papers).forEach(grade => {
        suggestions.add(grade);
        
        Object.keys(this.papers[grade]).forEach(subject => {
          suggestions.add(subject);
          suggestions.add(`${grade} ${subject}`);
          
          this.papers[grade][subject].forEach(paper => {
            suggestions.add(`${subject} ${paper.year}`);
            suggestions.add(`${grade} ${subject} ${paper.year}`);
          });
        });
      });
      
      this.searchSuggestions = Array.from(suggestions);
    }
  
    setupEventListeners() {
      // Mobile menu toggle
      const navToggle = document.getElementById('nav-toggle');
      const navMenu = document.getElementById('nav-menu');
      
      navToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });
  
      // Theme toggle
      const themeToggle = document.getElementById('theme-toggle');
      themeToggle?.addEventListener('click', () => {
        this.toggleTheme();
      });
  
      // Enhanced search
      const mainSearch = document.getElementById('main-search');
      const searchSuggestions = document.getElementById('search-suggestions');
      
      mainSearch?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.currentFilters.search = query;
        
        if (query.length > 0) {
          this.showSearchSuggestions(query, searchSuggestions);
        } else {
          searchSuggestions.style.display = 'none';
        }
        
        this.filterPapers();
      });
  
      mainSearch?.addEventListener('blur', () => {
        setTimeout(() => {
          searchSuggestions.style.display = 'none';
        }, 200);
      });
  
      // Quick filters
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          const filter = btn.getAttribute('data-filter');
          this.applyQuickFilter(filter);
        });
      });
  
      // Advanced filters
      document.getElementById('grade-filter')?.addEventListener('change', (e) => {
        this.currentFilters.grade = e.target.value;
        this.filterPapers();
      });
  
      document.getElementById('subject-filter')?.addEventListener('change', (e) => {
        this.currentFilters.subject = e.target.value;
        this.filterPapers();
      });
  
      document.getElementById('year-filter')?.addEventListener('change', (e) => {
        this.currentFilters.year = e.target.value;
        this.filterPapers();
      });
  
      // Clear filters
      document.getElementById('clear-filters')?.addEventListener('click', () => {
        this.clearAllFilters();
      });
  
      // View toggle
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          this.currentView = btn.getAttribute('data-view');
          this.updateView();
        });
      });
  
      // Add view mode options
      document.addEventListener('keydown', (e) => {
        if (e.key === '1') this.setViewMode('grid');
        if (e.key === '2') this.setViewMode('card');
        if (e.key === '3') this.setViewMode('compact');
      });
  
      // Contact form
      document.querySelector('.contact-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleContactForm(e.target);
      });
    }
  
    setupNavigation() {
      const navLinks = document.querySelectorAll('.nav-link');
      const pages = document.querySelectorAll('.page');
  
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Update active nav link
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          // Show corresponding page
          const targetPage = link.getAttribute('data-page') + '-page';
          pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === targetPage) {
              page.classList.add('active');
              page.classList.add('fade-in-up');
            }
          });
  
          // Close mobile menu
          document.getElementById('nav-menu').classList.remove('active');
          document.getElementById('nav-toggle').classList.remove('active');
  
          // Update URL hash
          window.location.hash = link.getAttribute('data-page');
        });
      });
  
      // Handle initial page load with hash
      this.handleInitialNavigation();
    }
  
    handleInitialNavigation() {
      const hash = window.location.hash.slice(1) || 'home';
      const targetLink = document.querySelector(`[data-page="${hash}"]`);
      if (targetLink) {
        targetLink.click();
      }
    }
  
    setupTheme() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      this.updateThemeIcon(savedTheme);
    }
  
    toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      this.updateThemeIcon(newTheme);
    }
  
    updateThemeIcon(theme) {
      const themeIcon = document.querySelector('#theme-toggle i');
      if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }
  
    showSearchSuggestions(query, container) {
      const matches = this.searchSuggestions
        .filter(suggestion => suggestion.toLowerCase().includes(query))
        .slice(0, 5);
  
      if (matches.length > 0) {
        container.innerHTML = matches
          .map(match => `<div class="suggestion-item">${match}</div>`)
          .join('');
        
        container.style.display = 'block';
        
        // Add click handlers to suggestions
        container.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            document.getElementById('main-search').value = item.textContent;
            this.currentFilters.search = item.textContent.toLowerCase();
            container.style.display = 'none';
            this.filterPapers();
          });
        });
      } else {
        container.style.display = 'none';
      }
    }
  
    applyQuickFilter(filter) {
      this.clearAllFilters();
      
      if (filter !== 'all') {
        this.currentFilters.grade = filter.replace('-', ' ');
        // Update the grade filter dropdown
        const gradeFilter = document.getElementById('grade-filter');
        if (gradeFilter) {
          gradeFilter.value = this.currentFilters.grade;
        }
      }
      
      this.filterPapers();
    }
  
    clearAllFilters() {
      this.currentFilters = {
        grade: '',
        subject: '',
        year: '',
        search: ''
      };
      
      // Reset form elements
      document.getElementById('grade-filter').value = '';
      document.getElementById('subject-filter').value = '';
      document.getElementById('year-filter').value = '';
      document.getElementById('main-search').value = '';
      
      this.filterPapers();
    }
  
    populateFilterOptions() {
      const subjects = new Set();
      const years = new Set();
      
      Object.values(this.papers).forEach(gradeData => {
        Object.keys(gradeData).forEach(subject => {
          subjects.add(subject);
          gradeData[subject].forEach(paper => {
            years.add(paper.year);
          });
        });
      });
  
      // Populate subject filter
      const subjectFilter = document.getElementById('subject-filter');
      if (subjectFilter) {
        Array.from(subjects).sort().forEach(subject => {
          const option = document.createElement('option');
          option.value = subject;
          option.textContent = subject;
          subjectFilter.appendChild(option);
        });
      }
  
      // Populate year filter
      const yearFilter = document.getElementById('year-filter');
      if (yearFilter) {
        Array.from(years).sort((a, b) => b - a).forEach(year => {
          const option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          yearFilter.appendChild(option);
        });
      }
    }
  
    updateStats() {
      let totalPapers = 0;
      const subjects = new Set();
      let latestYear = 0;
  
      Object.values(this.papers).forEach(gradeData => {
        Object.entries(gradeData).forEach(([subject, papers]) => {
          subjects.add(subject);
          totalPapers += papers.length;
          papers.forEach(paper => {
            if (paper.year > latestYear) {
              latestYear = paper.year;
            }
          });
        });
      });
  
      // Animate counters
      this.animateCounter('total-papers', totalPapers);
      this.animateCounter('total-subjects', subjects.size);
      
      document.getElementById('latest-year').textContent = latestYear;
      
      // Simulate downloads (you'd get this from analytics in real app)
      this.animateCounter('downloads-today', Math.floor(Math.random() * 100) + 50);
    }
  
    animateCounter(elementId, target) {
      const element = document.getElementById(elementId);
      if (!element) return;
  
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current);
        }
      }, 20);
    }
  
    renderPapers() {
      const container = document.getElementById('papers-container');
      if (!container) return;
  
      container.innerHTML = '';
  
      Object.entries(this.papers).forEach(([grade, subjects]) => {
        const gradeSection = this.createGradeSection(grade, subjects);
        container.appendChild(gradeSection);
      });
  
      this.setupPaperInteractions();
    }
  
    createGradeSection(grade, subjects) {
      const section = document.createElement('div');
      section.className = 'grade-section fade-in-up';
      section.setAttribute('data-grade', grade);
  
      const header = document.createElement('div');
      header.className = 'grade-header';
      header.innerHTML = `
        <h3>${grade}</h3>
        <i class="fas fa-chevron-down toggle-icon"></i>
      `;
  
      const container = document.createElement('div');
      container.className = 'subjects-container';
      container.style.display = 'block';
  
      Object.entries(subjects).forEach(([subject, papers]) => {
        const subjectItem = this.createSubjectItem(subject, papers, grade);
        container.appendChild(subjectItem);
      });
  
      // Toggle functionality
      header.addEventListener('click', () => {
        const isExpanded = container.style.display === 'block';
        container.style.display = isExpanded ? 'none' : 'block';
        header.classList.toggle('collapsed', isExpanded);
      });
  
      section.appendChild(header);
      section.appendChild(container);
      return section;
    }
  
    createSubjectItem(subject, papers, grade) {
      const item = document.createElement('div');
      item.className = 'subject-item';
      item.setAttribute('data-subject', subject);
  
      const header = document.createElement('div');
      header.className = 'subject-header';
      header.innerHTML = `
        <div class="subject-name">
          <i class="fas fa-book"></i>
          <span>${subject}</span>
          <span class="papers-count">(${papers.length})</span>
        </div>
        <i class="fas fa-chevron-down toggle-icon"></i>
      `;
  
      const papersList = document.createElement('div');
      papersList.className = 'papers-list';
  
      papers.forEach(paper => {
        const paperItem = this.createPaperItem(paper, subject, grade);
        papersList.appendChild(paperItem);
      });
  
      // Toggle functionality
      header.addEventListener('click', () => {
        const isExpanded = papersList.style.display === 'block';
        papersList.style.display = isExpanded ? 'none' : 'block';
        header.classList.toggle('collapsed', isExpanded);
      });
  
      item.appendChild(header);
      item.appendChild(papersList);
      return item;
    }
  
    createPaperItem(paper, subject, grade) {
      const item = document.createElement('div');
      item.className = 'paper-item slide-in-right';
      item.setAttribute('data-year', paper.year);
  
      // Extract additional metadata if available
      const paperType = paper.paper_type || '';
  
      item.innerHTML = `
        <div class="paper-header">
          <div class="paper-info">
            <div class="paper-year">${paper.year}</div>
            <div class="paper-subject">${subject}${paperType ? ` - ${paperType}` : ''}</div>
          </div>
        </div>
        <div class="paper-actions">
          <div class="paper-links">
            <a href="${paper.paper}" class="paper-link" target="_blank" rel="noopener">
              <i class="fas fa-file-pdf"></i>
              Paper
            </a>
            ${paper.memo ? `
              <a href="${paper.memo}" class="paper-link memo" target="_blank" rel="noopener">
                <i class="fas fa-file-text"></i>
                Memo
              </a>
            ` : ''}
          </div>
        </div>
      `;
  
      return item;
    }
  
    setupPaperInteractions() {
      // Add download tracking
      document.querySelectorAll('.paper-link').forEach(link => {
        link.addEventListener('click', () => {
          this.trackDownload(link.href);
        });
      });
    }
  
    trackDownload(url) {
      // In a real app, you'd send this to analytics
      console.log('Download tracked:', url);
      
      // Update downloads counter
      const downloadsElement = document.getElementById('downloads-today');
      if (downloadsElement) {
        const current = parseInt(downloadsElement.textContent);
        downloadsElement.textContent = current + 1;
      }
    }
  
    filterPapers() {
      const { grade, subject, year, search } = this.currentFilters;
  
      document.querySelectorAll('.grade-section').forEach(gradeSection => {
        const gradeMatch = !grade || gradeSection.getAttribute('data-grade').toLowerCase().includes(grade.toLowerCase());
        let gradeVisible = false;
  
        gradeSection.querySelectorAll('.subject-item').forEach(subjectItem => {
          const subjectMatch = !subject || subjectItem.getAttribute('data-subject').toLowerCase().includes(subject.toLowerCase());
          let subjectVisible = false;
  
          subjectItem.querySelectorAll('.paper-item').forEach(paperItem => {
            const yearMatch = !year || paperItem.getAttribute('data-year') === year;
            
            const searchMatch = !search || 
              paperItem.textContent.toLowerCase().includes(search) ||
              gradeSection.getAttribute('data-grade').toLowerCase().includes(search) ||
              subjectItem.getAttribute('data-subject').toLowerCase().includes(search);
  
            const visible = gradeMatch && subjectMatch && yearMatch && searchMatch;
            paperItem.style.display = visible ? '' : 'none';
            
            if (visible) {
              subjectVisible = true;
            }
          });
  
          subjectItem.style.display = subjectVisible ? '' : 'none';
          if (subjectVisible) {
            gradeVisible = true;
          }
        });
  
        gradeSection.style.display = gradeVisible ? '' : 'none';
      });
    }
  
    updateView() {
      const container = document.getElementById('papers-container');
      if (container) {
        // Remove all view classes
        container.className = container.className.replace(/\b(list-view|card-view|compact-view)\b/g, '');
        
        // Add new view class
        if (this.currentView === 'list') {
          container.classList.add('list-view');
        } else if (this.currentView === 'card') {
          container.classList.add('card-view');
        } else if (this.currentView === 'compact') {
          container.classList.add('compact-view');
        }
        
        container.className = `papers-grid ${container.classList.contains('list-view') ? 'list-view' : ''}${container.classList.contains('card-view') ? ' card-view' : ''}${container.classList.contains('compact-view') ? ' compact-view' : ''}`;
      }
    }
  
    setViewMode(mode) {
      this.currentView = mode;
      this.updateView();
      
      // Update active button
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
      });
    }
  
    handleContactForm(form) {
      // Simulate form submission
      const submitBtn = form.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
  
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        form.reset();
        
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 2000);
      }, 1500);
    }
  
    showError(message) {
      // Create and show error notification
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
      `;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  }
  
  // Initialize the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new PapersHub();
  });
  
  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'home';
    const targetLink = document.querySelector(`[data-page="${hash}"]`);
    if (targetLink) {
      targetLink.click();
    }
  });
  
  // Add smooth scrolling for anchor links
  document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
      e.preventDefault();
      const target = document.querySelector(e.target.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
  
  // Add loading animation to external links
  document.addEventListener('click', (e) => {
    if (e.target.matches('a[target="_blank"]')) {
      e.target.style.opacity = '0.7';
      setTimeout(() => {
        e.target.style.opacity = '1';
      }, 300);
    }
  });