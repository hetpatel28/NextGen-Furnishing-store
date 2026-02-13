document.addEventListener("DOMContentLoaded", function () {
    const cartPage = document.getElementById('cart-page');
    const productPage = document.getElementById('product-page');
    const checkoutPage = document.getElementById('checkout-page');
    const paymentPage = document.getElementById('payment-page');
    const invoicePage = document.getElementById('invoice-page');

    if (
        cartPage &&
        checkoutPage.style.display === "none" &&
        paymentPage.style.display === "none" &&
        invoicePage.style.display === "none"
    ) {
        productPage.style.display = 'none';
        cartPage.style.display = 'block';
        updateCart();
        updateCartCount();
    }
});



// Function to calculate and update the cart count
function updateCartCount() {
    const cart = getCartItems(); // Get items from localStorage
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); // Calculate total quantity
   // console.log("Cart Count Updated:", totalItems); // Debugging
    document.getElementById("cart-count").textContent = cart.length;
    document.getElementById('cart-count').innerText = totalItems; // Update the span
    
}

function addToCart(name, price) {
    let user = sessionStorage.getItem("loggedInUser");
    if (!user) {
        alert("Please log in first to add items to the cart!");
        window.location.href = "login.html";
        return;
    }
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount()
    alert(`${name} added to cart`);
}

function showProductPage() {
window.location.href = '1.html#products';
}

function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cart = getCartItems();
    const checkoutButton = document.getElementById('checkout-button');
    cartItems.innerHTML = '';
    let total = 0;

    fetch("../json/product.json")
        .then(response => response.json())
        .then(products => {
            cart.forEach((item, index) => {
                const idMatch = item.name.match(/\((\d+)\)/);
                const id = idMatch ? idMatch[1] : null;
                const product = products.find(p => p.id === id);
                const image = product ? product.image : "";

                total += item.price * item.quantity;

                cartItems.innerHTML += `
                    <div class="cart-item">
                        <img src="${image}" class="cart-image" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 16px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                        <div style="flex-grow:1;">
                            <span style="font-size:larger">${item.name} - ₹${item.price} x ${item.quantity}</span>
                        </div>
                        <button onclick="changeQuantity(${index}, 1)" class="bt">+</button>
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <button onclick="removeItem(${index})">Remove</button>
                    </div>
                `;
            });


            document.getElementById('total-price').innerText = total;
            checkoutButton.disabled = cart.length === 0;
            updateCartCount();
        })
        .catch(error => console.error("Error loading product images:", error));
}



function changeQuantity(index, change) {
    let cart = getCartItems();
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

function removeItem(index) {
    let cart = getCartItems();
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

document.addEventListener('DOMContentLoaded', updateCartCount);

function checkout() {
    document.getElementById('cart-page').style.display = 'none';
    document.getElementById('checkout-page').style.display = 'block';
}
function payment() {
    document.getElementById('checkout-page').style.display = 'none';
    document.getElementById('payment-page').style.display = 'block';

    // Save data temporarily
    //sessionStorage.setItem("checkoutData", JSON.stringify(orderData));

}

function processPayment(event) {
    event.preventDefault();

    const method = document.querySelector('input[name="method"]:checked')?.value;
    const cardNumber = document.getElementById('card-number')?.value?.trim() || "";
    const upiId = document.querySelector('#upi-details input')?.value?.trim() || "";

    if (!method) {
        alert("Please select a payment method!");
        return;
    }

    if (method === 'card' && !cardNumber) {
        alert("Please enter card details!");
        return;
    }

    if (method === 'upi' && !upiId) {
        alert("Please enter UPI ID!");
        return;
    }

    let orderData = JSON.parse(sessionStorage.getItem("checkoutData"));
    if (!orderData) {
        alert("No checkout data found!");
        return;
    }

    orderData.paymentMethod = method;
    orderData.cardNumber = method === "card" ? cardNumber : "";
    orderData.upiId = method === "upi" ? upiId : "";

    fetch("http://localhost:5000/placeOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
    })
    .then(() => {
    sessionStorage.removeItem("checkoutData");

    // Hide all pages
    document.getElementById('cart-page').style.display = 'none';
    document.getElementById('checkout-page').style.display = 'none';
    document.getElementById('payment-page').style.display = 'none';

    // Clear cart AFTER invoice is shown
    localStorage.removeItem("cart");
    updateCartCount();

    // Show invoice
    showInvoice(orderData);
})

    .catch((error) => {
        console.error("Payment error:", error);
        alert("Something went wrong!");
    });

}




document.addEventListener("DOMContentLoaded", function () {
    const radios = document.querySelectorAll('input[name="method"]');
    radios.forEach(radio => {
        radio.addEventListener("change", function () {
            document.getElementById("card-details").style.display = this.value === "card" ? "block" : "none";
            document.getElementById("upi-details").style.display = this.value === "upi" ? "block" : "none";
        });
    });
});


function showInvoice(orderData) {
    const invoiceDetails = document.getElementById('invoice-details');

    invoiceDetails.innerHTML = `
        <p><strong>Name:</strong> ${orderData.user}</p>
        <p><strong>Address:</strong> ${orderData.address}</p>
        <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
        <ul>`;

    orderData.cart.forEach(item => {
        invoiceDetails.innerHTML += `<li>${item.name} - ₹${item.price} x ${item.quantity}</li>`;
    });

    invoiceDetails.innerHTML += `</ul><h3>Total: ₹${orderData.total}</h3>`;

    document.getElementById('cart-page').style.display = 'none';
    document.getElementById('checkout-page').style.display = 'none';
    document.getElementById('payment-page').style.display = 'none';

    document.getElementById('invoice-page').style.display = 'block';
}




function generateInvoice(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const email = sessionStorage.getItem('loggedInEmail');
    
    if (!name || !address || cart.length === 0) {
        alert("Please fill all details and add items to cart.");
        return;
    }

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
    });

    const orderData = {
        user: name,
        email: email,
        address: address,
        cart: cart,
        total: total,
        status: "Pending"
    };

    // Save to session and go to payment
    sessionStorage.setItem("checkoutData", JSON.stringify(orderData));
    document.getElementById('checkout-page').style.display = 'none';
    document.getElementById('payment-page').style.display = 'block';
}


// Clear cart **ONLY AFTER** printing the invoice
function printAndClearCart() {
    window.print(); // Open print dialog

    // After printing, clear cart & refresh cart UI
    localStorage.removeItem('cart');  
    updateCart(); 
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("payment-form");
    if (form) {
        form.addEventListener("submit", processPayment);
    }

    const radios = document.querySelectorAll('input[name="method"]');
    radios.forEach(radio => {
        radio.addEventListener("change", function () {
            document.getElementById("card-details").style.display = this.value === "card" ? "block" : "none";
            document.getElementById("upi-details").style.display = this.value === "upi" ? "block" : "none";
        });
    });
});

