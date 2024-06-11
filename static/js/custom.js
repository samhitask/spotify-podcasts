document.addEventListener("DOMContentLoaded", function() {
    console.log("Custom JS is loaded!");

    var cardTitles = document.querySelectorAll('.card-title');
    cardTitles.forEach(function(title) {
        title.addEventListener('click', function() {
            alert('Listen on Spotify! ' + this.textContent);
        });
    });
});