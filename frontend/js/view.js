/*jshint esversion: 6 */
var view = (function() {
    "use strict";

    signup.onclick = function(e) {
      e.preventDefault();
      signup_form.reset();
      signup_form.style.display = "none";
      signin_form.style.display = "none";
      if (!signup_form.style.display || signup_form.style.display === "none") {
          signup_form.style.display = "flex";
          signup.style.display = "none";
          signout.style.display = "none";
          upload_button.style.display = "none";
          slider.style.display = "none";
      } else {
          signup_form.style.display = "none";
      }
    };

    signin.onclick = function (e) {
      e.preventDefault();
      signin_form.reset();
      signup_form.style.display = "none";
      signin_form.style.display = "none";
      if (!signin_form.style.display || signin_form.style.display === "none") {
          signin_form.style.display = "flex";
          signin.style.display = "none";
          signout.style.display = "none";
          upload_button.style.display = "none";
          slider.style.display = "none";
      } else {
          signin_form.style.display = "none";
      }
    };



    // Toggle Upload image button
    upload_button.onclick = function(e) {

        e.preventDefault();
        picture_form.reset();

        upload_options.style.display = "none";
        if (!picture_form.style.display || picture_form.style.display === "none") {
            picture_form.style.display = "block";
            upload_button.style.display = "none";
            slider.style.display = "none";
            paginatedusers.style.display = "none";
            signout.style.display = "none";
        } else {
            picture_form.style.display = "none";
        }
    };

    // URL or File Upload
    var url_radiobutton = document.getElementById("url");
    url_radiobutton.onchange = function() {
        upload_options.style.display = "inline-flex";
        choose_file.style.display = "none";
        url_form_name.style.display = "inline-flex";
    };

    var file_radiobutton = document.getElementById("fileupload");
    file_radiobutton.onchange = function() {
        upload_options.style.display = "inline-flex";
        url_form_name.style.display = "none";
        choose_file.style.display = "inline-flex";

    };

    /* ------------------- Sign up / Sign in ----------------------- */
    submit_signup.onclick = function(e) {
      e.preventDefault();
      var data = {};
      data.username = signup_username.value;
      data.password = signup_pass.value;
      if (data.username.length>0 && data.password.length>0){
        document.dispatchEvent(new CustomEvent("onSignUp", {'detail': data}));
      } else {
        view.showError("Error: Empty fields");
        upload_container.style.display = "none";
      }
    }

    submit_signin.onclick = function(e) {
      e.preventDefault();
      var data = {};
      data.username = signin_username.value;
      data.password = signin_pass.value;
      if (data.username.length>0 && data.password.length>0){
        document.dispatchEvent(new CustomEvent("onSignIn", {'detail': data}));

      } else {
        view.showError("Error: Empty fields");
        upload_container.style.display = "none";
      }

      slider.style.display = "block";
      upload_button.style.display = "block";
      signin.display = "block";
      signin_form.style.display = "none";
      signout.style.display = "inline";
    }

    signout.onclick = function (e) {
      e.preventDefault();
      document.dispatchEvent(new CustomEvent("onSignOut"));
    };

    /* ------------------- Image Upload ----------------------- */
    submit_form.onclick = function(e) {
        e.preventDefault();
        var data = {};
        data.title = document.getElementById('image_title').value;
        data.author = document.getElementById('image_author').value;
        data.username = username.dataset.id;

        var formData = new FormData();

        if (url.checked && data.title.length > 0 && data.author.length > 0) {
            formData.append('title', data.title);
            formData.append('author', data.author);
            formData.append('username', data.username);
            formData.append('url', url_form_name.value);

            document.dispatchEvent(new CustomEvent("onFormSubmit", { 'detail': formData  }));
        } else if (fileupload.checked && data.title.length > 0 && data.author.length > 0) {
            var file = document.querySelector('input[type=file]').files[0];
            formData.append('title', data.title);
            formData.append('author', data.author);
            formData.append('username', data.username);
            formData.append('file', file);

            document.dispatchEvent(new CustomEvent("onFormSubmit", { 'detail': formData }));
        } else {
            alert("Please enter image title and author, choose url or fileupload");
        }

        slider.style.display = "block";
        picture_form.style.display = "none";
        document.getElementById("main_img").style.display = "inline-flex";
        upload_button.style.display = "block";

    };
    /* ------------------- Image navigation ----------------------- */

    // Image navigation -- PREVIOUS IMAGE
    previous_img.onclick = function() {
        document.dispatchEvent(new CustomEvent("prevImage"));
    };

    // Image navigation -- NEXT IMAGE
    next_img.onclick = function() {
        document.dispatchEvent(new CustomEvent("nextImage"));
    };

    // Image navigation -- COMMENT BOX
    comment_img.onclick = function() {
        comment_form.reset();
        if (!comment_form.style.display || comment_form.style.display === "none") {
            comment_form.style.display = "block";
            img_nav.style.display = 'none';
        } else {
            comment_form.style.display = "none";
        }
    };

    // IMAGE NAVIGATION -- Submit Comment
    submit_comment.onclick = function(e) {
        e.preventDefault();

        var data = {};
        data.authorName = img_author_name.value;
        data.comment = document.getElementById("img_comment_text").value;
        data.username = username.dataset.id;
        data.imageid = main_display.dataset.id;
        document.dispatchEvent(new CustomEvent("imgComment", {
            'detail': data
        }));

        document.getElementById("upload_button").style.display = "block";
        document.getElementById("comment_form").style.display = "none";
        document.getElementById("img_nav").style.display = "flex";
    };


    /* ------------------- Delete ----------------------- */

    // Delete image
    deleteimg_button.onclick = function() {
      var data = {};
      data.imgid = slider.dataset.id || -1;
      data.username = username.dataset.id;
      document.dispatchEvent(new CustomEvent("deleteImage", { 'detail': data }));
    };

    /* ------------------- UI Components ----------------------- */
    // Add image from URL
    var view = {};
    var info = {};

    view.showError = function(message){
        var e = document.getElementById("error");
        e.innerHTML = `<span class="badge badge-danger alert">${(message)}</span>`;
        e.style.display = "block";
        window.setTimeout(e.style.display="none", 5000);

    };


    view.signedUp = function(data) {
      if (data) {
        signup_form.style.display = "none";
        signin_form.style.display = "block";

      }
    };

    view.signedIn = function(user) {
      if (user) {
        var username_display = document.createElement('div');
        username_display.id = "username";
        username_display.dataset.id = user.username;
        username_display.innerHTML = "My Profile: " + user.username;
        userdiv.appendChild(username_display);

        signup.style.display = "none";
        document.getElementById("img_nav").style.display = "none";
        signout.style.display = "block";

      }
    };

    view.paginatedGalleries = function(users) {
      if (users) {
        var user_buttons = document.createElement('button');
        //user_buttons.dataset.id = users.username;
        //user_buttons.innerHTML = users.username;
        var text = document.createTextNode(users.username);
        user_buttons.appendChild(text);
        user_buttons.type = "button";
        user_buttons.className = "btn btn-primary";
        user_buttons.onclick = function () {
            var data = users.username;
            document.dispatchEvent(new CustomEvent("getImageByUsername", {
                'detail': data
            }));
        };
        user_buttons.style.margin = "2px";
        paginatedusers.appendChild(user_buttons);
        paginatedusers.style.display = "inline-flex";

      }
    };


    view.signedOut = function() {
      var e = document.createElement('div');
      e.innerHTML = `<span class="alert">Signed Out</span>`;
      e.style.display = "block";
      window.location = "/";
      error.appendChild(e);
    };


    view.insertURLimage = function(image) {
      document.getElementsByClassName('display-block')[0].style.display = "flex";
        if (image) {
            slider.dataset.id = image._id;
            slider.classList.remove('hide');
            img_nav.style.display = "flex";


            // build image with title,author
            var url_img_info = document.createElement('div');
            url_img_info.id = "main_display";
            url_img_info.className = "dynamic_images";
            url_img_info.dataset.id = image._id;
            url_img_info.innerHTML = `
                <div class="image_block" id="img_blk">
                    <div class='img_info' >

                      <h3>Author: ${image.author}</h3>
                      <h3>Username: ${image.username}</h3>
                    </div>
                    <div class="picture">`;
                      if (image.url instanceof Object) {
                        url_img_info.innerHTML += `<img src="uploads/${image.url.filename}">`;
                      } else {
                        url_img_info.innerHTML += `<img src="${image.url}">`;
                      }
                    url_img_info.innerHTML += `</div>
                </div>
            `;
            // add comment section
            var comm_container = document.createElement('div');
            comm_container.id = "comments_container";
            url_img_info.append(comm_container);

            main_img.innerHTML = ''; // clear content
            main_img.appendChild(url_img_info);
        } else {
            slider.style.display = "none";
            img_nav.style.display = "none";
        }
    };




    view.insertComment = function(comment) {
        if (comment) {
            var comm_container = document.getElementById('comments_container');

            var comment_section = document.createElement('div');
            comment_section.className = 'comments_section';

            var header_section = document.createElement('div');
            //header_section.className = 'header_button';

            var p_author = document.createElement('div');
            p_author.innerHTML = "Author Name: " + comment.authorName;
            header_section.appendChild(p_author);

            var p_comment = document.createElement('div');
            p_comment.innerHTML = "Comment: " + comment.comment;
            header_section.appendChild(p_comment);

            var p_date = document.createElement('div');
            p_date.innerHTML = "Time: " + comment.date;
            header_section.appendChild(p_date);

            var p_username = document.createElement('div');
            p_username.innerHTML = "Username: " + comment.username;
            header_section.appendChild(p_username);

            var delete_comment = document.createElement('div');
            delete_comment.className = 'delete_comment';
            delete_comment.dataset.id = comment._id;
            delete_comment.onclick = function(e) {
              var data = {};
              data.username = username.dataset.id;
              data.imgid = slider.dataset.id;
              data.commentid = this.dataset.id;
              document.dispatchEvent(new CustomEvent("deleteComment", {'detail': data}));
            };

            header_section.append(delete_comment);
            comment_section.append(header_section);
            comm_container.append(comment_section);
        }
    };

    return view;
}());
