<?php
    session_start();

    if ($_SESSION['auth'] == true) {
        $_SESSION['auth'] = false;
        unset($_SESSION["auth"]);
        session_destroy() ;
    }

    $_POST = json_decode(file_get_contents("php://input"), true);

    

?>