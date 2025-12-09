// paper1.js - Paper 1 Topics Page Interactions

document.addEventListener('DOMContentLoaded', function () {
    // Add smooth entrance animations
    const topicCards = document.querySelectorAll('.topic-card');

    // Stagger animation for topic cards
    topicCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // Add click feedback
    topicCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.background = 'rgba(26, 182, 157, 0.5)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';

            const rect = card.getBoundingClientRect();
            ripple.style.left = (e.clientX - rect.left - 10) + 'px';
            ripple.style.top = (e.clientY - rect.top - 10) + 'px';

            card.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Simulate progress (for demo purposes)
    // In production, this would come from backend/localStorage
    updateProgress(0);
});

// Function to update overall progress
function updateProgress(percentage) {
    const progressFill = document.querySelector('.progress-fill');
    const progressValue = document.querySelector('.progress-value');

    if (progressFill && progressValue) {
        setTimeout(() => {
            progressFill.style.width = percentage + '%';
            progressValue.textContent = percentage + '%';
        }, 500);
    }
}

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(20);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
