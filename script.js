let currSong = new Audio();
let songs;
let length;
let currFolder;

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currFolder}/`)[1]);
    }
  }
  length = songs.length;
  const libraryCon = document.getElementById("librarycon");
  let htmlContent = '';
  songs.forEach(song => {
    const element = song.replaceAll("%20", " ").replaceAll("%2C", ",").replaceAll("%26", "&").replace(".mp3", "");
    const parts = element.split("-");
    let name = parts[0];
    let artist = parts[1];
    htmlContent += `<div class="songList cursor-pointer w-[95%] m-1 auto left-3  rounded flex justify-between p-2 items-center flex-row border-2">
      <div class="flex flex-start">
        <div class="info hidden">
        ${song}</div>
        <img src="music.svg" alt="" id="music" class="music w-[20px]" />
        <div id="song" class="song flex pl-5 flex-col">
          <p id="songName" class="songname text-bold text-md ">${artist}</p>
          <p id="SongArtist" class="SongArtist text-bold text-md">${name}</p>
        </div>
      </div>
      <div class="flex flex-end">
        <p class="PlayNow hidden text-bold pr-2 sm:block md:hidden lg:hidden xl:block">Play Now</p>
        <img src="play.svg" class="invert w-[20px]" alt="" />
      </div>
    </div>`;
  });

  libraryCon.innerHTML = htmlContent;
  document.querySelectorAll(".songList").forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").innerHTML.trim());
    });
  });
}

let playMusic = (info) => {
  try {
    currSong.src = `/${currFolder}/` + info;
    currSong.play();
    let playbar = document.getElementById("playbar");
    if (playbar && playbar.classList.contains('hidden')) {
      playbar.classList.remove('hidden');
    }

    let play = document.getElementById("play");
    play.src = "pause.svg";
    const element = currSong.src.split('/').pop().replaceAll("%20", " ").replaceAll("%2C", ",").replaceAll("%26", "&").replaceAll("%2", ",").replace(".mp3", "");
    const parts = element.split("-");
    let name = parts[0];
    let artist = parts[1];
    let NAME = document.getElementById("NAME");
    NAME.innerHTML = artist;
    let ARTIST = document.getElementById("ARTIST");
    ARTIST.innerHTML = name;

    currSong.removeEventListener("timeupdate", updateTime);
    currSong.addEventListener("timeupdate", updateTime);

    currSong.removeEventListener("loadeddata", updateDuration);
    currSong.addEventListener("loadeddata", updateDuration);

    let volumeIcon = document.getElementById('volsign');
    let volumeSlider = document.getElementById('range');

    volumeIcon.removeEventListener("click", toggleMute);
    volumeIcon.addEventListener("click", toggleMute);

    play.removeEventListener("click", togglePlay);
    play.addEventListener("click", togglePlay);

    let previous = document.getElementById("prev");
    previous.removeEventListener("click", playPrevious);
    previous.addEventListener("click", playPrevious);

    let next = document.getElementById("next");
    next.removeEventListener("click", playNext);
    next.addEventListener("click", playNext);

    let volume = document.getElementById("range");
    volume.removeEventListener("change", changeVolume);
    volume.addEventListener("change", changeVolume);

    const circle = document.getElementById('circle');
    circle.removeEventListener('mousedown', seekMouseDown);
    circle.addEventListener('mousedown', seekMouseDown);

  } catch (e) {
    console.log(e);
  }
}

function updateTime() {
  let currentTime = currSong.currentTime;
  let currentMinutes = Math.floor(currentTime / 60);
  let currentSeconds = Math.floor(currentTime % 60);
  currentSeconds = currentSeconds < 10 ? `0${currentSeconds}` : currentSeconds;
  document.getElementById("current-time").textContent = `${currentMinutes}:${currentSeconds}`;
  let circle = document.getElementById("circle");
  const percentage = (currSong.currentTime / currSong.duration) * 100;
  circle.style.left = `${percentage}%`;
  if (percentage >= 100) {
    currSong.pause();
    document.getElementById("play").src = "play.svg";
  }
}

function updateDuration() {
  let duration = currSong.duration;
  let minutes = Math.floor(duration / 60);
  let seconds = Math.floor(duration % 60);
  document.getElementById("duration").innerHTML = minutes + ":" + seconds;
  document.getElementById("separator").innerHTML = "/";
}

function toggleMute() {
  let volumeIcon = document.getElementById('volsign');
  let volumeSlider = document.getElementById('range');
  if (volumeIcon.src.includes('volume.svg')) {
    volumeIcon.src = volumeIcon.src.replace('volume.svg', 'mute.svg');
    currSong.volume = 0;
    volumeSlider.value = 0;
  } else {
    volumeIcon.src = volumeIcon.src.replace('mute.svg', 'volume.svg');
    currSong.volume = 0.1;
    volumeSlider.value = 10;
  }
}

function togglePlay() {
  let play = document.getElementById("play");
  if (currSong.paused) {
    currSong.play();
    play.src = "pause.svg";
  } else {
    currSong.pause();
    play.src = "play.svg";
  }
}

function playPrevious() {
  let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
  if (index > 0) {
    playMusic(songs[index - 1]);
  }
}

function playNext() {
  let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
  if (index < length - 1) {
    playMusic(songs[index + 1]);
  }
}

function changeVolume(e) {
  currSong.volume = parseInt(e.target.value) / 100;
}

function seekMouseUp() {
  window.removeEventListener('mousemove', seek);
  window.removeEventListener('mouseup', seekMouseUp);
}

function seekMouseDown(event) {
  event.preventDefault();
  seek(event);
  window.addEventListener('mousemove', seek);
  window.addEventListener('mouseup', seekMouseUp);
}

function seek(event) {
  let seekbar = document.querySelector(".seekbar");
  let circle = document.querySelector(".circle");

  let updateSeek = (e) => {
    let rect = seekbar.getBoundingClientRect();
    let offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let percent = (offsetX / rect.width) * 100;
    circle.style.left = `${percent / 100}%`;
    currSong.currentTime = (currSong.duration * percent) / 100;
  };

  let onMouseMove = (e) => {
    requestAnimationFrame(() => updateSeek(e));
  };

  seekbar.addEventListener("click", (e) => {
    updateSeek(e);
  });

  circle.addEventListener('mousedown', (event) => {
    event.preventDefault();

    updateSeek(event);  // Update seek position immediately on mousedown

    window.addEventListener('mousemove', onMouseMove);

    window.addEventListener('mouseup', function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    });
  });
}



async function displayAlbums() {
  let ab = await fetch(`/songs/`);
  let response = await ab.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = (e.href.split("/").slice(-1)[0]);
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML += ` <div
        data-folder=${folder}
        class="card m-1 p-6 cursor-pointer relative w-[300px] group hover:bg-[#282828] rounded-[14px] md:w-[220px]"
      >
        <img
          class="Spotify-Play-Button w-[100px] absolute top-[180px] right-4 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out transform group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 scale-75 translate-y-2 md:w-[85px] md:top-[120px]"
          src="./src/cover/Spotify-Play-Button.png"
          alt=""
        />
        <img class="rounded-[14px]" src="./songs/${folder}/cover.jpg" alt="" />
        <h2 class="text-xl font-bold py-3">${response.title}</h2>
        <p class="text-sm">
          ${response.description}
        </p>
      </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async (item) => {
      await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function init() {
  await getSongs("songs/ncs");
  displayAlbums();

  let ham = document.getElementById("ham");
  ham.addEventListener('click', () => {
    let left = document.getElementById("left2");
    left.classList.add('left-[0]');
  });
  let cross = document.getElementById("cross");
  cross.addEventListener('click', () => {
    let left = document.getElementById("left2");
    left.classList.remove('left-[0]');
    left.classList.add('left-[-100%]');
  });
}

init();
