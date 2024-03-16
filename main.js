async function search() {
    document.getElementById("albumtracklist").innerHTML = "";
    var mbid = document.getElementById("MBIDInput").value;
    //var tracklist = getAlbum(mbid);
    var tracklist = await getAlbum(mbid);
    arrayToList(tracklist, "albumtracklist");
}

async function getAlbum(mbid) {
    try {
        let x = await fetch(`https://musicbrainz.org/ws/2/release/${mbid}?inc=recordings&fmt=json`);
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

function arrayToList(array, listId) {
    let list = document.getElementById(listId);
        for (i = 0; i < array.length; ++i) {
            let li = document.createElement('li');
            li.innerText = array[i];
            li.setAttribute("draggable", "true");
            li.setAttribute("id", "albumtrack");
            list.appendChild(li);
        }
}