// Signup Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const nameInput = document.getElementById('name');
    const surnameInput = document.getElementById('surname');
    const ageInput = document.getElementById('age');
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
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear all previous errors
            inputs.forEach(input => clearError(input));

            // Get form values
            const formData = {
                name: nameInput.value.trim(),
                surname: surnameInput.value.trim(),
                age: ageInput.value.trim(),
                school: schoolSelect.value,
                town: townInput.value.trim(),
                postalCode: postalCodeInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value.trim(),
                confirmPassword: confirmPasswordInput.value.trim(),
                termsAccepted: termsCheckbox.checked
            };

            let isValid = true;

            // Validate Name
            if (!formData.name) {
                showError(nameInput, 'First name is required');
                isValid = false;
            } else if (formData.name.length < 2) {
                showError(nameInput, 'Name must be at least 2 characters');
                isValid = false;
            }

            // Validate Surname
            if (!formData.surname) {
                showError(surnameInput, 'Surname is required');
                isValid = false;
            } else if (formData.surname.length < 2) {
                showError(surnameInput, 'Surname must be at least 2 characters');
                isValid = false;
            }

            // Validate Age
            if (!formData.age) {
                showError(ageInput, 'Age is required');
                isValid = false;
            } else if (formData.age < 13 || formData.age > 25) {
                showError(ageInput, 'Age must be between 13 and 25');
                isValid = false;
            }

            // Validate School
            if (!formData.school) {
                showError(schoolSelect, 'Please select your high school');
                isValid = false;
            }

            // Validate Town
            if (!formData.town) {
                showError(townInput, 'Town/City is required');
                isValid = false;
            } else if (formData.town.length < 2) {
                showError(townInput, 'Town/City must be at least 2 characters');
                isValid = false;
            }

            // Validate Postal Code
            if (!formData.postalCode) {
                showError(postalCodeInput, 'Postal code is required');
                isValid = false;
            } else if (!validatePostalCode(formData.postalCode)) {
                showError(postalCodeInput, 'Postal code must be 4 digits');
                isValid = false;
            }

            // Validate Email
            if (!formData.email) {
                showError(emailInput, 'Email is required');
                isValid = false;
            } else if (!validateEmail(formData.email)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            }

            // Validate Password
            if (!formData.password) {
                showError(passwordInput, 'Password is required');
                isValid = false;
            } else if (formData.password.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters');
                isValid = false;
            }

            // Validate Confirm Password
            if (!formData.confirmPassword) {
                showError(confirmPasswordInput, 'Please confirm your password');
                isValid = false;
            } else if (formData.password !== formData.confirmPassword) {
                showError(confirmPasswordInput, 'Passwords do not match');
                isValid = false;
            }

            // Validate Terms
            if (!formData.termsAccepted) {
                const termsGroup = termsCheckbox.closest('.form-group');
                const errorElement = termsGroup.querySelector('.error-message');
                if (errorElement) {
                    errorElement.textContent = 'You must accept the terms and conditions';
                    errorElement.classList.add('show');
                }
                isValid = false;
            }

            if (!isValid) return;

            // Show loading state
            const submitBtn = signupForm.querySelector('.btn-primary');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Real API Call
            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Signup failed');
                }

                // Store user data in localStorage (optional, but good for frontend state)
                localStorage.setItem('lyroUser', JSON.stringify({
                    name: formData.name,
                    email: formData.email
                }));
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('onboardingComplete', 'true');

                // Success message
                alert('Account created successfully! Welcome to Lyro Tutor!');

                // Redirect to login or learn page
                window.location.href = '/login';

            } catch (error) {
                console.error('Signup error:', error);
                showError(emailInput, error.message);
            } finally {
                submitBtn.classList.remove('loading');
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
