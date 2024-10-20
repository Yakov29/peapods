import axios from "axios";

// Функция для получения профиля пользователя
async function fetchProfiles() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        document.getElementById("profileName").textContent = loggedInUser.name;
        document.getElementById("profileNickname").textContent = `@${loggedInUser.username}`;
        document.getElementById("podsCount").textContent = `${loggedInUser.podsCount || 0} Pods`;
        document.getElementById("followingCount").textContent = `${loggedInUser.followingCount || 0} Following`;
        document.getElementById("followersCount").textContent = `${loggedInUser.followersCount || 0} Followers`;
    }
}

// Функция для получения подов
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
                            ${comment.userId === currentUserId ? `<button class="delete-comment-btn" data-comment-id="${comment.commentId}" data-pod-id="${pod.id}">Delete</button>` : ''}
                        </li>
                    `).join('') : ''}
                </ul>
                <input class="comment-text" id="commentText-${pod.id}" placeholder="Write a comment...">
                <button class="comment-btn" data-pod-id="${pod.id}">Comment</button>
            `;

            // Обработчик клика на аватарку
            const userImage = podItem.querySelector(".pod__user__image");
            const usernameElement = podItem.querySelector(".pod__userdata");

            userImage.addEventListener("click", () => {
                window.location.href = `/user.html?username=${encodeURIComponent(pod.username)}`; // Перенаправление на страницу профиля
            });

            usernameElement.addEventListener("click", () => {
                window.location.href = `/user.html?username=${encodeURIComponent(pod.username)}`; // Перенаправление на страницу профиля
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

// Удаление пода
async function deletePod(podId) {
    try {
        // Получаем информацию о поде перед его удалением
        const response = await axios.get(`https://peapods-base.onrender.com/pods/${podId}`);
        const pod = response.data;

        // Удаляем под
        await axios.delete(`https://peapods-base.onrender.com/pods/${podId}`);

        // Обновляем количество подов в профиле пользователя
        await updateProfilePodCountOnDelete(pod.username);

        // Обновляем список подов на странице
        fetchPods();
    } catch (error) {
        console.error("Error deleting pod:", error);
    }
}

// Обновление количества подов в профиле при удалении пода
async function updateProfilePodCountOnDelete(username) {
    try {
        const response = await axios.get("https://peapods-base.onrender.com/accounts");
        const profiles = response.data;
        const profile = profiles.find(profile => profile.username === username);

        if (profile) {
            profile.podsCount = (profile.podsCount || 0) - 1; // Уменьшаем количество подов
            await axios.put(`https://peapods-base.onrender.com/accounts/${profile.id}`, profile);
        }
    } catch (error) {
        console.error("Error updating profile pod count on delete:", error);
    }
}

// Установка слушателей для кнопок комментариев
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

// Добавление комментария
async function addComment(podId, commentText) {
    try {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const response = await axios.get(`https://peapods-base.onrender.com/pods/${podId}`);
        const pod = response.data;

        const newComment = {
            commentId: Date.now(), // Уникальный идентификатор комментария
            userId: loggedInUser.id,
            username: loggedInUser.username,
            text: commentText
        };

        pod.comments = pod.comments || [];
        pod.comments.push(newComment);

        await axios.put(`https://peapods-base.onrender.com/pods/${podId}`, pod);

        fetchPods(); // Обновляем список подов для отображения нового комментария
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

// Удаление комментария
async function deleteComment(podId, commentId) {
    try {
        const response = await axios.get(`https://peapods-base.onrender.com/pods/${podId}`);
        const pod = response.data;

        pod.comments = pod.comments.filter(comment => comment.commentId !== parseInt(commentId));

        await axios.put(`https://peapods-base.onrender.com/pods/${podId}`, pod);

        fetchPods(); // Обновляем список подов для удаления комментария
    } catch (error) {
        console.error("Error deleting comment:", error);
    }
}

// Открытие и закрытие модального окна для создания пода
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
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    const podData = {
        text: podText,
        username: loggedInUser.username,
        time: new Date().toISOString(),
        userImage: document.querySelector(".home__avatar").src,
        userId: loggedInUser.id
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
});

// Создание нового пода
async function createPod(podData) {
    try {
        await axios.post("https://peapods-base.onrender.com/pods", podData);
        fetchPods(); // Обновляем список подов
        createPodModal.classList.toggle("change__invisible");
        setTimeout(() => {
            createPodModal.style.display = "none";
        }, 300);
    } catch (error) {
        console.error("Error creating pod:", error);
    }
}

// Инициализация страницы
document.addEventListener("DOMContentLoaded", () => {
    fetchProfiles();
    fetchPods();
});
