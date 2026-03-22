
var documents = [];
var idx = null;

function buildIndex() {
    idx = lunr(function () {
        this.ref('id');
        this.field('title');
        this.field('body');
        this.field('categories');

        documents.forEach(function (doc) {
            this.add(doc);
        }, this);
    });
}

function loadSearchDocuments() {
    var searchDataUrl = window.lunrSearchDataUrl || '/assets/search.json';

    return fetch(searchDataUrl)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to load search index');
            }
            return response.json();
        })
        .then(function (data) {
            documents = data;
            buildIndex();
        })
        .catch(function (error) {
            console.error(error);
        });
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function lunr_search(term) {
    if (!term || !idx) {
        return false;
    }

    $('#lunrsearchresults').show(400);
    $('body').addClass('modal-open');

    document.getElementById('lunrsearchresults').innerHTML = '<div id="resultsmodal" class="modal fade show d-block" tabindex="-1" role="dialog" aria-labelledby="resultsmodal"> <div class="modal-dialog shadow-lg" role="document"> <div class="modal-content" style="background-color: rgb(15, 37, 64); color: #fff;"> <div class="modal-header" id="modtit"> <button type="button" class="close text-white" id="btnx" data-dismiss="modal" aria-label="Close"> &times; </button> </div> <div class="modal-body"> <ul class="mb-0 list-unstyled"> </ul> </div> <div class="modal-footer"><button id="btnx" type="button" class="btn btn-outline-danger btn-sm" data-dismiss="modal">Close</button></div></div> </div></div>';

    document.getElementById('modtit').innerHTML = "<h5 class='modal-title'>Search results for '" + escapeHtml(term) + "'</h5>" + document.getElementById('modtit').innerHTML;

    var results = idx.search(term);
    if (results.length > 0) {
        for (var i = 0; i < results.length; i++) {
            var ref = results[i].ref;
            var url = documents[ref].url;
            var title = documents[ref].title;
            var body = documents[ref].body.substring(0, 160) + '...';
            document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML += "<li class='lunrsearchresult mb-3'><a href='" + escapeHtml(url) + "'><span class='title' style='color: rgb(58, 143, 153); font-weight: bold;'>" + escapeHtml(title) + "</span><br /><small><span class='body' style='color: #ccc;'>" + escapeHtml(body) + "</span><br /><span class='url' style='color: #888;'>" + escapeHtml(url) + "</span></small></a></li>";
        }
    } else {
        document.querySelectorAll('#lunrsearchresults ul')[0].innerHTML = "<li class='lunrsearchresult' style='color: #ccc;'>No results found</li>";
    }

    return false;
}

$(function () {
    loadSearchDocuments();

    $('#lunrsearchresults').on('click', '#btnx', function () {
        $('#lunrsearchresults').hide(5);
        $('body').removeClass('modal-open');
    });
});