// Function to fetch user profile
async function fetchProfiles() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const usernameFromURL = new URLSearchParams(window.location.search).get("username");

    document.getElementById("profileName").textContent = 'Loading...';
    document.getElementById("profileNickname").textContent = '';
    document.getElementById("podsCount").textContent = '0 Pods';
    document.getElementById("followingCount").textContent = '0 Following';
    document.getElementById("followersCount").textContent = '0 Followers';

    if (loggedInUser && !usernameFromURL) {
        // Display logged-in user's profile info
        document.getElementById("profileName").textContent = loggedInUser.name;
        document.getElementById("profileNickname").textContent = `@${loggedInUser.username}`;
        document.getElementById("podsCount").textContent = `${loggedInUser.podsCount || 0} Pods`;
        document.getElementById("followingCount").textContent = `${(loggedInUser.following || []).length} Following`;
        document.getElementById("followersCount").textContent = `${(loggedInUser.followers || []).length} Followers`;
    }

    if (usernameFromURL) {
        try {
            const response = await fetch("http://localhost:3000/api/accounts");
            const profiles = await response.json();

            if (Array.isArray(profiles)) {
                const userProfile = profiles.find(profile => profile.username === usernameFromURL);

                if (userProfile) {
                    document.getElementById("profileName").textContent = userProfile.name;
                    document.getElementById("profileNickname").textContent = `@${userProfile.username}`;
                    document.getElementById("podsCount").textContent = `${userProfile.podsCount || 0} Pods`;
                    document.getElementById("followingCount").textContent = `${(userProfile.following || []).length} Following`;
                    document.getElementById("followersCount").textContent = `${(userProfile.followers || []).length} Followers`;
                } else {
                    alert("Profile not found or an error occurred.");
                }
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    }
}

// Function to fetch pods of a specific user
async function fetchPods(username) {
    try {
        const response = await fetch("http://localhost:3000/api/pods");
        const pods = await response.json();

        if (Array.isArray(pods)) {
            const filteredPods = pods
                .filter(pod => pod.username === username)
                .sort((a, b) => new Date(b.time) - new Date(a.time));

            const podsContainer = document.getElementById("podsContainer");
            podsContainer.innerHTML = "";

            filteredPods.forEach(pod => {
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
                `;

                podsContainer.appendChild(podItem);
            });
        }
    } catch (error) {
        console.error("Error fetching pods:", error);
    }
}

// Initial load function
document.addEventListener("DOMContentLoaded", async () => {
    await fetchProfiles();
    const usernameFromURL = new URLSearchParams(window.location.search).get("username");
    if (usernameFromURL) {
        await fetchPods(usernameFromURL);
    }
});