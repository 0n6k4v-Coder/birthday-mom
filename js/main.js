const postcardOverlay = document.getElementById("postcardOverlay");
const postcard3D = document.getElementById("postcard3D");
const audio = document.getElementById("birthdaySong");
const openCardButton = document.getElementById("openCardButton");
const flipToMusicButton = document.getElementById("flipToMusic");
const flipToFrontButton = document.getElementById("flipToFront");
const playToggle = document.getElementById("playToggle");
const playIcon = document.getElementById("playIcon");
const progress = document.getElementById("playerProgress");
const progressFill = document.getElementById("progressFill");
const timeCurrent = document.getElementById("timeCurrent");
const timeTotal = document.getElementById("timeTotal");
const restartButton = document.getElementById("restartButton");
const muteButton = document.getElementById("muteButton");
const volumeIcon = document.getElementById("volumeIcon");
const momModel = document.getElementById("model");
const catModel = document.getElementById("cat-model");
const birthdaySplash = document.getElementById("birthdaySplash");

let momLoaded = false;
let catLoaded = false;

function mark(name) {
    try { performance.mark(name); } catch (_) {}
}
mark("splash-visible");

function hideBirthdaySplash() {
    if (!momLoaded || !catLoaded) {
        return;
    }

    mark("splash-hidden");
    birthdaySplash.classList.add("is-hidden");

    setTimeout(() => {
        birthdaySplash.remove();
    }, 800);
}

function onModelLoaded(modelName) {
    mark(`${modelName}-model-loaded`);
    switch (modelName) {
        case "mom":
            momLoaded = true;
            break;
        case "cat":
            catLoaded = true;
            break;
    }
    hideBirthdaySplash();
}

function onModelError(modelName, event) {
    // Unblock splash if a 3D model fails to load
    mark(`${modelName}-model-error`);
    // eslint-disable-next-line no-console
    console.error(`${modelName} model failed to load:`, event && event.detail ? event.detail : event);
    switch (modelName) {
        case "mom":
            momLoaded = true;
            break;
        case "cat":
            catLoaded = true;
            break;
    }
    hideBirthdaySplash();
}

momModel?.addEventListener("load", () => onModelLoaded("mom"), { once: true });
momModel?.addEventListener("error", (event) => onModelError("mom", event), { once: true });

catModel?.addEventListener("load", () => onModelLoaded("cat"), { once: true });
catModel?.addEventListener("error", (event) => onModelError("cat", event), { once: true });

// Fallback: automatically hide splash after 10s if model events never fire
setTimeout(() => {
    if (!birthdaySplash.classList.contains("is-hidden")) {
        momLoaded = true;
        catLoaded = true;
        birthdaySplash.classList.add("is-hidden");
    }
}, 10000);

// Default audio start offset in seconds
const MUSIC_START_TIME = 15;

let isCardOpen = false;
let isMusicSide = false;

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function setMusicStartPoint() {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
}

function resetMusic() {
    audio.pause();

    // Reset playback position to start point (15s offset if available)
    if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
    } else {
        audio.currentTime = 0;
    }

    playIcon.textContent = "play_arrow";
    playToggle.setAttribute("aria-label", "Play");
    
    progressFill.style.width = "0%";
    progress.setAttribute("aria-valuenow", "0");
    
    timeCurrent.textContent = formatTime(
        Number.isFinite(audio.duration) ? Math.min(MUSIC_START_TIME, audio.duration) : 0
    );

    if (Number.isFinite(audio.duration)) {
        timeTotal.textContent = formatTime(audio.duration);
    } else {
        timeTotal.textContent = "0:00";
    }
}

function openCard() {
    isCardOpen = true;
    isMusicSide = false;

    postcard3D.classList.remove("flipped");
    resetMusic();
    postcardOverlay.classList.add("active");
}

function closeCard() {
    isCardOpen = false;
    isMusicSide = false;

    resetMusic();
    postcard3D.classList.remove("flipped");
    postcardOverlay.classList.remove("active");
}

async function flipToMusic() {
    if (!isCardOpen || isMusicSide) return;

    isMusicSide = true;
    postcard3D.classList.add("flipped");

    // Start audio playback after card flip animation completes (~450ms)
    setTimeout(async () => {
        if (!isCardOpen || !isMusicSide) return;

        if (Number.isFinite(audio.duration)) {
            audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
        }

        try {
            await audio.play();
        } catch (error) {
            console.warn("Audio playback was blocked:", error);
        }

        updatePlayerUI();
    }, 450);
}

function flipToFront() {
    if (!isMusicSide) return;

    isMusicSide = false;
    audio.pause();
    postcard3D.classList.remove("flipped");
    updatePlayerUI();
}

async function togglePlay() {
    if (!isCardOpen || !isMusicSide) return;

    if (audio.paused) {
        if (audio.currentTime === 0) {
            audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
        }

        try {
            await audio.play();
        } catch (error) {
            console.warn("Unable to play audio:", error);
        }
    } else {
        audio.pause();
    }

    updatePlayerUI();
}

function updatePlayerUI() {
    const isPlaying = !audio.paused;

    playIcon.textContent = isPlaying ? "pause" : "play_arrow";
    playToggle.setAttribute("aria-label", isPlaying ? "Pause" : "Play");

    if (audio.duration && Number.isFinite(audio.duration)) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        progress.setAttribute("aria-valuenow", percent.toFixed(0));
    } else {
        progressFill.style.width = "0%";
    }

    timeCurrent.textContent = formatTime(audio.currentTime);
    timeTotal.textContent = formatTime(audio.duration);
}

function seekFromPointer(clientX) {
    if (!isMusicSide || !audio.duration || !Number.isFinite(audio.duration)) return;

    const rect = progress.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    
    percent = Math.max(0, Math.min(1, percent));
    
    audio.currentTime = percent * audio.duration;
    
    updatePlayerUI();
}

openCardButton.addEventListener("click", openCard);

flipToMusicButton.addEventListener("click", (event) => {
    event.stopPropagation();
    flipToMusic();
});

flipToFrontButton.addEventListener("click", (event) => {
    event.stopPropagation();
    flipToFront();
});

playToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePlay();
});

progress.addEventListener("click", (event) => {
    event.stopPropagation();
    seekFromPointer(event.clientX);
});

progress.addEventListener("keydown", (event) => {
    if (!isMusicSide || !audio.duration) return;

    if (event.key === "ArrowRight") {
        event.preventDefault();
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 5);
    }

    updatePlayerUI();
});

restartButton.addEventListener("click", async (event) => {
    event.stopPropagation();

    if (!isMusicSide) return;

    if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
    }

    if (audio.paused) {
        try {
            await audio.play();
        } catch (error) {
            console.warn("Unable to restart audio:", error);
        }
    }

    updatePlayerUI();
});

muteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    audio.muted = !audio.muted;
    volumeIcon.textContent = audio.muted ? "volume_off" : "volume_up";
});

audio.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
    }
    updatePlayerUI();
});

audio.addEventListener("timeupdate", updatePlayerUI);
audio.addEventListener("play", updatePlayerUI);
audio.addEventListener("pause", updatePlayerUI);
audio.addEventListener("ended", updatePlayerUI);

postcardOverlay.addEventListener("click", (event) => {
    if (event.target === postcardOverlay) {
        closeCard();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isCardOpen) {
        closeCard();
    }
});

resetMusic();