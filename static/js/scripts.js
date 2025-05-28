// Show spinner on form submission
document.querySelector('form').addEventListener('submit', function () {
    document.getElementById('spinner').style.display = 'block';
});

// Hide spinner when page fully loads
window.addEventListener('load', function () {
    document.getElementById('spinner').style.display = 'none';
});

// Auto-submit form when forecast type is changed
document.querySelector('select[name="forecast_type"]').addEventListener('change', function () {
    document.getElementById('spinner').style.display = 'block';
    this.form.submit();
});