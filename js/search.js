// Search functionality for Smart Medico

class SearchHandler {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.searchResults = document.getElementById('searchResults');
        this.questionsGrid = document.getElementById('questionsGrid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        this.currentQuestions = [];
        this.filteredQuestions = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        
        this.init();
    }
    
    init() {
        // Load questions from data file
        this.loadQuestions();
        
        // Set up search input event listener
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce(() => {
                this.currentSearch = this.searchInput.value.toLowerCase().trim();
                this.searchQuestions();
            }, 300));
        }
        
        // Set up clear search button
        if (this.clearSearchBtn) {
            this.clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Set up filter buttons
        if (this.filterButtons) {
            this.filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.currentFilter = button.getAttribute('data-filter');
                    this.searchQuestions();
                });
            });
        }
    }
    
    loadQuestions() {
        // This would typically come from an API or database
        // For now, we'll use the data from anatomy-data.js
        if (typeof window.anatomyQuestions !== 'undefined') {
            this.currentQuestions = window.anatomyQuestions;
            this.filteredQuestions = [...this.currentQuestions];
            this.displayQuestions(this.filteredQuestions);
        }
    }
    
    searchQuestions() {
        let results = [...this.currentQuestions];
        
        // Apply search filter
        if (this.currentSearch) {
            results = results.filter(question => {
                return question.title.toLowerCase().includes(this.currentSearch) ||
                       question.content.toLowerCase().includes(this.currentSearch) ||
                       question.tags.some(tag => tag.toLowerCase().includes(this.currentSearch));
            });
            
            this.clearSearchBtn.classList.add('show');
        } else {
            this.clearSearchBtn.classList.remove('show');
        }
        
        // Apply marks filter
        if (this.currentFilter !== 'all') {
            results = results.filter(question => 
                question.marks.toString() === this.currentFilter
            );
        }
        
        this.filteredQuestions = results;
        this.displayQuestions(results);
        this.updateSearchInfo(results.length);
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.currentSearch = '';
        this.clearSearchBtn.classList.remove('show');
        this.searchQuestions();
    }
    
    displayQuestions(questions) {
        if (!this.questionsGrid) return;
        
        this.questionsGrid.innerHTML = '';
        
        if (questions.length === 0) {
            this.questionsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>No questions found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }
        
        questions.forEach(question => {
            const questionCard = this.createQuestionCard(question);
            this.questionsGrid.appendChild(questionCard);
        });
        
        // Initialize pagination if needed
        if (typeof window.initPagination === 'function') {
            window.initPagination(questions);
        }
    }
    
    createQuestionCard(question) {
        const card = document.createElement('div');
        card.className = 'question-card';
        
        card.innerHTML = `
            <img src="${question.image}" alt="${question.title}" class="question-image">
            <div class="question-content">
                <div class="question-header">
                    <h3 class="question-title">${question.title}</h3>
                    <span class="marks-badge">${question.marks} Marks</span>
                </div>
                <p class="question-preview">${question.content.substring(0, 150)}...</p>
                <button class="pdf-btn" onclick="window.open('${question.pdfUrl}', '_blank')">
                    <i class="fas fa-file-pdf"></i> View Full Question PDF
                </button>
            </div>
        `;
        
        return card;
    }
    
    updateSearchInfo(count) {
        if (!this.searchResults) return;
        
        const totalQuestions = this.currentQuestions.length;
        let message = `Showing ${count} of ${totalQuestions} questions`;
        
        if (this.currentSearch) {
            message += ` for "${this.currentSearch}"`;
        }
        
        if (this.currentFilter !== 'all') {
            message += ` (${this.currentFilter} marks)`;
        }
        
        this.searchResults.textContent = message;
    }
}

// Initialize search handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.searchHandler = new SearchHandler();
});

// Make filterQuestions function available globally
window.filterQuestions = function(filterValue) {
    if (window.searchHandler) {
        window.searchHandler.currentFilter = filterValue;
        window.searchHandler.searchQuestions();
    }
};

// Debounce function for search input
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