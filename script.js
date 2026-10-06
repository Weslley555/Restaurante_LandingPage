(function () {
    "use strict";

    var GA_ID = "G-5WRWWNTSXB";
    var CONSENT_KEY = "terreiro.analytics.consent";
    var consentMemory = null;
    var analyticsConfigured = false;
    var pendingEvents = [];
    var viewedServices = new Set();
    var serviceSections = [];
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function initializeReveals() {
        if (reducedMotion.matches || !("IntersectionObserver" in window)) {
            return;
        }

        var elements = Array.from(document.querySelectorAll("[data-reveal]"));
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                // Preserva a leitura ao navegar diretamente por âncoras ou pelo teclado.
                if (entry.boundingClientRect.top > 0 && !entry.target.closest(":target") && !entry.target.contains(document.activeElement)) {
                    entry.target.classList.add("revelado");
                }
                observer.unobserve(entry.target);
            });
        }, { threshold: 0, rootMargin: "0px 0px 48px 0px" });

        document.addEventListener("animationend", function (event) {
            if (event.animationName.indexOf("revelar") !== 0) return;
            var revealed = event.target.closest("[data-reveal]");
            if (revealed) revealed.classList.remove("revelado");
        });
        document.addEventListener("focusin", function (event) {
            var element = event.target.closest("[data-reveal].revelado");
            if (element) element.classList.remove("revelado");
        });
        elements.forEach(function (element) { observer.observe(element); });
        reducedMotion.addEventListener("change", function () {
            if (!reducedMotion.matches) return;
            observer.disconnect();
            elements.forEach(function (element) { element.classList.remove("revelado"); });
        });
    }

    function initializeNavigation() {
        var header = document.querySelector(".cabecalho-site");
        if (!header) return;

        var links = Array.from(header.querySelectorAll('.navegacao-principal a[href^="#"]'));
        var sections = links.map(function (link) {
            return document.getElementById(link.hash.slice(1));
        });
        var scheduled = false;
        var current = -1;

        function updateNavigation() {
            scheduled = false;
            var marker = header.getBoundingClientRect().height + window.innerHeight * 0.22;
            var next = -1;
            sections.forEach(function (section, index) {
                if (section && section.getBoundingClientRect().top <= marker) next = index;
            });
            if (window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
                next = sections.length - 1;
            }
            header.classList.toggle("com-rolagem", window.scrollY > 24);
            if (next === current) return;
            current = next;
            links.forEach(function (link, index) {
                if (index === current) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
        }

        function scheduleUpdate() {
            if (scheduled) return;
            scheduled = true;
            window.requestAnimationFrame(updateNavigation);
        }

        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate);
        scheduleUpdate();
    }

    function readConsent() {
        try {
            var saved = window.localStorage.getItem(CONSENT_KEY);
            return saved === "granted" || saved === "denied" ? saved : consentMemory;
        } catch (error) {
            return consentMemory;
        }
    }

    function saveConsent(value) {
        consentMemory = value;
        try {
            window.localStorage.setItem(CONSENT_KEY, value);
            window.localStorage.removeItem("cookiesAceitos");
        } catch (error) {
            return;
        }
    }

    function hasAnalyticsConsent() {
        return readConsent() === "granted";
    }

    function ensureGtag() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
        };
    }

    function flushPendingEvents() {
        if (!analyticsConfigured || !hasAnalyticsConsent() || typeof window.gtag !== "function") {
            return;
        }

        pendingEvents.splice(0).forEach(function (eventData) {
            window.gtag("event", eventData.name, eventData.parameters);
        });
    }

    function configureAnalytics() {
        if (analyticsConfigured || !hasAnalyticsConsent()) {
            return;
        }

        ensureGtag();
        window.gtag("js", new Date());
        window.gtag("config", GA_ID, { send_page_view: true });
        analyticsConfigured = true;
        flushPendingEvents();
    }

    function loadAnalytics() {
        if (!hasAnalyticsConsent()) {
            return;
        }

        window["ga-disable-" + GA_ID] = false;
        ensureGtag();
        window.gtag("consent", "update", { analytics_storage: "granted" });

        if (analyticsConfigured) {
            flushPendingEvents();
            return;
        }

        var existingScript = document.querySelector("script[data-terreiro-analytics]");
        if (existingScript) {
            if (existingScript.dataset.loaded === "true") {
                configureAnalytics();
            } else {
                existingScript.addEventListener("load", configureAnalytics, { once: true });
            }
            return;
        }

        var analyticsScript = document.createElement("script");
        analyticsScript.async = true;
        analyticsScript.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
        analyticsScript.dataset.terreiroAnalytics = "true";
        analyticsScript.addEventListener("load", function () {
            analyticsScript.dataset.loaded = "true";
            configureAnalytics();
        }, { once: true });
        document.head.appendChild(analyticsScript);
    }

    function expireAnalyticsCookies() {
        var cookieNames = document.cookie.split(";").map(function (cookie) {
            return cookie.trim().split("=")[0];
        }).filter(function (name) {
            return name === "_gid" || name.indexOf("_ga") === 0 || name.indexOf("_gat") === 0;
        });

        var hostname = window.location.hostname;
        var domainParts = hostname ? hostname.split(".") : [];
        var domains = [""];

        for (var index = 0; index < domainParts.length - 1; index += 1) {
            domains.push("." + domainParts.slice(index).join("."));
        }

        cookieNames.forEach(function (name) {
            domains.forEach(function (domain) {
                var domainAttribute = domain ? "; domain=" + domain : "";
                document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax" + domainAttribute;
            });
        });
    }

    function disableAnalytics() {
        window["ga-disable-" + GA_ID] = true;
        pendingEvents.length = 0;
        if (typeof window.gtag === "function") {
            window.gtag("consent", "update", { analytics_storage: "denied" });
        }
        expireAnalyticsCookies();
    }

    function trackEvent(name, parameters) {
        if (!hasAnalyticsConsent()) {
            return;
        }

        var eventData = {
            name: name,
            parameters: Object.assign({ project_context: "portfolio_demo" }, parameters || {})
        };

        if (!analyticsConfigured) {
            pendingEvents.push(eventData);
            loadAnalytics();
            return;
        }

        window.gtag("event", eventData.name, eventData.parameters);
    }

    function trackServiceView(section) {
        var service = section && section.dataset.viewService;
        if (!service || viewedServices.has(service) || !hasAnalyticsConsent()) {
            return;
        }

        viewedServices.add(service);
        trackEvent("view_service", {
            service_name: service,
            demo_interaction: true,
            non_interaction: true
        });
    }

    function measureVisibleServices() {
        serviceSections.forEach(function (section) {
            var rect = section.getBoundingClientRect();
            var visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
            if (visibleHeight > Math.min(rect.height * 0.35, 260)) {
                trackServiceView(section);
            }
        });
    }

    function initializeServiceTracking() {
        serviceSections = Array.from(document.querySelectorAll("[data-view-service]"));
        if (!serviceSections.length) {
            return;
        }

        if (!("IntersectionObserver" in window)) {
            measureVisibleServices();
            window.addEventListener("scroll", measureVisibleServices, { passive: true });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    trackServiceView(entry.target);
                }
            });
        }, { threshold: 0.4 });

        serviceSections.forEach(function (section) {
            observer.observe(section);
        });
    }

    function initializeTabs() {
        document.querySelectorAll("[data-tabs]").forEach(function (tabsComponent) {
            var tabs = Array.from(tabsComponent.querySelectorAll('[role="tab"]'));
            if (!tabs.length) {
                return;
            }

            function activateTab(nextTab, shouldFocus, shouldTrack) {
                var changed = nextTab.getAttribute("aria-selected") !== "true";

                tabs.forEach(function (tab) {
                    var panel = document.getElementById(tab.getAttribute("aria-controls"));
                    var selected = tab === nextTab;
                    tab.classList.toggle("ativo", selected);
                    tab.setAttribute("aria-selected", String(selected));
                    tab.tabIndex = selected ? 0 : -1;
                    if (panel) {
                        panel.hidden = !selected;
                    }
                });

                if (shouldFocus) {
                    nextTab.focus();
                }

                if (changed && shouldTrack) {
                    trackEvent("select_lunch_day", {
                        lunch_day: nextTab.dataset.lunchDay,
                        demo_interaction: true
                    });
                }
            }

            tabs.forEach(function (tab, index) {
                tab.addEventListener("click", function () {
                    activateTab(tab, false, true);
                });

                tab.addEventListener("keydown", function (event) {
                    var nextIndex = null;
                    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
                    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
                    if (event.key === "Home") nextIndex = 0;
                    if (event.key === "End") nextIndex = tabs.length - 1;
                    if (nextIndex === null) return;
                    event.preventDefault();
                    activateTab(tabs[nextIndex], true, true);
                });
            });
        });
    }

    function initializeCarousels() {
        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var track = carousel.querySelector("[data-carousel-track]");
            var slides = track ? Array.from(track.children) : [];
            var previous = carousel.querySelector("[data-carousel-prev]");
            var next = carousel.querySelector("[data-carousel-next]");
            var status = carousel.querySelector("[data-carousel-status]");
            var currentIndex = 0;
            var touchStartX = 0;
            var touchStartY = 0;

            if (!track || !slides.length || !previous || !next) {
                return;
            }

            function showSlide(index) {
                currentIndex = (index + slides.length) % slides.length;
                track.style.transform = "translateX(-" + currentIndex * 100 + "%)";
                slides.forEach(function (slide, slideIndex) {
                    slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
                });
                if (status) {
                    status.textContent = "Foto " + (currentIndex + 1) + " de " + slides.length;
                }
            }

            previous.addEventListener("click", function () { showSlide(currentIndex - 1); });
            next.addEventListener("click", function () { showSlide(currentIndex + 1); });
            carousel.addEventListener("keydown", function (event) {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                showSlide(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
            });

            track.addEventListener("touchstart", function (event) {
                if (event.touches.length !== 1) return;
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            }, { passive: true });

            track.addEventListener("touchend", function (event) {
                if (!event.changedTouches.length) return;
                var deltaX = event.changedTouches[0].clientX - touchStartX;
                var deltaY = event.changedTouches[0].clientY - touchStartY;
                if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
                    showSlide(currentIndex + (deltaX < 0 ? 1 : -1));
                }
            }, { passive: true });

            showSlide(0);
        });
    }

    function initializePortfolioModal() {
        var modal = document.getElementById("modal-portfolio");
        var closeButton = document.getElementById("btn-fechar-modal");
        var pageContent = document.getElementById("conteudo-pagina");
        var triggers = document.querySelectorAll("[data-portfolio]");
        var lastTrigger = null;
        var closeTimer = null;
        var closing = false;

        if (!modal || !closeButton || !pageContent || !triggers.length) {
            return;
        }

        function setBackgroundDisabled(disabled) {
            if ("inert" in pageContent) {
                pageContent.inert = disabled;
            } else if (disabled) {
                pageContent.setAttribute("aria-hidden", "true");
            } else {
                pageContent.removeAttribute("aria-hidden");
            }
        }

        function openModal(trigger) {
            window.clearTimeout(closeTimer);
            closing = false;
            modal.classList.remove("modal-fechando");
            lastTrigger = trigger;
            modal.hidden = false;
            modal.setAttribute("aria-hidden", "false");
            setBackgroundDisabled(true);
            document.body.classList.add("modal-aberto");
            closeButton.focus();

            trackEvent("click_demo_cta", {
                service_name: trigger.dataset.service || "nao_informado",
                service_option: trigger.dataset.serviceOption || "nao_informada",
                cta_position: trigger.dataset.ctaPosition || "nao_informada",
                demo_interaction: true
            });
            trackEvent("open_portfolio_modal", {
                service_name: trigger.dataset.service || "nao_informado",
                service_option: trigger.dataset.serviceOption || "nao_informada",
                demo_interaction: true
            });
        }

        function finishClose() {
            if (!closing) return;
            window.clearTimeout(closeTimer);
            closing = false;
            modal.hidden = true;
            modal.classList.remove("modal-fechando");
            modal.setAttribute("aria-hidden", "true");
            setBackgroundDisabled(false);
            document.body.classList.remove("modal-aberto");
            if (lastTrigger && lastTrigger.isConnected) {
                lastTrigger.focus({ preventScroll: true });
            }
        }

        function closeModal() {
            if (modal.hidden || closing) return;
            closing = true;
            if (reducedMotion.matches) {
                finishClose();
                return;
            }
            modal.classList.add("modal-fechando");
            // Mantém o foco contido até a saída terminar; o timer cobre animações interrompidas.
            closeTimer = window.setTimeout(finishClose, 240);
        }

        modal.addEventListener("animationend", function (event) {
            if (event.target === modal) finishClose();
        });
        reducedMotion.addEventListener("change", function () {
            if (reducedMotion.matches) finishClose();
        });

        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function (event) {
                event.preventDefault();
                openModal(trigger);
            });
        });
        closeButton.addEventListener("click", closeModal);
        modal.addEventListener("click", function (event) {
            if (event.target === modal) closeModal();
        });
        modal.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
                return;
            }
            if (event.key !== "Tab") return;
            var focusable = Array.from(modal.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
            if (!focusable.length) return;
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }

    function initializeCookiePreferences() {
        var banner = document.getElementById("aviso-cookies");
        var acceptButton = document.getElementById("btn-aceitar-cookies");
        var rejectButton = document.getElementById("btn-recusar-cookies");
        var preferenceButtons = document.querySelectorAll("[data-cookie-preferences]");

        if (!banner || !acceptButton || !rejectButton) {
            return;
        }

        function showPreferences() {
            banner.hidden = false;
            acceptButton.focus();
        }

        function hidePreferences() {
            banner.hidden = true;
        }

        acceptButton.addEventListener("click", function () {
            saveConsent("granted");
            loadAnalytics();
            hidePreferences();
            measureVisibleServices();
        });

        rejectButton.addEventListener("click", function () {
            saveConsent("denied");
            disableAnalytics();
            hidePreferences();
        });

        preferenceButtons.forEach(function (button) {
            button.addEventListener("click", showPreferences);
        });

        var consent = readConsent();
        if (consent === "granted") {
            loadAnalytics();
        } else {
            disableAnalytics();
        }
        banner.hidden = consent !== null;
    }

    document.addEventListener("DOMContentLoaded", function () {
        initializeTabs();
        initializeCarousels();
        initializePortfolioModal();
        initializeServiceTracking();
        initializeCookiePreferences();
        initializeNavigation();
        initializeReveals();
    });
}());
