$(document).ready(initialize);

var saving = false;
var loading = false;
var spellFiles = null;
var spellKeys = {};

var codeEditor = null;
var guiEditor = null;

function getSpellConfig() {
    return codeEditor.getValue();
}

function setSpellConfig(spellConfig) {
    if (codeEditor != null) {
        codeEditor.setValue(spellConfig);
    }

    if (guiEditor != null) {
        guiEditor.setValue(spellConfig);
    }
}

function save() {
    if (saving) return;

    if (user.id == '') {
        login();
        return;
    }

    if (validate() == null) {
        return;
    }

    saving = true;
    spellFiles = null;
    $("#saveButton").button('disable');
    $.ajax( {
        type: "POST",
        url: "save.php",
        data: {
            spell: getSpellConfig()
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

function validate() {
    if (codeEditor != null) {
        codeEditor.clearErrors();
    }
    var spellConfig = getSpellConfig();
    if (spellConfig.trim().length == 0) return false;
    var config = null;
    try {
        config = jsyaml.safeLoad(spellConfig, 'utf8');
    } catch (e) {
        if (codeEditor != null) {
            codeEditor.showError(e);
        }
        alert(e.message);
        return null;
    }

    return config;
}

function startNew() {
    setSpellConfig('');
}

function getSpellFiles(callback) {
    if (loading) return null;

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
                    callback();
                }
            }
        });
        return null;
    }

    return spellFiles;
}

function load() {
    var spells = getSpellFiles(load);
    if (spells == null) return;

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
            setSpellConfig(response.yml);
        }
    });
}

function populateSpellFiles() {
    var select = $('#loadSpellList');
    select.empty();
    spellKeys = {};

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
        spellKeys[key] = true;
    }
}

function checkMode() {
    var currentMode = $('#modeSelector').find('input:checked').prop('id');
    if (currentMode == 'editorModeButton') {
        $('#codeEditor').hide();
        $('#guiEditor').show();
        $('#validateButton').hide();

        if (guiEditor == null) {
            guiEditor = new GUIEditor($('#editorTree'));
        }

        if (codeEditor != null) {
            var config = validate();
            if (config == null) {
                jQuery('#codeModeButton').prop('checked', true);
                $('#modeSelector').controlgroup('refresh');
                return;
            }
            guiEditor.setValue(codeEditor.getValue());
        }
    } else {
        $('#codeEditor').show();
        $('#guiEditor').hide();
        $('#validateButton').show();

        if (codeEditor == null) {
            codeEditor = new CodeEditor($('#editor'));
        }
    }
}

function fork() {
    var spells = getSpellFiles(fork);
    if (spells == null) return;

    var spellConfig = getSpellConfig();
    if (spellConfig.trim().length == 0) {
        alert("There's nothing to fork...");
        return false;
    }
    var spell = null;
    try {
        spell = jsyaml.safeLoad(spellConfig, 'utf8');
    } catch (e) {
        alert("Please fix your errors and try again: " + e.message);
        return false;
    }

    var key = null;
    for (key in spell) {
        if (spell.hasOwnProperty(key)) {
            spell = spell[key];
            break;
        }
    }

    if (key != null) {
        while (key.length > 1 && key[key.length - 1] >= '0' && key[key.length - 1] <= '9') {
            key = key.substr(0, key.length - 1);
        }
        var index = 2;
        var baseKey = key;
        while (spellKeys.hasOwnProperty(key)) {
            key = baseKey + '' + index;
            index++;
        }
    }

    var newSpell = {};
    newSpell[key] = spell;
    spellKeys[key] = true;

    setSpellConfig(dumpYaml(newSpell));

    return true;
}

function dumpYaml(object) {
    return jsyaml.dump(object, {lineWidth: 200, noRefs: true});
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
    $('#forkButton').button().click(fork);
    $('#modeSelector input[type=radio]').change(checkMode);
    $("#loadSpellList").selectable({filter: 'tr'});
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
    $('#modeSelector').controlgroup();
    checkMode();
    if (loadSpell != null) {
        loadFile(loadSpell);
    }
}