// Login Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const forgotPasswordLink = document.getElementById('forgot-password');
    const rememberMeCheckbox = document.getElementById('remember-me');

    // --- Toggle Password Visibility ---
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;

            const icon = togglePasswordBtn.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // --- Form Validation ---
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const showError = (input, message) => {
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        input.classList.add('error');
    };

    const clearError = (input) => {
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
        input.classList.remove('error');
    };

    // Clear errors on input
    emailInput.addEventListener('input', () => clearError(emailInput));
    passwordInput.addEventListener('input', () => clearError(passwordInput));

    // --- Form Submission ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            clearError(emailInput);
            clearError(passwordInput);

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = rememberMeCheckbox.checked;

            let isValid = true;

            // Validate email
            if (!email) {
                showError(emailInput, 'Email is required');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            }

            // Validate password
            if (!password) {
                showError(passwordInput, 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters');
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            const submitBtn = loginForm.querySelector('.btn-primary');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Simulate API call (replace with actual API call)
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Store user data if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('lyroUser', JSON.stringify({
                        email: email,
                        rememberMe: true
                    }));
                }

                // Mark as logged in
                localStorage.setItem('isLoggedIn', 'true');

                // Redirect to learn page
                window.location.href = '/learn';

            } catch (error) {
                console.error('Login error:', error);
                showError(passwordInput, 'Invalid email or password');
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }

    // --- Forgot Password ---
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();

            const email = prompt('Please enter your email address to reset your password:');

            if (email && validateEmail(email)) {
                // Simulate sending reset email
                alert(`Password reset instructions have been sent to ${email}`);
            } else if (email !== null) {
                alert('Please enter a valid email address');
            }
        });
    }

    // --- Auto-fill email if remembered ---
    const savedUser = localStorage.getItem('lyroUser');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            if (userData.email && userData.rememberMe) {
                emailInput.value = userData.email;
                rememberMeCheckbox.checked = true;
            }
        } catch (error) {
            console.error('Error loading saved user data:', error);
        }
    }

    // --- Check if already logged in ---
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // Optional: redirect to learn page if already logged in
        // window.location.href = '/learn';
    }
});
