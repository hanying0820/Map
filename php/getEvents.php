<?php
include_once('db_vars.inc');

$link = new mysqli($DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME);

if ($link->connect_error) {
    die("Connection failed:".$link->connect_error);
    exit();
}

mysqli_query($link, 'SET NAMES utf8');

$query = "SELECT * FROM event";
$result = mysqli_query($link, $query);

$events = array();
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($events, $row);
    }
}

echo json_encode($events);
?>