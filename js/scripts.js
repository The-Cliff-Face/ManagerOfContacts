const urlBase = 'http://managerofcontacts.xyz/LAMPAPI';
const extension = 'php';


function doLogin()
{
    userId = 0;
    firstName = "";
    lastName = "";
    let login = document.getElementById("contact-username").value;
    let password = document.getElementById("contact-password").value;
    var hash = md5( password );
    document.getElementById("loginResult").innerHTML = "";
    //let tmp = {login:login,password:password};
    var tmp = {login:login,password:hash};
    let jsonPayload = JSON.stringify( tmp );
    
    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse( xhr.responseText );
                userId = jsonObject.id;
        
                if( userId < 1 )
                {
                    document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
                    document.getElementById("submission-box").classList.add("invalid");
                    return;
                }
        
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();
                // change href to the next page
                window.location.href = "main_page_demo.html";
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

function goToSignup()
{
    window.location.href = "signup.html";
}

function register()
{
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
    /*
    const fieldObj = {
        username,
        firstname,
        lastname,
    }
    if (preventSQLInjection(fieldObj)) {
        console.log("Illegal Input!");
        const errorMessage = document.getElementById('signupResult');
        errorMessage.textContent = "We do not allow certain keywords";
        return;
    }
    */
    
    var hash = md5(password);
    
    let tmp = {
            firstName: firstname,
            lastName: lastname,
            login: username,
            password: hash
        };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase  + "/Signup." + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        xhr.onreadystatechange = function()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                let jsonObject = JSON.parse( xhr.responseText );
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
    catch (err)
    {
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
function signupCheck(username,firstname,lastname,password)
{
    return true;
}

function preventSQLInjection(fieldObj)
{
    let result = false;
    const SQLCommands = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|REPLACE|RENAME)\b/i;
    const illegalCharacters = /['";\-\-%]/;

    Object.values(fieldObj).forEach(value => {
        result |= (SQLCommands.test(value) || illegalCharacters.test(value));
    }); 
    return result;
}


function saveCookie()
{
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime()+(minutes*60*1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");
    for(var i = 0; i < splits.length; i++)
    {
        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");
        if( tokens[0] == "contact-firstname" )
        {
            firstName = tokens[1];
        }
        else if( tokens[0] == "contact-lastname" )
        {
            lastName = tokens[1];
        }
        else if( tokens[0] == "contact-username" )
        {
            userId = parseInt( tokens[1].trim() );
        }
    }
    
    if( userId < 0 )
    {
        window.location.href = "index.html";
    }
    else
    {
//        document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
    }
}
