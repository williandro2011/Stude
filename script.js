
document.addEventListener("DOMContentLoaded", () => {

  // ABERTURA
  const intro = document.getElementById("intro");

  window.setTimeout(() => {
    intro?.remove();
  }, 3400);

  // VÍDEOS
  const videos = [
    {
      name: "Leonardo",
      id: "rQE4OpJl0Go"
    },
    {
      name: "Kevem",
      id: "rLpt0BsUfDs"
    },
    {
      name: "Amábile",
      id: "mYWAReXELWE"
    },
    {
      name: "Nicoli",
      id: "WY2ssfrsTPc"
    },
    {
      name: "Yasmim",
      id: "qwYL0rI9uFA"
    },
    {
      name: "Letícia",
      id: "TmzRI0HyHTA"
    },
    {
      name: "Williandro",
      id: "DwWbW9sAIDs"
    }
  ];

  const playlist = document.getElementById("playlist");
  const currentTitle = document.getElementById("currentTitle");
  const videoTitle = document.getElementById("videoTitle");
  const playingStatus = document.getElementById("playingStatus");
  const startOverlay = document.getElementById("startOverlay");
  const startButton = document.getElementById("startButton");

  let currentIndex = 0;
  let player = null;
  let playerReady = false;
  let started = false;

  // LISTA LATERAL
  function renderPlaylist() {
    playlist.innerHTML = "";

    videos.forEach((video, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className =
        "playlist-item" +
        (index === currentIndex ? " active" : "");

      button.setAttribute(
        "aria-label",
        `Reproduzir entrevista de ${video.name}`
      );

      button.innerHTML = `
        <span class="episode-number">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <span class="episode-info">
          <strong>${video.name}</strong>
          <small>ENTREVISTA · 1ª SÉRIE A</small>
        </span>

        <span class="episode-state">
          ${index === currentIndex ? "▶" : ""}
        </span>
      `;

      button.addEventListener("click", () => {
        selectVideo(index);
      });

      playlist.appendChild(button);
    });
  }

  // ATUALIZA IDENTIFICAÇÃO
  function updateInterface() {
    const name = videos[currentIndex].name;

    currentTitle.textContent = name;
    videoTitle.textContent = name;

    renderPlaylist();
  }

  // SELEÇÃO MANUAL
  function selectVideo(index) {
    if (!videos[index]) return;

    currentIndex = index;
    updateInterface();

    if (playerReady && started) {
      player.loadVideoById({
        videoId: videos[currentIndex].id
      });
    }
  }

  // PRÓXIMO VÍDEO
  function nextVideo() {
    currentIndex = (currentIndex + 1) % videos.length;

    updateInterface();

    player.loadVideoById({
      videoId: videos[currentIndex].id
    });
  }

  // API DO YOUTUBE
  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    window.onYouTubeIframeAPIReady = createPlayer;

    const tag = document.createElement("script");

    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;

    document.head.appendChild(tag);
  }

  // CRIA PLAYER ÚNICO
  function createPlayer() {
    if (player) return;

    player = new YT.Player("videoPlayer", {
      width: "100%",
      height: "100%",

      videoId: videos[currentIndex].id,

      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        playsinline: 1,
        cc_load_policy: 0,
        iv_load_policy: 3
      },

      events: {
        onReady: () => {
          playerReady = true;
        },

        onStateChange: (event) => {

          // REPRODUZINDO
          if (event.data === YT.PlayerState.PLAYING) {
            playingStatus.textContent = "REPRODUZINDO";
            startOverlay.classList.add("hidden");
          }

          // PAUSADO
          if (event.data === YT.PlayerState.PAUSED) {
            playingStatus.textContent = "PAUSADO";
          }

          // FINALIZADO: PRÓXIMO AUTOMATICAMENTE
          if (event.data === YT.PlayerState.ENDED) {
            nextVideo();
          }
        },

        onError: (event) => {
          playingStatus.textContent = "VÍDEO INDISPONÍVEL";
          console.warn("Erro no player do YouTube:", event.data);
        }
      }
    });
  }

  // INÍCIO MANUAL
  startButton.addEventListener("click", () => {
    if (!playerReady) {
      playingStatus.textContent = "CARREGANDO PLAYER...";
      return;
    }

    started = true;
    startOverlay.classList.add("hidden");

    player.playVideo();
  });

  // ESTADO INICIAL
  updateInterface();

  // INICIALIZA YOUTUBE
  loadYouTubeAPI();

});
