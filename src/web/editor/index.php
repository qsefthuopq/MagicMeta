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
    <link rel="stylesheet" href="css/editor.css"/>
    <script src="//code.jquery.com/jquery-3.3.1.min.js"></script>
    <script src="//code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
    <script src="common/js/user.js"></script>
    <script src="js/codemirror.js"></script>
    <script src="js/js-yaml.min.js"></script>
    <script src="js/yaml.js"></script>
    <script src="js/editor.js"></script>
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
            <button type="button" id="saveButton">Save</button>
        </span>
        <span>
            <button type="button" id="loadButton">Load</button>
        </span>
        <span>
            <button type="button" id="newButton">New</button>
        </span>
        <span id="modeSelector">
            <input type="radio" name="editorMode" id="editorModeButton"><label for="editorModeButton">Editor</label>
            <input type="radio" name="editorMode" id="codeModeButton" checked="checked"><label for="codeModeButton">Code</label>
        </span>
        <span>
            <button type="button" id="validateButton">Check</button>
        </span>
        <span id="referenceButtonContainer">
            <button type="button" id="referenceButton">Reference</button>
        </span>
        <?php include "common/userinfo.inc.php" ?>
    </div>
    <div id="guiEditor" style="display: none">
        Coming Soon (ish)!
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
