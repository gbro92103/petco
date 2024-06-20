const form1 = document.querySelector(".settings-form")// Submit form 1

document.querySelector(".save").addEventListener("click", (event) => handleSave(event));
document.getElementById('allocationStatus').addEventListener("change", (event) => handleSave(event));

const allocID = document.getElementById('allocationID').value;
console.log("Allocation ID is:", allocID);

// Function to get the current value of the field
function getStatus() {
    return document.getElementById('allocationStatus').value;
}

// Store the initial value of the field when the page loads
const initialStatus = getStatus();


async function handleSave(event) {
  console.log("handle save process starting. Initial status: " + initialStatus);
  if (form1) {
    if (form1.checkValidity()) {
      event.preventDefault();

      try {
        const allocSettings = getAllocSettings();
        const allocParams = extractTableData();
        const data = { allocSettings, allocParams };
        const responseData = await sendData(data); // Await the sendData function
        
        if (!responseData.errors) {
          const newStatus = getStatus(); // Assuming getStatus() gets the new status from the form
          console.log("new allocation status is: " + newStatus);
          
          if (newStatus !== initialStatus) {
            console.log("allocation status is different, so reloading page.");
            location.reload();
          }
        } 

        return responseData;
      } catch (error) {
        console.error("Error saving:", error);
        throw error;
      }
    } else {
      form1.reportValidity(); // Show validation error
      throw new Error('form data is invalid');
    }
  }
}


function getAllocSettings() {
  const formData = new FormData(form1);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  return data;
}

function extractTableData() {
  let tbody = document.querySelector('.alloc-params-table tbody');
  let rows = tbody.rows; // Get rows from the first tbody
  let data = [];

  // Loop through all rows except the last one
  for (let i = 0; i < rows.length - 1; i++) {
    let row = rows[i];
    let rowData = {};

    
    if (row && row.cells) {
      Array.from(row.cells).forEach(cell => {
        if (cell.hasAttribute('data-name')) {
          let dataName = cell.getAttribute('data-name');
          let match = dataName.match(/allocParams\[(\w+)\]\[(\d+)\]/);
          if (match) {
            let field = match[1];
            rowData[field] = cell.innerText;
          }
        } else {
          // Handle input element case
          let input = cell.querySelector('input, select');
          if (input) {
            let fieldName = input.getAttribute('name');
            if (fieldName) {
              let match = fieldName.match(/allocParams\[(\w+)\]\[(\d+)\]/);
              if (match) {
                let field = match[1];
                rowData[field] = input.value;
              }
            }
          }
        }
      });
    }

    data.push(rowData);
  }
  return data;
}

async function sendData(data) {
  console.log("sending allocation data to the server to save.");
  return fetch('/petco/live-animal/allocations/submit-allocation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    document.getElementById('allocationID').value = data.allocID;

    if (data.errors) {
      displayErrors(data.errors);
      console.log("errors were found when attempting to save allocation data.");
    } else {
      const ulElement = document.querySelector('.errors-list'); 
      ulElement.innerHTML = '';
      console.log("allocation data was saved successfully.");
    }

    return data; // Ensure the function returns the data
  })
  .catch(error => {
    console.error('Error:', error);
    throw error; // Rethrow the error to be caught in handleSave
  });
}


// Function to display error messages
function displayErrors(errors) {
  const ulElement = document.querySelector('.errors-list'); // Assume the <ul> has an ID 'error-list'

  // Clear any existing error messages
  ulElement.innerHTML = '';

  // Add new error messages
  errors.forEach(errorMessage => {
    const listItem = document.createElement('li');
    listItem.textContent = errorMessage;
    ulElement.appendChild(listItem);
  });
}