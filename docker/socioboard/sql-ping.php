<?php
$con=mysqli_connect("HOST_REF","USER_REF","PASS_REF","DB_REF");

// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  exit();
}

// Check if server is alive
if (mysqli_ping($con)) {
  echo "Ready";
} else {
  echo "Error: ". mysqli_error($con);
}

mysqli_close($con);
?> 