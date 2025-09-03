// Main Application JavaScript 
class CampusKart { 
    // 1. The constructor is the first method to run when a new object of this class is created.
    constructor() {
        // Initializes the current user object by fetching it from the browser's local storage.
        this.currentUser = this.getCurrentUser();
        // Fetches all saved items from local storage to display on the page.
        this.items = this.getItems();
        // Creates a copy of the items list to be used for filtering and searching. The spread operator '...' ensures a new array is created.
        this.filteredItems = [...this.items];
        // Sets the default view of the items to show all items initially.
        this.currentView = 'all';
        
        // Calls the main function to start the application logic.
        this.initializeApp();
    }

    // 2. This function serves as the central hub for setting up the application's core features.
    initializeApp() {
        // Checks if a user is logged in. If not, it redirects them to the login page.
        this.checkAuthStatus();
        // Sets up all the event handlers for user interactions like clicks and form submissions.
        this.initializeEventListeners();
        // Customizes the user interface based on the user's role and data.
        this.setupUserInterface();
        // Renders all the items on the webpage for the user to see.
        this.renderItems();
        // Loads pre-defined sample data if no items exist in local storage.
        this.initializeSampleData();
    }

    // 3. Verifies the user's login status to control access to the main page.
    checkAuthStatus() {
        // If there is no user logged in...
        if (!this.currentUser) {
            // ...redirect the user to the login/signup page ('index.html').
            window.location.href = 'index.html';
            return;
        }
    }

    // 4. A reusable helper function to retrieve the current user's data from local storage.
    getCurrentUser() {
        // Retrieves the string from local storage, or returns 'null' if nothing is found.
        // JSON.parse() converts the string back into a usable JavaScript object.
        return JSON.parse(localStorage.getItem('campuskart_current_user') || 'null');
    }

    // 5. A helper function to fetch all saved items from local storage.
    getItems() {
        // Retrieves the items string and converts it to a JavaScript array.
        return JSON.parse(localStorage.getItem('campuskart_items') || '[]');
    }

    // 6. A helper function to save the current items array back into local storage.
    saveItems() {
        // JSON.stringify() converts the JavaScript array into a string format, which is required for local storage.
        localStorage.setItem('campuskart_items', JSON.stringify(this.items));
    }

    // 7. Customizes the UI elements based on the logged-in user's details.
    setupUserInterface() {
        const userNameEl = document.getElementById('userName');
        if (userNameEl && this.currentUser) {
            // Sets the user's name in the navigation bar.
            userNameEl.textContent = this.currentUser.name;
        }

        // Selects all "Post Item" buttons across different parts of the page.
        const postBtns = document.querySelectorAll('#postItemBtn, #heroPostBtn, #footerPostBtn');
        postBtns.forEach(btn => {
            // This is a key logic: It checks if the user's role allows them to sell items.
            if (this.currentUser.role === 'both') {
                // If the user is a seller, the button is displayed.
                btn.style.display = 'flex';
            } else {
                // If the user is only a buyer, the button is hidden.
                btn.style.display = 'none';
            }
        });
    }

    // 8. The central function where all event listeners are initialized for a clean structure.
    initializeEventListeners() {
        // Sets up event listeners for the navigation bar.
        this.setupNavigation();
        // Sets up event listeners for the pop-up modals.
        this.setupModals();
        // Sets up event listeners for all forms on the page.
        this.setupForms();
        // Sets up event listeners for the search and filter functionalities.
        this.setupSearchAndFilters();
        // Sets up event listeners for switching between different views (e.g., 'all' vs 'free' items).
        this.setupViewToggles();
        // Sets up event listeners for the buttons in the hero section.
        this.setupHeroButtons();
        
        // Adds a click listener to the logout button to log the user out.
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    // 9. Manages the functionality of the navigation bar, including the mobile hamburger menu.
    setupNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        // Adds a click event listener to the hamburger icon.
        hamburger?.addEventListener('click', () => {
            // Toggles the 'active' class on the navigation menu, which shows/hides it via CSS.
            navMenu.classList.toggle('active');
        });

        // Adds a global click listener to close the menu when clicking outside of it.
        document.addEventListener('click', (e) => {
            // Checks if the click target is outside both the hamburger and the nav menu.
            if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
                // If so, it removes the 'active' class to hide the menu.
                navMenu?.classList.remove('active');
            }
        });

        // Sets up smooth scrolling for all anchor links (e.g., links starting with '#').
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                // Prevents the default browser jump, allowing for a smooth scroll.
                e.preventDefault();
                // Finds the target element to scroll to based on the link's href attribute.
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    // This is the key line: it scrolls the page to the target element with a smooth animation.
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                // Hides the navigation menu after a link is clicked.
                navMenu?.classList.remove('active');
            });
        });
    }

    // 10. Manages the opening and closing of pop-up modal windows.
    setupModals() {
        const addItemModal = document.getElementById('addItemModal');
        const contactModal = document.getElementById('contactModal');
        const closeButtons = document.querySelectorAll('.close-btn');

        // Adds click listeners to all buttons that should open the 'Add Item' modal.
        document.querySelectorAll('#postItemBtn, #heroPostBtn, #footerPostBtn').forEach(btn => {
            btn?.addEventListener('click', () => {
                // Checks if the user's role is set to 'both' (seller).
                if (this.currentUser.role === 'both') {
                    // Opens the 'addItemModal' modal.
                    this.openModal('addItemModal');
                } else {
                    // If the user is not a seller, a notification is displayed.
                    this.showNotification('Only sellers can post items. Please update your account.', 'info');
                }
            });
        });

        // Adds click listeners to all close buttons to close their respective modals.
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Finds the closest parent element with the class '.modal' to determine which modal to close.
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Adds a listener to close the modal when the user clicks on the dimmed background.
        [addItemModal, contactModal].forEach(modal => {
            modal?.addEventListener('click', (e) => {
                // Checks if the click happened directly on the modal container itself, not the content inside.
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    // 11. Manages all form-related functionalities, including submission and input changes.
    setupForms() {
        const addItemForm = document.getElementById('addItemForm');
        // Adds a 'submit' event listener to the 'Add Item' form.
        addItemForm?.addEventListener('submit', (e) => {
            // e.preventDefault() stops the default form submission (page reload).
            e.preventDefault();
            // Calls the function that handles the item addition logic.
            this.handleAddItem();
        });

        const imageInput = document.getElementById('itemImage');
        // Adds a 'change' event listener that fires when a user selects a file.
        imageInput?.addEventListener('change', (e) => {
            // Passes the selected file to the image upload handler function.
            this.handleImageUpload(e.target.files[0]);
        });

        // Manages the visibility of the price input based on the 'Mode' dropdown.
        const modeSelect = document.getElementById('itemMode');
        modeSelect?.addEventListener('change', (e) => {
            const priceGroup = document.getElementById('priceGroup');
            // If the user selects 'donate', the price field is hidden.
            if (e.target.value === 'donate') {
                priceGroup.style.display = 'none';
                document.getElementById('itemPrice').value = '';
            } else {
                // If any other mode is selected, the price field is shown.
                priceGroup.style.display = 'block';
            }
        });
    }

    // 12. Manages the search bar and filter dropdowns.
    setupSearchAndFilters() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const modeFilter = document.getElementById('modeFilter');
        const clearFilters = document.getElementById('clearFilters');

        // Adds an 'input' event listener to the search bar to filter items as the user types.
        searchInput?.addEventListener('input', () => {
            this.applyFilters();
        });

        // Adds a 'change' event listener to the category dropdown.
        categoryFilter?.addEventListener('change', () => {
            this.applyFilters();
        });

        // Adds a 'change' event listener to the mode dropdown.
        modeFilter?.addEventListener('change', () => {
            this.applyFilters();
        });

        // Adds a click listener to the 'Clear Filters' button.
        clearFilters?.addEventListener('click', () => {
            // Resets all filter values to empty strings.
            searchInput.value = '';
            categoryFilter.value = '';
            modeFilter.value = '';
            // Calls applyFilters to show all items again.
            this.applyFilters();
        });
    }

    // 13. Controls the functionality of the 'All Items' and 'Free Items' view buttons.
    setupViewToggles() {
        // Attaches a click listener to each view toggle button.
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Listener for the 'Free Items' button in the navigation, which switches the view and scrolls to the top.
        document.getElementById('freeItemsBtn')?.addEventListener('click', () => {
            this.switchView('free');
            document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Listener for the 'Free Items' button in the footer.
        document.getElementById('footerFreeBtn')?.addEventListener('click', () => {
            this.switchView('free');
            document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // 14. Manages the behavior of buttons in the hero section.
    setupHeroButtons() {
        // Adds a click listener to the 'Browse Items' button.
        document.getElementById('heroBrowseBtn')?.addEventListener('click', () => {
            // Scrolls the page down to the marketplace section.
            document.querySelector('.marketplace')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 15. Handles the image preview logic without uploading to a server.
    handleImageUpload(file) {
        // Exits the function if no file is selected.
        if (!file) return;

        // Validates that the selected file is an image.
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        // Validates the file size to be less than 5MB.
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        // Creates a new FileReader instance to read the file.
        const reader = new FileReader();
        const imagePreview = document.getElementById('imagePreview');

        // This event handler is called after the file has been successfully read.
        reader.onload = (e) => {
            // Sets the inner HTML of the preview container with a new <img> tag.
            // e.target.result contains the image as a Base64 string, which serves as the image source.
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            // Stores the Base64 string in a data attribute for easy access later when submitting the form.
            imagePreview.setAttribute('data-image', e.target.result);
        };

        // Starts reading the file's content as a Base64 string.
        reader.readAsDataURL(file);
    }

    // 16. Processes the form data to create and save a new item.
    handleAddItem() {
        // Gathers all the input values from the form.
        const name = document.getElementById('itemName').value.trim();
        const category = document.getElementById('itemCategory').value;
        const mode = document.getElementById('itemMode').value;
        const price = document.getElementById('itemPrice').value;
        const description = document.getElementById('itemDescription').value.trim();
        const imagePreview = document.getElementById('imagePreview');
        const image = imagePreview.getAttribute('data-image');

        // Performs form validation to ensure required fields are filled.
        if (!name || !category || !mode) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Validates the price if the item is not a donation.
        if (mode !== 'donate' && (!price || price <= 0)) {
            this.showNotification('Please enter a valid price', 'error');
            return;
        }

        // Creates a new item object with all collected data.
        const newItem = {
            id: Date.now().toString(),
            name,
            category,
            mode,
            price: mode === 'donate' ? 0 : parseFloat(price),
            description,
            image: image || null,
            sellerId: this.currentUser.id,
            sellerName: this.currentUser.name,
            sellerCollege: this.currentUser.college,
            sellerEmail: this.currentUser.email,
            createdAt: new Date().toISOString()
        };

        // Adds the new item to the main array.
        this.items.push(newItem);
        // Saves the updated list of items to local storage.
        this.saveItems();
        // Reruns the filters to include the new item in the displayed list.
        this.applyFilters();
        // Closes the modal after a successful submission.
        this.closeModal('addItemModal');
        // Resets the form to its initial state for the next use.
        this.resetAddItemForm();
        
        // Displays a success message.
        this.showNotification('Item added successfully!', 'success');
    }

    // 17. Resets the form fields and preview elements.
    resetAddItemForm() {
        // Resets the form to clear all input values.
        document.getElementById('addItemForm').reset();
        // Restores the default HTML for the image preview container.
        document.getElementById('imagePreview').innerHTML = `
            <i class="fas fa-camera"></i>
            <p>Click to upload image</p>
        `;
        // Removes the Base64 image data.
        document.getElementById('imagePreview').removeAttribute('data-image');
        // Ensures the price group is visible for the next item.
        document.getElementById('priceGroup').style.display = 'block';
    }

    // 18. Filters the items array based on user inputs.
    applyFilters() {
        // Gets the search term and converts it to lowercase.
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const modeFilter = document.getElementById('modeFilter')?.value || '';

        // The .filter() method creates a new array of items that match all the conditions below.
        this.filteredItems = this.items.filter(item => {
            // Checks if the item's name or description includes the search term.
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                                 item.description.toLowerCase().includes(searchTerm);
            // Checks if the item's category matches the selected filter.
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            // Checks if the item's mode matches the selected filter.
            const matchesMode = !modeFilter || item.mode === modeFilter;
            // Checks if the item matches the current view ('all' or 'free').
            const matchesView = this.currentView === 'all' || 
                                (this.currentView === 'free' && (item.mode === 'donate' || item.mode === 'borrow'));

            // Only items that satisfy all these conditions are kept in the new array.
            return matchesSearch && matchesCategory && matchesMode && matchesView;
        });

        // After filtering, the items are re-rendered on the page.
        this.renderItems();
    }

    // 19. Switches the current view and updates the UI accordingly.
    switchView(view) {
        // Updates the current view state.
        this.currentView = view;
        
        // Removes the 'active' class from all view buttons to reset their state.
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Adds the 'active' class to the newly selected view button.
        document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

        // Re-applies the filters to display the correct items for the new view.
        this.applyFilters();
    }

    // 20. Dynamically generates and displays the item cards on the page.
    renderItems() {
        const itemsGrid = document.getElementById('itemsGrid');
        const noItems = document.getElementById('noItems');

        if (!itemsGrid) return;

        // If no items are found after filtering, the grid is hidden and a 'No items found' message is shown.
        if (this.filteredItems.length === 0) {
            itemsGrid.style.display = 'none';
            noItems.style.display = 'block';
            return;
        }

        // If there are items, the grid is displayed and the 'No items' message is hidden.
        itemsGrid.style.display = 'grid';
        noItems.style.display = 'none';

        // The core of dynamic rendering: .map() generates an array of HTML strings for each item,
        // .join('') combines them into one long string, and .innerHTML inserts that string into the DOM.
        itemsGrid.innerHTML = this.filteredItems.map(item => this.createItemCard(item)).join('');

        // Attaches event listeners to the 'Contact Seller' buttons, which are created dynamically.
        // This is done after rendering to ensure the buttons exist in the DOM.
        document.querySelectorAll('.contact-seller-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.openContactModal(item);
                }
            });
        });
    }

    // 21. A helper function that takes an item object and returns a complete HTML string for its card.
    createItemCard(item) {
    // Conditionally set the price
    const priceDisplay = item.mode === 'donate'
        ? '<div class="item-price free">FREE</div>'
        : item.mode === 'borrow'
        ? '<div class="item-price free">BORROW</div>'
        : `<div class="item-price">$${item.price.toFixed(2)}</div>`;

    // Conditionally set the image
    const imageDisplay = item.image && item.image.trim() !== ""
        ? `<img src="${item.image}" alt="${item.name}">`
        : `<img src="/images/image.png" alt="No Image Available">`;

    // Return card template
    return `
        <div class="item-card">
            <div class="item-image">
                ${imageDisplay}
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${item.name}</h3>
                    <div class="item-badges">
                        <span class="badge category">${this.getCategoryName(item.category)}</span>
                        <span class="badge mode-${item.mode}">${this.getModeName(item.mode)}</span>
                    </div>
                </div>
                ${priceDisplay}
                ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                <button class="contact-seller-btn" data-item-id="${item.id}">
                    <i class="fas fa-envelope"></i> Contact Seller
                </button>
            </div>
        </div>
    `;
}


    // 22. Helper function to map category codes to full names.
    getCategoryName(category) {
        const names = {
            'stationery': 'Stationery',
            'lab': 'Lab Items',
            'tech': 'Tech',
            'books': 'Books',
            'misc': 'Misc'
        };
        return names[category] || category;
    }

    // 23. Helper function to map mode codes to full names.
    getModeName(mode) {
        const names = {
            'buy': 'For Sale',
            'borrow': 'Borrow',
            'donate': 'Free'
        };
        return names[mode] || mode;
    }

    // 24. Opens the contact modal and populates it with the seller's information.
    openContactModal(item) {
        document.getElementById('sellerName').textContent = item.sellerName;
        document.getElementById('sellerCollege').textContent = item.sellerCollege;
        document.getElementById('sellerEmail').textContent = item.sellerEmail;
        this.openModal('contactModal');
    }

    // 25. A generic function to open any modal.
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        // Adds the 'active' class to make the modal visible.
        modal?.classList.add('active');
        // Prevents the main page from scrolling while the modal is open.
        document.body.style.overflow = 'hidden';
    }

    // 26. A generic function to close any modal.
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        // Removes the 'active' class to hide the modal.
        modal?.classList.remove('active');
        // Restores scrolling on the main page.
        document.body.style.overflow = 'auto';
    }

    // 27. Manages the user logout process.
    logout() {
        // Removes the current user's data from local storage.
        localStorage.removeItem('campuskart_current_user');
        localStorage.removeItem('campuskart_items');
        location.reload();
    }

    // 28. A reusable function to display a notification banner on the screen.
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        // Dynamically sets the class to style the notification (e.g., green for 'success', red for 'error').
        notification.className = `notification ${type} show`;
        
        // Hides the notification automatically after 3 seconds.
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // 29. A function to load initial data if the items list is empty.
    initializeSampleData() {
        // Checks if there are no items in the items array.
        if (this.items.length === 0) {
            const sampleItems = [
                {
                    id: 'sample1',
                    name: 'Scientific Calculator TI-84',
                    category: 'tech',
                    mode: 'buy',
                    price: 45.99,
                    description: 'Barely used graphing calculator, perfect for math and engineering courses.',
                    image: "/images/calculator.png", // This is the line that points to the image file.
                    sellerId: 'sample',
                    sellerName: 'Alex Johnson',
                    sellerCollege: 'State University',
                    sellerEmail: 'alex.j@email.com',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample2',
                    name: 'Lab Coat - Size M',
                    category: 'lab',
                    mode: 'donate',
                    price: 0,
                    description: 'Clean lab coat, used for one semester. Great condition.',
                    image: "/images/labCoat.png", // This is the line that points to the image file.
                    sellerId: 'sample',
                    sellerName: 'Sarah Chen',
                    sellerCollege: 'Tech Institute',
                    sellerEmail: 'sarah.c@email.com',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample3',
                    name: 'Organic Chemistry Textbook',
                    category: 'books',
                    mode: 'borrow',
                    price: 0,
                    description: 'Latest edition, available for borrowing for the semester.',
                    image: "/images/organicchem.png", // This is the line that points to the image file.
                    sellerId: 'sample',
                    sellerName: 'Mike Rodriguez',
                    sellerCollege: 'Community College',
                    sellerEmail: 'mike.r@email.com',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'sample4',
                    name: 'Notebook Set (5 pack)',
                    category: 'stationery',
                    mode: 'buy',
                    price: 12.50,
                    description: 'Brand new spiral notebooks, perfect for note-taking.',
                    image: "/images/image.png", // This is the line that points to the image file.
                    sellerId: 'sample',
                    sellerName: 'Emma Wilson',
                    sellerCollege: 'Liberal Arts College',
                    sellerEmail: 'emma.w@email.com',
                    createdAt: new Date().toISOString()
                }
            ];
            // Populates the items array with the sample data.
            this.items = sampleItems;
            // Saves the sample data to local storage.
            this.saveItems();
            // Renders the page with the newly added sample items.
            this.applyFilters();
        }
    }
}

// 30. The application's entry point.
// Ensures that the script runs only after the entire HTML document has been fully loaded and parsed.
document.addEventListener('DOMContentLoaded', () => {
    new CampusKart();
});
