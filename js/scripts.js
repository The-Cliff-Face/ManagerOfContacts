const urlBase = 'http://managerofcontacts.xyz/LAMPAPI';
const extension = 'php';


function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";
    let login = document.getElementById("contact-username").value;
    let password = document.getElementById("contact-password").value;
    var hash = md5(password);
    document.getElementById("loginResult").innerHTML = "";
    //let tmp = {login:login,password:password};
    var tmp = { login: login, password: hash };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;

                if (userId < 1) {
                    document.getElementById("loginResult").innerHTML = "Incorrect username or password.";
                    document.getElementById("submission-box").classList.add("invalid");
                    return;
                }

                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();
                // change href to the next page
                window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    }
    catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

function goToSignup() {
    window.location.href = "signup.html";
}

function register() {
    if (!requirementsSatisfied) {
        const errorMessage = document.getElementById('signupResult');
        errorMessage.textContent = "Requirements not satisfied";
        console.log("failed");
        return;
    }

    let username = document.getElementById("contact-username").value;
    let firstname = document.getElementById("contact-firstname").value;
    let lastname = document.getElementById("contact-lastname").value;
    let password = document.getElementById("contact-password").value;

    if (!signupCheck(username, firstname, lastname, password)) {
        const errorMessage = document.getElementById('signupResult');
        errorMessage.textContent = "Requirements not satisfied";
        console.log("failed");
        return;
    }

    var hash = md5(password);

    let tmp = {
        firstName: firstname,
        lastName: lastname,
        login: username,
        password: hash
    };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + "/Signup." + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;
                //document.getElementById("signUpResult").innerHTML = "Success";
                window.location.href = "login.html";
                firstName = jsonObject.firstname;
                lastName = jsonObject.lastname;
                saveCookie();
            }
        }
        xhr.send(jsonPayload);

    }
    catch (err) {
        const errorMessage = document.getElementById('signupResult');
        errorMessage.textContent = err.message;
        //document.getElementById("signUpResult").innerHTML = err.message;
    }

}

function validatePassword(password) {
    const regex = /^(?=.*[0-9]).{8,}$/;
    return regex.test(password);
}


// TODO: finish this function
function signupCheck(username, firstname, lastname, password) {
    if (username.trim() === "" || firstname.trim() === "" || lastname.trim() === "" || password.trim() === "") {
        return false;
    } else {
        return true;
    }
}


function preventSQLInjection(fieldObj) {
    let result = false;
    const SQLCommands = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|REPLACE|RENAME)\b/i;
    const illegalCharacters = /['";\-\-%]/;

    Object.values(fieldObj).forEach(value => {
        result |= (SQLCommands.test(value) || illegalCharacters.test(value));
    });
    return result;
}


function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");
    for (var i = 0; i < splits.length; i++) {
        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");
        if (tokens[0] == "contact-firstname") {
            firstName = tokens[1];
        }
        else if (tokens[0] == "contact-lastname") {
            lastName = tokens[1];
        }
        else if (tokens[0] == "contact-username") {
            userId = parseInt(tokens[1].trim());
        }
    }

    if (userId < 0) {
        window.location.href = "index.html";
    }
    else {
        //        document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
    }
}

/* Contacts Page functions (from demo) */
function doDelete(contactId) {
    // creates JSON object that we're gonna send.
    // see here https://app.swaggerhub.com/apis-docs/4331throwawayteam6/ManagerOfContacts/1.0.0
    let tmp = { contactId: contactId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + "/DeleteContact." + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.send(jsonPayload);
    }
    catch (err) {
        console.log(err);
    }
}

function doEdit(firstName, lastName, phone, email, contactId) {
    let tmp = { firstName: firstName, lastName: lastName, phone: phone, email: email, contactId: contactId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + "/EditContact." + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.send(jsonPayload);
    }
    catch (err) {
        console.log(err);
    }
}

// Search Button
document.getElementById("searchButton").onclick = function () {
    // read in the search query from the input text box
    let searchString = document.getElementById("searchInput").value;
    // clear any previous search results
    contactsContainer.innerHTML = "";

    let tmp = { search: searchString, userId: userId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + "/SearchContact." + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            // search requires that we actually do something with the response.
            if (this.readyState == 4 && this.status == 200) {
                let searchResults = JSON.parse(xhr.responseText).results;

                // id will be 0 if there are no records found
                if (searchResults[0].id > 1) // the search actually returned results
                {
                    const contactsContainer = document.getElementById("contactsContainer");

                    searchResults.forEach(item => {
                        // for every item, creates a new table row containing 4 table data cells (for the 4 parts of a contact.)
                        let contactItem = document.createElement("tr");
                        //contactItem.textContent = `${item.firstName} ${item.lastName} ${item.email} ${item.phone}`;

                        let firstNameTd = document.createElement("td");
                        let lastNameTd = document.createElement("td");
                        let phoneTd = document.createElement("td");
                        let emailTd = document.createElement("td");
                        let buttons = document.createElement("td");

                        firstNameTd.textContent = `${item.firstName}`;
                        lastNameTd.textContent = `${item.lastName}`;
                        phoneTd.textContent = `${item.email}`;
                        emailTd.textContent = `${item.phone}`;

                        contactItem.appendChild(firstNameTd);
                        contactItem.appendChild(lastNameTd);
                        contactItem.appendChild(phoneTd);
                        contactItem.appendChild(emailTd);

                        // make the delete button for this contact.
                        deleteButton = document.createElement("button");
                        deleteButton.innerText = "Delete";
                        deleteButton.addEventListener("click", () => {
                            doDelete(item.id);
                            contactItem.remove();
                        });
                        buttons.appendChild(deleteButton);

                        // make the edit button for this contact.
                        editButton = document.createElement("button");
                        editButton.innerText = "Edit";
                        editButton.addEventListener("click", () => {
                            // allow the user to edit the text in the various fields.
                            firstNameTd.setAttribute("contenteditable", "true");
                            lastNameTd.setAttribute("contenteditable", "true");
                            phoneTd.setAttribute("contenteditable", "true");
                            emailTd.setAttribute("contenteditable", "true");

                            // create a button to save the user's edits.
                            saveButton = document.createElement("button");
                            saveButton.innerText = "Save Edits";
                            saveButton.addEventListener("click", () => {
                                doEdit(firstNameTd.innerHTML, lastNameTd.innerHTML, phoneTd.innerHTML, emailTd.innerHTML, item.id);

                                // now that the editing is done, go back to normal
                                firstNameTd.setAttribute("contenteditable", "false");
                                lastNameTd.setAttribute("contenteditable", "false");
                                phoneTd.setAttribute("contenteditable", "false");
                                emailTd.setAttribute("contenteditable", "false");
                                saveButton.remove();
                            });
                            buttons.appendChild(saveButton);

                        });
                        buttons.appendChild(editButton);
                        contactItem.appendChild(buttons);
                        contactsContainer.appendChild(contactItem);
                    });
                }
            }
        }
        xhr.send(jsonPayload);
    }
    catch (err) {
        console.log(err);
    }
};

//AddContact part
document.getElementById("addButton").onclick = function () {
    let firstName = document.getElementById("addFirstNameInput").value;
    let lastName = document.getElementById("addLastNameInput").value;
    let phone = document.getElementById("addPhoneInput").value;
    let email = document.getElementById("addEmailInput").value;

    let tmp = { firstName: firstName, lastName: lastName, phone: phone, email: email, userId: userId };
    let jsonPayload = JSON.stringify(tmp);


    let url = urlBase + "/AddContact." + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.send(jsonPayload);
    }
    catch (err) {
        console.log(err);
    }
};
