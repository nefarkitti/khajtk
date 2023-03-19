async function init() {
    checkAuth('home')
    const requestsList = document.getElementById("requestsList")
    try {
        const getRequests = await axios({
            url: `${URI}/api/user/me/requests`,
            method: "GET",
            headers: {
                "authorization": session
            }
        });
        requestsList.hidden = false;
        if (!getRequests.data.length) {
            requestsList.innerHTML = "<h1>You have no incoming friend requests.</h1>" // ~~how sad~~
            return;
        }
        getRequests.data.forEach(user => {
            console.log(user)
            requestsList.appendChild(genItem(user, true))
        })
    } catch (e) {
        console.error(e)
        requestsList.innerHTML = "<h1>An error occured.</h1>"
    }
}

let grid = false

function toggleGrid() {
    const requestsList = document.getElementById("requestsList")
    grid = !grid;
    if (grid) {
        requestsList.style = `display: grid; grid-template-columns: auto auto auto;`
    } else {
        requestsList.style = ""
    }
}

function genItem(userData, showFriendButtons) {
    /*
<div class="requests-list-item">
    <img class="requests-list-item-icon" src="https://cdn.discordapp.com/attachments/809469073590190130/1055968281544106045/1b42c81038cddcd9c94e55767d022efc.png" alt="">
    <span class="requests-list-item-displayname"><b>Kartinmat</b><span class="material-symbols-rounded verified" style="font-size: 15px !important;">verified</span></span><br>
    <span class="requests-list-item-username">@mmmmmonster</span><br>
    <div class="profile-table-user-profile-btns">
        <span class="user-profile-btn"><span class="material-symbols-rounded ubtn-icon">person</span>info</span>
        <span class="user-profile-btn" style="background-color: rgb(58, 159, 53);"><span class="material-symbols-rounded ubtn-icon">person_add</span>accept</span>
        <span class="user-profile-btn" style="background-color: rgb(159, 53, 53);"><span class="material-symbols-rounded ubtn-icon">person_remove</span>deny</span>
    </div>
</div>
    */
   /*
<div class="requests-list-item">
    <img class="requests-list-item-icon" alt="" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.discordapp.com%2Fattachments%2F841238402548498433%2F1059592631837020212%2Fvetquq9t3rl91.png">
    <span class="requests-list-item-displayname"><b>Jamie</b></span><br>
    <span class="requests-list-item-username">@nefarkitti</span><br>
    <div class="profile-table-user-profile-btns">
        <span class="user-profile-btn"><span class="material-symbols-rounded ubtn-icon">person</span>info</span>
        <span class="user-profile-btn" style="background-color: rgb(58, 159, 53);"><span class="material-symbols-rounded ubtn-icon">person_add</span>accept</span>
        <span class="user-profile-btn" style="background-color: rgb(159, 53, 53);"><span class="material-symbols-rounded ubtn-icon">person_remove</span>deny</span>
    </div>
</div>
   */
    const item = document.createElement("div");
    item.classList.add("requests-list-item");
    const img = document.createElement("img");
    const displayName = document.createElement("span");
    const userName = document.createElement("span");
    
    img.classList.add("requests-list-item-icon");
    img.alt = "";
    img.src = getIcon(userData.avatar);

    displayName.classList.add("requests-list-item-displayname");
    const bDisplayName = document.createElement("b")
    bDisplayName.innerText = userData.nickname;
    displayName.appendChild(bDisplayName)
    if (userData.verified) displayName.innerHTML += `<span class="material-symbols-rounded verified" style="font-size: 15px !important;">verified</span>`

    userName.classList.add("requests-list-item-username")
    userName.innerText = `@${userData.username}`;

    const btns = document.createElement("div");
    btns.classList.add("profile-table-user-profile-btns")
    /*
<span class="user-profile-btn"><span class="material-symbols-rounded ubtn-icon">person</span>info</span>
                    <span class="user-profile-btn" style="background-color: rgb(58, 159, 53);"><span class="material-symbols-rounded ubtn-icon">person_add</span>accept</span>
                    <span class="user-profile-btn" style="background-color: rgb(159, 53, 53);"><span class="material-symbols-rounded ubtn-icon">person_remove</span>deny</span>
    */
    const infoBtn = document.createElement("span")
    infoBtn.classList.add("user-profile-btn");
    infoBtn.innerHTML = `<span class="material-symbols-rounded ubtn-icon">person</span>info`
    infoBtn.onclick = function() {
        window.location.href = `https://nefarkitti.github.io/khajtk/g/${userData.username}`;
    }
    btns.appendChild(infoBtn);
    console.log(showFriendButtons)
    if (showFriendButtons) {
        const acceptBtn = document.createElement("span")
        acceptBtn.classList.add("user-profile-btn");
        acceptBtn.style.backgroundColor = "rgb(58, 159, 53)"
        acceptBtn.innerHTML = `<span class="material-symbols-rounded ubtn-icon">person_add</span>accept`
        acceptBtn.onclick = async function() {
            try {
                await axios({
                    url: `${URI}/api/user/${userData.username}/request`,
                    method: "POST",
                    headers: {
                        "authorization": session
                    },
                    timeout: 5000
                });
                window.location.reload();
            } catch (error) {
                console.error(error)
                alert(error.response.data)
            }
        }

        const denyBtn = document.createElement("span")
        denyBtn.classList.add("user-profile-btn");
        denyBtn.style.backgroundColor = "rgb(159, 53, 53)"
        denyBtn.innerHTML = `<span class="material-symbols-rounded ubtn-icon">person_remove</span>deny`
        denyBtn.onclick = async function() {
            try {
                await axios({
                    url: `${URI}/api/user/${userData.username}/request`,
                    method: "DELETE",
                    headers: {
                        "authorization": session
                    },
                    timeout: 5000
                });
                window.location.reload();
            } catch (error) {
                console.error(error)
                alert(error.response.data)
            }
        }

        btns.appendChild(acceptBtn);
        btns.appendChild(denyBtn);
    }
    
    item.appendChild(img);
    item.appendChild(displayName);
    item.appendChild(document.createElement("br"))
    item.appendChild(userName);
    item.appendChild(document.createElement("br"))
    item.appendChild(btns);

    return item;
}
