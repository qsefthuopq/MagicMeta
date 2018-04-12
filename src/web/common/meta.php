<?php
require_once('../config.inc.php');
header('Content-Type: application/json');
$meta = json_decode(file_get_contents('meta.json'), true);

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
$meta['types']['spell_icon']['options'] = $spellIcons;

// Populate action, effect and effectlib class types
$actions = array_column($meta['actions'], 'short_class');
$actions = array_fill_keys($actions, null);
$meta['types']['action_class']['options'] = $actions;

$effects = array_column($meta['effectlib_effects'], 'short_class');
$effects = array_fill_keys($effects, null);
$meta['types']['effectlib_class']['options'] = $effects;

function mapFields($meta, $type, $propertyHolder = null) {
    $propertyHolder = is_null($propertyHolder) ? $meta : $propertyHolder;
    $keys = array_keys($propertyHolder[$type]);
    $properties = $meta['properties'];
    $mapped = array();
    foreach ($keys as $key) {
        $property = $properties[$key];
        if (isset($property['alias']) || $property['importance'] < 0) continue;
        $mapped[$property['field']] = $key;
    }
    return $mapped;
}

// Populate contextual lists of parameters
$meta['spell_context'] = array(
    'properties' => mapFields($meta, 'spell_properties'),
    'parameters' => mapFields($meta, 'spell_parameters'),
    'effect_parameters' => mapFields($meta, 'effect_parameters'),
    'effectlib_parameters' => mapFields($meta, 'effectlib_parameters'),
    'action_parameters' => mapFields($meta, 'action_parameters'),
    'action_classes' => array_column($meta['actions'], 'short_class'),
    'effectlib_classes' => array_column($meta['effectlib_effects'], 'short_class')
);
$actions = array();
foreach ($meta['actions'] as $action) {
    $actions[$action['class_name']] = mapFields($meta, 'parameters', $action);
}
$meta['spell_context']['actions'] = $actions;

$effects = array();
foreach ($meta['effectlib_effects'] as $effect) {
    $effects[$effect['class_name']] = mapFields($meta, 'parameters', $effect);
}
$meta['spell_context']['effects'] = $effects;

echo json_encode($meta);