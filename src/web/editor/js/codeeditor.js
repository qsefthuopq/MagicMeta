function CodeEditor(container)
{
    var me = this;
    this.editor = CodeMirror.fromTextArea(container.get(0), {
        lineNumbers: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
        mode: "text/x-yaml",
        extraKeys: {
            "Ctrl-S": function() { editor.save(); },
            'Shift-Tab': 'indentLess',
            'Tab': 'indentMore',
            "Ctrl-Space": "autocomplete"
        }
    });
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
};

CodeEditor.prototype.setValue = function(yaml)
{
    this.editor.setValue(yaml);
};

CodeEditor.prototype.getValue = function()
{
    return this.editor.getValue();
};

CodeEditor.prototype.setMetadata = function(meta)
{
    this.editor.metadata = meta;
};

CodeEditor.prototype.isValid = function() {
    var errors = CodeMirror.lint.yaml(this.getValue());
    return errors.length == 0;
};