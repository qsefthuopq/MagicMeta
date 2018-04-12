
// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
// Modified from:
// https://github.com/Wiredcraft/cm-yaml-autocomplete/blob/develop/lib/yaml-hint.js

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"), require("../../mode/css/css"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror", "../../mode/css/css"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    var WHITESPACE = /\s+/;
    var WORD = /\w+/;
    var OBJECT_KEY = /^[\s-]*?(\w+)\s*?:\s*?$/;
    var LEAF_KV = /^[\s-]*?(\w+)\s*?:\s*?/;
    var WORD_OR_COLON = /\w+|:/;

    function rstrip(line) {
        return line.replace(/\s*$/g, '');
    }

    function getIndentation(line, tabSizeInSpaces) {
        var s = 0;
        while (s < line.length && !WORD_OR_COLON.test(line.charAt(s))) s++;
        line = line.slice(0, s);
        // change tabs to spaces
        line = line.replace(/\t/g, tabSizeInSpaces);
        // return the number of spaces
        return line.length;
    }

    function getKeyFromLine(line) {
        var m = line.match(LEAF_KV);
        if (m) {
            return m[1];
        }
        return "";
    }

    function getKeyValue(line) {
        line = line.replace('- ', '');
        var kv = line.split(':');
        kv[0] = kv[0].trim();
        if (kv.length == 0) {
            kv[1] = '';
        } else {
            kv[1] = kv[1].trim();
        }
        return kv;
    }

    function getSiblings(pos, indent, cm, tabSizeInSpaces) {
        var siblings = {};
        if (pos.ch < indent) indent = pos.ch;
        var startLine = pos.line;
        pos.line--;
        while (pos.line > 0) {
            var thisLine = cm.getLine(pos.line);
            var trimmed = thisLine.trim();
            var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
            var isObject = thisLine.indexOf(':') > 0;
            var thisIndent = getIndentation(thisLine, tabSizeInSpaces);

            if (!isEmpty && thisIndent < indent) break;
            if (isObject && thisIndent == indent) {
                var kv = getKeyValue(thisLine);
                siblings[kv[0]] = kv[1];
            }
            pos.line--;
        }
        pos.line = startLine;
        while (pos.line < cm.lineCount()) {
            var thisLine = cm.getLine(pos.line);
            var trimmed = thisLine.trim();
            if (trimmed.startsWith("-")) break;
            var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
            var isObject = thisLine.indexOf(':') > 0;
            var thisIndent = getIndentation(thisLine, tabSizeInSpaces);

            if (!isEmpty && thisIndent < indent) break;
            if (isObject && thisIndent == indent) {
                var kv = getKeyValue(thisLine);
                siblings[kv[0]] = kv[1];
            }
            pos.line++;
        }
        return siblings;
    }

    function walkUp(pos, indent, cm, tabSizeInSpaces) {
        pos.line --;
        var thisLine = cm.getLine(pos.line);
        var trimmed = thisLine.trim();
        var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        while (pos.line > 0 && (!OBJECT_KEY.test(thisLine) || getIndentation(thisLine, tabSizeInSpaces) >= indent || isEmpty)) {
            // while this isn't the line we're looking for, move along
            pos.line --;
            thisLine = cm.getLine(pos.line);
            trimmed = thisLine.trim();
            isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        }
        pos.ch = cm.getLine(pos.line);
        return pos;
    }

    function getHierarchy(pos, cm, tabSizeInSpaces) {
        var hierarchy = [];
        var thisLine = cm.getLine(pos.line);

        var isHighestContext = (getIndentation(thisLine, tabSizeInSpaces) === 0);
        var isIndentedBlock = (pos.ch !== 0 && getIndentation(thisLine, tabSizeInSpaces) !== 0);

        var thisIndentation = getIndentation(thisLine, tabSizeInSpaces);
        while (pos.ch !== 0 && thisIndentation) {
            // while not at beginning of line (highest point in hierarchy)
            // OR we have reached highest hierarchy (no indentation)
            var k = getKeyFromLine(thisLine);
            if (k !== undefined) {
                hierarchy.push(k);
            }
            pos = walkUp(pos, thisIndentation, cm, tabSizeInSpaces);
            thisLine = cm.getLine(pos.line);
            thisIndentation = getIndentation(thisLine, tabSizeInSpaces);
        }

        if (!isHighestContext || isIndentedBlock) {
            // is an indented block, add the above level's key
            hierarchy.push(getKeyFromLine(thisLine));
        }

        return hierarchy;
    }

    function filterMap(map, toRemove) {
        var newMap = map;
        for (var key in toRemove) {
            if (toRemove.hasOwnProperty(key) && map.hasOwnProperty(key)) {
                if (newMap == null) {
                    newMap = $.extend(map);
                }
                delete newMap[key];
            }
        }
        return newMap;
    }

    function getAllActions(cm, tabSizeInSpaces) {
        var actionsStart = 0;
        var actionsIndent = 0;
        for (var i = 1; i < cm.lineCount(); i++) {
            var line = cm.getLine(i);
            actionsIndent = getIndentation(line, tabSizeInSpaces);
            if (line.trim() == 'actions:') {
                actionsStart = i;
                break;
            }
        }

        var actions = [];
        var current = actionsStart + 1;
        while (current < cm.lineCount()) {
            var line = cm.getLine(current);
            var indent = getIndentation(line, tabSizeInSpaces);
            if (indent <= actionsIndent) break;
            line = line.replace("-", "").trim();
            if (line.startsWith("class:")) {
                var action = line.replace("class: ", "");
                if (!action.endsWith("Action")) {
                    action = action + "Action";
                }
                actions.push(action);
            }
            current++;
        }

        return actions;
    }

    function addSuffix(text, suffix) {
        if (suffix && !text.endsWith(suffix)) {
            text = text + suffix;
        }
        return text;
    }

    function getCurrentClass(pos, indent, cm, tabSizeInSpaces, suffix) {
        var siblings = getSiblings(pos, indent, cm, tabSizeInSpaces);
        var currentClass = null;
        if (siblings.hasOwnProperty("class")) {
            currentClass = siblings['class'];
            currentClass = addSuffix(currentClass, suffix);
        }
        return currentClass;
    }

    function renderHint(element, pos, hint) {
        var titleCell = $('<td>').text(hint.text);
        if (hint.inherited) {
            titleCell.addClass('inheritedProperty');
        }
        if (hint.isDefault) {
            titleCell.addClass('defaultProperty');
        }
        $(element).append(titleCell);
        var description = $('<div>');
        if (hint.description != null && hint.description.length > 0) {
            for (var i = 0; i < hint.description.length; i++) {
                if (i != 0) {
                    description.append($('<br/>'));
                }
                description.append($('<span>').html(hint.description[i]));
            }
        }
        $(element).append($('<td>').append(description));
    }

    function convertHint(text, value, metadata, valueType, inherited, defaultValue) {
        var description = null;
        var importance = 0;
        if (valueType && metadata && value && metadata[valueType].hasOwnProperty(value)) {
            var dataType = metadata[valueType][value];
            description = dataType['description'];
            importance = dataType['importance'];
        } else {
            description = value == null ? null : [value]
        }
        var hint = {
            text: text,
            description: description,
            render: renderHint,
            importance: importance,
            inherited: inherited,
            isDefault: defaultValue
        };
        return hint;
    }

    function getSorted(values, inheritedValues, defaultValue, word, suffix, metadata, valueType) {
        var startsWith = [];
        var contains = [];
        var foundDefault = false;
        for (var kw in values) {
            var isDefault = defaultValue == kw;
            if (isDefault) foundDefault = true;
            if (kw.indexOf(word) !== -1) {
                var hint = convertHint(kw + suffix, values[kw], metadata, valueType, false, isDefault);
                if (kw.startsWith(word)) {
                    startsWith.push(hint);
                } else {
                    contains.push(hint);
                }
            }
        }
        if (inheritedValues != null) {
            for (var kw in inheritedValues) {
                var isDefault = defaultValue == kw;
                if (isDefault) foundDefault = true;
                if (kw.indexOf(word) !== -1) {
                    var hint = convertHint(kw + suffix, inheritedValues[kw], metadata, valueType, true, isDefault);
                    if (kw.startsWith(word)) {
                        startsWith.push(hint);
                    } else {
                        contains.push(hint);
                    }
                }
            }
        }

        if (defaultValue != null && !foundDefault && defaultValue.indexOf(word) !== -1) {
            if (defaultValue.startsWith(word)) {
                startsWith.push(convertHint(defaultValue + suffix, null, metadata, valueType, false, true));
            } else {
                contains.push(convertHint(defaultValue + suffix, null, metadata, valueType, false, true));
            }
        }

        function sortProperties(a, b) {
            if (a.isDefault && !b.isDefault) {
                return -1;
            }
            if (!a.isDefault && b.isDefault) {
                return 1;
            }
            if (a.inherited && !b.inherited) {
                return 1;
            }
            if (!a.inherited && b.inherited) {
                return -1;
            }
            if (a.importance == b.importance) {
                return a.text.localeCompare(b.text);
            }
            return b.importance - a.importance;
        }
        startsWith.sort(sortProperties);
        contains.sort(sortProperties);
        return startsWith.concat(contains);
    }

    CodeMirror.registerHelper('hint', 'yaml', function(cm, opts) {
        if (cm.metadata == null) {
            return;
        }
        var metadata = cm.metadata;

        var tabSizeInSpaces = new Array(cm.options.tabSize + 1).join(' ');

        var cur = cm.getCursor(),
            curLine = cm.getLine(cur.line),
            token = cm.getTokenAt(cur);

        var start = token.end,
            end = token.end;

        // walk `start` back until whitespace char or end of line
        while (start && WORD.test(curLine.charAt(start - 1))) --start;
        // walk `end` forwards until non-word or end of line
        while (end < curLine.length && WORD.test(curLine.charAt(end))) ++end;

        var word = curLine.slice(start, end);
        var result = [];

        // get context of hierarchy
        var hierarchy = getHierarchy(CodeMirror.Pos(cur.line, cur.ch), cm, tabSizeInSpaces).reverse();
        if (cm.debug) console.log(hierarchy);
        var pos = CodeMirror.Pos(cur.line, cur.ch);
        var thisLine = cm.getLine(pos.line);
        if (LEAF_KV.test(curLine)) {
            // if we'e on a line with a key get values for that key
            var values = {};
            var valueType = '';
            var defaultValue = null;
            var fieldName = hierarchy[hierarchy.length - 1];
            if (hierarchy.length == 2) {
                if (metadata.spell_context.properties.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.properties[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        values = metadata.types[metadata.properties[propertyKey].type].options;
                    }
                }
            } else if (hierarchy.length == 3 && hierarchy[1] == 'parameters') {
                if (metadata.spell_context.parameters.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.parameters[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        values = metadata.types[metadata.properties[propertyKey].type].options;
                    }
                } else {
                    var actions = getAllActions(cm, tabSizeInSpaces);
                    for (var i = 0; i < actions.length; i++) {
                        var action = actions[i];
                        if (metadata.spell_context.actions.hasOwnProperty(action) && metadata.spell_context.actions[action].hasOwnProperty(fieldName)) {
                            var propertyKey =  metadata.spell_context.actions[action][fieldName];
                            if (metadata.properties.hasOwnProperty(propertyKey)) {
                                values = metadata.types[metadata.properties[propertyKey].type].options;
                            }
                        }
                    }
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'actions' && fieldName == 'class') {
                values = metadata.spell_context.action_classes;
                valueType = 'actions';
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects' && fieldName == 'class') {
                values = metadata.spell_context.effectlib_classes;
                valueType = 'effectlib_effects';
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'actions') {
                var propertyKey = null;
                if (metadata.spell_context.action_parameters.hasOwnProperty(fieldName)) {
                    propertyKey = metadata.spell_context.action_parameters[fieldName];
                    if (metadata.action_parameters.hasOwnProperty(propertyKey)) {
                        defaultValue = metadata.action_parameters[propertyKey];
                    }
                }
                var shortClass = getCurrentClass(pos, getIndentation(thisLine, tabSizeInSpaces), cm, tabSizeInSpaces);
                if (shortClass != null) {
                    var actionClass = addSuffix(shortClass, "Action");
                    if (propertyKey == null && metadata.spell_context.actions.hasOwnProperty(actionClass)) {
                        propertyKey = metadata.spell_context.actions[actionClass][fieldName];
                    }

                    if (propertyKey != null && metadata.spell_context.action_classes.hasOwnProperty(shortClass)) {
                        var classKey = metadata.spell_context.action_classes[shortClass];
                        if (metadata.actions[classKey].parameters.hasOwnProperty(propertyKey)) {
                            defaultValue = metadata.actions[classKey].parameters[propertyKey];
                        }
                    }
                }
                if (propertyKey != null && metadata.properties.hasOwnProperty(propertyKey)) {
                    values = metadata.types[metadata.properties[propertyKey].type].options;
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects' && hierarchy[hierarchy.length - 2] == 'effectlib') {
                var propertyKey = null;
                if (metadata.spell_context.effectlib_parameters.hasOwnProperty(fieldName)) {
                    propertyKey = metadata.spell_context.effectlib_parameters[fieldName];
                    if (metadata.effectlib_parameters.hasOwnProperty(propertyKey)) {
                        defaultValue = metadata.effectlib_parameters[propertyKey];
                    }
                }
                var shortClass = getCurrentClass(pos, getIndentation(thisLine, tabSizeInSpaces), cm, tabSizeInSpaces);
                if (shortClass != null) {
                    var effectClass = addSuffix(shortClass, "Effect");
                    if (propertyKey == null && metadata.spell_context.effects.hasOwnProperty(effectClass)) {
                        propertyKey = metadata.spell_context.effects[effectClass][fieldName];
                    }

                    if (propertyKey != null && metadata.spell_context.effectlib_classes.hasOwnProperty(shortClass)) {
                        var classKey = metadata.spell_context.effectlib_classes[shortClass];
                        if (metadata.effectlib_effects[classKey].parameters.hasOwnProperty(propertyKey)) {
                            defaultValue = metadata.effectlib_effects[classKey].parameters[propertyKey];
                        }
                    }
                }
                if (propertyKey != null && metadata.properties.hasOwnProperty(propertyKey)) {
                    values = metadata.types[metadata.properties[propertyKey].type].options;
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects') {
                if (metadata.spell_context.effect_parameters.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.effect_parameters[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        values = metadata.types[metadata.properties[propertyKey].type].options;
                    }
                }
            }
            result = getSorted(values, null, defaultValue, word, '', metadata, valueType);
        } else {
            // else, do suggestions for new property keys
            var properties = {};
            var inherited = null;
            if (hierarchy.length == 2 && hierarchy[1] == '') {
                // Add base parameters
                properties = metadata.spell_context.properties;
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && hierarchy[1] == 'parameters') {
                // Add base parameters
                inherited = metadata.spell_context.parameters;
                var actions = getAllActions(cm, tabSizeInSpaces);
                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i];
                    if (metadata.spell_context.actions.hasOwnProperty(action)) {
                        properties = metadata.spell_context.actions[action];
                    }
                }
            } else if (hierarchy.length == 4 && hierarchy[3] == '' && hierarchy[1] == 'effects') {
                properties = metadata.spell_context.effect_parameters;
            } else if (hierarchy.length >= 5 && hierarchy[hierarchy.length - 1] == '' && hierarchy[3] == 'effectlib') {
                inherited = metadata.spell_context.effectlib_parameters;
                var effectClass = getCurrentClass(pos, getIndentation(thisLine, tabSizeInSpaces), cm, tabSizeInSpaces, "Effect");
                if (effectClass != null) {
                    if (metadata.spell_context.effects.hasOwnProperty(effectClass)) {
                        properties = metadata.spell_context.effects[effectClass];
                    }
                }
            } else if (hierarchy.length >= 4 && hierarchy[hierarchy.length - 1] == '' && hierarchy[1] == 'actions') {
                inherited = metadata.spell_context.action_parameters;
                var actionClass = getCurrentClass(pos, getIndentation(thisLine, tabSizeInSpaces), cm, tabSizeInSpaces, "Action");
                if (actionClass != null) {
                    if (metadata.spell_context.actions.hasOwnProperty(actionClass)) {
                        properties = metadata.spell_context.actions[actionClass];
                    }
                }
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && (hierarchy[1] == 'costs' || hierarchy[1] == 'active_costs')) {
                properties = metadata.types.cost_type.options;
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && hierarchy[1] == 'actions') {
                properties = {'cast': null, 'alternate_down': null, 'alternate_up': null, 'alternate_sneak': null};
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && hierarchy[1] == 'effects') {
                properties = {'cast': null, 'tick': null, 'hit': null, 'hit_entity': null, 'hit_block': null,
                'blockmiss': null, 'prehit': null, 'step': null, 'reflect': null, 'miss': null, 'headshot': null};
            }
            var siblings = getSiblings(pos, getIndentation(thisLine, tabSizeInSpaces), cm, tabSizeInSpaces);
            properties = filterMap(properties, siblings);
            result = getSorted(properties, inherited, null, word, ': ', metadata, 'properties');
        }

        if (result.length > 0 && (result.length > 1 || result[0] != word)) {
            return {
                list: result,
                from: CodeMirror.Pos(cur.line, start),
                to: CodeMirror.Pos(cur.line, end)
            };
        }
    });
});