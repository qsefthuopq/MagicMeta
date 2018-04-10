<?php
require_once('../config.inc.php');
require_once('common/user.inc.php');
if (!$sandboxServer) die('No sandbox server defined');

$user = getUser();

?>

<html>
<head>
    <title><?= $title ?> Editor</title>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"/>
    <link rel="stylesheet" href="common/css/common.css" />
    <link rel="stylesheet" href="common/css/loading.css" />
    <link rel="stylesheet" href="common/css/user.css"/>
    <link rel="stylesheet" href="css/codemirror.css"/>
    <link rel="stylesheet" href="css/ui.fancytree.css"/>
    <link rel="stylesheet" href="css/editor.css"/>

    <script src="//code.jquery.com/jquery-3.3.1.min.js"></script>
    <script src="//code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/ui-contextmenu/jquery.ui-contextmenu.min.js"></script>
    <script src="common/js/user.js"></script>
    <script src="js/codemirror.js"></script>
    <script src="js/jquery.fancytree.min.js"></script>
    <script src="js/jquery.fancytree.table.js"></script>
    <script src="js/jquery.fancytree.dnd.js"></script>
    <script src="js/jquery.fancytree.edit.js"></script>
    <script src="js/js-yaml.min.js"></script>
    <script src="js/yaml.js"></script>
    <script src="js/editor.js"></script>
    <script src="js/codeeditor.js"></script>
    <script src="js/guieditor.js"></script>
    <script type="text/javascript">
        var user = <?= json_encode($user) ?>;
        var referenceURL = '//<?= $referenceURL ?>';
    </script>
    <?php if ($analytics) echo $analytics; ?>
</head>
<body>
<div id="container">
    <div id="header">
        <span id="saveButtonContainer">
            <button type="button" id="saveButton" title="Save your spell and reload the sandbox server configs">Save</button>
        </span>
        <span>
            <button type="button" id="loadButton" title="Load a saved spell, or one of the survival defaults">Load</button>
        </span>
        <span>
            <button type="button" id="forkButton" title="Make a copy of your current spell with a unique key name">Fork</button>
        </span>
        <span>
            <button type="button" id="newButton" title="Clear your spell and start fresh">New</button>
        </span>
        <span id="modeSelector">
            <input type="radio" name="editorMode" id="editorModeButton"><label for="editorModeButton" title="Use a graphical editor to build your spell">Editor</label>
            <input type="radio" name="editorMode" id="codeModeButton" checked="checked"><label for="codeModeButton" title="View the raw configuration code for your spell">Code</label>
        </span>
        <span>
            <button type="button" id="validateButton" title="Check your spell configuration for syntax errors">Check</button>
        </span>
        <span id="referenceButtonContainer">
            <button type="button" id="referenceButton" title="Open the reference guide in a new window">Reference</button>
        </span>
        <?php include "common/userinfo.inc.php" ?>
    </div>

    <div id="guiEditor" style="display: none">
        <div style="color: red">Work in progress, not yet functional!</div>
        <br/>
        <table id="editorTree">
            <colgroup>
                <col width="350px">
                <col width="400px">
            </colgroup>
            <tbody>
              <tr>
                <td></td>
                <td><input type="input" class="propertyInput"></td>
              </tr>
            </tbody>
          </table>
    </div>

    <div id="codeEditor">
        <textarea id="editor"></textarea>
    </div>
</div>

<?php include 'common/register.inc.php' ?>

<div id="loadSpellDialog" title="Load Spell" style="display:none">
    <table id="loadSpellsTable">
        <colgroup>
            <col><col><col><col style="width: 100%">
        </colgroup>
        <tbody id="loadSpellList">

        </tbody>
    </table>
</div>
</body>
</html>
