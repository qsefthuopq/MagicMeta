
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
    var OBJECT_KEY = /^\s*?(\w+)\s*?:\s*?$/;
    var LEAF_KV = /^\s*?(\w+)\s*?:\s*?/;
    var WORD_OR_COLON = /\w+|:/;

    // global constants that will show up regardless of context
    var CONSTANTS = ['true', 'false', '{}', '[]'];

    // context specific keywords
    var KEYWORDS= {
        'configuration': [],
        'name': ['myService'],
        'provider': {
            'image': ['ubuntu12.04', 'centos7.0', 'ubuntu14.04', 'centos6.5', 'fedora20'],
            'name': ['\'digitalocean\'', '\'aws\'', '\'rackspace\''],
            'region': ['nyc1', 'nyc2', 'sfo1'],
            'size': ['512mb']
        },
        'services': {
            'nginx': ['*'],
            'php': ['*']
        }
    };

    function addUnique(kw, result) {
        // add if not already in result set
        if (!kw || result.indexOf(kw) !== -1) {
            return;
        }
        result.push(kw);
    }

    function rstrip(line) {
        return line.replace(/\s*$/g, '');
    }

    function getIndentation(line, tabSizeInSpaces) {
        if (!line.match(/^\s*?$/)) {
            // only strip if line isn't all whitespace
            line = rstrip(line);
        }

        // walk left from right until whitespace or eol
        var s = line.length;
        while (s && WORD_OR_COLON.test(line.charAt(s - 1))) --s;
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
    }

    function walkUp(pos, indent, cm, tabSizeInSpaces) {
        pos.line --;
        var thisLine = cm.getLine(pos.line);
        while (!OBJECT_KEY.test(thisLine) && getIndentation(thisLine, tabSizeInSpaces) >= indent) {
            // while this isn't the line we're looking for, move along
            pos.line --;
            thisLine = cm.getLine(pos.line);
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

    CodeMirror.registerHelper('hint', 'yaml', function(cm, opts) {
        var constants = opts.constants || CONSTANTS;
        var keywords = opts.keywords || KEYWORDS;
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
        var context = keywords;
        var contextKeywords = [];
        var hierarchy = getHierarchy(CodeMirror.Pos(cur.line, cur.ch), cm, tabSizeInSpaces).reverse();

        // walk down contexts
        for (var h in hierarchy) {
            context = context[hierarchy[h]];
        }
        if (context instanceof Array) {
            // is array of suggested values
            contextKeywords = context;
        } else {
            contextKeywords = Object.keys(context);
        }

        if (LEAF_KV.test(curLine)) {
            // if we'e on a line with a key
            var valueKeywords = contextKeywords.concat(constants);
            for (var c in valueKeywords) {
                var kw = valueKeywords[c];
                if (kw.indexOf(word) !== -1) {
                    addUnique(kw, result);
                }
            }
        } else {
            // else, do contextual suggestions
            for (var i in contextKeywords) {
                var kw = contextKeywords[i];
                if (kw.indexOf(word) !== -1) {
                    if (context[kw] instanceof Array) {
                        kw += ': ';
                    } else {
                        // if this context has additional contexts below it, it is a key, and add a colon
                        // Ideally, I'd like to have it auto newline as well, but I don't think there's a good way to do that
                        // and have it auto indent correctly, adhering to spaces or tabs
                        kw += ':\n';
                    }
                    addUnique(kw, result);
                }
            }
        }

        if (result.length) {
            return {
                list: result,
                from: CodeMirror.Pos(cur.line, start),
                to: CodeMirror.Pos(cur.line, end)
            };
        }
    });
});