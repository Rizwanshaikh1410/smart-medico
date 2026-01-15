// About Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            // Close all other FAQs
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.style.maxHeight = null;
            });
            
            // If this wasn't active, open it
            if (!isActive) {
                question.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
    
    // Newsletter Form Submission
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            // Simple validation
            if (!email || !email.includes('@')) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // In a real application, you would send this to a server
            // For now, show a success message
            alert('Thank you for subscribing to our newsletter! You\'ll receive updates soon.');
            emailInput.value = '';
            
            // You could add AJAX submission here
            // fetch('/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email: email })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     alert('Thank you for subscribing!');
            //     emailInput.value = '';
            // })
            // .catch(error => {
            //     alert('Subscription failed. Please try again.');
            // });
        });
    }
    
    // Team Card Hover Effects
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Testimonial Cards Animation
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-in');
    });
    
    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
    
    // Social Media Share Buttons (Example)
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            const platform = this.querySelector('i').className.split(' ')[1];
            let shareUrl = '';
            
            switch(platform) {
                case 'fa-twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=Check out Smart Medico - Amazing medical education platform!&url=${window.location.href}`;
                    break;
                case 'fa-linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`;
                    break;
                case 'fa-facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Floating animation for icons */
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .floating-icon {
            animation: float 6s ease-in-out infinite;
        }
        
        .icon1 { animation-delay: 0s; }
        .icon2 { animation-delay: 1s; }
        .icon3 { animation-delay: 2s; }
        .icon4 { animation-delay: 3s; }
    `;
    document.head.appendChild(style);
    
    // Statistics Counter Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.textContent);
                const suffix = statNumber.textContent.replace(/\d+/g, '');
                
                let count = 0;
                const increment = target / 50; // Adjust speed
                const timer = setInterval(() => {
                    count += increment;
                    if (count >= target) {
                        count = target;
                        clearInterval(timer);
                    }
                    statNumber.textContent = Math.floor(count) + suffix;
                }, 30);
                
                observer.unobserve(statNumber);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => observer.observe(stat));
    
    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transition = 'opacity 0.5s ease';
        });
        
        // Set initial opacity
        img.style.opacity = '0';
    });
});