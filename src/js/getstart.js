// Check if user is already logged in
window.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        window.location.href = "home.html";
    }
});

// Elements for the modals
const getstartedBackdrop = document.querySelector(".getstart__backdrop");
const register = document.querySelector(".getstart__register");
const registerBackdrop = document.querySelector(".register__backdrop");
const login = document.querySelector(".getstart__login");
const loginBackdrop = document.querySelector(".login__backdrop");

// Show register modal
register.addEventListener("click", () => {
    getstartedBackdrop.classList.add("change__invisible");
    registerBackdrop.classList.remove("change__invisible");
});

// Show login modal
login.addEventListener("click", () => {
    getstartedBackdrop.classList.add("change__invisible");
    loginBackdrop.classList.remove("change__invisible");
});

// Registration form handling
const registerButton = document.querySelector(".register__button");
registerButton.addEventListener("click", async () => {
    const name = document.querySelector(".register__name").value;
    const username = document.querySelector(".register__username").value;
    const email = document.querySelector(".register__email").value;
    const password = document.querySelector(".register__password").value;
    const confirmPassword = document.querySelector(".register__confirm").value;

    // Check for password match
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        // Fetch existing users
        const response = await fetch("http://localhost:3000/api/accounts");
        const users = await response.json();

        // Check if username or email already exists
        const userExists = users.some(user => user.username === username || user.email === email);
        if (userExists) {
            alert("A user with this name or email already exists.");
            return;
        }

        // Create new user
        const userData = {
            name,
            username,
            email,
            password,
        };

        const registerResponse = await fetch("http://localhost:3000/api/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (registerResponse.ok) {
            const newUser = await registerResponse.json(); // Get the newly created user data
            localStorage.setItem("loggedInUser", JSON.stringify(newUser)); // Automatically log the user in
            alert("Registration successful! You are now logged in.");
            window.location.href = "home.html"; // Redirect to home page
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration. Please try again.");
    }
});

// Login form handling
const loginButton = document.querySelector(".login__button");
loginButton.addEventListener("click", async () => {
    const email = document.querySelector(".login__email").value;
    const password = document.querySelector(".login__password").value;

    try {
        const response = await fetch("http://localhost:3000/api/accounts");
        const users = await response.json();

        // Find user by email and password
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            alert("Login successful!");
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            location.reload();  // Refresh the page after logging in
        } else {
            alert("Incorrect email or password. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login. Please try again.");
    }
});
