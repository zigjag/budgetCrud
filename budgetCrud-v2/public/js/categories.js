const categories = {
    Income: ["Paycheck", "Bonus", "Interest"],
    Expense: ["Home", "Shopping/Groceries", "Transportation", "Maintenance", "Bills"]
}

const $typeSelection = document.querySelector("datalist[id='type']")
const $categoriesSelection = document.querySelector("datalist[id='category']");

function appendEachItem(element, category){
    category.forEach((item) => {
        const option = document.createElement('option');
        option.value = item;
        element.appendChild(option);
    })
}

function loadCategorySelection(element){
    if($typeSelection.value == 'Income') appendEachItem(element, categories.Income);
    else appendEachItem(element, categories.Expense);
}

loadCategorySelection($categoriesSelection);
$typeSelection.onchange = function(){
    $categoriesSelection.innerHTML = '';
    loadCategorySelection($categoriesSelection);
}