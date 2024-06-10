document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('inputLunchPeriod').addEventListener('blur', function(event) {
        if (event.target.value) {
            value = event.target.value
            if (value > 7) {
                event.target.value = 7;
            }
            if (value < 4) {
                event.target.value = 4;
            }
            event.target.value = Math.round(event.target.value )
        }
    });
});