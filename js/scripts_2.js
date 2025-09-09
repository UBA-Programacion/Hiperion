// ================================
// Código para Simulación AMM Hipérbola
// ================================

// Referencias a elementos del DOM
const initialXInput = document.getElementById("initialX"); // Input para cantidad inicial de Papas
const initialYInput = document.getElementById("initialY"); // Input para cantidad inicial de Manzanas
const tradeAmountInput = document.getElementById("tradeAmount"); // Input para cantidad de transacción
const kValueSpan = document.getElementById("kValue"); // Span para mostrar valor constante k
const currentXSpan = document.getElementById("currentX"); // Span para mostrar nueva cantidad de Papas
const currentYSpan = document.getElementById("currentY"); // Span para mostrar nueva cantidad de Manzanas
const priceXYSpan = document.getElementById("priceXY"); // Span para mostrar precio Papas/Manzanas
const priceYXSpan = document.getElementById("priceYX"); // Span para mostrar precio Manzanas/Papas
const simulateBtn = document.getElementById("simulateAMM"); // Botón para simular

let ammChartInstance = null; // Instancia del gráfico para destruir y recrear

// Función para mostrar un mensaje delicado (toast) que desaparece después de 3 segundos
function showMessage(message) {
  const messageElement = document.createElement("div"); // Crea un div para el mensaje
  messageElement.textContent = message; // Asigna el texto del mensaje
  messageElement.style.position = "fixed"; // Posición fija en la pantalla
  messageElement.style.top = "20px"; // Posición desde arriba
  messageElement.style.right = "20px"; // Posición desde la derecha
  messageElement.style.backgroundColor = "rgba(255, 0, 0, 0.8)"; // Fondo rojo semitransparente
  messageElement.style.color = "white"; // Texto blanco
  messageElement.style.padding = "10px 20px"; // Padding interno
  messageElement.style.borderRadius = "5px"; // Bordes redondeados
  messageElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)"; // Sombra suave
  messageElement.style.zIndex = "1050"; // Por encima de otros elementos
  messageElement.style.opacity = "0"; // Empieza invisible
  messageElement.style.transition = "opacity 0.5s ease-in-out"; // Transición suave
  document.body.appendChild(messageElement); // Agrega al body

  // Muestra el mensaje
  setTimeout(() => {
    messageElement.style.opacity = "1";
  }, 10);

  // Oculta y elimina después de 3 segundos
  setTimeout(() => {
    messageElement.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 500);
  }, 3000);
}

// Acciones al hacer clic en simular
simulateBtn.addEventListener("click", () => {
  const initialX = Number(initialXInput.value); // Obtiene valor inicial X
  const initialY = Number(initialYInput.value); // Obtiene valor inicial Y
  const tradeAmount = Number(tradeAmountInput.value); // Obtiene cantidad de transacción

  // Validaciones básicas
  if (initialX <= 0 || initialY <= 0) {
    showMessage("Las cantidades iniciales deben ser mayores que 0.");
    return;
  }

  // Calcular k
  const k = initialX * initialY;

  // Nueva cantidad de X después de la transacción
  const newX = initialX + tradeAmount;

  if (newX <= 0) {
    showMessage(
      "La cantidad de Producto Papas después de la transacción debe ser mayor que 0."
    );
    return;
  }

  // Calcular nueva cantidad de Y para mantener k constante
  const newY = k / newX;

  // Precios
  const priceXY = newY / newX;
  const priceYX = newX / newY;

  // Mostrar resultados
  kValueSpan.textContent = k.toFixed(2);
  currentXSpan.textContent = newX.toFixed(2);
  currentYSpan.textContent = newY.toFixed(2);
  priceXYSpan.textContent = priceXY.toFixed(6);
  priceYXSpan.textContent = priceYX.toFixed(6);

  // Actualizar gráfico hipérbola
  updateChart(initialX, initialY, newX, newY, k);
});

// Función para dibujar la hipérbola y los puntos
function updateChart(initialX, initialY, newX, newY, k) {
  const ctx = document.getElementById("ammChart").getContext("2d");
  if (ammChartInstance) {
    ammChartInstance.destroy();
  }
  // Datos para la curva
  const minX = Math.max(100, Math.min(initialX, newX) * 0.5);
  const maxX = Math.max(initialX, newX) * 2;
  const pointsCount = 200;
  const stepX = (maxX - minX) / pointsCount;
  const xData = [];
  const yData = [];
  for (let x = minX; x <= maxX; x += stepX) {
    if (x > 0) {
      xData.push(x);
      yData.push(k / x);
    }
  }
  ammChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: xData.map((x) => x.toFixed(2)),
      datasets: [
        {
          label: "Algoritmo (Manzana = k / Papa)",
          data: yData,
          borderColor: "rgba(0, 128, 128, 1)",
          backgroundColor: "rgba(0, 128, 128, 0.1)",
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          showLine: true,
        },
        {
          label: "Punto Inicial",
          data: [{ x: initialX, y: initialY }],
          borderColor: "rgba(0, 0, 255, 1)",
          backgroundColor: "rgba(0, 0, 255, 1)",
          pointRadius: 8,
          type: "scatter",
        },
        {
          label: "Punto Después de Transacción",
          data: [{ x: newX, y: newY }],
          borderColor: "rgba(255, 0, 0, 1)",
          backgroundColor: "rgba(255, 0, 0, 1)",
          pointRadius: 8,
          type: "scatter",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Cantidad de Producto (Papas)",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Cantidad de Producto (Manzanas)",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            padding: 30, // Aquí defines el espacio entre la leyenda y el gráfico
          },
        },
      },
      layout: {
        padding: {
          top: 5, // Esto puede dar aún más margen entre la leyenda y el canvas
        },
      },
    },
  });
}

// Inicializa gráfico y datos con valores por defecto al cargar página
window.addEventListener("load", () => {
  simulateBtn.click();
});
function updateChart(initialX, initialY, newX, newY, k) {
  const ctx = document.getElementById("ammChart").getContext("2d");
  if (ammChartInstance) {
    ammChartInstance.destroy();
  }
  // Datos para la curva
  const minX = Math.max(100, Math.min(initialX, newX) * 0.5);
  const maxX = Math.max(initialX, newX) * 2;
  const pointsCount = 200;
  const stepX = (maxX - minX) / pointsCount;
  const xData = [];
  const yData = [];
  for (let x = minX; x <= maxX; x += stepX) {
    if (x > 0) {
      xData.push(x);
      yData.push(k / x);
    }
  }
  ammChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: xData.map((x) => x.toFixed(2)),
      datasets: [
        {
          label: "Algoritmo (Manzanas = k / Papas)",
          data: yData,
          borderColor: "rgba(0, 128, 128, 1)",
          backgroundColor: "rgba(0, 128, 128, 0.1)",
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          showLine: true,
        },
        {
          label: "Punto Inicial",
          data: [{ x: initialX, y: initialY }],
          borderColor: "rgba(0, 0, 255, 1)",
          backgroundColor: "rgba(0, 0, 255, 1)",
          pointRadius: 8,
          type: "scatter",
        },
        {
          label: "Punto Después de Transacción",
          data: [{ x: newX, y: newY }],
          borderColor: "rgba(255, 0, 0, 1)",
          backgroundColor: "rgba(255, 0, 0, 1)",
          pointRadius: 8,
          type: "scatter",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Cantidad de Papas",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Cantidad de Manzanas",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            padding: 30, // Aquí defines el espacio entre la leyenda y el gráfico
          },
        },
      },
      layout: {
        padding: {
          top: 5, // Esto puede dar aún más margen entre la leyenda y el canvas
        },
      },
    },
  });
}
