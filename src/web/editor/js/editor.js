$(document).ready(initialize);

var saving = false;
var loading = false;
var spellFiles = null;
var spellKeys = {};
var codeEditor = null;
var treeEditor = null;
var markedErrors = [];

function getSpellConfig() {
    return codeEditor.getValue();
}

function setSpellConfig(config) {
    codeEditor.setValue(config);
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

function clearErrorMarks() {
    for (var i = 0; i < markedErrors.length; i++) {
        markedErrors[i].clear();
    }
    markedErrors = [];
}

function validate() {
    clearErrorMarks();
    var spellConfig = getSpellConfig();
    if (spellConfig.trim().length == 0) return false;
    var config = null;
    try {
        config = jsyaml.safeLoad(spellConfig, 'utf8');
    } catch (e) {
        var lineNumber = e.mark.line;
        var line = codeEditor.getLine(lineNumber);
        var startOfLine = 0;
        while (startOfLine < line.length && line[startOfLine] == ' ') startOfLine++;
        if (startOfLine >= e.mark.column) startOfLine = 0;
        var marked = codeEditor.markText({line: lineNumber, ch: startOfLine}, {line: lineNumber, ch: e.mark.column}, {className: 'syntax-error', title: e.message});
        markedErrors.push(marked);
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

        if (treeEditor == null) {
            treeEditor = $('#editorTree').fancytree({
                extensions: ["dnd", "table"],
                dnd: {
                    preventVoidMoves: true,
                    preventRecursiveMoves: true,
                    autoExpandMS: 400,
                    dragStart: function(node, data) {
                        return true;
                    },
                    dragEnter: function(node, data) {
                        // return ["before", "after"];
                        return true;
                    },
                    dragDrop: function(node, data) {
                        data.otherNode.moveTo(node, data.hitMode);
                    }
                },
                table: {
                    indentation: 20,
                    nodeColumnIdx: 0
                },
                createNode: function(event, data) {
                    var node = data.node;
                    var tdList = $(node.tr).find(">td");

                    if (node.isFolder()) {
                        tdList.eq(0)
                          .prop("colspan", 2)
                          .nextAll().remove();
                    }
                },
                renderColumns: function(event, data) {
                    var node = data.node;
                    var tdList = $(node.tr).find(">td");

                    if (!node.isFolder()) {
                        tdList.eq(1).find("input").val(node.data.value);
                    }
                }
            }).fancytree("getTree");
        }

        if (codeEditor != null) {
            var config = validate();
            if (validate == null) {
                jQuery('#codeModeButton').prop('checked', true);
                $('#modeSelector').controlgroup('refresh');
                return;
            }
            config = convertToTree(config);
            treeEditor.reload(config);
        }
    } else {
        $('#codeEditor').show();
        $('#guiEditor').hide();
        $('#validateButton').show();

        if (codeEditor == null) {
            codeEditor = CodeMirror.fromTextArea($('#editor').get(0), {
                lineNumbers: true,
                extraKeys: {
                    "Ctrl-S": save,
                    "Ctrl-D": validate
                }
            });
        }
    }
}


function convertToTree(config) {
    var tree = [];
    for (var key in config) {
        if (config.hasOwnProperty(key)) {
            var spell = {
                title: key,
                children: convertSpellToTree(config[key]),
                expanded: true,
                folder: true
            };
            tree.push(spell);
        }
    }

    return tree;
}

function convertSpellToTree(config) {
    var tree = [];

    var properties = {
        title: 'Properties',
        children: [],
        expanded: true,
        folder: true
    };

    for (var key in config) {
        if (config.hasOwnProperty(key) && key != 'actions' && key != 'parameters' && key !='effects') {
            properties.children.push({
                title: key,
                value: config[key]
            });
        }
    }

    tree.push(properties);
    addTriggers(config, 'actions', 'Actions', tree);
    addTriggers(config, 'effects', 'Effects', tree);

    var parameters = {
        title: 'Parameters',
        children: [],
        expanded: true,
        folder: true
    };

    if (config.hasOwnProperty('parameters')) {
        for (var key in config.parameters) {
            if (config.parameters.hasOwnProperty(key)) {
                parameters.children.push({
                    title: key,
                    value: config.parameters[key]
                });
            }
        }
    }
    tree.push(parameters);

    return tree;
}

function addTriggers(config, section, title, tree) {
    if (config.hasOwnProperty(section)) {
        var sectionConfig = config[section];
        var subSection = {
            title: title,
            children: [],
            expanded: true,
            folder: true
        };
        for (var key in sectionConfig) {
            if (sectionConfig.hasOwnProperty(key)) {
                var triggerHandler = {
                    title: key,
                    children: [],
                    expanded: true,
                    folder: true
                };

                var handlerConfig = sectionConfig[key];
                for (var i = 0; i < handlerConfig.length; i++) {
                    triggerHandler.children.push({
                        'title' : handlerConfig[i]['class']
                    });
                }
                subSection.children.push(triggerHandler);
            }
        }
        tree.push(subSection);
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
    $('#modeSelector').controlgroup();
    $('#modeSelector input[type=radio]').change(checkMode);
    $("#loadSpellList").selectable({filter: 'tr'});
    checkMode();
    var currentHash = window.location.hash;
    if (currentHash != '') {
        loadFile(currentHash.substring(1));
    }
}