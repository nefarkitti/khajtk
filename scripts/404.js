//<br><br>

function init404() {
    const content404 = document.getElementById("404content")
    if (!content404) return alert("what.");
    const path = location.pathname.split("/")[2] // change to [1] after get domain because what
    // prepare for DISGUSTING CODE!
    switch (path) {
        case "g": {// users
            let postBtn = document.getElementById("postbtn");
            if (!postBtn) alert("whwat")
            const overlayery = document.getElementById("showoverlay");
            overlayery.onclick = function() { togglePostPopup(true) };
            postBtn.onclick = function() { togglePostPopup(true) };
            content404.innerHTML = `<table class="profile-table" id="profile-table" hidden>
            <tr>
              <td class="profile-table-user-section"> <!-- profile -->
                <div class="profile-table-container">
                    <div class="profile-table-user-profile">
                        <div class="user-profile-top" id="profile-view">
                            <img class="profile-table-user-profile-icon" id="p-icon" src="" alt="">
                            <span class="profile-table-user-profile-displayname" id="p-display"></span><br>
                            <span class="profile-table-user-profile-username" id="p-username"></span><br>
                            <div class="profile-table-user-profile-btns">
                                <span class="user-profile-btn" style="background-color: rgb(58, 159, 53);" hidden id="btn-addfriend" onclick="sendFriendReq()"><span class="material-symbols-rounded ubtn-icon">person_add</span>add friend</span>
                                <span class="user-profile-btn" style="background-color: rgb(159, 53, 53);" hidden id="btn-removefriend" onclick="removeFriend()"><span class="material-symbols-rounded ubtn-icon">person_remove</span>remove friend</span>
                                <span class="user-profile-btn" hidden id="btn-message"><span class="material-symbols-rounded ubtn-icon">send</span>message</span>
                                <span class="user-profile-btn" style="background-color: rgb(159, 53, 53);" onclick="toggleBlock()"><span class="material-symbols-rounded ubtn-icon">block</span><a id="btn-block">block</a></span>
                            </div>
                        </div>
                        <br>
                        <div class="user-profile-other">
                            <!--<b><span class="title">bio</span></b><br><br>-->
                            <span id="p-bio"></span><br><br>
                            <b><span>mutuals</span></b><br>
                            <!--<span hidden>you don't share friends with this user!</span>-->
                            <div class="mutual-contain" id="mutuals">
                                <!--<div class="mutual">
                                    <img src="https://cdn.discordapp.com/attachments/841238402548498433/1035597808201375815/GreenF.jpeg" alt="">
                                    <span class="mutual-displayname">nefarkitti</span>
                                    <span class="mutual-username">@nefarkitti</span>
                                </div>
                                <div class="mutual">
                                    <img src="https://cdn.discordapp.com/attachments/809469073590190130/1055968281544106045/1b42c81038cddcd9c94e55767d022efc.png" alt="">
                                    <span class="mutual-displayname">Kartinmat</span>
                                    <span class="mutual-username">@mmmmmonster</span>
                                </div>-->
                            </div>
                            <hr style="color: rgb(80, 80, 80);">
                            <span style="color: rgb(149, 149, 149);" id="p-stats">joined: | 0 friends | 0 posts</span><br>
                        </div>
                        <div class="user-profile-other" hidden>
                            <!--<b><span class="title">biography</span></b><br><br>-->
                            <span>

                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer quis sapien tincidunt, vehicula diam eget, lacinia augue. Mauris vitae est eu ex eleifend accumsan ut eget nibh. Fusce pharetra sagittis pellentesque. Morbi elit ipsum, blandit at pulvinar in, tincidunt non tortor. Nulla auctor, risus vel eleifend pulvinar, tortor nibh semper urna, eu dictum lorem magna ut nisl. Curabitur placerat vestibulum rutrum. Cras euismod id nulla vitae mattis. Sed laoreet sit amet justo vel aliquet. Pellentesque eu egestas diam.
                                
                                Vestibulum vehicula tortor at ante mattis varius. Sed ut sollicitudin enim, nec facilisis eros. Maecenas a tincidunt neque. Proin porttitor ligula at elementum pharetra. Nam vel pellentesque erat, nec convallis neque. Nulla vel turpis semper, finibus augue in, pellentesque purus. Phasellus malesuada semper metus at volutpat.
                                
                                Etiam pharetra justo ac nisl sollicitudin, ac aliquam mi iaculis. Aenean at ipsum vel dui ullamcorper pellentesque. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Etiam lacus quam, pharetra ut quam sit amet, egestas mollis leo. Duis quis sapien sollicitudin, viverra elit non, egestas massa. Morbi sed velit id quam hendrerit porttitor. Phasellus sollicitudin ultricies est sit amet laoreet. Vestibulum maximus libero nec velit sodales dapibus. Suspendisse vestibulum purus dapibus ipsum porta hendrerit. Nullam non orci maximus, mattis justo vitae, pulvinar mauris.
                                
                                In vitae ipsum eget orci aliquam fermentum eget et quam. Sed gravida pretium accumsan. Nam ullamcorper elit et libero venenatis, nec tincidunt risus sollicitudin. Maecenas imperdiet elit metus. Pellentesque in odio imperdiet, suscipit eros quis, ullamcorper elit. Nam laoreet velit arcu, gravida sodales diam auctor ut. Nam cursus tincidunt turpis, vel consectetur eros elementum quis. Curabitur vel tincidunt risus, ac tempus mi. Nullam eget interdum dolor. Curabitur ac massa at neque cursus egestas interdum ac tellus. Vestibulum et suscipit ipsum.
                                
                                Donec venenatis sapien quis quam lacinia elementum. Pellentesque condimentum mollis mauris quis varius. Nulla molestie lectus sit amet felis porta, vel consequat ipsum lacinia. Aliquam erat volutpat. Morbi et vehicula odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum vitae ullamcorper nunc. Nullam vel egestas sapien, tincidunt sollicitudin augue. Donec non lobortis augue. Pellentesque imperdiet, diam suscipit dictum vulputate, arcu tellus elementum ligula, eget maximus dui lectus sed dolor. </span>
                        </div>
                    </div>
                </div>
              </td> <!-- profile -->
              <td class="profile-table-posts-section"> <!-- posts -->
                <div class="profile-table-container">
                    <span hidden id="blocked">You cannot view this user's posts or post on this user's profile, either something has gone wrong or you've been blocked by them.</span>
                    <div class="profile-table-posts" id="all-posts">
                    </div>
                </div>
              </td> <!-- posts -->
            </tr>
          </table> `
          initProfile()
            break;
        }
        case 'post': {//posts
            let postBtn = document.getElementById("postbtn");
            if (!postBtn) alert("whwat")
            const overlayery = document.getElementById("showoverlay");
            overlayery.onclick = function() { toggleReplyPopup() };
            postBtn.onclick = function() { toggleReplyPopup() };
            postBtn.innerHTML = `<span class="material-symbols-rounded">add_comment</span> reply to post`
            content404.innerHTML = `<br><br>
            <div class="profile-table-posts-section"> 
                <div class="profile-table-container" id="postsTable" hidden> <!-- posts -->
                    
                </div>
            </div> <!-- posts -->`
            initPost()
            break;
        }
    }
}
