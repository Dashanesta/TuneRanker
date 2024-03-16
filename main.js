var searchMode = 'Album';
const searchBox = document.getElementById('SearchBox');
const MBIDButton = document.getElementById('MBIDSelector');
const AlbumButton = document.getElementById('AlbumSelector');
const ArtistButton = document.getElementById('ArtistSelector');

async function Search() {
    var query = document.getElementById("SearchBox").value;
    document.getElementById("albumtracklist").innerHTML = "";
    document.getElementById("albumresults").innerHTML = "";
    getAlbum(query);
    }

async function getAlbum(query) {
    switch (searchMode) {
        case 'MBID':
            ShowTracklist(await LoadTracklist(query), "albumtracklist");
            break;
        case 'Album':
            let x = await fetch(`https://musicbrainz.org/ws/2/release?query=${query}&limit=10&inc=recordings&fmt=json`)
            let result = await x.json();
            let albums = result.releases;
            let formattedResults = [];
            for(let i = 0; i < albums.length; i++) {
                //TO DO add for loop to check for multiple artists
                let artist = albums[i]["artist-credit"][0].name;
                let album = albums[i].title;
                formattedResults[i] = [artist, album];
            }
            console.log(formattedResults);
            ShowAlbumSearchResults(formattedResults, "albumresults");
            break;
        case 'Artist':
            break;
    }
}

async function LoadTracklist(MBID) {
    try {
        let x = await fetch(`https://musicbrainz.org/ws/2/release/${MBID}?inc=recordings&fmt=json`);
        let album = await x.json();
        let tracks = album.media[0].tracks;
        let tracklist = [];
        for(let i = 0; i < tracks.length; i++) {
            let obj = tracks[i];
            tracklist[i] = obj.title;
        }
        return tracklist;
    } catch {
        console.log('Invalid MBID');
        return;
    }
}

function ShowAlbumSearchResults(array, listId) {
    let list = document.getElementById(listId);
        for (i = 0; i < array.length; ++i) {
            let button = document.createElement('button');
            let li = document.createElement('li');
            li.innerText = array[i];
            button.setAttribute("id", "albumresult");
            list.appendChild(button);
            button.appendChild(li);
        }
}

function ShowTracklist(array, listId) {
    let list = document.getElementById(listId);
        for (i = 0; i < array.length; ++i) {
            let li = document.createElement('li');
            li.innerText = array[i];
            li.setAttribute("draggable", "true");
            li.setAttribute("id", "albumtrack");
            list.appendChild(li);
        }
}

function SearchMode(mode) {
    switch (mode) {
        case 'MBID':
            AlbumButton.setAttribute("class", "btn btn-outline-primary");
            ArtistButton.setAttribute("class", "btn btn-outline-primary");
            MBIDButton.setAttribute("class", "btn btn-primary");
            searchMode != 'MBID' ? searchBox.value = '' : null;
            searchBox.setAttribute("placeholder", "Enter MBID:");
            searchMode = 'MBID';
            break;

        case 'Album':
            AlbumButton.setAttribute("class", "btn btn-primary");
            ArtistButton.setAttribute("class", "btn btn-outline-primary");
            MBIDButton.setAttribute("class", "btn btn-outline-primary");
            searchMode != 'Album' ? searchBox.value = '' : null;
            searchBox.setAttribute("placeholder", "Enter Album:");
            searchMode = 'Album';
            break;

        case 'Artist':
            AlbumButton.setAttribute("class", "btn btn-outline-primary");
            ArtistButton.setAttribute("class", "btn btn-primary");
            MBIDButton.setAttribute("class", "btn btn-outline-primary");
            searchMode != 'Artist' ? searchBox.value = '' : null;
            searchBox.setAttribute("placeholder", "Enter Artist:");
            searchMode = 'Artist';
            break;
    }
}