<?php

const TIME_ZONE = "Africa/Johannesburg";
const USER = "root";
const PSWD = "Insertpassword";
const D_BASE = "Ksudoku";
$PDO_OPTIONS = array(PDO::ATTR_EMULATE_PREPARES => false, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);
const PDO_CONNECT = 'mysql:host=localhost;dbname=Ksudoku;charset=utf8';
?>