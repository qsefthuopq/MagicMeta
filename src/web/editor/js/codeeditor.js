function CodeEditor(container)
{
    this.editor = CodeMirror.fromTextArea(container.get(0), {
        lineNumbers: true,
        extraKeys: {
            "Ctrl-S": function() { editor.save(); },
            "Ctrl-D": function() { editor.validate(); },
            "Ctrl-Space": "autocomplete"
        }
    });
    var cm = this.editor;
    this.editor.on('change', function onChange(editor, input) {
        CodeMirror.commands.autocomplete(cm, null, {
            completeSingle: false,
            customKeys: {
              Up: function(cm, handle) {handle.moveFocus(-1);},
              Down: function(cm, handle) {handle.moveFocus(1);},
              PageUp: function(cm, handle) {handle.moveFocus(-handle.menuSize() + 1, true);},
              PageDown: function(cm, handle) {handle.moveFocus(handle.menuSize() - 1, true);},
              Home: function(cm, handle) {handle.setFocus(0);},
              End: function(cm, handle) {handle.setFocus(handle.length - 1);},
              Tab: function(cm, handle) {handle.pick();},
              Esc: function(handle) {handle.close();}
            }
        });
    });
    this.editor.metadata = null;
    this.markedErrors = [];
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