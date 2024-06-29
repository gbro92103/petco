document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to all relevant inputs
    const inputs = document.querySelectorAll('select[name^="sales_method_"], input[name^="calc_alloc_qty_"], input[name^="revised_alloc_qty_"], input[name^="notes_"]');
    
    inputs.forEach(input => {
        input.addEventListener('change', handleInputChange);
    });
});

function handleInputChange(event) {
    const input = event.target;
    const name = input.name;
    const value = input.value;
    const index = name.match(/\d+/)[0]; // Extract the index number
    const field = name.replace(`_${index}`, ''); // Extract the field name
    const allocLineInput = document.querySelector(`input[name="alloc_line_${index}"]`);
    const alloc_line_id = allocLineInput.value;

    const data = {
        alloc_line_id,
        field,
        value
    };

    // Send the JSON object to the server
    fetch(`/petco/live-animal/allocations/save-alloc-line`, {
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
        const ulElement = document.querySelector('.errors-list'); 
        ulElement.innerHTML = '';
        if (data.errors) {
            data.errors.forEach((error) => {
                const listItem = document.createElement('li');
                listItem.textContent = error.msg;
                ulElement.appendChild(listItem);
            });
        }
        const allocID = document.getElementById('allocationID').value;
        const pathName = `/petco/live-animal/allocations/${allocID}/update`;
        window.location.pathname = pathName;

        return data; // Ensure the function returns the data
    })
    .catch(error => {
        console.error('Error:', error);
        throw error; // Rethrow the error to be caught in handleSave
    });
}
