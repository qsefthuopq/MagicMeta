$(document).ready(initialize);

var saving = false;
var loading = false;
var spellFiles = null;
var codeEditor = null;
var markedErrors = [];
function save() {
    if (saving) return;

    if (user.id == '') {
        login();
        return;
    }

    if (!validate()) {
        return;
    }

    saving = true;
    spellFiles = null;
    $("#saveButton").button('disable');
    $.ajax( {
        type: "POST",
        url: "save.php",
        data: {
            spell: codeEditor.getValue()
        },
        dataType: 'json'
    }).done(function(response) {
        $("#saveButton").button('enable');
        saving = false;
        if (!response.success) {
            alert("Save failed: " + response.message);
        }
    });
}

function clearErrorMarks() {
    for (var i = 0; i < markedErrors.length; i++) {
        markedErrors[i].clear();
    }
    markedErrors = [];
}

function validate() {
    clearErrorMarks();
    var spellConfig = codeEditor.getValue();
    if (spellConfig.trim().length == 0) return false;
    try {
        jsyaml.safeLoad(spellConfig, 'utf8');
    } catch (e) {
        var lineNumber = e.mark.line;
        var line = codeEditor.getLine(lineNumber);
        var startOfLine = 0;
        while (startOfLine < line.length && line[startOfLine] == ' ') startOfLine++;
        if (startOfLine >= e.mark.column) startOfLine = 0;
        var marked = codeEditor.markText({line: lineNumber, ch: startOfLine}, {line: lineNumber, ch: e.mark.column}, {className: 'syntax-error', title: e.message});
        markedErrors.push(marked);
        alert(e.message);
        return false;
    }

    return true;
}

function startNew() {
    codeEditor.setValue('');
}

function load() {
    if (loading) return;

    if (spellFiles == null) {
        loading = true;
        $("#loadButton").button('disable');
        $.ajax( {
            type: "POST",
            url: "spells.php",
            dataType: 'json'
        }).done(function(response) {
            loading = false;
            $("#loadButton").button('enable');
            if (!response.success) {
                alert("Failed to fetch spells: " + response.message);
            } else {
                spellFiles = response.spells;
                if (spellFiles != null) {
                    populateSpellFiles();
                    load();
                }
            }
        });
        return;
    }

    $("#loadSpellDialog").dialog({
      modal: true,
      height: 400,
      width: '640px',
      resizeable: false,
      buttons: {
        Cancel: function() {
            $(this).dialog("close");
        },
        "Load": function() {
            $(this).dialog("close");
            var spell = jQuery(".ui-selected", this).data('key');
            if (spell != '') {
                loadFile(spell);
            }
        }
      },
      open: function()  {
        $(this).parent().find("button:eq(2)").focus();
      }
    }).dblclick(function() {
        $(this).parent().find("button:eq(2)").trigger("click");
    }).show();
}

function loadFile(fileName) {
    if (fileName == null || fileName.length == 0) return;

    $.ajax( {
        type: "POST",
        url: "spell.php",
        dataType: 'json',
        data: {
            key: fileName
        }
    }).done(function(response) {
        if (!response.success) {
            alert("Failed to fetch spell: " + response.message);
        } else {
            codeEditor.setValue(response.yml);
        }
    });
}

function populateSpellFiles() {
    var select = $('#loadSpellList');
    select.empty();

    spellFiles.sort(function(a, b) {
        var aIsDefault = (a.creator_id == '');
        var bIsDefault = (b.creator_id == '');
        if (aIsDefault && !bIsDefault) {
            return 1;
        } else if (!aIsDefault && bIsDefault) {
            return -1;
        }
        var aIsCreators = (user.id != '' && a.creator_id != '' && a.creator_id == user.id);
        var bIsCreators = (user.id != '' && b.creator_id != '' && b.creator_id == user.id);
        if (aIsCreators && !bIsCreators) {
            return -1;
        } else if (!aIsCreators && bIsCreators) {
            return 1;
        }
        return a.key.localeCompare(b.key);
    });
    var owned = false;
    var unowned = false;
    var defaults = false;
    for (var i = 0; i < spellFiles.length; i++) {
        var spell = spellFiles[i];
        var key = spell.key;
        var loadKey = key;
        var isDefault = false;
        if (key.startsWith("default.")) {
            isDefault = true;
            key = key.substr(8);
        }
        var spellName = key + " : " + spell.name + " : " + spell.creator_name + " : " + spell.description;
        var groupLabel = null;
        if (!owned && spell.creator_id != '' && spell.creator_id == user.id) {
            owned = true;
            groupLabel = "Your Spells";
        }
        if (!unowned && (spell.creator_id == ''|| spell.creator_id !== user.id)) {
            unowned = true;
            groupLabel = "Sandbox Spells Created by Others";
        } else if (!defaults && isDefault) {
            defaults = true;
            groupLabel = "Default Survival Spells";
        }
        if (groupLabel != null) {
            var groupRow = $('<tr class="headerRow">');
            var groupCell = $('<td>').prop('colspan', 4).text(groupLabel);
            select.append(groupRow.append(groupCell));
        }
        var spellRow = $('<tr>').data('key', loadKey);
        spellRow.append($('<td>').addClass('spellKey').text(key));
        spellRow.append($('<td>').addClass('spellName').text(spell.name));
        spellRow.append($('<td>').addClass('spellCreator').text(spell.creator_name));
        spellRow.append($('<td>').addClass('spellDescription').append(
            $('<div>').addClass('spellDescriptionOuter').append(
                $('<div>').addClass('spellDescriptionInner').text(spell.description)
            )
        ));
        select.append(spellRow);
    }
}

function checkMode() {
    if (this.id == 'editorModeButton') {
        $('#codeEditor').hide();
        $('#guiEditor').show();
        $('#validateButton').hide();
    } else {
        $('#codeEditor').show();
        $('#guiEditor').hide();
        $('#validateButton').show();
    }
}

function openReference() {
    window.open(referenceURL, '_blank');
}

function initialize() {
    $("#loadButton").button().click(load);
    $("#newButton").button().click(startNew);
    $("#saveButton").button().click(save);
    $('#validateButton').button().click(validate);
    $('#referenceButton').button().click(openReference);
    $('#modeSelector').controlgroup();
    $('#modeSelector input[type=radio]').change(checkMode);
    $("#loadSpellList").selectable({filter: 'tr'});
    codeEditor = CodeMirror.fromTextArea($('#editor').get(0), {
        lineNumbers: true,
        extraKeys: {
            "Ctrl-S": save,
            "Ctrl-D": validate
        }
    });

    var currentHash = window.location.hash;
    if (currentHash != '') {
        loadFile(currentHash.substring(1));
    }
}