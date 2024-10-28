async function e(){let e=JSON.parse(localStorage.getItem("loggedInUser"));if(e)try{let n=await fetch(`https://peapods-base.onrender.com/accounts/${e.id}`),o=await n.json();o?(document.getElementById("profileName").textContent=o.name,document.getElementById("profileNickname").textContent=`@${o.username}`):t()}catch(e){console.error("Error fetching profile:",e),t()}else window.location.href="index.html"}function t(){alert("Аккаунт удален или произошла ошибка."),localStorage.removeItem("loggedInUser"),window.location.href="index.html"}async function n(){try{let e=await fetch("https://peapods-base.onrender.com/pods"),t=(await e.json()).sort((e,t)=>new Date(t.time)-new Date(e.time)),n=document.getElementById("podsContainer");n.innerHTML="";let a=JSON.parse(localStorage.getItem("loggedInUser")).id;t.forEach(e=>{let t=document.createElement("li");t.classList.add("pod"),t.setAttribute("data-aos","zoom-in-up"),t.innerHTML=`
                <div class="pod__title">
                    <img class="pod__user__image" src="${e.userImage||"./images/default-avatar.png"}" alt="User Image" style="cursor: pointer;" data-username="${e.username}">
                    <div class="pod__data">
                        <p class="pod__userdata" style="cursor: pointer;" data-username="${e.username}">${e.username||"Anonymous"}</p>
                        <p class="pod__time">${new Date(e.time).toLocaleString()}</p>
                    </div>
                </div>
                <h2 class="pod__text">${e.text}</h2>
                ${e.image?`<img class="pod__image" src="${e.image}" alt="Pod Image">`:""}
                <ul class="comments-list" id="comments-${e.id}">
                    ${e.comments?e.comments.map(t=>`
                        <li class="comment-item">
                            <p><b>${t.username}</b>: ${t.text}</p>
                            ${t.userId===a?`<button class="delete-comment-btn" data-comment-id="${t.commentId}" data-pod-id="${e.id}"><i class="fas fa-trash"></i></button>`:""}
                        </li>
                    `).join(""):""}
                </ul>
                <input class="comment-text" id="commentText-${e.id}" placeholder="Write a comment...">
                <button class="comment-btn" data-pod-id="${e.id}"><i class="fas fa-comment-dots"></i></button>
            `;let s=t.querySelector(".pod__user__image"),d=t.querySelector(".pod__userdata");if(s.addEventListener("click",()=>{e.username&&(window.location.href=`user.html?username=${encodeURIComponent(e.username)}`)}),d.addEventListener("click",()=>{e.username&&(window.location.href=`user.html?username=${encodeURIComponent(e.username)}`)}),e.userId===a){let n=document.createElement("button");n.innerHTML='<i class="fas fa-trash-alt"></i>',n.classList.add("delete-pod-button"),n.addEventListener("click",()=>{o(e.id)}),t.appendChild(n)}n.appendChild(t)}),function(){let e=document.querySelectorAll(".comment-btn"),t=document.querySelectorAll(".delete-comment-btn");e.forEach(e=>{e.addEventListener("click",async()=>{let t=e.getAttribute("data-pod-id"),n=document.getElementById(`commentText-${t}`).value;n.trim()&&await s(t,n)})}),t.forEach(e=>{e.addEventListener("click",async()=>{let t=e.getAttribute("data-pod-id"),n=e.getAttribute("data-comment-id");await d(t,n)})})}()}catch(e){console.error("Error fetching pods:",e)}}async function o(e){try{await fetch(`https://peapods-base.onrender.com/pods/${e}`,{method:"DELETE"}),await a(e),n()}catch(e){console.error("Error deleting pod:",e)}}async function a(e){try{let t=await fetch(`https://peapods-base.onrender.com/pods/${e}`),n=await t.json(),o=await fetch("https://peapods-base.onrender.com/accounts"),a=(await o.json()).find(e=>e.username===n.username);a&&(a.podsCount=(a.podsCount||0)-1,await fetch(`https://peapods-base.onrender.com/accounts/${a.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}))}catch(e){console.error("Error updating profile pod count on delete:",e)}}async function s(e,t){try{let o=JSON.parse(localStorage.getItem("loggedInUser")),a=await fetch(`https://peapods-base.onrender.com/pods/${e}`),s=await a.json(),d={commentId:Date.now(),userId:o.id,username:o.username,text:t};s.comments=s.comments||[],s.comments.push(d),await fetch(`https://peapods-base.onrender.com/pods/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),n()}catch(e){console.error("Error adding comment:",e)}}async function d(e,t){try{let o=await fetch(`https://peapods-base.onrender.com/pods/${e}`),a=await o.json();a.comments=a.comments.filter(e=>e.commentId!==parseInt(t)),await fetch(`https://peapods-base.onrender.com/pods/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),n()}catch(e){console.error("Error deleting comment:",e)}}const c=document.getElementById("createPodButton"),r=document.getElementById("createPodModal"),i=document.getElementById("closeModalButton"),m=document.getElementById("submitPodButton");async function l(e){try{await fetch("https://peapods-base.onrender.com/pods",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),n()}catch(e){console.error("Error saving pod:",e)}}c.addEventListener("click",()=>{r.classList.toggle("change__invisible"),r.style.display="flex"}),i.addEventListener("click",()=>{r.classList.toggle("change__invisible"),setTimeout(()=>{r.style.display="none"},300)}),m.addEventListener("click",async()=>{let e=document.getElementById("podText").value,t=document.getElementById("podImageInput").files[0],n=document.getElementById("anonymousCheckbox").checked,o=JSON.parse(localStorage.getItem("loggedInUser")),a=document.querySelector(".home__avatar"),s=a?a.src:"./images/default-avatar.png";if(e.trim()||t){let a={text:e,time:new Date,userId:n?null:o.id,username:n?null:o.username,userImage:n?null:s,comments:[]};if(t){let e=new FileReader;e.onloadend=async()=>{a.image=e.result,await l(a)},e.readAsDataURL(t)}else await l(a)}r.classList.toggle("change__invisible"),setTimeout(()=>{r.style.display="none"},300)}),document.addEventListener("DOMContentLoaded",()=>{e(),n()});
//# sourceMappingURL=home.bd26985c.js.map