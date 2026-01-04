// API Service for Dynamic Content Management
class APIService {
    constructor() {
      this.baseURL = "https://api-admin.optisystemhub.net/api/v1";
      this.imageBaseURL = "https://api-admin.optisystemhub.net";
      // this.baseURL = "http://localhost:3001/api/v1";
      // this.imageBaseURL = "http://localhost:3001";
      this.currentLanguage = localStorage.getItem("selectedLanguage") || "en";
      this.cache = new Map();
    }

    // Fetch unified data from API
    async fetchUnifiedData() {
        try {
            const cacheKey = `unified-data-${this.currentLanguage}`;
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const response = await fetch(`${this.baseURL}/unified-data/data`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            // Extract data from the response structure
            const data = responseData.data || responseData;
            
            // Cache the data
            this.cache.set(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error('Error fetching unified data:', error);
            return null;
        }
    }

    // Get content for specific section and language
    getSectionContent(data, sectionName, language = this.currentLanguage) {
        if (!data || !data[sectionName]) {
            return null;
        }

        const sectionData = data[sectionName];
        
        if (!sectionData.content) {
            return null;
        }
        
        // Find content for current language
        const content = sectionData.content.find(item => 
            item.language && item.language.name === language
        );

        // Fallback to first available language if current not found
        return content || sectionData.content[0] || null;
    }

    // Get general settings
    getGeneralSettings(data) {
        // Structure: data.general_settings.content is an object containing:
        // - content: array of multilingual content
        // - store_email, store_phone, facebook_pixel_id, etc. (settings not in content array)
        const generalSettingsObj = data?.general_settings?.content;
        if (!generalSettingsObj) {
            return null;
        }
        
        // Get content array (multilingual content)
        const contentArray = generalSettingsObj.content;
        if (!Array.isArray(contentArray) || contentArray.length === 0) {
            return null;
        }
        
        // Get content for current language
        const currentLang = this.currentLanguage === 'ar' ? 2 : 1; // Assuming 1=en, 2=ar
        const languageContent = contentArray.find(c => c.language_id === currentLang) || contentArray[0];
        return {
            content: languageContent,
            store_email: generalSettingsObj.store_email,
            store_phone: generalSettingsObj.store_phone,
            gtm_container_id: generalSettingsObj.gtm_container_id,
            google_analytics_id: generalSettingsObj.google_analytics_id,
            facebook_pixel_id: generalSettingsObj.facebook_pixel_id,
            snapchat_pixel_id: generalSettingsObj.snapchat_pixel_id,
            init_tiktok_id: generalSettingsObj.init_tiktok_id,
            gtm_enabled: generalSettingsObj.gtm_enabled,
            google_analytics_enabled: generalSettingsObj.google_analytics_enabled,
            facebook_pixel_enabled: generalSettingsObj.facebook_pixel_enabled,
            snapchat_pixel_enabled: generalSettingsObj.snapchat_pixel_enabled,
            init_tiktok_enabled: generalSettingsObj.init_tiktok_enabled,
            facebook_url: generalSettingsObj.facebook_url,
            instagram_url: generalSettingsObj.instagram_url,
            twitter_url: generalSettingsObj.twitter_url,
            maintenance_mode: generalSettingsObj.maintenance_mode
        };
    }

    // Update current language
    setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('selectedLanguage', language);
        // Clear cache when language changes
        this.cache.clear();
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Content Manager for handling dynamic content
class ContentManager {
    constructor(apiService) {
        this.api = apiService;
        this.data = null;
    }

    // Initialize content manager
    async init() {
        this.data = await this.api.fetchUnifiedData();
        
        if (this.data) {
            this.updateAllSections();
        }
    }

    // Update all sections with dynamic content
    updateAllSections() {
        this.updateGeneralSettings();
        this.buildSectionOne(); // Hero/Banner section
        this.buildSectionTwo(); // Hosting plans
        this.buildSectionThree(); // Business boost section
        this.buildSectionFour(); // Features section
        this.buildSectionFive(); // Questionnaire section
        this.buildVideoSection(); // Video section
        this.buildPartners(); // Partners section
        this.buildSubfooter(); // Subfooter section
    }

    // Update general settings (meta, contact info, etc.)
    updateGeneralSettings() {
        const settings = this.api.getGeneralSettings(this.data);
        if (!settings || !settings.content) {
            return;
        }

        const content = settings.content;
        const imageBaseURL = this.api.imageBaseURL;

        // Check maintenance mode
        if (settings.maintenance_mode) {
            this.showMaintenanceMode(content.maintenance_message || 'Site is under maintenance');
            return;
        }

        // Update page title
        if (content.meta_title) {
            document.title = content.meta_title;
        } else if (content.store_name) {
            document.title = content.store_name;
        }

        // Update favicon
        if (content.meta_favicon) {
            this.updateFavicon(`${imageBaseURL}${content.meta_favicon}`);
        }

        // Update logo
        if (content.logo) {
            this.updateLogo(`${imageBaseURL}${content.logo}`);
        }

        // Update all meta tags
        this.updateMetaTags(content, imageBaseURL);

        // Update contact info in footer
        this.updateContactInfo(settings);

        // Update social media links
        this.updateSocialMediaLinks(settings);

        // Add tracking scripts
        this.addTrackingScripts(settings);
    }

    // Update favicon
    updateFavicon(faviconUrl) {
        // Remove existing favicon links
        document.querySelectorAll('link[rel*="icon"]').forEach(link => {
            if (!link.rel.includes('apple-touch-icon')) {
                link.remove();
            }
        });

        // Add new favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
    }

    // Update logo
    updateLogo(logoUrl) {
        // Update header logo
        const headerLogo = document.querySelector('.navbar-brand img');
        if (headerLogo) {
            headerLogo.src = logoUrl;
            headerLogo.alt = 'logo';
        }

        // Update footer logo
        const footerLogo = document.querySelector('.footer-logo-con figure img');
        if (footerLogo) {
            footerLogo.src = logoUrl;
            footerLogo.alt = 'footer-logo';
        }
    }

    // Update all meta tags
    updateMetaTags(content, imageBaseURL) {
        // Basic meta tags
        this.setOrCreateMeta('description', content.meta_description || '');
        this.setOrCreateMeta('keywords', content.meta_keywords || '');
        this.setOrCreateMeta('author', content.meta_author || '');
        this.setOrCreateMeta('robots', content.meta_robots || '');
        
        // Canonical
        if (content.meta_canonical) {
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                document.head.appendChild(canonical);
            }
            canonical.href = content.meta_canonical;
        }

        // Open Graph meta tags
        this.setOrCreateMeta('og:title', content.meta_og_title || content.meta_title || content.store_name || '');
        this.setOrCreateMeta('og:description', content.meta_og_description || content.meta_description || '');
        this.setOrCreateMeta('og:image', content.meta_og_image ? `${imageBaseURL}${content.meta_og_image}` : (content.meta_image ? `${imageBaseURL}${content.meta_image}` : ''));
        this.setOrCreateMeta('og:url', content.meta_og_url || window.location.href);
        this.setOrCreateMeta('og:type', content.meta_og_type || 'website');
        this.setOrCreateMeta('og:locale', content.meta_og_locale || 'en_US');
        this.setOrCreateMeta('og:site_name', content.meta_og_site_name || content.store_name || '');

        // Twitter Card meta tags
        this.setOrCreateMeta('twitter:card', 'summary_large_image');
        this.setOrCreateMeta('twitter:title', content.meta_og_title || content.meta_title || content.store_name || '');
        this.setOrCreateMeta('twitter:description', content.meta_og_description || content.meta_description || '');
        this.setOrCreateMeta('twitter:image', content.meta_og_image ? `${imageBaseURL}${content.meta_og_image}` : (content.meta_image ? `${imageBaseURL}${content.meta_image}` : ''));
    }

    // Helper to set or create meta tag
    setOrCreateMeta(name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            if (name.startsWith('og:') || name.startsWith('twitter:')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    // Show maintenance mode
    showMaintenanceMode(message) {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 20px;">
                <div>
                    <h1 style="font-size: 48px; margin-bottom: 20px;">Maintenance Mode</h1>
                    <p style="font-size: 24px;">${message}</p>
                </div>
            </div>
        `;
    }

    // Update contact information
    updateContactInfo(settings) {
        // Update phone
        if (settings.store_phone) {
            const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
            phoneLinks.forEach(link => {
                link.href = `tel:${settings.store_phone}`;
                link.textContent = settings.store_phone;
            });
        }

        // Update email
        if (settings.store_email) {
            const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
            emailLinks.forEach(link => {
                link.href = `mailto:${settings.store_email}`;
                link.textContent = settings.store_email;
            });
        }

        // Update store address if needed
        if (settings.content && settings.content.store_address) {
            // You can update address display if you have an element for it
            const addressElements = document.querySelectorAll('[data-store-address]');
            addressElements.forEach(el => {
                el.textContent = settings.content.store_address;
            });
        }
    }

    // Update social media links
    updateSocialMediaLinks(settings) {
        const socialContainer = document.querySelector('.footer-logo-con ul');
        if (!socialContainer) return;

        // Clear existing social links
        socialContainer.innerHTML = '';

        // Add Facebook
        if (settings.facebook_url) {
            const facebookLi = document.createElement('li');
            facebookLi.innerHTML = `<a target="_blank" href="${settings.facebook_url}"><i class="fab fa-facebook"></i></a>`;
            socialContainer.appendChild(facebookLi);
        }

        // Add Instagram
        if (settings.instagram_url) {
            const instagramLi = document.createElement('li');
            instagramLi.innerHTML = `<a target="_blank" href="${settings.instagram_url}"><i class="fab fa-instagram"></i></a>`;
            socialContainer.appendChild(instagramLi);
        }

        // Add Twitter
        if (settings.twitter_url) {
            const twitterLi = document.createElement('li');
            twitterLi.innerHTML = `<a target="_blank" href="${settings.twitter_url}"><i class="fab fa-twitter"></i></a>`;
            socialContainer.appendChild(twitterLi);
        }
    }

    // Add tracking scripts
    addTrackingScripts(settings) {
        // Google Tag Manager
        if (settings.gtm_enabled && settings.gtm_container_id) {
            this.addGTMScript(settings.gtm_container_id);
        }

        // Google Analytics
        if (settings.google_analytics_enabled && settings.google_analytics_id) {
            this.addGoogleAnalyticsScript(settings.google_analytics_id);
        }

        // Facebook Pixel
        if (settings.facebook_pixel_enabled && settings.facebook_pixel_id) {
            this.addFacebookPixelScript(settings.facebook_pixel_id);
        }

        // Snapchat Pixel
        if (settings.snapchat_pixel_enabled && settings.snapchat_pixel_id) {
            this.addSnapchatPixelScript(settings.snapchat_pixel_id);
        }

        // TikTok Pixel
        if (settings.init_tiktok_enabled && settings.init_tiktok_id) {
            this.addTikTokPixelScript(settings.init_tiktok_id);
        }
    }

    // Add Google Tag Manager
    addGTMScript(containerId) {
        // GTM Script in head
        const gtmScript = document.createElement('script');
        gtmScript.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${containerId}');
        `;
        document.head.appendChild(gtmScript);

        // GTM noscript in body
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(gtmNoscript, document.body.firstChild);
    }

    // Add Google Analytics
    addGoogleAnalyticsScript(gaId) {
        const gaScript1 = document.createElement('script');
        gaScript1.async = true;
        gaScript1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(gaScript1);

        const gaScript2 = document.createElement('script');
        gaScript2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
        `;
        document.head.appendChild(gaScript2);
    }

    // Add Facebook Pixel
    addFacebookPixelScript(pixelId) {
        const fbScript = document.createElement('script');
        fbScript.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
        `;
        document.head.appendChild(fbScript);

        const fbNoscript = document.createElement('noscript');
        fbNoscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
        document.body.appendChild(fbNoscript);
    }

    // Add Snapchat Pixel
    addSnapchatPixelScript(pixelId) {
        const snapScript = document.createElement('script');
        snapScript.innerHTML = `
            (function() {
                var s = document.createElement('script');
                s.src = 'https://sc-static.net/scevent.min.js';
                s.async = true;
                s.onload = function() {
                    if (typeof snap !== 'undefined' && snap.pixel) {
                        snap.pixel.init('${pixelId}', {}, {});
                        snap.pixel.track('PAGE_VIEW');
                    }
                };
                var firstScript = document.getElementsByTagName('script')[0];
                firstScript.parentNode.insertBefore(s, firstScript);
            })();
        `;
        document.head.appendChild(snapScript);
    }

    // Add TikTok Pixel
    addTikTokPixelScript(pixelId) {
        const tiktokScript = document.createElement('script');
        tiktokScript.innerHTML = `
            !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load('${pixelId}');
                ttq.page();
            }(window, document, 'ttq');
        `;
        document.head.appendChild(tiktokScript);
    }

    // Build Section One (Hero/Banner) - Dynamic HTML
    buildSectionOne() {
      const content = this.api.getSectionContent(this.data, 'section_one');
        if (!content) return;

        // Clear existing content
      const bannerInner = document.querySelector(
        ".section-one .banner-inner-con"
      );
      
      if (bannerInner) bannerInner.innerHTML = "";

        // Build dynamic HTML
        const bannerHTML = `
            <div class="banner-content-con">
                <ul class="list-unstyled">
                    ${
                      content.features
                        ? content.features
                            .map((feature) => `<li>${feature}</li>`)
                            .join("")
                        : ""
                    }
                </ul>
                <h1>${
                  content.title || "Best Web Hosting Service Provider."
                }</h1>
                <p>${
                  content.description ||
                  "For plenty of power and room to grow, go Dedicated and get the whole box to yourself."
                }</p>
                <div class="banner-link-con generic-btn">
                    <div class="banner-cta-btn">
                        <a href="#" id="banner-get-started-btn" class="get-started-btn">Get Started</a>
                    </div>
                    ${
                      content.discount_percentage
                        ? `
                        <div class="banner-off-con">
                            <div class="percent-off">${
                              content.discount_percentage
                            } <span>%</span></div>
                            <div class="off-txt">
                                <span class="d-block">${
                                  content.discount_label || "OFF"
                                }</span>
                                <small class="d-block">LIMITED</small>
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
            <div class="banner-img-con">
                <figure class="mb-0 graph-img">
                    <img src="assets/images/revenue-graph-img.png" alt="revenue-graph-img">
                </figure>
                <figure class="mb-0 man-with-laptop-img">
                    <img src="${
                      this.api.imageBaseURL + "/" + content.main_image ||
                      "assets/images/man-with-laptop-banner-img.png"
                    }" alt="man-with-laptop-banner-img">
                </figure>
            </div>
        `;

        if (bannerInner) {
            bannerInner.innerHTML = bannerHTML;
            
            // Update button text based on current language
            const currentLang = this.api.getCurrentLanguage();
            const $getStartedBtn = $('#banner-get-started-btn');
            if ($getStartedBtn.length) {
                if (currentLang === 'ar') {
                    $getStartedBtn.text('ابدأ الآن');
                } else {
                    $getStartedBtn.text('Get Started');
                }
            }
        }
    }

    // Build Section Two (Hosting Plans) - Dynamic HTML
    buildSectionTwo() {
        const content = this.api.getSectionContent(this.data, 'section_two');
        if (!content) return;

        // Clear existing content
        const hostingInner = document.querySelector(".section-two");
        if (hostingInner) hostingInner.innerHTML = "";

        // Get current language for currency symbol
        const currentLang = this.api.getCurrentLanguage() || localStorage.getItem('selectedLanguage') || 'en';
        const currencySymbol = currentLang === 'ar' ? 'ج.م' : 'EGP';

        // Build dynamic HTML - Exact original structure
        const hostingHTML = `
            <div class="container">
                <div class="generic-title text-center wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                    <h2>${content.title || 'Choose Your Hosting Plan'}</h2>
                    <p>${content.description || 'Reprehenderit in voluptate velit esse cillum dolore fugiat nulla beatae vitae zeicra'}</p>
                </div>
                <div class="hosting-types-inner-con wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                    ${content.plans ? content.plans.map((plan, index) => `
                        <div class="hosting-type-box">
                            <figure>
                                <img src="assets/images/hosting-type-img${index + 1}.png" alt="hosting-type-img${index + 1}">
                            </figure>
                            <h6>${plan.plan_name || 'Shared Hosting'}</h6>
                            <div class="hosting-price-box">
                                <span class="dollar">${currencySymbol}</span> <span id="price_val${index + 2}" class="numeric1">${plan.price || '12'}</span>
                                <div class="month-title">
                                    <span id="point_val${index + 2}" class="numeric2">${plan.price_cents || '.99'}</span>
                                    <small>/month</small>
                                </div>
                            </div>
                            <p>${plan.plan_description || 'Fastest SSD based web hosting platform for your website.'}</p>
                            <ul class="list-unstyled">
                                ${plan.features ? plan.features.map(feature => `
                                    <li class="position-relative"><i class="fas fa-check"></i> ${feature}</li>
                                `).join('') : ''}
                            </ul>
                            <div class="generic-btn">
                                <a href="#" class="order-now-btn">Start</a>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;

        if (hostingInner) {
            hostingInner.innerHTML = hostingHTML;
            
            // Update button text based on current language
            const currentLang = this.api.getCurrentLanguage();
            const $orderBtns = $('.order-now-btn');
            $orderBtns.each(function() {
                if (currentLang === 'ar') {
                    $(this).text('ابدأ بارضك');
                } else {
                    $(this).text('Start Now');
                }
            });
        }
    }

    // Update hosting plans
    updateHostingPlans(plans) {
        const planBoxes = document.querySelectorAll('.hosting-type-box');
        
        plans.forEach((plan, index) => {
            if (planBoxes[index]) {
                const box = planBoxes[index];
                
                // Update plan name
                const planName = box.querySelector('h6');
                if (planName && plan.plan_name) {
                    planName.textContent = plan.plan_name;
                }

                // Update price
                const priceMain = box.querySelector('.numeric1');
                const priceCents = box.querySelector('.numeric2');
                if (priceMain && plan.price) {
                    priceMain.textContent = plan.price;
                }
                if (priceCents && plan.price_cents) {
                    priceCents.textContent = plan.price_cents;
                }

                // Update description
                const description = box.querySelector('p');
                if (description && plan.plan_description) {
                    description.textContent = plan.plan_description;
                }

                // Update features
                const featuresList = box.querySelector('ul.list-unstyled');
                if (featuresList && plan.features) {
                    featuresList.innerHTML = '';
                    plan.features.forEach(feature => {
                        const li = document.createElement('li');
                        li.className = 'position-relative';
                        li.innerHTML = `<i class="fas fa-check"></i> ${feature}`;
                        featuresList.appendChild(li);
                    });
                }
            }
        });
    }

    // Build Section Three (Business Boost) - Dynamic HTML
    buildSectionThree() {
        const content = this.api.getSectionContent(this.data, 'section_three');
        if (!content) {
            return;
        }

        // Find the service section
        const serviceSection = document.querySelector('.service-main-con');
        if (!serviceSection) return;

        // Clear existing content
        const serviceInner = serviceSection.querySelector('.service-inner-con');
        if (serviceInner) {
            serviceInner.innerHTML = '';
        }

        // Build dynamic HTML
        const serviceHTML = `
            <div class="service-img-con">
                <figure class="service-chat-img">
                    <img src="assets/images/chat-img.png" alt="chat-img">
                </figure>
                <figure class="mb-0">
                    <img src="${this.api.imageBaseURL + "/" + content.main_image || 'assets/images/service-main-img.png'}" alt="service-main-img">
                </figure>
                ${content.testimonial ? `
                    <div class="service-review">
                        <i class="fas fa-quote-right"></i>
                        <p>${content.testimonial.quote || 'Eiusmod tempor incididun aur labore dolore magna.'}</p>
                        <div class="service-reviewer">
                            <span class="d-inline-block">${content.testimonial.author_name || 'Kevin Doe'}</span>
                            <small class="d-inline-block">${content.testimonial.author_position || 'Company CEO'}</small>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="service-content-con">
                <h2>${content.title || 'Let us Help You By Boosting Your Business'}</h2>
                <p>${content.description || 'Nam libero tempore, cum soluta nobis eligendi oetio cumrue debitis molestiae.'}</p>
                <ul class="list-unstyled">
                    ${content.features ? content.features.map(feature => `
                        <li>
                            <div class="service-number">${feature.number || '01'}</div>
                            <div class="service-detail">
                                <span class="d-block">${feature.title || 'Easy installation & Payment'}</span>
                                <p>${feature.description || 'Duis aute irure dolor in reprehenderi voua.'}</p>
                            </div>
                        </li>
                    `).join('') : ''}
                </ul>
            </div>
        `;

        if (serviceInner) {
            serviceInner.innerHTML = serviceHTML;
        }
    }

    // Update service features
    updateServiceFeatures(features) {
        const featureItems = document.querySelectorAll('.service-content-con ul.list-unstyled li');
        
        features.forEach((feature, index) => {
            if (featureItems[index]) {
                const item = featureItems[index];
                
                // Update feature number
                const number = item.querySelector('.service-number');
                if (number && feature.number) {
                    number.textContent = feature.number;
                }

                // Update feature title
                const title = item.querySelector('.service-detail span');
                if (title && feature.title) {
                    title.textContent = feature.title;
                }

                // Update feature description
                const description = item.querySelector('.service-detail p');
                if (description && feature.description) {
                    description.textContent = feature.description;
                }
            }
        });
    }

    // Update testimonial
    updateTestimonial(testimonial) {
        const quote = document.querySelector('.service-review p');
        if (quote && testimonial.quote) {
            quote.textContent = testimonial.quote;
        }

        const authorName = document.querySelector('.service-reviewer span');
        if (authorName && testimonial.author_name) {
            authorName.textContent = testimonial.author_name;
        }

        const authorPosition = document.querySelector('.service-reviewer small');
        if (authorPosition && testimonial.author_position) {
            authorPosition.textContent = testimonial.author_position;
        }
    }

    // Build Section Four (Features) - Dynamic HTML
    buildSectionFour() {
        const content = this.api.getSectionContent(this.data, 'section_four');
        if (!content) {
            return;
        }

        // Find the hosting features section
        const featuresSection = document.querySelector('.hosting-features-con');
        if (!featuresSection) return;

        // Clear existing content - replace the entire section content
        featuresSection.innerHTML = '';

        // Build dynamic HTML - Exact original structure
        const featuresHTML = `
            <div class="container">
                <div class="generic-title text-center wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                    <h2>${content.title || 'Advanced Web Hosting Features'}</h2>
                    <p>${content.description || 'Quis autem vel eum iure reprehenderit rui in ea voluate molestiae'}</p>
                </div>
                <div class="hosting-fatures-inner-con wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                    ${content.features ? content.features.map((feature, index) => `
                        <div class="hosting-feature-box">
                            <figure>
                                <img src="${this.api.imageBaseURL + "/" + feature.icon || 'assets/images/hosting-feature-img1.png'}" alt="hosting-feature-img${index + 1}">
                            </figure>
                            <div class="hosting-features-content-con">
                                <h6>${feature.title || 'Dedicated Resources'}</h6>
                                <p>${feature.description || 'Duis aute irure dolor in reprehenderi in voluptate velit esse cillum dolore eina fugiat nulla pariatur.'}</p>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;

        // Insert the new content
        featuresSection.innerHTML = featuresHTML;
        
        // Update button text based on current language
        const currentLang = this.api.getCurrentLanguage();
        const $readMoreBtns = $('.read-more-btn');
        $readMoreBtns.each(function() {
            const $btn = $(this);
            const $icon = $btn.find('i');
            const iconHTML = $icon.length ? $icon[0].outerHTML : '';
            if (currentLang === 'ar') {
                $btn.html('ابدأ الآن ' + iconHTML);
            } else {
                $btn.html('Start Now ' + iconHTML);
            }
        });
    }

    // Update hosting features
    updateHostingFeatures(features) {
        const featureBoxes = document.querySelectorAll('.hosting-feature-box');
        
        features.forEach((feature, index) => {
            if (featureBoxes[index]) {
                const box = featureBoxes[index];
                
                // Update feature title
                const title = box.querySelector('h6');
                if (title && feature.title) {
                    title.textContent = feature.title;
                }

                // Update feature description
                const description = box.querySelector('p');
                if (description && feature.description) {
                    description.textContent = feature.description;
                }
            }
        });
    }

    // Build Section Five (Questionnaire) - Dynamic HTML
    buildSectionFive() {
        const content = this.api.getSectionContent(this.data, 'section_five');
        if (!content) {
            return;
        }

        // Find the questionnaire section
        const questionnaireSection = document.querySelector('.questionnaire-main-con');
        if (!questionnaireSection) return;

        // Clear existing content
        const questionnaireInner = questionnaireSection.querySelector('.questionnaire-inner-con');
        if (questionnaireInner) {
            questionnaireInner.innerHTML = '';
        }

        // Build dynamic HTML
        const questionnaireHTML = `
            <div class="questionnaire-inner-con wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                ${content.items ? content.items.map(item => `
                    <div class="questionnaire-box">
                        <figure>
                            <img src="${item.icon || 'assets/images/questionnaire-img1.png'}" alt="questionnaire-img1">
                        </figure>
                        <h3>${item.title || 'Already Have a Website?'}</h3>
                        <p>${item.description || 'Transfer an existing website to Hostiko for the same low price of EGP 9.99/mo*'}</p>
                        <div class="generic-btn">
                            <a href="domain.html">Transfer My Website</a>
                        </div>
                    </div>
                `).join('') : ''}
            </div>
        `;

        if (questionnaireInner) {
            questionnaireInner.innerHTML = questionnaireHTML;
        }
    }

    // Update questionnaire items
    updateQuestionnaireItems(items) {
        const questionnaireBoxes = document.querySelectorAll('.questionnaire-box');
        
        items.forEach((item, index) => {
            if (questionnaireBoxes[index]) {
                const box = questionnaireBoxes[index];
                
                // Update title
                const title = box.querySelector('h3');
                if (title && item.title) {
                    title.textContent = item.title;
                }

                // Update description
                const description = box.querySelector('p');
                if (description && item.description) {
                    description.textContent = item.description;
                }
            }
        });
    }

    // Build Video Section - Static Video
    buildVideoSection() {
        // Video section is static, no dynamic content needed
        // Video source is hardcoded in HTML: assets/images/video.mp4
        // This function is kept for consistency with other sections but does nothing
        return;
    }

    // Initialize Owl Carousel for reviews
    initializeOwlCarousel() {
        // Destroy existing carousel if it exists
        if ($('#owl-carousel-client').hasClass('owl-loaded')) {
            $('#owl-carousel-client').trigger('destroy.owl.carousel');
        }
        
        // Initialize new carousel
        $('#owl-carousel-client').owlCarousel({
            loop: true,
            margin: 30,
            nav: false,
            dots: true,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 2
                },
                1200: {
                    items: 3
                }
            }
        });
    }

    // Update reviews
    updateReviews(reviews) {
        const reviewItems = document.querySelectorAll('.client-review-box');
        
        reviews.forEach((review, index) => {
            if (reviewItems[index]) {
                const item = reviewItems[index];
                
                // Update review title
                const title = item.querySelector('h6');
                if (title && review.name) {
                    title.textContent = review.name;
                }

                // Update review description
                const description = item.querySelector('p');
                if (description && review.description) {
                    description.textContent = review.description;
                }

                // Update reviewer name
                const reviewerName = item.querySelector('.reviewer-details span');
                if (reviewerName && review.name_reviewer) {
                    reviewerName.textContent = review.name_reviewer;
                }
            }
        });
    }

    // Build Partners - Dynamic HTML
    buildPartners() {
        const content = this.api.getSectionContent(this.data, 'partners');
        if (!content) {
            return;
        }

        // Find the partners section
        const partnersSection = document.querySelector('.global-partners-main-con');
        if (!partnersSection) return;

        // Clear existing content - replace the entire section content
        partnersSection.innerHTML = '';

        // Build dynamic HTML - Exact original structure
        const partnersHTML = `
            <div class="container">
                <div class="generic-title text-center wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                    <h2>${content.title || 'Our Global Partners'}</h2>
                    <p>${content.description || 'Meprehenderit in voluptate velit esse cillum dolore fugiat nulla'}</p>
                </div>
                <div class="global-partners-inner-con wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                    <ul class="list-unstyled mb-0">
                        ${content.partners_logos ? content.partners_logos.map((logo, index) => `
                            <li>
                                <figure class="mb-0">
                                    <img src="${this.api.imageBaseURL + "/" + logo || 'assets/images/partner-img1.png'}" alt="partner-img${index + 1}">
                                </figure>
                            </li>
                        `).join('') : ''}
                    </ul>
                </div>
            </div>
        `;

        // Insert the new content
        partnersSection.innerHTML = partnersHTML;
    }

    // Build Subfooter - Dynamic HTML
    buildSubfooter() {
        const content = this.api.getSectionContent(this.data, 'subfooter');
        if (!content) {
            return;
        }

        // Find the subfooter section
        const subfooterSection = document.querySelector('.footer-main-con .builder-main-con');
        if (!subfooterSection) return;

        // Clear existing content
        const builderContent = subfooterSection.querySelector('.builder-content');
        if (builderContent) {
            builderContent.innerHTML = '';
        }

        // Build dynamic HTML
        const subfooterHTML = `
            <h3>${content.title || 'Build Your Website with Hostiko'}</h3>
            <p>${content.description || 'From professional business to enterprise, we have got you covered!'}</p>
        `;

        if (builderContent) {
            builderContent.innerHTML = subfooterHTML;
        }
    }

    // Change language and update content
    async changeLanguage(language) {
        this.api.setLanguage(language);
        this.data = await this.api.fetchUnifiedData();
        if (this.data) {
            this.updateAllSections();
        }
    }
}

// Initialize API Service and Content Manager
const apiService = new APIService();
const contentManager = new ContentManager(apiService);

// Export for use in other scripts
window.APIService = APIService;
window.ContentManager = ContentManager;
window.apiService = apiService;
window.contentManager = contentManager;
