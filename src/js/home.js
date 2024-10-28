// Fetch user profile
async function fetchProfiles() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (loggedInUser) {
        try {
            const response = await fetch(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`);
            const user = await response.json();

            // Check if the user exists in the database
            if (user) {
                document.getElementById("profileName").textContent = user.name;
                document.getElementById("profileNickname").textContent = `@${user.username}`;
            } else {
                handleProfileError();
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            handleProfileError();
        }
    } else {
        window.location.href = "index.html";
    }
}

// Handle missing or deleted profile error
function handleProfileError() {
    alert("Аккаунт удален или произошла ошибка.");
    localStorage.removeItem("loggedInUser"); // Clear local storage
    window.location.href = "index.html"; // Redirect to index.html
}

// Fetch pods
// Fetch pods
async function fetchPods() {
    try {
        const response = await fetch("https://peapods-base.onrender.com/pods");
        const pods = await response.json();
        const sortedPods = pods.sort((a, b) => new Date(b.time) - new Date(a.time));
        const podsContainer = document.getElementById("podsContainer");
        podsContainer.innerHTML = "";

        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const currentUserId = loggedInUser.id;

        sortedPods.forEach(pod => {
            const podItem = document.createElement("li");
            podItem.classList.add("pod");
            podItem.setAttribute("data-aos", "zoom-in-up"); // Add the AOS attribute here
            podItem.innerHTML = `
                <div class="pod__title">
                    <img class="pod__user__image" src="${pod.userImage || './images/default-avatar.png'}" alt="User Image" style="cursor: pointer;" data-username="${pod.username}">
                    <div class="pod__data">
                        <p class="pod__userdata" style="cursor: pointer;" data-username="${pod.username}">${pod.username || "Anonymous"}</p>
                        <p class="pod__time">${new Date(pod.time).toLocaleString()}</p>
                    </div>
                </div>
                <h2 class="pod__text">${pod.text}</h2>
                ${pod.image ? `<img class="pod__image" src="${pod.image}" alt="Pod Image">` : ''}
                <ul class="comments-list" id="comments-${pod.id}">
                    ${pod.comments ? pod.comments.map(comment => `
                        <li class="comment-item">
                            <p><b>${comment.username}</b>: ${comment.text}</p>
                            ${comment.userId === currentUserId ? `<button class="delete-comment-btn" data-comment-id="${comment.commentId}" data-pod-id="${pod.id}"><i class="fas fa-trash"></i></button>` : ''}
                        </li>
                    `).join('') : ''}
                </ul>
                <input class="comment-text" id="commentText-${pod.id}" placeholder="Write a comment...">
                <button class="comment-btn" data-pod-id="${pod.id}"><i class="fas fa-comment-dots"></i></button>
            `;

            const userImage = podItem.querySelector(".pod__user__image");
            const usernameElement = podItem.querySelector(".pod__userdata");

            userImage.addEventListener("click", () => {
                if (pod.username) {
                    window.location.href = `user.html?username=${encodeURIComponent(pod.username)}`;
                }
            });

            usernameElement.addEventListener("click", () => {
                if (pod.username) {
                    window.location.href = `user.html?username=${encodeURIComponent(pod.username)}`;
                }
            });

            if (pod.userId === currentUserId) {
                const deleteButton = document.createElement("button");
                deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                deleteButton.classList.add("delete-pod-button");
                deleteButton.addEventListener("click", () => {
                    deletePod(pod.id);
                });
                podItem.appendChild(deleteButton);
            }

            podsContainer.appendChild(podItem);
        });

        setupCommentListeners();
    } catch (error) {
        console.error("Error fetching pods:", error);
    }
}


// Delete a pod
async function deletePod(podId) {
    try {
        await fetch(`https://peapods-base.onrender.com/pods/${podId}`, {
            method: 'DELETE'
        });
        await updateProfilePodCountOnDelete(podId);
        fetchPods();
    } catch (error) {
        console.error("Error deleting pod:", error);
    }
}

// Update profile pod count on delete
async function updateProfilePodCountOnDelete(podId) {
    try {
        const response = await fetch(`https://peapods-base.onrender.com/pods/${podId}`);
        const pod = await response.json();
        
        const profileResponse = await fetch("https://peapods-base.onrender.com/accounts");
        const profiles = await profileResponse.json();
        const profile = profiles.find(profile => profile.username === pod.username);

        if (profile) {
            profile.podsCount = (profile.podsCount || 0) - 1;
            await fetch(`https://peapods-base.onrender.com/accounts/${profile.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });
        }
    } catch (error) {
        console.error("Error updating profile pod count on delete:", error);
    }
}

// Setup listeners for comment buttons
function setupCommentListeners() {
    const commentButtons = document.querySelectorAll(".comment-btn");
    const deleteCommentButtons = document.querySelectorAll(".delete-comment-btn");

    commentButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const podId = button.getAttribute("data-pod-id");
            const commentText = document.getElementById(`commentText-${podId}`).value;
            if (commentText.trim()) {
                await addComment(podId, commentText);
            }
        });
    });

    deleteCommentButtons.forEach(button => {
        button.addEventListener("click", async () => {
            const podId = button.getAttribute("data-pod-id");
            const commentId = button.getAttribute("data-comment-id");
            await deleteComment(podId, commentId);
        });
    });
}

// Add a comment
async function addComment(podId, commentText) {
    try {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const response = await fetch(`https://peapods-base.onrender.com/pods/${podId}`);
        const pod = await response.json();

        const newComment = {
            commentId: Date.now(),
            userId: loggedInUser.id,
            username: loggedInUser.username,
            text: commentText
        };

        pod.comments = pod.comments || [];
        pod.comments.push(newComment);

        await fetch(`https://peapods-base.onrender.com/pods/${podId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pod)
        });
        fetchPods();
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

// Delete a comment
async function deleteComment(podId, commentId) {
    try {
        const response = await fetch(`https://peapods-base.onrender.com/pods/${podId}`);
        const pod = await response.json();

        pod.comments = pod.comments.filter(comment => comment.commentId !== parseInt(commentId));

        await fetch(`https://peapods-base.onrender.com/pods/${podId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pod)
        });
        fetchPods();
    } catch (error) {
        console.error("Error deleting comment:", error);
    }
}

// Open and close modal for creating pod
const createPodButton = document.getElementById("createPodButton");
const createPodModal = document.getElementById("createPodModal");
const closeModalButton = document.getElementById("closeModalButton");
const submitPodButton = document.getElementById("submitPodButton");

createPodButton.addEventListener("click", () => {
    createPodModal.classList.toggle("change__invisible");
    createPodModal.style.display = "flex";
});

closeModalButton.addEventListener("click", () => {
    createPodModal.classList.toggle("change__invisible");
    setTimeout(() => {
        createPodModal.style.display = "none";
    }, 300);
});

// Prevent modal from closing on submit and fetch pods again
submitPodButton.addEventListener("click", async () => {
    const podText = document.getElementById("podText").value;
    const podImageInput = document.getElementById("podImageInput").files[0];
    const isAnonymous = document.getElementById("anonymousCheckbox").checked;
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const avatarElement = document.querySelector(".home__avatar");
    const userImage = avatarElement ? avatarElement.src : "./images/default-avatar.png";

    if (podText.trim() || podImageInput) {
        const newPod = {
            text: podText,
            time: new Date(),
            userId: isAnonymous ? null : loggedInUser.id,
            username: isAnonymous ? null : loggedInUser.username,
            userImage: isAnonymous ? null : userImage,
            comments: []
        };

        if (podImageInput) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                newPod.image = reader.result;
                await savePod(newPod);
            };
            reader.readAsDataURL(podImageInput);
        } else {
            await savePod(newPod);
        }
    }

    createPodModal.classList.toggle("change__invisible");
    setTimeout(() => {
        createPodModal.style.display = "none";
    }, 300);
});

// Save new pod
async function savePod(pod) {
    try {
        await fetch("https://peapods-base.onrender.com/pods", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pod)
        });
        fetchPods();
    } catch (error) {
        console.error("Error saving pod:", error);
    }
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
    fetchProfiles();
    fetchPods();
});

