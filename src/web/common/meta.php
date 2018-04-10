<?php
require_once('../config.inc.php');
header('Content-Type: application/json');
$meta = json_decode(file_get_contents('meta.json'));

// Load resource pack textures
$spellJson = json_decode(file_get_contents('../rp/default/assets/minecraft/models/item/diamond_axe.json'), true);
$spellJson = $spellJson['overrides'];
$spellIcons = array();
$diamondUses = 1562;
foreach ($spellJson as $spellPredicate) {
    $durability = round($spellPredicate['predicate']['damage'] * $diamondUses);
    if ($durability == 0) continue;
    $texture = str_replace('item/', '', $spellPredicate['model']);
    $spellIcons['diamond_axe:' . $durability] = '<img src="common/image/' . $texture . '.png" class="spellIcon"/>' . $texture;
}

$meta->types->spell_icon->options = $spellIcons;

echo json_encode($meta);