// totally not copied from nyaco.tk
async function aTimer(page) {
    try {
        await axios({
            url: `${URI}/verify`,
            method: "POST",
            headers: {
                "authorization": session
            },
            timeout: 5000
        });
        // TODO: do stuff for refresh token later whne implemntation lo
        if (["loading","auth"].includes(page)) window.location.href = "./home"
    } catch (error) {
        if (error.response && error.response.status == 401 && !["auth","404"].includes(page)) {
            window.location.href = './main';
        } else {
            console.log(error);
            if (["ECONNABORTED", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT"].includes(error.code) || error.response.status == 0) {
                setTimeout(() => aTimer(page), 3000);
            }
        }
    }
}

async function logout() {
    localStorage.removeItem("kartissus");
    window.location.href = "/main"
}

async function checkAuth(page) {
    aTimer(page)
    if (["auth","404","loading"].includes(page)) return;
    /*setInterval(async function() {
        aTimer(page);
    }, 5000)*/
    // uncomment when we release hA
}