signin.onclick = function (e) {
  e.preventDefault();
  console.log("sing in");
  signin_form.reset();
  signin_form.display = "block";
};

submit_signin.onclick = function(e) {
  e.preventDefault();
  var data = {};
  data.username = signin_username.value;
  data.password = signin_pass.value;
  if (data.username.length>0 && data.password.length>0){
    document.dispatchEvent(new CustomEvent("onSignIn", {'detail': data}));
  }
  slider.style.display = "block";
  picture_form.style.display = "none";
  document.getElementById("main_img").style.display = "inline-flex";
  upload_button.style.display = "block";
}
