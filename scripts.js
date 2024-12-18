const textarea = document.getElementById("product");
const suggestions = document.getElementById("suggestions");
const datePicker = document.getElementById("date-picker");

// Debounce timer
let debounceTimer;

// Dummy catalog data (replace with your actual data later)
let catalog = [];
let catalogLoaded = false;

// Load catalog from JSON file (e.g., catalog.json)
fetch('catalog.json')
    .then(response => response.json())
    .then(data => {
        catalog = data;
        catalogLoaded = true;
    })
    .catch(error => console.error('Error loading catalog:', error));

// Initialize Datepicker
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Materialize Datepicker with default date set to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Set default date to tomorrow

    const elems = document.querySelectorAll('.datepicker');
    const options = {
        autoClose: true,
        format: 'dd mmmm, dddd',
        defaultDate: tomorrow,
        setDefaultDate: true
    };
    M.Datepicker.init(elems, options);
});

// Adjust textarea height based on content
function adjustTextareaHeight() {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
}

// Handle product suggestions
textarea.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => handleSuggestions(), 300);
});

// Handle product name suggestions
function handleSuggestions() {
    if (!catalogLoaded) {
        return; // Don't process if catalog is not loaded
    }

    const input = textarea.value.split(/\s+/).pop();
    if (input.length < 2) {
        suggestions.style.display = "none";
        return;
    }

    const matches = catalog.filter(product =>
        product.name.toLowerCase().includes(input.toLowerCase())
    );

    if (matches.length > 0) {
        suggestions.innerHTML = matches
            .map(item => `<li role="option"><span>${item.name}</span><span>${item.quantity}</span></li>`)
            .join("");
        suggestions.style.display = "block";
        suggestions.setAttribute("aria-hidden", "false");
    } else {
        suggestions.innerHTML = ""; // Clear the suggestions list if no matches
        suggestions.style.display = "none"; // Hide the suggestions box if no matches
    }
}

// Insert selected product into textarea
suggestions.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (li && !li.classList.contains("empty")) {
        const product = li.querySelector("span:first-child").textContent;
        const quantity = li.querySelector("span:last-child").textContent;
        insertProductInTextarea(product, quantity);
    }
});

// Insert selected product into the textarea with quantity
function insertProductInTextarea(product, quantity) {
    const currentText = textarea.value.trim().split(/\s+/).pop();
    const textWithoutLastKeyword = textarea.value.trim().slice(0, -currentText.length).trim();

    // Check if the textarea is empty
    const updatedText = textWithoutLastKeyword
        ? textWithoutLastKeyword.split(/\n/).concat(`${product} ${quantity}`).join("\n")
        : `${product} ${quantity}`;  // No newline if the textarea is empty

    textarea.value = updatedText + "\n";
    suggestions.style.display = "none";
    textarea.focus();
    adjustTextareaHeight();
}

// Hide suggestions when clicking outside
document.addEventListener("click", e => {
    if (!suggestions.contains(e.target) && e.target !== textarea) {
        suggestions.style.display = "none";
    }
});

// Handle Copy button
document.getElementById("copy").addEventListener("click", () => {
    const productList = textarea.value.trim();
    if (!productList) {
        showToast("Please add at least one product to the order.");
        return;
    }

    const selectedDate = datePicker.value;
    if (!selectedDate) {
        showToast("Please select a delivery date.");
        return;
    }

    const orderText = `I have an order to be delivered by ${selectedDate}\n\n${productList}\n\nThank you!`;

    navigator.clipboard.writeText(orderText)
        .then(() => {
            showToast("Order copied to clipboard!");
        })
        .catch(() => {
            showToast("Failed to copy order to clipboard.");
        });
});

// Function to show a toast message
function showToast(message) {
    const toastContainer = document.getElementById("toast-container");
    toastContainer.textContent = message;
    toastContainer.style.display = "block";

    // Hide the toast after 3 seconds
    setTimeout(() => {
        toastContainer.style.display = "none";
    }, 3000);
}
