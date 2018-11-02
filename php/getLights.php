<?php
include_once('db_vars.inc');

$link = new mysqli($DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME);
if ($link->connect_error) {
    die("Connection failed:".$link->connect_error);
    exit();
}

mysqli_query($link, 'SET NAMES utf8');

$query = "SELECT * FROM trafficlight";

$lights = array();
$result = mysqli_query($link, $query);
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $query = "SELECT * FROM period WHERE Id = {$row['Id']}";
        $result_period = mysqli_query($link, $query);
        
        $periods = array();
        if ($result_period && mysqli_num_rows($result_period) > 0) {
            while ($peroid = mysqli_fetch_assoc($result_period)) {
                array_push($periods, $peroid);
            }
        }
        
        $row["periods"] = $periods;
        
        array_push($lights, $row);
    }
}

echo json_encode($lights);
?>