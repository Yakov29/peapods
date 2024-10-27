import axios from "axios";

// Fetch user profile
async function fetchProfiles() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        document.getElementById("profileName").textContent = loggedInUser.name;
        document.getElementById("profileNickname").textContent = `@${loggedInUser.username}`;
    }
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
                            ${comment.userId === currentUserId ? `<button class="delete-comment-btn" data-comment-id="${comment.commentId}" data-pod-id="${pod.id}">Delete</button>` : ''}
                        </li>
                    `).join('') : ''}
                </ul>
                <input class="comment-text" id="commentText-${pod.id}" placeholder="Write a comment...">
                <button class="comment-btn" data-pod-id="${pod.id}">Comment</button>
            `;

            // User image click handler
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
                deleteButton.textContent = "Delete Pod";
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

submitPodButton.addEventListener("click", async () => {
    const podText = document.getElementById("podText").value;
    const podImageInput = document.getElementById("podImageInput").files[0];
    const isAnonymous = document.getElementById("anonymousCheckbox").checked;
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // Check if avatar exists before accessing its src
    const avatarElement = document.querySelector(".home__avatar");
    const userImage = avatarElement ? avatarElement.src : null;

    const podData = {
        text: podText,
        time: new Date().toISOString(),
        userImage: isAnonymous ? null : userImage,
        userId: isAnonymous ? null : loggedInUser.id,
        username: isAnonymous ? null : loggedInUser.username
    };

    if (podImageInput) {
        const reader = new FileReader();
        reader.onload = async function (event) {
            podData.image = event.target.result;
            await createPod(podData);
        };
        reader.readAsDataURL(podImageInput);
    } else {
        await createPod(podData);
    }

    createPodModal.style.display = "none";
});

// Create a new pod
async function createPod(podData) {
    try {
        await axios.post("https://peapods-base.onrender.com/pods", podData);
        fetchPods();
    } catch (error) {
        console.error("Error creating pod:", error);
    }
}

// Run fetchProfiles and fetchPods on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchProfiles();
    fetchPods();
});

const toTopButton = document.querySelector(".totop");
const updatePods = document.querySelector(".updatepage");

toTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    toTopButton.style.display = "block";
  } else {
    toTopButton.style.display = "none";
  }
});


updatePods.addEventListener("click", () => {
    fetchProfiles();
    fetchPods();
})