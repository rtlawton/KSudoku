<?php 
require_once('config.php');
$gm = $_GET["gm"];
try {
    $db = new PDO(PDO_CONNECT, USER, PSWD, $PDO_OPTIONS);
    $stmt = $db->prepare('SELECT Code FROM Games WHERE Code = ?');
    $stmt->execute([$gm]);
    if ($stmt->rowCount() == 0) {
        echo "true";
    } else {
        echo "false";
    }
}
catch(PDOException $ex) {
    echo $ex->getMessage();
}
$db = null; 

?>