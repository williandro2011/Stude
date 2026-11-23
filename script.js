
document.addEventListener("DOMContentLoaded", () => {
  // INTRO
  const intro = document.getElementById("intro");
  window.setTimeout(() => intro?.classList.add("finished"), 2500);
  window.setTimeout(() => intro?.remove(), 3300);

  // PLAYLIST — ordem confirmada
  const videos = [
    { name: "Leonardo", id: "rQE4OpJl0Go" },
    { name: "Kevem", id: "rLpt0BsUfDs" },
    { name: "Amábile", id: "mYWAReXELWE" },
    { name: "Nicoli", id: "WY2ssfrsTPc" },
    { name: "Yasmim", id: "qwYL0rI9uFA" },
    { name: "Letícia", id: "TmzRI0HyHTA" },
    { name: "Williandro", id: "DwWbW9sAIDs" }
  ];

  const $ = (id) => document.getElementById(id);
  const playlist = $("playlist");
  const currentTitle = $("currentTitle");
  const videoTitle = $("videoTitle");
  const playingStatus = $("playingStatus");
  const startOverlay = $("startOverlay");
  const startButton = $("startButton");
  const fullscreenBtn = $("fullscreenBtn");
  const fullscreenText = $("fullscreenText");
  const playerShell = $("playerShell");

  let currentIndex = 0;
  let player = null;
  let playerReady = false;
  let started = false;
  let startRequested = false;
  let consecutiveErrors = 0;
  let apiRequested = false;

  function setStatus(message) {
    if (playingStatus) playingStatus.textContent = message;
  }

  function renderPlaylist() {
    if (!playlist) return;
    playlist.replaceChildren();

    videos.forEach((video, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `playlist-item${index === currentIndex ? " active" : ""}`;
      button.setAttribute("aria-current", index === currentIndex ? "true" : "false");
      button.setAttribute("aria-label", `Selecionar entrevista de ${video.name}`);

      const number = document.createElement("span");
      number.className = "episode-number";
      number.textContent = String(index + 1).padStart(2, "0");

      const info = document.createElement("span");
      info.className = "episode-info";

      const name = document.createElement("strong");
      name.textContent = video.name;

      const detail = document.createElement("small");
      detail.textContent = "ENTREVISTA · 1ª SÉRIE A";

      info.append(name, detail);

      const state = document.createElement("span");
      state.className = "episode-state";
      state.textContent = index === currentIndex ? "▶" : "";

      button.append(number, info, state);
      button.addEventListener("click", () => selectVideo(index));
      playlist.appendChild(button);
    });
  }

  function updateInterface() {
    const name = videos[currentIndex].name;
    if (currentTitle) currentTitle.textContent = name;
    if (videoTitle) videoTitle.textContent = name;
    renderPlaylist();
  }

  function selectVideo(index) {
    if (!videos[index]) return;
    currentIndex = index;
    consecutiveErrors = 0;
    updateInterface();

    if (!playerReady || !player) return;

    if (started) {
      player.loadVideoById({ videoId: videos[currentIndex].id });
      setStatus("CARREGANDO...");
    } else {
      player.cueVideoById({ videoId: videos[currentIndex].id });
    }
  }

  function nextVideo() {
    if (!playerReady || !player || !started) return;
    currentIndex = (currentIndex + 1) % videos.length;
    updateInterface();
    setStatus("CARREGANDO PRÓXIMA ENTREVISTA...");
    player.loadVideoById({ videoId: videos[currentIndex].id });
  }

  function startPlayback() {
    if (!playerReady || !player) {
      startRequested = true;
      setStatus("CARREGANDO PLAYER...");
      return;
    }

    started = true;
    startRequested = false;
    startOverlay?.classList.add("hidden");
    setStatus("CARREGANDO...");
    player.loadVideoById({ videoId: videos[currentIndex].id });
  }

  function createPlayer() {
    if (player || !window.YT?.Player) return;

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
            player.cueVideoById({ videoId: videos[currentIndex].id });
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            consecutiveErrors = 0;
            setStatus("REPRODUZINDO");
            startOverlay?.classList.add("hidden");
          } else if (event.data === YT.PlayerState.PAUSED) {
            setStatus("PAUSADO");
          } else if (event.data === YT.PlayerState.BUFFERING) {
            setStatus("CARREGANDO...");
          } else if (event.data === YT.PlayerState.ENDED) {
            nextVideo();
          }
        },
        onError: (event) => {
          console.warn("Erro no player do YouTube:", event.data);
          setStatus("VÍDEO INDISPONÍVEL");
          if (!started) return;

          consecutiveErrors += 1;
          if (consecutiveErrors >= videos.length) {
            setStatus("NÃO FOI POSSÍVEL REPRODUZIR OS VÍDEOS");
            return;
          }

          window.setTimeout(nextVideo, 1000);
        }
      }
    });
  }

  function loadYouTubeAPI() {
    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    if (apiRequested) return;
    apiRequested = true;

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") previousCallback();
      createPlayer();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  }

  // BOTÃO DE INÍCIO
  if (startButton) {
    startButton.addEventListener("click", startPlayback);
  }

  // TELA CHEIA
  if (fullscreenBtn && playerShell) {
    fullscreenBtn.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement === playerShell) {
          await document.exitFullscreen();
        } else if (!document.fullscreenElement) {
          await playerShell.requestFullscreen();
        } else {
          await document.exitFullscreen();
          await playerShell.requestFullscreen();
        }
      } catch (error) {
        console.error("Não foi possível ativar a tela cheia:", error);
        setStatus("TELA CHEIA INDISPONÍVEL NESTE NAVEGADOR");
      }
    });

    document.addEventListener("fullscreenchange", () => {
      const isFullscreen = document.fullscreenElement === playerShell;
      if (fullscreenText) {
        fullscreenText.textContent = isFullscreen
          ? "Sair da tela cheia"
          : "Assistir em tela cheia";
      }
      fullscreenBtn.setAttribute(
        "aria-label",
        isFullscreen ? "Sair da tela cheia" : "Assistir vídeo em tela cheia"
      );
    });
  }

  // INICIALIZAÇÃO
  updateInterface();
  loadYouTubeAPI();
});
