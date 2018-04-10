function GUIEditor(container)
{
    this.tree = container.fancytree({
        extensions: ["dnd", "table", "edit"],
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
            triggerStart: ["clickActive", "dblclick", "mac+enter", "shift+click"],
            beforeEdit: function(event, data){
                return !data.node.isFolder();
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
};

GUIEditor.prototype.setValue = function(spellConfig)
{
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
    return '';
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

GUIEditor.prototype.convertSpellToTree = function(config) {
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
    this.addTriggers(config, 'actions', 'Actions', tree);
    this.addTriggers(config, 'effects', 'Effects', tree);

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
};

GUIEditor.prototype.addTriggers = function(config, section, title, tree) {
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
};

