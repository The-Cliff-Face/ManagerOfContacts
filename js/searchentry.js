
class SearchTable {
    constructor() {
        this._stack = [];
        this._size = 0;
    }

    push_back(item) {
        if (!item instanceof SearchEntry) {
            throw new Error("Not a valid pass");
        }
        this._stack.push(item);
        this._size++;
    }
    remove(item) {
        const index = this._stack.indexOf(item);
        if (index !== -1) {
            this._stack.splice(index,1);
            this._size--;
        } 
        //
        /* 
        throw new Error("Not found!")*/
        // intentionally not return anything
    }
    sort(criteria = "firstName") {
        this._stack.sort((a, b) => a.compareTo(b, criteria));
    }
    
    clear_stack() {
        this._stack = [];
        this._size = 0;
    }

}


class SearchEntry {
    constructor(firstname,lastname, contactItem) {
        // contactItem is the actual row
        this._firstname = firstname;
        this._lastname = lastname;
        this._contactItem = contactItem;

    }
    compareTo(other, criteria) {
        if (!other instanceof SearchEntry) {
            throw new Error("Not a valid comparison!");
        }
        switch (criteria) {
            case "firstName":
                return this._firstname.localeCompare(other._firstname);
            case "lastName":
                return this._lastname.localeCompare(other._lastname);
        }
        
    }

}

