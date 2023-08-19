let currentPost;
async function initPost() {
    initNav();
    refreshPage();
}

async function refreshPage() {
    const postsTable = document.getElementById('postsTable')
    if (!postsTable) window.location.href = "https://khajt.nyaco.tk";
    try {
        const postID = location.pathname.split("/")[2];
        const getPostData = await axios({
            url: `${URI}/api/posts/${postID}`,
            method: "GET",
            headers: {
                "authorization": session
            }
        });
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
        document.title = `khaj//t YOUR MOM!!!!!`
        currentPost = getPostData.data;
        postsTable.hidden = false;
        //postRepliesCount.innerText = currentPost.replies.length + ` repl${currentPost.replies.length == 1 ? "y" : "ies"}`
        loadPosts()
    } catch (e) {
        console.error(e)
        if (e.response && e.response.status == 404) {
            document.title = `khaj//t - 404`
            postsTable.innerHTML = "<h1>Post not found.</h1>"
        } else {
            document.title = `Error!`
            postsTable.innerHTML = "<h1>An error occured.</h1>"
        }
        postsTable.hidden = false;
    }
}

function toggleReplyPopup() {
    createPopup("Make a post", "toggleReplyPopup()", `<textarea name="" id="postcontent" autocomplete="off"></textarea>
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
    <button class="post-btn" onclick="createPost('${currentPost.ID}', true)">reply</button>`);
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

async function loadPosts() {
    const postsTable = document.getElementById('postsTable')
    if (!postsTable) window.location.href = "https://khajt.nyaco.tk";
    postsTable.innerHTML = ""
    
    const mainPost = JSON.parse(JSON.stringify(currentPost)); // mutation be like
    mainPost.replies = []
    postsTable.appendChild(genPostItem(mainPost, 3))
    const repliesCount = document.createElement("h4");
    repliesCount.innerText = currentPost.replies.length + ` repl${currentPost.replies.length == 1 ? "y" : "ies"}`
    postsTable.appendChild(repliesCount);

    currentPost.replies.forEach(reply => {
        reply.replies = [];
        postsTable.appendChild(genPostItem(reply, 3, true))
    })
}
