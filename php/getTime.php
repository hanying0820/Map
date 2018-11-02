<?php
echo (isset($_REQUEST['time'])) ? date() : date() - $_POST['time'];
?>