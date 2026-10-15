// Function to fetch all transactions from the API
async function fetchTransactions() {
    try {
        const response = await fetch('http://localhost:5000/transactions'); //API Call 
        const data = await response.json();
        displayTransactions(data);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

// Function to display transactions on the page

let selectedTransactions = [];  // Track selected IDs
let selectMode = false;  // Track if we're in select mode

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    container.innerHTML = ''; // Clear previous content
    
    transactions.forEach(transaction => {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.style.padding = '10px';
        div.style.border = '1px solid #ddd';
        
        // If in select mode, add checkbox
        if (selectMode) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = transaction.id;
            
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedTransactions.push(transaction.id);
                } else {
                    selectedTransactions = selectedTransactions.filter(id => id !== transaction.id);
                }
                
                // Show/hide delete button based on selections
                const deleteBtn = document.getElementById('deleteBtn');
                if (selectedTransactions.length > 0) {
                    deleteBtn.style.display = 'inline-block';
                } else {
                    deleteBtn.style.display = 'none';
                }
            });
            
            div.appendChild(checkbox);
            div.appendChild(document.createTextNode(' '));
        }
        
        const text = document.createElement('span');
        text.textContent = `${transaction.type} - P${transaction.amount} - ${transaction.category} - ${transaction.description}`;
        div.appendChild(text);
        
        container.appendChild(div);
    });
}
//Toggle Function for select and delete
function toggleSelectMode(){
    selectMode = !selectMode;
    selectedTransactions = [];  // Fixed typo

    const selectBtn = document.getElementById("selectBtn");
    const deleteBtn = document.getElementById("deleteBtn");

    if (selectMode){
        selectBtn.textContent = "Cancel";
        selectBtn.style.backgroundColor = "#ff6b6b";
        deleteBtn.style.display = "none";
    }else {
        selectBtn.textContent = "Select";
        selectBtn.style.backgroundColor = "";  // Fixed typo
        deleteBtn.style.display = "none";  // Fixed typo
    }
    
    if (document.getElementById("transactionsList").innerHTML !== ""){  // Fixed typo
        fetchTransactions();
    }
}
// Listen for the Fetch button click
document.getElementById('fetchBtn').addEventListener('click', fetchTransactions);


async function createTransaction(event) {
    event.preventDefault();


    const type = document.getElementById("type").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const date = document.getElementById("date").value;
    

    const transactionData = {
        type: type,
        amount: parseFloat(amount),
        category: category,
        description: description,
        date: date
        };
    try {
        const response = await fetch("http://localhost:5000/transactions", { //API Call 
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transactionData)
        });
        const result = await response.json();
        console.log("Transaction created:", result);
        fetchTransactions();
    }catch (error){
        console.error("Error Creating transaction:", error);
    }
}
async function handleLogin(event){
    event.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try{
        const response = await fetch("http://localhost:5000/login",{ //API Call 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify({username, password})
        });
        const result = await response.json();

        if (response.ok){
            console.log("Logged in", result);
            document.getElementById("loginSection").style.display = "none";
            document.getElementById("registerSection").style.display = "none";
            document.getElementById("appSection").style.display = "block";

            
            
        }else {
            alert("Login failed: " + result.error);
        }
    }catch(error){
        console.error("Error logging in: ", error);
        alert("Error: " + error);
    }
}
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try{
        const response = await fetch ("http://localhost:5000/register", { //API Call 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }, 
            body:JSON.stringify({username, email, password})
        });
        const result = await response.json();
        
        if (response.ok){
            console.log("Registered: ", result);
            alert("Account created successfully! Please login. ");

            document.getElementById("registerForm").reset();
            document.getElementById("registerSection").style.display = "none";
            document.getElementById("loginSection").style.display = "block";
    } else {
        alert("Registration failed: " + result.error);
    }
}catch (error){
    console.error("Error registering: ", error);
    alert("Error: " + error);
    }
}
document.getElementById("toggleRegister").addEventListener("click", (e) => {
    e.preventDefault();

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
});
document.getElementById("toggleLogin").addEventListener("click", (e) =>{
    e.preventDefault();

    document.getElementById("loginSection").style.display = "block";
    document.getElementById("registerSection").style.display = "none";
});

async function deleteTransaction(){
    if (selectedTransactions.length === 0){
        alert("No Transaction selected");
        return;
    }

    // Fixed: Use backticks, not double quotes
    const confirmDelete = confirm(`Delete ${selectedTransactions.length} transaction(s)?`);
    if (!confirmDelete) return;

    try{
        for (const id of selectedTransactions){
            // Fixed: Use backticks for template literal
            const response = await fetch(`http://localhost:5000/transactions/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }  
            });
            if (!response.ok){
                // Fixed: Use backticks
                throw new Error(`Failed to delete transaction ${id}`);
            }
        }
        alert(`Deleted ${selectedTransactions.length} transaction(s)`);
        selectedTransactions = [];
        selectMode = false;
        document.getElementById('selectBtn').textContent = 'Select';
        document.getElementById('deleteBtn').style.display = 'none';
        fetchTransactions();  // Refresh list
        
    } catch (error) {
        console.error('Error deleting transactions:', error);
        alert('Error deleting transactions: ' + error.message);
    }
}
document.getElementById("fetchBtn").addEventListener("click", fetchTransactions);
document.getElementById("transactionForm").addEventListener("submit", createTransaction);
document.getElementById("loginForm").addEventListener("submit", handleLogin);
document.getElementById("registerForm").addEventListener("submit", handleRegister);
document.getElementById("selectBtn").addEventListener("click", toggleSelectMode);
document.getElementById("deleteBtn").addEventListener("click", deleteTransaction);
