// MindfulSpace - Main JavaScript Application
class MindfulSpaceApp {
    constructor() {
        this.currentPage = 'home';
        this.user = null;
        this.selectedChallenges = [];
        this.chatMessages = [];
        
        this.init();
    }

    init() {
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Set up event listeners
        this.setupEventListeners();
        
        // Load saved state
        this.loadState();
        
        // Initialize page
        this.showPage(this.currentPage);
        
        // Initialize chat with welcome message
        this.initializeChat();
    }

    setupEventListeners() {
        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-page')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateToPage(page);
            }
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileNav = document.getElementById('mobile-nav');
        if (mobileMenuToggle && mobileNav) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
            });
        }

        // Auth form
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuth();
            });
        }

        // Chat form
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChatMessage();
            });
        }

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }

        // Logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state ? e.state.page : 'home';
            this.showPage(page, false);
        });
    }

    navigateToPage(page) {
        // Check if page requires authentication
        if ((page === 'dashboard' || page === 'chat') && !this.user) {
            this.showPage('auth');
            return;
        }

        this.showPage(page);
    }

    showPage(page, pushState = true) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = page;

            // Update URL without page refresh
            if (pushState) {
                const url = page === 'home' ? '/' : `/${page}`;
                history.pushState({ page }, '', url);
            }

            // Update navigation
            this.updateNavigation();
            
            // Update page-specific content
            this.updatePageContent(page);

            // Close mobile menu
            const mobileNav = document.getElementById('mobile-nav');
            if (mobileNav) {
                mobileNav.classList.remove('active');
            }

            // Scroll to top
            window.scrollTo(0, 0);

            // Refresh icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    updateNavigation() {
        // Update nav links
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === this.currentPage || (page === 'home' && this.currentPage === 'home')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update auth button and user menu
        const authButton = document.getElementById('auth-button');
        const userMenu = document.getElementById('user-menu');
        
        if (this.user) {
            if (authButton) authButton.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
        } else {
            if (authButton) authButton.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    updatePageContent(page) {
        switch (page) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'chat':
                this.updateChat();
                break;
        }
    }

    updateDashboard() {
        // Update user name
        const userNameEl = document.getElementById('user-name');
        if (userNameEl && this.user) {
            userNameEl.textContent = this.user.name;
        }

        // Update challenges
        const challengesEl = document.getElementById('user-challenges');
        if (challengesEl && this.selectedChallenges.length > 0) {
            challengesEl.innerHTML = this.selectedChallenges
                .map(challenge => `<span class="tag">${this.getChallengeLabel(challenge)}</span>`)
                .join('');
        } else if (challengesEl) {
            challengesEl.innerHTML = '<span class="tag">General Support</span>';
        }

        // Update daily insight
        const insights = [
            "Remember that healing is not linear. Every small step forward is progress worth celebrating.",
            "Your feelings are valid, and it's okay to take things one day at a time.",
            "Self-care isn't selfish. Taking care of yourself helps you show up better for others.",
            "Progress isn't always visible, but that doesn't mean it's not happening.",
            "You are stronger than you think, and you've overcome challenges before.",
            "It's okay to ask for help. Seeking support is a sign of strength, not weakness.",
            "Your mental health matters. Be patient with yourself as you grow and heal."
        ];
        
        const insightEl = document.getElementById('daily-insight');
        if (insightEl) {
            const randomInsight = insights[Math.floor(Math.random() * insights.length)];
            insightEl.textContent = randomInsight;
        }
    }

    updateChat() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer && this.chatMessages.length > 0) {
            messagesContainer.innerHTML = this.chatMessages
                .map(msg => this.createMessageHTML(msg))
                .join('');
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    handleAuth() {
        const nameInput = document.getElementById('anonymous-name');
        const challengeInputs = document.querySelectorAll('input[name="challenges"]:checked');
        
        if (!nameInput.value.trim()) {
            alert('Please enter an anonymous username');
            return;
        }

        // Create user object
        this.user = {
            name: nameInput.value.trim(),
            id: Date.now().toString()
        };

        // Get selected challenges
        this.selectedChallenges = Array.from(challengeInputs).map(input => input.value);

        // Save state
        this.saveState();

        // Navigate to dashboard
        this.showPage('dashboard');

        // Show success message
        this.showNotification('Account created successfully! Welcome to MindfulSpace.', 'success');
    }

    handleLogout() {
        this.user = null;
        this.selectedChallenges = [];
        this.chatMessages = [];
        
        // Clear saved state
        localStorage.removeItem('mindfulspace_state');
        
        // Navigate to home
        this.showPage('home');
        
        this.showNotification('You have been logged out. Take care!', 'info');
    }

    handleChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addChatMessage({
            text: message,
            sender: 'user',
            timestamp: new Date()
        });

        // Clear input
        input.value = '';

        // Simulate therapist response
        setTimeout(() => {
            const responses = this.getTherapistResponses(message);
            const response = responses[Math.floor(Math.random() * responses.length)];
            
            this.addChatMessage({
                text: response,
                sender: 'therapist',
                timestamp: new Date()
            });
        }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
    }

    addChatMessage(message) {
        this.chatMessages.push(message);
        this.updateChat();
        this.saveState();
    }

    createMessageHTML(message) {
        const isReceived = message.sender === 'therapist';
        const timeString = message.timestamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });

        return `
            <div class="message ${isReceived ? 'received' : 'sent'}">
                <div class="message-content">
                    <p>${message.text}</p>
                </div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
    }

    getTherapistResponses(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Keyword-based responses
        if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
            return [
                "I hear that you're feeling anxious. That must be really difficult. Can you tell me what's been contributing to these anxious feelings?",
                "Anxiety can be overwhelming. Let's try a quick grounding exercise: Can you name 5 things you can see around you right now?",
                "Thank you for sharing that with me. Anxiety is very common, and it's brave of you to reach out. What usually helps you feel calmer?"
            ];
        }
        
        if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
            return [
                "I'm sorry you're feeling this way. Your feelings are completely valid. When did you first notice feeling like this?",
                "It sounds like you're going through a tough time. Remember that it's okay to feel sad, and you don't have to go through this alone.",
                "Thank you for trusting me with your feelings. Depression can make everything feel heavier. What's one small thing that brought you even a tiny bit of comfort recently?"
            ];
        }
        
        if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
            return [
                "Stress can really take a toll on both your mind and body. What's been the biggest source of stress for you lately?",
                "It sounds like you have a lot on your plate right now. Let's think about what you can control versus what you can't. What feels most manageable to you right now?",
                "Feeling overwhelmed is a sign that you're dealing with a lot. It's important to be gentle with yourself. How have you been taking care of yourself through this?"
            ];
        }
        
        if (lowerMessage.includes('thank') || lowerMessage.includes('grateful') || lowerMessage.includes('appreciate')) {
            return [
                "You're very welcome. I'm here to support you, and I'm grateful that you feel comfortable sharing with me.",
                "It means a lot to hear that. Remember, reaching out for support is a sign of strength, not weakness.",
                "I'm glad I can be here for you. How are you feeling about our conversation so far?"
            ];
        }
        
        // Default responses
        return [
            "I'm here to listen and support you. Can you tell me more about what's on your mind?",
            "Thank you for sharing that with me. How are you feeling about the situation right now?",
            "That sounds important to you. What thoughts or feelings come up when you think about it?",
            "I can hear that this is meaningful to you. What would be most helpful for you to explore right now?",
            "Your experience is valid, and I'm glad you feel comfortable sharing with me. What support do you need right now?",
            "It takes courage to open up about difficult things. How has this been affecting your daily life?",
            "I want to make sure I understand. Can you help me understand what this means to you?"
        ];
    }

    handleContactForm() {
        const form = document.getElementById('contact-form');
        const formData = new FormData(form);
        
        // Simulate form submission
        this.showNotification('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
        
        // Clear form
        form.reset();
    }

    initializeChat() {
        if (this.chatMessages.length === 0) {
            this.chatMessages.push({
                text: "Hello! I'm Dr. Sarah, and I'm here to support you today. How are you feeling right now?",
                sender: 'therapist',
                timestamp: new Date()
            });
        }
    }

    getChallengeLabel(challenge) {
        const labels = {
            'anxiety': 'Anxiety & Stress',
            'depression': 'Depression & Low Mood',
            'relationships': 'Relationships & Social',
            'grief': 'Grief & Loss',
            'work': 'Work & Career Stress',
            'selfesteem': 'Self-Esteem & Confidence'
        };
        return labels[challenge] || challenge;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Refresh icons for the notification
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    saveState() {
        const state = {
            user: this.user,
            selectedChallenges: this.selectedChallenges,
            chatMessages: this.chatMessages
        };
        localStorage.setItem('mindfulspace_state', JSON.stringify(state));
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('mindfulspace_state');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.user = state.user;
                this.selectedChallenges = state.selectedChallenges || [];
                this.chatMessages = state.chatMessages || [];
            }
        } catch (e) {
            console.warn('Could not load saved state:', e);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mindfulSpace = new MindfulSpaceApp();
});

// Handle initial page load based on URL
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    let initialPage = 'home';
    
    if (path === '/about') initialPage = 'about';
    else if (path === '/auth') initialPage = 'auth';
    else if (path === '/dashboard') initialPage = 'dashboard';
    else if (path === '/chat') initialPage = 'chat';
    else if (path === '/community') initialPage = 'community';
    else if (path === '/resources') initialPage = 'resources';
    else if (path === '/contact') initialPage = 'contact';
    
    // Set initial page without adding to history
    if (window.mindfulSpace && initialPage !== 'home') {
        setTimeout(() => {
            window.mindfulSpace.showPage(initialPage, false);
        }, 100);
    }
});