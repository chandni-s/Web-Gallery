(function(model) {

  "use strict";

  var showError = function(message){
        var e = document.getElementById("error");
        e.innerHTML = `<span class="alert">${(message)}</span>`;
        e.style.display = "block";
    };

  var showUser = function(user) {
    var e = document.getElementById("user");
    var username_display = user.username;
    username.innerHTML = '';
    username.append(username_display);
  }

  submit_signup.onclick = function(e) {
    e.preventDefault();
    var data = {};
    data.username = signup_username.value;
    data.password = signup_pass.value;
    model.signUp(data, function(err, user) {
      if (err) return showError;
      console.log(user);
      showUser(user);
      e.target.reset();
      window.location.href = '/';
    });
  };
}(model));
