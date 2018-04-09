<?php
header('Content-Type: application/json');
require_once('../config.inc.php');
require_once('common/user.inc.php');

$user = getUser();
if (!$user['id']) {
    die(json_encode(array('success' => false, 'message' => 'Not logged in')));
}

if (!isset($_REQUEST['property'])) {
    die(json_encode(array('success' => false, 'message' => 'Missing property parameter')));
}

if (!isset($_REQUEST['description'])) {
    die(json_encode(array('success' => false, 'message' => 'Missing description parameter')));
}

$metadata = json_decode(file_get_contents('common/meta.json'));

$property = $_REQUEST['property'];
if (!property_exists($metadata->properties, $property)) {
    die(json_encode(array('success' => false, 'message' => 'Invalid property key: ' . $property)));
}

$description = $_REQUEST['description'];
if (!is_array($description)) {
    $description = array($description);
}

$previous = $metadata->properties->$property->description;
$metadata->properties->$property->description = $description;

$metadata = json_encode($metadata, JSON_PRETTY_PRINT);

if (file_put_contents('common/meta.json', $metadata) === FALSE) {
    die(json_encode(array('success' => false, 'message' => 'Could not write to metadata file')));
}

if (file_exists('common/edits.json')) {
    $edits = json_decode(file_get_contents('common/edits.json'), true);
    $edit = array(
        'timestamp' => time(),
        'id' => $user['id'],
        'name' => $user['name'],
        'property' => $property,
        'description' => $description,
        'previous' => $previous
    );
    array_push($edits, $edit);
    $edits = json_encode($edits, JSON_PRETTY_PRINT);
    file_put_contents('common/edits.json', $edits);
}

echo json_encode(array('success' => true, 'message' => 'Updated, Thank you!'));