// DOM elements
const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorCode = document.getElementById("colorCode");
const langToggle = document.getElementById("langToggle");
const title = document.getElementById("title");
const colorLabel = document.getElementById("colorLabel");
const historyLabel = document.getElementById("historyLabel");
const founder = document.getElementById("founder");
const colorHistoryContainer = document.getElementById("colorHistory");

// State
let imageLoaded = false;
let lang = "en";            // mặc định English
let colorHistory = [];      // lưu tối đa 5 màu gần nhất

// Khởi tạo UI ngay khi load
title.textContent        = " Pick color from image";
colorLabel.textContent   = "Color code:";
historyLabel.textContent = "Recent colors:";
langToggle.textContent   = "VI";
founder.textContent      = "Founder: aduanhvi";

// Xử lý upload ảnh
upload.addEventListener("change", () => {
  const file = upload.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      imageLoaded = true;
      canvas.style.cursor = "crosshair";
    };
    img.onerror = () => {
      showToast(lang === "vi" ? "Không thể tải ảnh!" : "Failed to load image!");
      imageLoaded = false;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Xử lý click chọn màu trên canvas
canvas.addEventListener("click", e => {
  if (!imageLoaded) {
    showToast(lang === "vi" ? "Chưa có ảnh để lấy màu!" : "Image not loaded yet!");
    return;
  }
  try {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    colorCode.textContent = hex;
    navigator.clipboard.writeText(hex)
      .then(() => showToast((lang==="vi"?"Đã copy mã: ":"Copied color: ")+hex))
      .catch(() => showToast(lang==="vi"?"Không thể copy!":"Copy failed!"));
    addToHistory(hex);
  } catch {
    showToast(lang==="vi"?"Không thể đọc màu từ ảnh này!":"Cannot read color from this image!");
  }
});

// RGB → HEX
function rgbToHex(r,g,b){
  return "#" + [r,g,b].map(x => x.toString(16).padStart(2,"0")).join("");
}

// Toggle ngôn ngữ
langToggle.addEventListener("click", () => {
  if (lang === "en") {
    lang = "vi";
    title.textContent        = " Chọn màu từ ảnh";
    colorLabel.textContent   = "Mã màu:";
    historyLabel.textContent = "Bảng màu gần đây:";
    langToggle.textContent   = "EN";
    founder.textContent      = "Nhà sáng lập: aduanhvi";
  } else {
    lang = "en";
    title.textContent        = " Pick color from image";
    colorLabel.textContent   = "Color code:";
    historyLabel.textContent = "Recent colors:";
    langToggle.textContent   = "VI";
    founder.textContent      = "Founder: aduanhvi";
  }
});

// --- Color History: lưu 5 màu gần nhất ---
function addToHistory(hex) {
  if (colorHistory[0] === hex) return;
  colorHistory.unshift(hex);
  if (colorHistory.length > 5) colorHistory.pop();
  renderHistory();
}

function renderHistory() {
  colorHistoryContainer.innerHTML = "";
  colorHistory.forEach(color => {
    const box = document.createElement("div");
    box.className = "color-box";
    box.style.backgroundColor = color;
    box.title = color;
    box.onclick = () => {
      navigator.clipboard.writeText(color);
      colorCode.textContent = color;
      showToast((lang==="vi"?"Đã copy mã: ":"Copied color: ")+color);
    };
    colorHistoryContainer.appendChild(box);
  });
}

// Toast notification thay thế alert()
function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.8)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
    zIndex: 1000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    fontSize: "16px",
    opacity: "1",
    transition: "opacity 0.3s ease"
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
}