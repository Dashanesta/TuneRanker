async function getAlbum(mbid) {
    try {
        let x = await fetch(`https://musicbrainz.org/ws/2/release/${mbid}?inc=recordings&fmt=json`);
        let album = await x.json();
        let tracks = album.media[0].tracks;
        let tracklist = [];
        for(let i = 0; i < tracks.length; i++) {
            let obj = tracks[i];
            tracklist += obj.title + '\n';
        }

        console.log(tracklist);
    } catch {
        console.log('Invalid MBID');
        return;
    }
}

function load() {
    const mbid = document.getElementById("MBIDInput").value;
    getAlbum(mbid);
}