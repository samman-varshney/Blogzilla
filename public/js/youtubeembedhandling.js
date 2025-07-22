// YouTube embed handling
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("oembed[url]").forEach(el => {
            const url = el.getAttribute("url");
            const ytMatch = url.match(/youtube\.com\/watch\?v=([^&]+)(?:&t=(\d+)s)?/);
            
            if (ytMatch) {
                const videoId = ytMatch[1];
                const start = ytMatch[2] ? `?start=${ytMatch[2]}` : '';
                const iframe = document.createElement("iframe");
                
                iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}${start}`);
                iframe.setAttribute("frameborder", "0");
                iframe.setAttribute("allowfullscreen", "");
                iframe.style.width = "100%";
                iframe.style.aspectRatio = "16/9";
                iframe.style.borderRadius = "8px";
                iframe.style.margin = "1.5rem 0";
                
                el.parentNode.replaceChild(iframe, el);
            }
        });
    });