var e=globalThis,t={},o={},n=e.parcelRequire2ef1;null==n&&((n=function(e){if(e in t)return t[e].exports;if(e in o){var n=o[e];delete o[e];var r={id:e,exports:{}};return t[e]=r,n.call(r.exports,r,r.exports),r.exports}var a=Error("Cannot find module '"+e+"'");throw a.code="MODULE_NOT_FOUND",a}).register=function(e,t){o[e]=t},e.parcelRequire2ef1=n),n.register;var r=n("fmRoT");async function a(){let e=JSON.parse(localStorage.getItem("loggedInUser")),t=new URLSearchParams(window.location.search).get("username");if(document.getElementById("profileName").textContent="",document.getElementById("profileNickname").textContent="",document.getElementById("podsCount").textContent="0 Pods",document.getElementById("followingCount").textContent="0 Following",document.getElementById("followersCount").textContent="0 Followers",e&&!t&&(document.getElementById("profileName").textContent=e.name,document.getElementById("profileNickname").textContent=`@${e.username}`,document.getElementById("podsCount").textContent=`${e.podsCount||0} Pods`,document.getElementById("followingCount").textContent=`${e.followingCount||0} Following`,document.getElementById("followersCount").textContent=`${e.followersCount||0} Followers`),t)try{let o=(await (0,r.default).get("https://peapods-base.onrender.com/accounts")).data.find(e=>e.username===t);o&&e.username!==t?(document.getElementById("profileName").textContent=o.name,document.getElementById("profileNickname").textContent=`@${o.username}`,document.getElementById("podsCount").textContent=`${o.podsCount||0} Pods`,document.getElementById("followingCount").textContent=`${o.followingCount||0} Following`,document.getElementById("followersCount").textContent=`${o.followersCount||0} Followers`,document.getElementById("subscribeButton").addEventListener("click",()=>{e.id!==o.id?s(e,o):alert("You cannot subscribe to yourself!")})):o?e.username===t&&alert("You cannot view your own profile this way."):alert("Profile not found or an error occurred.")}catch(e){console.error("Error fetching profiles:",e)}}async function l(e){try{let t=(await (0,r.default).get("https://peapods-base.onrender.com/pods")).data.filter(t=>t.username===e).sort((e,t)=>new Date(t.time)-new Date(e.time)),o=document.getElementById("podsContainer");o.innerHTML="";let n=JSON.parse(localStorage.getItem("loggedInUser")).id;t.forEach(e=>{let t=document.createElement("li");t.classList.add("pod"),t.innerHTML=`
                <div class="pod__title">
                    <img class="pod__user__image" src="${e.userImage||"./images/Group 5.19.png"}" alt="User Image" style="cursor: pointer;" data-username="${e.username}">
                    <div class="pod__data">
                        <p class="pod__userdata" style="cursor: pointer;" data-username="${e.username}">${e.username}</p>
                        <p class="pod__time">${new Date(e.time).toLocaleString()}</p>
                    </div>
                </div>
                <h2 class="pod__text">${e.text}</h2>
                ${e.image?`<img class="pod__image" src="${e.image}" alt="Pod Image">`:""}
                <ul class="comments-list" id="comments-${e.id}">
                    ${e.comments?e.comments.map(e=>`
                        <li class="comment-item">
                            <p><b>${e.username}</b>: ${e.text}</p>
                        </li>
                    `).join(""):""}
                </ul>
            `;let r=t.querySelector(".pod__user__image"),a=t.querySelector(".pod__userdata");if(r.addEventListener("click",()=>{window.location.href=`/user.html?username=${encodeURIComponent(e.username)}`}),a.addEventListener("click",()=>{window.location.href=`/user.html?username=${encodeURIComponent(e.username)}`}),e.userId===n){let o=document.createElement("button");o.textContent="Delete Pod",o.classList.add("delete-pod-button"),o.addEventListener("click",()=>{deletePod(e.id)}),t.appendChild(o)}o.appendChild(t)})}catch(e){console.error("Error fetching pods:",e)}}async function s(e,t){try{let o={...e,following:[...e.following||[],t.username]};await (0,r.default).put(`https://peapods-base.onrender.com/accounts/${e.id}`,o),localStorage.setItem("loggedInUser",JSON.stringify(o)),alert(`Subscribed to ${t.username} successfully!`)}catch(e){console.error("Error subscribing to user:",e),alert("An error occurred while subscribing.")}}document.addEventListener("DOMContentLoaded",async()=>{await a();let e=new URLSearchParams(window.location.search).get("username");e&&await l(e)});
//# sourceMappingURL=user.77801740.js.map
