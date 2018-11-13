<?php
include_once('db_vars.inc');

$link = new mysqli($DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME);
if ($link->connect_error) {
    die("Connection failed:".$link->connect_error);
    exit();
}

mysqli_query($link, 'SET NAMES utf8');

if (isset($_POST['light_insert'])) {
    $arr = explode(" ", $_POST['light_insert']);
    $query = "INSERT INTO trafficlight (Road1, Road2, Latitude, Longitude) VALUES ('{$arr[0]}', '{$arr[1]}', {$arr[2]}, {$arr[3]})";
    echo $query;
    //mysqli_query($link, $query);
}
else if (isset($_POST['node_insert'])) {
    $arr = explode(" ", $_POST['node_insert']);
    $query = "INSERT INTO node (Id, IsCross, Latitude, Longitude) VALUES ('{$arr[0]}', {$arr[1]}, {$arr[2]}, {$arr[3]})";        
    echo $query;
    //mysqli_query($link, $query);
}

//header("location: showMap.php");
?>