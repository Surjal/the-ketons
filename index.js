// --- Global State ---
let cart = JSON.parse(localStorage.getItem('the_ketons_cart')) || [];

// --- Page Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initCart();
    initMobileMenu();
    initContactForm();
});

// --- UI Enhancements ---
function initUI() {
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('bg-black/95', 'py-4');
            nav.classList.remove('py-6', 'bg-black/82');
        } else {
            nav.classList.remove('bg-black/95', 'py-4');
            nav.classList.add('py-6', 'bg-black/82');
        }
    });

    // Add Cart Badge to all pages
    const cartBtn = document.querySelector('button[onclick*="cart"]') || document.querySelector('.nav-list ul');
    if (cartBtn) {
        const badge = document.createElement('span');
        badge.id = 'cart-count';
        badge.className = 'ml-2 bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full hidden';
        // If it's a button, append to it, else create a new nav item
        if (cartBtn.tagName === 'BUTTON') {
            cartBtn.appendChild(badge);
        } else {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" class="relative" onclick="event.preventDefault(); toggleCart();">Cart <span id="cart-count" class="absolute -top-2 -right-4 bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full hidden">0</span></a>`;
            cartBtn.appendChild(li);
        }
    }
    updateCartBadge();
}

// --- Mobile Menu Logic ---
function initMobileMenu() {
    const nav = document.querySelector('nav');
    const navList = document.querySelector('.nav-list');
    
    // Create Burger Toggle if it doesn't exist
    if (!document.getElementById('mobile-toggle')) {
        const toggle = document.createElement('div');
        toggle.id = 'mobile-toggle';
        toggle.className = 'lg:hidden cursor-pointer p-2 z-[1002]';
        toggle.innerHTML = `
            <div class="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
            <div class="w-6 h-0.5 bg-white mb-1.5 transition-all duration-300"></div>
            <div class="w-6 h-0.5 bg-white transition-all duration-300"></div>
        `;
        nav.appendChild(toggle);

        toggle.addEventListener('click', () => {
            navList.classList.toggle('hidden');
            navList.classList.toggle('flex');
            navList.classList.toggle('fixed');
            navList.classList.toggle('top-0');
            navList.classList.toggle('left-0');
            navList.classList.toggle('w-full');
            navList.classList.toggle('h-screen');
            navList.classList.toggle('bg-black');
            navList.classList.toggle('flex-col');
            navList.classList.toggle('justify-center');
            navList.classList.toggle('items-center');
            navList.classList.toggle('z-[1001]');
            
            // Animation for burger lines
            const lines = toggle.children;
            lines[0].classList.toggle('rotate-45');
            lines[0].classList.toggle('translate-y-2');
            lines[1].classList.toggle('opacity-0');
            lines[2].classList.toggle('-rotate-45');
            lines[2].classList.toggle('-translate-y-2');
        });
    }
}

// --- Shopping Cart Logic ---
function initCart() {
    // Attach listeners to "Add to Cart" buttons
    const addBtns = document.querySelectorAll('.add-to-cart');
    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                id: Date.now(), // Real apps use DB IDs
                name: card.querySelector('h3').textContent,
                price: parseInt(card.querySelector('.price').textContent.replace('Rs ', '').replace(',', '')),
                image: card.querySelector('img') ? card.querySelector('img').src : null
            };
            addToCart(product);
            showToast(`Added ${product.name} to cart!`);
        });
    });
}

function addToCart(product) {
    cart.push(product);
    saveCart();
    updateCartBadge();
}

function saveCart() {
    localStorage.setItem('the_ketons_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(badge => {
        if (cart.length > 0) {
            badge.textContent = cart.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

function toggleCart() {
    // Create Cart Overlay if it's the first time
    let overlay = document.getElementById('cart-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'cart-overlay';
        overlay.className = 'fixed inset-0 bg-black/80 z-[2000] flex justify-end transition-opacity duration-300';
        overlay.innerHTML = `
            <div class="w-full max-w-md bg-dark border-l border-glass-border h-full p-8 flex flex-col shadow-premium">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold">Your <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Cart</span></h2>
                    <button onclick="toggleCart()" class="text-2xl hover:text-primary transition-colors">&times;</button>
                </div>
                <div id="cart-items" class="flex-1 overflow-y-auto space-y-4 mb-8">
                    <!-- Items go here -->
                </div>
                <div class="border-t border-glass-border pt-6">
                    <div class="flex justify-between text-xl font-bold mb-6">
                        <span>Total:</span>
                        <span id="cart-total">Rs 0</span>
                    </div>
                    <button class="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all duration-300">Checkout</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) toggleCart();
        });
    }

    overlay.classList.toggle('hidden');
    if (!overlay.classList.contains('hidden')) renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="opacity-50 text-center py-20">Your cart is empty.</p>';
        totalEl.textContent = 'Rs 0';
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div class="flex items-center gap-4 bg-glass p-4 rounded-xl border border-glass-border">
                <div class="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                    ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center italic text-[8px]">No Image</div>'}
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-sm">${item.name}</h4>
                    <p class="text-primary font-bold text-xs uppercase tracking-wide">Rs ${item.price.toLocaleString()}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-xs text-secondary hover:underline">Remove</button>
            </div>
        `;
    }).join('');

    totalEl.textContent = `Rs ${total.toLocaleString()}`;
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartBadge();
    renderCart();
};

window.toggleCart = toggleCart;

// --- Contact Form Handling ---
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('border-secondary');
                isValid = false;
            } else {
                input.classList.remove('border-secondary');
            }
        });

        if (isValid) {
            const btn = form.querySelector('button');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                showToast("Message sent successfully! We'll get back to you soon.", "success");
                form.reset();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        } else {
            showToast("Please fill in all fields.", "error");
        }
    });
}

// --- Utils ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-8 right-8 z-[3000] px-6 py-4 rounded-xl shadow-premium border-l-4 transition-all duration-500 translate-y-20 ${
        type === 'success' ? 'bg-green-600/90 border-green-400' : 
        type === 'error' ? 'bg-secondary/90 border-red-400' : 
        'bg-primary/90 border-blue-400'
    } text-white font-medium glass-blur`;
    
    toast.textContent = message;
    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.classList.remove('translate-y-20');
        toast.classList.add('translate-y-0');
    }, 100);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}
