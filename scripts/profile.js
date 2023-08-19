let currentUser = {
    "user_id": -1,
    "username": "",
    "nickname": "",
    "avatar": "",
    "verified": 0,
    "createdIn": 0,
    "status": 0,
    "bio": "",
    "sentRequest": true
}
function escapeHTML(str){
    return new Option(str).innerHTML;
}
const markdownRegex = {
    bold: /\*\*(.*?)\*\*/gim,
    italics: /\*(.*?)\*/gim,
    strikethrough: /\~\~(.*?)\~\~/gim,
    underline: /\_\_(.*?)\_\_/gim,
    ping: /\@(.*)/gim,
    link: /^(https?|ftp):\/\/[^\s$.?#].[^\s]*$/gim
};

function parseMarkdown(text) {
    return text.replace(markdownRegex.link, (link) => {
        if (markdownRegex.link.test(link)) {
            const a = document.createElement("a");
            a.href = link;
            a.innerText = link;
            a.target = "_blank";
            return a.outerHTML;
        } else {
            return link;
        }
    }).replace(markdownRegex.bold, '<strong>$1</strong>')
    .replace(markdownRegex.italics, '<i>$1</i>')
    .replace(markdownRegex.strikethrough, '<del>$1</del>')
    .replace(markdownRegex.underline, '<ins>$1</ins>')
    .replace(markdownRegex.ping, (user) => {
        if (markdownRegex.ping.test(user)) {
            const a = document.createElement("a");
            a.href = ((URI == "https://khajiitlifesupport.glitch.me") ? `/khajtk/` : '/') + `g/${user.replace("@", "")}`;
            a.innerText = user;
            a.target = "_blank";
            return a.outerHTML;
        } else {
            return link;
        }
    }).trim()
}
let currentPosts = [];
let overlayBg = null;
let popupShown = false;
function createPopup(title, func, elements) {
    const popup = document.getElementById("popup");
    popup.innerHTML = `<div class="popup-bg"></div>
    <div class="post-creation">
        <span class="material-symbols-rounded closebtn" onclick="${func}">close</span>
        <span class="post-creation-title">${title}</span><br>
        ${elements}
    </div>`
    popupShown = !popupShown;
}
window.addEventListener("beforeunload", (event) => {
    if (popupShown) {
      event.preventDefault();
      event.returnValue = "";
    }
});
function toggleFlagPopup(id) {
    createPopup("Flag post", "toggleFlagPopup()", `<textarea name="" id="flagreason" autocomplete="off" placeholder="Reason"></textarea>
    <span class="charcount" id="postcharcount">450</span>
    <br><br><br>
    <button class="post-btn" onclick="flagPost(${id}, true)">flag</button>`);
    const popup = document.getElementById("popup");
    const charCount = document.getElementById("postcharcount")
    const flagReason = document.getElementById("flagreason")
    const flagCharLimit = 250
    if (flagReason && charCount) {
        flagReason.oninput = () => {
            charCount.innerText = flagCharLimit - flagReason.value.length
            if (flagReason.value.length >= (flagCharLimit - 50)) {
                charCount.style.color = "red"
            } else if (flagReason.value.length >= (flagCharLimit - 100)) {
                charCount.style.color = "orange"
            } else {
                charCount.style.color = ""
            }
        }
    }
    popup.hidden = !popup.hidden;
    overlayBg.hidden = !overlayBg.hidden;
}

function togglePostPopup(isUser) {
    createPopup("Make a post", "togglePostPopup()", `<textarea name="" id="postcontent" autocomplete="off"></textarea>
    <span class="charcount" id="postcharcount">450</span>
    <div class="attachments-input">
        <label for="attachment-url">attachment url</label><br>
        <input type="text" name="attachment-url" id="postattachurl" autocomplete="off" onclick="showAttCfg()"><br><br>
    </div>
    <div class="attachments-config" id="attachments-config" hidden>
        <img width="150" height="150" id="postattachimg"><br>
        <label for="flagbtn">flag</label>
        <input type="checkbox" name="flagbtn" id="postflag" autocomplete="off"><br>
        <label for="flagreason">reason</label><br>
        <input type="text" name="flagreason" id="postfreason" autocomplete="off"><br>
    </div>
    <br><br><br>
    <button class="post-btn" onclick="createPost('${isUser ? 'user' : 'home'}')">post</button>`);
    const popup = document.getElementById("popup");
    const attachmentsConfig = document.getElementById("attachments-config");
    const postContent = document.getElementById("postcontent")
    if (postContent) {
        const postAttachment = document.getElementById("postattachimg")
        const attachmentURL = document.getElementById("postattachurl")
        attachmentURL.onchange = function () {
            if (attachmentURL.value.length && (attachmentURL.value.startsWith("http://") || attachmentURL.value.startsWith("https://"))) {
                postAttachment.src = `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(attachmentURL.value)}`
            }
        }

        const charCount = document.getElementById("postcharcount")
        if (charCount) {
            postContent.oninput = () => {
                charCount.innerText = charLimit - postContent.value.length
                if (postContent.value.length >= (charLimit - 50)) {
                    charCount.style.color = "red"
                } else if (postContent.value.length >= (charLimit - 100)) {
                    charCount.style.color = "orange"
                } else {
                    charCount.style.color = ""
                }
            }
        }
    }
    attachmentsConfig.hidden = true;
    popup.hidden = !popup.hidden;
    overlayBg.hidden = !overlayBg.hidden;
}

function showAttCfg() {
    const attachmentsConfig = document.getElementById("attachments-config");
    attachmentsConfig.hidden = false;
}

const charLimit = 450;

async function flagPost(id, flagOrUnflag = true) {
    let flagReason = document.getElementById("flagreason")
    if (!flagReason) flagReason = {
        value: "No reason provided."
    }
    try {
        await axios({
            url: `${URI}/api/posts/${id}/${flagOrUnflag ? "flag" : "unflag"}`,
            method: "POST",
            headers: {
                "authorization": session
            },
            data: {
                reason: flagReason.value
            },
            timeout: 5000
        });
        popupShown = false;
        window.location.reload();
    } catch (error) {
        console.error(error)
        alert(error.response.data)
    }
}

async function createPost(page, reply) { // i will never know why i had this "reply" parameter
    const content = document.getElementById("postcontent");
    const file = document.getElementById("postattachurl");
    const flag = document.getElementById("postflag");
    const reason = document.getElementById("postfreason");
    if (!content || !file || !flag || !reason) return alert("couldn't find elements, you broke something")
    if (!content.value.length) return alert("You need to enter something in.")
    if (content.value.length > charLimit) return;
    try {
        let data = {
            content: content.value
        }
        if (file.value.length) {
            data.file = file.value
            if (flag.checked) {
                data.flag = 1;
                data.reason = (reason.value.length) ? reason.value : "No reason provided.";
            }
        }
        if (page != "home") {
            data.user_id = currentUser.user_id;
        }
        if (!isNaN(parseInt(page))) {
            await axios({
                url: `${URI}/api/posts/${parseInt(page)}`,
                method: "POST",
                headers: {
                    "authorization": session
                },
                data,
                timeout: 5000
            });
        } else {
            await axios({
                url: `${URI}/api/posts/create`,
                method: "POST",
                headers: {
                    "authorization": session
                },
                data,
                timeout: 5000
            });
        }
        popupShown = false;
        window.location.reload()
    } catch (error) {
        console.error(error)
        alert(error.response.data)
    }
}


async function initNav() {
    const friendReqs = document.getElementById("navbar-reqs");
    const msgCount = document.getElementById("navbar-msgs");
    if (!friendReqs) return;
    if (!msgCount) return;
    if (overlayBg == null) {
        /*socket.on('refresh_notifs', () => {
            initNav();
        })*/
        // stop kruma from doing that
    }
    overlayBg = document.getElementById("showoverlay");
    try {
        const friendReqData = await axios({
            url: `${URI}/api/user/me/requests`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        const msgCountData = await axios({
            url: `${URI}/api/user/me/messages/count`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        const f_count = friendReqData.data;
        const m_count = msgCountData.data;
        if (f_count.length > 0) {
            friendReqs.innerText = f_count.length > 99 ? '99+' : f_count.length;
            friendReqs.style = ""
        }
        if (m_count.count > 0) {
            msgCount.innerText = m_count.count > 99 ? '99+' : m_count.count;
            msgCount.style = ""
        }
    } catch (error) {
        console.error(error)
    }
}

async function initProfile() {
    checkAuth('home')
    initNav()
    const profileTable = document.getElementById('profile-table')
    if (!profileTable) window.location.href = "https://khajt.nyaco.tk/";
    
    try {
        const userName = location.pathname.split("/")[2];
        const getUserData = await axios({
            url: `${URI}/api/user/${userName}`,
            method: "GET",
            headers: {
                "authorization": session
            }
        });
        document.title = `khaj//t @${userName}`
        currentUser = getUserData.data;
        profile(getUserData.data)
        initPosts(userName)
        const postBtn = document.getElementById("postbtn")
        if (!currentUser.friends) {
            console.log(!currentUser.me && !currentUser.friends)
            postBtn.style.display = "none";
        }
        profileTable.hidden = false;
    } catch (e) {
        console.error(e)
        if (e.response && e.response.status == 404) {
            document.title = `khaj//t - 404`
            profileTable.innerHTML = "<h1>Profile not found.</h1>"
        } else {
            document.title = `Error!`
            profileTable.innerHTML = "<h1>An error occured.</h1>"
        }
        profileTable.hidden = false;
    }
}
let editing = false;
async function initHomePosts() {
    let currentPageNum = 1;
    let totalPosts = 0;
    let isLoading = false;
    let maxPosts = 20;
    async function fetchPosts() {
        if (isLoading) return;
        isLoading = true;
        try {
            const getPostsData = await axios({
                url: `${URI}/api/posts/all?page=${currentPageNum}`,
                method: "GET",
                headers: {
                    "authorization": session
                },
                timeout: 5000
            });
            posts(getPostsData.data.posts);
            totalPosts = getPostsData.data.total;
            currentPageNum++;
            if (currentPageNum > Math.ceil(totalPosts / maxPosts)) {
                window.removeEventListener('scroll', fetchPosts);
            }
            isLoading = false;
        } catch (error) {
            console.error(error)
            alert("Something went wrong when trying to get the posts\nPlease report this.")
            isLoading = false;
        }
    }
    fetchPosts().then(() => {
        window.addEventListener('scroll', async () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const bodyHeight = document.body.offsetHeight;
            console.log(!isLoading, scrollPosition, bodyHeight - 100, currentPageNum, Math.ceil(totalPosts / maxPosts))
    
            if (!isLoading && scrollPosition >= bodyHeight - 100 && currentPageNum <= Math.ceil(totalPosts / maxPosts)) {
                await fetchPosts()
            }
            /*if (window.innerHeight + window.scrollY >= (document.body.offsetHeight - 100)) {
                fetchPosts();
            }*/
        });
    })
    
    
}

async function initPosts(userId) {
    try {
        const getPostsData = await axios({
            url: `${URI}/api/user/${userId}/posts`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        currentPosts = getPostsData.data.sort((b, a) => Number(a.pinned) - Number(b.pinned))
        posts(getPostsData.data);
    } catch (error) {
        if (error.response.status == 403) {
            document.getElementById("blocked").hidden = false;
        } else {
            console.error(error)
            alert("Something went wrong when trying to get your own user data.\nPlease report this.")
        }
    }
}
async function initHome() {
    checkAuth('home')
    initNav()
    try {
        const getUserData = await axios({
            url: `${URI}/api/user/me`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        currentUser = getUserData.data;
        currentUser.me = true;
        currentUser.home = true;
        initHomePosts()
        profile(getUserData.data)
    } catch (error) {
        console.error(error)
        alert("Something went wrong when trying to get your own user data.\nPlease report this.")
    }
}
async function initMyProfile() {
    checkAuth('home')
    initNav()
    try {
        const getUserData = await axios({
            url: `${URI}/api/user/me`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        currentUser = getUserData.data;
        currentUser.me = true;
        initPosts(currentUser.username)
        profile(getUserData.data)
    } catch (error) {
        console.error(error)
        alert("Something went wrong when trying to get your own user data.\nPlease report this.")
    }
}

async function sendFriendReq() {
    try {
        await axios({
            url: `${URI}/api/user/${currentUser.username}/friend`,
            method: "POST",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        alert("You have sent a friend request to that user!")
        window.location.reload();
    } catch (error) {
        console.error(error)
        alert(error.response.data)
    }
}


async function removeFriend() {
    try {
        await axios({
            url: `${URI}/api/user/${currentUser.username}/friend`,
            method: "DELETE",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        alert("You are no longer friends with that user!")
        window.location.reload();
    } catch (error) {
        console.error(error)
        alert(error.response.data)
    }
}
async function PostAPIReload(id, endpoint) {
    try {
        await axios({
            url: `${URI}/api/posts/${id}/${endpoint}`,
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

async function toggleBlock() {
    let method = "POST"
    if (currentUser.didIblock) method = "DELETE";
    try {
        await axios({
            url: `${URI}/api/user/${currentUser.username}/block`,
            method: method,
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        alert(`Successfully ${currentUser.didIblock ? "un" : ""}blocked the user!`)
        if (!currentUser.didIblock) {
            window.location.href = "https://khajt.nyaco.tk/home"
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error(error)
        alert(error.response.data)
    }
}

async function editSetting(name, id) {
    const element = document.getElementById(id);
    if (!element) throw new ReferenceError("Cannot find element");
    console.log(name, element.value)
    try {
        await axios({
            url: `${URI}/api/user/me/settings`,
            method: "POST",
            headers: {
                "authorization": session
            },
            data: {
                name,
                value: element.value
            },
            timeout: 5000
        });
        //window.location.reload()
    } catch (error) {
        console.error(error)
        alert(error.response.data)
    }
}

let pressedEdit = false;
let editedChanges = false;
function toggleEditing() {
    editing = !editing;
    const profileView = document.getElementById("profile-view")
    const editingView = document.getElementById("edit-view")
    if (editing) {
        profileView.hidden = true;
        editingView.hidden = false;
        const nickname = document.getElementById("edit-nick")
        const username = document.getElementById("edit-name")
        const avatar = document.getElementById("e-icon")
        if (!pressedEdit) {
            const avatarIcon = document.getElementById("edit-icon")
            pressedEdit = true;
            avatar.onchange = function () {
                editedChanges = true;
                if (avatar.value.length && (avatar.value.startsWith("http://") || avatar.value.startsWith("https://"))) {
                    //imgPreview.src = `${URL}/external?url=${encodeURIComponent(urlCheck.value)}`;;
                    // too much requests loll glitch doesnt like that
                    avatarIcon.src = `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(avatar.value)}`
                    // yeah i think duckduckgo wont mind that too much
                }
            }
            username.onchange = function () {
                editedChanges = true;
            }
            nickname.onchange = function () {
                editedChanges = true;
            }
            bio.onchange = function () {
                editedChanges = true;
            }
            banner.onchange = function () {
                editedChanges = true;
            }
        }
        const bio = document.getElementById("edit-bio")
        const banner = document.getElementById("edit-banner")
        nickname.placeholder = currentUser.nickname;
        username.placeholder = `@${currentUser.username}`;
        avatar.placeholder = (currentUser.avatar == "" || currentUser.avatar == null) ? "avatar" : currentUser.avatar;
        bio.placeholder = (currentUser.bio != "") ? currentUser.bio : "Bio";
        banner.placeholder = (currentUser.banner == null) ? "banner" : currentUser.banner;
    } else {
        if (editedChanges) window.location.reload();
        profileView.hidden = false;
        editingView.hidden = true;
    }
}

let hasCalledRefresh = false;
function refreshingPosts() {
    if (hasCalledRefresh) return;
    hasCalledRefresh = true;
    if (currentUser.home && socket) {
        socket.on('create_post', (postData) => {
            posts([postData], true);
        })
    }
}

// Types
// 0 - Normal Post
// 1 - Own Post
// 2 - Saved Post
// 3 - Reply Post
function genPostItem(postData, type, reply) {
    refreshingPosts()
    function gotoPost() { // this function was meant to be for #post-1, #post-2, etc. But I decided not to do that

    }

    // TODO: add an onclick for clicking on div to redirect to post
    if (postData.user_id != currentUser.user_id && ![2, 3].includes(type)) type = 0;
    const div = document.createElement('div');
    div.classList.add("profile-table-post")
    div.id = `profile-post-${postData.ID}`
    if (!reply) {
        div.onmouseover = function(e) {
            console.log(e.target.id)
            document.body.style.cursor = (e.target.id == `profile-post-${postData.ID}`) ? "pointer" : "initial"
        }
        div.onmouseleave = function(e) {
            if ([`profile-post-${postData.ID}`].includes(e.target.id)) {
                document.body.style.cursor = "initial";
            }
            
        }
        div.onclick = function(e) {
            if ([`profile-post-${postData.ID}`].includes(e.target.id)) {
                //alert("click")
                window.location.href = `https://khajt.nyaco.tk/post/${postData.ID}`
            }
        }
    }
    
    const moreBtnDiv = document.createElement('div');
    moreBtnDiv.classList.add("profile-table-post-more")
    moreBtnDiv.innerHTML = `<span class="material-symbols-rounded m">more_horiz</span>`;
    const moreBtnView = document.createElement('div');
    moreBtnView.classList.add("profile-table-post-more-list")
    moreBtnView.id = `more-btn-view-${postData.ID}`
    moreBtnView.hidden = true;
    moreBtnDiv.onclick = function() {
        const element = document.getElementById(`more-btn-view-${postData.ID}`);
        if (element) element.hidden = !element.hidden
    }
    if (type != 2) {
        const bookmarkBtn = document.createElement("div");
        bookmarkBtn.className = "list-item";
        bookmarkBtn.innerHTML = `<span><span class="material-symbols-rounded listbtn">bookmark</span>save post</span>`
        bookmarkBtn.onclick = async function() {
            try {
                await axios({
                    url: `${URI}/api/posts/${postData.ID}/save`,
                    method: "POST",
                    headers: {
                        "authorization": session
                    },
                    timeout: 5000
                });
                alert("Successfully saved this post.");
            } catch (error) {
                console.error(error)
                alert(error.response.data)
            }
        }
        if (!postData.saved) moreBtnView.appendChild(bookmarkBtn);
        if (type == 3) {
            moreBtnView.style.right = "20.5vw";
        }
        if (currentUser.user_id != -1 && (postData.user_id == currentUser.user_id && currentUser.me) || (postData.user_id != currentUser.user_id && !currentUser.me)) {            
            if (type == 1) {
                if (!postData.pinned) {
                    const pinBtn = document.createElement("div");
                    pinBtn.className = "list-item";
                    pinBtn.innerHTML = `<span><span class="material-symbols-rounded listbtn">push_pin</span>pin post</span>`
                    pinBtn.onclick = function() {
                        PostAPIReload(postData.ID, "pin")
                    }
                    moreBtnView.appendChild(pinBtn);
                } else {
                    const unpinBtn = document.createElement("div");
                    unpinBtn.className = "list-item red";
                    unpinBtn.innerHTML = `<span><span class="material-symbols-rounded listbtn">push_pin</span>unpin post</span>`
                    unpinBtn.onclick = function() {
                        PostAPIReload(postData.ID, "unpin")
                    }
                    moreBtnView.appendChild(unpinBtn);
                }
            }
            const flagBtn = document.createElement("div");
            flagBtn.className = "list-item red";
            flagBtn.innerHTML = `<span><span class="material-symbols-rounded listbtn">flag</span>${(postData.flag == 0) ? "flag post" : "unflag post"}</span>`
            if (postData.flag == 1) {
                flagBtn.onclick = function() {
                    flagPost(postData.ID, false)
                }
            } else {
                flagBtn.onclick = function() {
                    toggleFlagPopup(postData.ID)
                }
            }
            const removeBtn = document.createElement("div");
            removeBtn.className = "list-item red";
            removeBtn.innerHTML = `<span><span class="material-symbols-rounded listbtn">delete</span>remove post</span>`
            removeBtn.onclick = async function() {
                try {
                    await axios({
                        url: `${URI}/api/posts/${postData.ID}`,
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
            moreBtnView.appendChild(flagBtn);
            moreBtnView.appendChild(removeBtn);
        }
    } else {
        moreBtnView.style.right = "28vw";
        const unbookmarkBtn = document.createElement("div");
        unbookmarkBtn.className = "list-item red";
        unbookmarkBtn.innerHTML = `<span><span class="material-symbols-rounded listbtn">delete</span>unsave post</span>`
        unbookmarkBtn.onclick = function() {
            PostAPIReload(postData.ID, "unsave")
        }
        moreBtnView.appendChild(unbookmarkBtn)
    }
    moreBtnDiv.appendChild(moreBtnView);

    div.appendChild(moreBtnDiv);
    if (type != 2 && postData.pinned) {
        //<span class="pin-info"><span class="material-symbols-rounded pin">push_pin</span>pinned post</span><br>
        const pinSpan = document.createElement('span');
        pinSpan.classList.add("pin-info");
        pinSpan.innerHTML = `<span class="material-symbols-rounded pin">push_pin</span>pinned post`
        div.appendChild(pinSpan);
        div.appendChild(document.createElement("br"));
    }
    const pIcon = document.createElement('img');
    pIcon.loading = "lazy";
    pIcon.classList.add("profile-table-post-usericon")
    pIcon.src = getIcon(postData.avatar)
    const pIconClick = document.createElement('a');
    pIconClick.href = `https://khajt.nyaco.tk/g/${postData.username}`
    pIconClick.appendChild(pIcon)
    div.appendChild(pIconClick);

    const pDisplay = document.createElement("span")
    pDisplay.classList.add("profile-table-post-displayname")
    pDisplay.innerText = postData.nickname;
    if (postData.verified) pDisplay.innerHTML += `<span class="material-symbols-rounded verified" title="Verified Account">verified</span>`
    const pDisplayClick = document.createElement('a');
    pDisplayClick.href = `https://khajt.nyaco.tk/g/${postData.username}`
    pDisplayClick.appendChild(pDisplay)

    div.appendChild(pDisplayClick);
    div.appendChild(document.createElement('br'));

    const pUser = document.createElement("span")
    pUser.classList.add("profile-table-post-username")
    pUser.innerText = `@${postData.username}`;
    const pUserClick = document.createElement('a');
    pUserClick.href = `https://khajt.nyaco.tk/g/${postData.username}`
    pUserClick.appendChild(pUser)

    div.appendChild(pUserClick);
    div.appendChild(document.createElement('br'));

    if (postData.replyTo != -1) {
        const postExtra = document.createElement('span');
        postExtra.classList.add('profile-table-post-extra');
        if (postData.postState == 1) { // posting on profile
            // TODO: test this later, remove when done and successful
            //<span class="profile-table-post-extra">posted on <span class="extra-username">@nefarkitti</span>'s profile</span>
            postExtra.innerText = "posted on ";
            // mainly this
            const extraUser = document.createElement('span');
            extraUser.classList.add("extra-username")
            extraUser.innerText = `@${postData.replyUsername}`
            postExtra.appendChild(extraUser)

            postExtra.innerHTML += "'s profile";
            
        }
        div.appendChild(postExtra);
    }
    const content = document.createElement('span');
    content.classList.add("profile-table-post-contents");
    const splitContent = postData.content.split("\n")
    content.innerHTML = splitContent.map(line => parseMarkdown(escapeHTML(line))).join("<br>");//postData.content;
    div.appendChild(content);

    if (typeof postData.file == "string" && postData.file.length > 0) {
        const attachmentDiv = document.createElement('div');
        attachmentDiv.id = `profile-post-${postData.ID}`
        attachmentDiv.classList.add("profile-table-post-attachments");
        const attachmentImg = document.createElement('img');
        attachmentImg.loading = "lazy"
        attachmentImg.src = getIcon(postData.file)
        attachmentImg.alt = "Attachment";
        attachmentDiv.appendChild(attachmentImg);
        if (postData.flag == 1) {
            const contentWarning = document.createElement('div');
            contentWarning.id = `content-warning-${postData.ID}`
            contentWarning.classList.add("content-warning");
            const container = document.createElement('div');
            container.classList.add("container");
            container.innerHTML = `<span class="material-symbols-rounded">warning</span><br><span>This content has been flagged.</span><br>`;
            /**
             <!--<div class="content-warning">
                                    <div class="container">
                                        <span class="material-symbols-rounded">warning</span><br>
                                        <span>This content has been flagged.</span><br>
                                        <span>"IT IS POOORN !!"</span>
                                        <button>view</button>
                                    </div>
                                </div>-->
             */
            const reason = document.createElement("span");
            reason.innerText = `"${(postData.flag_reason.length) ? postData.flag_reason : "No reason provided."}"`;
            container.appendChild(reason);
            const viewButton = document.createElement("button");
            viewButton.innerText = "View"
            viewButton.onclick = () => {
                const getWarning = document.getElementById(`content-warning-${postData.ID}`);
                getWarning.style.display = 'none';
            }
            container.appendChild(viewButton);
            contentWarning.appendChild(container);
            attachmentDiv.appendChild(contentWarning)
        }
        div.appendChild(attachmentDiv);
    }
    div.appendChild(document.createElement('hr'));
    const postBtns = document.createElement('div');
    postBtns.classList.add("profile-table-post-btns");
    let liked = false;
    let disliked = false;
    if (postData.gaveRating) {
        liked = (postData.gaveRating == "likes")
        disliked = (postData.gaveRating == "dislikes")
    }
    const likeBtn = document.createElement('span');
    likeBtn.classList.add("profile-post-btn")
    if (liked && !disliked) likeBtn.classList.add("liked")
    likeBtn.innerHTML = `<span class="material-symbols-rounded btn-icon${(liked && !disliked) ? " liked" : ""}">thumb_up</span>${encodeURIComponent(abbreviateNumber(postData.likes))}`
    likeBtn.title = (postData.likes > 999) ? `${postData.likes} likes` : ""

    likeBtn.onclick = async function() {
        try {
            await axios({
                url: `${URI}/api/posts/${postData.ID}/rate`,
                method: "POST",
                headers: {
                    "authorization": session
                },
                data: {
                    type: "like"
                },
                timeout: 5000
            });
            if (disliked && postData.dislikes > 0) postData.dislikes--;
            if (!liked) {
                liked = true;
                disliked = false;
                postData.likes++;
            } else {
                liked = false;
                disliked = false;
                if (postData.likes > 0) postData.likes--;
            }
            updateRating(postData);
        } catch (error) {
            console.error(error)
            alert(error.response.data)
        }
    }

    const dislikeBtn = document.createElement('span');
    dislikeBtn.classList.add("profile-post-btn")
    dislikeBtn.innerHTML = `<span class="material-symbols-rounded btn-icon${(!liked && disliked) ? " liked" : ""}">thumb_down</span>${encodeURIComponent(abbreviateNumber(postData.dislikes))}`
    dislikeBtn.title = (postData.dislikes > 999) ? `${postData.dislikes} dislikes` : ""
    if (!liked && disliked) dislikeBtn.classList.add("liked")
    dislikeBtn.onclick = async function() {
        try {
            await axios({
                url: `${URI}/api/posts/${postData.ID}/rate`,
                method: "POST",
                headers: {
                    "authorization": session
                },
                data: {
                    type: "dislike"
                },
                timeout: 5000
            });
            if (liked && postData.likes > 0) postData.likes--;
            if (!disliked) {
                liked = false;
                disliked = true;
                postData.dislikes++;
            } else {
                disliked = false;
                liked = false;
                if (postData.dislikes > 0) postData.dislikes--;
            }
            updateRating(postData);
        } catch (error) {
            console.error(error)
            alert(error.response.data)
        }
    }

    function updateRating(newPostData) {
        likeBtn.innerHTML = `<span class="material-symbols-rounded btn-icon${(liked) ? " liked" : ""}">thumb_up</span>${encodeURIComponent(abbreviateNumber(newPostData.likes))}`
        likeBtn.title = (newPostData.likes > 999) ? `${newPostData.likes} likes` : ""
        dislikeBtn.innerHTML = `<span class="material-symbols-rounded btn-icon${(disliked) ? " liked" : ""}">thumb_down</span>${encodeURIComponent(abbreviateNumber(newPostData.dislikes))}`
        dislikeBtn.title = (newPostData.dislikes > 999) ? `${newPostData.dislikes} dislikes` : ""
        likeBtn.classList.remove("liked")
        dislikeBtn.classList.remove("liked")
        if (liked && !disliked) {
            likeBtn.classList.add("liked")
            
        } else if (disliked && !liked) {
            dislikeBtn.classList.add("liked")
        }
    }

    const replyBtn = document.createElement('span');
    replyBtn.classList.add("profile-post-btn")
    replyBtn.innerHTML = `<span class="material-symbols-rounded btn-icon">chat</span>${encodeURIComponent(abbreviateNumber(postData.replyCount))}`
    replyBtn.title = (postData.replyCount > 999) ? `${postData.replyCount} replies` : ""
    const shareBtn = document.createElement('span');
    shareBtn.classList.add("profile-post-btn")
    shareBtn.innerHTML = `<span class="material-symbols-rounded btn-icon">share</span>share`
    shareBtn.onclick = function() {
        navigator.clipboard.writeText(`${window.location.origin}/post/${postData.ID}`);
    }

    postBtns.appendChild(likeBtn);
    postBtns.appendChild(whitespace());

    postBtns.appendChild(dislikeBtn);
    postBtns.appendChild(whitespace());

    postBtns.appendChild(replyBtn);
    postBtns.appendChild(whitespace());

    postBtns.appendChild(shareBtn);
    postBtns.appendChild(whitespace());

    div.appendChild(postBtns);
    const timestamp = document.createElement('span');
    timestamp.classList.add("timestamp");
    //timestamp.innerText = moment(postData.timestamp).format("MMM DD");
    // chatgpt:
    function formatTimestamp(timestamp) {
  const momentObj = moment(timestamp);
  const diff = moment().diff(momentObj, 'seconds');
  if (diff < 60) {
    return `${diff}s`;
  } else if (diff < 60 * 60) {
    return `${moment().diff(momentObj, 'minutes')}m`;
  } else {
    return momentObj.format('MMM D, YYYY');
  }
}
    // ugly because github pasting


    timestamp.innerText = formatTimestamp(moment(postData.timestamp))
    
    timestamp.title = moment(postData.timestamp).format("MMMM DD, YYYY - hh:mm:ss");
    div.appendChild(timestamp);

    div.appendChild(document.createElement("br"));
    // TODO: add later where it uh checks if its in the profile page or in post page
    /*
    <div class="profile-table-post-friendreplies">
                                <span>friends replied:</span><br>
                                <div class="profile-table-post-friendreplies-reply">
                                    <img class="profile-table-friendreplies-usericon" src="https://cdn.discordapp.com/emojis/800712392722874378.webp?size=96&quality=lossless" alt="">
                                    <span class="profile-table-friendreplies-displayname">Firee<span class="material-symbols-rounded verified">verified</span></span>
                                    <span class="profile-table-friendreplies-contents">I totally agree with this statement. You should kill yourself, rather hastily even. Because why not? It'll help everyone.</span>
                                </div>
                                <div class="profile-table-post-friendreplies-reply">
                                    <img class="profile-table-friendreplies-usericon" src="https://cdn.discordapp.com/attachments/809469073590190130/1055968281544106045/1b42c81038cddcd9c94e55767d022efc.png" alt="">
                                    <span class="profile-table-friendreplies-displayname">Kartinmat</span>
                                    <span class="profile-table-friendreplies-contents">What Firee said, you should do it now while you still have the chance.</span>
                                </div>
                            </div>

    <div class="profile-table-post-friendreplies">
                            <div class="profile-table-post-friendreplies-reply">                                
                                <img class="profile-table-friendreplies-usericon" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.discordapp.net%2Fattachments%2F1065032648797470872%2F1074084265693806712%2F652DAAA3-8EFA-48E8-A5A1-0759A5373354.gif">
                                <span class="profile-table-friendreplies-displayname">Firee<span class="material-symbols-rounded verified" title="Verified Account">verified</span></span>
                                <span class="profile-table-friendreplies-contents">a reply hA</span>
                                </div>
                                <div class="profile-table-post-friendreplies-reply"><a href="/g/Firee"><img class="profile-table-friendreplies-usericon" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.discordapp.net%2Fattachments%2F1065032648797470872%2F1074084265693806712%2F652DAAA3-8EFA-48E8-A5A1-0759A5373354.gif"></a>&nbsp;<a href="/g/Firee"><span class="profile-table-friendreplies-displayname">Firee<span class="material-symbols-rounded verified" title="Verified Account">verified</span></span></a>&nbsp;<span class="profile-table-friendreplies-contents">yes this is indeed a joinker</span></div></div>

     */ 

    const repliesDiv = document.createElement("div");
    repliesDiv.classList.add("profile-table-post-friendreplies");
    postData.replies.forEach(replyData => {
        const replyDiv = document.createElement("div");
        replyDiv.classList.add("profile-table-post-friendreplies-reply")
        const pIcon = document.createElement('img');
        pIcon.loading = "lazy";
        pIcon.classList.add("profile-table-friendreplies-usericon")
        pIcon.src = getIcon(replyData.avatar)
        const pIconClick = document.createElement('a');
        pIconClick.href = `https://khajt.nyaco.tk/g/${replyData.username}`
        pIconClick.appendChild(pIcon);
        replyDiv.appendChild(pIconClick);
        const pDisplay = document.createElement("span")
        pDisplay.classList.add("profile-table-friendreplies-displayname")
        pDisplay.innerText = replyData.nickname;
        if (replyData.verified) pDisplay.innerHTML += `<span class="material-symbols-rounded verified" title="Verified Account">verified</span>`
        const pDisplayClick = document.createElement('a');
        pDisplayClick.href = `https://khajt.nyaco.tk/g/${replyData.username}`
        pDisplayClick.appendChild(pDisplay)
        replyDiv.appendChild(whitespace());
        replyDiv.appendChild(pDisplayClick);

        const content = document.createElement('span');
        content.classList.add("profile-table-friendreplies-contents");
        const splitContent = replyData.content.split("\n")
        content.innerHTML = splitContent.map(line => parseMarkdown(escapeHTML(line))).join("<br>");//replyData.content;
        replyDiv.appendChild(whitespace());
        if (replyData.file != null && replyData.file.length > 0) content.innerHTML += ` <span class="material-symbols-rounded pin">imagesmode</span>`;
        replyDiv.appendChild(content);
        repliesDiv.appendChild(replyDiv)
        repliesDiv.appendChild(document.createElement("br"));
    })
    div.appendChild(repliesDiv)
    return div;

/*
<div class="profile-table-post">
                            <div class="profile-table-post-more">
                                <span class="material-symbols-rounded m">more_horiz</span>
                                <div class="profile-table-post-more-list" hidden>
                                    <div class="list-item"><span><span class="material-symbols-rounded listbtn">push_pin</span>pin post</span></div>
                                    <div class="list-item red"><span><span class="material-symbols-rounded listbtn">flag</span>flag post</span></div>
                                    <div class="list-item red"><span><span class="material-symbols-rounded listbtn">delete</span>remove post</span></div>
                                </div>
                            </div>
                            <img class="profile-table-post-usericon" src="https://cdn.discordapp.com/attachments/841238402548498433/1035597808201375815/GreenF.jpeg" alt="">
                            <span class="profile-table-post-displayname">nefarkitti<span class="material-symbols-rounded verified">verified</span></span><br>
                            <span class="profile-table-post-username">@nefarkitti</span><br>
                            <span class="profile-table-post-contents">THIS IS WHY I REALLY HATE UOU PEOPLE YOU SEE IM GOING TO GO INSANE BECAUSE OF ALL OF YOU</span>
                            <hr>
                            <div class="profile-table-post-btns">
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">thumb_up</span>0</span>
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">thumb_down</span>0</span>
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">chat</span>0</span>
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">read_more</span>open post</span>
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">share</span>share</span>
                            </div>
                            <span class="timestamp">Dec 21</span>
                        </div>
*/


    /*
<div class="profile-table-post">
                            <div class="profile-table-post-more">
                                <span class="material-symbols-rounded m">more_horiz</span>
                                <div class="profile-table-post-more-list" hidden>
                                    <div class="list-item"><span><span class="material-symbols-rounded listbtn">push_pin</span>pin post</span></div>
                                    <div class="list-item red"><span><span class="material-symbols-rounded listbtn">flag</span>flag post</span></div>
                                    <div class="list-item red"><span><span class="material-symbols-rounded listbtn">delete</span>remove post</span></div>
                                </div>
                            </div>
                            <img class="profile-table-post-usericon" src="https://cdn.discordapp.com/attachments/841238402548498433/1035597808201375815/GreenF.jpeg" alt="">
                             <span class="profile-table-post-displayname">Kartinmat</span><br>
                            <span class="profile-table-post-username">@mmmmmonster</span><br>
                            <span class="profile-table-post-contents">You will repent for your sins L + Ratio + Plundered + No bitches</span>
                            <span class="profile-table-post-extra">posted on <span class="extra-username">@nefarkitti</span>'s profile</span>
                            <hr>
                            <div class="profile-table-post-attachments">
                                <img class="" src="https://cdn.discordapp.com/attachments/830022189897744384/1055596187157270578/IMG_20221222_212210884.jpg" alt="a CAT">
                                <!--<div class="content-warning">
                                    <div class="container">
                                        <span class="material-symbols-rounded">warning</span><br>
                                        <span>This content has been flagged.</span><br>
                                        <span>"IT IS POOORN !!"</span>
                                        <button>view</button>
                                    </div>
                                </div>-->
                            </div>
                            <hr>
                            <div class="profile-table-post-btns">
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">thumb_up</span>0</span>
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">thumb_down</span>0</span>
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">chat</span>0</span>
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">read_more</span>open post</span>
                                <span class="profile-post-btn"><span class="material-symbols-rounded btn-icon">share</span>share</span>
                            </div>
                            <span class="timestamp">Dec 21</span>

<br>
                            <div class="profile-table-post-friendreplies">
                                <span>friends replied:</span><br>
                                <div class="profile-table-post-friendreplies-reply">
                                    <img class="profile-table-friendreplies-usericon" src="https://cdn.discordapp.com/emojis/800712392722874378.webp?size=96&quality=lossless" alt="">
                                    <span class="profile-table-friendreplies-displayname">Firee<span class="material-symbols-rounded verified">verified</span></span>
                                    <span class="profile-table-friendreplies-contents">I totally agree with this statement. You should kill yourself, rather hastily even. Because why not? It'll help everyone.</span>
                                </div>
                                <div class="profile-table-post-friendreplies-reply">
                                    <img class="profile-table-friendreplies-usericon" src="https://cdn.discordapp.com/attachments/809469073590190130/1055968281544106045/1b42c81038cddcd9c94e55767d022efc.png" alt="">
                                    <span class="profile-table-friendreplies-displayname">Kartinmat</span>
                                    <span class="profile-table-friendreplies-contents">What Firee said, you should do it now while you still have the chance.</span>
                                </div>
                            </div>

                        </div>
    */
}

function posts(postsArr, prepend) {
    const allPosts = document.getElementById("all-posts");
    //allPosts.innerHTML = "";

    for (let i = 0; i < postsArr.length; i++) {
        const post = postsArr[i];
        if (!prepend) {
            allPosts.appendChild(genPostItem(post, (currentUser.me) ? 1 : 0));
        } else {
            allPosts.insertBefore(genPostItem(post, (currentUser.me) ? 1 : 0), allPosts.firstChild);
        }
    }
}

function profile(userData) {
    // this is where things are going to get EPIC!
    const profileView = document.getElementById("profile-view")
    const nickname = document.getElementById("p-display")
    const username = document.getElementById("p-username")
    const avatar = document.getElementById("p-icon")
    const bio = document.getElementById("p-bio")
    const stats = document.getElementById("p-stats")
    if (userData.banner != null) {
        profileView.style.backgroundImage = `url("${getIcon(userData.banner)}")`;
    }
    username.innerText = `@${userData.username}`;
    //<span class="material-symbols-rounded verified" style="font-size: 30px !important;">verified</span>
    nickname.innerText = userData.nickname;
    avatar.src = getIcon(userData.avatar)
    if (userData.verified) nickname.innerHTML += `<span class="material-symbols-rounded verified" title="Verified Account" style="font-size: 30px !important;">verified</span>`
    bio.innerText = userData.bio;
    //21st December 2022
    
    stats.innerText = `joined: ${moment(userData.createdIn).format("Do, MMMM YYYY")} | ${userData.friendCount} friend${userData.friendCount == 1 ? "" : "s"} | 0 posts`
    if (!userData.me) {
        const addFriendBtn = document.getElementById("btn-addfriend");
        const delFriendBtn = document.getElementById("btn-removefriend");
        const msgBtn = document.getElementById("btn-message")
        const blockBtn = document.getElementById("btn-block")
        if (!userData.sentRequest && !userData.friends && !userData.amIBlocked && !userData.didIblock) addFriendBtn.hidden = false;
        if (userData.friends) {
            delFriendBtn.hidden = false;
            msgBtn.hidden = false;
        }
        if (userData.didIblock) blockBtn.innerText = "unblock"
        const mutualsDiv = document.getElementById("mutuals");
        if (!userData.mutuals || !userData.mutuals.length) {
            if (userData.friends) {
                mutualsDiv.innerHTML = `<span>you don't share friends with this user!</span>`
            } else {
                mutualsDiv.innerHTML = `<span>you cannot view this user's mutual friends, as you must friend them first!</span>`
            }
        } else {
            // <div class="mutual">
            //      <img src="https://cdn.discordapp.com/attachments/809469073590190130/1055968281544106045/1b42c81038cddcd9c94e55767d022efc.png" alt="">
            //     <span class="mutual-displayname">Kartinmat</span>
            //     <span class="mutual-username">@mmmmmonster</span>
            // </div>
            userData.mutuals.forEach(mutual => {
                const mutualDiv = document.createElement("div");
                const aLink = document.createElement("a");
                aLink.href = `https://khajt.nyaco.tk/g/${mutual.username}`
                mutualDiv.className = "mutual";
                const mIcon = document.createElement("img");
                mIcon.src = getIcon(mutual.avatar)
                const mDisplay = document.createElement("span");
                mDisplay.innerText = mutual.nickname;
                const mUsername = document.createElement("span");
                mUsername.innerText = `@${mutual.username}`;

                mDisplay.className = "mutual-displayname";
                mUsername.className = "mutual-username";

                mutualDiv.appendChild(mIcon);
                mutualDiv.appendChild(whitespace());
                mutualDiv.appendChild(mDisplay);
                mutualDiv.appendChild(whitespace());
                mutualDiv.appendChild(mUsername);
                aLink.appendChild(mutualDiv)
                mutualsDiv.appendChild(aLink)
            })
        }
    }
}
