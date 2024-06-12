// Select all delete buttons
const deleteButtons = document.querySelectorAll('.delete-action');

// Loop through each button and add an event listener
deleteButtons.forEach(button => {
    button.addEventListener('click', (event) => listenForDelete(event))
});

function listenForDelete(event) {
    // Get the clicked button
    const clickedButton = event.target;

    // Get the data attributes
    const paramKey = clickedButton.getAttribute('data-param-key');
    const rowKey = clickedButton.getAttribute('data-row-key');

    // If alloc_param_id is blank, remove the row from the table
    if (!paramKey) {
        const row = clickedButton.closest('tr');
        row.remove();
    } else {
        // If alloc_param_id is not blank, redirect to delete and refresh
        window.location.href =
            `/petco/live-animal/allocations/params/${paramKey}/delete`;
    }   
}