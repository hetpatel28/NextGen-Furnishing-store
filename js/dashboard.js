Chart.defaults.color = "#EFEDE7";
Chart.defaults.font.family = "Arial, sans-serif";
document.addEventListener("DOMContentLoaded", () => {
    fetch("../json/product.json")
        .then(response => response.json())
        .then(products => {
            let totalProducts = products.length;
            let outOfStock = products.filter(p => p.stock === 0).length;
            let salesData = products.map(p => ({ name: p.name, sales: p.sales || 0 }));
            
            document.getElementById("total-products").innerText = totalProducts;
            document.getElementById("out-of-stock").innerText = outOfStock;
            
            // Highest Sales Data Bar Chart
            const salesChartCtx = document.getElementById("salesChart").getContext("2d");
            new Chart(salesChartCtx, {
                type: "bar",
                data: {
                    labels: salesData.map(p => p.name),
                    datasets: [{
                        label: "Product performance (Sales)",
                        data: salesData.map(p => p.sales),
                        backgroundColor: ["red", "blue", "green", "purple", "orange"],
                        borderColor: ["black", "black", "black", "black", "black"],
                        borderWidth: 1,
                        hoverBackgroundColor: ["darkred", "darkblue", "darkgreen", "darkpurple", "darkorange"]
                    }]
                }
            });

            // Stock Overview Pie Chart
            const stockChartCtx = document.getElementById("stockChart").getContext("2d");
            new Chart(stockChartCtx, {
                type: "pie",
                data: {
                    labels: ["Available Stock", "Out of Stock"],
                    datasets: [{
                        data: [totalProducts - outOfStock, outOfStock],
                        backgroundColor: ["green", "red"],
                        borderColor: ["black", "black"]
                    }]
                }
            });
        });

    fetch("../order.json")
        .then(response => response.json())
        .then(orders => {
            let totalOrders = orders.length;
            let pendingOrders = orders.filter(o => o.status === "Pending").length;

            document.getElementById("total-orders").innerText = totalOrders;

            // Total Orders Doughnut Chart
            const ordersChartCtx = document.getElementById("ordersChart").getContext("2d");
            new Chart(ordersChartCtx, {
                type: "doughnut",
                data: {
                    labels: ["Approved Orders", "Pending Orders"],
                    datasets: [{
                        data: [totalOrders - pendingOrders, pendingOrders],
                        backgroundColor: ["blue", "yellow"],
                        borderColor: ["black", "black"]
                    }]
                }
            });

            let tableBody = document.getElementById("orders-table");
            orders.forEach((order, index) => {
                let row = `<tr>
                    <td>${order.user}</td>
                    <td>${order.email}</td>
                    <td>${order.cart.map(item => `${item.name} x ${item.quantity}`).join(", ")}</td>
                    <td class="status">${order.status}</td>
                    <td><button onclick="approveOrder(this, ${index})">Approve</button></td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        });
});

function approveOrder(button, index) {
    // Update status visually
    button.parentElement.previousElementSibling.innerText = "Approved";

    // Send request to Node.js backend
    fetch("http://localhost:5000/approveOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data.message);
        alert("Order approved!");
    })
    .catch(error => console.error("Approval error:", error));
}


async function checkProductStock() {
    let productId = document.getElementById("product-id").value;
    let result = document.getElementById("stock-result");

    if (!productId) {
        result.innerText = "Please enter a Product ID.";
        return;
    }

    try {
        let response = await fetch("../json/product.json");
        let products = await response.json();

        let product = products.find(p => p.id === productId);

        if (product) {
            result.innerHTML = `
                <div style="
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    align-items: center;
                    gap: 20px;
                    font-size: 24px;
                    font-family: Arial, sans-serif;
                ">
                    <img src="${product.image}" alt="${product.name}" style="width: 400px; height: 400px; object-fit: cover;">
                    <div>
                    <p><strong>Product:</strong> ${product.name}</p>
                    <p><strong>Stock:</strong> ${product.stock}</p>
                    <button onclick="modifyStock('${product.id}', 'add')">Add Stock</button>
                    <button onclick="modifyStock('${product.id}', 'remove')">Remove Stock</button>
                    </div>
                </div>
                `;
            } else {
            result.innerText = "Product not found.";
        }
    } catch (error) {
        result.innerText = "Error loading product data.";
        console.error(error);
    }
}
function modifyStock(productId, action) {
    let quantity = prompt(`Enter quantity to ${action}:`);
    if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid number.");
        return;
    }

    fetch("http://localhost:5000/modifyStock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action, quantity: parseInt(quantity) })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        checkProductStock(); // Refresh stock info
    })
    .catch(err => console.error("Stock update error:", err));
}

