$(document).ready(initializeUser);

var checkCodeTimer = null;

function login() {
    $("#registrationDialog").dialog({
      modal: true,
      buttons: {
        Cancel: function() {
            $(this).dialog("close");
        },
        "Get Code": function() {
            $(this).dialog("close");
            register();
        }
      }
    }).show().keydown(function (event) {
        if (event.keyCode == $.ui.keyCode.ENTER) {
            $(this).parent().find("button:eq(2)").trigger("click");
            return false;
        }
    });
}

function register() {
    var userName = jQuery('#userId').val().trim();
    if (userName.length == 0) {
        jQuery('#userId').addClass('invalid');
        return;
    }
    jQuery('#userId').removeClass('invalid');
    $.ajax( {
        type: "POST",
        url: "common/getcode.php",
        data: {
            user: userName
        },
        dataType: 'json'
    }).done(function(response) {
        $("#getCodeButton").button('enable');
        if (!response.success) {
            alert("Code fetch failed: " + response.message);
            return;
        }

        displayCode(userName, response.id, response.code);
    });
}

function logout() {
    $.ajax( {
        type: "POST",
        url: "common/logout.php",
        dataType: 'json'
    });

    user = {id: '', name: '', skin: ''};
    checkUser();
}

function displayCode(userName, userId, code) {
    $('#codeDiv').text(code);
    $("#codeDialog").dialog({
      modal: true,
      buttons: {
        Cancel: function() {
            if (checkCodeTimer != null) {
                clearTimeout(checkCodeTimer);
                checkCodeTimer = null;
            }
            $(this).dialog("close");
        }
      }
    }).show();
    scheduleCheck(userName, userId, code, 1000)
}

function scheduleCheck(userName, userId, code, timeout) {
    checkCodeTimer = setTimeout(function() {
        checkCode(userName, userId, code, timeout);
    }, timeout);
}

function checkCode(userName, userId, code, timeout) {
    $.ajax( {
        type: "POST",
        url: "common/checkcode.php",
        data: {
            user: userId,
            code: code
        },
        dataType: 'json'
    }).done(function(response) {
        $("#getCodeButton").button('enable');
        if (response.success) {
            user = response.user;
            checkUser();
            $("#codeDialog").dialog('close');
        } else {
            scheduleCheck(userName, userId, code, timeout + 1000);
        }
    });
}

function checkUser() {
    if (user.id == '') {
        $('#userName').text('Anonymous');
        $('#userSkin').css('background-image', '');
        $('#userOverlay').css('background-image', '');
        $('#loginButton').show();
        $('#logoutButton').hide();
    }  else {
        $('#userName').text(user.name);
        $('#userSkin').css('background-image', 'url("' + user.skin + '")');
        $('#userOverlay').css('background-image', 'url("' + user.skin + '")');
        $('#loginButton').hide();
        $('#logoutButton').show();
    }
}

function initializeUser() {
    $('#logoutButton').click(logout);
    $('#loginButton').click(login);
    checkUser();
}
