// ==============================
// Simulador Balanceador de Productos HIPERIÓN
// ==============================

const productCategories = {
  lacteos: [
    {
      name: "Leche Entera",
      quantity: 100,
      basePrice: 1.2,
      weight: 0.25,
      priority: 1,
      category: "Básicos",
    },
    {
      name: "Yogurt Natural",
      quantity: 80,
      basePrice: 0.8,
      weight: 0.2,
      priority: 2,
      category: "Derivados",
    },
    {
      name: "Queso Fresco",
      quantity: 50,
      basePrice: 3.5,
      weight: 0.3,
      priority: 1,
      category: "Premium",
    },
    {
      name: "Mantequilla",
      quantity: 60,
      basePrice: 2.8,
      weight: 0.15,
      priority: 3,
      category: "Grasas",
    },
    {
      name: "Crema de Leche",
      quantity: 40,
      basePrice: 1.9,
      weight: 0.1,
      priority: 2,
      category: "Derivados",
    },
  ],
  bebidas: [
    {
      name: "Agua Mineral",
      quantity: 200,
      basePrice: 0.5,
      weight: 0.2,
      priority: 1,
      category: "Básicos",
    },
    {
      name: "Refresco Cola",
      quantity: 150,
      basePrice: 1.5,
      weight: 0.25,
      priority: 2,
      category: "Gaseosas",
    },
    {
      name: "Jugo Natural",
      quantity: 80,
      basePrice: 2.2,
      weight: 0.2,
      priority: 1,
      category: "Saludables",
    },
    {
      name: "Cerveza",
      quantity: 120,
      basePrice: 1.8,
      weight: 0.25,
      priority: 3,
      category: "Alcohólicas",
    },
    {
      name: "Vino Tinto",
      quantity: 30,
      basePrice: 8.5,
      weight: 0.1,
      priority: 1,
      category: "Premium",
    },
  ],
  carnes: [
    {
      name: "Pollo Entero",
      quantity: 40,
      basePrice: 4.5,
      weight: 0.3,
      priority: 1,
      category: "Aves",
    },
    {
      name: "Carne de Res",
      quantity: 25,
      basePrice: 12.0,
      weight: 0.25,
      priority: 1,
      category: "Bovinos",
    },
    {
      name: "Cerdo",
      quantity: 30,
      basePrice: 8.5,
      weight: 0.2,
      priority: 2,
      category: "Porcinos",
    },
    {
      name: "Pescado",
      quantity: 20,
      basePrice: 15.0,
      weight: 0.15,
      priority: 1,
      category: "Mariscos",
    },
    {
      name: "Embutidos",
      quantity: 60,
      basePrice: 6.2,
      weight: 0.1,
      priority: 3,
      category: "Procesados",
    },
  ],
  panaderia: [
    {
      name: "Pan Blanco",
      quantity: 80,
      basePrice: 1.0,
      weight: 0.25,
      priority: 1,
      category: "Básicos",
    },
    {
      name: "Pan Integral",
      quantity: 60,
      basePrice: 1.5,
      weight: 0.2,
      priority: 2,
      category: "Saludables",
    },
    {
      name: "Croissant",
      quantity: 40,
      basePrice: 2.5,
      weight: 0.15,
      priority: 2,
      category: "Francés",
    },
    {
      name: "Galletas",
      quantity: 100,
      basePrice: 3.2,
      weight: 0.25,
      priority: 3,
      category: "Dulces",
    },
    {
      name: "Pastel",
      quantity: 20,
      basePrice: 12.0,
      weight: 0.15,
      priority: 1,
      category: "Premium",
    },
  ],
  verdura: [
    {
      name: "Lechuga",
      quantity: 180,
      basePrice: 1.1,
      weight: 0.27,
      priority: 1,
      category: "Básicos",
    },
    {
      name: "Brocoli",
      quantity: 120,
      basePrice: 1.3,
      weight: 0.1,
      priority: 2,
      category: "Saludables",
    },
    {
      name: "Repollo",
      quantity: 50,
      basePrice: 2.9,
      weight: 0.19,
      priority: 2,
      category: "Inglés",
    },
    {
      name: "Puerrp",
      quantity: 100,
      basePrice: 3.2,
      weight: 0.45,
      priority: 3,
      category: "Especial",
    },
  ],
};

let currentBasket = [];
let balancerChart = null;
let transactionHistory = [];

function showWarning(msg) {
  const warning = document.getElementById("balancerWarning");
  warning.textContent = msg;
  warning.style.display = "block";
  setTimeout(() => {
    warning.style.display = "none";
  }, 3200);
}

// Inicializar simulador
document.addEventListener("DOMContentLoaded", function () {
  initializeBalancer();
  setupEventListeners();
});

function setupEventListeners() {
  document
    .getElementById("categorySelect")
    .addEventListener("change", updateProductTable);
  document
    .getElementById("simulateBalancer")
    .addEventListener("click", simulateBalancerTrade);
  document
    .getElementById("resetBalancer")
    .addEventListener("click", resetBalancer);
}

function initializeBalancer() {
  updateProductTable();
  updateBalancerChart();
}

function updateProductTable() {
  const categorySelect = document.getElementById("categorySelect");
  const category = categorySelect.value;
  const products = productCategories[category];

  // Actualizar cesta
  currentBasket = products.map((p) => ({
    ...p,
    currentPrice: p.basePrice,
    invariant: 0,
    originalQuantity: p.quantity,
  }));

  // Tabla de productos
  const tableHTML = `
          <table class="product-table">
              <thead>
                  <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Precio Base</th>
                      <th>Precio Actual</th>
                      <th>Peso %</th>
                      <th>Prioridad</th>
                      <th>Invariante</th>
                  </tr>
              </thead>
              <tbody>
                  ${currentBasket
                    .map((product) => {
                      const stockStatus =
                        product.quantity > 50
                          ? "status-active"
                          : product.quantity > 20
                          ? "status-warning"
                          : "status-danger";
                      return `
                          <tr>
                              <td><strong>${product.name}</strong></td>
                              <td><span class="status-indicator ${stockStatus}"></span>${
                        product.category
                      }</td>
                              <td>${product.quantity}</td>
                              <td>$${product.basePrice.toFixed(2)}</td>
                              <td><strong>$${product.currentPrice.toFixed(
                                2
                              )}</strong></td>
                              <td>${(product.weight * 100).toFixed(0)}%</td>
                              <td>${"⭐".repeat(4 - product.priority)}</td>
                              <td>${product.invariant.toFixed(2)}</td>
                          </tr>
                      `;
                    })
                    .join("")}
              </tbody>
          </table>
      `;
  document.getElementById("productTableContainer").innerHTML = tableHTML;
  updateTradeProductSelect();
  calculateBalancerMetrics();
  updateBalancerChart();
}

function updateTradeProductSelect() {
  const tradeSelect = document.getElementById("balancerTradeProduct");
  tradeSelect.innerHTML = '<option value="">Seleccione un producto...</option>';
  currentBasket.forEach((product) => {
    if (product.quantity > 0) {
      const stockStatus =
        product.quantity > 50 ? "🟢" : product.quantity > 20 ? "🟡" : "🔴";
      const option = document.createElement("option");
      option.value = product.name;
      option.textContent = `${stockStatus} ${product.name} (${
        product.quantity
      } disp. - $${product.currentPrice.toFixed(2)})`;
      tradeSelect.appendChild(option);
    }
  });
}

function calculateBalancerMetrics() {
  if (currentBasket.length === 0) return;
  let totalInvariant = 0,
    totalValue = 0,
    activeProducts = 0;
  currentBasket.forEach((product) => {
    if (product.quantity > 0) {
      product.invariant =
        product.weight * product.quantity * product.currentPrice;
      totalInvariant += product.invariant;
      totalValue += product.quantity * product.currentPrice;
      activeProducts++;
    }
  });
  document.getElementById("totalInvariant").textContent =
    totalInvariant.toFixed(2);
  document.getElementById(
    "totalBasketValue"
  ).textContent = `$${totalValue.toFixed(2)}`;
  document.getElementById("activeProducts").textContent = activeProducts;
}

function simulateBalancerTrade() {
  const productSelect = document.getElementById("balancerTradeProduct");
  const amountInput = document.getElementById("balancerTradeAmount");
  const productName = productSelect.value;
  const amount = parseInt(amountInput.value);

  if (!productName || amount <= 0) {
    showWarning("Selecciona producto y cantidad válida.");
    return;
  }
  const productIndex = currentBasket.findIndex((p) => p.name === productName);
  if (productIndex === -1) {
    showWarning("Producto no encontrado");
    return;
  }
  const product = currentBasket[productIndex];
  if (amount > product.quantity) {
    showWarning(`Stock insuficiente. Disponible: ${product.quantity}`);
    return;
  }
  const previousState = {
    name: product.name,
    quantity: product.quantity,
    price: product.currentPrice,
    invariant: product.invariant,
  };
  product.quantity -= amount;
  rebalancePrices();
  const transaction = {
    timestamp: new Date(),
    product: productName,
    amount: amount,
    previousState: previousState,
    newState: {
      quantity: product.quantity,
      price: product.currentPrice,
      invariant: product.invariant,
    },
  };
  transactionHistory.push(transaction);
  updateBalancerResults(transaction);
  updateProductTable();
  updateBalancerChart();
}

function rebalancePrices() {
  currentBasket.forEach((product) => {
    if (product.quantity > 0) {
      const scarcityFactor = Math.max(0.5, 100 / Math.max(product.quantity, 1));
      const priorityFactor = 1 + 0.1 * (4 - product.priority);
      const stockReduction =
        (product.originalQuantity - product.quantity) /
        product.originalQuantity;
      const demandFactor = 1 + stockReduction * 0.5;
      product.currentPrice =
        product.basePrice * scarcityFactor * priorityFactor * demandFactor;
    } else {
      product.currentPrice = product.basePrice * 10;
    }
  });
  calculateBalancerMetrics();
}

function updateBalancerResults(transaction) {
  const resultsList = document.getElementById("balancerResultsList");
  const priceChange =
    transaction.newState.price - transaction.previousState.price;
  const priceChangePercent =
    (priceChange / transaction.previousState.price) * 100;
  const priceDirection = priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➡️";
  const changeColor =
    priceChange > 0 ? "#28a745" : priceChange < 0 ? "#dc3545" : "#6c757d";

  const resultHTML = `
          <li style="border-left-color: ${changeColor};">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <strong>🛒 ${transaction.product}</strong>
                  <small>${transaction.timestamp.toLocaleTimeString()}</small>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                  <div>
                      <strong>Cantidad vendida:</strong> ${
                        transaction.amount
                      } unidades<br>
                      <strong>Stock:</strong> ${
                        transaction.previousState.quantity
                      } → ${transaction.newState.quantity}
                  </div>
                  <div>
                      <strong>Precio:</strong> $${transaction.previousState.price.toFixed(
                        2
                      )} → $${transaction.newState.price.toFixed(
    2
  )} ${priceDirection}<br>
                      <strong>Cambio:</strong> <span style="color: ${changeColor};">${
    priceChangePercent > 0 ? "+" : ""
  }${priceChangePercent.toFixed(1)}%</span>
                  </div>
              </div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                  <strong>Invariante:</strong> ${transaction.previousState.invariant.toFixed(
                    2
                  )} → ${transaction.newState.invariant.toFixed(2)}
              </div>
          </li>
      `;
  resultsList.insertAdjacentHTML("afterbegin", resultHTML);
  while (resultsList.children.length > 8) {
    resultsList.removeChild(resultsList.lastChild);
  }
}

function updateBalancerChart() {
  const canvas = document.getElementById("balancerChart");
  if (!canvas || currentBasket.length === 0) return;
  const ctx = canvas.getContext("2d");
  if (balancerChart) balancerChart.destroy();
  const labels = currentBasket.map((p) => p.name);
  const quantities = currentBasket.map((p) => p.quantity);
  const prices = currentBasket.map((p) => p.currentPrice);
  const invariants = currentBasket.map((p) => p.invariant);
  const weights = currentBasket.map((p) => p.weight * 100);

  balancerChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Stock Disponible",
          data: quantities,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          yAxisID: "y",
        },
        {
          label: "Precio Actual ($)",
          data: prices,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          yAxisID: "y1",
          type: "line",
          tension: 0.4,
        },
        {
          label: "Invariante Ponderado",
          data: invariants,
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          yAxisID: "y2",
        },
        {
          label: "Peso en Cesta (%)",
          data: weights,
          backgroundColor: "rgba(255, 206, 86, 0.7)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 2,
          yAxisID: "y3",
          type: "line",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: "Estado Dinámico de la Cesta de Productos - HIPERIÓN",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            padding: 15,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#667eea",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Productos",
            font: { weight: "bold" },
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Stock / Invariante",
            color: "#54A0FF",
            font: { weight: "bold" },
          },
          grid: { color: "rgba(0, 0, 0, 0.1)" },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "Precio ($)",
            color: "#FF6B6B",
            font: { weight: "bold" },
          },
          grid: { drawOnChartArea: false },
        },
        y2: { type: "linear", display: false, position: "right" },
        y3: { type: "linear", display: false, position: "right" },
      },
    },
  });
}

function resetBalancer() {
  transactionHistory = [];
  updateProductTable();
  const resultsList = document.getElementById("balancerResultsList");
  if (resultsList)
    resultsList.innerHTML =
      '<li style="text-align: center; color: #666; font-style: italic;">No hay transacciones registradas</li>';
  const amountInput = document.getElementById("balancerTradeAmount");
  if (amountInput) amountInput.value = "10";
  const productSelect = document.getElementById("balancerTradeProduct");
  if (productSelect && productSelect.children.length > 0)
    productSelect.selectedIndex = 0;
}
function previewBalancerTrade() {
  // Crea una copia temporal del array de productos para simular el cambio
  const productName = document.getElementById("balancerTradeProduct").value;
  const amount = parseInt(document.getElementById("balancerTradeAmount").value);
  if (!productName || isNaN(amount) || amount <= 0) {
    updateProductTable(); // Muestra los valores actuales
    return;
  }
  const tempBasket = currentBasket.map((p) => ({ ...p }));
  const idx = tempBasket.findIndex((p) => p.name === productName);
  if (idx === -1 || amount > tempBasket[idx].quantity) {
    updateProductTable();
    return;
  }
  // Simula la venta
  tempBasket[idx].quantity -= amount;
  tempBasket.forEach((product) => {
    if (product.quantity > 0) {
      const scarcityFactor = Math.max(0.5, 100 / Math.max(product.quantity, 1));
      const priorityFactor = 1 + 0.1 * (4 - product.priority);
      const stockReduction =
        (product.originalQuantity - product.quantity) /
        product.originalQuantity;
      const demandFactor = 1 + stockReduction * 0.5;
      product.currentPrice =
        product.basePrice * scarcityFactor * priorityFactor * demandFactor;
    } else {
      product.currentPrice = product.basePrice * 10;
    }
    product.invariant =
      product.weight * product.quantity * product.currentPrice;
  });
  // Refleja la simulación gráfica y en tabla (sin mutar currentBasket)
  renderTable(tempBasket);
  updateBalancerChartPreview(tempBasket);
}

function renderTable(basket) {
  // Similar a updateProductTable pero usando basket
  const tableHTML = `
          <table class="product-table">
              <thead>
                  <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Precio Base</th>
                      <th>Precio Actual</th>
                      <th>Peso %</th>
                      <th>Prioridad</th>
                      <th>Invariante</th>
                  </tr>
              </thead>
              <tbody>
                  ${basket
                    .map((product) => {
                      const stockStatus =
                        product.quantity > 50
                          ? "status-active"
                          : product.quantity > 20
                          ? "status-warning"
                          : "status-danger";
                      return `
                          <tr>
                              <td><strong>${product.name}</strong></td>
                              <td><span class="status-indicator ${stockStatus}"></span>${
                        product.category
                      }</td>
                              <td>${product.quantity}</td>
                              <td>$${product.basePrice.toFixed(2)}</td>
                              <td><strong>$${product.currentPrice.toFixed(
                                2
                              )}</strong></td>
                              <td>${(product.weight * 100).toFixed(0)}%</td>
                              <td>${"⭐".repeat(4 - product.priority)}</td>
                              <td>${product.invariant.toFixed(2)}</td>
                          </tr>
                      `;
                    })
                    .join("")}
              </tbody>
          </table>
      `;
  document.getElementById("productTableContainer").innerHTML = tableHTML;
}

function updateBalancerChartPreview(basket) {
  const canvas = document.getElementById("balancerChart");
  if (!canvas || basket.length === 0) return;
  const ctx = canvas.getContext("2d");
  if (balancerChart) balancerChart.destroy();
  const labels = basket.map((p) => p.name);
  const quantities = basket.map((p) => p.quantity);
  const prices = basket.map((p) => p.currentPrice);
  const invariants = basket.map((p) => p.invariant);
  const weights = basket.map((p) => p.weight * 100);

  balancerChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Stock Disponible",
          data: quantities,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          yAxisID: "y",
        },
        {
          label: "Precio Actual ($)",
          data: prices,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          yAxisID: "y1",
          type: "line",
          tension: 0.4,
        },
        {
          label: "Invariante Ponderado",
          data: invariants,
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          yAxisID: "y2",
        },
        {
          label: "Peso en Cesta (%)",
          data: weights,
          backgroundColor: "rgba(255, 206, 86, 0.7)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 2,
          yAxisID: "y3",
          type: "line",
          tension: 0.4,
        },
      ],
    },
    options: {
      /* igual a updateBalancerChart */
    },
  });
}
function previewBalancerTrade() {
  const productName = document.getElementById("balancerTradeProduct").value;
  const amount = parseInt(document.getElementById("balancerTradeAmount").value);
  if (!productName || isNaN(amount) || amount <= 0) {
    updateProductTable(); // muestra valores actuales
    updateBalancerChart();
    return;
  }
  const tempBasket = currentBasket.map((p) => ({ ...p }));
  const idx = tempBasket.findIndex((p) => p.name === productName);
  if (idx === -1 || amount > tempBasket[idx].quantity) {
    updateProductTable();
    updateBalancerChart();
    return;
  }
  tempBasket[idx].quantity -= amount;
  tempBasket.forEach((product) => {
    if (product.quantity > 0) {
      const scarcityFactor = Math.max(0.5, 100 / Math.max(product.quantity, 1));
      const priorityFactor = 1 + 0.1 * (4 - product.priority);
      const stockReduction =
        (product.originalQuantity - product.quantity) /
        product.originalQuantity;
      const demandFactor = 1 + stockReduction * 0.5;
      product.currentPrice =
        product.basePrice * scarcityFactor * priorityFactor * demandFactor;
    } else {
      product.currentPrice = product.basePrice * 10;
    }
    product.invariant =
      product.weight * product.quantity * product.currentPrice;
  });
  renderTable(tempBasket);
  updateBalancerChartPreview(tempBasket);
}

function renderTable(basket) {
  const tableHTML = `
          <table class="product-table">
              <thead>
                  <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Stock</th>
                      <th>Precio Base</th>
                      <th>Precio Actual</th>
                      <th>Peso %</th>
                      <th>Prioridad</th>
                      <th>Invariante</th>
                  </tr>
              </thead>
              <tbody>
                  ${basket
                    .map((product) => {
                      const stockStatus =
                        product.quantity > 50
                          ? "status-active"
                          : product.quantity > 20
                          ? "status-warning"
                          : "status-danger";
                      return `
                          <tr>
                              <td><strong>${product.name}</strong></td>
                              <td><span class="status-indicator ${stockStatus}"></span>${
                        product.category
                      }</td>
                              <td>${product.quantity}</td>
                              <td>$${product.basePrice.toFixed(2)}</td>
                              <td><strong>$${product.currentPrice.toFixed(
                                2
                              )}</strong></td>
                              <td>${(product.weight * 100).toFixed(0)}%</td>
                              <td>${"⭐".repeat(4 - product.priority)}</td>
                              <td>${product.invariant.toFixed(2)}</td>
                          </tr>
                      `;
                    })
                    .join("")}
              </tbody>
          </table>
      `;
  document.getElementById("productTableContainer").innerHTML = tableHTML;
}

function updateBalancerChartPreview(basket) {
  const canvas = document.getElementById("balancerChart");
  if (!canvas || basket.length === 0) return;
  const ctx = canvas.getContext("2d");
  if (balancerChart) balancerChart.destroy();
  const labels = basket.map((p) => p.name);
  const quantities = basket.map((p) => p.quantity);
  const prices = basket.map((p) => p.currentPrice);
  const invariants = basket.map((p) => p.invariant);
  const weights = basket.map((p) => p.weight * 100);

  balancerChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Stock Disponible",
          data: quantities,
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          yAxisID: "y",
        },
        {
          label: "Precio Actual ($)",
          data: prices,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          yAxisID: "y1",
          type: "line",
          tension: 0.4,
        },
        {
          label: "Invariante Ponderado",
          data: invariants,
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          yAxisID: "y2",
        },
        {
          label: "Peso en Cesta (%)",
          data: weights,
          backgroundColor: "rgba(255, 206, 86, 0.7)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 2,
          yAxisID: "y3",
          type: "line",
          tension: 0.4,
        },
      ],
    },
    options: {
      /* igual a updateBalancerChart */
    },
  });
}
