let currentPage = "gen"
async function init() {
    initNav();
    refreshPage();
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
    } catch (error) {
        console.error(error)
        alert("Something went wrong when trying to get your own user data.\nPlease report this.")
    }
}
function changeHidden(oldP, newP, type) {
    const oldElement = document.getElementById(oldP)
    const newElement = document.getElementById(newP)
    if (!oldElement || !newElement) return alert("what.")
    if (type == "btn") {
        oldElement.classList.remove("selected")
        newElement.classList.add("selected")
    } else {
        oldElement.hidden = true;
        newElement.hidden = false;
    }
}

function saveSettings() {
    const currentSettings = parseSettings();
    switch (currentPage) {
        case "gen": {
            const themeOption = document.getElementById("themes")
            currentSettings.theme = themeOption.value;
            const videoAutoplay = document.getElementById("vidautoplay");
            currentSettings.videoAutoplay = (videoAutoplay.value == "on")
            setSettings(currentSettings)
            window.location.reload()
        }
    }
}

async function generateInviteCode() {
    const inviteCodes = document.getElementById("invitecodes");
    if (!inviteCodes) return alert("Something went wrong while trying to generate invite codes.")
    try {
        const codeData = await axios({
            url: `${URI}/api/user/me/invite`,
            method: "POST",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        const invElement = document.createElement("li");
        invElement.innerText = codeData.data;
        inviteCodes.appendChild(invElement)
    } catch (error) {
        alert(error)
        console.error(error)
    }
}

async function refreshPage() {
    const currentSettings = parseSettings();
    switch (currentPage) {
        case "gen": {
            const themeOption = document.getElementById("themes")
            themeOption.value = currentSettings.theme;
            const videoAutoplay = document.getElementById("vidautoplay");
            videoAutoplay.value = (currentSettings.videoAutoplay) ? "on" : "off";
        }
        case "account": {
            const nickname = document.getElementById("edit-nick")
            const username = document.getElementById("edit-name")
            const avatar = document.getElementById("e-icon")
            if (!pressedEdit) {
                const avatarIcon = document.getElementById("edit-icon")
                pressedEdit = true;
                avatar.onchange = function () {
                    if (avatar.value.length && (avatar.value.startsWith("http://") || avatar.value.startsWith("https://"))) {
                        //imgPreview.src = `${URL}/external?url=${encodeURIComponent(urlCheck.value)}`;;
                        // too much requests loll glitch doesnt like that
                        avatarIcon.src = `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(avatar.value)}`
                        // yeah i think duckduckgo wont mind that too much
                    }
                }
            }
            const bio = document.getElementById("edit-bio")
            const banner = document.getElementById("edit-banner")
            nickname.placeholder = currentUser.nickname;
            username.placeholder = `@${currentUser.username}`;
            avatar.placeholder = (currentUser.avatar == "" || currentUser.avatar == null) ? "avatar" : currentUser.avatar;
            bio.placeholder = (currentUser.bio != "") ? currentUser.bio : "Bio";
            banner.placeholder = (currentUser.banner == null) ? "banner" : currentUser.banner;
        }
        case "invite": {
            const inviteCodes = document.getElementById("invitecodes");
            if (!inviteCodes) return alert("Something went wrong while trying to generate invite codes.")
            inviteCodes.innerHTML = ""
            try {
                const invitesData = await axios({
                    url: `${URI}/api/user/me/invites`,
                    method: "GET",
                    headers: {
                        "authorization": session
                    },
                    timeout: 5000
                });
                invitesData.data.forEach(code => {
                    const invElement = document.createElement("li");
                    invElement.innerText = code;
                    inviteCodes.appendChild(invElement)
                })
            } catch (error) {
                alert(error)
                console.error(error)
            }
        }
    }
}

async function deleteAccount() {
    if (confirm("Are you sure you want to delete your account?")) {
        try {
            await axios({
                url: `${URI}/api/user/me/delete`,
                method: "POST",
                headers: {
                    "authorization": session
                },
                timeout: 5000
            });
            logout()
        } catch (e) {
            alert(e)
            console.error(e)
        }
    } else {
        console.log("no")
    }
}

async function changePassword() {
    const oldPass = document.getElementById("old-pass").value;
    const newPass = document.getElementById("new-pass").value;
    const confirmNewPass = document.getElementById("confirm-new-pass").value;
    if (!oldPass.length) return alert("Please enter in your old password.");
    if (!newPass.length) return alert("Please enter in a new password.");
    if (newPass != confirmNewPass) return alert("Both the new password, and the confirm new password don't match!");
    try {
        await axios({
            url: `${URI}/api/user/me/settings`,
            method: "POST",
            headers: {
                "authorization": session
            },
            data: {
                name: "password",
                p_old: oldPass,
                p_new: newPass,
                value: "kart"
            },
            timeout: 5000
        });
        alert("Successfully changed password.");
        window.location.reload()
    } catch (e) {
        alert(e.response.data)
        console.error(e)
    }
}

function changePage(page) {
    if (page == currentPage) return;
    changeHidden(currentPage + "Settings", page + "Settings", "hide")
    changeHidden(currentPage + "NavBtn", page + "NavBtn", "btn")
    currentPage = page;
    refreshPage();
}
