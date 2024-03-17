var searchMode = 'Album';
const searchBox = document.getElementById('SearchBox');
const AlbumButton = document.getElementById('AlbumSelector');
const ArtistButton = document.getElementById('ArtistSelector');

async function Search() {
    var query = document.getElementById("SearchBox").value;
    switch (searchMode) {
        case 'Album':
            var x = await fetch(`https://musicbrainz.org/ws/2/release-group?query=${query}&type=album&limit=25&fmt=json`);
            var result = await x.json();
            console.log(result);
            var albums = result["release-groups"];
            var results = [];
            var formattedResults = [];
            for (let i = 0; i < albums.length; i++) {
                //TO DO add for loop to check for multiple artists
                var artist = albums[i]["artist-credit"][0].name;
                var album = albums[i].title;
                var mbid = `'${albums[i].id}'`;
                var releasestatus = [];
                for (let j = 0; j < albums[i].releases.length; j++) {
                    releasestatus[j] = albums[i].releases[j].status;
                }
                results[i] = { artist, album, releasestatus, mbid };
            }
            console.log(results);
            formattedResults = results.filter((value, index) => {
                return index === results.findIndex(results => {
                    resultsCheck = JSON.stringify(results.artist) + JSON.stringify(results.album);
                    valueCheck = JSON.stringify(value.artist) + JSON.stringify(value.album);
                    return resultsCheck === valueCheck;
                })
            });
            formattedResults = results.filter((value) => value.releasestatus.includes('Official'));
            ShowAlbumSearchResults(formattedResults);
            break;
        case 'Artist':
            var x = await fetch(`https://musicbrainz.org/ws/2/artist?inc=releases&query=${query}&limit=25&fmt=json`);
            var result = await x.json();
            var artists = result.artists;
            var results = [];
            var formattedResults = [];
            for (let i = 0; i < artists.length; i++) {
                var artistname = artists[i].name;
                var disambiguation = artists[i].disambiguation;
                var mbid = `'${artists[i].id}'`;
                results[i] = { artistname, disambiguation, mbid };
            }
            formattedResults = results.filter((value, index) => {
                return index === results.findIndex(results => {
                    resultsCheck = JSON.stringify(results.artistname) + JSON.stringify(results.disambiguation);
                    valueCheck = JSON.stringify(value.artistname) + JSON.stringify(value.disambiguation);
                    return resultsCheck === valueCheck;
                })
            });
            ShowArtistSearchResults(formattedResults);
            break;
    }
}

async function ShowAlbumSearchResults(array) {
    ClearAllLists();
    let list = document.getElementById("albumresults");
    for (var i = 0; i < array.length; i++) {
        var button = document.createElement('button');
        var li = document.createElement('li');
        li.innerText = `${array[i].artist} - ${array[i].album}`;
        button.setAttribute("id", i);
        button.setAttribute("class", "albumresult");
        button.setAttribute("onclick", `LoadTracklist(${array[i].mbid})`);
        list.appendChild(button);
        button.appendChild(li);
    }
    for (i = 0; i < array.length; i++) {
        try {
            let img = await LoadAlbumCover(array[i].mbid, "small");
            let cover = document.createElement('img');
            cover.setAttribute("width", "250");
            cover.setAttribute("height", "250");
            cover.setAttribute("src", img);
            document.getElementById(i).appendChild(cover);
        } catch {
            console.log(`${array[i].album} has no album cover available`);
        }
    }
}

async function LoadAlbumCover(mbid, size) {
    clippedMBID = mbid.substring(1,mbid.length-1);
    var x = await fetch(`https://coverartarchive.org/release-group/${clippedMBID}`);
    var result = await x.json();
    return result.images[0].thumbnails[size];
}

function ShowArtistSearchResults(array) {
    ClearAllLists();
    let list = document.getElementById("artistresults");
    for (i = 0; i < array.length; ++i) {
        let button = document.createElement('button');
        let li = document.createElement('li');
        let disambiguation = array[i].disambiguation ? `(${array[i].disambiguation})` : '';
        li.innerText = `${array[i].artistname} ${disambiguation}`;
        button.setAttribute("class", "artistresult");
        //button.setAttribute("type", "button");
        button.setAttribute("onclick", `ShowDiscography(${array[i].mbid})`);
        list.appendChild(button);
        button.appendChild(li);
    }
}

async function ShowDiscography(mbid) {
    var x = await fetch(`https://musicbrainz.org/ws/2/release-group/?artist=${mbid}&type=album&release-group-status=website-default&fmt=json`);
    var result = await x.json();
    var releasegroups = result["release-groups"];
    var results = [];
    for (let i = 0; i < releasegroups.length; i++) {
        var album = releasegroups[i].title;
        var releasedate = releasegroups[i]["first-release-date"];
        var mbid = `'${releasegroups[i].id}'`;
        results[i] = { album, releasedate, mbid };
    }
    results.sort((a, b) => new Date(a.releasedate) - new Date(b.releasedate));
    ClearAllLists();
    let list = document.getElementById("discography");
    for (i = 0; i < results.length; ++i) {
        let button = document.createElement('button');
        let li = document.createElement('li');
        li.innerText = `${results[i].album} (${results[i].releasedate.substring(0, 4)})`;
        button.setAttribute("id", i);
        button.setAttribute("class", "albumresult");
        button.setAttribute("onclick", `LoadTracklist(${results[i].mbid})`);
        list.appendChild(button);
        button.appendChild(li);
    }
    for (i = 0; i < results.length; i++) {
        try {
            let img = await LoadAlbumCover(results[i].mbid, "small");
            let cover = document.createElement('img');
            cover.setAttribute("width", "250");
            cover.setAttribute("height", "250");
            cover.setAttribute("src", img);
            document.getElementById(i).appendChild(cover);
        } catch {
            console.log(`${results[i].album} has no album cover available`);
        }
    }
}

async function LoadTracklist(mbid) {
    try {
        let x = await fetch(`https://musicbrainz.org/ws/2/release/?release-group=${mbid}&status=official&inc=recordings&fmt=json`);
        let result = await x.json();
        console.log(result);
        
        for (let i = 0; i < result.releases.length; i++) {
            if (result.releases[i].media.length === 1) {
                var album = result.releases[i];
            }
        }
        if (!album) {
            console.log('If you see this error, it\'s a reminder to concatenate the tracklist from both media sections on releases that are split up by physicl copy (ie double vinyl record)');
        }
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
        case 'Album':
            AlbumButton.setAttribute("class", "btn btn-primary");
            ArtistButton.setAttribute("class", "btn btn-outline-primary");
            searchMode != 'Album' ? searchBox.value = '' : null;
            searchBox.setAttribute("placeholder", "Enter Album:");
            searchMode = 'Album';
            break;

        case 'Artist':
            AlbumButton.setAttribute("class", "btn btn-outline-primary");
            ArtistButton.setAttribute("class", "btn btn-primary");
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
    ClearList("artistresults");
    ClearList("discography");
}