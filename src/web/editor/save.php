<?php
header('Content-Type: application/json');
require_once('../config.inc.php');
require_once('common/user.inc.php');
require_once('common/yaml.inc.php');
if (!$sandboxServer) {
    die(json_encode(array('success' => false, 'message' => 'No sandbox server defined')));
}

$user = getUser();
if (!$user['id']) {
    die(json_encode(array('success' => false, 'message' => 'Not logged in')));
}

if (!isset($_REQUEST['spell'])) {
    die(json_encode(array('success' => false, 'message' => 'Missing spell parameter')));
}

$spell = $_REQUEST['spell'];
$spells = yaml_parse($spell);
if (!$spells) {
    die(json_encode(array('success' => false, 'message' => 'Invalid spell')));
}

if (count($spells) != 1) {
    die(json_encode(array('success' => false, 'message' => 'Currently only one spell per file is supported')));
}

$key = array_keys($spells)[0];
$spellFile = "$sandboxServer/plugins/Magic/spells/$key.yml";
if (file_exists($spellFile)) {
    $existing = file_get_contents($spellFile);
    $existing = yaml_parse($existing);

    if (count($existing) != 1 || !isset($existing[$key])
        || !isset($existing[$key]['creator_id']) || $existing[$key]['creator_id'] != $user['id']) {
        die(json_encode(array('success' => false, 'message' => 'Spell exists and you are not the original creator, please fork and then save.')));
    }
}

function startsWith($haystack, $needle) {
    // search backwards starting from haystack length characters from the end
    return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== FALSE;
}

// Don't use the $spells object after this point, we don't want to lose comments and formatting.
$lines = explode("\n", $spell);
$cleaned = array();
$afterKey = false;
foreach ($lines as $line) {
    $trimmed = trim($line);
    if (startsWith($trimmed, 'creator_')) continue;

    if ($afterKey && strlen($trimmed) != 0 && $trimmed[0] != '#') {
        $indentSize = strlen($line) - strlen(ltrim($line));
        $indent = substr($line, 0, $indentSize);
        array_push($cleaned, $indent . 'creator_id: ' . $user['id']);
        array_push($cleaned, $indent . 'creator_name: ' . $user['name']);
        $afterKey = false;
    }

    array_push($cleaned, $line);

    // Check for spell keys to add creator lines
    if (strlen($trimmed) != 0 && $line[0] != '#' && $line[0] != ' ') {
        $afterKey = true;
    }
}

$spell = implode("\n", $cleaned);

if (file_put_contents($spellFile, $spell) === FALSE) {
    die(json_encode(array('success' => false, 'message' => 'Could not write to file ' . $spellFile)));
}

$updated = 'user_id: ' . $user['id'];
file_put_contents("$sandboxServer/plugins/Magic/data/updated.yml", $updated);

echo json_encode(array('success' => true, 'message' => 'Saved'));