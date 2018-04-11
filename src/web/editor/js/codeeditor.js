function CodeEditor(container)
{
    this.editor = CodeMirror.fromTextArea(container.get(0), {
        lineNumbers: true,
        extraKeys: {
            "Ctrl-S": save,
            "Ctrl-D": validate,
            "Ctrl-Space": "autocomplete"
        }
    });
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

};