import axios from "axios";

// Fetch user profile
async function fetchProfiles() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (loggedInUser) {
        try {
            const response = await axios.get(`https://peapods-base.onrender.com/accounts/${loggedInUser.id}`);
            const user = response.data;

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
    alert("Аккаунт видалено або виникла помилка.");
    localStorage.removeItem("loggedInUser"); 
    window.location.href = "index.html"; 
}

// Fetch pods
async function fetchPods() {
    try {
        const response = await axios.get("https://peapods-base.onrender.com/pods");
        const pods = response.data.sort((a, b) => new Date(b.time) - new Date(a.time));
        const podsContainer = document.getElementById("podsContainer");
        podsContainer.innerHTML = "";

        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const currentUserId = loggedInUser.id;

        pods.forEach(pod => {
            const podItem = document.createElement("li");
            podItem.classList.add("pod");
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
                            ${comment.userId === currentUserId ? `<button class="delete-comment-btn" data-comment-id="${comment.commentId}" data-pod-id="${pod.id}"><i class="fas fa-trash-alt"></i></button>` : ''}
                        </li>
                    `).join('') : ''}
                </ul>
                <input class="comment-text" id="commentText-${pod.id}" placeholder="Write a comment...">
                <button class="comment-btn" data-pod-id="${pod.id}"><i class="fas fa-comment"></i></button>
            `;

            const userImage = podItem.querySelector(".pod__user__image");
            const usernameElement = podItem.querySelector(".pod__userdata");

            userImage.addEventListener("click", () => {
                if (pod.username) {
                    window.location.href = `/user.html?username=${encodeURIComponent(pod.username)}`;
                }
            });

            usernameElement.addEventListener("click", () => {
                if (pod.username) {
                    window.location.href = `/user.html?username=${encodeURIComponent(pod.username)}`;
                }
            });

            if (pod.userId === currentUserId) {
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete-pod-button");
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
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
        await axios.delete(`https://peapods-base.onrender.com/pods/${podId}`);
        await updateProfilePodCountOnDelete(podId);
        fetchPods();
    } catch (error) {
        console.error("Error deleting pod:", error);
    }
}

// Update profile pod count on delete
async function updateProfilePodCountOnDelete(podId) {
    try {
        const response = await axios.get("https://peapods-base.onrender.com/pods/" + podId);
        const pod = response.data;

        const profileResponse = await axios.get("https://peapods-base.onrender.com/accounts");
        const profiles = profileResponse.data;
        const profile = profiles.find(profile => profile.username === pod.username);

        if (profile) {
            profile.podsCount = (profile.podsCount || 0) - 1;
            await axios.put(`https://peapods-base.onrender.com/accounts/${profile.id}`, profile);
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
        const response = await axios.get(`https://peapods-base.onrender.com/pods/${podId}`);
        const pod = response.data;

        const newComment = {
            commentId: Date.now(),
            userId: loggedInUser.id,
            username: loggedInUser.username,
            text: commentText
        };

        pod.comments = pod.comments || [];
        pod.comments.push(newComment);

        await axios.put(`https://peapods-base.onrender.com/pods/${podId}`, pod);
        fetchPods();
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

// Delete a comment
async function deleteComment(podId, commentId) {
    try {
        const response = await axios.get(`https://peapods-base.onrender.com/pods/${podId}`);
        const pod = response.data;

        pod.comments = pod.comments.filter(comment => comment.commentId !== parseInt(commentId));

        await axios.put(`https://peapods-base.onrender.com/pods/${podId}`, pod);
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

    if (podText.trim()) {
        const newPod = {
            userId: isAnonymous ? null : loggedInUser.id,
            username: isAnonymous ? "Anonymous" : loggedInUser.username,
            text: podText,
            time: Date.now(),
            comments: []
        };

        if (podImageInput) {
            const imageUrl = await uploadImage(podImageInput);
            newPod.image = imageUrl;
        }

        await axios.post("https://peapods-base.onrender.com/pods", newPod);
        await updateProfilePodCountOnCreate(loggedInUser.id);
        fetchPods();
        createPodModal.classList.toggle("change__invisible");
        createPodModal.style.display = "none";
    }
});

// Upload image function
async function uploadImage(image) {
    const formData = new FormData();
    formData.append("image", image);

    const response = await axios.post("https://peapods-base.onrender.com/upload", formData);
    return response.data.imageUrl; // Adjust based on your API response structure
}

// Update profile pod count on create
async function updateProfilePodCountOnCreate(userId) {
    try {
        const profileResponse = await axios.get(`https://peapods-base.onrender.com/accounts/${userId}`);
        const profile = profileResponse.data;

        if (profile) {
            profile.podsCount = (profile.podsCount || 0) + 1;
            await axios.put(`https://peapods-base.onrender.com/accounts/${profile.id}`, profile);
        }
    } catch (error) {
        console.error("Error updating profile pod count on create:", error);
    }
}

// Event listeners for opening modals
document.addEventListener("DOMContentLoaded", fetchProfiles);
document.addEventListener("DOMContentLoaded", fetchPods);

const toTopButton = document.getElementById("toTopButton");

// Показати кнопку при прокручуванні вниз
window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        toTopButton.style.display = "block";
    } else {
        toTopButton.style.display = "none";
    }
};

// Прокрутка до верхньої частини сторінки
toTopButton.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
});
