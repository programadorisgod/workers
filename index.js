import { Gallery } from "./image-list.js";

const status = document.querySelector("#status");
status.textContent = navigator.onLine ? "Online" : "Offline";

const webWorker = new Worker('web-worker.js', {
  name: 'heavy-task',
  type: 'module',
  credentials: 'omit'
})

const result = document.querySelector("#result");

webWorker.onmessage = (event) => {
  if (event.data.type === "message, i == 99999") {
    result.textContent = JSON.stringify(event.data);
    console.log("Called back by the worker!\n", event.data);
  } else if (event.data.type === "message, i == 999999") {
    result.textContent += JSON.stringify(event.data);
    console.log("Called back by the worker!\n", event.data);
  }
}

webWorker.onerror = (event) => {
  console.error("Worker error:", event);
}
const startButton = document.querySelector("#start-heavy-task");

startButton.addEventListener("click", startHeavyTask);
function startHeavyTask() {
  webWorker.postMessage("");
}


const registerServiceWorker =  async() => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        type: "module",
      })

      if (registration.installing) {
        console.log("Service worker installing...")
      }

      if (registration.waiting) {
        console.log("Service worker installed and waiting...")
      }

      if (registration.active) {
        console.log("Service worker active!")
      }

    } catch (error) {
      console.error("Failed to register service worker:", error);
    }
  }
}




async function getImageBlob(url) {
  const imageResponse = await fetch(url);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
  }
 return await imageResponse.blob();
}


// create gallery with service worker
async function createGallery(galleryImage) {
  const gallery = document.getElementById("gallery");

  const imageBlob = await getImageBlob(galleryImage.url);

  const image = document.createElement("img")
  const article = document.createElement("article")

  image.src = window.URL.createObjectURL(imageBlob)
  image.setAttribute("alt", galleryImage.alt)

  article.appendChild(image)
  gallery.appendChild(article);
}

registerServiceWorker();
Gallery.images.forEach(createGallery);

// ==========================================
// Integración con Printer Agent (PoC)
// ==========================================
const agentUrlInput = document.querySelector("#agent-url");
const transportSelect = document.querySelector("#transport-select");
const paperModeSelect = document.querySelector("#paper-mode-select");
const btnPrintReceipt = document.querySelector("#btn-print-receipt");
const btnTestPrinter = document.querySelector("#btn-test-printer");
const printerStatus = document.querySelector("#printer-status");
const lanIpHint = document.querySelector("#lan-ip-hint");

// Recordar la última URL usada en localStorage
if (agentUrlInput) {
  const savedUrl = localStorage.getItem("printer_agent_url");
  if (savedUrl) {
    agentUrlInput.value = savedUrl;
  }
  agentUrlInput.addEventListener("change", () => {
    localStorage.setItem("printer_agent_url", agentUrlInput.value.trim());
  });
}

// Recordar el último modo de papel seleccionado
if (paperModeSelect) {
  const savedMode = localStorage.getItem("printer_paper_mode");
  if (savedMode) {
    paperModeSelect.value = savedMode;
  }
  paperModeSelect.addEventListener("change", () => {
    localStorage.setItem("printer_paper_mode", paperModeSelect.value);
  });
}

if (lanIpHint && agentUrlInput) {
  lanIpHint.addEventListener("click", () => {
    agentUrlInput.value = lanIpHint.textContent.trim();
    localStorage.setItem("printer_agent_url", agentUrlInput.value.trim());
    showPrinterStatus("ℹ️ IP de red local aplicada", "#1976d2");
  });
}

function showPrinterStatus(msg, color = "#333") {
  if (printerStatus) {
    printerStatus.innerHTML = `<span style="color: ${color}; font-weight: 500;">${msg}</span>`;
  }
}

async function sendPrintRequest(endpoint, bodyData) {
  const baseUrl = (agentUrlInput ? agentUrlInput.value.trim() : "http://localhost:3333").replace(/\/+$/, "");
  const fullUrl = `${baseUrl}${endpoint}`;

  showPrinterStatus("⏳ Conectando con Printer Agent...", "#f57c00");

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    const data = await response.json();
    if (response.ok && data.status === "success") {
      const transportUsed = data.result?.transport || "impresora";
      const warning = data.result?.warning ? ` (${data.result.warning})` : "";
      showPrinterStatus(`✅ ¡Impreso exitosamente vía [${transportUsed}]!${warning}`, "#2e7d32");
    } else {
      showPrinterStatus(`❌ Error del agente: ${data.message || "Fallo desconocido"}`, "#d32f2f");
    }
  } catch (err) {
    console.error("Error conectando con el Printer Agent:", err);
    showPrinterStatus(`❌ No se pudo conectar al Printer Agent en ${baseUrl}. ¿Está corriendo server.js?`, "#d32f2f");
  }
}

if (btnPrintReceipt) {
  btnPrintReceipt.addEventListener("click", () => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const randomTicket = Math.floor(1000 + Math.random() * 9000);

    const ticketData = {
      store_name: "TIENDA EXPRESS",
      address: "Calle 123 #45-67",
      phone: "(+57) 300 123 4567",
      invoice_no: `TICKET #${randomTicket}`,
      date: formattedDate,
      items: [
        { qty: 2, name: "Café Colombiano", price: "$3.000", total: "$6.000" },
        { qty: 1, name: "Pastel de Pollo", price: "$4.500", total: "$4.500" },
        { qty: 1, name: "Agua Mineral", price: "$2.500", total: "$2.500" }
      ],
      subtotal: "$13.000",
      tax: "$0",
      total: "$13.000",
      footer: "¡Gracias por su compra!\n*** Mini Factura PWA ***\nGoojprt PT-210"
    };

    const transport = transportSelect ? transportSelect.value : "auto";
    const mode = paperModeSelect ? paperModeSelect.value : "label";
    sendPrintRequest("/print", { transport, mode, ticket: ticketData });
  });
}

if (btnTestPrinter) {
  btnTestPrinter.addEventListener("click", () => {
    const transport = transportSelect ? transportSelect.value : "auto";
    const mode = paperModeSelect ? paperModeSelect.value : "label";
    sendPrintRequest("/test", { transport, mode });
  });
}


