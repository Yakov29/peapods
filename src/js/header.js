const headerBurger = document.querySelector(".header__burger")
const headerClose = document.querySelector(".header__close")
const headerBackdrop = document.querySelector(".header__backdrop")


headerBurger.addEventListener("click", () => {
    headerBackdrop.classList.remove("change__invisible")
})

headerClose.addEventListener("click", () => {
    headerBackdrop.classList.add("change__invisible")
})