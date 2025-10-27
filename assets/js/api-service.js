// API Service for Dynamic Content Management
class APIService {
    constructor() {
      this.baseURL = "https://api-admin.optisystemhub.net/api/v1";
      this.imageBaseURL = "https://api-admin.optisystemhub.net";
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
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
        return data?.general_settings?.content || null;
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
        this.buildSectionReviews(); // Reviews section
        this.buildPartners(); // Partners section
        this.buildSubfooter(); // Subfooter section
    }

    // Update general settings (meta, contact info, etc.)
    updateGeneralSettings() {
        const settings = this.api.getGeneralSettings(this.data);
        if (!settings) {
            return;
        }

        // Update page title
        if (settings.meta_title) {
            document.title = settings.meta_title;
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && settings.meta_description) {
            metaDesc.setAttribute('content', settings.meta_description);
        }

        // Update meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && settings.meta_keywords) {
            metaKeywords.setAttribute('content', settings.meta_keywords);
        }

        // Update contact info in footer
        this.updateContactInfo(settings);
    }

    // Update contact information
    updateContactInfo(settings) {
        // Update phone
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach(link => {
            if (settings.phone) {
                link.href = `tel:${settings.phone}`;
                link.textContent = settings.phone;
            }
        });

        // Update email
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            if (settings.email) {
                link.href = `mailto:${settings.email}`;
                link.textContent = settings.email;
            }
        });

        // Update social media links
        if (settings.facebook_url) {
            const facebookLinks = document.querySelectorAll('a[href*="facebook.com"]');
            facebookLinks.forEach(link => {
                link.href = settings.facebook_url;
            });
        }

        if (settings.instagram_url) {
            const instagramLinks = document.querySelectorAll('a[href*="instagram.com"]');
            instagramLinks.forEach(link => {
                link.href = settings.instagram_url;
            });
        }
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
                <figure class="mb-0 reviewers-details">
                    <img src="assets/images/banner-reviewers-img.png" alt="banner-reviewers-img">
                </figure>
            </div>
        `;

        if (bannerInner) {
            bannerInner.innerHTML = bannerHTML;
        }
    }

    // Build Section Two (Hosting Plans) - Dynamic HTML
    buildSectionTwo() {
        const content = this.api.getSectionContent(this.data, 'section_two');
        if (!content) return;

        // Clear existing content
        const hostingInner = document.querySelector(".section-two");
        if (hostingInner) hostingInner.innerHTML = "";

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
                                <span class="dollar">$</span> <span id="price_val${index + 2}" class="numeric1">${plan.price || '12'}</span>
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
                                <a href="shared.html">ORDER NOW</a>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;

        if (hostingInner) {
            hostingInner.innerHTML = hostingHTML;
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
                                <a href="contact.html">Read more <i class="fas fa-angle-right"></i></a>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
        `;

        // Insert the new content
        featuresSection.innerHTML = featuresHTML;
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
                        <p>${item.description || 'Transfer an existing website to Hostiko for the same low price of $9.99/mo*'}</p>
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

    // Build Section Reviews - Dynamic HTML
    buildSectionReviews() {
        const content = this.api.getSectionContent(this.data, 'section_reviews');
        if (!content) {
            return;
        }

        // Find the reviews section
        const reviewsSection = document.querySelector('.client-review-slider');
        if (!reviewsSection) return;

        // Clear existing content - replace the entire section content
        reviewsSection.innerHTML = '';

      // Build dynamic HTML - Exact original structure
      console.log(content);
        const reviewsHTML = `
            <div class="container">
                <div class="generic-title text-center wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                    <h2>${content.title || 'What Our Customers are Saying'}</h2>
                    <p>${content.description || 'Nuis autem vel eum iure reprehenderit rui in ea voluate molestiae'}</p>
                </div>
                <div class="client-review-outer-con wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.3s">
                <div class="owl-carousel owl-theme" id="owl-carousel-client">
                    ${content.reviews ? content.reviews.map(review => `
                        <div class="item">
                            <div class="client-review-box">
                                <figure>
                                    <img src="${this.api.imageBaseURL + "/" + review.icon || 'assets/images/review-slider-quote-img.png'}" alt="review-slider-quote-img">
                                </figure>
                                <h6>${review.name || 'Excellent Hosting'}</h6>
                                <p>${review.description || 'Great support, like i have never seen before. Thanks to the support team, they are very helpfull.'}</p>
                                <div class="reviewer-info-box">
                                    <figure class="mb-0">
                                        <img src="${this.api.imageBaseURL + "/" + review.image_reviewer || 'assets/images/reviewer-img1.png'}" alt="reviewer-img1">
                                    </figure>
                                    <div class="reviewer-details">
                                        <span class="d-block">${review.name_reviewer || 'Kevin Andrew'}</span>
                                        <figure class="mb-0">
                                            <img src="assets/images/review-stars-img.png" alt="review-stars-img">
                                        </figure>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
            </div>
        `;

        // Insert the new content
        reviewsSection.innerHTML = reviewsHTML;
        
        // Re-initialize Owl Carousel after content is loaded (with small delay)
        setTimeout(() => {
            this.initializeOwlCarousel();
        }, 100);
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
