// Signup Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const nameInput = document.getElementById('name');
    const surnameInput = document.getElementById('surname');
    const ageInput = document.getElementById('age');
    const gradeSelect = document.getElementById('grade');
    const schoolSelect = document.getElementById('school');
    const townInput = document.getElementById('town');
    const postalCodeInput = document.getElementById('postal-code');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const togglePasswordConfirmBtn = document.querySelector('.toggle-password-confirm');

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

    if (togglePasswordConfirmBtn) {
        togglePasswordConfirmBtn.addEventListener('click', () => {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;

            const icon = togglePasswordConfirmBtn.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // --- Validation Functions ---
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePostalCode = (code) => {
        return /^[0-9]{4}$/.test(code);
    };

    const showError = (input, message) => {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        input.classList.add('error');
    };

    const clearError = (input) => {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
        input.classList.remove('error');
    };

    // Clear errors on input
    const inputs = [nameInput, surnameInput, ageInput, schoolSelect, townInput, postalCodeInput, emailInput, passwordInput, confirmPasswordInput];
    inputs.forEach(input => {
        input.addEventListener('input', () => clearError(input));
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', () => clearError(input));
        }
    });

    // --- Postal Code Formatting ---
    postalCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });

    // --- Form Submission ---
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent full page reload

            // Reset previous errors
            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
                el.classList.remove('show');
            });
            document.querySelectorAll('input, select').forEach(el => el.classList.remove('error'));

            // Show loading state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const submitText = submitBtn.querySelector('.btn-text');
            const loader = submitBtn.querySelector('.btn-loader');
            submitText.classList.add('hidden');
            loader.classList.remove('hidden');
            submitBtn.disabled = true;

            try {
                // Convert FormData to plain object for JSON
                const formData = new FormData(signupForm);
                const data = {};
                formData.forEach((value, key) => {
                    data[key] = value;
                });

                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json().catch(() => ({}));

                if (response.ok && result.success) {
                    // Success → redirect to grade-specific learn page
                    window.location.href = result.redirect || '/learn';
                } else {
                    // Show error on page
                    let errorMsg = result.error || 'Something went wrong. Please try again.';
                    alert(errorMsg);
                }
            } catch (err) {
                console.error(err);
                alert('Network error. Please check your connection.');
            } finally {
                // Reset button
                submitText.classList.remove('hidden');
                loader.classList.add('hidden');
                submitBtn.disabled = false;
            }
        });
    }

    // --- Terms Link Handler ---
    const termsLink = document.querySelector('.terms-link');
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Terms & Conditions:\n\n1. You must be a Grade 12 student\n2. Use the platform responsibly\n3. Your data will be kept secure\n4. You agree to our privacy policy');
        });
    }
});
