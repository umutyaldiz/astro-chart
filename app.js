export default class AstroChart {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.size = this.canvas.width;
        this.center = this.size / 2;
        this.radius = this.canvas.width / 2;

        this.rings = {
            cover: this.center * 0.32,
            inner: this.center * 0.32,
            icon: this.center * 0.5,
            label: this.center * 0.88,
            outer: this.center * 0.99,
        };
        this.options = options;
        this.zodiacData = options.zodiacData || [];
        this.hoverIndex = -1;

        this.init();
        this.addEvents();
    }

    init() {
        this.canvas.style.cursor = "default";
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.size, this.size);

        this.drawSlices();
        this.drawRings();
        this.drawZodiacs();
    }

    drawRings() {
        Object.values(this.rings).forEach((radius, index) => {
            this.ctx.beginPath();
            this.ctx.arc(this.center, this.center, radius, 0, Math.PI * 2);

            if (index === 0) {
                this.ctx.fillStyle = "#000000";
                this.ctx.fill();

                if (this.options.logo) {
                    const logo = new Image();
                    logo.src = this.options.logo;
                    logo.onload = () => {
                        const logoSize = 120;
                        this.ctx.drawImage(logo, this.center - logoSize / 2, this.center - logoSize / 2, logoSize, logoSize);
                    };
                }

            } else {
                this.ctx.strokeStyle = "#FFFFFF";
            }
            this.ctx.stroke();
        });
    }

    drawSlices() {
        const step = (2 * Math.PI) / this.zodiacData.length;

        for (let i = 0, length = this.zodiacData.length; i < length; i++) {
            const startAngle = step * i - Math.PI / 2;
            const endAngle = startAngle + step;

            if (this.hoverIndex === i) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.center, this.center);
                this.ctx.arc(this.center, this.center, this.rings.outer, startAngle, endAngle);
                this.ctx.closePath();
                this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                this.ctx.fill();
            }

            this.ctx.beginPath();
            this.ctx.moveTo(this.center, this.center);
            this.ctx.lineTo(
                this.center + this.rings.outer * Math.cos(startAngle),
                this.center + this.rings.outer * Math.sin(startAngle)
            );

            this.ctx.strokeStyle = "#ffffff";
            this.ctx.stroke();
        }
    }

    drawZodiacs() {
        const step = (2 * Math.PI) / this.zodiacData.length;

        this.zodiacData.forEach((zodiac, index) => {
            const angle = step * index + step / 2 - Math.PI / 2;

            // Symbol
            if (zodiac.symbol) {
                this.ctx.font = "20px Poppins";
                this.ctx.fillStyle = "#fff";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(
                    zodiac.symbol,
                    this.center + (this.rings.inner * 1.30) * Math.cos(angle),
                    this.center + (this.rings.inner * 1.30) * Math.sin(angle)
                );
            }

            // Icon
            if (zodiac.icon) {
                const img = new Image();
                img.src = zodiac.icon;
                img.onload = () => {
                    const x = this.center + (this.rings.icon * 1.40) * Math.cos(angle) - 25;
                    const y = this.center + (this.rings.icon * 1.40) * Math.sin(angle) - 25;

                    this.ctx.drawImage(img, x, y, 50, 50);
                };
            }

            // Label
            if (zodiac.name) {
                this.ctx.save();
                let x = this.center + this.radius * Math.cos(angle);
                let y = this.center + this.radius * Math.sin(angle);
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + Math.PI / 2);
                this.ctx.font = "bold 15px Poppins";
                this.ctx.fillStyle = "#fff";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillText(
                    zodiac.name,
                    0, 23
                );
                this.ctx.restore();
            }

        });
    }

    getHoveredIndex(mouseX, mouseY) {
        const dx = mouseX - this.center;
        const dy = mouseY - this.center;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.rings.outer || distance < this.rings.inner) return -1;

        const angle = Math.atan2(dy, dx);
        const normalizedAngle = (angle + 2 * Math.PI + Math.PI / 2) % (2 * Math.PI);
        const step = (2 * Math.PI) / this.zodiacData.length;
        return Math.floor(normalizedAngle / step);
    }

    addEvents() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const index = this.getHoveredIndex(mouseX, mouseY);
            if (index !== this.hoverIndex) {
                this.hoverIndex = index;
                this.canvas.style.cursor = index !== -1 ? "pointer" : "default";
                this.draw();
            }
        });

        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const index = this.getHoveredIndex(mouseX, mouseY);
            if (index !== -1) {
                const url = this.zodiacData[index].url;
                if (url) {
                    const a = document.createElement("a");
                    a.href = url;
                    a.target = "_blank";
                    a.rel = "noopener noreferrer";
                    a.click();
                }
            }
        });
    }
}


const zodiacData = [
    { name: "Oğlak", icon: "icons/balik.svg", symbol: "♑︎", url: "/oglak" },
    { name: "Yay", icon: "icons/yay.svg", symbol: "♐︎", url: "/yay" },
    { name: "Akrep", icon: "icons/akrep.svg", symbol: "♏︎", url: "/akrep" },
    { name: "Terazi", icon: "icons/terazi.svg", symbol: "♎︎", url: "/terazi" },
    { name: "Başak", icon: "icons/basak.svg", symbol: "♍︎", url: "/basak" },
    { name: "Aslan", icon: "icons/aslan.svg", symbol: "♌︎", url: "/aslan" },
    { name: "Yengeç", icon: "icons/yengec.svg", symbol: "♋︎", url: "/yengec" },
    { name: "İkizler", icon: "icons/ikizler.svg", symbol: "♊︎", url: "/ikizler" },
    { name: "Boğa", icon: "icons/boga.svg", symbol: "♉︎", url: "/boga" },
    { name: "Koç", icon: "icons/koc.svg", symbol: "♈︎", url: "/koc" },
    { name: "Kova", icon: "icons/kova.svg", symbol: "♒︎", url: "/kova" },
    { name: "Balık", icon: "icons/balik.svg", symbol: "♓︎", url: "/balik" },
];

document.addEventListener('DOMContentLoaded', function () {
    const chart = new AstroChart("astroChart", {
        logo: 'icons/default.svg',
        zodiacData
    });
});