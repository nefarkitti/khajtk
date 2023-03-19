let savedPosts = []
async function init() {
    initNav();
    try {
        const savedPostsData = await axios({
            url: `${URI}/api/user/me/saved`,
            method: "GET",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        savedPosts = savedPostsData.data;
        genPosts(savedPosts)
    } catch (error) {
        alert(error)
        console.error(error)
    }
}

function genPosts(posts) {
    const savedList = document.getElementById("savedlist")
    if (!savedList) return;
    savedList.innerHTML = ""
    for (let i = 0; i < savedPosts.length; i++) {
        const post = posts[i];
        savedList.appendChild(genPostItem(post, 2));
    }
}

async function saveSearch() {
    const searchResults = document.getElementById("searchresults");
    const value = document.getElementById("savesearch").value;
    if (!value.length) {
        searchResults.innerText = `current saved posts`
        genPosts(savedPosts)
        return;
    }
    if (!searchResults) return;
    function comparing(x) {
        return x.trim().toLowerCase().includes(value.trim().toLowerCase())
        //return x.trim().toLowerCase().startsWith(value.trim().toLowerCase())
    }
    searchResults.innerText = `search results for "${value}"`
    let posts = savedPosts.filter(x => comparing(x.username) || comparing(x.nickname) || comparing(x.content));
    genPosts(posts)
}