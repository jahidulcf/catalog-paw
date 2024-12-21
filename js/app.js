// Optimized JavaScript Code
document.addEventListener("DOMContentLoaded", () => {
    const products = JSON.parse(localStorage.getItem("products")) || [];

    const elements = {
        textarea: document.getElementById("product-input"),
        copyBtn: document.getElementById("copy-btn"),
        resizeButton: document.getElementById("resize-button"),
        suggestionsBox: document.getElementById("suggestions"),
        dateInput: document.getElementById("delivery-date"),
        newProductInput: document.getElementById("new-product"),
        addProductButton: document.getElementById("add-product"),
        productList: document.getElementById("product-list"),
        saveButton: document.getElementById("save-button"),
        catalogButton: document.getElementById("catalog-button"),
        backButton: document.getElementById("back-button"),
        mainView: document.getElementById("main-view"),
        catalogView: document.getElementById("catalog-view"),
    };

    const CONSTANTS = {
        defaultHeight: "144px",
        maxHeight: "400px",
        debounceDelay: 300,
    };

    /** Navigation Handlers */
    elements.catalogButton.addEventListener("click", () => {
        toggleView(elements.mainView, elements.catalogView);
        renderProductList();
    });

    elements.backButton.addEventListener("click", () => {
        toggleView(elements.catalogView, elements.mainView);
    });

    function toggleView(hideView, showView) {
        hideView.classList.add("hidden");
        showView.classList.remove("hidden");
    }

    /** Date Picker Initialization */
    flatpickr(elements.dateInput, {
        dateFormat: "Y-m-d",
        defaultDate: getTomorrow(),
        minDate: getTomorrow(),
        maxDate: new Date().setMonth(new Date().getMonth() + 3),
        onChange: (selectedDates) => updateFormattedDate(selectedDates[0]),
        onReady: () => updateFormattedDate(getTomorrow()),
    });

    function getTomorrow() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    }

    function updateFormattedDate(date) {
        elements.dateInput.value = formatDate(date);
    }

    function formatDate(date) {
        return `${date.getDate()} ${date.toLocaleString("default", {
            month: "short",
        })}, ${date.toLocaleString("default", { weekday: "long" })}`;
    }

    /** Product Management */
    elements.addProductButton.addEventListener("click", () => {
        const inputValue = elements.newProductInput.value.trim();
        if (!inputValue) return alert("Please enter a product name and quantity.");

        inputValue
            .split(",")
            .map((product) => product.trim())
            .forEach((product) => {
                if (product && !products.includes(product)) products.push(product);
            });

        elements.newProductInput.value = "";
        renderProductList();
    });

    function renderProductList() {
        elements.productList.innerHTML = products
            .map(
                (product, index) => `
    <li class="flex justify-between items-center mb-2 border p-2 rounded-lg shadow-sm">
        <span>${product}</span>
        <button
        onclick="removeProduct(${index})"
        class="rounded-md border border-transparent p-2.5 text-center text-sm text-slate-600 hover:bg-slate-200 focus:bg-slate-200"
        >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
        </svg>
        </button>
    </li>
    `
            )
            .join("");
    }

    window.removeProduct = (index) => {
        products.splice(index, 1);
        renderProductList();
    };

    elements.saveButton.addEventListener("click", () => {
        localStorage.setItem("products", JSON.stringify(products));
        alert("Products saved!");
    });

    /** Textarea Functionality */
    elements.textarea.addEventListener("input", handleTextareaInput);
    elements.textarea.addEventListener("input", adjustTextareaHeight);
    elements.resizeButton.addEventListener("click", toggleTextareaResize);

    function adjustTextareaHeight() {
        elements.textarea.style.height = CONSTANTS.defaultHeight;
        elements.textarea.style.height = `${Math.min(
            elements.textarea.scrollHeight,
            parseInt(CONSTANTS.maxHeight)
        )}px`;
    }

    function toggleTextareaResize() {
        const currentHeight = parseInt(
            window.getComputedStyle(elements.textarea).height,
            10
        );
        if (currentHeight < parseInt(CONSTANTS.maxHeight)) {
            elements.textarea.style.height = CONSTANTS.maxHeight;
            elements.textarea.style.resize = "vertical";
        } else {
            elements.textarea.style.height = CONSTANTS.defaultHeight;
            elements.textarea.style.resize = "none";
        }
    }

    let debounceTimeout;
    function handleTextareaInput() {
        clearTimeout(debounceTimeout);
        const cursorPosition = elements.textarea.selectionStart;
        const textUpToCursor = elements.textarea.value.slice(0, cursorPosition);
        const lastWord = textUpToCursor.split("\n").pop().trim();

        debounceTimeout = setTimeout(() => {
            const matches = products.filter((product) =>
                product.toLowerCase().includes(lastWord.toLowerCase())
            );
            renderSuggestions(matches, lastWord);
        }, CONSTANTS.debounceDelay);
    }

    function renderSuggestions(matches, lastWord) {
        elements.suggestionsBox.innerHTML = "";
        const addedProducts = elements.textarea.value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);
        const filteredMatches = matches.filter(
            (match) => !addedProducts.includes(match)
        );

        filteredMatches.forEach((match) => {
            const suggestion = document.createElement("div");
            suggestion.classList.add(
                "px-4",
                "py-2",
                "hover:bg-gray-100",
                "cursor-pointer",
                "text-gray-800"
            );
            suggestion.textContent = match;

            suggestion.addEventListener("click", () => {
                const beforeCursor = elements.textarea.value.slice(
                    0,
                    elements.textarea.value.lastIndexOf(lastWord)
                );
                elements.textarea.value = `${beforeCursor}${match}\n`;
                elements.textarea.focus();
                renderSuggestions(products, lastWord);
            });

            elements.suggestionsBox.appendChild(suggestion);
        });
    }

    document.addEventListener("click", (event) => {
        if (
            !elements.textarea.contains(event.target) &&
            !elements.suggestionsBox.contains(event.target)
        ) {
            elements.suggestionsBox.innerHTML = "";
        }
    });

    elements.copyBtn.addEventListener("click", () => {
        const selectedDate = elements.dateInput.value;
        const productsText = elements.textarea.value.trim();

        const copyText = `I have an order to be delivered by *${selectedDate}*\n\n${productsText}\n\nThank you!`;
        navigator.clipboard.writeText(copyText);

        // Change the button text to "Copied"
        const copyTextSpan = elements.copyBtn.querySelector('.copy-text');
        copyTextSpan.textContent = "Copied!";

        // Revert the button text back to "Copy" after 300ms
        setTimeout(() => {
            copyTextSpan.textContent = "Copy";
        }, 3000);
    });
});