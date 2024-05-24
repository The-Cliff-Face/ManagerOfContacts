// this URL helped with some of the code
// https://www.codementor.io/@anthonyelam/displaying-database-content-on-a-web-page-using-html-css-and-javascript-2ejhvtl4cd
//
// if this file is used it will have to be improved with form validation and error checking (using the API responses)

const urlBase = "http://managerofcontacts.xyz/LAMPAPI";
const extension = "php";

let userId = 1; // just use the RickL account, because we already have login figured out
// for the actual main page you're probably gonna wanna integrate this with the result given by Login.php

function doDelete(contactId)
{
	// this creates the JSON object that we're gonna send.
	// see here https://app.swaggerhub.com/apis-docs/4331throwawayteam6/ManagerOfContacts/1.0.0
	let tmp = {contactId: contactId};
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + "/DeleteContact." + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);
	}
	catch (err)
	{
		console.log(err);
	}
}

function doEdit(firstName, lastName, phone, email, contactId)
{
	let tmp = {firstName: firstName, lastName: lastName, phone: phone, email: email, contactId: contactId};
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + "/EditContact." + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);
	}
	catch (err)
	{
		console.log(err);
	}
}

// This right here is the code that runs when you press the Search button
document.getElementById("searchButton").onclick = function()
{
	// read in the search query from the input text box
	let searchString = document.getElementById("searchInput").value;
	// clear any previous search results
	contactsContainer.innerHTML = "";

	let tmp = {search: searchString, userId: userId};
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + "/SearchContact." + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			// search requires that we actually do something with the response.
			if (this.readyState == 4 && this.status == 200)
			{
				let searchResults = JSON.parse(xhr.responseText).results;

				// id will be 0 if there are no records found
				if (searchResults[0].id > 1) // the search actually returned results
				{
					const contactsContainer = document.getElementById("contactsContainer");

					searchResults.forEach(item => {
						// basically, for every item it creates a new div which
						// contains 4 spans (for the 4 parts of a contact.) Probably would
						// be better in an HTML table with 4 columns
						let contactItem = document.createElement("div");
						//contactItem.textContent = `${item.firstName} ${item.lastName} ${item.email} ${item.phone}`;

						let firstNameSpan = document.createElement("span");
						let lastNameSpan = document.createElement("span");
						let phoneSpan = document.createElement("span");
						let emailSpan = document.createElement("span");

						firstNameSpan.textContent = `${item.firstName}`;
						lastNameSpan.textContent = `${item.lastName}`;
						phoneSpan.textContent = `${item.email}`;
						emailSpan.textContent = `${item.phone}`;

						contactItem.appendChild(firstNameSpan);
						contactItem.appendChild(document.createTextNode(" ")); // used as a very idiotic way to add space in the demo. replace with proper CSS.
						contactItem.appendChild(lastNameSpan);
						contactItem.appendChild(document.createTextNode(" "));
						contactItem.appendChild(phoneSpan);
						contactItem.appendChild(document.createTextNode(" "));
						contactItem.appendChild(emailSpan);

						// make the delete button for this contact.
						deleteButton = document.createElement("button");
						deleteButton.innerText = "Delete";
						deleteButton.addEventListener("click", () => {
							doDelete(item.id);
							contactItem.remove();
						});
						contactItem.appendChild(deleteButton);

						// make the edit button for this contact.
						editButton = document.createElement("button");
						editButton.innerText = "Edit";
						editButton.addEventListener("click", () => {
							// allow the user to edit the text in the various fields.
							firstNameSpan.setAttribute("contenteditable", "true");
							lastNameSpan.setAttribute("contenteditable", "true");
							phoneSpan.setAttribute("contenteditable", "true");
							emailSpan.setAttribute("contenteditable", "true");

							// create a button to save the user's edits.
							saveButton = document.createElement("button");
							saveButton.innerText = "Save Edits";
							saveButton.addEventListener("click", () => {
								doEdit(firstNameSpan.innerHTML, lastNameSpan.innerHTML, phoneSpan.innerHTML, emailSpan.innerHTML, item.id);

								// now that the editing is done, go back to normal
								firstNameSpan.setAttribute("contenteditable", "false");
								lastNameSpan.setAttribute("contenteditable", "false");
								phoneSpan.setAttribute("contenteditable", "false");
								emailSpan.setAttribute("contenteditable", "false");
								saveButton.remove();
							});
							contactItem.appendChild(saveButton);

						});
						contactItem.appendChild(editButton);

						contactsContainer.appendChild(contactItem);
					});
				}
			}
		}
		xhr.send(jsonPayload);
	}
	catch (err)
	{
		console.log(err);
	}
};

// This does the AddContact part
document.getElementById("addButton").onclick = function()
{
	let firstName = document.getElementById("addFirstNameInput").value;
	let lastName = document.getElementById("addLastNameInput").value;
	let phone = document.getElementById("addPhoneInput").value;
	let email = document.getElementById("addEmailInput").value;

	let tmp = {firstName: firstName, lastName: lastName, phone: phone, email: email, userId: userId};
	let jsonPayload = JSON.stringify(tmp);


	let url = urlBase + "/AddContact." + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.send(jsonPayload);
	}
	catch (err)
	{
		console.log(err);
	}
};
