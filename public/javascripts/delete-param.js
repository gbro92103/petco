// Select all delete buttons
const deleteButtons = document.querySelectorAll('.delete-action');

// Loop through each button and add an event listener
deleteButtons.forEach(button => {
    button.addEventListener('click', (event) => listenForDelete(event))
});

function listenForDelete(event) {
    
    const result = confirm("Are you sure you want to delete this row?");
    
    if (!result) return;

    // Get the clicked button
    const clickedButton = event.target;

    // Get the data attributes
    const paramKey = clickedButton.getAttribute('data-param-key');

    // If alloc_param_id is blank, remove the row from the table
    if (!paramKey) {
        const row = clickedButton.closest('tr');
        row.remove();
    } else {
        // Send data to server to delete
        fetch(`/petco/live-animal/allocations/params/${paramKey}/delete`)
        .then(response => {
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.errors) {
                displayErrors(data.errors)
            }
            else {
                const ulElement = document.querySelector('.errors-list'); 
                ulElement.innerHTML = '';
                console.log('Success:', data)
                const row = clickedButton.closest('tr');
                row.remove();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        })
    }
}   
