import axios from "axios";

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
        alert("Пароли не совпадают!");
        return;
    }

    try {
        // Fetch existing users
        const response = await axios.get("https://peapods-base.onrender.com/accounts");
        const users = response.data;

        // Check if username or email already exists
        const userExists = users.some(user => user.username === username || user.email === email);
        if (userExists) {
            alert("Пользователь с таким именем или email уже существует.");
            return;
        }

        // Create new user
        const userData = {
            name,
            username,
            email,
            password,
        };

        const registerResponse = await axios.post("https://peapods-base.onrender.com/accounts", userData);
        if (registerResponse.status === 201) {
            alert("Регистрация успешна! Пожалуйста, залогиньтесь.");
            getstartedBackdrop.classList.remove("change__invisible");
            registerBackdrop.classList.add("change__invisible");
        }
    } catch (error) {
        console.error("Ошибка при регистрации:", error);
        alert("Произошла ошибка при регистрации. Пожалуйста, попробуйте снова.");
    }
});

// Login form handling
const loginButton = document.querySelector(".login__button");
loginButton.addEventListener("click", async () => {
    const email = document.querySelector(".login__email").value;
    const password = document.querySelector(".login__password").value;

    try {
        const response = await axios.get("https://peapods-base.onrender.com/accounts");
        const users = response.data;

        // Find user by email and password
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            alert("Вход успешен!");
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            location.reload();  // Refresh the page after logging in
        } else {
            alert("Неверный email или пароль. Пожалуйста, попробуйте снова.");
        }
    } catch (error) {
        console.error("Ошибка при входе:", error);
        alert("Произошла ошибка при входе. Пожалуйста, попробуйте снова.");
    }
});
