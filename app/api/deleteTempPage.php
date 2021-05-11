<?php
session_start();
if ($_SESSION["auth"] != true ) {
    header("HTTP/1.0 403 Forbidden");
    die;
}
$file = '../../k4l3kds04-30kfk3-4kfokoj.340kd0ff-.43f;gd.html' ;

if (file_exists($file)) {
    unlink($file);
} else {
    header("HTTP/1.0 400 Bad Request");

}

?>