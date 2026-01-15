// Main JavaScript for Smart Medico

// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const currentYear = document.getElementById('currentYear');
const navLinks = document.querySelectorAll('.nav-link');

// Mobile Navigation Toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Update copyright year
if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to current page in navigation
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        
        if (currentPage === '' || currentPage === 'index.html') {
            if (linkPage === 'index.html' || linkPage === './') {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        } else if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    
    // Add hover effect to question cards
    const questionCards = document.querySelectorAll('.question-card');
    questionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Handle filter button clicks
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter questions (this will be handled by search.js)
            if (typeof window.filterQuestions === 'function') {
                window.filterQuestions(filterValue);
            }
        });
    });
});

// Utility function to debounce search input
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

// Physiology specific functions
function initPhysiologyFilters() {
    const systemCards = document.querySelectorAll('.system-card');
    if (systemCards.length > 0) {
        systemCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove active class from all cards
                systemCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Get system
                const system = this.getAttribute('data-system');
                
                // Filter questions
                if (typeof window.physiologySearch !== 'undefined') {
                    window.physiologySearch.currentSystem = system;
                    window.physiologySearch.currentFilter = 'system';
                    window.physiologySearch.searchQuestions();
                }
            });
        });
    }
}

// Initialize physiology when page loads
if (window.location.pathname.includes('physiology.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        initPhysiologyFilters();
    });
}

// Anatomy specific initialization
function initAnatomyPage() {
    // Highlight active region card
    const regionCards = document.querySelectorAll('.region-card');
    const regionSelect = document.getElementById('regionSelect');
    
    if (regionSelect && regionCards.length > 0) {
        regionSelect.addEventListener('change', function() {
            const selectedRegion = this.value;
            
            regionCards.forEach(card => {
                card.classList.remove('active');
                if (card.getAttribute('data-region') === selectedRegion) {
                    card.classList.add('active');
                }
            });
        });
    }
    
    // Initialize region cards click
    if (regionCards.length > 0) {
        regionCards.forEach(card => {
            card.addEventListener('click', function() {
                regionCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}

// Initialize when on anatomy page
if (window.location.pathname.includes('anatomy.html')) {
    document.addEventListener('DOMContentLoaded', initAnatomyPage);
}
// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});
