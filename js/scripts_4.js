// ============== TOAST NOTIFY SYSTEM (mismo que en el HTML, modular) ==============
class ToastManager {
  constructor() {
    this.container = document.getElementById("toastContainer");
    this.toasts = [];
  }
  show(message, title = "Notificación", type = "info", duration = 4000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const toastId = Date.now() + Math.random();
    toast.dataset.toastId = toastId;
    toast.innerHTML = `
              <div class="toast-header">
                  ${title}
                  <button class="toast-close">&times;</button>
              </div>
              <div class="toast-body">${message}</div>
              <div class="toast-progress"></div>
          `;
    this.container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    toast
      .querySelector(".toast-close")
      .addEventListener("click", () => this.remove(toastId));
    if (duration > 0) {
      const progressBar = toast.querySelector(".toast-progress");
      progressBar.style.width = "100%";
      progressBar.style.transitionDuration = duration + "ms";
      requestAnimationFrame(() => {
        progressBar.style.width = "0%";
      });
      setTimeout(() => this.remove(toastId), duration);
    }
    this.toasts.push({ id: toastId, element: toast });
    return toastId;
  }
  remove(toastId) {
    const toastIndex = this.toasts.findIndex((t) => t.id === toastId);
    if (toastIndex === -1) return;
    const toast = this.toasts[toastIndex].element;
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
    this.toasts.splice(toastIndex, 1);
  }
  success(message, title = "✅ Éxito") {
    return this.show(message, title, "success");
  }
  error(message, title = "❌ Error") {
    return this.show(message, title, "error");
  }
  warning(message, title = "⚠️ Advertencia") {
    return this.show(message, title, "warning");
  }
}
const toast = new ToastManager();
// ============== DRAG & DROP AND SIMULATION ==============
const products = document.querySelectorAll(".draggable-product");
const zones = document.querySelectorAll(".aisle-zone");
let draggedProduct = null;

products.forEach((prod) => {
  prod.addEventListener("dragstart", (e) => {
    draggedProduct = e.target;
    e.dataTransfer.setData("text/plain", e.target.dataset.product);
    setTimeout(() => {
      e.target.style.visibility = "hidden";
    }, 0);
  });
  prod.addEventListener("dragend", (e) => {
    e.target.style.visibility = "visible";
    draggedProduct = null;
  });
});
zones.forEach((zone) => {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });
  zone.addEventListener("dragleave", (e) => {
    zone.classList.remove("dragover");
  });
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    if (!draggedProduct) return;
    const placedProducts = zone.querySelectorAll(".placed-product");
    if (placedProducts.length >= 2) {
      toast.warning(
        "Solo se permiten 2 productos por zona.",
        "⚠️ Límite alcanzado"
      );
      return;
    }
    const placed = document.createElement("div");
    placed.className = "placed-product";
    placed.textContent = draggedProduct.textContent;
    placed.dataset.product = draggedProduct.dataset.product;
    placed.dataset.type = draggedProduct.dataset.type;
    zone.appendChild(placed);
    toast.success(
      `${draggedProduct.textContent} colocado en ${zone.textContent}`,
      "✅ Producto añadido"
    );
  });
});
const simulateBtn = document.getElementById("simulateTraffic");
const conversionSpan = document.getElementById("estimatedConversion");
function simulateTraffic() {
  let totalConversion = 0;
  let productCount = 0;
  zones.forEach((zone) => {
    const placed = zone.querySelectorAll(".placed-product");
    let baseTraffic = 0;
    switch (zone.dataset.heat) {
      case "low":
        baseTraffic = 40;
        break;
      case "medium":
        baseTraffic = 70;
        break;
      case "high":
        baseTraffic = 100;
        break;
      default:
        baseTraffic = 50;
    }
    if (placed.length > 0) {
      placed.forEach((p) => {
        productCount++;
        if (p.dataset.type === "KVI") {
          baseTraffic += 40;
        } else {
          baseTraffic += 20;
        }
      });
    } else {
      baseTraffic *= 0.8;
    }
    baseTraffic = Math.max(0, Math.min(100, baseTraffic));
    const red = Math.floor(255 * (baseTraffic / 100));
    const green = Math.floor(255 * ((100 - baseTraffic) / 100));
    zone.style.backgroundColor = `rgba(${red},${green},0,0.5)`;
    if (placed.length > 0) {
      placed.forEach((p) => {
        const factor = p.dataset.type === "KVI" ? 1.5 : 1.0;
        totalConversion += (baseTraffic / 10) * factor;
      });
    }
  });
  totalConversion =
    productCount > 0
      ? Math.min(100, Math.max(0, Math.round(totalConversion / productCount)))
      : 0;
  conversionSpan.textContent = totalConversion + "%";
  toast.success(
    `Simulación completada. Conversión estimada: ${totalConversion}%`,
    "📊 Tráfico simulado"
  );
}
simulateBtn.addEventListener("click", simulateTraffic);
const resetBtn = document.getElementById("resetSimulation");
resetBtn.addEventListener("click", () => {
  zones.forEach((zone) => {
    zone.querySelectorAll(".placed-product").forEach((p) => p.remove());
    zone.style.backgroundColor = "#f0f0f0";
  });
  conversionSpan.textContent = "0%";
  toast.success("Simulación reseteada correctamente", "🔄 Reset completado");
});
// ============== OPTIMIZACIÓN DEL PLANOGRAMA ==============
const optimizeBtn = document.getElementById("optimizePlanogram");
optimizeBtn.addEventListener("click", () => {
  if (conversionSpan.textContent === "0%") simulateTraffic();
  let allProducts = [];
  zones.forEach((zone) => {
    zone.querySelectorAll(".placed-product").forEach((p) => {
      allProducts.push({
        element: p,
        type: p.dataset.type,
        name: p.textContent,
      });
      p.remove();
    });
  });
  if (allProducts.length === 0) {
    toast.warning(
      "Coloque algunos productos antes de optimizar",
      "⚠️ Sin productos"
    );
    return;
  }
  const zonesByHeat = Array.from(zones).sort((a, b) => {
    const heatOrder = { high: 3, medium: 2, low: 1 };
    return heatOrder[b.dataset.heat] - heatOrder[a.dataset.heat];
  });
  const kviProducts = allProducts.filter((p) => p.type === "KVI");
  const normalProducts = allProducts.filter((p) => p.type === "Normal");
  let placedCount = 0,
    optimizationDetails = [];
  kviProducts.forEach((product) => {
    for (let zone of zonesByHeat) {
      if (zone.querySelectorAll(".placed-product").length < 2) {
        zone.appendChild(product.element);
        placedCount++;
        optimizationDetails.push(
          `${product.name} → ${zone.textContent} (${zone.dataset.heat} tráfico)`
        );
        break;
      }
    }
  });
  normalProducts.forEach((product) => {
    for (let zone of zonesByHeat) {
      if (zone.querySelectorAll(".placed-product").length < 2) {
        zone.appendChild(product.element);
        placedCount++;
        optimizationDetails.push(
          `${product.name} → ${zone.textContent} (${zone.dataset.heat} tráfico)`
        );
        break;
      }
    }
  });
  simulateTraffic();
  const optimizationSummary = optimizationDetails.join("<br>");
  toast.success(
    `Planograma optimizado exitosamente:<br><br>${optimizationSummary}<br><br>Se priorizaron productos KVI en zonas de alto tráfico.`,
    "🚀 Optimización completada",
    "success",
    6000
  );
});
