var userinfo;
  $(document).ready(function() {

    var myDataRef = new Firebase('https://burning-torch-996.firebaseIO.com/');
    //var profile = googleUser.getBasicProfile();
    //$("#messagesDiv").append("<marquee scrollamount=20 behavior=alternate> Welcome to the Chat Box! </marquee>");
    //$("#messagesDiv").append("<marquee> Welcome to the Chat Box! </marquee>");
    $("#messagesDiv").append("<marquee> Sorry, the clear button is disabled! </marquee>");

    $('#messageInput').keypress(function (e) {
      if (e.keyCode == 13 && jQuery.trim($('#nameInput').val()) != "" && jQuery.trim($('#messageInput').val()) != "" && $('#messageInput').val().length < 41 ) {
        var name = $('#nameInput').val();
        var text = $('#messageInput').val();
        myDataRef.push({name: name, text: text});
        $('#messageInput').val('');
        document.getElementById("nameInput").disabled = true;
      }
    });

    myDataRef.on('child_added', function(snapshot) {
      var message = snapshot.val();
      displayChatMessage(message.name, message.text);
    })

    function displayChatMessage(name, text) {
      $('<div/>').text(text).prepend($('<em/>').text(name+': ')).appendTo($('#messagesDiv'));
      $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
    }

    
    var hidden = false;
    $('#hide_button').click(function() {
      hidden = !hidden;
      if ( hidden ) {
        $('#messagesDiv').hide(600);
        $('#hide_button').html("Show");
      } 
      else {
        $('#messagesDiv').show(600);
        $('#hide_button').html("Hide");
      }

    })

      $('#clear_button').click(function() {
        var profile = userinfo.getBasicProfile();
        $('#messagesDiv').children().fadeOut(1000);
        var systemMessage = profile.getName() + " tried to clear the chat but failed";
        //alert(systemMessage);
        myDataRef.push({name:"System", text: systemMessage});
        $('#messagesDiv').children().fadeIn(1000);
      });

  });
    