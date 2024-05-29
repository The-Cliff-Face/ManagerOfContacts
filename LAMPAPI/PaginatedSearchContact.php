<?php

// input JSON:
// {
// "pageNumber": 1,
// "pageSize": 5,
// "search": "abc",
// "userId": 123
// }

// output: array of JSON objects
//
// Whats up guys! This code is really stupid because it queries the database and then uses LIMIT to
// filter the results, which is slow on the back-end.
// If we were working with millions of records I'd get fired... :(((

	$inData = getRequestInfo();

	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$startPosition = ($inData["pageNumber"] - 1) * $inData["pageSize"];

		$stmt = $conn->prepare("SELECT * FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID=? ORDER BY LastName, FirstName LIMIT ?, ?;");
		$searchString = "%" . $inData["search"] . "%";
		$stmt->bind_param("sssss", $searchString, $searchString, $inData["userId"], $startPosition, $inData["pageSize"]);
		$stmt->execute();

		$result = $stmt->get_result();

		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '{"id": '.$row["ID"].', "firstName": "'.$row["FirstName"].'", "lastName": "'.$row["LastName"].'", "phone": "'.$row["Phone"].'", "email": "'.$row["Email"].'"}';
		}

		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
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
		$retValue = '{"results":[{"id":0,"firstName":"","lastName":"","phone":"","email":""}],"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}

?>
