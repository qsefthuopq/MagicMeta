<?php
require_once('../config.inc.php');
header('Content-Type: application/json');
if ($primaryDomain) {
    setcookie('user_id', null, 0, '/', $primaryDomain);
    setcookie('user_code', null, 0, '/', $primaryDomain);
}
setcookie('user_id', null, 0, '/');
setcookie('user_code', null, 0, '/');
echo json_encode(array('success' => true));