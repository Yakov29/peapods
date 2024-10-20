import axios from "axios";

async function fetchProfile() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        // Display the avatar; the user cannot change it
        document.getElementById("profileAvatar").src = loggedInUser.avatar || './images/default-avatar.png'; // Default avatar
        document.getElementById("name").value = loggedInUser.name;
        document.getElementById("username").value = loggedInUser.username;
    }
}

async function updateProfile(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        try {
            // Update user data without changing the avatar
            const updatedUser = {
                ...loggedInUser,
                name,
                username,
                password, // Ensure you hash this on the server-side for security
            };

            await axios.put(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`, updatedUser);

            // Update local storage
            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating the profile.");
        }
    }
}

async function logout() {
    // Clear the user data from local storage
    localStorage.removeItem("loggedInUser");
    // Redirect to the login page or homepage
    window.location.href = "./login.html"; // Adjust the path as needed
}

async function deleteAccount() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
        try {
            await axios.delete(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`);
            // Clear the user data from local storage
            localStorage.removeItem("loggedInUser");
            alert("Account deleted successfully!");
            // Redirect to the homepage or login page
            window.location.href = "./index.html"; // Adjust the path as needed
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred while deleting the account.");
        }
    }
}

// Add event listener for form submission
document.getElementById("profileForm").addEventListener("submit", updateProfile);
document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("deleteAccountButton").addEventListener("click", deleteAccount);

// Fetch profile data on page load
window.addEventListener("DOMContentLoaded", fetchProfile);
