
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
    var WORD = /[\w\.]+/;
    var OBJECT_KEY = /^[\s-]*?(\w+)\s*?:\s*?$/;
    var LEAF_KV = /^[\s-]*?(\w+)\s*?:\s*?/;
    var WORD_OR_COLON = /\w+|:/;
    var WORD_OR_COLON_OR_DASH = /-\w+|:/;

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

    function getListIndentation(line, tabSizeInSpaces) {
        var s = 0;
        while (s < line.length && !WORD_OR_COLON_OR_DASH.test(line.charAt(s))) s++;
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

    function getParent(pos, indent, cm, tabSizeInSpaces) {
        if (pos.line == 0) return null;
        var thisLine = cm.getLine(pos.line);
        var currentLine = pos.line;
        currentLine--;
        while (currentLine > 0) {
            thisLine = cm.getLine(currentLine);
            var thisIndent = getIndentation(thisLine, tabSizeInSpaces);
            if (thisIndent <= indent)
                return thisLine.trim().replace(':', '');
            currentLine--;
        }

        return null;
    }

    function getPreviousSibling(pos, indent, cm, tabSizeInSpaces) {
        if (pos.line == 0) return null;
        var currentLine = pos.line;
        currentLine--;
        while (currentLine > 0) {
            var thisLine = cm.getLine(currentLine);
            var thisIndent = getListIndentation(thisLine, tabSizeInSpaces);
            if (thisIndent == indent) return thisLine.trim().replace(':', '');
            currentLine--;
        }

        return null;
    }

    function getSiblings(pos, indent, cm, tabSizeInSpaces) {
        var siblings = {};
        if (pos.ch < indent) indent = pos.ch;
        var startLine = pos.line;
        var currentLine = pos.line;
        currentLine--;
        while (currentLine > 0) {
            var thisLine = cm.getLine(currentLine);
            var trimmed = thisLine.trim();
            var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
            var isObject = thisLine.indexOf(':') > 0;
            var thisIndent = getIndentation(thisLine, tabSizeInSpaces);

            if (!isEmpty && thisIndent < indent) break;
            if (isObject && thisIndent == indent) {
                var kv = getKeyValue(thisLine);
                siblings[kv[0]] = kv[1];
            }
            if (thisIndent <= indent && trimmed.startsWith("-")) break;
            currentLine--;
        }
        currentLine = startLine;
        while (currentLine < cm.lineCount()) {
            var thisLine = cm.getLine(currentLine);
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
            currentLine++;
        }
        return siblings;
    }

    function walkUp(pos, indent, cm, tabSizeInSpaces) {
        var currentLine = pos.line;
        currentLine --;
        var thisLine = cm.getLine(currentLine);
        var trimmed = thisLine.trim();
        var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        while (currentLine > 0 && (!OBJECT_KEY.test(thisLine) || getIndentation(thisLine, tabSizeInSpaces) >= indent || isEmpty)) {
            // while this isn't the line we're looking for, move along
            currentLine --;
            thisLine = cm.getLine(currentLine);
            trimmed = thisLine.trim();
            isEmpty = trimmed.length == 0 || trimmed[0] == '#';
        }
        return currentLine;
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
            var line = walkUp(pos, thisIndentation, cm, tabSizeInSpaces);
            thisLine = cm.getLine(line);
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
                if (newMap == map) {
                    newMap = $.extend({}, map);
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

    function isInList(pos, indent, cm, tabSizeInSpaces) {
        if (pos.ch < indent) indent = pos.ch;
        var currentLine = pos.line;
        while (currentLine > 0) {
            var thisLine = cm.getLine(currentLine);
            var trimmed = thisLine.trim();
            if (trimmed.startsWith('-')) return true;
            var isEmpty = trimmed.length == 0 || trimmed[0] == '#';
            var thisIndent = getIndentation(thisLine, tabSizeInSpaces);

            if (!isEmpty && thisIndent < indent) break;
            if (thisIndent < indent) break;
            currentLine--;
        }
        return false;
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

    function RGBToHSV(hex) {
        // Remove quotes
        hex = hex.substring(1, hex.length - 1);

        // Get the RGB values to calculate the Hue.
        var r = parseInt(hex.substring(0,2),16)/255;
        var g = parseInt(hex.substring(2,4),16)/255;
        var b = parseInt(hex.substring(4,6),16)/255;

        // Getting the Max and Min values for Chroma.
        var max = Math.max.apply(Math, [r,g,b]);
        var min = Math.min.apply(Math, [r,g,b]);

        // Variables for HSV value of hex color.
        var chr = max-min;
        var hue = 0;
        var val = max;
        var sat = 0;

        if (val > 0) {
            // Calculate Saturation only if Value isn't 0.
            sat = chr/val;
            if (sat > 0) {
                if (r == max) {
                    hue = 60*(((g-min)-(b-min))/chr);
                    if (hue < 0) {hue += 360;}
                } else if (g == max) {
                    hue = 120+60*(((b-min)-(r-min))/chr);
                } else if (b == max) {
                    hue = 240+60*(((r-min)-(g-min))/chr);
                }
            }
        }

        return [hue, sat, val];
    }

    function convertHint(text, value, metadata, classType, valueType, inherited, defaultValue) {
        var description = null;
        var importance = 0;
        if (classType && metadata && value && metadata[classType].hasOwnProperty(value)) {
            var dataType = metadata[classType][value];
            description = dataType['description'];
            importance = dataType['importance'];
        } else {
            description = value == null ? null : [value]
        }

        if (importance == 0 && valueType == 'color') {
            importance = RGBToHSV(text)[0];
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

    function trimTags(description) {
        if (description == null) return description;
        var index = description.lastIndexOf('>');
        if (index > 0 && index < description.length - 1) {
            description = description.substring(index + 1);
        }

        return description;
    }

    function getSorted(values, inheritedValues, defaultValue, word, suffix, metadata, classType, valueType) {
        var includeContains = true;
        switch (valueType) {
            case 'milliseconds':
            case 'percentage':
                includeContains = false;
                break;
            case 'integer':
                includeContains = false;
                values = $.extend({}, values);
                if (defaultValue != null) {
                    addMultiples(defaultValue, values, 0);
                }
                if (word != '') {
                    values[word] = null;
                    addPowersOfTen(parseInt(word), values);
                }
                break;
            case 'double':
                includeContains = false;
                values = $.extend({}, values);
                if (defaultValue != null) {
                    addMultiples(defaultValue, values, 5);
                }
                if (word != '') {
                    values[word] = null;
                    addPowersOfTen(parseInt(word), values);
                }
                break;
        }

        var startsWith = [];
        var contains = [];
        var foundDefault = false;
        for (var kw in values) {
            var isDefault = defaultValue == kw;
            var description = values[kw];
            var trimmedDescription = trimTags(description);
            var match = kw + trimmedDescription;
            if (isDefault) foundDefault = true;
            if (match.indexOf(word) !== -1) {
                var hint = convertHint(kw + suffix, description, metadata, classType, valueType, false, isDefault);
                if (match.startsWith(word)) {
                    startsWith.push(hint);
                } else {
                    contains.push(hint);
                }
            }
        }
        if (inheritedValues != null) {
            for (var kw in inheritedValues) {
                var isDefault = defaultValue == kw;
                var description = inheritedValues[kw];
                var trimmedDescription = trimTags(description);
                var match = kw + trimmedDescription;
                if (isDefault) foundDefault = true;
                if (match.indexOf(word) !== -1) {
                    var hint = convertHint(kw + suffix, description, metadata, classType, valueType, true, isDefault);
                    if (match.startsWith(word)) {
                        startsWith.push(hint);
                    } else {
                        contains.push(hint);
                    }
                }
            }
        }

        if (defaultValue != null && !foundDefault && defaultValue.indexOf(word) !== -1) {
            if (defaultValue.startsWith(word)) {
                startsWith.push(convertHint(defaultValue + suffix, null, metadata, classType, valueType, false, true));
            } else {
                contains.push(convertHint(defaultValue + suffix, null, metadata, classType, valueType, false, true));
            }
        }

        function sortProperties(a, b) {
            if (a == word) {
                return -1;
            }
            if (b == word) {
                return 1;
            }
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
        if (includeContains) {
            startsWith = startsWith.concat(contains);;
        }
        return startsWith;
    }

    function addMultiples(value, values, decimalLimit) {
        values[value * 2] = null;
        values[value * 10] = null;
        var lessValue = value;
        while (decimalLimit >= 0) {
            lessValue /= 2;
            values[Math.floor(lessValue)] = null;
            if (lessValue < 1) decimalLimit--;
        }
        lessValue = value;
        while (decimalLimit >= 0) {
            lessValue /= 10;
            values[Math.floor(lessValue)] = null;
            if (lessValue < 1) decimalLimit--;
        }
    }

    function addPowersOfTen(value, values) {
        for (var i = 0; i < 3; i++) {
            value *= 10;
            values[value] = null;
        }
    }

    function makeList(properties) {
        var list = properties;
        properties = {};
        for (var key in list) {
            if (list.hasOwnProperty(key)) {
                properties["- " + key] = list[key];
            }
        }
        return properties;
    }

    function checkList(properties, pos, indent, cm, tabSizeInSpaces) {
        if (!isInList(pos, indent, cm, tabSizeInSpaces)) {
            properties = makeList(properties);
        }

        return properties
    };

    CodeMirror.registerHelper('hint', 'yaml', function(cm, opts) {
        if (cm.metadata == null) {
            return;
        }
        var metadata = cm.metadata;

        var tabSizeInSpaces = new Array(cm.options.tabSize + 1).join(' ');

        var cur = cm.getCursor(),
            curLine = cm.getLine(cur.line),
            token = cm.getTokenAt(cur);

        if (curLine.trim().startsWith("#")) return;

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
        var indent = getIndentation(thisLine, tabSizeInSpaces);
        if (LEAF_KV.test(curLine)) {
            // if we'e on a line with a key get values for that key
            var values = {};
            var classType = '';
            var valueType = null;
            var defaultValue = null;
            var fieldName = hierarchy[hierarchy.length - 1];
            if (hierarchy.length == 2) {
                // Base spell property values
                if (metadata.spell_context.properties.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.properties[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = metadata.properties[propertyKey].type;
                        values = metadata.types[valueType].options;
                    }
                }
            } else if (hierarchy.length == 3 && hierarchy[1] == 'parameters') {
                // Base spell parameter values
                if (metadata.spell_context.parameters.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.parameters[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = metadata.properties[propertyKey].type;
                        values = metadata.types[valueType].options;
                    }
                } else {
                    // Action-specific parameter values
                    var actions = getAllActions(cm, tabSizeInSpaces);
                    for (var i = 0; i < actions.length; i++) {
                        var action = actions[i];
                        if (metadata.spell_context.actions.hasOwnProperty(action) && metadata.spell_context.actions[action].hasOwnProperty(fieldName)) {
                            var propertyKey =  metadata.spell_context.actions[action][fieldName];
                            if (metadata.properties.hasOwnProperty(propertyKey)) {
                                valueType = metadata.properties[propertyKey].type;
                                values = metadata.types[valueType].options;
                            }
                        }
                    }
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'actions' && fieldName == 'class') {
                // Action classes
                values = metadata.spell_context.action_classes;
                classType = 'actions';
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects' && fieldName == 'class') {
                // Effectlib classes
                values = metadata.spell_context.effectlib_classes;
                classType = 'effectlib_effects';
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'actions') {
                // Action parameter values
                var propertyKey = null;
                if (metadata.spell_context.action_parameters.hasOwnProperty(fieldName)) {
                    propertyKey = metadata.spell_context.action_parameters[fieldName];
                    if (metadata.action_parameters.hasOwnProperty(propertyKey)) {
                        defaultValue = metadata.action_parameters[propertyKey];
                    }
                }
                var shortClass = getCurrentClass(pos, indent, cm, tabSizeInSpaces);
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
                    valueType = metadata.properties[propertyKey].type;
                    values = metadata.types[valueType].options;
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects' && hierarchy[hierarchy.length - 2] == 'effectlib') {
                // Effectlib parameter values
                var propertyKey = null;
                if (metadata.spell_context.effectlib_parameters.hasOwnProperty(fieldName)) {
                    propertyKey = metadata.spell_context.effectlib_parameters[fieldName];
                    if (metadata.effectlib_parameters.hasOwnProperty(propertyKey)) {
                        defaultValue = metadata.effectlib_parameters[propertyKey];
                    }
                }
                var shortClass = getCurrentClass(pos, indent, cm, tabSizeInSpaces);
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
                    valueType = metadata.properties[propertyKey].type;
                    values = metadata.types[valueType].options;
                }
            } else if (hierarchy.length >= 4 && hierarchy[1] == 'effects') {
                // Effect parameter values
                if (metadata.spell_context.effect_parameters.hasOwnProperty(fieldName)) {
                    var propertyKey = metadata.spell_context.effect_parameters[fieldName];
                    if (metadata.properties.hasOwnProperty(propertyKey)) {
                        valueType = metadata.properties[propertyKey].type;
                        values = metadata.types[valueType].options;
                    }
                }
            }

            result = getSorted(values, null, defaultValue, word, '', metadata, classType, valueType);
        } else {
            // else, do suggestions for new property keys
            var properties = {};
            var inherited = null;
            var suffix = ': ';
            if (hierarchy.length == 2 && hierarchy[1] == '') {
                // Add base parameters
                properties = metadata.spell_context.properties;
            } else if (hierarchy.length >= 3 && hierarchy[hierarchy.length - 1] == '' && hierarchy[1] == 'parameters') {
                // Add base parameters
                var actions = getAllActions(cm, tabSizeInSpaces);
                for (var i = 0; i < actions.length; i++) {
                    var action = actions[i];
                    if (metadata.spell_context.actions.hasOwnProperty(action)) {
                        properties = $.extend(properties, metadata.spell_context.actions[action]);
                    }
                }
                if (hierarchy.length == 3) {
                    inherited = metadata.spell_context.parameters;
                } else {
                    // Search for map property
                    for (var field in properties) {
                        if (properties.hasOwnProperty(field) && field == hierarchy[hierarchy.length - 2]) {
                            var propertyKey = properties[field];
                            var propertyType = metadata.properties[propertyKey].type;
                            propertyType = metadata.types[propertyType];
                            if (propertyType.hasOwnProperty('key_type')) {
                                propertyType = metadata.types[propertyType.key_type];
                                properties = propertyType.options;
                            } else if (propertyType.hasOwnProperty('value_type')) {
                                propertyType = metadata.types[propertyType.value_type];
                                properties = propertyType.options;
                                properties = checkList(properties, pos, indent, cm, tabSizeInSpaces);
                                suffix = '';
                            }
                        }
                    }
                }
            } else if (hierarchy.length == 4 && hierarchy[3] == '' && hierarchy[1] == 'effects') {
                // Base effect parameters
                properties = metadata.spell_context.effect_parameters;

                // Check if this is at the same indent level as a list, if so add - to suggestions
                var previousSibling = getPreviousSibling(pos, indent, cm, tabSizeInSpaces);
                if (previousSibling != null && previousSibling.startsWith('-')) {
                    properties = makeList(properties);
                } else {
                    properties = checkList(properties, pos, indent, cm, tabSizeInSpaces);
                }
            } else if (hierarchy.length >= 5 && hierarchy[hierarchy.length - 1] == '' && hierarchy[3] == 'effectlib') {
                // Effectlib parameters
                inherited = metadata.spell_context.effectlib_parameters;
                var effectClass = getCurrentClass(pos, indent, cm, tabSizeInSpaces, "Effect");
                if (effectClass != null) {
                    if (metadata.spell_context.effects.hasOwnProperty(effectClass)) {
                        properties = metadata.spell_context.effects[effectClass];
                    }
                }
            } else if (hierarchy.length >= 4 && hierarchy[hierarchy.length - 1] == '' && hierarchy[1] == 'actions') {
                // Action parameters
                inherited = metadata.spell_context.action_parameters;
                var actionClass = getCurrentClass(pos, indent, cm, tabSizeInSpaces, "Action");
                if (actionClass != null) {
                    if (metadata.spell_context.actions.hasOwnProperty(actionClass)) {
                        properties = metadata.spell_context.actions[actionClass];
                    }

                    inherited = checkList(inherited, pos, indent, cm, tabSizeInSpaces);
                    properties = checkList(properties, pos, indent, cm, tabSizeInSpaces);
                } else {
                    inherited = makeList(inherited);
                    properties = makeList(properties);
                }
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && (hierarchy[1] == 'costs' || hierarchy[1] == 'active_costs')) {
                // Costs
                properties = metadata.types.cost_type.options;
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && hierarchy[1] == 'actions') {
                // Action triggers
                properties = {'cast': null, 'alternate_down': null, 'alternate_up': null, 'alternate_sneak': null};
                var parent = getParent(pos, indent, cm, tabSizeInSpaces);
                if (parent != "actions") {
                    properties['- class'] = null;
                }
            } else if (hierarchy.length == 3 && hierarchy[2] == '' && hierarchy[1] == 'effects') {
                // Effect triggers
                properties = {'cast': null, 'tick': null, 'hit': null, 'hit_entity': null, 'hit_block': null,
                'blockmiss': null, 'prehit': null, 'step': null, 'reflect': null, 'miss': null, 'headshot': null};

                var parent = getParent(pos, indent, cm, tabSizeInSpaces);
                if (parent != "effects") {
                    properties['- location'] = null;
                }
            }
            var siblings = getSiblings(pos, indent, cm, tabSizeInSpaces);
            properties = filterMap(properties, siblings);
            if (inherited != null) {
                inherited = filterMap(inherited, siblings);
            }
            result = getSorted(properties, inherited, null, word, suffix, metadata, 'properties', null);
        }

        var suggestion = false;
        for (var key in result) {
            if (result.hasOwnProperty(key) && result[key].text != word) {
                suggestion = true;
                break;
            }
        }
        if (suggestion) {
            return {
                list: result,
                from: CodeMirror.Pos(cur.line, start),
                to: CodeMirror.Pos(cur.line, end)
            };
        }
    });
});