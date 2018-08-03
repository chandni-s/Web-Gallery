var model = (function() {
    "use strict";

    var doAjax = function (method, url, body, json, callback){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(e){
            switch(this.readyState){
                 case (XMLHttpRequest.DONE):
                    if (this.status === 200) {
                        if(json) return callback(null, JSON.parse(this.responseText));
                        return callback(null, this.responseText);
                    }else{
                        return callback(new Error(this.responseText), null);
                    }
            }
        };
        xhttp.open(method, url, true);
        if (json && body){
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.send(JSON.stringify(body));
        }else{
            xhttp.send(body);
        }
    };

    var images = [];
    var current_index = 0;
    var model = {};

    // CREATE

    // User
    model.signUp = function(data) {
      doAjax('PUT', '/signup/', data, true, function(err, user) {
        if (err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
        document.dispatchEvent(new CustomEvent('userSignedUp', { 'detail': user}));
      });
    };

    model.signIn = function(data) {
      doAjax('POST', '/signin/', data, true, function (err, user) {
        if (err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
        document.dispatchEvent(new CustomEvent('userSignedIn', { 'detail': user}));
        model.getUsers();
      });
    };

    // image
    model.createImage = function(data) {
        doAjax('POST', '/users/', data, false, function(err, img ) {
          if (err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
          else {
            images.push( JSON.parse(img) );
            current_index = images.length - 1;
            document.dispatchEvent(new CustomEvent("urlImageStored", { 'detail': images[current_index] }));
          }
        });
    };

    // comment for image
    model.addComment = function (data) {
        doAjax("POST", "/users/" + data.username + "/"+ data.imageid + "/comments/", data, true, function (err, data) {
          if (err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
          else {
            document.dispatchEvent(new CustomEvent("commentsUpdated", { 'detail': [data] }));
          }
        });
    };


    // read

    model.signOut = function() {
      doAjax('GET', '/signout/', null, false, function(err) {
        if (err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
        document.dispatchEvent(new CustomEvent('userSignedout'));
      });
    };

    model.getUsers = function () {
      doAjax('GET', '/users/', null, true, function(err, users) {
        if (err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
        document.dispatchEvent(new CustomEvent('paginatedUsers', {'detail': users}));
      });
    };

    model.getImages = function(data) {
      doAjax("GET", "/users/" + data + "/images/", data, true, function(err, data) {
          if (err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
          else {
            if (data) {
              model.getComments(data);
            }
            document.dispatchEvent(new CustomEvent("imagesUpdated", { 'detail': data }));
          }
      });
    };

    model.getComments = function(data) {
      doAjax("GET", "/users/" + data.username + "/images/" + data._id + "/comments/", null, true, function(err, data) {
        if (err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
        else {
          document.dispatchEvent(new CustomEvent("commentsUpdated", {'detail' : data}));
        }
      });
    };

    model.getNextImage = function() {

    };

    model.getPrevImage = function() {

    };


    // delete image
    model.deleteImg = function(data) {
        doAjax("DELETE", "/users/" + data.username + "/images/" + data.imgid + "/", null, false, function (err) {
          if(err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
        });
    };

    // delete comment
    model.deleteComm = function(data) {
      doAjax("DELETE", "/users/" + data.username + "/images/" + data.imgid + "/comments/" + data.commentid + "/", null, false, function(err) {
        if(err) document.dispatchEvent(new CustomEvent('showError', { 'detail': err}));
      });
    };

    return model;

}());
