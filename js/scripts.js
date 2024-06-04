const urlBase = 'http://managerofcontacts.xyz/LAMPAPI';
const extension = 'php';


function invalidLoginAnimation() {
    const submissionBox = document.getElementById("submission-box");
    submissionBox.classList.add("invalid");
    submissionBox.addEventListener("animationend", function () {
        submissionBox.classList.remove("invalid");
    }, { once: true });

}

function setUpContactsPage() {
    const container = document.getElementById('entry_table');
    container.style.maxHeight = window.innerHeight;

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
    let rowHeight = tableRowFontSize + 15;
    let maxRows = Math.floor(windowHeight / rowHeight);
    console.log(maxRows)
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
    if (!validatePhoneNumber(phone) || !validateEmail(email)) {
        return -1;
    }
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
        return -1;
    }
    return 1;
}


function debug_search() {
    clearSearchEntryField();
    const rows = document.getElementById("main_table");
    console.log(MAX_PAGE_SIZE);

    for (let i = 0; i < MAX_PAGE_SIZE; i++) {
        let contactItem = document.createElement("tr");
        contactItem.setAttribute("id", "search-entry-" + i);


        let firstNameTd = document.createElement("td");
        let lastNameTd = document.createElement("td");
        let phoneTd = document.createElement("td");
        phoneTd.setAttribute("id", "phoneField");
        let emailTd = document.createElement("td");
        let buttons = document.createElement("td");

        attachListeners(phoneTd, emailTd, i);

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
        maxScrollPosition = 0;
        if (showAllBoolean) { query(''); } else { query(field); }
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

    if (_SEARCH_TABLE._size <= 0) { return; } // false alarm
    _PAGE_COUNTER++;
    const field = document.getElementById("searchInput").value;
    query(field);

}


function addSortRow() {
    if (document.querySelector("#sortByFirstName") != null ) {return;}
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
        if (row._firstname !== "") {
            rows.appendChild(row._contactItem);
        }
        
    }
}

function unselectMe(firstNameTd, lastNameTd, phoneTd, emailTd) {
    firstNameTd.setAttribute("contenteditable", "false");
    lastNameTd.setAttribute("contenteditable", "false");
    phoneTd.setAttribute("contenteditable", "false");
    emailTd.setAttribute("contenteditable", "false");

    firstNameTd.style.outline = "";
    firstNameTd.style.borderRadius = "";
    
    lastNameTd.style.outline = "";
    lastNameTd.style.borderRadius = "";
    
    phoneTd.style.outline = "";
    phoneTd.style.borderRadius = "";
    
    emailTd.style.outline = "";
    emailTd.style.borderRadius = "";
}


function editButtonHandler(buttons, deleteButton, firstNameTd, lastNameTd, phoneTd, emailTd, item, contactItem) {
    let editButton = document.createElement("button");
    editButton.setAttribute("id", "edit-button");
    editButton.setAttribute("title", "Edit this contact");
    editButton.setAttribute("aria-label", "Edit Contact");
    
    //editButton.innerText = "Edit";

    editButton.addEventListener("click", () => {

        old = {
            "firstNameTd": firstNameTd.textContent,
            "lastNameTd": lastNameTd.textContent,
            "phoneTd": phoneTd.childNodes[0].textContent,
            "emailTd": emailTd.childNodes[0].textContent,
        }
        const outlineColor = "#66baff"
        firstNameTd.setAttribute("contenteditable", "true");
        firstNameTd.style.outline = "2px inset "+ outlineColor;
        firstNameTd.style.borderRadius = "5px";
        
        lastNameTd.setAttribute("contenteditable", "true");
        lastNameTd.style.outline = "2px inset " + outlineColor;
        lastNameTd.style.borderRadius = "5px";

        phoneTd.setAttribute("contenteditable", "true");
        phoneTd.style.outline = "2px inset " + outlineColor;
        phoneTd.style.borderRadius = "5px";

        emailTd.setAttribute("contenteditable", "true");
        emailTd.style.outline = "2px inset "+ outlineColor;
        emailTd.style.borderRadius = "5px";

        if (document.querySelector("#saveButton") == null) {
            let saveButton = document.createElement("button");
            let cancelButton = document.createElement("button");
            cancelButton.innerHTML = "Cancel";
            saveButton.setAttribute("id", "saveButton");
            saveButton.innerText = "Save";
            saveButton.addEventListener("click", () => {
                let res = doEdit(
                    firstNameTd.textContent,
                    lastNameTd.textContent,
                    phoneTd.childNodes[0].textContent,
                    emailTd.childNodes[0].textContent,
                    item.id,
                );
                if (res < 0) { 
                    showHint(saveButton,"Error has Occured", "save-error-result");
                    hideHint("phone-hint-error"+item.id);
                    hideHint("email-hint-error"+item.id); 
                    unselectMe(firstNameTd, lastNameTd, phoneTd, emailTd);
                    firstNameTd.textContent = old['firstNameTd']; // lazy way of reverting 
                    lastNameTd.textContent = old['lastNameTd'];
                    phoneTd.childNodes[0].textContent = old['phoneTd'];
                    emailTd.childNodes[0].textContent = old['emailTd'];
                    setTimeout(function() {hideHint("save-error-result");}, 2000);
                    return; 
                }

                unselectMe(firstNameTd, lastNameTd, phoneTd, emailTd);

                // Create new delete button
                let newDeleteButton = deleteButtonHandler(contactItem, item);
                // Create new edit button and attach event listener
                let newEditButton = editButtonHandler(buttons, newDeleteButton, firstNameTd, lastNameTd, phoneTd, emailTd, item);
                buttons.appendChild(newDeleteButton);
                buttons.appendChild(newEditButton);
                saveButton.remove();
                cancelButton.remove();
            });
            cancelButton.addEventListener("click", () => {
                unselectMe(firstNameTd, lastNameTd, phoneTd, emailTd);

                firstNameTd.textContent = old['firstNameTd'];
                lastNameTd.textContent = old['lastNameTd'];
                phoneTd.childNodes[0].textContent = old['phoneTd'];
                emailTd.childNodes[0].textContent = old['emailTd'];

                hideHint("phone-hint-error"+item.id);
                hideHint("email-hint-error"+item.id);
                
                let newDeleteButton = deleteButtonHandler(contactItem, item);
                // Create new edit button and attach event listener
                let newEditButton = editButtonHandler(buttons, newDeleteButton, firstNameTd, lastNameTd, phoneTd, emailTd, item);
                buttons.appendChild(newDeleteButton);
                buttons.appendChild(newEditButton);
                saveButton.remove();
                cancelButton.remove();

            });
            buttons.appendChild(saveButton);
            buttons.appendChild(cancelButton);
        }
        deleteButton.remove();
        editButton.remove();
    });
    return editButton;
}



function deleteButtonHandler(contactItem, item) {
    deleteButton = document.createElement("button");
    deleteButton.setAttribute("id", "delete-button");
    deleteButton.setAttribute("title","Delete this contact");
    deleteButton.setAttribute("aria-label", "Delete Contact");
    //deleteButton.innerText = "Delete";
    deleteButton.addEventListener("click", () => {
        if (window.confirm("Really delete this contact?")) {
            doDelete(item.id);
            contactItem.remove();
            hideHint("phone-hint-error"+item.id);
            hideHint("email-hint-error"+item.id);
        }
    });
    return deleteButton;
}

function showHint(target, message = "Error", type = "generic-error-hint") {
    if (document.querySelector("#" + type) == null) {

        let hint = document.createElement("div");
        hint.setAttribute("id", type);
        hint.setAttribute("contenteditable", "false");
        let text = document.createElement("span");
        text.textContent = message;
        hint.appendChild(text);
        hint.className = "hint-message";
        hint.classList.add("show");
        hint.classList.add("animated");
        document.body.appendChild(hint);
        let targetRect = target.getBoundingClientRect();
        hint.style.position = "absolute";
        hint.style.left = targetRect.left + "px";
        hint.style.top = (targetRect.bottom + window.scrollY) + "px";
        document.body.appendChild(hint);
    }
}


function hideHint(id) {
    console.log(id);
    if (document.querySelector("#" + id) != null) {
        const hint = document.getElementById(id);
        hint.remove();
    }
}



function attachListeners(phoneTd, emailTd, id) {

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
            showHint(phoneTd, "Invalid phone format", "phone-hint-error" + id);

        } else {
            hideHint("phone-hint-error" + id);
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
            showHint(emailTd, "Invalid email format", "email-hint-error" + id);
            emailTd.style.outlineColor = "red";
        } else {
            hideHint("email-hint-error" + id);
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
    console.log("max page size: " + MAX_PAGE_SIZE);
    console.log("pageNumber: " + _PAGE_COUNTER);
    let tmp = { pageNumber: _PAGE_COUNTER, pageSize: MAX_PAGE_SIZE, search: searchString, userId: userId };
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
                        if (item.firstName === "") {return;}
                        let firstNameTd = document.createElement("td");
                        let lastNameTd = document.createElement("td");
                        let phoneTd = document.createElement("td");
                        phoneTd.setAttribute("id", "phoneField");
                        let emailTd = document.createElement("td");
                        emailTd.setAttribute("id", "emailField");
                        let buttons = document.createElement("td");

                        firstNameTd.textContent = `${item.firstName}`;
                        lastNameTd.textContent = `${item.lastName}`;
                        phoneTd.textContent = `${item.phone}`;
                        emailTd.textContent = `${item.email}`;
                        attachListeners(phoneTd, emailTd, item.id);


                        contactItem.appendChild(firstNameTd);
                        contactItem.appendChild(lastNameTd);
                        contactItem.appendChild(phoneTd);
                        contactItem.appendChild(emailTd);

                        // make the delete button for this contact.
                        deleteButton = deleteButtonHandler(contactItem, item);
                        buttons.appendChild(deleteButton);

                        // make the edit button for this contact.
                        editButton = editButtonHandler(buttons, deleteButton, firstNameTd, lastNameTd, phoneTd, emailTd, item, contactItem);
                        buttons.appendChild(editButton);
                        contactItem.appendChild(buttons);
                        let entry = new SearchEntry(item.firstName, item.lastName, contactItem);
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


function changeAddContactResultButton(message) {
    document.getElementById('addButton').innerText = message;
    setTimeout(function() {document.getElementById('addButton').innerText = 'Add Contact';}, 2000);
}


function addContact() {
    let userId = -1;
    try {
        userId = getUserId();
    } catch (err) {
        changeAddContactResultButton("failed");
    }

    if (userId < 0) { changeAddContactResultButton("failed"); return; }


    let firstName = document.getElementById("addFirstNameInput").value;
    let lastName = document.getElementById("addLastNameInput").value;
    let phone = document.getElementById("addPhoneInput").value;
    let email = document.getElementById("addEmailInput").value;

    if (!validatePhoneNumber(phone) || !validateEmail(email)) {
        //window.alert("Invalid formatting of email / phone");
        changeAddContactResultButton("Invalid!");
        
        return; // TODO: add some sort of error message
    }

    // avoid processing blank names
    if (firstName === "" || lastName === "") {
        //window.alert("You cannot have blank first or last names");
        changeAddContactResultButton("Invalid!");
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
        changeAddContactResultButton("failed");
        console.log(err);
    }

    // Empties the input fields after the contact has been added
    document.getElementById("addFirstNameInput").value = "";
    document.getElementById("addLastNameInput").value = "";
    document.getElementById("addPhoneInput").value = "";
    document.getElementById("addEmailInput").value = "";
    changeAddContactResultButton("Success!");
    
}
