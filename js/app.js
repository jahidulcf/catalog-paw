const SCRIPT_ID = 'AKfycbxpJDALhG_aP5jmuT993ahSEktaVy4m4_PdHvZMqCKE8rBqXXFh88Jo5G__pq65QeaB';
const URL = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

const products = JSON.parse(localStorage.getItem('products')) || [];

const fetchProductsBtn = document.getElementById('fetchProductsBtn');
const fetchIcon = document.getElementById('fetchIcon');
const dateInput = document.getElementById('delivery-date');
const textarea = document.getElementById('product-input');
const copyBtn = document.getElementById('copy');
const resizeBtn = document.getElementById('resize-button');
const suggestions = document.getElementById('suggestions');
const supplierFilter = document.getElementById('supplierFilter');
const itemList = document.getElementById('itemList');

const suppliers = [...new Set(products.map(p => p.supplier))];

fetchProductsBtn.addEventListener('click', async () => {
    try {
        fetchIcon.classList.add('fa-spin', 'fa-spinner');
        const response = await fetch(URL);
        const data = await response.json();
        const formattedProducts = data.map(product => ({
            name: product.name,
            supplier: product.supplier,
            unit: product.unit,
            quantity: product.quantity,
        }));
        localStorage.setItem('products', JSON.stringify(formattedProducts));
        setTimeout(() => {
            fetchIcon.classList.remove('fa-spin', 'fa-spinner');
        }, 2000);
        window.location.reload();
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('fetchIcon').classList.remove('fa-spin', 'fa-spinner');
        setTimeout(() => {
            document.getElementById('fetchIcon').classList.remove('error');
        }, 2000);
    }
});

flatpickr(dateInput, {
    altFormat: "j M, l",
    altInput: true,
    minDate: "today",
    disableMobile: true,
    maxDate: new Date().fp_incr(90), // 90 days from now
    defaultDate: new Date().fp_incr(1) // tomorrow
});

suppliers.forEach(supplier => {
    const option = document.createElement('option');
    option.value = supplier;
    option.textContent = supplier;
    supplierFilter.appendChild(option);
});

function showSuggestions(input) {
    const searchTerm = input.toLowerCase();
    const matchingProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    suggestions.innerHTML = '';
    if (matchingProducts.length > 0) {
        matchingProducts.forEach(product => {
            const div = document.createElement('div');
            div.className = 'p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100';
            div.innerHTML = `<div class="font-medium text-sm">${product.name}</div><div class="text-xs text-gray-500">${product.quantity} ${product.unit} - ${product.supplier}</div>`;
            div.onclick = () => {
                const cursorPosition = textarea.selectionStart;
                const textBeforeCursor = textarea.value.substring(0, cursorPosition);
                const textAfterCursor = textarea.value.substring(cursorPosition);
                const lastNewLine = textBeforeCursor.lastIndexOf('\n');
                textarea.value = textBeforeCursor.substring(0, lastNewLine + 1) + `${product.name} ${product.quantity} ${product.unit}\n` + textAfterCursor;
                hideSuggestions();
                textarea.focus();
            };
            suggestions.appendChild(div);
        });
        suggestions.classList.remove('hidden');
        supplierFilter.parentElement.classList.add('hidden');
        itemList.classList.add('hidden');
    } else {
        hideSuggestions();
    }
}

function hideSuggestions() {
    suggestions.classList.add('hidden');
    supplierFilter.parentElement.classList.remove('hidden');
    itemList.classList.remove('hidden');
}

function renderItems() {
    const selectedSupplier = supplierFilter.value;
    const filteredProducts = selectedSupplier ? products.filter(p => p.supplier === selectedSupplier) : products;
    itemList.innerHTML = '';
    filteredProducts.forEach(product => {
        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-custom transition-colors';
        div.innerHTML = `<div class="flex justify-between items-center"><div><div class="font-medium text-sm">${product.name}</div><div class="text-xs text-gray-500 mt-1">${product.supplier}</div></div><div class="flex items-center space-x-3"><button class="decrease-btn text-custom hover:bg-custom/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors" onclick="event.stopPropagation()"><i class="fas fa-minus text-xs"></i></button><div class="text-sm font-medium">${product.quantity} ${product.unit}</div><button class="increase-btn text-custom hover:bg-custom/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors" onclick="event.stopPropagation()"><i class="fas fa-plus text-xs"></i></button></div></div>`;
        div.onclick = () => {
            textarea.value += `${product.name} ${product.quantity} ${product.unit}\n`;
            textarea.focus();
        };
        const decreaseBtn = div.querySelector('.decrease-btn');
        const increaseBtn = div.querySelector('.increase-btn');
        decreaseBtn.addEventListener('click', () => {
            if (product.quantity > 0) {
                product.quantity--;
                renderItems();
            }
        });
        increaseBtn.addEventListener('click', () => {
            product.quantity++;
            renderItems();
        });
        itemList.appendChild(div);
    });
}

textarea.addEventListener('input', (e) => {
    const cursorPosition = e.target.selectionStart;
    const text = e.target.value;
    const lastNewLine = text.lastIndexOf('\n', cursorPosition - 1);
    const currentLine = text.substring(lastNewLine + 1, cursorPosition);
    if (currentLine.trim().length > 0) {
        supplierFilter.parentElement.className.add = 'hidden';
        itemList.classList.add('hidden');
        showSuggestions(currentLine);
    } else {
        hideSuggestions();
    }
});

/*
textarea.addEventListener('focus', () => {
    //textarea.classList.add('sticky');
});

*/
textarea.addEventListener('blur', () => {
    setTimeout(() => {
        hideSuggestions();
        //textarea.classList.remove('sticky');
    }, 200);
});

copyBtn.addEventListener('click', () => {
    const formattedDate = flatpickr.formatDate(new Date(dateInput.value), "j M, l");
    const boldDate = `*${formattedDate}*`;
    const message = "I have an order to be delivered on " + boldDate + "\n" + textarea.value + "\n\nThank you!";
    navigator.clipboard.writeText(message).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});

let isResized = false;
const defaultHeight = textarea.style.height;

resizeBtn.addEventListener('click', () => {
    if (isResized) {
        textarea.style.height = defaultHeight;
        resizeBtn.innerHTML = '⇲';
    } else {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        resizeBtn.innerHTML = '⇱';
    }
    isResized = !isResized;
});

supplierFilter.addEventListener('change', renderItems);
renderItems();