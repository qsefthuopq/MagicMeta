<?php
require_once('../config.inc.php');
header('Content-Type: application/json');
$meta = json_decode(file_get_contents('meta.json'), true);

// Load resource pack textures
$spellJson = json_decode(file_get_contents($resourcePackFolder . '/default/assets/minecraft/models/item/diamond_axe.json'), true);
$spellJson = $spellJson['overrides'];
$spellIcons = array();
$disabledIcons = array();
$diamondUses = 1562;
foreach ($spellJson as $spellPredicate) {
    $durability = round($spellPredicate['predicate']['damage'] * $diamondUses);
    if ($durability == 0) continue;
    $texture = str_replace('item/', '', $spellPredicate['model']);
    $spellIcons['diamond_axe:' . $durability] = '<img src="common/image/' . $texture . '.png" class="spellIcon"/>' . $texture;
    $disabledIcons['diamond_hoe:' . $durability] = '<img src="common/image/' . $texture . '.png" class="spellIcon"/>' . $texture;
}
$meta['types']['spell_icon']['options'] = $spellIcons;
$meta['types']['spell_icon_disabled']['options'] = $disabledIcons;

// Load URL textures
$textures = array();
$textureConfig = $magicRootFolder . '/../../resource-pack/common/source/image_map.yml';
if (file_exists($textureConfig)) {
    $textures = yaml_parse_file($textureConfig);
    $textureOptions = array();
    foreach ($textures as $texture) {
        $textureOptions[$texture] = '<span style="background-image: url(' . $texture . ')" class="textureIcon"/>';
    }
    $meta['types']['texture']['options'] = $textureOptions;
}

// Create colors
// From http://www.w3schools.com/HTML/html_colornames.asp
$colorMap = array("aliceblue"=>"f0f8ff","antiquewhite"=>"faebd7","aqua"=>"00ffff","aquamarine"=>"7fffd4","azure"=>"f0ffff",
    "beige"=>"f5f5dc","bisque"=>"ffe4c4","black"=>"000000","blanchedalmond"=>"ffebcd","blue"=>"0000ff","blueviolet"=>"8a2be2","brown"=>"a52a2a","burlywood"=>"deb887",
    "cadetblue"=>"5f9ea0","chartreuse"=>"7fff00","chocolate"=>"d2691e","coral"=>"ff7f50","cornflowerblue"=>"6495ed","cornsilk"=>"fff8dc","crimson"=>"dc143c","cyan"=>"00ffff",
    "darkblue"=>"00008b","darkcyan"=>"008b8b","darkgoldenrod"=>"b8860b","darkgray"=>"a9a9a9","darkgreen"=>"006400","darkkhaki"=>"bdb76b","darkmagenta"=>"8b008b","darkolivegreen"=>"556b2f",
    "darkorange"=>"ff8c00","darkorchid"=>"9932cc","darkred"=>"8b0000","darksalmon"=>"e9967a","darkseagreen"=>"8fbc8f","darkslateblue"=>"483d8b","darkslategray"=>"2f4f4f","darkturquoise"=>"00ced1",
    "darkviolet"=>"9400d3","deeppink"=>"ff1493","deepskyblue"=>"00bfff","dimgray"=>"696969","dodgerblue"=>"1e90ff",
    "firebrick"=>"b22222","floralwhite"=>"fffaf0","forestgreen"=>"228b22","fuchsia"=>"ff00ff",
    "gainsboro"=>"dcdcdc","ghostwhite"=>"f8f8ff","gold"=>"ffd700","goldenrod"=>"daa520","gray"=>"808080","green"=>"008000","greenyellow"=>"adff2f",
    "honeydew"=>"f0fff0","hotpink"=>"ff69b4",
    "indianred "=>"cd5c5c","indigo"=>"4b0082","ivory"=>"fffff0","khaki"=>"f0e68c",
    "lavender"=>"e6e6fa","lavenderblush"=>"fff0f5","lawngreen"=>"7cfc00","lemonchiffon"=>"fffacd","lightblue"=>"add8e6","lightcoral"=>"f08080","lightcyan"=>"e0ffff","lightgoldenrodyellow"=>"fafad2",
    "lightgrey"=>"d3d3d3","lightgreen"=>"90ee90","lightpink"=>"ffb6c1","lightsalmon"=>"ffa07a","lightseagreen"=>"20b2aa","lightskyblue"=>"87cefa","lightslategray"=>"778899","lightsteelblue"=>"b0c4de",
    "lightyellow"=>"ffffe0","lime"=>"00ff00","limegreen"=>"32cd32","linen"=>"faf0e6",
    "magenta"=>"ff00ff","maroon"=>"800000","mediumaquamarine"=>"66cdaa","mediumblue"=>"0000cd","mediumorchid"=>"ba55d3","mediumpurple"=>"9370d8","mediumseagreen"=>"3cb371","mediumslateblue"=>"7b68ee",
    "mediumspringgreen"=>"00fa9a","mediumturquoise"=>"48d1cc","mediumvioletred"=>"c71585","midnightblue"=>"191970","mintcream"=>"f5fffa","mistyrose"=>"ffe4e1","moccasin"=>"ffe4b5",
    "navajowhite"=>"ffdead","navy"=>"000080",
    "oldlace"=>"fdf5e6","olive"=>"808000","olivedrab"=>"6b8e23","orange"=>"ffa500","orangered"=>"ff4500","orchid"=>"da70d6",
    "palegoldenrod"=>"eee8aa","palegreen"=>"98fb98","paleturquoise"=>"afeeee","palevioletred"=>"d87093","papayawhip"=>"ffefd5","peachpuff"=>"ffdab9","peru"=>"cd853f","pink"=>"ffc0cb","plum"=>"dda0dd","powderblue"=>"b0e0e6","purple"=>"800080",
    "red"=>"ff0000","rosybrown"=>"bc8f8f","royalblue"=>"4169e1",
    "saddlebrown"=>"8b4513","salmon"=>"fa8072","sandybrown"=>"f4a460","seagreen"=>"2e8b57","seashell"=>"fff5ee","sienna"=>"a0522d","silver"=>"c0c0c0","skyblue"=>"87ceeb","slateblue"=>"6a5acd","slategray"=>"708090","snow"=>"fffafa","springgreen"=>"00ff7f","steelblue"=>"4682b4",
    "tan"=>"d2b48c","teal"=>"008080","thistle"=>"d8bfd8","tomato"=>"ff6347","turquoise"=>"40e0d0",
    "violet"=>"ee82ee",
    "wheat"=>"f5deb3","white"=>"ffffff","whitesmoke"=>"f5f5f5",
    "yellow"=>"ffff00","yellowgreen"=>"9acd32");

$colorHints = array();
foreach ($colorMap as $name => $color) {
    $colorHints['"' . $color . '"'] = '<span class="colorSwatch" style="background-color: #' . $color . '">&nbsp;</span>' . $name;
}
$meta['types']['color']['options'] = $colorHints;

// Load sounds
$soundsJson = json_decode(file_get_contents($resourcePackFolder . '/default/assets/minecraft/sounds.json'), true);
$sounds = array_keys($soundsJson);
$sounds = array_fill_keys($sounds, null);
$meta['types']['sound']['options'] = array_merge($meta['types']['sound']['options'], $sounds);

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
if (isset($_REQUEST['context'])) {
    $meta['spell_context'] = array(
        'properties'  => mapFields($meta, 'spell_properties'),
        'parameters'  => mapFields($meta, 'spell_parameters'),
        'effect_parameters'  => mapFields($meta, 'effect_parameters'),
        'effectlib_parameters'  => mapFields($meta, 'effectlib_parameters'),
        'action_parameters'  => mapFields($meta, 'action_parameters'),
        'action_classes'  => array_combine(
            array_column($meta['actions'], 'short_class'),
            array_keys($meta['actions'])),
        'effectlib_classes'  => array_combine(
            array_column($meta['effectlib_effects'], 'short_class'),
            array_keys($meta['effectlib_effects'])),
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
}

echo json_encode($meta);