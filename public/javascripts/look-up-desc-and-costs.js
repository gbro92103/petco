document.addEventListener('DOMContentLoaded', function() {
    // Get the text input element by its ID
    var myInputs = document.querySelectorAll('.sku');

    // Add an event listener for the 'input' event
    myInputs.forEach((input) => descAndCostLookup(input)); 
});

function descAndCostLookup(input) {
    input.addEventListener('change', function() {
        // This function will run whenever the text input value changes
        console.log(`The input value for ${input.name} has changed to: ${input.value}`);

        // Get the SKU number
        const skuNbr = input.value;;
        const match = input.name.match(/\[(\d+)\]$/);
        const rowID = match ? match[1] : null;

        // Select the table cells by their data-name attribute
        var descCell = document.querySelector(`td[data-name="allocParams[desc][${rowID}]"]`);
        var avgCostCell = document.querySelector(`td[data-name="allocParams[avg_cost][${rowID}]"]`);
        var discountCostInput = document.querySelector(`input[name="allocParams[discounted_cost][${rowID}]"]`);

        // Send a request to the server
        fetch(`/petco/live-animal/allocations/${skuNbr}/get-desc-and-costs`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    // Handle the error (e.g., show a message to the user)
                    // to be implemented later

                    // blank out fields if sku is not found
                    if (data.error === 'SKU number not found') {
                        if (descCell) descCell.textContent = "";
                        if (avgCostCell) avgCostCell.textContent = "";
                        if (discountCostInput) discountCostInput.value = "";
                    }
                } else {
                    // Update the table with the returned data
                    if (descCell) descCell.textContent = data.desc;
                    if (avgCostCell) avgCostCell.textContent = data.avg_cost;
                    if (discountCostInput) discountCostInput.value = data.avg_cost;
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });    
}