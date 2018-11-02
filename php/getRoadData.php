<?php
include_once('db_vars.inc');

$link = new mysqli($DB_SERVER, $DB_USER, $DB_PASS, $DB_NAME);
if ($link->connect_error) {
    die("Connection failed:".$link->connect_error);
    exit();
}

mysqli_query($link, 'SET NAMES utf8');

$query = "SELECT * FROM node LEFT JOIN (SELECT nodes.V_id, nodes.N_id, nodes.Number FROM nodes, vector WHERE vector.Id = nodes.V_id) AS x ON node.Id = x.N_id ORDER BY x.V_id, x.Number";
$result = mysqli_query($link, $query);
$json = array();

$rows = array();
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($rows, $row);
    }
}

$query = "SELECT * FROM trafficlight LEFT JOIN lights ON trafficlight.Id = lights.L_id";
$result = mysqli_query($link, $query);

$lights = array();
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($lights, $row);
    }
}

$query = "SELECT * FROM lights";
$result = mysqli_query($link, $query);

$lightInfos = array();
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($lightInfos, $row);
    }
}

$json['rows'] = $rows;
$json['lights'] = $lights;
$json['lightInfos'] = $lightInfos;

echo json_encode($json);

$link->close();
?>