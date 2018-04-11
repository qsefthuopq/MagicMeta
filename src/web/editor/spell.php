<?php
header('Content-Type: application/json');
require_once('../config.inc.php');
require_once('common/yaml.inc.php');

if (!$sandboxServer) {
    die(json_encode(array('success' => false, 'message' => 'No sandbox server defined')));
}
if (!isset($_REQUEST['key'])) {
    die(json_encode(array('success' => false, 'message' => 'Missing key parameter')));
}

$key = $_REQUEST['key'];
if (strpos($key, 'default.') === 0) {
    $key = substr($key, 8);
    $defaultsFolder = "$magicRootFolder/defaults/spells";
    $spellFile = file_get_contents($defaultsFolder . '/' . $key . '.yml');
} else {
    $spellFolder = "$sandboxServer/plugins/Magic/spells";
    $spellFile = file_get_contents($spellFolder . '/' . $key . '.yml');
}

$lines = explode("\n", $spellFile);
if (count($lines) == 0) {
    die(json_encode(array('success' => false, 'message' => 'File is empty')));
}

function startsWith($haystack, $needle)
{
    // search backwards starting from haystack length characters from the end
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== FALSE;
}

$cleaned = array();
foreach ($lines as $line) {
    $trimmed = trim($line);
    if (startsWith($trimmed, 'creator_')) continue;
    array_push($cleaned, $line);
}

$cleaned = implode("\n", $cleaned);

die(json_encode(array('success' => true, 'yml' => $cleaned)));
