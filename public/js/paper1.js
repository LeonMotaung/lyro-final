// paper1.js - Interactive functionality for Paper 1 Topics Page

document.addEventListener('DOMContentLoaded', function () {
    // Ensure content starts at top (important for iPhone)
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.scrollTop = 0;
    }
    window.scrollTo(0, 0);

    // Initialize the page
    initPaper1Page();
});

function initPaper1Page() {
    // Load and update progress data
    loadProgressData();

    // Set up topic card interactions
    setupTopicCards();

    // Set up navigation interactions
    setupNavigation();

    // Set up progress animations
    animateProgressBars();

    // Update topic progress indicators
    updateTopicProgress();

    // Add loading animation
    simulateLoading();
}

// Load progress data from localStorage or initialize
function loadProgressData() {
    let progressData = JSON.parse(localStorage.getItem('paper1Progress')) || {
        overallProgress: 0,
        topics: {
            algebra: { completed: 0, total: 12, progress: 0 },
            patterns: { completed: 0, total: 10, progress: 0 },
            functions: { completed: 0, total: 15, progress: 0 },
            financial: { completed: 0, total: 8, progress: 0 },
            calculus: { completed: 0, total: 18, progress: 0 },
            probability: { completed: 0, total: 9, progress: 0 },
            counting: { completed: 0, total: 7, progress: 0 },
            advancedFunctions: { completed: 0, total: 11, progress: 0 }
        }
    };

    // Save initial data if not exists
    if (!localStorage.getItem('paper1Progress')) {
        localStorage.setItem('paper1Progress', JSON.stringify(progressData));
    }

    return progressData;
}

// Calculate overall progress
function calculateOverallProgress(progressData) {
    const topics = progressData.topics;
    let totalLessons = 0;
    let completedLessons = 0;

    Object.values(topics).forEach(topic => {
        totalLessons += topic.total;
        completedLessons += topic.completed;
    });

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
}

// Update progress displays
function updateProgressDisplay() {
    const progressData = loadProgressData();
    const overallProgress = calculateOverallProgress(progressData);

    // Update overall progress
    const progressValue = document.querySelector('.progress-value');
    const progressFill = document.querySelector('.progress-fill');

    if (progressValue && progressFill) {
        progressValue.textContent = `${overallProgress}%`;
        progressFill.style.width = `${overallProgress}%`;
    }

    // Update topic progress
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach((card, index) => {
        const topicProgress = card.querySelector('.topic-progress');
        if (topicProgress) {
            const topicKey = getTopicKeyByIndex(index);
            const topicData = progressData.topics[topicKey];
            const progress = topicData ? Math.round((topicData.completed / topicData.total) * 100) : 0;
            topicProgress.textContent = `${progress}%`;
        }
    });
}

// Map index to topic key
function getTopicKeyByIndex(index) {
    const topicMap = {
        0: 'algebra',
        1: 'patterns',
        2: 'functions',
        3: 'financial',
        4: 'calculus',
        5: 'probability',
        6: 'counting',
        7: 'advancedFunctions'
    };
    return topicMap[index] || 'algebra';
}

// Set up topic card interactions
function setupTopicCards() {
    const topicCards = document.querySelectorAll('.topic-card');

    topicCards.forEach((card, index) => {
        // Add hover effects
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px) scale(1.01)';
            this.style.boxShadow = '0 20px 40px -12px rgba(0, 0, 0, 0.5)';

            // Add subtle icon animation
            const icon = this.querySelector('.topic-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'var(--card-shadow)';

            // Reset icon animation
            const icon = this.querySelector('.topic-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0)';
            }
        });

        // Add click handler
        card.addEventListener('click', function (e) {
            e.preventDefault();

            // Add click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            // Simulate topic selection
            selectTopic(index);
        });

        // Add touch interactions for mobile
        card.addEventListener('touchstart', function () {
            this.style.transform = 'scale(0.98)';
        });

        card.addEventListener('touchend', function () {
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Handle topic selection
function selectTopic(topicIndex) {
    const topicNames = [
        'Algebra, Equations, and Inequalities',
        'Patterns & Geometric Series',
        'Functions and Graphs',
        'Financial Mathematics',
        'Calculus',
        'Probability',
        'Counting Principles',
        'Advanced Functions'
    ];

    const topicColors = ['teal', 'orange', 'purple', 'green', 'teal', 'orange', 'purple', 'green'];
    const selectedTopic = topicNames[topicIndex];
    const topicColor = topicColors[topicIndex];

    console.log(`Selected topic: ${selectedTopic}`);

    // Show loading state
    showTopicLoading(selectedTopic, topicColor);

    // In a real app, this would navigate to the topic page
    // For now, we'll simulate navigation
    setTimeout(() => {
        // Simulate successful navigation
        // Update progress for demonstration
        simulateProgressUpdate(topicIndex);

        // Show success feedback
        showSuccessFeedback(`Opening ${selectedTopic} lessons...`);
    }, 800);
}

// Show loading state for topic
function showTopicLoading(topicName, color) {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'topic-loading-overlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Create loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'topic-loading-spinner';
    spinner.style.cssText = `
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top-color: var(--accent-${color});
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 20px;
    `;

    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'topic-loading-text';
    loadingText.textContent = `Loading ${topicName}...`;
    loadingText.style.cssText = `
        color: white;
        font-size: 18px;
        font-weight: 600;
        margin-top: 20px;
    `;

    // Add to DOM
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(loadingText);
    document.body.appendChild(loadingOverlay);

    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Show overlay
    setTimeout(() => {
        loadingOverlay.style.opacity = '1';
    }, 10);

    // Remove overlay after delay
    setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
        }, 300);
    }, 1500);
}

// Show success feedback
function showSuccessFeedback(message) {
    // Create success toast
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.95));
        color: white;
        padding: 16px 24px;
        border-radius: 16px;
        font-weight: 600;
        font-size: 14px;
        z-index: 1001;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.3);
        max-width: 80%;
        text-align: center;
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Remove after delay
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Simulate progress update
function simulateProgressUpdate(topicIndex) {
    const progressData = loadProgressData();
    const topicKey = getTopicKeyByIndex(topicIndex);

    // Increment completed lessons by 1 for demonstration
    if (progressData.topics[topicKey].completed < progressData.topics[topicKey].total) {
        progressData.topics[topicKey].completed++;
        progressData.topics[topicKey].progress = Math.round(
            (progressData.topics[topicKey].completed / progressData.topics[topicKey].total) * 100
        );

        // Save updated data
        localStorage.setItem('paper1Progress', JSON.stringify(progressData));

        // Update display
        updateProgressDisplay();

        // Animate the updated progress
        animateTopicProgress(topicIndex);
    }
}

// Animate topic progress update
function animateTopicProgress(topicIndex) {
    const topicCard = document.querySelectorAll('.topic-card')[topicIndex];
    if (!topicCard) return;

    const progressElement = topicCard.querySelector('.topic-progress');
    if (progressElement) {
        // Add animation class
        progressElement.style.animation = 'progressPulse 0.5s ease';

        // Create animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progressPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); box-shadow: 0 0 20px rgba(26, 182, 157, 0.5); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);

        // Remove animation after completion
        setTimeout(() => {
            progressElement.style.animation = '';
        }, 500);
    }
}

// Set up navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const backBtn = document.querySelector('.back-btn');

    // Handle back button
    if (backBtn) {
        backBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Add click animation
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                // Navigate back
                window.location.href = '/learn';
            }, 150);
        });
    }

    // Handle nav item clicks
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();

                // Add click animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);

                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');

                console.log(`Navigating to: ${this.querySelector('span').textContent}`);
            }
        });
    });
}

// Animate progress bars on load
function animateProgressBars() {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        // Reset width to 0 for animation
        const currentWidth = progressFill.style.width;
        progressFill.style.width = '0%';

        // Animate to current width
        setTimeout(() => {
            progressFill.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            progressFill.style.width = currentWidth;
        }, 300);
    }
}

// Update topic progress from data
function updateTopicProgress() {
    const progressData = loadProgressData();

    Object.values(progressData.topics).forEach((topic, index) => {
        const progress = Math.round((topic.completed / topic.total) * 100);
        const progressElement = document.querySelectorAll('.topic-progress')[index];

        if (progressElement) {
            progressElement.textContent = `${progress}%`;

            // Add color coding based on progress
            if (progress === 100) {
                progressElement.style.color = 'var(--accent-green)';
                progressElement.style.background = 'rgba(16, 185, 129, 0.1)';
            } else if (progress >= 50) {
                progressElement.style.color = 'var(--accent-teal)';
                progressElement.style.background = 'rgba(26, 182, 157, 0.1)';
            } else if (progress > 0) {
                progressElement.style.color = 'var(--accent-orange)';
                progressElement.style.background = 'rgba(202, 92, 29, 0.1)';
            }
        }
    });
}

// Simulate loading animation
function simulateLoading() {
    // Add subtle loading animation to hero icon
    const heroIcon = document.querySelector('.hero-icon');
    if (heroIcon) {
        heroIcon.style.opacity = '0';
        heroIcon.style.transform = 'translateY(20px)';

        setTimeout(() => {
            heroIcon.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroIcon.style.opacity = '1';
            heroIcon.style.transform = 'translateY(0)';
        }, 200);
    }

    // Animate topic cards sequentially
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 400 + (index * 100));
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', function (e) {
    const topicCards = document.querySelectorAll('.topic-card');

    // Arrow down/up navigation between topic cards
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();

        const currentIndex = Array.from(topicCards).findIndex(card =>
            card === document.activeElement || card.contains(document.activeElement)
        );

        let nextIndex;
        if (e.key === 'ArrowDown') {
            nextIndex = currentIndex < topicCards.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : topicCards.length - 1;
        }

        if (topicCards[nextIndex]) {
            topicCards[nextIndex].focus();

            // Add visual feedback
            topicCards[nextIndex].style.boxShadow = '0 0 0 2px var(--accent-teal)';
            setTimeout(() => {
                topicCards[nextIndex].style.boxShadow = '';
            }, 300);
        }
    }

    // Enter key to select focused topic
    if (e.key === 'Enter' && document.activeElement.classList.contains('topic-card')) {
        const focusedCard = document.activeElement;
        const cardIndex = Array.from(topicCards).indexOf(focusedCard);

        if (cardIndex !== -1) {
            selectTopic(cardIndex);
        }
    }
});

// Add swipe detection for mobile navigation
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;

    // Swipe right to go back
    if (swipeDistance > swipeThreshold) {
        console.log('Swiped right - going back');
        window.location.href = '/learn';
    }
}

// Initialize on load
window.addEventListener('load', function () {
    // Update progress after all animations complete
    setTimeout(() => {
        updateProgressDisplay();
    }, 1000);
});

// Export functions for use in other modules (if needed)
window.Paper1Module = {
    loadProgressData,
    updateProgressDisplay,
    selectTopic
};
