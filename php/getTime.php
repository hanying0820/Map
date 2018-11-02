<?php
/* 用 http get 或 post 都可，
 * 傳入名稱: time，值為 System.currentTimeMillis() (Unix time 精確到毫秒)
 * * */
$time = explode(" ", microtime());
echo ($time[0] + $time[1]) * 1000 - (isset($_REQUEST['time']) ? $_REQUEST['time'] : 0);
?>