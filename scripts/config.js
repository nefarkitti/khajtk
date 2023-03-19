//const URI = "http://localhost:3000";
//const URI = window.location.origin;
const URI = "https://khajiitlifesupport.glitch.me"
const session = localStorage.getItem("kartissus");

function getImageURL(image) {
    const denyProxy = localStorage.getItem('denyProxy');
    return (denyProxy == null) ? `https://external-content.duckduckgo.com/iu/?u=${encodeURIComponent(image)}` : image;
}

function base64Encode(str) {
    // Base64 encoding
    return btoa(str);
}

function getIcon(icon) {
    return (!icon || !icon.length) ? "https://media.discordapp.net/attachments/780455936883687484/1059590637424496690/5770f01a32c3c53e90ecda61483ccb08.jpg" : getImageURL(icon);
}
function whitespace() {
    return document.createTextNode("\u00A0"); // no its not what you think it is
}

function setSettings(settings) {
    localStorage.setItem("settings", btoa(JSON.stringify(settings)))
}

let socket;
if (typeof io != "undefined") {
    socket = io(URI, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        query: {
            token: session
        }
    });
    socket.on('reconnect', (postData) => {
        console.log("Reconnected to socket.")
    })
    socket.on('error', (err) => {
        alert(err);
    })
}

function parseSettings() {
    const defaultSettings = {
        theme: "light",
        videoAutoplay: false
    }
    try {
        if (localStorage.getItem("settings") == null) {
            setSettings(defaultSettings);
            return defaultSettings;
        } else {
            let settings = atob(localStorage.getItem("settings"));
            settings = JSON.parse(settings);
            return settings;
        }
    } catch (e) {
        alert("An error occurred while parsing settings.")
    }
}


// https://stackoverflow.com/a/10601315
function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
}
