function initSearch() {
    initNav();
}

function genUsers(users) {
    const requestsList = document.getElementById("requestsList")
    if (!requestsList) return;
    requestsList.innerHTML = ""
    users.forEach(user => {
        requestsList.appendChild(genItem(user), false)
    })
}

async function userSearch() {
    const searchResults = document.getElementById("searchresults");
    const value = document.getElementById("usersearch").value;
    if (!value.length) {
        searchResults.innerText = `no results found`
        return genUsers([])
    }
    if (!searchResults) return;
    try {
        const usersData = await axios({
            url: `${URI}/api/search?type=user&q=${value}`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        searchResults.innerText = `search results for "${value}"`
        genUsers(usersData.data)
    } catch (error) {
        alert(error)
        console.error(error)
    }
}