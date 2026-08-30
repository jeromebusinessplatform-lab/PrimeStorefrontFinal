(() => {
  const MESSAGE = "Upload a payment receipt before submitting the order.";

  function showError(form, message) {
    let node = form.querySelector("[data-receipt-bridge-error]");
    if (!node) {
      node = document.createElement("p");
      node.setAttribute("data-receipt-bridge-error", "true");
      node.className = "error";
      node.setAttribute("role", "alert");
      form.appendChild(node);
    }
    node.textContent = message;
  }

  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.receiptReady === "true") return;

    const fileInput = form.querySelector('input[type="file"]');
    if (!(fileInput instanceof HTMLInputElement)) return;
    const file = fileInput.files?.[0];
    if (!file) {
      event.preventDefault();
      showError(form, MESSAGE);
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    if (form.dataset.receiptUploading === "true") return;
    form.dataset.receiptUploading = "true";
    showError(form, "Uploading payment receipt…");

    try {
      const payload = new FormData();
      payload.set("file", file, file.name || "receipt");
      const response = await fetch("/customer/catalog/receipt", {
        method: "POST",
        credentials: "include",
        body: payload,
      });
      if (!response.ok) {
        let message = "Payment receipt upload failed.";
        try { const body = await response.json(); if (body?.error) message = body.error; } catch { /* preserve fallback */ }
        throw new Error(message);
      }
      form.dataset.receiptReady = "true";
      form.dataset.receiptUploading = "false";
      const errorNode = form.querySelector("[data-receipt-bridge-error]");
      if (errorNode) errorNode.remove();
      form.requestSubmit(event.submitter instanceof HTMLElement ? event.submitter : undefined);
    } catch (error) {
      form.dataset.receiptUploading = "false";
      showError(form, error instanceof Error ? error.message : "Payment receipt upload failed.");
    }
  }, true);
})();
