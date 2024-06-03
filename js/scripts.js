const urlBase = 'http://managerofcontacts.xyz/LAMPAPI';
const extension = 'php';


function invalidLoginAnimation() {
    const submissionBox = document.getElementById("submission-box");
    submissionBox.classList.add("invalid");
    submissionBox.addEventListener("animationend", function () {
        submissionBox.classList.remove("invalid");
    }, { once: true });

}

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
                    invalidLoginAnimation();
                    return;
                }
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;
                user_cookie = {
                    id: userId,
                    firstName: firstName,
                    lastName: lastName,
                }


                saveCookie(user_cookie);
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


function clearAllFields() {
    var inputCollection = document.getElementsByTagName("input");
    for (var i = 0; i < inputCollection.length; i++) {
        if (inputCollection[i].id == "contact-firstname" ||
            inputCollection[i].id == "contact-lastname")
            continue;
        inputCollection[i].value = "";
    }
}

function register() {
    if (!requirementsSatisfied) {
        const errorMessage = document.getElementById('signupResult');
        errorMessage.textContent = "Requirements not satisfied";
        invalidLoginAnimation();
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
        invalidLoginAnimation();
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
                if ("error" in jsonObject) {
                    if (jsonObject.error == "Login Not Available") {
                        const errorMessage = document.getElementById('signupResult');
                        const errorPassword = document.getElementById('confirm-password-result');
                        errorPassword.style.display = "none";
                        errorPassword.textContent = "";
                        errorMessage.textContent = "That username is taken.";
                        invalidLoginAnimation();
                        clearAllFields();
                        return;
                    }

                }
                userId = jsonObject.id;
                //document.getElementById("signUpResult").innerHTML = "Success";
                window.location.href = "login.html";
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;
                user_cookie = {
                    id: userId,
                    firstName: firstName,
                    lastName: lastName,
                }

                saveCookie(user_cookie);
            }
        }
        xhr.send(jsonPayload);

    }
    catch (err) {
        const errorMessage = document.getElementById('signupResult');
        errorMessage.textContent = err.message;
        return;
        //document.getElementById("signUpResult").innerHTML = err.message;
    }

}

function validateEmail(emailField) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(emailField);
}

function validatePhoneNumber(phoneField) {
    const regex = /^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/;
    return regex.test(phoneField);
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

function calculateRows() {
    let windowHeight = window.innerHeight;
    let tableRow = document.querySelector('#main_table'); 
    let tableRowStyles = window.getComputedStyle(tableRow);
    let tableRowFontSize = parseFloat(tableRowStyles.getPropertyValue('font-size'));
    let rowHeight = tableRowFontSize + 5;
    let maxRows = Math.floor(windowHeight / rowHeight);
    console.log(rowHeight)
    return maxRows
}


function saveCookie(user_cookie) {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    console.log(user_cookie['id']);
    document.cookie = "firstName=" + user_cookie["firstName"] + ",lastName=" + user_cookie["lastName"] + ",userId=" + user_cookie["id"] + ";expires=" + date.toGMTString() + "path=/";
    console.log(document.cookie);
}

function getUserId() {
    let data = document.cookie;
    let splits = data.split(",");
    let token = splits[2].split("=");
    let userId = parseInt(token[1]);
    return userId;
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
        return -1;
    }
    else {
        //        document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
        return userId;
    }
    return -1;
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


function debug_search() {
    clearSearchEntryField();
    const rows = document.getElementById("main_table");
    
    for (let i = 0; i < 50; i++) {
        let contactItem = document.createElement("tr");
        contactItem.setAttribute("id", "search-entry-" + i);
        
        
        let firstNameTd = document.createElement("td");
        let lastNameTd = document.createElement("td");
        let phoneTd = document.createElement("td");
        phoneTd.setAttribute("id","phoneField");
        let emailTd = document.createElement("td");
        let buttons = document.createElement("td");

        attachListeners(phoneTd,emailTd);

        firstNameTd.textContent = 'Johnathan';
        lastNameTd.textContent = 'Doe';
        phoneTd.textContent = '123-456-7890';
        emailTd.textContent = 'john_doe@ucf.edu';

        contactItem.appendChild(firstNameTd);
        contactItem.appendChild(lastNameTd);
        contactItem.appendChild(phoneTd);
        contactItem.appendChild(emailTd);

        deleteButton = deleteButtonHandler();
        buttons.appendChild(deleteButton);

        // make the edit button for this contact.
        editButton = editButtonHandler(buttons, deleteButton, firstNameTd, lastNameTd, phoneTd, emailTd, i);

        buttons.appendChild(editButton);
        contactItem.appendChild(buttons);
        rows.appendChild(contactItem);
    }
}



function clearSearchEntryField() {
    document.querySelectorAll('#search-entry').forEach(function (element) {
        element.remove();
    });
    _SEARCH_TABLE.clear_stack();
}

function onlyClearHTML() {
    document.querySelectorAll('#search-entry').forEach(function (element) {
        element.remove();
    });
}


function searchWrapper(showAllBoolean) {
    const field = document.getElementById("searchInput").value;
    if (showAllBoolean || field != "") {
        _PAGE_COUNTER = 1;
        clearSearchEntryField();
        QUERY_SET = new Set();
        prevScrollPosition = 0;
        if (showAllBoolean) {query('');} else { query(field);}
        display();
        return;
    }
    
    displayNoResults();
}




function displayNoResults() {
    clearSearchEntryField();
    const rows = document.getElementById("main_table");
    let contactItem = document.createElement("tr");
    contactItem.setAttribute("id", "search-entry");
                        //contactItem.textContent = `${item.firstName} ${item.lastName} ${item.email} ${item.phone}`;

    let a = document.createElement("td");
    let b = document.createElement("td");
    let message = document.createElement("td");
    let c = document.createElement("td");
    let d = document.createElement("td");
    message.textContent = "No Results!";
    contactItem.appendChild(a);
    contactItem.appendChild(b);
    contactItem.appendChild(message);
    contactItem.appendChild(c);
    contactItem.appendChild(d);
    rows.appendChild(contactItem);

}

function incrementPagination() {
    
    console.log("im here!");

    if (_SEARCH_TABLE._size <= 0) {return;} // false alarm
    _PAGE_COUNTER++;
    const field = document.getElementById("searchInput").value;
    query(field);

}


function addSortRow() {
    const rows = document.getElementById("main_table");
    let contactItem = document.createElement("tr");
    contactItem.setAttribute("id", "search-entry");
                        //contactItem.textContent = `${item.firstName} ${item.lastName} ${item.email} ${item.phone}`;

    let first = document.createElement("td");
    let second = document.createElement("td");
    let third = document.createElement("td");
    let fourth = document.createElement("td");
    let fifth = document.createElement("td");

    if (document.querySelector("#sortByFirstName") == null) {
        sortFirstName = document.createElement("button");
        sortFirstName.setAttribute("id", "sortByFirstName");
        sortFirstName.innerText = "Sort By First Name";
        sortFirstName.addEventListener("click", () => {
            _SEARCH_TABLE.sort("firstName");
            onlyClearHTML();
            display();
        });
        first.appendChild(sortFirstName);
    }

    if (document.querySelector("#sortByLastName") == null) {
        sortLastName = document.createElement("button");
        sortLastName.setAttribute("id", "sortByLastName");
        sortLastName.innerText = "Sort By Last Name";
        sortLastName.addEventListener("click", () => {
            _SEARCH_TABLE.sort("lastName");
            onlyClearHTML();
            display();
        });
        second.appendChild(sortLastName);
    }
    /*
    if (document.querySelector("#next") == null) {
        nexButton = document.createElement("button");
        nexButton.setAttribute("id", "next");
        nexButton.innerText = "Go next";
        nexButton.addEventListener("click", () => {
            incrementPagination();
        });
        third.appendChild(nexButton);
    }
    */
    
    contactItem.appendChild(first);
    contactItem.appendChild(second);
    contactItem.appendChild(third);
    contactItem.appendChild(fourth);
    contactItem.appendChild(fifth);
    rows.appendChild(contactItem);
}

function display() {
    const e = document.getElementById("debugResult");
    e.textContent = _SEARCH_TABLE._size;

    if (typeof _SEARCH_TABLE == 'undefined') {
        console.log("Something weird happened?");
        return;
    }
    if (_SEARCH_TABLE._stack.length == 0) {
        console.log("empty");
        return;
    }
    addSortRow();
    const rows = document.getElementById("main_table");
    for (const row of _SEARCH_TABLE._stack) {
        rows.appendChild(row._contactItem);
    }
}


function editButtonHandler(buttons, deleteButton, firstNameTd, lastNameTd, phoneTd, emailTd, item) {
    let editButton = document.createElement("button");
    editButton.innerText = "Edit";

    editButton.addEventListener("click", () => {
        
        firstNameTd.setAttribute("contenteditable", "true");
        lastNameTd.setAttribute("contenteditable", "true");
        phoneTd.setAttribute("contenteditable", "true");
        emailTd.setAttribute("contenteditable", "true");

        if (document.querySelector("#saveButton") == null) {
            let saveButton = document.createElement("button");
            saveButton.setAttribute("id", "saveButton");
            saveButton.innerText = "Save";
            saveButton.addEventListener("click", () => {
                doEdit(
                    firstNameTd.textContent,
                    lastNameTd.textContent,
                    phoneTd.childNodes[0].textContent,
                    emailTd.childNodes[0].textContent,
                    item.id,
                );

                firstNameTd.setAttribute("contenteditable", "false");
                lastNameTd.setAttribute("contenteditable", "false");
                phoneTd.setAttribute("contenteditable", "false");
                emailTd.setAttribute("contenteditable", "false");

                // Create new delete button
                let newDeleteButton = deleteButtonHandler();
                // Create new edit button and attach event listener
                let newEditButton = editButtonHandler(buttons, newDeleteButton, firstNameTd, lastNameTd, phoneTd, emailTd, item);
                buttons.appendChild(newDeleteButton);
                buttons.appendChild(newEditButton);
                saveButton.remove();
            });
            buttons.appendChild(saveButton);
        }
        deleteButton.remove();
        editButton.remove();
    });
    return editButton;
}



function deleteButtonHandler() {
    deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.addEventListener("click", () => {
        if (window.confirm("Really delete this contact?")) {
            doDelete(item.id);
            contactItem.remove();
        }
    });
    return deleteButton;
}

function showHint(target, message = "Error", type= "generic-error-hint") {
    if (document.querySelector("#"+type) == null) {
        let hint = document.createElement("div");
        hint.setAttribute("id", type);
        hint.setAttribute("contenteditable", "false");
        
        
        let text = document.createElement("span");
        text.textContent = message;
        hint.appendChild(text);
        hint.className = "hint-message";
        hint.classList.add("show");
        hint.classList.add("animated");
        target.appendChild(hint);
    }
    
}

function hideHint(target, id) {
    for (let node of target.childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && node.id === id) {
            target.removeChild(node);
            break;
        }
    }
}



function attachListeners(phoneTd, emailTd, item) {

    phoneTd.addEventListener('input', function () {
        let input = "";
        try {
            input = phoneTd.childNodes[0].textContent;
        } catch (err) {
            input = "";
        }
        
        if (!validatePhoneNumber(input) && input.length > 1) {
            
            console.log(input);
            phoneTd.style.outlineColor = "red";
            showHint(phoneTd, "Invalid phone format", "phone-hint-error");
            
        } else {
            hideHint(phoneTd, "phone-hint-error");
            if (input.length > 1) {
                phoneTd.style.outlineColor = "green";
            } else {
                phoneTd.style.outlineColor = "red";
            }
            
        }
    });

    emailTd.addEventListener('input', function () {
        const input = emailTd.childNodes[0].textContent;
        if (!validateEmail(input) && input.length > 1) {
            showHint(emailTd, "Invalid email format", "email-hint-error");
            emailTd.style.outlineColor = "red";
        } else {
            hideHint(emailTd, "email-hint-error");
            if (input.length > 1) {
                emailTd.style.outlineColor = "green";
            } else {
                emailTd.style.outlineColor = "red";
            }
            
    }
    });
}



function query(field) {
    if (typeof _SEARCH_TABLE == 'undefined') {
        console.error("Something weird happened?");
        return;
    }
    // read in the search query from the input text box
    let searchString = field;
    // clear any previous search results
    
    let userId = getUserId();
    if (userId < 0) { console.log("failed"); return; }

    let tmp = {pageNumber: _PAGE_COUNTER, pageSize:MAX_PAGE_SIZE, search: searchString, userId: userId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + "/PaginatedSearchContact." + extension;
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
                    //const contactsContainer = document.getElementById("contactsContainer");
                    

                    searchResults.forEach(item => {
                        let contactItem = document.createElement("tr");
                    
                        contactItem.setAttribute("id", "search-entry");
                        //contactItem.textContent = `${item.firstName} ${item.lastName} ${item.email} ${item.phone}`;

                        let firstNameTd = document.createElement("td");
                        let lastNameTd = document.createElement("td");
                        let phoneTd = document.createElement("td");
                        phoneTd.setAttribute("id","phoneField");
                        let emailTd = document.createElement("td");
                        emailTd.setAttribute("id","emailField");
                        let buttons = document.createElement("td");

                        firstNameTd.textContent = `${item.firstName}`;
                        lastNameTd.textContent = `${item.lastName}`;
                        phoneTd.textContent = `${item.phone}`;
                        emailTd.textContent = `${item.email}`;
                        attachListeners(phoneTd,emailTd);
                    

                        contactItem.appendChild(firstNameTd);
                        contactItem.appendChild(lastNameTd);
                        contactItem.appendChild(phoneTd);
                        contactItem.appendChild(emailTd);

                        // make the delete button for this contact.
                        deleteButton = deleteButtonHandler();
                        buttons.appendChild(deleteButton);

                        // make the edit button for this contact.
                        editButton = editButtonHandler(buttons, deleteButton, firstNameTd, lastNameTd, phoneTd, emailTd, item);
                        buttons.appendChild(editButton);
                        contactItem.appendChild(buttons);
                        let entry = new SearchEntry(item.firstName,item.lastName, contactItem);
                        console.log("pushed back");
                        _SEARCH_TABLE.push_back(entry);

                    });
                    display();
                } else {
                    if (_PAGE_COUNTER == 1) {
                        displayNoResults();
                    }
                   
                }

            }
        }
        xhr.send(jsonPayload);
    }
    catch (err) {
        console.log(err);
    }
}




function search(field) {
    // read in the search query from the input text box
    let searchString = field;
    // clear any previous search results
    clearSearchEntryField();
    let userId = getUserId();
    if (userId < 0) { console.log("failed"); return; }

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
                    //const contactsContainer = document.getElementById("contactsContainer");
                    const rows = document.getElementById("main_table");

                    searchResults.forEach(item => {
                        // for every item, creates a new table row containing 4 table data cells (for the 4 parts of a contact.)
                        let contactItem = document.createElement("tr");
                        contactItem.setAttribute("id", "search-entry");
                        //contactItem.textContent = `${item.firstName} ${item.lastName} ${item.email} ${item.phone}`;

                        let firstNameTd = document.createElement("td");
                        let lastNameTd = document.createElement("td");
                        let phoneTd = document.createElement("td");
                        let emailTd = document.createElement("td");
                        let buttons = document.createElement("td");

                        firstNameTd.textContent = `${item.firstName}`;
                        lastNameTd.textContent = `${item.lastName}`;
                        phoneTd.textContent = `${item.phone}`;
                        emailTd.textContent = `${item.email}`;

                        contactItem.appendChild(firstNameTd);
                        contactItem.appendChild(lastNameTd);
                        contactItem.appendChild(phoneTd);
                        contactItem.appendChild(emailTd);

                        // make the delete button for this contact.
                        deleteButton = document.createElement("button");
                        deleteButton.innerText = "Delete";
                        deleteButton.addEventListener("click", () => {
                            if (window.confirm("Really delete this contact?")) {
                                doDelete(item.id);
                                contactItem.remove();
                            }
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
                            if (document.querySelector("#saveButton") == null) {
                                saveButton = document.createElement("button");
                                saveButton.setAttribute("id", "saveButton");
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
                            }


                        });
                        buttons.appendChild(editButton);
                        contactItem.appendChild(buttons);
                        rows.appendChild(contactItem);
                    });
                }
            }
        }
        xhr.send(jsonPayload);
    }
    catch (err) {
        console.log(err);
    }
}


function addContact() {
    let userId = getUserId();
    if (userId < 0) { console.log("failed"); return; }


    let firstName = document.getElementById("addFirstNameInput").value;
    let lastName = document.getElementById("addLastNameInput").value;
    let phone = document.getElementById("addPhoneInput").value;
    let email = document.getElementById("addEmailInput").value;

    if (!validatePhoneNumber(phone) && !validateEmail(email)) {
        console.log("failed!");
        return; // TODO: add some sort of error message
    }

    // avoid processing blank names
    if (firstName === "" || lastName === "") {
        console.log("failed!");
        return; // TODO: add some sort of error message
    }

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

    // Empties the input fields after the contact has been added
    document.getElementById("addFirstNameInput").value = "";
    document.getElementById("addLastNameInput").value = "";
    document.getElementById("addPhoneInput").value = "";
    document.getElementById("addEmailInput").value = "";
}
