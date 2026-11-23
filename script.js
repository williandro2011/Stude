
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // ABERTURA
  // ==========================================

  const intro = document.getElementById("intro");

  window.setTimeout(() => {
    intro?.remove();
  }, 3400);


  // ==========================================
  // VÍDEOS
  // ==========================================

  const videos = [
    { name: "Leonardo", id: "rQE4OpJl0Go" },
    { name: "Kevem", id: "rLpt0BsUfDs" },
    { name: "Amábile", id: "mYWAReXELWE" },
    { name: "Nicoli", id: "WY2ssfrsTPc" },
    { name: "Yasmim", id: "qwYL0rI9uFA" },
    { name: "Letícia", id: "TmzRI0HyHTA" },
    { name: "Williandro", id: "DwWbW9sAIDs" }
  ];


  // ==========================================
  // ELEMENTOS
  // ==========================================

  const playlist = document.getElementById("playlist");
  const currentTitle = document.getElementById("currentTitle");
  const videoTitle = document.getElementById("videoTitle");
  const playingStatus = document.getElementById("playingStatus");

  const startOverlay = document.getElementById("startOverlay");
  const startButton = document.getElementById("startButton");

  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const fullscreenIcon = document.getElementById("fullscreenIcon");
  const fullscreenText = document.getElementById("fullscreenText");
  const playerShell = document.getElementById("playerShell");

  const playlistCount = document.getElementById("playlistCount");


  // ==========================================
  // ESTADO
  // ==========================================

  let currentIndex = 0;
  let player = null;

  let playerReady = false;
  let started = false;
  let startRequested = false;
  let consecutiveErrors = 0;


  // ==========================================
  // LISTA LATERAL
  // ==========================================

  function renderPlaylist() {
    if (!playlist) return;

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


  // ==========================================
  // ATUALIZA INTERFACE
  // ==========================================

  function updateInterface() {

    const video = videos[currentIndex];

    if (!video) return;

    if (currentTitle) {
      currentTitle.textContent = video.name;
    }

    if (videoTitle) {
      videoTitle.textContent = video.name;
    }

    if (playlistCount) {
      playlistCount.textContent =
        String(videos.length).padStart(2, "0");
    }

    renderPlaylist();
  }


  // ==========================================
  // SELEÇÃO MANUAL
  // ==========================================

  function selectVideo(index) {

    if (!videos[index]) return;

    currentIndex = index;

    updateInterface();

    if (playerReady) {

      if (started) {

        player.loadVideoById({
          videoId: videos[currentIndex].id
        });

      } else {

        player.cueVideoById({
          videoId: videos[currentIndex].id
        });

      }
    }
  }


  // ==========================================
  // PRÓXIMO VÍDEO AUTOMATICAMENTE
  // ==========================================

  function nextVideo() {

    if (!playerReady || !started) return;

    currentIndex = (currentIndex + 1) % videos.length;

    updateInterface();

    player.loadVideoById({
      videoId: videos[currentIndex].id
    });
  }


  // ==========================================
  // API DO YOUTUBE
  // ==========================================

  function loadYouTubeAPI() {

    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    window.onYouTubeIframeAPIReady = createPlayer;

    if (
      document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      )
    ) {
      return;
    }

    const tag = document.createElement("script");

    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;

    document.head.appendChild(tag);
  }


  // ==========================================
  // CRIA PLAYER ÚNICO
  // ==========================================

  function createPlayer() {

    if (player || !window.YT) return;

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

          if (startRequested) {
            startPlayback();
          } else {
            player.cueVideoById({
              videoId: videos[currentIndex].id
            });
          }
        },


        onStateChange: (event) => {

          // REPRODUZINDO
          if (event.data === YT.PlayerState.PLAYING) {

            consecutiveErrors = 0;

            if (playingStatus) {
              playingStatus.textContent = "REPRODUZINDO";
            }

            startOverlay?.classList.add("hidden");
          }


          // PAUSADO
          if (event.data === YT.PlayerState.PAUSED) {

            if (playingStatus) {
              playingStatus.textContent = "PAUSADO";
            }
          }


          // FINALIZADO
          if (event.data === YT.PlayerState.ENDED) {
            nextVideo();
          }

        },


        onError: (event) => {

          console.warn(
            "Erro no player do YouTube:",
            event.data
          );

          if (playingStatus) {
            playingStatus.textContent = "VÍDEO INDISPONÍVEL";
          }

          if (!started) return;

          consecutiveErrors++;

          if (consecutiveErrors >= videos.length) {

            if (playingStatus) {
              playingStatus.textContent =
                "NENHUM VÍDEO DISPONÍVEL";
            }

            return;
          }

          window.setTimeout(() => {
            nextVideo();
          }, 1200);
        }

      }

    });

  }


  // ==========================================
  // INÍCIO DA REPRODUÇÃO
  // ==========================================

  function startPlayback() {

    if (!playerReady || !player) return;

    started = true;
    startRequested = false;

    startOverlay?.classList.add("hidden");

    if (playingStatus) {
      playingStatus.textContent = "CARREGANDO...";
    }

    player.loadVideoById({
      videoId: videos[currentIndex].id
    });
  }


  if (startButton) {

    startButton.addEventListener("click", () => {

      started = true;

      if (!playerReady) {

        startRequested = true;

        if (playingStatus) {
          playingStatus.textContent = "CARREGANDO PLAYER...";
        }

        return;
      }

      startPlayback();

    });

  }


  // ==========================================
  // TELA CHEIA
  // ==========================================

  if (fullscreenBtn && playerShell) {

    fullscreenBtn.addEventListener("click", async () => {

      try {

        if (!document.fullscreenElement) {

          await playerShell.requestFullscreen();

        } else {

          await document.exitFullscreen();

        }

      } catch (error) {

        console.error(
          "Não foi possível ativar a tela cheia:",
          error
        );

      }

    });


    document.addEventListener("fullscreenchange", () => {

      const isFullscreen =
        Boolean(document.fullscreenElement);

      if (fullscreenIcon) {
        fullscreenIcon.textContent = "⛶";
      }

      if (fullscreenText) {

        fullscreenText.textContent = isFullscreen
          ? "Sair da tela cheia"
          : "Tela cheia";

      }

      fullscreenBtn.setAttribute(
        "aria-label",
        isFullscreen
          ? "Sair da tela cheia"
          : "Abrir em tela cheia"
      );

    });

  }


  // ==========================================
  // INICIALIZAÇÃO
  // ==========================================

  updateInterface();

  loadYouTubeAPI();

});
