<?php

$_POST = json_decode(file_get_contents("php://input"), true);
$newFile = '../../k4l3kds04-30kfk3-4kfokoj.340kd0ff-.43f;gd.html';

if ($_POST["html"]) {
    file_put_contents($newFile, $_POST["html"]);
} else {
    header("HTTP/1.0 400 Bad Request");

}

?>