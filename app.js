
// BudgetController Module
var budgetController = (function() {

    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };

    Expenses.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round(( this.value / totalIncome )*100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    };

    // DATA STRUCTURE.
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            inc: 0,
            exp: 0
        }, 
        budget: 0,
        percentage: -1
    };

    // CALCULATING TOTAL INCOME & TOTAL EXPENSES.
    var calculateTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {

        // ADDING ITEM TO DATA STRUCTURE.
        additem: function(type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } 
            else {
                ID = 0;
            }

            if(type === 'exp') {
                newItem = new Expenses(type, des, val);
            }
            else if (type === 'inc') {
                newItem = new Income(type, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        // CALCULATING BUDGET AND ASSIGNING VALUES TO DATA STRUCTURE.
        calcBudget : function() {

             calculateTotal('inc');
             calculateTotal('exp');

             data.budget = data.totals['inc'] - data.totals['exp'];

             if ( data.totals['inc'] > 0 ) {
                data.percentage = Math.round((data.totals['exp']/data.totals['inc'])*100);
             }
             else {
                data.percentage = -1;
             }
        },

        // MAKING THE BUDGET PUBLIC, THEN DISPLAY IT IN UI.
        getBudget : function() {

            return {
                budget: data.budget,
                totalIncome: data.totals['inc'],
                totalExpenses: data.totals['exp'],
                percentage: data.percentage
            };
        },

        // DELETING AN EXPENSE OR OR ITEM.
        deleteItem: function(type, id) {

            var index, ids;
            var ids = data.allItems[type].map(function(current) {
                return current.id;
        });

        index = ids.indexOf(id);
        data.allItems[type].splice(index, 1);
        },

        // CALCULATING %AGE FOR ALL EXPENSES.
        calculatePercentage: function() {

            data.allItems.exp.forEach(function(cur) {
                 cur.calcPercentage(data.totals.inc);
            });
        },

        // MAKING THE %AGE PUBLIC OF EACH EXPENSE, THEN DISPLAY IT IN UI.
        gettpercentages: function() {

            var percentage = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return percentage;
        },
    };

})();


// UI Controller Module
var UIcontroller = (function() {

    //OBJECT CONTAINING CLASSES OF HTML ELEMENTS.  
    var DOMstrings = {
        inputType: '.add__type',
        inputButton: '.add__btn',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        incomeList: '.income__list',
        expensesList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        date: '.budget__title--month'
    };

    // FORMATTING A NUMBER
    var formatedNumber = function(num, type) {

        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split('.');
        int = splitNum[0];

        if (int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = splitNum[1];

        if ( type === 'exp' || type === 'inc') {
            return (type === 'exp' ? '-' : '+') + int + '.' + dec;
        }
        else {
            return  int + '.' + dec;   
        }
        
    };

    var nodeLists = function(list, callback) {

        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {

        // TAKING INPUT FROM USER.
        getInput : function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        // ADDING HTML ELEMENTS AS INCOME & EXPENSE.
        addListItem: function(obj, type) {

            var html, newHtml, ele;

            if(type === 'inc') {
                ele = document.querySelector(DOMstrings.incomeList);
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp') {
                ele = document.querySelector(DOMstrings.expensesList);
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatedNumber(obj.value, obj.id));

            ele.insertAdjacentHTML('beforeend', newHtml);
        },

        // CLEARING THE INPUT FIELD.
        clearfields : function() {

            var fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            var fieldsarr = Array.prototype.slice.call(fields);

            fieldsarr.forEach( function(current) {
                current.value = "";
            });

            fieldsarr[0].focus();
        },

        // UPDATING BUDGET AFTER ADDING ELEMENTS.
        updateBudget : function(obj) {

            if (obj.totalIncome > obj.totalExpenses) {
                type = 'inc';
            }
            else if (obj.totalIncome < obj.totalIncome) {
                type = 'exp';
            }
            else {
                type = '';
            }

            document.querySelector(DOMstrings.budgetLabel).textContent = formatedNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatedNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatedNumber(obj.totalExpenses, 'exp');

            if ( obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';   
            }
        },

        // DELETING HTML ELEMENTS AS INCOME & EXPENSE.
        deleteListItem: function(selectorID) {

            var ele = document.getElementById(selectorID);
            ele.parentNode.removeChild(ele);
        },

        // UPDATING PERCENTAGE OF ALL EXPENSES.
        displayPercentage: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeLists(fields, function(cur, index) {
                if ( percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                }
                else {
                    cur.textContent = '---';
                }
            });
        },

        // SETTING DATE & TIME IN UI.
        dateandtime: function() {

            var getDate, year, months, month;
            getDate = new Date();
            year = getDate.getFullYear();
            month = getDate.getMonth();

            months = ['0', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novenber', 'December'];

            document.querySelector(DOMstrings.date).textContent = months[month] + ' ' + year;
        },

        // CHANGING COLOR ACC. TO INPUT FIELDS. 
        changeColor: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' + 
                DOMstrings.inputDescription + ', ' + 
                DOMstrings.inputValue
            );

            nodeLists(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },

        // RETURNING OBJECT TO OTHER MODULES.
        getDOMstrings : function() {
            return DOMstrings;
        }
    };

}) ();


// Controller Module
var Controller = (function(budgetctrl, UIctrl) {

    // SETTING EVENT LISTENERS FOR DOM.
    var setEventListener = ( function() {

        var DOM = UIctrl.getDOMstrings();

        // When users enter data.
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
    
        if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // When user deletes an expense.
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        // To change color acc. to income or expense.
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changeColor);
    });


    var ctrlAddItem = function() {

        // 1. Get Input Data from user.
        var input = UIctrl.getInput();

        // 2. Call for updating Budget in data structure.
        var updateBudget = function() {

        budgetctrl.calcBudget();

        var budget = budgetctrl.getBudget();

        UIctrl.updateBudget(budget);
        
        updatePercentages();
        };

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        var newItem = budgetctrl.additem(input.type, input.description, input.value);
        
        UIctrl.addListItem(newItem, input.type);

        UIctrl.clearfields();

            updateBudget();
        }
        
    };

    // Call for updating %ages for expenses
    var updatePercentages = function() {

        budgetctrl.calculatePercentage();

        var percentages = budgetctrl.gettpercentages();
        
        UIctrl.displayPercentage(percentages);
    };

    // Call for deleting items.
    var ctrlDeleteItem = function(event) {

        var itemsID, ID, type, splitID;

        itemsID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemsID) {

            splitID = itemsID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetctrl.deleteItem(type, ID);

            UIctrl.deleteListItem(itemsID);

            budgetctrl.calcBudget();
        }


    };
    return {
        init : function() {

            var budgetInit = {
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1,
            };
            UIctrl.updateBudget(budgetInit);

            UIctrl.dateandtime();
            
            setEventListener();
        }
    };

}) (budgetController, UIcontroller);

Controller.init();