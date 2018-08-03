(function(model, view) {
    "use strict";

    // signup, signin, signout
    document.addEventListener('onSignUp', function(e) {
      model.signUp(e.detail);
    });

    document.addEventListener('userSignedUp', function (e) {
      view.signedUp(e.detail);
    });

    document.addEventListener('onSignIn', function(e) {
      model.signIn(e.detail);
    });

    document.addEventListener('userSignedIn', function(e) {
      view.signedIn(e.detail);
    });

    document.addEventListener('paginatedUsers', function(e) {

      if (e.detail && e.detail.length > 0) {
        var users = e.detail;
        users.forEach(function (user) {
          view.paginatedGalleries(user);
        });
      }
    });

    document.addEventListener('onSignOut', function(e) {
      model.signOut();
    });

    document.addEventListener('userSignedout', function (e) {
      view.signedOut();
    });


    document.addEventListener('imagesUpdated', function(e) {
        view.insertURLimage(e.detail);
    });

    document.addEventListener('onFormSubmit', function(e) {
        model.createImage(e.detail);
    });

    // listen to model after url-image stored
    document.addEventListener('urlImageStored', function(e) {
        view.insertURLimage(e.detail);
    });

    document.addEventListener('getImageByUsername', function(e) {
      model.getImages(e.detail);
    });

    // next Image
    document.addEventListener('nextImage', function(e) {
        model.getNextImage();
    });

    // previous image
    document.addEventListener('prevImage', function(e) {
        model.getPrevImage();
    });

    // generate next/previous image
    document.addEventListener('sendImg', function(e) {
        view.insertURLimage(e.detail);
    });

    // store comment for image
    document.addEventListener('imgComment', function(e) {
        model.addComment(e.detail);
    });

    document.addEventListener('updateComments', function(e) {
      view.insertComment(e.detail);
    });

    document.addEventListener('commentsUpdated', function(e) {

      if (e.detail.length) {
        var comments = e.detail;
        comments.forEach(function (comment) {
            view.insertComment(comment);
        });
      }
    });

    // delete image
    document.addEventListener('deleteImage', function(e) {
        model.deleteImg(e.detail);
    });

    // delete comment
    document.addEventListener('deleteComment', function(e) {
        model.deleteComm(e.detail);
    });

    document.addEventListener('showError', function (e) {
      view.showError(e.detail);
    });


}(model, view));
