const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_FILE = "users.json";   // User registration & login
const ADMINS_FILE = "admin.json";  // Admin credentials (manually stored)
const ORDERS_FILE = "order.json";
const PRODUCT_FILE = "json/product.json"; 


// ===============================
// User Authentication (Register & Login)
// ===============================

// Register User
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    let users = [];
    if (fs.existsSync(USERS_FILE)) {
        users = JSON.parse(fs.readFileSync(USERS_FILE));
    }

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: "Email already exists!" });
    }

    users.push({ username, email, password });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    res.json({ message: "User registered successfully!" });
});

// Login User
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required!" });
    }

    if (!fs.existsSync(USERS_FILE)) {
        return res.status(400).json({ message: "No users found!" });
    }

    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials!" });
    }

    res.json({ message: "Login successful!", username: user.username });
});

// ===============================
// Admin Authentication (Manual JSON Credentials)
// ===============================

// Admin Login (Credentials stored manually in `admin.json`)
app.post("/admin-login", (req, res) => {
    const { username, password } = req.body;

    if (!fs.existsSync(ADMINS_FILE)) {
        return res.status(400).json({ message: "No admin data found!" });
    }

    const admins = JSON.parse(fs.readFileSync(ADMINS_FILE));
    const admin = admins.find(admin => admin.username === username && admin.password === password);

    if (!admin) {
        return res.status(401).json({ message: "Invalid credentials!" });
    }

    res.json({ message: "Admin login successful!", username: admin.username });
});

// ===============================
// order handling 
// ===============================

// Place Order
app.post("/placeOrder", (req, res) => {
    let orders = fs.existsSync(ORDERS_FILE) ? JSON.parse(fs.readFileSync(ORDERS_FILE)) : [];

    const {
        user,
        email,
        address,
        cart,
        total,
        status,
        paymentMethod,
        cardNumber,
        upiId
    } = req.body;

    const newOrder = {
        user,
        email,
        address,
        cart,
        total,
        status,
        payment: {
            method: paymentMethod,
            cardNumber: paymentMethod === "card" ? cardNumber : null,
            upiId: paymentMethod === "upi" ? upiId : null
        }
    };

    orders.push(newOrder);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

    res.json({ message: "Order placed with payment details!" });
});


app.post("/approveOrder", (req, res) => {
    const index = req.body.index;

    let orders = fs.existsSync(ORDERS_FILE)
        ? JSON.parse(fs.readFileSync(ORDERS_FILE))
        : [];

    if (orders[index]) {
        orders[index].status = "Approved";
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        res.json({ message: "Order approved and saved!" });
    } else {
        res.status(404).json({ error: "Order not found" });
    }
});



// ===============================
// Product Stock Management 
// ===============================


app.post("/modifyStock", (req, res) => {
    const { productId, action, quantity } = req.body;

    if (!fs.existsSync(PRODUCT_FILE)) {
        return res.status(404).json({ message: "Product file not found" });
    }

    let products = JSON.parse(fs.readFileSync(PRODUCT_FILE));
    let product = products.find(p => p.id === productId);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    if (action === "add") {
        product.stock += quantity;
    } else if (action === "remove") {
        if (product.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock to remove" });
        }
        product.stock -= quantity;
    } else {
        return res.status(400).json({ message: "Invalid action" });
    }

    fs.writeFileSync(PRODUCT_FILE, JSON.stringify(products, null, 2));
    res.json({ message: `Stock ${action}ed successfully!` });
});





// ===============================
// Start Server
// ===============================
app.listen(5000, () => console.log("Server running on port 5000"));
