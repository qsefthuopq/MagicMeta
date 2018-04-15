function CodeEditor(container)
{
    this.editor = CodeMirror.fromTextArea(container.get(0), {
        lineNumbers: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
        mode: "text/x-yaml",
        extraKeys: {
            "Ctrl-S": function() { editor.save(); },
            "Ctrl-D": function() { editor.validate(); },
            'Shift-Tab': 'indentLess',
            'Tab': 'indentMore',
            "Ctrl-Space": "autocomplete"
        }
    });
    this.validateTimeout = null;
    var me = this;
    var cm = this.editor;
    this.editor.on('change', function onChange(editor, input) {

        if (input.from.line != input.to.line) return;
        var line = cm.getLine(input.from.line);
        if (line.indexOf(':') > 0 && !line.endsWith(' ')) return;
        if (line.trim().startsWith('-') && !line.endsWith(' ')) return;
        CodeMirror.commands.autocomplete(cm, null, {
            // closeOnUnfocus: false,
            completeSingle: false
        });
    });
    this.editor.metadata = null;
    this.markedErrors = [];
};

CodeEditor.prototype.startValidateTimer = function() {
    if (this.validateTimeout != null) {
        clearTimeout(this.validateTimeout);
    }
    var me = this;
    this.validateTimeout = setTimeout(function() {
        me.validateTimeout = null;
        editor.validate();
    }, 2000);
};

CodeEditor.prototype.setValue = function(yaml)
{
    this.editor.setValue(yaml);
};

CodeEditor.prototype.getValue = function()
{
    return this.editor.getValue();
};

CodeEditor.prototype.clearErrors = function()
{
    for (var i = 0; i < this.markedErrors.length; i++) {
        this.markedErrors[i].clear();
    }
    this.markedErrors = [];
};

CodeEditor.prototype.showError = function(e)
{
    var lineNumber = e.mark.line;
    var line = this.editor.getLine(lineNumber);
    var startOfLine = 0;
    while (startOfLine < line.length && line[startOfLine] == ' ') startOfLine++;
    if (startOfLine >= e.mark.column) startOfLine = 0;
    var marked = this.editor.markText({line: lineNumber, ch: startOfLine}, {line: lineNumber, ch: e.mark.column}, {className: 'syntax-error', title: e.message});
    this.markedErrors.push(marked);
};

CodeEditor.prototype.setMetadata = function(meta)
{
    this.editor.metadata = meta;
};