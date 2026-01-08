// Load users from storage when the page opens
document.addEventListener("DOMContentLoaded", displayUsers);

function registerUser() {
    // 1. Get values from input fields
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const mobile = document.getElementById("mobile").value;
    const password = document.getElementById("password").value;

    // 2. VALIDATIONS
    if (name === "" || email === "" || mobile === "" || password === "") {
        alert("All fields are mandatory!");
        return;
    }

    if (mobile.length !== 10) {
        alert("Mobile number must be exactly 10 digits.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    // 3. Get existing users from LocalStorage
    // We use JSON.parse because LocalStorage only stores strings, not arrays
    let userList = JSON.parse(localStorage.getItem("users")) || [];

    // 4. Check for Duplicate Email
    if (userList.some(user => user.email === email)) {
        alert("This email is already registered!");
        return;
    }

    // 5. Create new user object and add to list
    const newUser = { name, email, mobile, password };
    userList.push(newUser);

    // 6. Save back to LocalStorage (Convert array back to string)
    localStorage.setItem("users", JSON.stringify(userList));

    // 7. Refresh the table and clear inputs
    alert("Registration Successful!");
    displayUsers();
    resetForm();
}

// Function to display users in the table
function displayUsers() {
    const userTableBody = document.getElementById("userTableBody");
    const userList = JSON.parse(localStorage.getItem("users")) || [];

    // Clear current table rows
    userTableBody.innerHTML = "";

    // Loop through users and create table rows
    userList.forEach((user, index) => {
        const row = `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.mobile}</td>
                <td>
                    <button class="delete-btn" onclick="deleteUser(${index})">Delete</button>
                </td>
            </tr>
        `;
        userTableBody.innerHTML += row;
    });
}

// Function to delete a single user
function deleteUser(index) {
    let userList = JSON.parse(localStorage.getItem("users")) || [];
    
    // Remove the user at the specific index
    userList.splice(index, 1);
    
    // Update LocalStorage and Table
    localStorage.setItem("users", JSON.stringify(userList));
    displayUsers();
}

// Function to clear all data
function clearAllUsers() {
    if (confirm("Are you sure you want to delete ALL users?")) {
        localStorage.removeItem("users");
        displayUsers();
    }
}

// Helper to clear input fields
function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("password").value = "";
}