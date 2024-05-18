<?php

	// $inData has JSON format like this:
	// {"firstName": "___", "lastName": "___", "login": "___", "password": "___"}
	$inData = getRequestInfo();

	//$id = 0;
	//$firstName = "";
	//$lastName = "";

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		//$stmt = $conn->prepare("SELECT ID,firstName,lastName FROM Users WHERE Login=? AND Password =?");
		// first we check if that login is already used in our database somewhere
		$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
		$stmt->bind_param("s", $inData["login"]);
		$stmt->execute();
		$result = $stmt->get_result();

		// unfortunately, that login was already taken
		if( $row = $result->fetch_assoc()  )
		{
			//returnWithInfo( $row['firstName'], $row['lastName'], $row['ID'] );
			returnWithError("Login Not Available");
		}
		else
		{
			// create new entry in Users table
			$stmt = $conn->prepare("INSERT INTO Users (firstName, lastName, login, password) VALUES (?, ?, ?, ?);");
			$stmt->bind_param("ssss", $inData["firstName"], $inData["lastName"], $inData["login"], $inData["password"]);
			$stmt->execute();
			returnWithInfo();
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function returnWithInfo()
	{
		$retValue = '{"error":""}';
		sendResultInfoAsJson( $retValue );
	}

?>
