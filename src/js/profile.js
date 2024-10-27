import axios from "axios";

// Fetch user profile data on page load
async function fetchProfile() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        document.getElementById("name").value = loggedInUser.name;
        document.getElementById("username").value = loggedInUser.username;
    } else {
        console.error("No logged-in user data found.");
    }
}

// Update user profile
async function updateProfile(event) {
    event.preventDefault(); // Prevent form submission

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser && loggedInUser.id) {
        try {
            const updatedUser = {
                ...loggedInUser,
                name,
                username,
                password // Ensure password is hashed on the server side
            };

            const response = await fetch(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUser)
            });

            if (response.ok) {
                // Update local storage
                localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
                alert("Profile updated successfully!");
            } else {
                throw new Error("Failed to update profile: " + response.status);
            }
        } catch (error) {
            console.error("Error updating profile:", error.message);
            alert("An error occurred while updating the profile.");
        }
    } else {
        console.error("User ID is missing or user is not logged in.");
    }
}

// Logout function
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "./index.html"; // Redirect to the login or homepage
}

// Delete account function
async function deleteAccount() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser && loggedInUser.id) {
        try {
            const response = await fetch(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                localStorage.removeItem("loggedInUser");
                alert("Account deleted successfully!");
                window.location.href = "./index.html"; // Redirect to the homepage or login page
            } else {
                throw new Error("Failed to delete account: " + response.status);
            }
        } catch (error) {
            console.error("Error deleting account:", error.message);
            alert("An error occurred while deleting the account.");
        }
    } else {
        console.error("User ID is missing or user is not logged in.");
    }
}

// Event listeners for form submission, logout, and delete actions
document.getElementById("profileForm").addEventListener("submit", updateProfile);
document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("deleteAccountButton").addEventListener("click", deleteAccount);

// Load profile data when the page loads
window.addEventListener("DOMContentLoaded", fetchProfile);
