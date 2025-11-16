function loadGoogleAnalytics() {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-D7LL8CESG0";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag("js", new Date());
    gtag("config", "G-D7LL8CESG0");
}

const consent = localStorage.getItem("cookie_consent");

if (consent === "accepted") {
    loadGoogleAnalytics();
    document.getElementById("cookie-banner").style.display = "none";
} else if (consent === "rejected") {
    document.getElementById("cookie-banner").style.display = "none";
}

document.getElementById("accept-cookies").onclick = () => {
    localStorage.setItem("cookie_consent", "accepted");
    loadGoogleAnalytics();
    document.getElementById("cookie-banner").style.display = "none";
};

document.getElementById("reject-cookies").onclick = () => {
    localStorage.setItem("cookie_consent", "rejected");
    document.getElementById("cookie-banner").style.display = "none";
};
