/* Hulett Banana Bread Hub — Shopping Cart */
(() => {
  "use strict";

  const PHONE = "9729481083";
  const cart = [];
  const money = n => "$" + n.toFixed(2);
  const safe = s => String(s).replace(/[&<>"']/g, c =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]
  );

  const style = document.createElement("style");
  style.textContent = `
    #hub-shop {
      background:#fffdf8;
      border-top:2px solid #b78422;
      padding:52px 0;
    }
    #hub-shop .hub-inner {
      width:min(1050px,92%);
      margin:auto;
    }
    #hub-shop h2,#hub-shop h3 {
      font-family:Georgia,serif;
      color:#34271f;
    }
    #hub-shop h2 {
      text-align:center;
      font-size:clamp(2rem,5vw,3.3rem);
    }
    #hub-shop .hub-sub {
      text-align:center;
      color:#7b6958;
      margin-bottom:28px;
    }
    #hub-shop .hub-layout {
      display:grid;
      grid-template-columns:1.2fr 1fr;
      gap:24px;
      align-items:start;
    }
    #hub-shop .hub-panel {
      border:1px solid #e9ddc9;
      background:#fbf7ef;
      border-radius:22px;
      padding:20px;
    }
    #hub-shop label {
      display:block;
      font-weight:600;
      margin:12px 0 5px;
    }
    #hub-shop select,
    #hub-shop input,
    #hub-shop textarea {
      width:100%;
      padding:12px;
      border:1px solid #cdbb9d;
      border-radius:10px;
      background:white;
      color:#34271f;
      font:inherit;
      box-sizing:border-box;
    }
    #hub-shop .hub-checks {
      display:flex;
      flex-wrap:wrap;
      gap:12px;
      margin:12px 0;
    }
    #hub-shop .hub-checks label {
      font-weight:400;
      margin:0;
      display:flex;
      align-items:center;
      gap:6px;
    }
    #hub-shop .hub-checks input {
      width:auto;
    }
    #hub-shop button {
      border:0;
      background:#b78422;
      color:white;
      border-radius:99px;
      padding:13px 20px;
      font:700 .85rem Arial;
      cursor:pointer;
      margin-top:14px;
    }
    #hub-shop .hub-remove {
      background:transparent;
      color:#8b3c27;
      text-decoration:underline;
      padding:4px;
      margin:0;
    }
    #hub-shop .hub-item {
      border-bottom:1px solid #e9ddc9;
      padding:10px 0;
    }
    #hub-shop .hub-small {
      font-size:.83rem;
      color:#7b6958;
    }
    #hub-shop .hub-total {
      font-size:1.3rem;
      font-weight:700;
      margin-top:18px;
    }
    #hub-shop .hub-note {
      font-size:.85rem;
      color:#7b6958;
      margin-top:14px;
    }
    @media(max-width:750px) {
      #hub-shop .hub-layout {
        grid-template-columns:1fr;
      }
    }
  `;
  document.head.appendChild(style);

  // Read the menu and prices already on the website.
  const menu = [];

  document.querySelectorAll("#menu article.card")
    .forEach(card => {
      const name = card.querySelector("h3")?.textContent.trim();
      const options = [...card.querySelectorAll(".price")]
        .map(row => ({
          label: row.querySelector("span")?.textContent.trim(),
          price: Number(
            (row.querySelector("strong")?.textContent || "")
              .replace(/[^\d.]/g, "")
          )
        }))
        .filter(o => o.label && o.price > 0);

      if (name && options.length) {
        menu.push({name, options});
      }
    });

  document.querySelectorAll(".fall-favorites .seasonal-card")
    .forEach(card => {
      const name = card.querySelector("h3")?.textContent.trim();
      const matches = card.textContent.match(
        /\$\s*(\d+(?:\.\d{2})?)/g
      );
      const price = matches
        ? Number(matches[matches.length - 1].replace(/[^\d.]/g, ""))
        : 0;

      if (name && price) {
        menu.push({
          name,
          options: [{label:"Featured loaf",price}]
        });
      }
    });

  if (!menu.length) {
    console.warn("Hulett cart: menu items not found.");
    return;
  }

  const section = document.createElement("section");
  section.id = "hub-shop";

  section.innerHTML = `
    <div class="hub-inner">
      <h2>Build Your Banana Bread Order</h2>
      <p class="hub-sub">
        Add as many loaves as you'd like.
        Payment is not collected until approval.
      </p>

      <div class="hub-layout">
        <div class="hub-panel">
          <h3>Choose your bread</h3>

          <label for="hub-bread">Loaf / flavor</label>
          <select id="hub-bread"></select>

          <label for="hub-size">Size</label>
          <select id="hub-size"></select>

          <label>Extras (+$2 each per loaf)</label>
          <div class="hub-checks">
            <label>
              <input type="checkbox" value="Walnuts">
              Walnuts
            </label>
            <label>
              <input type="checkbox" value="Pecans">
              Pecans
            </label>
            <label>
              <input type="checkbox" value="Chocolate chips">
              Chocolate chips
            </label>
          </div>

          <label for="hub-qty">Quantity</label>
          <input id="hub-qty" type="number"
            min="1" max="50" value="1">

          <button type="button" id="hub-add">
            Add to Cart
          </button>
        </div>

        <div class="hub-panel">
          <h3>Your Cart</h3>
          <div id="hub-items">Your cart is empty.</div>
          <div id="hub-total" class="hub-total"></div>

          <h3>Your Order Details</h3>

          <label for="hub-name">Your Name</label>
          <input id="hub-name" autocomplete="name">

          <label for="hub-phone">Phone Number</label>
          <input id="hub-phone" type="tel" autocomplete="tel">

          <label for="hub-method">Pickup or Delivery</label>
          <select id="hub-method">
            <option value="Pickup">Pickup</option>
            <option value="Delivery">Delivery (+$5)</option>
          </select>

          <label for="hub-date">Preferred Date</label>
          <input id="hub-date" type="date">

          <label for="hub-time">Preferred Time</label>
          <input id="hub-time" type="time">

          <label for="hub-notes">
            Special Requests / Allergies
          </label>
          <textarea id="hub-notes" rows="3"></textarea>

          <button type="button" id="hub-send">
            Text My Order Request
          </button>

          <p class="hub-note">
            Your Messages app will open with your order.
            Tap Send to submit your request.
            Orders must be approved before payment.
          </p>
        </div>
      </div>
    </div>
  `;

  const anchor = document.getElementById("order");
  const target = anchor || document.querySelector("footer");

  if (target) {
    target.before(section);
  } else {
    document.body.appendChild(section);
  }

  const $ = id => section.querySelector("#" + id);
  const bread = $("hub-bread");
  const size = $("hub-size");

  menu.forEach((item, i) => {
    bread.add(new Option(item.name, String(i)));
  });

  function updateSizes() {
    size.replaceChildren();
    menu[Number(bread.value)].options.forEach((o, i) => {
      size.add(new Option(
        `${o.label} — ${money(o.price)}`,
        String(i)
      ));
    });
  }

  bread.addEventListener("change", updateSizes);
  updateSizes();

  function total() {
    const subtotal = cart.reduce(
      (sum, x) => sum + x.unit * x.qty, 0
    );
    const delivery = $("hub-method").value === "Delivery"
      && cart.length ? 5 : 0;
    return subtotal + delivery;
  }

  function render() {
    $("hub-items").innerHTML = cart.length
      ? cart.map((x, i) => `
        <div class="hub-item">
          <strong>${safe(x.name)}</strong> × ${x.qty}
          <div class="hub-small">
            ${safe(x.size)}
            ${x.extras.length
              ? " · " + safe(x.extras.join(", "))
              : ""}
          </div>
          <div>
            ${money(x.unit * x.qty)}
            <button type="button" class="hub-remove"
              data-index="${i}">Remove</button>
          </div>
        </div>
      `).join("")
      : "Your cart is empty.";

    $("hub-total").textContent = cart.length
      ? "Estimated Total: " + money(total())
      : "";

    $("hub-items").querySelectorAll(".hub-remove")
      .forEach(btn => {
        btn.addEventListener("click", () => {
          cart.splice(Number(btn.dataset.index), 1);
          render();
        });
      });
  }

  $("hub-add").addEventListener("click", () => {
    const item = menu[Number(bread.value)];
    const opt = item.options[Number(size.value)];
    const qty = Number($("hub-qty").value);

    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      alert("Choose a quantity between 1 and 50.");
      return;
    }

    const extras = [
      ...section.querySelectorAll(".hub-checks input:checked")
    ].map(x => x.value);

    cart.push({
      name: item.name,
      size: opt.label,
      extras,
      qty,
      unit: opt.price + extras.length * 2
    });

    section.querySelectorAll(".hub-checks input")
      .forEach(x => x.checked = false);

    $("hub-qty").value = "1";
    render();
  });

  $("hub-method").addEventListener("change", render);

  $("hub-date").min = new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);

  $("hub-send").addEventListener("click", () => {
    if (!cart.length) {
      alert("Add at least one loaf to your cart.");
      return;
    }

    for (const id of [
      "hub-name", "hub-phone", "hub-date", "hub-time"
    ]) {
      if (!$(id).value.trim()) {
        alert("Please complete all required order details.");
        $(id).focus();
        return;
      }
    }

    const lines = [
      "NEW HULETT BANANA BREAD ORDER REQUEST",
      "Name: " + $("hub-name").value.trim(),
      "Phone: " + $("hub-phone").value.trim(),
      "Method: " + $("hub-method").value,
      "Date: " + $("hub-date").value,
      "Time: " + $("hub-time").value,
      "",
      ...cart.map((x, i) =>
        `${i + 1}. ${x.name} — ${x.size}` +
        ` — Qty ${x.qty}` +
        (x.extras.length
          ? " — Extras: " + x.extras.join(", ")
          : "") +
        ` — ${money(x.unit * x.qty)}`
      ),
      $("hub-method").value === "Delivery"
        ? "Delivery Fee: $5.00" : "",
      "ESTIMATED TOTAL: " + money(total()),
      "Notes / Allergies: " +
        ($("hub-notes").value.trim() || "None provided"),
      "Please confirm availability and final total."
    ];

    const message = lines.filter(Boolean).join("\n");
    window.location.href =
      `sms:${PHONE}&body=${encodeURIComponent(message)}`;
  });

  document.querySelectorAll('a[href^="sms:"]')
    .forEach(a => {
      a.href = "#hub-shop";
      if (a.classList.contains("mobile")) {
        a.textContent = "Build Your Order";
      }
    });

  render();
})();
