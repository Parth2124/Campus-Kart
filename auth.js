// Authentication JavaScript
// This class manages all authentication-related logic like login, signup, and user state.
class AuthManager {
    // 1. The constructor is called when a new AuthManager object is created.
    constructor() {
        // Sets up all event listeners for buttons and forms.
        this.initializeEventListeners();
        // Checks if a user is already logged in when the page loads.
        this.checkAuthStatus();
    }

    // 2. This function attaches event handlers to various HTML elements.
    initializeEventListeners() {
        // Tab switching: Finds all buttons with the class 'tab-btn' and adds a click listener to each.
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Calls the switchTab method using the 'data-tab' attribute from the clicked button.
                this.switchTab(e.target.getAttribute('data-tab'));
            });
        });

        // Form submissions: Adds a submit event listener to the login form.
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            // e.preventDefault() is crucial: it stops the page from reloading.
            e.preventDefault();
            // Calls the handleLogin method to process the login attempt.
            this.handleLogin();
        });

        // Adds a submit event listener to the signup form.
        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Mode toggle handling: Adds a change listener to the 'itemMode' dropdown.
        // The '?' is optional chaining, so it won't break if the element is not found.
        document.getElementById('itemMode')?.addEventListener('change', (e) => {
            const priceGroup = document.getElementById('priceGroup');
            // If the selected value is 'donate', it hides the price input field.
            if (e.target.value === 'donate') {
                priceGroup.style.display = 'none';
            } else {
                // Otherwise, it shows the price input field.
                priceGroup.style.display = 'block';
            }
        });
    }

    // 3. Manages the visual state of the login and signup tabs.
    switchTab(tab) {
        // Removes the 'active' class from all tab buttons to deactivate them.
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Adds the 'active' class to the clicked button to highlight it.
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Hides all authentication forms.
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        // Shows only the form corresponding to the clicked tab.
        document.getElementById(tab).classList.add('active');
    }

    // 4. Handles the login logic.
    handleLogin() {
        // Fetches the values from the email and password input fields.
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validates email format using a helper function.
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return; // Stops the function if validation fails.
        }

        // Validates password length.
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Retrieves all stored users from localStorage.
        const users = this.getUsers();
        // The .find() method looks for a user object that matches the entered email and password.
        const user = users.find(u => u.email === email && u.password === password);

        // If a matching user is found...
        if (user) {
            // Saves the logged-in user's data to localStorage.
            this.setCurrentUser(user);
            this.showNotification('Login successful! Redirecting...', 'success');
            // Redirects to the homepage after a short delay.
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } else {
            // If no user is found, displays an error notification.
            this.showNotification('Invalid email or password', 'error');
        }
    }

    // 5. Handles the signup logic.
    handleSignup() {
        // Retrieves input values from the signup form.
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const college = document.getElementById('signupCollege').value.trim();
        // Finds the value of the checked radio button for the user's role.
        const role = document.querySelector('input[name="role"]:checked').value;

        // Performs basic validation for all fields.
        if (!name || name.length < 2) {
            this.showNotification('Please enter a valid name', 'error');
            return;
        }
        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        if (!college || college.length < 2) {
            this.showNotification('Please enter your college name', 'error');
            return;
        }

        // Checks if a user with the same email already exists using the .some() method.
        const users = this.getUsers();
        if (users.some(u => u.email === email)) {
            this.showNotification('User with this email already exists', 'error');
            return;
        }

        // Creates a new user object with all the details.
        const newUser = {
            id: Date.now().toString(), // Generates a unique ID using the current timestamp.
            name,
            email,
            password,
            college,
            role,
            createdAt: new Date().toISOString()
        };

        // Adds the new user to the array of all users.
        users.push(newUser);
        // Saves the updated array back to localStorage.
        localStorage.setItem('campuskart_users', JSON.stringify(users));
        
        // Sets the newly created user as the current logged-in user.
        this.setCurrentUser(newUser);
        this.showNotification('Account created successfully! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    }

    // 6. A helper function to validate email format using a regular expression.
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 7. Retrieves the user data array from localStorage.
    getUsers() {
        return JSON.parse(localStorage.getItem('campuskart_users') || '[]');
    }

    // 8. Saves the current user's data to localStorage.
    setCurrentUser(user) {
        localStorage.setItem('campuskart_current_user', JSON.stringify(user));
    }

    // 9. Retrieves the current logged-in user from localStorage.
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('campuskart_current_user') || 'null');
    }

    // 10. Checks the authentication status on page load and redirects if necessary.
    checkAuthStatus() {
        const currentUser = this.getCurrentUser();
        // If a user is logged in AND they are on the login page...
        if (currentUser && window.location.pathname.includes('index.html')) {
            // ...redirect them directly to the home page.
            window.location.href = 'home.html';
        }
    }

    // 11. A reusable function to display a notification message to the user.
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        // Uses template literals to dynamically set the class based on the type (e.g., 'success', 'error').
        notification.className = `notification ${type} show`;
        
        // Hides the notification after 3 seconds.
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// 12. Initializes the application.
// This event listener ensures that the JavaScript code runs only after the entire HTML content has been loaded.
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});