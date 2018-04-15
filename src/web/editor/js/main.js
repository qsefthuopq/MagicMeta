$(document).ready(initialize);
var editor = null;

function initialize() {
    editor = new Editor();

    $("#loadButton").button().click(function() { editor.load(); });
    $("#newButton").button().click(function() { editor.startNew("Basic"); });
    $("#saveButton").button().click(function() { editor.save(); });
    $('#referenceButton').button().click(function() { editor.openReference(); });
    $('#downloadButton').button().click(function() { editor.download(); });
    $('#deleteButton').button().click(function() { editor.deleteSpell(); });
    $('#forkButton').button().click(function() { editor.fork(); });
    $('#modeSelector input[type=radio]').change(function() { editor.checkMode(); });
    $("#loadSpellList").selectable({filter: 'tr'});
    $("#newSelector").selectmenu({
      classes: {
        "ui-selectmenu-button": "ui-button-icon-only demo-splitbutton-select"
      },
      change: function(){
        editor.startNew(this.value);
      }
    });

    var loadSpell = null;
    var currentHash = window.location.hash;
    if (currentHash != '') {
        currentHash = currentHash.substring(1);
        var pieces = currentHash.split('.');
        if (pieces.length > 1) {
            if (pieces[0] == 'editor') {
                $('#editorModeButton').prop('checked', true);
            }
            loadSpell = pieces[1];
        } else {
            loadSpell = pieces[0];
        }
    }
    $('.controlgroup').controlgroup();
    editor.checkMode();
    if (loadSpell != null) {
        editor.loadFile(loadSpell);
    } else {
        editor.startNew("Basic");
    }

    $.ajax( {
        type: "GET",
        url: "common/meta.php?context",
        dataType: 'json'
    }).done(function(meta) {
        editor.setMetadata(meta);
    });
}

function dumpYaml(object) {
    return jsyaml.dump(object, {lineWidth: 200, noRefs: true});
}