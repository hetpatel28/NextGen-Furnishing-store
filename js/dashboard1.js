// Global chart references to update them later
let salesChart, stockChart, ordersChart, categoryChart, revenueChart;
let currentTheme = 'light';
let orderData = [];
let productData = [];

document.addEventListener("DOMContentLoaded", () => {
    // Initialize navigation
    initNavigation();
    
    // Set up theme switcher
    setupThemeSwitcher();
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up search functionality
    setupSearch();
    
    // Initialize real-time notifications demo
    initNotifications();
});

// Navigation setup
function initNavigation() {
    // Make dashboard the default active section
    document.querySelector('#dashboard').classList.add('active');
    
    // Add click event listeners to nav links
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', function(e) {
            if(this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all sections and links
                document.querySelectorAll('section').forEach(section => section.classList.remove('active'));
                document.querySelectorAll('.sidebar a').forEach(navLink => navLink.classList.remove('active'));
                
                // Add active class to clicked link and corresponding section
                this.classList.add('active');
                const targetId = this.getAttribute('href').substring(1);
                document.getElementById(targetId).classList.add('active');
            }
        });
    });
}

// Theme switcher setup
function setupThemeSwitcher() {
    // Create theme switcher element
    const themeSwitcher = document.createElement('div');
    themeSwitcher.className = 'theme-switcher';
    
    const themeSelect = document.createElement('select');
    themeSelect.innerHTML = `
        <option value="light">Light Theme</option>
        <option value="dark">Dark Theme</option>
        <option value="blue">Blue Theme</option>
    `;
    
    themeSelect.addEventListener('change', function() {
        changeTheme(this.value);
    });
    
    themeSwitcher.appendChild(themeSelect);
    document.body.appendChild(themeSwitcher);
}

// Theme changer function
function changeTheme(theme) {
    const root = document.documentElement;
    currentTheme = theme;
    
    // Remove any existing theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-blue');
    
    // Add the new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Update CSS variables based on theme
    switch(theme) {
        case 'dark':
            root.style.setProperty('--primary-color', '#6c5ce7');
            root.style.setProperty('--secondary-color', '#2d3436');
            root.style.setProperty('--light-color', '#dfe6e9');
            root.style.setProperty('--dark-color', '#636e72');
            document.body.style.backgroundColor = '#1e272e';
            document.body.style.color = '#dfe6e9';
            updateChartThemes('#dfe6e9', '#636e72');
            break;
        case 'blue':
            root.style.setProperty('--primary-color', '#0984e3');
            root.style.setProperty('--secondary-color', '#0a3d62');
            root.style.setProperty('--light-color', '#dff9fb');
            root.style.setProperty('--dark-color', '#079992');
            document.body.style.backgroundColor = '#c7ecee';
            document.body.style.color = '#0a3d62';
            updateChartThemes('#0a3d62', '#079992');
            break;
        default: // light
            root.style.setProperty('--primary-color', '#3498db');
            root.style.setProperty('--secondary-color', '#2c3e50');
            root.style.setProperty('--light-color', '#ecf0f1');
            root.style.setProperty('--dark-color', '#34495e');
            document.body.style.backgroundColor = '#f5f7fa';
            document.body.style.color = '#333';
            updateChartThemes('#333', '#95a5a6');
            break;
    }
}

// Update chart themes
function updateChartThemes(textColor, gridColor) {
    // Only update if charts exist
    if(salesChart) {
        updateChartColors(salesChart, textColor, gridColor);
        updateChartColors(stockChart, textColor, gridColor);
        updateChartColors(ordersChart, textColor, gridColor);
        updateChartColors(categoryChart, textColor, gridColor);
        updateChartColors(revenueChart, textColor, gridColor);
    }
}

function updateChartColors(chart, textColor, gridColor) {
    chart.options.plugins.legend.labels.color = textColor;
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.grid.color = gridColor;
    chart.update();
}

// Main data loading function
function loadDashboardData() {
    // Show loading spinners or placeholders
    displayLoadingState();
    
    // Load product data
    fetch("../json/Chair.json")
        .then(response => response.json())
        .then(products => {
            productData = products;
            updateProductMetrics(products);
            createProductCharts(products);
            hideLoadingState();
        })
        .catch(error => {
            console.error("Error loading product data:", error);
            displayErrorState("product-charts");
        });
    
    // Load order data
    fetch("../order.json")
        .then(response => response.json())
        .then(orders => {
            orderData = orders;
            updateOrderMetrics(orders);
            createOrdersTable(orders);
            createOrderCharts(orders);
        })
        .catch(error => {
            console.error("Error loading order data:", error);
            displayErrorState("order-charts");
        });
}

// Utility functions for loading states
function displayLoadingState() {
    document.querySelectorAll('.chart-container').forEach(container => {
        container.innerHTML = '<div class="loading-spinner"></div>';
    });
}

function hideLoadingState() {
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.remove();
    });
}

function displayErrorState(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="error-message">Failed to load data. Please try again later.</div>';
    }
}

// Update product metrics
function updateProductMetrics(products) {
    let totalProducts = products.length;
    let outOfStock = products.filter(p => p.stock === 0).length;
    
    document.getElementById("total-products").innerText = totalProducts;
    document.getElementById("out-of-stock").innerText = outOfStock;
}

// Update order metrics
function updateOrderMetrics(orders) {
    let totalOrders = orders.length;
    let pendingOrders = orders.filter(o => o.status === "Pending").length;
    
    document.getElementById("total-orders").innerText = totalOrders;
}

// Create product-related charts
function createProductCharts(products) {
    // Prepare data
    let salesData = products.map(p => ({ name: p.name, sales: p.sales || 0 }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5); // Top 5 selling products
    
    let stockData = {
        inStock: products.filter(p => p.stock > 0).length,
        outOfStock: products.filter(p => p.stock === 0).length
    };
    
    // Group products by category
    let categories = {};
    products.forEach(p => {
        const category = p.category || 'Uncategorized';
        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category]++;
    });
    
    // Sales Chart - Bar Chart
    createSalesChart(salesData);
    
    // Stock Overview - Pie Chart
    createStockChart(stockData);
    
    // Category Distribution - Doughnut Chart
    createCategoryChart(categories);
}

function createSalesChart(salesData) {
    const ctx = document.getElementById("salesChart").getContext("2d");
    
    // Destroy existing chart if it exists
    if (salesChart) salesChart.destroy();
    
    salesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: salesData.map(p => p.name),
            datasets: [{
                label: "Top Selling Products",
                data: salesData.map(p => p.sales),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)', 
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(52, 73, 94, 0.7)',
                    'rgba(22, 160, 133, 0.7)'
                ],
                borderColor: [
                    'rgb(52, 152, 219)',
                    'rgb(46, 204, 113)',
                    'rgb(155, 89, 182)',
                    'rgb(52, 73, 94)',
                    'rgb(22, 160, 133)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 5 Selling Products',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Units Sold'
                    }
                }
            }
        }
    });
}

function createStockChart(stockData) {
    const ctx = document.getElementById("stockChart").getContext("2d");
    
    // Destroy existing chart if it exists
    if (stockChart) stockChart.destroy();
    
    stockChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["In Stock", "Out of Stock"],
            datasets: [{
                data: [stockData.inStock, stockData.outOfStock],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(231, 76, 60, 0.7)'
                ],
                borderColor: [
                    'rgb(46, 204, 113)',
                    'rgb(231, 76, 60)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Stock Status Overview',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function createCategoryChart(categories) {
    // Create the chart container if it doesn't exist
    if (!document.getElementById("categoryChart")) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `<h3>Category Distribution</h3><canvas id="categoryChart"></canvas>`;
        document.querySelector('.charts-container').appendChild(chartContainer);
    }
    
    const ctx = document.getElementById("categoryChart").getContext("2d");
    
    // Destroy existing chart if it exists
    if (categoryChart) categoryChart.destroy();
    
    // Prepare the data
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    // Create color arrays
    const backgroundColors = [
        'rgba(52, 152, 219, 0.7)',
        'rgba(46, 204, 113, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(52, 73, 94, 0.7)',
        'rgba(22, 160, 133, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(230, 126, 34, 0.7)'
    ];
    
    const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));
    
    categoryChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: borderColors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Products by Category',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Create order-related charts and tables
function createOrderCharts(orders) {
    // Prepare data
    const statusCounts = {
        Pending: orders.filter(o => o.status === "Pending").length,
        Approved: orders.filter(o => o.status === "Approved").length,
        Shipped: orders.filter(o => o.status === "Shipped").length,
        Delivered: orders.filter(o => o.status === "Delivered").length,
        Cancelled: orders.filter(o => o.status === "Cancelled").length
    };
    
    // Create revenue data (mock data for demo)
    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [12500, 15000, 10800, 16200, 19000, 22000]
    };
    
    // Orders Status Chart - Doughnut
    createOrdersStatusChart(statusCounts);
    
    // Revenue Trend Chart - Line
    createRevenueChart(revenueData);
}

function createOrdersStatusChart(statusCounts) {
    const ctx = document.getElementById("ordersChart").getContext("2d");
    
    // Destroy existing chart if it exists
    if (ordersChart) ordersChart.destroy();
    
    ordersChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(241, 196, 15, 0.7)', // Pending
                    'rgba(46, 204, 113, 0.7)', // Approved
                    'rgba(52, 152, 219, 0.7)', // Shipped
                    'rgba(22, 160, 133, 0.7)', // Delivered
                    'rgba(231, 76, 60, 0.7)'  // Cancelled
                ],
                borderColor: [
                    'rgb(241, 196, 15)',
                    'rgb(46, 204, 113)',
                    'rgb(52, 152, 219)',
                    'rgb(22, 160, 133)',
                    'rgb(231, 76, 60)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Order Status Distribution',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function createRevenueChart(revenueData) {
    // Create the chart container if it doesn't exist
    if (!document.getElementById("revenueChart")) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `<h3>Revenue Trend</h3><canvas id="revenueChart"></canvas>`;
        document.querySelector('.charts-container').appendChild(chartContainer);
    }
    
    const ctx = document.getElementById("revenueChart").getContext("2d");
    
    // Destroy existing chart if it exists
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: revenueData.labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: revenueData.values,
                backgroundColor: 'rgba(26, 188, 156, 0.2)',
                borderColor: 'rgba(26, 188, 156, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: 'rgba(26, 188, 156, 1)',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Revenue Trend (Last 6 Months)',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue ($)'
                    }
                }
            }
        }
    });
}

// Create orders table with advanced features
function createOrdersTable(orders) {
    let tableBody = document.getElementById("orders-table");
    tableBody.innerHTML = ''; // Clear existing content
    
    orders.forEach(order => {
        const statusClass = getStatusClass(order.status);
        let cartItemsHtml = '';
        
        // Format cart items better if they exist
        if (order.cart && Array.isArray(order.cart)) {
            cartItemsHtml = order.cart.map(item => {
                return `<div>${item.name} x ${item.quantity}</div>`;
            }).join('');
        } else {
            cartItemsHtml = order.cart || 'No items';
        }
        
        // Create the table row
        let row = `<tr data-order-id="${order.id || ''}">
            <td>${order.user || 'Unknown'}</td>
            <td>${order.email || 'No email'}</td>
            <td>${cartItemsHtml}</td>
            <td><span class="status ${statusClass}">${order.status}</span></td>
            <td class="actions">
                ${order.status === 'Pending' ? 
                `<button class="approve" onclick="approveOrder(this, '${order.id || ''}')">Approve</button>
                <button class="reject" onclick="rejectOrder(this, '${order.id || ''}')">Reject</button>` 
                : ''}
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function getStatusClass(status) {
    switch(status) {
        case 'Pending': return 'status-pending';
        case 'Approved': return 'status-approved';
        case 'Shipped': return 'status-shipped';
        case 'Delivered': return 'status-delivered';
        case 'Cancelled': return 'status-cancelled';
        default: return '';
    }
}

// Set up search functionality
function setupSearch() {
    // Create search container if it doesn't exist
    if (!document.getElementById('order-search')) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="order-search" placeholder="Search orders by user or email...">
            <select id="status-filter">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        `;
        
        // Insert before the orders table
        const orderSection = document.getElementById('order-approval');
        orderSection.insertBefore(searchContainer, orderSection.querySelector('table').parentNode);
        
        // Add event listeners
        document.getElementById('order-search').addEventListener('input', filterOrders);
        document.getElementById('status-filter').addEventListener('change', filterOrders);
    }
}

function filterOrders() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    
    // Filter the orders
    const filteredOrders = orderData.filter(order => {
        const matchesSearch = (
            (order.user && order.user.toLowerCase().includes(searchTerm)) ||
            (order.email && order.email.toLowerCase().includes(searchTerm))
        );
        
        const matchesStatus = !statusFilter || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    // Update the table with filtered orders
    createOrdersTable(filteredOrders);
}

// Stock checking functionality (enhanced)
async function checkProductStock() {
    let productId = document.getElementById("product-id").value;
    let result = document.getElementById("stock-result");
    result.classList.add('show');
    
    if (!productId) {
        result.innerHTML = `<div class="alert alert-warning">Please enter a Product ID.</div>`;
        return;
    }
    
    try {
        // If we already have the product data loaded, use it instead of fetching again
        if (productData.length > 0) {
            let product = productData.find(p => p.id === productId);
            
            if (product) {
                const stockStatus = product.stock > 0 ? 
                    `<span class="stock-available">${product.stock} in stock</span>` : 
                    `<span class="stock-unavailable">Out of stock</span>`;
                
                result.innerHTML = `
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>ID: ${product.id}</p>
                        <p>Stock: ${stockStatus}</p>
                        ${product.price ? `<p>Price: $${product.price}</p>` : ''}
                    </div>
                `;
            } else {
                result.innerHTML = `<div class="alert alert-warning">Product not found.</div>`;
            }
        } else {
            // If we don't have the data, fetch it
            let response = await fetch("../json/Chair.json");
            let products = await response.json();
            
            let product = products.find(p => p.id === productId);
            
            if (product) {
                result.innerText = `Product: ${product.name} | Stock: ${product.stock}`;
            } else {
                result.innerText = "Product not found.";
            }
        }
    } catch (error) {
        result.innerHTML = `<div class="alert alert-danger">Error loading product data.</div>`;
        console.error(error);
    }
}

// Initialize notifications demo
function initNotifications() {
    // Create notification container
    const notifContainer = document.createElement('div');
    notifContainer.className = 'notification-container';
    document.body.appendChild(notifContainer);
    
    // Demo notifications
    setTimeout(() => {
        showNotification('New order received!', 'success');
    }, 5000);
    
    setTimeout(() => {
        showNotification('Warning: 3 products are low in stock', 'warning');
    }, 12000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-close">&times;</span>
        <p>${message}</p>
    `;
    
    // Add to container
    document.querySelector('.notification-container').appendChild(notification);
    
    // Add close event
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('notification-hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Order approval functions
function approveOrder(button, orderId) {
    const row = button.closest('tr');
    const statusCell = row.querySelector('.status');
    
    // Update UI
    statusCell.className = 'status status-approved';
    statusCell.textContent = 'Approved';
    row.querySelector('.actions').innerHTML = '';
    
    // Update backend
    updateOrderStatus(orderId, 'Approved');
    
    // Show success notification
    showNotification('Order approved successfully', 'success');
    
    // Update charts
    updateChartsAfterOrderAction();
}

function rejectOrder(button, orderId) {
    const row = button.closest('tr');
    const statusCell = row.querySelector('.status');
    
    // Update UI
    statusCell.className = 'status status-cancelled';
    statusCell.textContent = 'Cancelled';
    row.querySelector('.actions').innerHTML = '';
    
    // Update backend
    updateOrderStatus(orderId, 'Cancelled');
    
    // Show notification
    showNotification('Order rejected', 'warning');
    
    // Update charts
    updateChartsAfterOrderAction();
}

function updateOrderStatus(orderId, status) {
    // Update local data
    const orderIndex = orderData.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
        orderData[orderIndex].status = status;
    }
    
    // Send update to server (mocked for demo)
    console.log(`Order ${orderId} status updated to ${status}`);
    
    // In a real app, you would make an API call:
    /*
    fetch("http://localhost:5000/updateOrderStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Error updating order status:", error));
    */
}

function updateChartsAfterOrderAction() {
    // Recalculate status counts
    const statusCounts = {
        Pending: orderData.filter(o => o.status === "Pending").length,
        Approved: orderData.filter(o => o.status === "Approved").length,
        Shipped: orderData.filter(o => o.status === "Shipped").length,
        Delivered: orderData.filter(o => o.status === "Delivered").length,
        Cancelled: orderData.filter(o => o.status === "Cancelled").length
    };
    
    // Update orders chart with new data
    if (ordersChart) {
        ordersChart.data.datasets[0].data = Object.values(statusCounts);
        ordersChart.update();
    }
}
