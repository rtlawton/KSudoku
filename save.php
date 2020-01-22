<?php 
require_once('config.php');
$gm = $_POST["gm"];
$fr = $_POST["fr"];
$diff = $_POST["diff"];
try {
    $db = new PDO(PDO_CONNECT, USER, PSWD, $PDO_OPTIONS);
    $stmt = $db->prepare('INSERT INTO Games (Code, Difficulty, Frame) VALUES (?, ?, ?)');
    $stmt->execute(array($gm, $diff, $fr));
}
catch(PDOException $ex) {
    echo $ex->getMessage();
    $db = null; 
    return "Failed";
}
$db = null; 
echo "success";
return "success";

?>