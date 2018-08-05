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
    <link rel="stylesheet" href="css/show-hint.css"/>
    <link rel="stylesheet" href="css/lint.css"/>
    <link rel="stylesheet" href="css/ui.fancytree.css"/>
    <link rel="stylesheet" href="css/editor.css"/>
    <link rel="stylesheet" href="css/tutorial.css"/>

    <script src="//code.jquery.com/jquery-3.3.1.min.js"></script>
    <script src="//code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
    <script src="common/js/user.js"></script>
    <script src="js/codemirror.js"></script>
    <script src="js/show-hint.js"></script>
    <script src="js/spell-hint.js"></script>
    <script src="js/js-yaml.min.js"></script>
    <script src="js/yaml.js"></script>
    <script src="js/lint.js"></script>
    <script src="js/yaml-lint.js"></script>
    <script src="js/editor.js"></script>
    <script src="js/codeeditor.js"></script>
    <script src="js/tutorial.js"></script>
    <script src="js/main.js"></script>
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
            <button type="button" id="deleteButton" title="Delete your current spell... forever ever ever ever ever">Delete</button>
        </span>
        <span class="controlgroup">
            <button type="button" id="newButton" title="Clear your spell and start fresh">New</button>
            <select id="newSelector">
                <option value="Blank">Blank</option>
                <option value="Basic">Basic</option>
                <option value="AOE">Area of Effect</option>
                <option value="Projectile">Projectile</option>
                <option value="Sphere">Build Sphere</option>
                <option value="Break">Break Block</option>
                <option value="Repeating">Repeating Effect</option>
            </select>
        </span>
        <span id="downloadButtonContainer">
            <button type="button" id="downloadButton" title="Download this spell config. Place in plugins/Magic/spells to load it on your server.">Download</button>
        </span>
        <span id="helpButtonContainer">
            <button type="button" id="helpButton" title="Show the tutorial again">Help</button>
        </span>
        <span id="referenceButtonContainer">
            <button type="button" id="referenceButton" title="Open the reference guide in a new window">Reference</button>
        </span>
        <?php include "common/userinfo.inc.php" ?>
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

<?php require 'examples.inc.php'; ?>
<?php require 'tutorials.inc.php'; ?>

</body>
</html>
