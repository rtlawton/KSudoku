<?php 
require_once('config.php');
$gm = $_POST["gm"];
try {
    $db = new PDO(PDO_CONNECT, USER, PSWD, $PDO_OPTIONS);
    $stmt = $db->prepare('UPDATE Games SET LastDone = ? WHERE Code = ?');
    $stmt->execute(array(date("Y-m-d"), $gm));
}
catch(PDOException $ex) {
    echo $ex->getMessage();
}
$db = null; 

?>