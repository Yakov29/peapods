import axios from "axios";

async function fetchProfile() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        document.getElementById("profileAvatar").src = loggedInUser.avatar || './images/default-avatar.png';
        document.getElementById("name").value = loggedInUser.name;
        document.getElementById("username").value = loggedInUser.username;
    }
}

async function updateProfile(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        try {
            const updatedUser = {
                ...loggedInUser,
                name,
                username,
                password,
            };

            await axios.put(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`, updatedUser);
            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating the profile.");
        }
    }
}

async function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "./index.html";
}

async function deleteAccount() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        try {
            await axios.delete(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`);
            localStorage.removeItem("loggedInUser");
            alert("Account deleted successfully!");
            window.location.href = "./index.html";
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred while deleting the account.");
        }
    }
}

document.getElementById("profileForm").addEventListener("submit", updateProfile);
document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("deleteAccountButton").addEventListener("click", deleteAccount);

window.addEventListener("DOMContentLoaded", fetchProfile);