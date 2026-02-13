
function loginAdmin() {
  
  let username = document.getElementById("admin-name").value;
  let password = document.getElementById("admin-password").value;

  fetch("http://localhost:5000/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    // console.log("Response from server:", data); // Debugging response

      if (data.message === "Admin login successful!") {
          sessionStorage.setItem("adminUser", data.username);
          window.location.href = "admin-dashboard.html"; // Redirect to dashboard
          // updateSidebar();
      } else {
          alert("Invalid credentials. Please try again.");
      }
  })
  .catch(error => console.error("Error:", error));
}

function updateSidebar() {
  // console.log("updateSidebar function is running");

  let adminname = sessionStorage.getItem("adminUser");
  let navAdmin = document.getElementById("nav-admin");

  if (navAdmin) {
      if (adminname) {
          // console.log("Admin name found:", adminname); 
          navAdmin.innerHTML = `
              <span style="font-size: 18px; font-weight: bold; color: white;">Admin name: ${adminname}</span>
          `;
      } 
  } 
}

document.addEventListener("DOMContentLoaded", updateSidebar);


function adminlogout() {
  sessionStorage.removeItem("adminUser");
  window.location.href = "admin-login.html"; 
}



