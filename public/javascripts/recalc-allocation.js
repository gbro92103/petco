document.querySelector(".recalc").addEventListener("click", (event) => recalc(event));

async function recalc(event) {
    try {
        await handleSave(event);
        runRecalcProcess();
    } catch(error) {
        console.error(error);
    }
}

function runRecalcProcess() {
    // recalc allocation
    console.log("recalc fetch process starting.");
    const allocID = document.getElementById('allocationID').value;
    fetch(`/petco/live-animal/allocations/${allocID}/recalc-allocation`, {
      method: 'POST',
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
        if (data.error === true) {
          throw new Error(data.errorMsg)
        } else
          console.log("recalc process completed successfully.")
          const pathName = `/petco/live-animal/allocations/${allocID}/update`;
          window.location.pathname = pathName;
          console.log("loading " + pathName + ".");
          
      })
    .catch((error) => {
      console.error('Recalc Process Error:', error);
    })
  }