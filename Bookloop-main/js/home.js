// BookLoop Price Calculator

const originalPrice = document.getElementById("calc-original");
const discountPercent = document.getElementById("calc-percent");

const percentOutput = document.getElementById("calc-pct");

const shopPrice = document.getElementById("calc-shop");
const shopBar = document.getElementById("calc-shop-bar");

const youPrice = document.getElementById("calc-you");
const youBar = document.getElementById("calc-you-bar");

const difference = document.getElementById("calc-diff");

function updateCalculator() {
    const original = Number(originalPrice.value) || 0;
    const percent = Number(discountPercent.value);

    // Calculate prices
    const shop = original;
    const you = original * percent / 100;
    const savings = shop - you;

    // Update percentage
    percentOutput.textContent = percent + "%";

    // Update prices
    shopPrice.textContent = "৳" + shop.toFixed(0);
    youPrice.textContent = "৳" + you.toFixed(0);

    // Update bars
    shopBar.style.width = "100%";
    youBar.style.width = percent + "%";

    // Update savings message
    difference.textContent =
        "You save ৳" + savings.toFixed(0) + " on BookLoop!";
}

// Listen for changes
originalPrice.addEventListener("input", updateCalculator);
discountPercent.addEventListener("input", updateCalculator);

// Initial calculation
updateCalculator();

console.log("BookLoop Price Calculator is working!");