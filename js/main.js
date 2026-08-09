/* =========================================================
   ELEMENTS
   ========================================================= */
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

/* =========================================================
   SPLASH SCREEN
   ========================================================= */
const birthdaySplash = document.getElementById("birthdaySplash");

let momLoaded = false;
let catLoaded = false;

/*
 * Hide splash after the 3D models
 * have finished loading.
 */
function hideBirthdaySplash() {
    if (!momLoaded || !catLoaded) {
        return;
    }

    birthdaySplash.classList.add("is-hidden");

    setTimeout(() => {
        birthdaySplash.remove();
    }, 800);
}

/*
 * Mom model
 */
momModel?.addEventListener(
    "load",
    () => {
        momLoaded = true;
        hideBirthdaySplash();
    },
    { once: true }
);

/*
 * Cat model
 */
catModel?.addEventListener(
    "load",
    () => {
        catLoaded = true;
        hideBirthdaySplash();
    },
    { once: true }
);

/*
 * Safety fallback.
 *
 * If a model never fires "load"
 * (e.g. an error or slow network),
 * don't leave the user stuck forever.
 */
setTimeout(() => {
    if (!birthdaySplash.classList.contains("is-hidden")) {
        birthdaySplash.classList.add("is-hidden");
    }
}, 10000);

/* =========================================================
   CONFIGURATION
   ========================================================= */

// เพลงจะเริ่มจากวินาทีนี้เสมอ (15 seconds)
const MUSIC_START_TIME = 15;

/* =========================================================
   STATE
   ========================================================= */
let isCardOpen = false;
let isMusicSide = false;

/* =========================================================
   FORMAT TIME
   ========================================================= */
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

/* =========================================================
   SET MUSIC START POINT
   ========================================================= */

// ทุกครั้งที่เพลงถูก Reset จะกลับไปยัง 15 วินาที
function setMusicStartPoint() {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
}

/* =========================================================
   RESET MUSIC
   ========================================================= */
function resetMusic() {
    audio.pause();

    // Reset กลับไปที่ Start Point ไม่ใช่ 0:00
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

/* =========================================================
   OPEN CARD
   ========================================================= */

// Mail -> Front Card (เพลงยังไม่เล่น)
function openCard() {
    isCardOpen = true;
    isMusicSide = false;

    // Always return to Front
    postcard3D.classList.remove("flipped");
    
    // Stop music
    resetMusic();
    
    // Show card
    postcardOverlay.classList.add("active");
}

/* =========================================================
   CLOSE CARD
   ========================================================= */
function closeCard() {
    isCardOpen = false;
    isMusicSide = false;

    // Stop and reset music
    resetMusic();
    
    // Return to front
    postcard3D.classList.remove("flipped");
    
    // Hide overlay
    postcardOverlay.classList.remove("active");
}

/* =========================================================
   FRONT → MUSIC
   ========================================================= */

// Front -> Flip -> Music Side -> Start from 15 seconds -> Play
async function flipToMusic() {
    if (!isCardOpen || isMusicSide) return;

    isMusicSide = true;

    // Move card to music side
    postcard3D.classList.add("flipped");

    // Wait until the card has visually flipped.
    setTimeout(async () => {
        if (!isCardOpen || !isMusicSide) return;

        // Set start point
        if (Number.isFinite(audio.duration)) {
            audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
        }

        // Start playback
        try {
            await audio.play();
        } catch (error) {
            console.warn("Audio playback was blocked:", error);
        }

        updatePlayerUI();
    }, 450);
}

/* =========================================================
   MUSIC → FRONT
   ========================================================= */
function flipToFront() {
    if (!isMusicSide) return;

    isMusicSide = false;

    // Stop immediately
    audio.pause();
    
    // Return to front
    postcard3D.classList.remove("flipped");
    
    updatePlayerUI();
}

/* =========================================================
   PLAY / PAUSE
   ========================================================= */
async function togglePlay() {
    // Do not allow music before card is flipped.
    if (!isCardOpen || !isMusicSide) return;

    if (audio.paused) {
        // If the song has never started, begin from 15 seconds.
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

/* =========================================================
   UPDATE PLAYER UI
   ========================================================= */
function updatePlayerUI() {
    const isPlaying = !audio.paused;

    // Play / Pause icon
    playIcon.textContent = isPlaying ? "pause" : "play_arrow";
    playToggle.setAttribute("aria-label", isPlaying ? "Pause" : "Play");

    // Progress
    if (audio.duration && Number.isFinite(audio.duration)) {
        // Progress is based on the entire audio file.
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        progress.setAttribute("aria-valuenow", percent.toFixed(0));
    } else {
        progressFill.style.width = "0%";
    }

    // Current time & Total time
    timeCurrent.textContent = formatTime(audio.currentTime);
    timeTotal.textContent = formatTime(audio.duration);
}

/* =========================================================
   SEEK
   ========================================================= */
function seekFromPointer(clientX) {
    if (!isMusicSide || !audio.duration || !Number.isFinite(audio.duration)) return;

    const rect = progress.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    
    percent = Math.max(0, Math.min(1, percent));
    
    audio.currentTime = percent * audio.duration;
    
    updatePlayerUI();
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

// MAIL
openCardButton.addEventListener("click", openCard);

// FRONT → MUSIC
flipToMusicButton.addEventListener("click", (event) => {
    event.stopPropagation();
    flipToMusic();
});

// MUSIC → FRONT
flipToFrontButton.addEventListener("click", (event) => {
    event.stopPropagation();
    flipToFront();
});

// PLAY / PAUSE
playToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePlay();
});

// PROGRESS CLICK
progress.addEventListener("click", (event) => {
    event.stopPropagation();
    seekFromPointer(event.clientX);
});

// KEYBOARD SEEK
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

// RESTART (Restart ไม่กลับไป 0:00 แต่กลับไปที่ 15 seconds)
restartButton.addEventListener("click", async (event) => {
    event.stopPropagation();

    if (!isMusicSide) return;

    // Jump back to 15 seconds
    if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
    }

    // Continue playing
    if (audio.paused) {
        try {
            await audio.play();
        } catch (error) {
            console.warn("Unable to restart audio:", error);
        }
    }

    updatePlayerUI();
});

// MUTE
muteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    audio.muted = !audio.muted;
    volumeIcon.textContent = audio.muted ? "volume_off" : "volume_up";
});

/* =========================================================
   AUDIO EVENTS
   ========================================================= */
audio.addEventListener("loadedmetadata", () => {
    // Initially position the audio at 15 seconds.
    if (Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(MUSIC_START_TIME, audio.duration);
    }
    updatePlayerUI();
});

audio.addEventListener("timeupdate", updatePlayerUI);
audio.addEventListener("play", updatePlayerUI);
audio.addEventListener("pause", updatePlayerUI);
audio.addEventListener("ended", updatePlayerUI);

/* =========================================================
   GLOBAL EVENTS
   ========================================================= */

// CLICK OUTSIDE CARD
postcardOverlay.addEventListener("click", (event) => {
    if (event.target === postcardOverlay) {
        closeCard();
    }
});

// ESCAPE KEY
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isCardOpen) {
        closeCard();
    }
});

/* =========================================================
   INITIAL STATE
   ========================================================= */
resetMusic();