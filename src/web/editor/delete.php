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

$key = $_REQUEST['spell'];
$userId = $user['id'];
$spellFile = "$sandboxServer/plugins/Magic/spells/$key.yml";
if (!file_exists($spellFile)) {
    die(json_encode(array('success' => false, 'message' => 'File does not exist')));
}

$existing = file_get_contents($spellFile);
$existing = yaml_parse($existing);

if (count($existing) != 1 || !isset($existing[$key])
    || !isset($existing[$key]['creator_id']) || $existing[$key]['creator_id'] != $user['id']) {
    die(json_encode(array('success' => false, 'message' => 'Spell exists and you are not the original creator!')));
}

$backupFile = "$sandboxServer/plugins/Magic/spells.bak/$key.$userId.yml";
if (file_exists($backupFile)) {
    unlink($backupFile);
}
if (!copy($spellFile, $backupFile)) {
    die(json_encode(array('success' => false, 'message' => 'Could not write to backup file ' . $backupFile)));
}
if (unlink($spellFile) === FALSE) {
    die(json_encode(array('success' => false, 'message' => 'Could delete file ' . $spellFile)));
}

$updated = 'user_id: ' . $user['id'];
file_put_contents("$sandboxServer/plugins/Magic/data/updated.yml", $updated);

echo json_encode(array('success' => true, 'message' => 'Deleted'));