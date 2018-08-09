function Editor()
{
    this.tutorial = new Tutorial($('#tutorialMask'));
    this.saving = false;
    this.loading = false;
    this.deleting = false;
    this.spellFiles = null;
    this.metadata = null;
    this.spellKeys = {};

    this.codeEditor = null;
    this.guiEditor = null;
};

Editor.prototype.getSpellConfig = function() {
    return this.getActiveEditor().getValue();
};

Editor.prototype.setSpellConfig = function(spellConfig) {
    this.getActiveEditor().setValue(spellConfig);
};

Editor.prototype.save = function() {
    if (this.saving) return;

    if (user.id == '') {
        login();
        return;
    }

    if (!this.getActiveEditor().isValid()) {
        alert("You have errors in your code, please fix them before saving!");
        return;
    }

    var spellConfig = this.getSpellConfig();
    var spellKey = this.simpleParse(spellConfig).key;
    if (spellKey != null) {
        this.updateHash(spellKey);
    }

    this.saving = true;
    var me = this;
    $("#saveButton").button('disable');
    $.ajax( {
        type: "POST",
        url: "save.php",
        data: {
            spell: spellConfig
        },
        dataType: 'json'
    }).done(function(response) {
        $("#saveButton").button('enable');
        me.saving = false;
        if (!response.success) {
            alert("Save failed: " + response.message);
        } else {
            me.spellFiles = null;
        }
    });
};

Editor.prototype.startNew = function(template) {
    this.setSpellConfig($('#template' + template).val());
};

Editor.prototype.getSpellFiles = function(callback) {
    if (this.loading) return null;

    if (this.spellFiles == null) {
        this.loading = true;
        var me = this;
        $("#loadButton").button('disable');
        $.ajax( {
            type: "POST",
            url: "spells.php",
            dataType: 'json'
        }).done(function(response) {
            me.loading = false;
            $("#loadButton").button('enable');
            if (!response.success) {
                alert("Failed to fetch spells: " + response.message);
            } else {
                me.spellFiles = response.spells;
                if (me.spellFiles != null) {
                    me.populateSpellFiles();
                    callback();
                }
            }
        });
        return null;
    }

    return this.spellFiles;
};

Editor.prototype.load = function() {
    var me = this;
    var spells = this.getSpellFiles(function() { me.load(); });
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
                    me.loadFile(spell);
                }
            }
        },
        open: function()  {
            $(this).parent().find("button:eq(2)").focus();
        }
    }).dblclick(function() {
        $(this).parent().find("button:eq(2)").trigger("click");
    }).show();
};

Editor.prototype.updateHash = function(spellName) {
    var currentMode = $('#modeSelector').find('input:checked').prop('id');
    currentMode = (currentMode == 'editorModeButton') ? 'editor.' : '';
    window.location.hash = currentMode + spellName;
};

Editor.prototype.loadFile = function(fileName) {
    if (fileName == null || fileName.length == 0) return;

    this.updateHash(fileName);

    var me = this;
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
            me.setSpellConfig(response.yml);
        }
    });
};

Editor.prototype.populateSpellFiles = function() {
    var select = $('#loadSpellList');
    select.empty();
    this.spellKeys = {};

    this.spellFiles.sort(function(a, b) {
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
    for (var i = 0; i < this.spellFiles.length; i++) {
        var spell = this.spellFiles[i];
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
        this.spellKeys[key] = true;
    }
};

Editor.prototype.getActiveEditor = function() {
    var currentMode = $('#modeSelector').find('input:checked').prop('id');
    if (currentMode == 'editorModeButton') {
        return this.getGUIEditor();
    }

    return this.getCodeEditor();
};

Editor.prototype.getGUIEditor = function() {
    if (this.guiEditor == null) {
        this.guiEditor = new GUIEditor($('#editorTree'));
        if (this.metadata != null) {
            this.guiEditor.setMetadata(this.metadata);
        }
    }

    return this.guiEditor;
};

Editor.prototype.getCodeEditor = function() {
    if (this.codeEditor == null) {
        this.codeEditor = new CodeEditor($('#editor'));
        if (this.metadata != null) {
            this.codeEditor.setMetadata(this.metadata);
        }
    }

    return this.codeEditor;
};

Editor.prototype.checkMode = function() {
    var currentMode = $('#modeSelector').find('input:checked').prop('id');
    if (currentMode == 'editorModeButton') {
        var gui = this.getGUIEditor();
        if (this.codeEditor != nul) {
            if (!this.codeEditor.isValid()) {
                alert("You have errors in your code, please fix them before switching modes!");
                setTimeout(function() {
                    $('#codeModeButton').prop('checked', true);
                    $('#modeSelector').controlgroup('refresh');
                }, 1);
                return;
            }
            gui.setValue(this.codeEditor.getValue());
        }

        $('#codeEditor').hide();
        $('#guiEditor').show();
        $('#validateButton').hide();
    } else {
        $('#codeEditor').show();
        $('#guiEditor').hide();
        $('#validateButton').show();

        var code = this.getCodeEditor();
        if (this.guiEditor != null) {
            code.setValue(this.guiEditor.getValue());
        }
    }
};

Editor.prototype.simpleParse = function(spellConfig) {
    var lines = spellConfig.split("\n");
    var keyLine = 0;
    var key = null;
    while (keyLine < lines.length) {
        var line = lines[keyLine++].trim();
        if (line.startsWith("#") || line.length == 0) continue;
        key = line;
        break;
    }
    keyLine--;
    if (key != null) {
        key = key.substring(0, key.length - 1);
    }
    return {
        key: key,
        keyLine: keyLine,
        lines: lines
    }
};

Editor.prototype.deleteSpell = function() {
    if (this.deleting) return;

    var spellConfig = this.getSpellConfig();
    spellConfig = this.simpleParse(spellConfig);

    if (spellConfig.lines.length == 0 || spellConfig.lines[0].trim().length == 0) {
        alert("There's nothing to delete...");
        return false;
    }
    if (spellConfig.key == null) {
        alert("Couldn't find the spell key... is your config OK?");
        return;
    }

    if (confirm("Are you sure you want to permanently delete the spell " + spellConfig.key + "?\nForever is a very long time...")) {
        var me = this;
        $("#deleteButton").button('disable');
        this.deleting = true;
        $.ajax( {
            type: "POST",
            url: "delete.php",
            data: {
                spell: spellConfig.key
            },
            dataType: 'json'
        }).done(function(response) {
            $("#deleteButton").button('enable');
            me.deleting = false;
            if (!response.success) {
                alert("Delete failed: " + response.message);
            } else {
                me.spellFiles = null;
                alert("Deleted " + spellConfig.key);
            }
        });
    }
};

Editor.prototype.fork = function() {
    var me = this;
    var spells = this.getSpellFiles(function() { me.fork(); });
    if (spells == null) return;

    var spellConfig = this.getSpellConfig();
    spellConfig = this.simpleParse(spellConfig);

    if (spellConfig.lines.length == 0 || spellConfig.lines[0].trim().length == 0) {
        alert("There's nothing to fork...");
        return false;
    }
    if (spellConfig.key == null || spellConfig.key == '') {
        alert("Couldn't find the spell key... is your config OK?");
        return false;
    }

    var key = spellConfig.key;
    if (key != '') {
        while (key.length > 1 && key[key.length - 1] >= '0' && key[key.length - 1] <= '9') {
            key = key.substr(0, key.length - 1);
        }
        var index = 2;
        var baseKey = key;
        while (this.spellKeys.hasOwnProperty(key)) {
            key = baseKey + '' + index;
            index++;
        }
    }

    var lines = spellConfig.lines;
    lines[spellConfig.keyLine] = key + ":";
    var newSpell = lines.join("\n");
    this.spellKeys[key] = true;

    this.setSpellConfig(newSpell);

    return true;
};

Editor.prototype.openReference = function() {
    window.open(referenceURL, '_blank');
};

Editor.prototype.download = function() {
    var spellConfig = this.getSpellConfig();
    var key = this.simpleParse(spellConfig).key;
    if (key == null || key == '') {
        alert("Nothing to download... ?");
        return;
    }

    var downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/yaml;charset=utf-8,' + encodeURIComponent(spellConfig));
    downloadLink.setAttribute('download', key + ".yml");
    downloadLink.click();
};

Editor.prototype.setMetadata = function(meta) {
    if (meta == null) {
        alert("Error loading metadata, please reload and try again.");
        return;
    }
    this.metadata = meta;
    if (this.codeEditor != null) {
        this.codeEditor.setMetadata(meta);
    }
    if (this.guiEditor != null) {
        this.guiEditor.setMetadata(meta);
    }
};

Editor.prototype.startTutorial = function() {
    this.tutorial.start($('#welcomeTutorial'));
};
