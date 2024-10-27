import axios from "axios";

// Function to fetch user profile
async function fetchProfiles() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const usernameFromURL = new URLSearchParams(window.location.search).get("username");
    
    // Clear profile information initially
    document.getElementById("profileName").textContent = '';
    document.getElementById("profileNickname").textContent = '';
    document.getElementById("podsCount").textContent = '0 Pods';
    document.getElementById("followingCount").textContent = '0 Following';
    document.getElementById("followersCount").textContent = '0 Followers';

    if (loggedInUser) {
        // Only display logged-in user data if no username is in the URL
        if (!usernameFromURL) {
            document.getElementById("profileName").textContent = loggedInUser.name;
            document.getElementById("profileNickname").textContent = `@${loggedInUser.username}`;
            document.getElementById("podsCount").textContent = `${loggedInUser.podsCount || 0} Pods`;
            document.getElementById("followingCount").textContent = `${loggedInUser.followingCount || 0} Following`;
            document.getElementById("followersCount").textContent = `${loggedInUser.followersCount || 0} Followers`;
        }
    }
    
    // Fetch user profile by username from URL
    if (usernameFromURL) {
        try {
            const response = await axios.get("https://peapods-base.onrender.com/accounts");
            const profiles = response.data;
            const userProfile = profiles.find(profile => profile.username === usernameFromURL);
            
            if (userProfile && loggedInUser.username !== usernameFromURL) {
                document.getElementById("profileName").textContent = userProfile.name;
                document.getElementById("profileNickname").textContent = `@${userProfile.username}`;
                document.getElementById("podsCount").textContent = `${userProfile.podsCount || 0} Pods`;
                document.getElementById("followingCount").textContent = `${userProfile.followingCount || 0} Following`;
                document.getElementById("followersCount").textContent = `${userProfile.followersCount || 0} Followers`;
                setupSubscribeButton(loggedInUser, userProfile); // Set up the subscribe button
            } else if (!userProfile) {
                alert("Profile not found or an error occurred.");
                // Optional: You can redirect to a default profile or reset the profile section.
            } else if (loggedInUser.username === usernameFromURL) {
                alert("You cannot view your own profile this way.");
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    }
}

// Function to fetch pods of a specific user
async function fetchPods(username) {
    try {
        const response = await axios.get("https://peapods-base.onrender.com/pods");
        const pods = response.data
            .filter(pod => pod.username === username) // Filter pods by username
            .sort((a, b) => new Date(b.time) - new Date(a.time));
        
        const podsContainer = document.getElementById("podsContainer");
        podsContainer.innerHTML = "";

        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const currentUserId = loggedInUser.id;

        pods.forEach(pod => {
            const podItem = document.createElement("li");
            podItem.classList.add("pod");
            podItem.innerHTML = `
                <div class="pod__title">
                    <img class="pod__user__image" src="${pod.userImage || './images/Group 5.19.png'}" alt="User Image" style="cursor: pointer;" data-username="${pod.username}">
                    <div class="pod__data">
                        <p class="pod__userdata" style="cursor: pointer;" data-username="${pod.username}">${pod.username}</p>
                        <p class="pod__time">${new Date(pod.time).toLocaleString()}</p>
                    </div>
                </div>
                <h2 class="pod__text">${pod.text}</h2>
                ${pod.image ? `<img class="pod__image" src="${pod.image}" alt="Pod Image">` : ''}
                <ul class="comments-list" id="comments-${pod.id}">
                    ${pod.comments ? pod.comments.map(comment => `
                        <li class="comment-item">
                            <p><b>${comment.username}</b>: ${comment.text}</p>
                        </li>
                    `).join('') : ''}
                </ul>
            `;

            // Click handler for the avatar
            const userImage = podItem.querySelector(".pod__user__image");
            const usernameElement = podItem.querySelector(".pod__userdata");

            userImage.addEventListener("click", () => {
                window.location.href = `/user.html?username=${encodeURIComponent(pod.username)}`; // Redirect to profile page
            });

            usernameElement.addEventListener("click", () => {
                window.location.href = `/user.html?username=${encodeURIComponent(pod.username)}`; // Redirect to profile page
            });

            if (pod.userId === currentUserId) {
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete Pod";
                deleteButton.classList.add("delete-pod-button");
                deleteButton.addEventListener("click", () => {
                    deletePod(pod.id);
                });
                podItem.appendChild(deleteButton); // Add delete button to pod item
            }

            podsContainer.appendChild(podItem);
        });

    } catch (error) {
        console.error("Error fetching pods:", error);
    }
}

// Function to subscribe to a user
async function subscribeToUser(loggedInUser, userToSubscribe) {
    try {
        const updatedUser = {
            ...loggedInUser,
            following: [...(loggedInUser.following || []), userToSubscribe.username]
        };

        await axios.put(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`, updatedUser);
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
        alert(`Subscribed to ${userToSubscribe.username} successfully!`);
    } catch (error) {
        console.error("Error subscribing to user:", error);
        alert("An error occurred while subscribing.");
    }
}

// Function to set up the subscribe button
function setupSubscribeButton(loggedInUser, userProfile) {
    const subscribeButton = document.getElementById("subscribeButton");
    
    subscribeButton.addEventListener("click", () => {
        if (loggedInUser.id !== userProfile.id) { // Prevent subscribing to oneself
            subscribeToUser(loggedInUser, userProfile);
        } else {
            alert("You cannot subscribe to yourself!");
        }
    });
}

// Function to load user information when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    await fetchProfiles();
    const usernameFromURL = new URLSearchParams(window.location.search).get("username");
    if (usernameFromURL) {
        await fetchPods(usernameFromURL); // Pass the username to the function
    }
});
