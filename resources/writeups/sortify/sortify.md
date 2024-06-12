**A web-app to help sorting your Spotify library in ways that Spotify doesn't provide by default.**

*Sortify* is a hobby project combining my passion for music and programming. It was an opportunity for me to learn React, as I had primarily used Angular previously. Functionality that is completed is the connection to Spotify's Web API worked, receiving songs and playlist data, filtering songs that are in playlists but not *liked*, and displaying them in a list view that shows the playlists each song is in.

<div class="centered wide banner shadow">
  <img src="resources/writeups/sortify/example.png" alt="Banner">
</div>

<details>
  <summary>
    <h2>Cleanup</h2>
  </summary><br>

Often times you find yourself liking a song, and then adding it to several playlists over time as well. But some time later you might not enjoy the song as much, so you painstakingly have to go through every playlist and remove the song from it. Sortify's *Cleanup* functionality will find any song that is not in your "Liked Songs" but is still in other playlists, and will display all playlists it is a part of, allowing you to remove the song from these playlists individually with ease, or remove from all playlists with a single click.

</hr></details>

<details>
  <summary>
    <h2>Listen Later</h2>
  </summary><br>

The *Listen Later* feature lists all songs that are in your "Liked Songs" playlist that are not yet added to a playlist, so in a way the opposite of *Cleanup*. It will allow you to use liking a song as a quick way of adding it to your library, without having to commit to listening straight away or deciding what playlists it could go on, while keeping track of which songs you have not yet sorted into playlists.

Alternatively, users can opt into a separate "Listen Later" playlist, which will be created in their library, and which they can then add songs to. The *Listen Later* feature on the web-app will then display all the songs from the playlist, and allow a quick removal of all the songs that are on the "Listen Later" playlist that have since been added to other playlists as well, while keeping ones that have not yet been added to other playlists.

</hr></details>

<details>
  <summary>
    <h2>Snapshots</h2>
  </summary><br>

Snapshots are auto-generated playlists that include all liked songs from a particular time period. For example, a "2022 Snapshot" playlist would include all songs that were added to the "Liked Songs" playlist in 2022, while a "Summer 2019 Snapshot" playlist would include all songs that were liked during the summer of 2019.

</hr></details>

*Functionality is still WIP, the above descriptions are what the features aim to be.*