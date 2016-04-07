var isAdmin = false;
function onSignIn(googleUser){
  // Useful data for your client-side scripts:
  console.log("googleUser: " + googleUser);
  userinfo = googleUser;
  var profile = googleUser.getBasicProfile();
  console.log("ID: " + profile.getId()); // Don't send this directly to your server!
  console.log("Name: " + profile.getName());
  console.log("Image URL: " + profile.getImageUrl());
  console.log("Email: " + profile.getEmail());
  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;
  console.log("ID Token: " + id_token);
  //document.getElementById("nameInput").value = profile.getName();
  //document.getElementById("nameInput").disabled = true;
  $('#checker1').val("You have signed in as " + profile.getName());
  var admin = ["117366956372745871124", "112347100247659202914"];
  //alert($.inArray(profile.getId() + "", admin));
  if($.inArray(profile.getId() + "", admin) != -1) {
  	//alert("You are an admin!");
  }
};
function signOut() {
    alert('signOut!');
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        //document.getElementById("nameInput").value = "";
        $('checker1').val("");
    });
}

  $(document)
    .ready(function() {
      $('.ui.form')
        .form({
          fields: {
            email: {
              identifier  : 'email',
              rules: [
                {
                  type   : 'empty',
                  prompt : 'Please enter your e-mail'
                },
                {
                  type   : 'email',
                  prompt : 'Please enter a valid e-mail'
                }
              ]
            },
            password: {
              identifier  : 'password',
              rules: [
                {
                  type   : 'empty',
                  prompt : 'Please enter your password'
                },
                {
                  type   : 'length[6]',
                  prompt : 'Your password must be at least 6 characters'
                }
              ]
            }
          }
        })
      ;
    })
  ;