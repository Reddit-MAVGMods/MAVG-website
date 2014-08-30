var sort = "latest",
    show = {
        games: true,
        images: true
    };

$(function() {
    $("#btn-sort-latest, #btn-sort-popular").click(function() {
        var clicksort = this.id.split("-")[2];

        if(sort === clicksort) { return false; }
        else {
            sort = clicksort;
            $("#btn-sort-latest, #btn-sort-popular").removeClass("btn-success").addClass("btn-info").toggleClass("active");
            $(this).removeClass("btn-info").addClass("btn-success").blur();
        }
    });

    $("#btn-show-games, #btn-show-images").click(function() {
        var type = this.id.split("-")[2];

        if(show[type]) {
            $(this).removeClass("btn-success").addClass("btn-info").blur();
        } else {
            $(this).removeClass("btn-info").addClass("btn-success").blur();
        }

        $(this).toggleClass("active");
        show[type] = !show[type];
        updateContentFct();
    });
});

function updateContentFct() {
    if(show.games) {
        $("#games").show();
    } else {
        $("#games").hide();
    }

    if(show.images) {
        $("#images").show();
    } else {
        $("#images").hide();
    }

    if(show.games && show.images) {
        $("#content-divider").show();
    } else {
        $("#content-divider").hide();
    }
}