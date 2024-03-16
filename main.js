var searchMode = 'Album';
const searchBox = document.getElementById('SearchBox');
const MBIDButton = document.getElementById('MBIDSelector');
const AlbumButton = document.getElementById('AlbumSelector');
const ArtistButton = document.getElementById('ArtistSelector');

async function Search() {
    var query = document.getElementById("SearchBox").value;
    switch (searchMode) {
        case 'MBID':
            LoadTracklist(query);
            break;
        case 'Album':
            let x = await fetch(`https://musicbrainz.org/ws/2/release?query=${query}&limit=25&inc=recordings&fmt=json`)
            let result = await x.json();
            let albums = result.releases;
            let results = [];
            let formattedResults = [];
            for (let i = 0; i < albums.length; i++) {
                //TO DO add for loop to check for multiple artists
                let artist = albums[i]["artist-credit"][0].name;
                let album = albums[i].title;
                let trackcount = albums[i]["track-count"];
                let mbid = `'${albums[i].id}'`;
                results[i] = { artist, album, trackcount, mbid };
            }
            formattedResults = results.filter((value, index) => {
                return index === results.findIndex(results => {
                    resultsCheck = JSON.stringify(results.artist) + JSON.stringify(results.album) + JSON.stringify(results.trackcount);
                    valueCheck = JSON.stringify(value.artist) + JSON.stringify(value.album) + JSON.stringify(value.trackcount);
                    return resultsCheck === valueCheck
                })
            });
            ShowAlbumSearchResults(formattedResults, "albumresults");
            break;
        case 'Artist':
            break;
    }
}

function ShowAlbumSearchResults(array, listId) {
    ClearAllLists();
    let list = document.getElementById(listId);
    for (i = 0; i < array.length; ++i) {
        let button = document.createElement('button');
        let li = document.createElement('li');
        li.innerText = `${array[i].artist} - ${array[i].album} (${array[i].trackcount} Tracks)`;
        button.setAttribute("id", "albumresult");
        button.setAttribute("onclick", `LoadTracklist(${array[i].mbid})`);
        list.appendChild(button);
        button.appendChild(li);
    }
}

async function LoadTracklist(MBID) {
    try {
        let x = await fetch(`https://musicbrainz.org/ws/2/release/${MBID}?inc=recordings&fmt=json`);
        let album = await x.json();
        let tracks = album.media[0].tracks;
        let tracklist = [];
        for (let i = 0; i < tracks.length; i++) {
            let obj = tracks[i];
            tracklist[i] = obj.title;
        }
        ClearAllLists();
        let list = document.getElementById("albumtracklist");
        for (i = 0; i < tracklist.length; ++i) {
            let li = document.createElement('li');
            li.innerText = tracklist[i];
            li.setAttribute("draggable", "true");
            li.setAttribute("id", "albumtrack");
            list.appendChild(li);
        }
    } catch {
        console.log('Invalid MBID');
    }
}

function SearchMode(mode) {
    ClearAllLists()
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

function ClearList(...listId) {
    document.getElementById(listId).innerHTML = "";
}

function ClearAllLists() {
    ClearList("albumresults");
    ClearList("albumtracklist");
    //ClearList("artistresults");
}