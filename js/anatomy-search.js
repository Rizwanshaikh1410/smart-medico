// Anatomy Search and Filter System
class AnatomySearchHandler {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.searchResults = document.getElementById('searchResults');
        this.questionsGrid = document.getElementById('questionsGrid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.regionSelect = document.getElementById('regionSelect');
        this.regionFilter = document.getElementById('regionFilter');
        this.regionCards = document.querySelectorAll('.region-card');
        
        this.currentQuestions = [];
        this.filteredQuestions = [];
        this.currentFilter = 'all';
        this.currentRegion = 'all';
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
                    
                    // Toggle region filter visibility
                    if (filterValue === 'region') {
                        this.regionFilter.style.display = 'block';
                        this.currentFilter = 'all';
                    } else {
                        this.regionFilter.style.display = 'none';
                        this.currentFilter = filterValue;
                        this.currentRegion = 'all';
                        if (this.regionSelect) this.regionSelect.value = 'all';
                    }
                    
                    // Update active button
                    this.filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    this.searchQuestions();
                    this.updateURL();
                });
            });
        }
        
        // Region select filter
        if (this.regionSelect) {
            this.regionSelect.addEventListener('change', () => {
                this.currentRegion = this.regionSelect.value;
                this.currentFilter = 'region';
                this.searchQuestions();
                this.updateURL();
            });
        }
        
        // Region cards click
        if (this.regionCards) {
            this.regionCards.forEach(card => {
                card.addEventListener('click', () => {
                    const region = card.getAttribute('data-region');
                    this.currentRegion = region;
                    this.currentFilter = 'region';
                    
                    // Update UI
                    this.filterButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-filter') === 'region') {
                            btn.classList.add('active');
                        }
                    });
                    
                    if (this.regionSelect) this.regionSelect.value = region;
                    this.regionFilter.style.display = 'block';
                    
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
        if (typeof window.anatomyQuestions !== 'undefined') {
            this.currentQuestions = window.anatomyQuestions;
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
                       question.region.toLowerCase().includes(this.currentSearch);
            });
            
            this.clearSearchBtn.classList.add('show');
        } else {
            this.clearSearchBtn.classList.remove('show');
        }
        
        // Apply marks filter
        if (this.currentFilter !== 'all' && this.currentFilter !== 'region') {
            results = results.filter(question => 
                question.marks.toString() === this.currentFilter
            );
        }
        
        // Apply region filter
        if (this.currentFilter === 'region' && this.currentRegion !== 'all') {
            results = results.filter(question => 
                question.region === this.currentRegion
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
                    <h3 style="color: #495057; margin-bottom: 1rem;">No anatomy questions found</h3>
                    <p style="color: #6c757d; max-width: 500px; margin: 0 auto;">
                        Try adjusting your search terms or filter criteria. 
                        You can search by topic (e.g., brachial plexus, heart anatomy) or filter by marks or region.
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
        card.setAttribute('data-region', question.region);
        card.setAttribute('data-difficulty', question.difficulty);
        
        // Determine badge color based on marks
        let badgeClass = 'marks-badge';
        if (question.marks === 15) badgeClass += ' marks-15';
        else if (question.marks === 10) badgeClass += ' marks-10';
        else if (question.marks === 5) badgeClass += ' marks-5';
        else badgeClass += ' marks-2';
        
        // Determine region icon
        let regionIcon = 'fas fa-bone';
        let regionName = '';
        
        switch(question.region) {
            case 'upperlimb':
                regionIcon = 'fas fa-hand-paper';
                regionName = 'Upper Limb';
                break;
            case 'lowerlimb':
                regionIcon = 'fas fa-walking';
                regionName = 'Lower Limb';
                break;
            case 'thorax':
                regionIcon = 'fas fa-heart';
                regionName = 'Thorax';
                break;
            case 'abdomen':
                regionIcon = 'fas fa-stomach';
                regionName = 'Abdomen';
                break;
            case 'headneck':
                regionIcon = 'fas fa-head-side-brain';
                regionName = 'Head & Neck';
                break;
            case 'neuroanatomy':
                regionIcon = 'fas fa-brain';
                regionName = 'Neuroanatomy';
                break;
            case 'embryology':
                regionIcon = 'fas fa-baby';
                regionName = 'Embryology';
                break;
            case 'histology':
                regionIcon = 'fas fa-microscope';
                regionName = 'Histology';
                break;
        }
        
        card.innerHTML = `
            <div class="question-image-container">
                <img src="${question.image}" alt="${question.title}" class="question-image" loading="lazy">
                <div class="question-overlay">
                    <span class="region-badge">
                        <i class="${regionIcon}"></i> ${regionName}
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
                        <i class="fas fa-layer-group"></i> ${regionName}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-chart-bar"></i> ${question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                    </span>
                </div>
                <p class="question-preview">${question.content.substring(0, 120)}...</p>
                <button class="pdf-btn" onclick="window.open('${question.pdfUrl}', '_blank')" 
                        title="Open detailed PDF with diagrams">
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
        
        if (this.currentFilter !== 'all' && this.currentFilter !== 'region') {
            message += ` (${this.currentFilter} marks questions)`;
        }
        
        if (this.currentFilter === 'region' && this.currentRegion !== 'all') {
            const regionName = this.getRegionName(this.currentRegion);
            message += ` (${regionName})`;
        }
        
        if (filteredCount < totalQuestions) {
            message += ` - filtered from ${totalQuestions} total questions`;
        }
        
        this.searchResults.textContent = message;
    }
    
    getRegionName(regionCode) {
        const regions = {
            'upperlimb': 'Upper Limb',
            'lowerlimb': 'Lower Limb',
            'thorax': 'Thorax',
            'abdomen': 'Abdomen & Pelvis',
            'headneck': 'Head & Neck',
            'neuroanatomy': 'Neuroanatomy',
            'embryology': 'Embryology',
            'histology': 'Histology'
        };
        return regions[regionCode] || regionCode;
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
                    onclick="window.anatomySearch.goToPage(${this.currentPage - 1})"
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
            paginationHTML += `<button class="page-btn" onclick="window.anatomySearch.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="window.anatomySearch.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
            paginationHTML += `<button class="page-btn" onclick="window.anatomySearch.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        paginationHTML += `
            <button class="page-btn next-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="window.anatomySearch.goToPage(${this.currentPage + 1})"
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
        if (this.currentRegion !== 'all') params.set('region', this.currentRegion);
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
            
            if (this.currentFilter === 'region') {
                this.regionFilter.style.display = 'block';
            }
        }
        
        if (params.has('region')) {
            this.currentRegion = params.get('region');
            if (this.regionSelect) {
                this.regionSelect.value = this.currentRegion;
            }
        }
        
        if (params.has('page')) {
            this.currentPage = parseInt(params.get('page'));
        }
        
        if (this.currentSearch || this.currentFilter !== 'all' || this.currentRegion !== 'all') {
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
    window.anatomySearch = new AnatomySearchHandler();
});