document.querySelector(".recalc").addEventListener("click", (event) => recalc(event));

async function recalc(event) {
    try {
        await handleSave(event);
        await runRecalcProcess();
    } catch(error) {
        console.error(error);
    }
}

async function runRecalcProcess() {
    // recalc allocation
    const allocID = document.getElementById('allocationID').value;
    fetch(`/petco/live-animal/allocations/${allocID}/recalc-allocation`, {
      method: 'POST',
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
        if (!data.error) {
            window.location.pathname = `/petco/live-animal/allocations/${allocID}/update`;
        } else
            throw error(data.errorMsg)
      })
    .catch((error) => {
      console.error('Error:', error);
    })
  }