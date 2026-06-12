// Hero demo loop: hold hotkey -> waveform talks -> transcript types out.
// Plus IntersectionObserver-driven section reveals.

(function () {
  "use strict";

  // ---------- scroll reveals ----------
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("shown");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  document.querySelectorAll(".reveal-io").forEach(function (el) {
    io.observe(el);
  });

  // ---------- dictation demo ----------
  var transcript = document.getElementById("transcript");
  var pill = document.getElementById("pill");
  var keycaps = document.getElementById("keycaps");
  var keyhint = document.getElementById("keyhint");
  if (!transcript || !pill || !keycaps) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PHRASES = [
    "Send the proposal tonight and copy the design team.",
    "Запиши идею: онбординг сократить до одного экрана.",
    "Додай до списку: оновити лендінг до п'ятниці.",
    "TODO: refactor the audio pipeline before release.",
  ];

  if (reduceMotion) {
    transcript.textContent = PHRASES[0];
    pill.classList.add("recording");
    return;
  }

  var phraseIdx = 0;

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  async function typeOut(text) {
    for (var i = 1; i <= text.length; i++) {
      transcript.textContent = text.slice(0, i);
      // Bursty cadence: words appear quickly, brief pauses between them.
      await sleep(text[i - 1] === " " ? 70 : 18 + Math.random() * 30);
    }
  }

  async function erase() {
    var text = transcript.textContent;
    while (text.length) {
      text = text.slice(0, -6);
      transcript.textContent = text;
      await sleep(12);
    }
  }

  async function cycle() {
    for (;;) {
      // 1. "hold" the hotkey - keycaps press, pill starts listening
      keycaps.classList.add("pressed");
      pill.classList.add("recording");
      keyhint.textContent = "listening...";
      await sleep(2300);

      // 2. "release" - waveform stops, text lands almost instantly
      keycaps.classList.remove("pressed");
      pill.classList.remove("recording");
      keyhint.textContent = "hold to talk";
      await sleep(280);
      await typeOut(PHRASES[phraseIdx]);
      phraseIdx = (phraseIdx + 1) % PHRASES.length;

      // 3. linger, then clear for the next take
      await sleep(2600);
      await erase();
      await sleep(700);
    }
  }

  cycle();
})();
