let sortedFriends = [];

function gotoProfile() {
    window.location.href = `https://nefarkitti.github.io/khajtk/g/${currentUser.username}`
}

//chatgpt be like:
function formatTime(timestamp) {
    // Create a Moment.js object from the Unix timestamp
    const date = moment(timestamp);

    // Format the date as "Today at 01:00" if it's today
    if (date.isSame(moment(), 'day')) {
        return date.format(`[Today at] HH:mm`);
    }
    // Format the date as "Yesterday at 5:25" if it's yesterday
    else if (date.isSame(moment().subtract(1, 'day'), 'day')) {
        return date.format(`[Yesterday at] HH:mm`);
    }
    // Format the date as "DD/MM/YYYY HH:mm" for other dates
    else {
        //return date.format(`DD/MM/YYYY HH:mm`);
        return date.format(`MMMM DD, YYYY - hh:mm`);
    }
}

function scrollToMessage(messageId) {
    var element = document.getElementById(messageId);
    if (!element) return;
    element.scrollIntoView();
}

function addMessage(data) {
    const messages = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    console.log(data, currentUser)
    messageDiv.className = (data.user_id != currentUser.user_id) ? "right-message" : "left-message";
    let typeMsg = (data.user_id != currentUser.user_id) ? "rightmsg" : "leftmsg";
    if (data.user_id == currentUser.user_id) {
        const pIcon = document.createElement("img");
        pIcon.src = getIcon(currentUser.avatar)
        const pDisplay = document.createElement("span");
        const bold = document.createElement("b");
        bold.innerText = currentUser.nickname;
        pDisplay.appendChild(bold)
        if (currentUser.verified) pDisplay.innerHTML += `<span class="material-symbols-rounded verified" style="font-size: 15px !important;" title="Verified Account">verified</span>`
        pIcon.className = "leftmsg-icon";
        pDisplay.className = "leftmsg-displayname";        
        messageDiv.appendChild(pIcon);
        messageDiv.appendChild(pDisplay);
        messageDiv.appendChild(document.createElement("br"))
    }
    const pContent = document.createElement("span");
    pContent.innerText = data.content;
    const pTimestamp = document.createElement("span");
    pTimestamp.innerText = formatTime(data.timestamp);
    /*
<div class="left-message">
                        <img class="leftmsg-icon" src="https://cdn.discordapp.com/attachments/809469073590190130/1055968281544106045/1b42c81038cddcd9c94e55767d022efc.png" alt="">
                        <span class="leftmsg-displayname"><b>Kartinmat</b><span class="material-symbols-rounded verified" style="font-size: 15px !important;">verified</span></span><br>
                        <span class="leftmsg-msg">Good. End your life.</span><br>
                        <span class="leftmsg-timestamp">timestamp</span>
                    </div>
    */
    pContent.className = `${typeMsg}-msg`;
    pTimestamp.className = `${typeMsg}-timestamp`;
    messageDiv.appendChild(pContent);
    messageDiv.appendChild(document.createElement("br"))
    messageDiv.appendChild(pTimestamp);
    messageDiv.id = `message-${data.id}`;
    messages.appendChild(messageDiv)
    scrollToMessage(`message-${data.id}`)
}

async function selectUser(userData, dontRemoveOld) {
    const getItem = document.getElementById(`user-item-${userData.user_id}`);
    if (!getItem) return alert("Couldn't find user item.");
    const messages = document.getElementById("messages");
    if (!messages) return alert("Couldn't find messages div.")
    messages.innerHTML = ""
    getItem.classList.add("selected")
    if (!dontRemoveOld) {
        const getOldItem = document.getElementById(`user-item-${currentUser.user_id}`);
        if (!getOldItem) return alert("Couldn't find old user item.");
        getOldItem.classList.remove("selected");
    }
    currentUser = userData;
    const userInfo = document.getElementById("user-info");
    if (!userInfo) return alert("Couldn't find user info.");
    userInfo.innerHTML = "";
    const pIcon = document.createElement("img");
    pIcon.src = getIcon(userData.avatar)
    const pDisplay = document.createElement("span");
    const bold = document.createElement("b");
    bold.innerText = userData.nickname;
    pDisplay.appendChild(bold)
    if (userData.verified) pDisplay.innerHTML += `<span class="material-symbols-rounded verified" style="font-size: 20px !important;" title="Verified Account">verified</span>`
    const pUsername = document.createElement("span");
    pUsername.innerText = `@${userData.username}`;

    pIcon.className = "userinfo-icon";
    pDisplay.className = "userinfo-displayname";
    pUsername.className = "userinfo-username";
        
    userInfo.appendChild(pIcon);
    userInfo.appendChild(document.createElement("br"))
    userInfo.appendChild(pDisplay);
    userInfo.appendChild(document.createElement("br"))
    userInfo.appendChild(pUsername);

    const profileBtns = document.createElement("div");
    profileBtns.className = "messages-profile-btns"
    profileBtns.innerHTML = `
    <span class="user-profile-btn" onclick="gotoProfile()"><span class="material-symbols-rounded ubtn-icon">person</span>profile</span>
    <span class="user-profile-btn" style="background-color: rgb(255, 91, 91);" onclick="removeFriend()"><span class="material-symbols-rounded ubtn-icon">person_remove</span>remove friend</span>
    <span class="user-profile-btn" style="background-color: rgb(255, 91, 91);" onclick="toggleBlock()"><span class="material-symbols-rounded ubtn-icon">block</span><a id="btn-block">block</a></span>
    `

    userInfo.appendChild(profileBtns)

    try {
        const getMessages = await axios({
            url: `${URI}/api/user/${currentUser.username}/messages`,
            method: "GET",
            headers: {
                "authorization": session
            }
        });
        getMessages.data.forEach(messageData => {
            addMessage(messageData)
        })
    } catch (e) {
        console.error(e)
        alert(e)
    }

}

async function initMsg() {
    checkAuth('home')
    const chatInput = document.getElementById("chat-input");
    if (!chatInput) alert("Cannot find chat-input element.")
    try {
        const getFriends = await axios({
            url: `${URI}/api/user/me/friends`,
            method: "GET",
            headers: {
                "authorization": session
            }
        });
        const latestMessages = await axios({
            url: `${URI}/api/user/me/messages/latest`,
            method: "GET",
            headers: {
                "authorization": session
            }
        });
        let friends = getFriends.data;
        const latestMessage = latestMessages.data;
        friends = friends.sort((a, b) => {
            const latestMsgA = latestMessage.find(msg => msg.user_id === a.user_id);
            const latestMsgB = latestMessage.find(msg => msg.user_id === b.user_id);
            if (!latestMsgA && !latestMsgB) return a.timestamp - b.timestamp;
            if (latestMsgA && !latestMsgB) return -1;
            if (!latestMsgA && latestMsgB) return 1;
            return latestMsgB.timestamp - latestMsgA.timestamp;
        });
        let sortedFriendsBefore = friends.map(friend => {
            const latestMsg = latestMessage.find(msg => msg.user_id === friend.user_id);
            return {
                ...friend,
                content: latestMsg ? latestMsg.content : null
            };
        });
        /*sortedFriends = [
            ...friends.filter(friend => latestMessage.find(msg => msg.user_id === friend.user_id)),
            ...friends.filter(friend => !latestMessage.find(msg => msg.user_id === friend.user_id))
        ];*/
        sortedFriends = [
            ...sortedFriendsBefore.filter(friend => friend.content !== null),
            ...sortedFriendsBefore.filter(friend => friend.content === null)
        ];
        
        generateList()
        chatInput.addEventListener("keydown", async function(event) {
            if (event.key === "Enter") {
                const value = event.target.value;
                if (socket) {
                    socket.emit("send_message", {
                        userId: currentUser.user_id,
                        content: value,
                        file: null
                    })
                    addMessage({ content: value, file: null, timestamp: Date.now() })
                    event.target.value = "";
                }
            }
        });
        socket.on("receive_message", data => {
            if (data.user_id == currentUser.user_id) {
                addMessage(data)
            } else {
                const lastMsg = document.getElementById(`lastmsg-${data.user_id}`)
                if (lastMsg) lastMsg.innerText = data.content;
            }
        })
    } catch (e) {
        console.error(e)
        alert(e)
    }
}
async function generateList() {
    const userList = document.getElementById("user-list");
    if (!userList) return alert("Couldn't find user-list.")
    sortedFriends.forEach(userData => {
        const item = document.createElement("div");
        item.className = "messages-list-item";
        item.id = `user-item-${userData.user_id}`;
        const pIcon = document.createElement("img");
        pIcon.src = getIcon(userData.avatar)
        const pDisplay = document.createElement("span");
        const bold = document.createElement("b");
        bold.innerText = userData.nickname;
        pDisplay.appendChild(bold)
        if (userData.verified) pDisplay.innerHTML += `<span class="material-symbols-rounded verified" style="font-size: 20px !important;" title="Verified Account">verified</span>`
        const pUsername = document.createElement("span");
        pUsername.innerText = `@${userData.username}`;
        

        pIcon.className = "messages-list-item-icon";
        pDisplay.className = "messages-list-item-displayname";
        pUsername.className = "messages-list-item-username";
        

        item.appendChild(pIcon);
        //item.appendChild(whitespace());
        item.appendChild(pDisplay);
        item.appendChild(document.createElement("br"))
        
        item.appendChild(pUsername);
        item.appendChild(document.createElement("br"))
        const pLastMsg = document.createElement("span");
        pLastMsg.className = "messages-list-item-lastmsg";
        pLastMsg.id = `lastmsg-${userData.user_id}`
        pLastMsg.innerText = (userData.content == null) ? "No recent message sent yet." : userData.content;
        item.appendChild(pLastMsg);
        item.onclick = function() {
            selectUser(userData, false);
        }
        userList.appendChild(item)
    });
    selectUser(sortedFriends[0], true)
}
