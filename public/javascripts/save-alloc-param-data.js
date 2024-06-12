const form1 = document.querySelector(".settings-form")// Submit form 1
const form2 = document.querySelector(".alloc-params-form"); //Submit form 2 

document.querySelector(".save").addEventListener("click", function() {
  if (form1 && form2) {
    if (form1.checkValidity() && form2.checkVisibility()) {
      form1.submit(); // Submit the form if it is valid
      form2.submit();
    } else {
      form1.reportValidity(); // Show validation errors
      form2.reportValidity();
    }
  }
});

window.addEventListener('load', function () {
  // Find all read-only data cells
  const readOnlyCells = document.querySelectorAll('.read-only');
  
  // Loop through each read-only cell and create hidden inputs
  readOnlyCells.forEach(cell => {
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = cell.getAttribute('data-name');
    hiddenInput.value = cell.textContent.trim();
    cell.appendChild(hiddenInput);
  });
});