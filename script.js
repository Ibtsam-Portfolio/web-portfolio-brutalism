const pitches = [
  ["sharp", "interfaces"],
  ["calm", "web apps"],
  ["useful", "AI tools"],
  ["fast", "launches"],
  ["memorable", "systems"],
  ["clean", "dashboards"]
];

const pitchA = document.querySelector("[data-pitch-a]");
const pitchB = document.querySelector("[data-pitch-b]");
const shuffle = document.querySelector("[data-shuffle]");
let pitchIndex = 0;

shuffle?.addEventListener("click", () => {
  pitchIndex = (pitchIndex + 1) % pitches.length;
  const [first, second] = pitches[pitchIndex];
  pitchA.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], {
    duration: 180,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  });
  pitchB.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], {
    duration: 180,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  });
  pitchA.textContent = first;
  pitchB.textContent = second;
});

document.querySelectorAll("[data-expandable] button").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-expandable]");
    const isOpen = card.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.querySelector(".toggle-symbol").textContent = isOpen ? "−" : "+";
  });
});

document.querySelectorAll("[data-accordion] .work-row button").forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest(".work-row");
    const isOpen = row.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.querySelector("b").textContent = isOpen ? "−" : "+";
  });
});

document.querySelector("[data-chaos]")?.addEventListener("click", () => {
  document.body.classList.toggle("is-chaos");
});

document.querySelectorAll(".sticker").forEach((sticker) => {
  let offsetX = 0;
  let offsetY = 0;

  sticker.addEventListener("pointerdown", (event) => {
    const board = sticker.closest("[data-drag-board]");
    const stickerRect = sticker.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    offsetX = event.clientX - stickerRect.left;
    offsetY = event.clientY - stickerRect.top;
    sticker.classList.add("is-dragging");
    sticker.setPointerCapture(event.pointerId);

    const moveSticker = (moveEvent) => {
      const maxX = boardRect.width - sticker.offsetWidth - 8;
      const maxY = boardRect.height - sticker.offsetHeight - 8;
      const nextX = Math.min(Math.max(moveEvent.clientX - boardRect.left - offsetX, 8), maxX);
      const nextY = Math.min(Math.max(moveEvent.clientY - boardRect.top - offsetY, 8), maxY);
      sticker.style.left = `${nextX}px`;
      sticker.style.top = `${nextY}px`;
    };

    const stopDrag = () => {
      sticker.classList.remove("is-dragging");
      sticker.removeEventListener("pointermove", moveSticker);
      sticker.removeEventListener("pointerup", stopDrag);
      sticker.removeEventListener("pointercancel", stopDrag);
    };

    sticker.addEventListener("pointermove", moveSticker);
    sticker.addEventListener("pointerup", stopDrag);
    sticker.addEventListener("pointercancel", stopDrag);
  });
});

document.querySelector("[data-roast-form]")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector("input");
  const button = form.querySelector("button[type='submit']");
  const output = document.querySelector("[data-roast-output]");
  const value = input.value.trim();

  if (!value) {
    output.textContent = "Paste a URL first. Empty targets are too easy.";
    output.classList.remove("is-loading");
    input.focus();
    return;
  }

  const scanLines = [
    "Resolving domain...",
    "Fetching HTML...",
    "Reading headline and meta tags...",
    "Counting scripts and page weight...",
    "Checking mobile and SEO signals...",
    "Writing the roast..."
  ];

  output.classList.add("is-loading");
  button.disabled = true;
  input.disabled = true;

  for (const [index, line] of scanLines.entries()) {
    output.textContent = `> ${line}`;
    await new Promise((resolve) => window.setTimeout(resolve, 260 + index * 120));
  }

  try {
    const response = await fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: value })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Could not roast that site.");
    }

    output.textContent = payload.roast;
    output.classList.remove("is-loading");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not roast that site.";
    output.textContent = message.startsWith("Failed to fetch")
      ? "Roast API unavailable. Deploy on Vercel or run `vercel dev` to test locally."
      : message;
    output.classList.remove("is-loading");
  } finally {
    button.disabled = false;
    input.disabled = false;
  }
});
