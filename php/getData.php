<?php
include_once 'db_vars.inc';

$link = new mysqli($DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME);

if ($link->connect_error) {
    die("Connection failed:" . $link->connect_error);
    exit();
}

mysqli_query($link, 'SET NAMES utf8');

$json = array();

/* location */
$table_names = ['location', 'demo_location'];
foreach ($table_names as $name) {
    $query = "SELECT * FROM $name";
    $result = mysqli_query($link, $query);

    $array = array();
    if ($result && mysqli_num_rows($result) > 0) {
        while ($row = mysqli_fetch_assoc($result)) {
            array_push($array, $row);
        }
    }
    $json[$name] = $array;
}

if (isset($_REQUEST['key'])) {
    $filename = '../../key.txt';
    $enter = true;
    if (file_exists($filename)) {
        $file = fopen($filename, 'r');
        while (flock($file, LOCK_SH) && $enter) {
            $enter = false;
            $key = fgets($file);
            $key = fgets($file);
            flock($file, LOCK_UN);
        }
        fclose($file);
    }

    if (strcmp($_REQUEST['key'], $key)) {
        $json['key'] = $key;

        $query = "SELECT * FROM event";
        $result = mysqli_query($link, $query);

        $events = array();
        if ($result && mysqli_num_rows($result) > 0) {
            while ($row = mysqli_fetch_assoc($result)) {
                array_push($events, $row);
            }
        }
        $json['events'] = $events;
    }
}

$link->close();
echo json_encode($json);
