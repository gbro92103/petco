const newLineButton = document.querySelector('.add-new-param');
const allocParamTable = document.querySelector('.alloc-params-table tbody');


if (newLineButton) {
    newLineButton.addEventListener("click", adjustNewRowPosition);

    function adjustNewRowPosition() {
        const tableBody = document.querySelector('.alloc-params-table tbody')
        const lastRowIndex = tableBody.rows.length - 1; 
        const row = document.querySelector('.add-new-row');

        //remove add new row line and append it later
        tableBody.removeChild(row);

        //add new row
        defineColumnsAndAddNewRows(tableBody, lastRowIndex);

        //append add new row line
        tableBody.appendChild(row);
    } 

    function defineColumnsAndAddNewRows(tableBody, index) {

        // Define the columns for the new row
        const columns = [
            { type: 'input', name: 'sku_nbr' },
            { type: 'field', name: 'desc'  },
            { type: 'input', name: 'like_sku' },
            { type: 'select', name: 'alloc_method', options: [{ innerText: 'Target WOS', value: 'Target WOS'}, {innerText: 'Target Qty', value: 'Target Qty'}, {innerText: 'Ignore QOH/Target Qty', value: 'Ignore QOH/Target Qty'}], selected: 'Target WOS' },
            { type: 'input', name: 'target_value' },
            { type: 'select', name: 'main_sales_method', options: [{innerText: 'LY Sold', value: 'LY Sold'}, {innerText: 'CY Sold', value: 'CY Sold'}, {innerText: 'Subclass Factor', value: 'SC Factor'}, {innerText: 'Sku Factor', value: 'Sku Factor'}], selected: 'LY Sold' },
            { type: 'input', name: 'avg_weekly_sold_per_store' },
            { type: 'input', name: 'eoq' },
            { type: 'input', name: 'override_store_count' },
            { type: 'select', name: 'exclude_stores', options: [{innerText: '', value: ''}, {innerText: "Yes", value: "true"}, {innerText: "No", value: "false"}]},
            { type: 'input', name: 'min_per_store' },
            { type: 'input', name: 'max_per_store' },
            { type: 'input', name: 'override_vend_id' },
            { type: 'select', name: 'limit_to_attached_vendor', options: [{innerText: '', value: ''}, {innerText: "Yes", value: "true"}, {innerText: "No", value: "false"}]},
            { type: 'input', name: 'hard_qty_limit' },
            { type: 'field', name: 'act_alloc_qty' },
            { type: 'field', name: 'avg_cost' },
            { type: 'input', name: 'discounted_cost' },
            { type: 'field', name: 'total_cost' },
            { type: 'field', name: 'act_nbr_of_stores' } 
        ];

        addNewRow(columns, tableBody, index)
        index++;
    }
}


function addNewRow(columns, tableBody, index) {
    
    // Create a new row element
    const newRow = document.createElement('tr');
    
    // Create input and select elements for each column
    columns.forEach(column => {
        const td = document.createElement('td');
        if (column.type === 'input') {
            const input = document.createElement('input');
            input.type = 'text';
            input.name = `allocParams[${column.name}][${index}]`;

            //add the event listener to look up costs and desc given the sku number
            if (column.name === 'sku_nbr')
                descAndCostLookup(input);
            
            td.appendChild(input);
        } else if (column.type === 'select') {
            const select = document.createElement('select');
            select.name = `allocParams[${column.name}][${index}]`;
            column.options.forEach(selectOption => {
                const option = document.createElement('option');
                option.value = selectOption.value;
                option.innerText = selectOption.innerText;
                if (selectOption.innerText === column.selected) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            td.appendChild(select);
        } else if (column.type === 'field') {
            td.setAttribute('data-name', `allocParams[${column.name}][${index}]`);
            td.setAttribute('class', 'read-only');
        }
        newRow.appendChild(td);
    });

    //add "delete button" in action column
    const delButton = document.createElement('button');
    const td = document.createElement('td');
    delButton.setAttribute('class', 'button delete-action');
    delButton.setAttribute('type', 'button');
    delButton.addEventListener('click', (event) => listenForDelete(event))
    delButton.innerText = "Delete";
    td.appendChild(delButton);
    newRow.appendChild(td);
    
    //label row with blank alloc_param_id (since it is new) in a hidden field
    const paramTd = document.createElement('td');
    paramTd.setAttribute('hidden', '');
    const paramInput = document.createElement('input')
    paramInput.setAttribute('name', `allocParams[alloc_param_id][${index}]`);
    paramInput.setAttribute('type', 'hidden');

    paramTd.appendChild(paramInput);
    newRow.appendChild(paramTd);
    
    // Append the new row to the table body
    tableBody.appendChild(newRow);    
}
