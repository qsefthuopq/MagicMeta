function GUIEditor(container)
{
    this.clipboard = null;
    this.metadata = null;
    this.metaindex = null;
    this.pendingConfig = null;
    var fancytree = container.fancytree({
        extensions: ["dnd", "table", "edit", "gridnav"],
        titlesTabbable: true,
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
        edit: {
            triggerStart: ["clickActive", "mac+enter", "shift+click"],
            beforeEdit: function(event, data){
                return !data.node.isFolder();
            },
            close: function (event, data) {
                if (data.save && data.isNew) {
                    // Quick-enter: add new nodes until we hit [enter] on an empty title
                    container.trigger("nodeCommand", {cmd: "addSibling"});
                }
            }
        },
        gridnav: {
            autofocusInput: false,
            handleCursorKeys: true
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
    });

    var editor = this;
    this.tree = fancytree.fancytree("getTree");

    fancytree.on("nodeCommand", function (event, data) {
        // Custom event handler that is triggered by keydown-handler and
        // context menu:
        var refNode, moveMode,
            tree = $(this).fancytree("getTree"),
            node = tree.getActiveNode();

        switch (data.cmd) {
            case "moveUp":
                refNode = node.getPrevSibling();
                if (refNode) {
                    node.moveTo(refNode, "before");
                    node.setActive();
                }
                break;
            case "moveDown":
                refNode = node.getNextSibling();
                if (refNode) {
                    node.moveTo(refNode, "after");
                    node.setActive();
                }
                break;
            case "indent":
                refNode = node.getPrevSibling();
                if (refNode) {
                    node.moveTo(refNode, "child");
                    refNode.setExpanded();
                    node.setActive();
                }
                break;
            case "outdent":
                if (!node.isTopLevel()) {
                    node.moveTo(node.getParent(), "after");
                    node.setActive();
                }
                break;
            case "rename":
                node.editStart();
                break;
            case "remove":
                refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                node.remove();
                if (refNode) {
                    refNode.setActive();
                }
                break;
            case "addChild":
                node.editCreateNode("child", "");
                break;
            case "addSibling":
                node.editCreateNode("after", "");
                break;
            case "cut":
                editor.clipboard = {mode: data.cmd, data: node};
                break;
            case "copy":
                editor.clipboard = {
                    mode: data.cmd,
                    data: node.toDict(function (n) {
                        delete n.key;
                    })
                };
                break;
            case "clear":
                editor.clipboard = null;
                break;
            case "paste":
                if (editor.clipboard.mode === "cut") {
                    // refNode = node.getPrevSibling();
                    editor.clipboard.data.moveTo(node, "child");
                    editor.clipboard.data.setActive();
                } else if (editor.clipboard.mode === "copy") {
                    node.addChildren(editor.clipboard.data).setActive();
                }
                break;
            default:
                alert("Unhandled command: " + data.cmd);
                return;
        }
    });

    fancytree.on("keydown", function (e) {
        var cmd = null;

        // console.log(e.type, $.ui.fancytree.eventToString(e));
        switch ($.ui.fancytree.eventToString(e)) {
            case "ctrl+shift+n":
            case "meta+shift+n": // mac: cmd+shift+n
                cmd = "addChild";
                break;
            case "ctrl+c":
            case "meta+c": // mac
                cmd = "copy";
                break;
            case "ctrl+v":
            case "meta+v": // mac
                cmd = "paste";
                break;
            case "ctrl+x":
            case "meta+x": // mac
                cmd = "cut";
                break;
            case "ctrl+o":
            case "meta+o": // mac
                load();
                break;
            case "ctrl+s":
            case "meta+s": // mac
                save();
                break;
            case "ctrl+n":
            case "meta+n": // mac
                cmd = "addSibling";
                break;
            case "del":
            case "meta+backspace": // mac
                cmd = "remove";
                break;
            case "ctrl+up":
                cmd = "moveUp";
                break;
            case "ctrl+down":
                cmd = "moveDown";
                break;
            case "ctrl+right":
            case "ctrl+shift+right": // mac
                cmd = "indent";
                break;
            case "ctrl+left":
            case "ctrl+shift+left": // mac
                cmd = "outdent";
        }
        if (cmd) {
            $(this).trigger("nodeCommand", {cmd: cmd});
            // e.preventDefault();
            // e.stopPropagation();
            return false;
        }
    });

    container.contextmenu({
        delegate: "span.fancytree-node",
        menu: [
            {title: "Edit <kbd>[F2]</kbd>", cmd: "rename", uiIcon: "ui-icon-pencil"},
            {title: "Delete <kbd>[Del]</kbd>", cmd: "remove", uiIcon: "ui-icon-trash"},
            {title: "----"},
            {title: "New sibling <kbd>[Ctrl+N]</kbd>", cmd: "addSibling", uiIcon: "ui-icon-plus"},
            {title: "New child <kbd>[Ctrl+Shift+N]</kbd>", cmd: "addChild", uiIcon: "ui-icon-arrowreturn-1-e"},
            {title: "----"},
            {title: "Cut <kbd>Ctrl+X</kbd>", cmd: "cut", uiIcon: "ui-icon-scissors"},
            {title: "Copy <kbd>Ctrl-C</kbd>", cmd: "copy", uiIcon: "ui-icon-copy"},
            {title: "Paste as child<kbd>Ctrl+V</kbd>", cmd: "paste", uiIcon: "ui-icon-clipboard", disabled: true}
        ],
        beforeOpen: function (event, ui) {
            var node = $.ui.fancytree.getNode(ui.target);
            container.contextmenu("enableEntry", "paste", !!editor.clipboard);
            node.setActive();
        },
        select: function (event, ui) {
            var that = this;
            // delay the event, so the menu can close and the click event does
            // not interfere with the edit control
            setTimeout(function () {
                $(that).trigger("nodeCommand", {cmd: ui.cmd});
            }, 100);
        }
    });

    $.ajax( {
        type: "GET",
        url: "common/meta.php",
        dataType: 'json'
    }).done(function(meta) {
        editor.setMetadata(meta);
    });
};

GUIEditor.prototype.setMetadata = function(meta)
{
    if (meta == null) {
        alert("Error loading metadata, please reload and try again.");
        return;
    }
    this.metaindex = {};
    this.metadata = meta;
    this.indexMetadata("spell_properties");
    this.indexMetadata("spell_parameters");
    this.indexMetadata("effect_parameters");
    this.indexMetadata("effectlib_parameters");
    this.indexMetadata("action_parameters");

    var allEffectParameters = this.mergeMetadata("effectlib_effects");
    this.metaindex['all_effect_parameters'] = $.extend(allEffectParameters, this.metaindex["effect_parameters"], this.metaindex["effectlib_parameters"]);

    var allActionParameters = this.mergeMetadata("actions");
    this.metaindex['all_action_parameters'] = $.extend(allActionParameters, this.metaindex["action_parameters"]);
    this.metaindex['all_spell_parameters'] = $.extend({}, this.metaindex["all_action_parameters"], this.metaindex["spell_parameters"]);

    if (this.pendingConfig != null) {
        this.setValue(this.pendingConfig);
        this.pendingConfig = null;
    }
};

GUIEditor.prototype.mergeMetadata = function(section) {
    var properties = this.metadata.properties;
    var allParameters = {};
    for (var parameterClass in this.metadata[section]) {
        if (this.metadata[section].hasOwnProperty(parameterClass)) {
            var classSection = this.metadata[section][parameterClass].parameters;
            for (var key in classSection) {
                if (classSection.hasOwnProperty(key)) {
                    var property = properties[key];
                    allParameters[property.field] = key;
                }
            }
        }
    }

    return allParameters;
};

GUIEditor.prototype.indexMetadata = function(section) {
    var properties = this.metadata.properties;
    var sectionProperties = this.metadata[section];
    var propertyIndex = {};
    for (var key in sectionProperties) {
        if (sectionProperties.hasOwnProperty(key)) {
            var property = properties[key];
            propertyIndex[property.field] = key;
        }
    }
    this.metaindex[section] = propertyIndex;
};

GUIEditor.prototype.setValue = function(spellConfig)
{
    if (this.metadata == null) {
        this.pendingConfig = spellConfig;
        return;
    }
    var config = null;
    try {
        config = jsyaml.safeLoad(spellConfig, 'utf8');
    } catch (e) {

    }
    if (config != null) {
        config = this.convertToTree(config);
        this.tree.reload(config);
    }
};

GUIEditor.prototype.getValue = function()
{
    var spellStructure = {};
    var root = this.tree.getRootNode();
    for (var i = 0; i < root.children.length; i++) {
        var spellNode = root.children[i];
        var spellKey = spellNode.title;
        var spell = this.getSpellValue(spellNode);

        spellStructure[spellKey] = spell;
    }
    return dumpYaml(spellStructure);
};

GUIEditor.prototype.getSpellValue = function(spellNode)
{
    var spell = {};
    for (var i = 0; i < spellNode.children.length; i++) {
        var childNode = spellNode.children[i];
        var childKey = childNode.title;
        switch (childKey) {
            case "Properties":
                this.appendToObject(childNode.children, spell);
                break;
            case "Parameters":
                spell.parameters = {};
                this.appendToObject(childNode.children, spell.parameters);
                break;
            case "Costs":
                spell.costs = {};
                this.appendToObject(childNode.children, spell.costs);
                break;
            case "Effects":
                spell.effects = {};
                this.appendToObject(childNode.children, spell.effects);
                break;
            case "Actions":
                spell.actions = {};
                this.appendToObject(childNode.children, spell.actions);
                break;
        }
    }
    return spell;
};

GUIEditor.prototype.appendClassListToObject = function(nodes, list) {
    if (nodes == null) return;
    for (var i = 0; i < nodes.length; i++) {
       var newObject = {class: nodes[i].title};
       this.appendToObject(nodes[i].children, newObject);
       list.push(newObject);
    }
};

GUIEditor.prototype.appendToObject = function(nodes, object) {
    if (nodes == null) return;
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.data.type == 'action_handler') {
            var newList = [];
            this.appendClassListToObject(node.children, newList);
            object[node.title] = newList;
        } else if (node.isFolder()) {
            var newObject = {};
            this.appendToObject(node.children, newObject);
            object[node.title] = newObject;
        } else {
            var nodeInput = $("input", node.tr);
            var value = nodeInput.val();
            if (node.data.type == 'double') {
                value = parseFloat(value);
            } else if (node.data.type == 'integer') {
                value = parseInt(value);
            } else if (node.data.type == 'boolean') {
                value = value === 'true';
            }

            object[node.title] = value;
        }
    }
};

GUIEditor.prototype.convertToTree = function(config) {
    var tree = [];
    for (var key in config) {
        if (config.hasOwnProperty(key)) {
            var spell = {
                title: key,
                children: this.convertSpellToTree(config[key]),
                expanded: true,
                folder: true
            };
            tree.push(spell);
        }
    }

    return tree;
};

GUIEditor.prototype.getNode = function(key, value, metaSection, nodeType) {
    var node = {title: key, data: {}};

    if (metaSection && this.metaindex[metaSection].hasOwnProperty(key)) {
        var propertyKey = this.metaindex[metaSection][key];
        node.data.type = this.metadata.properties[propertyKey].type;
    } else if (nodeType) {
        node.data.type = nodeType;
    }
    if (Array.isArray(value))
    {
        node.children = [];
        node.folder = true;
        node.expanded = true;

        // TODO: This should be handled generically?
        node.data.type = 'action_handler';
        for (var i = 0; i < value.length; i++) {
            var className = value[i]['class'];
            delete value[i]['class'];
            this.addSection(value[i], className, node.children);
        }
    }
    else if (typeof(value) === 'object')
    {
        node.children = [];
        node.folder = true;
        node.expanded = true;
        for (var childKey in value) {
            if (value.hasOwnProperty(childKey)) {
                node.children.push(this.getNode(childKey, value[childKey]));
            }
        }
    } else {
        node.value = value;
    }

    return node;
};

GUIEditor.prototype.convertSpellToTree = function(config) {
    var tree = [];

    var properties = {
        title: 'Properties',
        children: [],
        expanded: true,
        folder: true
    };

    for (var key in config) {
        if (config.hasOwnProperty(key) && key != 'actions' && key != 'parameters' && key !='effects' && key != 'costs') {
            properties.children.push(this.getNode(key, config[key], "spell_properties"));
        }
    }

    tree.push(properties);
    this.addTriggers(config, 'actions', 'Actions', tree, "all_action_parameters");
    this.addTriggers(config, 'effects', 'Effects', tree, "all_effect_parameters");
    this.addOptionalSection(config, 'parameters', 'Parameters', tree, "all_spell_parameters");
    this.addOptionalSection(config, 'costs', 'Costs', tree, null, 'double');

    return tree;
};

GUIEditor.prototype.addOptionalSection = function(config, section, title, tree, metaSection, nodeType) {
    section = config.hasOwnProperty(section) ? config[section] : null;
    this.addSection(section, title, tree, metaSection, nodeType);
};

GUIEditor.prototype.addSection = function(section, title, tree, metaSection, nodeType) {
    var sectionFolder = {
        title: title,
        children: [],
        expanded: true,
        folder: true
    };

    if (section != null) {
        for (var key in section) {
            if (section.hasOwnProperty(key)) {
                sectionFolder.children.push(this.getNode(key, section[key], metaSection, nodeType));
            }
        }
    }
    tree.push(sectionFolder);
};

GUIEditor.prototype.addTriggers = function(config, section, title, tree, metaSection) {
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
                    folder: true,
                    data: {type: 'action_handler'}
                };

                var handlerConfig = sectionConfig[key];
                for (var i = 0; i < handlerConfig.length; i++) {
                    // Kinda hacky ... would like to get rid of this eventually?
                    var className = 'EffectSingle';
                    if (handlerConfig[i].hasOwnProperty('class')) {
                        className = handlerConfig[i]['class'];
                        delete handlerConfig[i]['class'];
                    }
                    this.addSection(handlerConfig[i], className, triggerHandler.children, metaSection);
                }
                subSection.children.push(triggerHandler);
            }
        }
        tree.push(subSection);
    }
};

