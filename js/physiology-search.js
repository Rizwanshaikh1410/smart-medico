// Physiology Search and Filter System
class PhysiologySearchHandler {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.searchResults = document.getElementById('searchResults');
        this.questionsGrid = document.getElementById('questionsGrid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.systemSelect = document.getElementById('systemSelect');
        this.systemFilter = document.getElementById('systemFilter');
        this.systemCards = document.querySelectorAll('.system-card');
        
        this.currentQuestions = [];
        this.filteredQuestions = [];
        this.currentFilter = 'all';
        this.currentSystem = 'all';
        this.currentSearch = '';
        this.currentPage = 1;
        this.questionsPerPage = 9;
        
        this.init();
    }
    
    init() {
        // Load questions
        this.loadQuestions();
        
        // Search input event
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(() => {
                this.currentSearch = this.searchInput.value.toLowerCase().trim();
                this.searchQuestions();
                this.updateURL();
            }, 300));
        }
        
        // Clear search button
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Filter buttons
        if (this.filterButtons) {
            this.filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const filterValue = button.getAttribute('data-filter');
                    
                    // Toggle system filter visibility
                    if (filterValue === 'system') {
                        this.systemFilter.style.display = 'block';
                        this.currentFilter = 'all';
                    } else {
                        this.systemFilter.style.display = 'none';
                        this.currentFilter = filterValue;
                        this.currentSystem = 'all';
                        if (this.systemSelect) this.systemSelect.value = 'all';
                    }
                    
                    // Update active button
                    this.filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    this.searchQuestions();
                    this.updateURL();
                });
            });
        }
        
        // System select filter
        if (this.systemSelect) {
            this.systemSelect.addEventListener('change', () => {
                this.currentSystem = this.systemSelect.value;
                this.currentFilter = 'system';
                this.searchQuestions();
                this.updateURL();
            });
        }
        
        // System cards click
        if (this.systemCards) {
            this.systemCards.forEach(card => {
                card.addEventListener('click', () => {
                    const system = card.getAttribute('data-system');
                    this.currentSystem = system;
                    this.currentFilter = 'system';
                    
                    // Update UI
                    this.filterButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-filter') === 'system') {
                            btn.classList.add('active');
                        }
                    });
                    
                    if (this.systemSelect) this.systemSelect.value = system;
                    this.systemFilter.style.display = 'block';
                    
                    this.searchQuestions();
                    this.updateURL();
                    
                    // Scroll to questions
                    document.querySelector('.questions-section').scrollIntoView({
                        behavior: 'smooth'
                    });
                });
            });
        }
        
        // Load from URL parameters
        this.loadFromURL();
        
        // Initialize pagination
        this.initPagination();
    }
    
    loadQuestions() {
        if (typeof window.physiologyQuestions !== 'undefined') {
            this.currentQuestions = window.physiologyQuestions;
            this.filteredQuestions = [...this.currentQuestions];
            this.displayQuestions();
            this.updateSearchInfo();
        }
    }
    
    searchQuestions() {
        let results = [...this.currentQuestions];
        
        // Apply text search
        if (this.currentSearch) {
            results = results.filter(question => {
                return question.title.toLowerCase().includes(this.currentSearch) ||
                       question.content.toLowerCase().includes(this.currentSearch) ||
                       question.tags.some(tag => tag.toLowerCase().includes(this.currentSearch)) ||
                       question.system.toLowerCase().includes(this.currentSearch);
            });
            
            this.clearSearchBtn.classList.add('show');
        } else {
            this.clearSearchBtn.classList.remove('show');
        }
        
        // Apply marks filter
        if (this.currentFilter !== 'all' && this.currentFilter !== 'system') {
            results = results.filter(question => 
                question.marks.toString() === this.currentFilter
            );
        }
        
        // Apply system filter
        if (this.currentFilter === 'system' && this.currentSystem !== 'all') {
            results = results.filter(question => 
                question.system === this.currentSystem
            );
        }
        
        this.filteredQuestions = results;
        this.currentPage = 1;
        this.displayQuestions();
        this.updateSearchInfo();
        this.updatePagination();
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.currentSearch = '';
        this.clearSearchBtn.classList.remove('show');
        this.searchQuestions();
        this.updateURL();
    }
    
    displayQuestions() {
        if (!this.questionsGrid) return;
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.questionsPerPage;
        const endIndex = startIndex + this.questionsPerPage;
        const pageQuestions = this.filteredQuestions.slice(startIndex, endIndex);
        
        this.questionsGrid.innerHTML = '';
        
        if (pageQuestions.length === 0) {
            this.questionsGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 4rem; color: #ccc; margin-bottom: 1.5rem;"></i>
                    <h3 style="color: #495057; margin-bottom: 1rem;">No physiology questions found</h3>
                    <p style="color: #6c757d; max-width: 500px; margin: 0 auto;">
                        Try adjusting your search terms or filter criteria. 
                        You can search by topic (e.g., cardiac cycle, renal function) or filter by marks or system.
                    </p>
                </div>
            `;
            return;
        }
        
        pageQuestions.forEach(question => {
            const questionCard = this.createQuestionCard(question);
            this.questionsGrid.appendChild(questionCard);
        });
    }
    
    createQuestionCard(question) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.setAttribute('data-marks', question.marks);
        card.setAttribute('data-system', question.system);
        card.setAttribute('data-difficulty', question.difficulty);
        
        // Determine badge color based on marks
        let badgeClass = 'marks-badge';
        if (question.marks === 15) badgeClass += ' marks-15';
        else if (question.marks === 10) badgeClass += ' marks-10';
        else if (question.marks === 5) badgeClass += ' marks-5';
        else badgeClass += ' marks-2';
        
        // Determine system icon
        let systemIcon = 'fas fa-heart';
        if (question.system === 'respiratory') systemIcon = 'fas fa-lungs';
        else if (question.system === 'renal') systemIcon = 'fas fa-tint';
        else if (question.system === 'gastrointestinal') systemIcon = 'fas fa-stomach';
        else if (question.system === 'endocrine') systemIcon = 'fas fa-balance-scale';
        else if (question.system === 'neurophysiology') systemIcon = 'fas fa-brain';
        else if (question.system === 'muscle') systemIcon = 'fas fa-dumbbell';
        else if (question.system === 'blood') systemIcon = 'fas fa-vial';
        
        card.innerHTML = `
            <div class="question-image-container">
                <img src="${question.image}" alt="${question.title}" class="question-image" loading="lazy">
                <div class="question-overlay">
                    <span class="system-badge">
                        <i class="${systemIcon}"></i> ${question.system.charAt(0).toUpperCase() + question.system.slice(1)}
                    </span>
                </div>
            </div>
            <div class="question-content">
                <div class="question-header">
                    <h3 class="question-title">${question.title}</h3>
                    <span class="${badgeClass}">${question.marks} Marks</span>
                </div>
                <div class="question-meta">
                    <span class="meta-item">
                        <i class="fas fa-layer-group"></i> ${question.system.charAt(0).toUpperCase() + question.system.slice(1)} System
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-chart-bar"></i> ${question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                    </span>
                </div>
                <p class="question-preview">${question.content.substring(0, 120)}...</p>
                <button class="pdf-btn" onclick="window.open('${question.pdfUrl}', '_blank')" 
                        title="Open detailed PDF explanation">
                    <i class="fas fa-file-pdf"></i> View Full Question PDF
                </button>
                <div class="question-tags">
                    ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        
        return card;
    }
    
    updateSearchInfo() {
        if (!this.searchResults) return;
        
        const totalQuestions = this.currentQuestions.length;
        const filteredCount = this.filteredQuestions.length;
        let message = `Showing ${Math.min(filteredCount, this.questionsPerPage)} of ${filteredCount} questions`;
        
        if (this.currentSearch) {
            message += ` for "${this.currentSearch}"`;
        }
        
        if (this.currentFilter !== 'all' && this.currentFilter !== 'system') {
            message += ` (${this.currentFilter} marks questions)`;
        }
        
        if (this.currentFilter === 'system' && this.currentSystem !== 'all') {
            const systemName = this.currentSystem.charAt(0).toUpperCase() + this.currentSystem.slice(1);
            message += ` (${systemName} System)`;
        }
        
        if (filteredCount < totalQuestions) {
            message += ` - filtered from ${totalQuestions} total questions`;
        }
        
        this.searchResults.textContent = message;
    }
    
    initPagination() {
        this.updatePagination();
    }
    
    updatePagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(this.filteredQuestions.length / this.questionsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="page-btn prev-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="window.physiologySearch.goToPage(${this.currentPage - 1})"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="window.physiologySearch.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="window.physiologySearch.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
            paginationHTML += `<button class="page-btn" onclick="window.physiologySearch.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        paginationHTML += `
            <button class="page-btn next-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="window.physiologySearch.goToPage(${this.currentPage + 1})"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        // Page info
        paginationHTML += `
            <div class="page-info">
                Page ${this.currentPage} of ${totalPages}
            </div>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    }
    
    goToPage(pageNumber) {
        const totalPages = Math.ceil(this.filteredQuestions.length / this.questionsPerPage);
        
        if (pageNumber < 1 || pageNumber > totalPages || pageNumber === this.currentPage) {
            return;
        }
        
        this.currentPage = pageNumber;
        this.displayQuestions();
        this.updatePagination();
        this.updateURL();
        
        // Scroll to top of questions
        window.scrollTo({
            top: document.querySelector('.questions-section').offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    updateURL() {
        const params = new URLSearchParams();
        
        if (this.currentSearch) params.set('search', this.currentSearch);
        if (this.currentFilter !== 'all') params.set('filter', this.currentFilter);
        if (this.currentSystem !== 'all') params.set('system', this.currentSystem);
        if (this.currentPage > 1) params.set('page', this.currentPage);
        
        const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newURL);
    }
    
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('search')) {
            this.currentSearch = params.get('search');
            this.searchInput.value = this.currentSearch;
        }
        
        if (params.has('filter')) {
            this.currentFilter = params.get('filter');
            
            // Update UI
            this.filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === this.currentFilter) {
                    btn.classList.add('active');
                }
            });
            
            if (this.currentFilter === 'system') {
                this.systemFilter.style.display = 'block';
            }
        }
        
        if (params.has('system')) {
            this.currentSystem = params.get('system');
            if (this.systemSelect) {
                this.systemSelect.value = this.currentSystem;
            }
        }
        
        if (params.has('page')) {
            this.currentPage = parseInt(params.get('page'));
        }
        
        if (this.currentSearch || this.currentFilter !== 'all' || this.currentSystem !== 'all') {
            this.searchQuestions();
        }
    }
    
    debounce(func, wait) {
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.physiologySearch = new PhysiologySearchHandler();
});