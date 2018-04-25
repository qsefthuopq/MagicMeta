<?php
header('Content-Type: application/json');
require_once('../config.inc.php');
if (!$sandboxServer) {
    die(json_encode(array('success' => false, 'message' => 'No sandbox server defined')));
}

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    return $length === 0 || (substr($haystack, -$length) === $needle);
}

$spells = array();
$spellFolder = "$sandboxServer/plugins/Magic/spells";
$spellFiles = scandir($spellFolder);
foreach ($spellFiles as $spellFile) {
    if (!endsWith($spellFile, '.yml')) continue;

    $spellConfig = yaml_parse_file($spellFolder . '/' . $spellFile);
    if (!$spellConfig) {
        error_log("Error parsing spell file: " . $spellFolder . '/' . $spellFile);
        continue;
    }
    $spellKeys = array_keys($spellConfig);

    // TODO: Spell levels
    if (count($spellKeys) != 1) continue;

    $spellKey = $spellKeys[0];
    if ($spellFile != $spellKey . '.yml') continue;

    $spellConfig = $spellConfig[$spellKey];
    $creatorId = isset($spellConfig['creator_id']) ? $spellConfig['creator_id'] : '';
    $creatorName = isset($spellConfig['creator_name']) ? $spellConfig['creator_name'] : '';
    $spellName = isset($spellConfig['name']) ? $spellConfig['name'] : '';
    $spellDescription = isset($spellConfig['description']) ? $spellConfig['description'] : '';

    $spell = array(
        'key' => $spellKey,
        'creator_id' => $creatorId,
        'creator_name' => $creatorName,
        'name' => $spellName,
        'description' => $spellDescription
    );
    array_push($spells, $spell);
}

$survivalMessages = yaml_parse_file("$magicRootFolder/examples/survival/messages/spells.yml");
$survivalMessages = $survivalMessages['spells'];

$survivalFolder = "$magicRootFolder/examples/survival/spells";
$survivalFiles = scandir($survivalFolder);
foreach ($survivalFiles as $spellFile) {
    if (!endsWith($spellFile, '.yml') || $spellFile === '_header.yml') continue;

    $spellConfig = yaml_parse_file($survivalFolder . '/' . $spellFile);
    if (!$spellConfig) {
        error_log("Error parsing spell file: " . $survivalFolder . '/' . $spellFile);
        continue;
    }
    $spellKeys = array_keys($spellConfig);
    if (count($spellKeys) == 0) continue;
    $spellKey = $spellKeys[0];

    $spellConfig = $spellConfig[$spellKey];
    if (isset($spellConfig['hidden']) && $spellConfig['hidden']) continue;
    if ($spellKey === 'default') continue;

    $creatorId = isset($spellConfig['creator_id']) ? $spellConfig['creator_id'] : '';
    $creatorName = isset($spellConfig['creator_name']) ? $spellConfig['creator_name'] : '';
    $spellName = isset($spellConfig['name']) ? $spellConfig['name'] : '';
    $spellDescription = isset($spellConfig['description']) ? $spellConfig['description'] : '';

    if (!$spellName && isset($survivalMessages[$spellKey]) && isset($survivalMessages[$spellKey]['name'])) {
        $spellName = $survivalMessages[$spellKey]['name'];
    }
    if (!$spellDescription && isset($survivalMessages[$spellKey]) && isset($survivalMessages[$spellKey]['description'])) {
        $spellDescription = $survivalMessages[$spellKey]['description'];
    }

    $spell = array(
        'key' => 'default.' . $spellKey,
        'creator_id' => $creatorId,
        'creator_name' => $creatorName,
        'name' => $spellName,
        'description' => $spellDescription
    );
    array_push($spells, $spell);
}
die(json_encode(array('success' => true, 'spells' => $spells)));
