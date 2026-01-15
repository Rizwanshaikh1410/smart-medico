// Pagination functionality for Smart Medico

class Pagination {
    constructor() {
        this.paginationContainer = document.getElementById('pagination');
        this.questionsGrid = document.getElementById('questionsGrid');
        
        this.currentPage = 1;
        this.questionsPerPage = 6;
        this.totalPages = 1;
        this.currentQuestions = [];
        
        this.init();
    }
    
    init() {
        // Initialize pagination when questions are loaded
        if (typeof window.searchHandler !== 'undefined') {
            this.updatePagination(window.searchHandler.filteredQuestions);
        }
    }
    
    updatePagination(questions) {
        this.currentQuestions = questions;
        this.totalPages = Math.ceil(questions.length / this.questionsPerPage);
        this.currentPage = 1;
        this.renderPagination();
        this.displayPage(1);
    }
    
    displayPage(pageNumber) {
        if (!this.questionsGrid || this.currentQuestions.length === 0) return;
        
        const startIndex = (pageNumber - 1) * this.questionsPerPage;
        const endIndex = startIndex + this.questionsPerPage;
        const pageQuestions = this.currentQuestions.slice(startIndex, endIndex);
        
        this.questionsGrid.innerHTML = '';
        
        if (pageQuestions.length === 0) {
            this.questionsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>No questions found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }
        
        pageQuestions.forEach(question => {
            const questionCard = this.createQuestionCard(question);
            this.questionsGrid.appendChild(questionCard);
        });
        
        this.currentPage = pageNumber;
        this.updatePaginationButtons();
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
    
    renderPagination() {
        if (!this.paginationContainer || this.totalPages <= 1) {
            if (this.paginationContainer) {
                this.paginationContainer.innerHTML = '';
            }
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="page-btn prev-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="window.pagination.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            if (i === 1 || i === this.totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="window.pagination.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<span class="page-dots">...</span>`;
            }
        }
        
        // Next button
        paginationHTML += `
            <button class="page-btn next-btn ${this.currentPage === this.totalPages ? 'disabled' : ''}" 
                    onclick="window.pagination.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        this.paginationContainer.innerHTML = paginationHTML;
    }
    
    updatePaginationButtons() {
        const pageButtons = document.querySelectorAll('.page-btn');
        const prevButton = document.querySelector('.prev-btn');
        const nextButton = document.querySelector('.next-btn');
        
        pageButtons.forEach(button => {
            const pageNumber = parseInt(button.textContent);
            if (!isNaN(pageNumber)) {
                button.classList.toggle('active', pageNumber === this.currentPage);
            }
        });
        
        if (prevButton) {
            prevButton.classList.toggle('disabled', this.currentPage === 1);
        }
        
        if (nextButton) {
            nextButton.classList.toggle('disabled', this.currentPage === this.totalPages);
        }
    }
    
    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
            return;
        }
        
        this.displayPage(pageNumber);
        this.renderPagination();
        
        // Scroll to top of questions section
        const questionsSection = document.querySelector('.questions-section');
        if (questionsSection) {
            window.scrollTo({
                top: questionsSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }
}

// Initialize pagination when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pagination = new Pagination();
});

// Make initPagination function available globally
window.initPagination = function(questions) {
    if (window.pagination) {
        window.pagination.updatePagination(questions);
    }
};