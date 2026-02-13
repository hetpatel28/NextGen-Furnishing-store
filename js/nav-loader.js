
// Function to load the navbar
function loadNavbar() {
    fetch('nav.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error loading header: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data;

            // Extract and append <script> tags
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src; // External scripts
                } else {
                    newScript.textContent = oldScript.textContent; // Inline scripts
                }
                document.body.appendChild(newScript); // Add to document
            });

            // Append the rest of the navbar content
            document.getElementById('navbar').innerHTML = tempDiv.innerHTML;

            // Call updateCartCount after the navbar is loaded
            updateCartCount();
        })
        .catch(error => console.error('Error loading navbar:', error));
}

// Function to calculate and update the cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = totalItems; // Update the cart count span
    } else {
        console.warn('Cart count span not found');
    }
}

// Call the function to load the navbar
loadNavbar();


// footer
fetch('footer.html')
      .then(response => {
        if (!response.ok) {
        throw new Error(`Error loading footer: ${response.status}`);
      }
      return response.text();
      })
      .then(data => {
        document.getElementById('footer').innerHTML = data;
      })
    .catch(error => console.error(error));
