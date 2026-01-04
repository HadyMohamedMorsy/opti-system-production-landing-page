// Blogs and Categories Service
class BlogsCategoriesService {
    constructor(apiService) {
        this.api = apiService;
    }

    // Fetch blogs from front endpoint with pagination and category filter
    async fetchBlogs(categoryId = null, page = 1, pageSize = 9) {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            queryParams.append('query[isPagination]', 'true');
            queryParams.append('query[page]', page.toString());
            queryParams.append('query[limit]', pageSize.toString());
            
            // Add published filter
            queryParams.append('query[filters][isPublished]', 'true');
            
            // Add category filter if provided using relations
            if (categoryId) {
                queryParams.append('query[relations][categories][filters][id]', categoryId.toString());
            }

            const url = `${this.api.baseURL}/blog/front?${queryParams.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            // Extract data and pagination info
            const blogs = responseData.data?.data || responseData.data || [];
            const totalRecords = responseData.totalRecords || responseData.recordsFiltered || blogs.length;
            
            // Log to verify slug is present in data
            if (blogs.length > 0 && !blogs[0].slug) {
                console.warn('Blog data missing slug field:', blogs[0]);
            }
            
            return {
                blogs: blogs,
                totalRecords: totalRecords,
                currentPage: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalRecords / pageSize)
            };
        } catch (error) {
            console.error('Error fetching blogs:', error);
            return {
                blogs: [],
                totalRecords: 0,
                currentPage: page,
                pageSize: pageSize,
                totalPages: 0
            };
        }
    }

    // Fetch categories from front endpoint
    async fetchCategories() {
        try {
            const cacheKey = `categories-${this.api.currentLanguage}`;
            
            // Check cache first
            if (this.api.cache.has(cacheKey)) {
                return this.api.cache.get(cacheKey);
            }

            const response = await fetch(`${this.api.baseURL}/category/front`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            const categories = responseData.data.data || responseData || [];
            
            // Cache the data
            this.api.cache.set(cacheKey, categories);
            
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Get content by language from array
    getContentByLanguage(items, fallback = null) {
        if (!items || items.length === 0) {
            return fallback;
        }

        const currentLangId = this.api.currentLanguage === 'ar' ? 2 : 1; // Assuming 1=en, 2=ar
        const currentLangContent = items.find(item => item.language_id === currentLangId);
        return currentLangContent || items[0] || fallback;
    }

    // Fetch blog by slug or id
    async fetchBlogBySlug(slugOrId) {
        try {
            const cacheKey = `blog-${slugOrId}-${this.api.currentLanguage}`;
            
            // Check cache first
            if (this.api.cache.has(cacheKey)) {
                return this.api.cache.get(cacheKey);
            }

            // Check if it's a number (id) or string (slug)
            const isNumeric = /^\d+$/.test(slugOrId);
            
            let response;
            if (isNumeric) {
                // If it's an ID, first fetch all blogs to find the slug
                const blogs = await this.fetchBlogs();
                const blog = blogs.find(b => b.id == slugOrId);
                if (!blog || !blog.slug) {
                    throw new Error(`Blog with id ${slugOrId} not found`);
                }
                // Use the slug to fetch the full blog details
                response = await fetch(`${this.api.baseURL}/blog/by-slug/${blog.slug}`);
            } else {
                // It's a slug, fetch directly
                response = await fetch(`${this.api.baseURL}/blog/by-slug/${slugOrId}`);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            const blogData = responseData.data.data || responseData;
            
            // Cache the data
            this.api.cache.set(cacheKey, blogData);
            
            return blogData;
        } catch (error) {
            console.error('Error fetching blog by slug/id:', error);
            return null;
        }
    }

    // Clean HTML - Remove empty tags and normalize
    cleanHTML(html) {
        if (!html) return '';
        
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Remove empty <p> tags
        const emptyPTags = tempDiv.querySelectorAll('p');
        emptyPTags.forEach(p => {
            const text = p.textContent.trim();
            if (!text || text === '') {
                p.remove();
            }
        });
        
        // Remove empty <br> tags
        const brTags = tempDiv.querySelectorAll('br');
        brTags.forEach(br => {
            // Check if br is followed by another br or is at the end
            const nextSibling = br.nextSibling;
            if (!nextSibling || (nextSibling.nodeType === 1 && nextSibling.tagName === 'BR')) {
                // Check if previous sibling is also br or empty
                const prevSibling = br.previousSibling;
                if (!prevSibling || (prevSibling.nodeType === 1 && prevSibling.tagName === 'BR')) {
                    br.remove();
                }
            }
        });
        
        // Remove multiple consecutive <br> tags (keep only one)
        let cleanedHTML = tempDiv.innerHTML;
        cleanedHTML = cleanedHTML.replace(/(<br\s*\/?>){2,}/gi, '<br>');
        
        // Remove empty tags like <p></p>, <div></div>, etc.
        cleanedHTML = cleanedHTML.replace(/<(\w+)[^>]*>\s*<\/\1>/gi, '');
        
        // Remove leading/trailing <br> tags
        cleanedHTML = cleanedHTML.replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, '');
        
        // Trim whitespace
        cleanedHTML = cleanedHTML.trim();
        
        return cleanedHTML;
    }

    // Get translation for common text
    getTranslation(key) {
        const currentLang = this.api.currentLanguage || 'en';
        const translations = {
            en: {
                readMore: 'Read More',
                categories: 'Categories',
                by: 'By :',
                uncategorized: 'Uncategorized',
                home: 'Home',
                singleBlog: 'Single Blog',
                relatedTags: 'Related Tags',
                socialShare: 'Social Share',
                prev: 'Prev',
                next: 'Next',
                comments: 'Comments',
                leaveComment: 'Leave a Comment',
                enterComment: 'Enter your comment here...',
                yourName: 'Your name',
                yourEmail: 'Your e-mail',
                yourTopic: 'Your topic',
                postComment: 'Post Comment',
                searchNews: 'Search News',
                searchHere: 'Search Here...',
                popularCategory: 'Popular Category',
                followUs: 'Follow Us',
                tags: 'Tags',
                feeds: 'Feeds',
                reply: 'Reply',
                noBlogFound: 'Blog not found',
                loading: 'Loading...',
                blogs: 'Blogs',
                latestBlogs: 'Latest Blogs',
                blogsDescription: 'Stay updated with our latest articles and insights',
                viewAllBlogs: 'View All Blogs'
            },
            ar: {
                readMore: 'اقرأ المزيد',
                categories: 'الفئات',
                by: 'بواسطة :',
                uncategorized: 'غير مصنف',
                home: 'الرئيسية',
                singleBlog: 'مقال واحد',
                relatedTags: 'العلامات ذات الصلة',
                socialShare: 'مشاركة اجتماعية',
                prev: 'السابق',
                next: 'التالي',
                comments: 'التعليقات',
                leaveComment: 'اترك تعليقاً',
                enterComment: 'أدخل تعليقك هنا...',
                yourName: 'اسمك',
                yourEmail: 'بريدك الإلكتروني',
                yourTopic: 'موضوعك',
                postComment: 'نشر التعليق',
                searchNews: 'البحث في الأخبار',
                searchHere: 'ابحث هنا...',
                popularCategory: 'الفئة الشائعة',
                followUs: 'تابعنا',
                tags: 'العلامات',
                feeds: 'المشاركات',
                reply: 'رد',
                noBlogFound: 'المدونة غير موجودة',
                loading: 'جاري التحميل...',
                blogs: 'المدونة',
                latestBlogs: 'أحدث المدونات',
                blogsDescription: 'ابق على اطلاع بأحدث مقالاتنا ورؤانا',
                viewAllBlogs: 'عرض جميع المدونات'
            }
        };
        return translations[currentLang]?.[key] || translations.en[key] || key;
    }

    // Build Blogs - Dynamic HTML with pagination
    async buildBlogs(categoryId = null, page = 1) {
        const blogContainer = document.querySelector('#blog');
        if (!blogContainer) return;

        // Show loading state
        this.showLoading(blogContainer);

        try {
            // Get category and page from URL if not provided
            const urlParams = new URLSearchParams(window.location.search);
            if (!categoryId) {
                categoryId = urlParams.get('category') || null;
            }
            if (page === 1) {
                const pageParam = urlParams.get('page');
                page = pageParam ? parseInt(pageParam, 10) : 1;
            }

            const result = await this.fetchBlogs(categoryId, page, 9);
            const blogs = result.blogs;
            const totalRecords = result.totalRecords;
            const currentPage = result.currentPage;
            const totalPages = result.totalPages;
            
            if (!blogs || blogs.length === 0) {
                this.hideLoading(blogContainer);
                const blogRow = blogContainer.querySelector('.row');
                if (blogRow) {
                    blogRow.innerHTML = '<div class="col-12"><p class="text-center">' + this.getTranslation('noBlogFound') + '</p></div>';
                }
                // Clear pagination
                this.buildPagination(blogContainer, 1, 0, categoryId);
                return;
            }

            // Clear existing content
            const blogRow = blogContainer.querySelector('.row');
            if (!blogRow) {
                this.hideLoading(blogContainer);
                return;
            }

            // Build dynamic HTML for blogs
            const blogsHTML = blogs.map((blog, index) => {
                const content = this.getContentByLanguage(blog.content || []);
                const category = blog.category ? this.getContentByLanguage(blog.category.content || []) : null;
                const imageUrl = blog.main_image ? `${this.api.imageBaseURL}/${blog.main_image}` : 
                                (blog.thumb ? `${this.api.imageBaseURL}/${blog.thumb}` : 'assets/images/standard_post_img01.jpg');
                const date = blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                
                // Ensure slug is used for navigation - prioritize slug over id
                const blogSlug = blog.slug ? blog.slug : (blog.id ? blog.id.toString() : '');
                if (!blogSlug) {
                    console.warn('Blog missing both slug and id:', blog);
                }
                const blogUrl = `single-blog.html?slug=${encodeURIComponent(blogSlug)}`;

                return `
                    <div class="col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-duration="1s" data-wow-delay="${0.3 + (index * 0.1)}s">
                        <div class="blog-box threecolumn-blog">
                            <div class="post-image">
                                <a href="${blogUrl}" data-blog-slug="${blogSlug}">
                                    <img alt="${content?.title || 'blog image'}" src="${imageUrl}" loading="lazy">
                                </a>
                            </div>
                            <div class="lower-portion">
                                <div class="span-i-con">
                                    <i class="fa-solid fa-user"></i>
                                    <span class="text-size-14 text-mr">${this.getTranslation('by')} ${content?.author || 'Admin'}</span>
                                    ${category ? `
                                        <i class="tag-mb fa-solid fa-tag"></i>
                                        <span class="text-size-14">${category.name || this.getTranslation('uncategorized')}</span>
                                    ` : ''}
                                </div>
                                <p class="mb-0 text-size-16">${this.cleanHTML(content?.name || content?.title || 'No content available')}</p>
                            </div>
                            <div class="button-portion">
                                <div class="date">
                                    <i class="mb-0 calendar-ml fa-solid fa-calendar-days"></i>
                                    <span class="mb-0 text-size-14">${date}</span>
                                </div>
                                <div class="button">
                                    <a class="mb-0 read_more text-decoration-none" href="${blogUrl}" data-blog-slug="${blogSlug}">${this.getTranslation('readMore')}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Hide loading and show content
            this.hideLoading(blogContainer);
            blogRow.innerHTML = blogsHTML;

            // Build pagination
            this.buildPagination(blogContainer, currentPage, totalPages, categoryId);

            // Reinitialize WOW.js animations
            if (typeof WOW !== 'undefined') {
                new WOW().init();
            }
        } catch (error) {
            console.error('Error building blogs:', error);
            this.hideLoading(blogContainer);
        }
    }

    // Build Pagination HTML
    buildPagination(container, currentPage, totalPages, categoryId) {
        // Find or create pagination container
        let paginationContainer = container.querySelector('.pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container mt-4';
            container.appendChild(paginationContainer);
        }

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        const paginationHTML = this.generatePaginationHTML(currentPage, totalPages, categoryId);
        paginationContainer.innerHTML = paginationHTML;

        // Add click handlers for pagination links
        paginationContainer.querySelectorAll('.pagination-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.getAttribute('data-page'), 10);
                this.navigateToPage(page, categoryId);
            });
        });
    }

    // Generate Pagination HTML
    generatePaginationHTML(currentPage, totalPages, categoryId) {
        let html = '<nav aria-label="Blog pagination"><ul class="pagination justify-content-center">';
        
        // Previous button
        if (currentPage > 1) {
            html += `<li class="page-item"><a class="page-link pagination-link" href="#" data-page="${currentPage - 1}">${this.getTranslation('prev')}</a></li>`;
        } else {
            html += `<li class="page-item disabled"><span class="page-link">${this.getTranslation('prev')}</span></li>`;
        }

        // Page numbers
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            html += `<li class="page-item"><a class="page-link pagination-link" href="#" data-page="1">1</a></li>`;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                html += `<li class="page-item active"><span class="page-link">${i}</span></li>`;
            } else {
                html += `<li class="page-item"><a class="page-link pagination-link" href="#" data-page="${i}">${i}</a></li>`;
            }
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `<li class="page-item"><a class="page-link pagination-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
        }

        // Next button
        if (currentPage < totalPages) {
            html += `<li class="page-item"><a class="page-link pagination-link" href="#" data-page="${currentPage + 1}">${this.getTranslation('next')}</a></li>`;
        } else {
            html += `<li class="page-item disabled"><span class="page-link">${this.getTranslation('next')}</span></li>`;
        }

        html += '</ul></nav>';
        return html;
    }

    // Navigate to specific page
    navigateToPage(page, categoryId) {
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        if (categoryId) {
            url.searchParams.set('category', categoryId);
        } else {
            url.searchParams.delete('category');
        }
        window.location.href = url.toString();
    }

    // Build Categories - Dynamic HTML
    async buildCategories() {
        // Find the categories widget
        const categoryWidget = document.querySelector('.widget-categories');
        if (!categoryWidget) {
            console.log('Categories widget not found');
            return;
        }

        // Update categories title
        const categoryTitle = categoryWidget.querySelector('.widget-title');
        if (categoryTitle) {
            categoryTitle.textContent = this.getTranslation('categories');
        }

        const categoryList = categoryWidget.querySelector('ul');
        if (!categoryList) {
            console.log('Categories list not found');
            return;
        }

        // Show loading state
        this.showLoading(categoryWidget);

        try {
            const categories = await this.fetchCategories();
            
            if (!categories || categories.length === 0) {
                console.log('No categories found');
                this.hideLoading(categoryWidget);
                return;
            }

            // Get current category from URL
            const urlParams = new URLSearchParams(window.location.search);
            const currentCategoryId = urlParams.get('category');

            // Build dynamic HTML for categories with wow animation class
            const categoriesHTML = categories.map((category, index) => {
                const content = this.getContentByLanguage(category.content || []);
                const count = category.blogs_count || 0;
                
                // Use current page URL but update category parameter and reset to page 1
                const categoryUrlObj = new URL(window.location);
                categoryUrlObj.searchParams.set('category', category.id);
                categoryUrlObj.searchParams.set('page', '1'); // Reset to first page when changing category
                const categoryUrl = categoryUrlObj.pathname + categoryUrlObj.search;
                
                const isActive = currentCategoryId == category.id;
                
                return `
                    <li class="cat-item wow fadeInUp" data-wow-duration="1s" data-wow-delay="${0.3 + (index * 0.1)}s">
                        <a href="${categoryUrl}" data-category-id="${category.id}" class="${isActive ? 'active' : ''}">${content?.name || this.getTranslation('uncategorized')}</a>
                        <span class="cat-count-span">(${count})</span>
                    </li>
                `;
            }).join('');

            // Hide loading and show content
            this.hideLoading(categoryWidget);
            categoryList.innerHTML = categoriesHTML;

            // Add click handlers for category links
            categoryList.querySelectorAll('a[data-category-id]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const categoryId = link.getAttribute('data-category-id');
                    this.navigateToPage(1, categoryId);
                });
            });

            // Reinitialize WOW.js animations for categories
            if (typeof WOW !== 'undefined') {
                new WOW().init();
            }
        } catch (error) {
            console.error('Error building categories:', error);
            this.hideLoading(categoryWidget);
        }
    }

    // Show loading state
    showLoading(container) {
        if (!container) return;
        
        // Check if loading already exists
        if (container.querySelector('.loading-container')) {
            return;
        }
        
        const loadingHTML = `
            <div class="loading-container" style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100px;
                width: 100%;
                padding: 20px;
            ">
                <div class="loading-spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // Insert loading before the list
        const list = container.querySelector('ul');
        if (list) {
            list.style.opacity = '0.5';
            list.insertAdjacentHTML('afterend', loadingHTML);
        } else {
            container.insertAdjacentHTML('beforeend', loadingHTML);
        }
    }

    // Hide loading state
    hideLoading(container) {
        if (!container) return;
        
        const loadingContainer = container.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }
        
        // Restore list opacity
        const list = container.querySelector('ul');
        if (list) {
            list.style.opacity = '1';
        }
    }

    // Build Single Blog Details
    async buildSingleBlog() {
        // Update navigation links
        this.updateNavigationLinks();
        
        // Get slug from URL
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug') || urlParams.get('id');
        
        if (!slug) {
            console.error('No slug or id found in URL');
            return;
        }

        const mainBox = document.querySelector('.main-box');
        if (!mainBox) return;

        // Show loading
        this.showLoading(mainBox);

        try {
            const blogData = await this.fetchBlogBySlug(slug);
            
            if (!blogData || !blogData.blog) {
                this.hideLoading(mainBox);
                mainBox.innerHTML = `<div class="alert alert-danger">${this.getTranslation('noBlogFound')}</div>`;
                return;
            }

            const blog = blogData.blog;
            const content = this.getContentByLanguage(blog.content || []);
            const relatedBlogs = blogData.relatedBlogs || [];
            
            // Format date
            const date = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }) : '';

            // Get main image
            const mainImage = blog.thumb ? `${this.api.imageBaseURL}/${blog.thumb}` : 
                             (blog.featuredImages && blog.featuredImages.length > 0) ? 
                             `${this.api.imageBaseURL}/${blog.featuredImages[0]}` : 
                             'assets/images/singleblog-image1.jpg';

            // Get author name
            const authorName = blog.createdBy ? 
                `${blog.createdBy.firstName || ''} ${blog.createdBy.lastName || ''}`.trim() : 
                'Admin';

            // Build categories HTML
            const categories = blog.categories || [];
            const categoriesHTML = categories.map(cat => {
                const catContent = this.getContentByLanguage(cat.content || []);
                return `<li><a class="button text-decoration-none" href="three-colum-sidbar.html?category=${cat.id}">${catContent?.name || this.getTranslation('uncategorized')}</a></li>`;
            }).join('');

            // Build related blogs HTML
            const relatedBlogsHTML = relatedBlogs.slice(0, 4).map(relatedBlog => {
                const relatedContent = this.getContentByLanguage(relatedBlog.content || []);
                const relatedImage = relatedBlog.thumb ? `${this.api.imageBaseURL}/${relatedBlog.thumb}` : 
                                   'assets/images/singleblog-feed1.jpg';
                return `
                    <div class="feed">
                        <figure class="feed-image mb-0" data-aos="fade-up">
                            <img src="${relatedImage}" alt="${relatedContent?.title || 'blog'}" class="img-fluid" loading="lazy">
                        </figure>
                        <a href="single-blog.html?slug=${relatedBlog.slug}" class="mb-0">${relatedContent?.title || 'Blog Post'}</a>
                    </div>
                `;
            }).join('');

            // Update main blog content
            const mainImageEl = mainBox.querySelector('.image1 img');
            if (mainImageEl) {
                mainImageEl.src = mainImage;
                mainImageEl.alt = content?.title || 'blog image';
            }

            const titleEl = mainBox.querySelector('.content1 h4');
            if (titleEl) {
                titleEl.textContent = content?.title || 'Blog Title';
            }

            const authorEl = mainBox.querySelector('.content1 .span-fa-outer-con .text-mr');
            if (authorEl) {
                authorEl.textContent = `${this.getTranslation('by')} ${authorName}`;
            }

            const dateEl = mainBox.querySelector('.content1 .span-fa-outer-con .text-size-14:last-child');
            if (dateEl) {
                dateEl.textContent = date;
            }

            const descriptionEl = mainBox.querySelector('.content1 p.text-size-14');
            if (descriptionEl) {
                const cleanedDescription = this.cleanHTML(content?.description || content?.title || '');
                descriptionEl.innerHTML = cleanedDescription;
            }

            // Update quote section if exists
            const quoteEl = mainBox.querySelector('.content2 p');
            if (quoteEl && content?.subTitle) {
                quoteEl.textContent = `"${content.subTitle}"`;
            }

            // Update second paragraph
            const secondTextEl = mainBox.querySelector('.text.text-size-14');
            if (secondTextEl && content?.description) {
                const cleanedDescription = this.cleanHTML(content.description);
                secondTextEl.innerHTML = cleanedDescription;
            }

            // Update second image if exists
            const secondImageEl = mainBox.querySelector('.content3 .image1 img');
            if (secondImageEl && blog.featuredImages && blog.featuredImages.length > 1) {
                secondImageEl.src = `${this.api.imageBaseURL}/${blog.featuredImages[1]}`;
            }

            // Update tags
            const tagsList = mainBox.querySelector('.content4 .tag ul');
            if (tagsList && categoriesHTML) {
                tagsList.innerHTML = categoriesHTML;
            }

            // Update related tags title
            const relatedTagsTitle = mainBox.querySelector('.content4 .tag h5');
            if (relatedTagsTitle) {
                relatedTagsTitle.textContent = this.getTranslation('relatedTags');
            }

            // Update social share title
            const socialShareTitle = mainBox.querySelector('.content4 .icon h5');
            if (socialShareTitle) {
                socialShareTitle.textContent = this.getTranslation('socialShare');
            }

            // Update prev/next buttons
            const prevBtn = mainBox.querySelector('.buttons .prev .prev-text');
            if (prevBtn) {
                prevBtn.textContent = this.getTranslation('prev');
            }

            const nextBtn = mainBox.querySelector('.buttons .next .next-text');
            if (nextBtn) {
                nextBtn.textContent = this.getTranslation('next');
            }

            // Update comments title
            const commentsTitle = mainBox.querySelector('.content6 h4');
            if (commentsTitle) {
                commentsTitle.textContent = `0 ${this.getTranslation('comments')}`;
            }

            // Update leave comment title
            const leaveCommentTitle = mainBox.querySelector('.content7 h4');
            if (leaveCommentTitle) {
                leaveCommentTitle.textContent = this.getTranslation('leaveComment');
            }

            // Update form placeholders
            const commentTextarea = mainBox.querySelector('.content7 textarea');
            if (commentTextarea) {
                commentTextarea.placeholder = this.getTranslation('enterComment');
            }

            const nameInput = mainBox.querySelector('.content7 input[name="name"]');
            if (nameInput) {
                nameInput.placeholder = this.getTranslation('yourName');
            }

            const emailInput = mainBox.querySelector('.content7 input[name="emailid"]');
            if (emailInput) {
                emailInput.placeholder = this.getTranslation('yourEmail');
            }

            const topicInput = mainBox.querySelector('.content7 input[name="topic"]');
            if (topicInput) {
                topicInput.placeholder = this.getTranslation('yourTopic');
            }

            const postCommentBtn = mainBox.querySelector('.content7 button.post_comment');
            if (postCommentBtn) {
                postCommentBtn.textContent = this.getTranslation('postComment');
            }

            // Update sidebar
            this.updateSingleBlogSidebar(relatedBlogsHTML);

            // Update page title
            if (content?.title) {
                document.title = `${content.title} | Opti System`;
            }

            // Update meta description
            if (content?.metaDescription) {
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) {
                    metaDesc.content = content.metaDescription;
                }
            }

            // Update banner
            const bannerContent = document.querySelector('.sub-banner-content-con');
            if (bannerContent) {
                const breadcrumbHome = bannerContent.querySelector('.breadcrumb-item a');
                if (breadcrumbHome) {
                    breadcrumbHome.textContent = this.getTranslation('home');
                }

                const breadcrumbActive = bannerContent.querySelector('.breadcrumb-item.active');
                if (breadcrumbActive) {
                    breadcrumbActive.textContent = content?.title || this.getTranslation('singleBlog');
                }

                const title = bannerContent.querySelector('h2');
                if (title) {
                    title.textContent = content?.title || this.getTranslation('singleBlog');
                }

                const description = bannerContent.querySelector('p');
                if (description && content?.shortDescription) {
                    description.textContent = content.shortDescription;
                } else if (description && content?.description) {
                    description.textContent = content.description.substring(0, 150) + '...';
                }
            }

            this.hideLoading(mainBox);

            // Reinitialize WOW.js
            if (typeof WOW !== 'undefined') {
                new WOW().init();
            }
        } catch (error) {
            console.error('Error building single blog:', error);
            this.hideLoading(mainBox);
            mainBox.innerHTML = `<div class="alert alert-danger">${this.getTranslation('noBlogFound')}</div>`;
        }
    }

    // Update Single Blog Sidebar
    updateSingleBlogSidebar(relatedBlogsHTML) {
        // Update search placeholder
        const searchInput = document.querySelector('#searchblog');
        if (searchInput) {
            searchInput.placeholder = this.getTranslation('searchHere');
        }

        // Update search title
        const searchTitle = document.querySelector('.box1 h5');
        if (searchTitle && searchTitle.textContent.includes('Search')) {
            searchTitle.textContent = this.getTranslation('searchNews');
        }

        // Update popular category title
        const popularCategoryTitle = document.querySelector('.box2 h5');
        if (popularCategoryTitle) {
            popularCategoryTitle.textContent = this.getTranslation('popularCategory');
        }

        // Update follow us title
        const followUsTitle = document.querySelector('.box3 h5');
        if (followUsTitle) {
            followUsTitle.textContent = this.getTranslation('followUs');
        }

        // Update tags title
        const tagsTitle = document.querySelector('.box4 h5');
        if (tagsTitle) {
            tagsTitle.textContent = this.getTranslation('tags');
        }

        // Update feeds title
        const feedsTitle = document.querySelector('.box5 h5');
        if (feedsTitle) {
            feedsTitle.textContent = this.getTranslation('feeds');
        }

        // Update feeds content
        const feedsContainer = document.querySelector('.box5');
        if (feedsContainer && relatedBlogsHTML) {
            const feedsHTML = feedsContainer.innerHTML.replace(
                /<div class="feed">[\s\S]*?<\/div>/g,
                relatedBlogsHTML
            );
            // If no replacement happened, append to existing feeds
            if (feedsHTML === feedsContainer.innerHTML) {
                const existingFeeds = feedsContainer.querySelectorAll('.feed');
                if (existingFeeds.length > 0) {
                    existingFeeds[0].parentNode.innerHTML = relatedBlogsHTML;
                }
            } else {
                feedsContainer.innerHTML = feedsHTML;
            }
        }
    }

    // Update Navigation Links Translation
    updateNavigationLinks() {
        const homeLink = document.getElementById('nav-home');
        const blogsLink = document.getElementById('nav-blogs');
        
        if (homeLink) {
            homeLink.textContent = this.getTranslation('home');
        }
        if (blogsLink) {
            blogsLink.textContent = this.getTranslation('blogs');
        }
    }

    // Build Blog Banner Content - Dynamic HTML with translations
    buildBlogBanner() {
        const bannerContent = document.querySelector('.sub-banner-content-con');
        if (!bannerContent) return;

        const currentLang = this.api.currentLanguage || 'en';
        
        // Translations for blog banner
        const translations = {
            en: {
                home: 'Home',
                pageTitle: 'Blog Articles',
                description: 'Discover our latest articles, insights, and updates on technology, business, and more.'
            },
            ar: {
                home: 'الرئيسية',
                pageTitle: 'مقالات المدونة',
                description: 'اكتشف أحدث مقالاتنا ورؤانا وتحديثاتنا حول التكنولوجيا والأعمال والمزيد.'
            }
        };

        const t = translations[currentLang] || translations.en;

        // Update breadcrumb
        const breadcrumbHome = bannerContent.querySelector('.breadcrumb-item a');
        if (breadcrumbHome) {
            breadcrumbHome.textContent = t.home;
        }

        const breadcrumbActive = bannerContent.querySelector('.breadcrumb-item.active');
        if (breadcrumbActive) {
            breadcrumbActive.textContent = t.pageTitle;
            breadcrumbActive.setAttribute('aria-current', 'page');
        }

        // Update title
        const title = bannerContent.querySelector('h2');
        if (title) {
            title.textContent = t.pageTitle;
        }

        // Update description
        const description = bannerContent.querySelector('p');
        if (description) {
            description.textContent = t.description;
        }
    }

    // Build Home Page Blogs - Show latest 6 blogs
    async buildHomeBlogs() {
        const homeBlogsContainer = document.getElementById('home-blogs-container');
        if (!homeBlogsContainer) return;

        // Show loading
        homeBlogsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>';

        try {
            const result = await this.fetchBlogs(null, 1, 6); // Fetch first 6 blogs
            const blogs = result.blogs;

            if (!blogs || blogs.length === 0) {
                homeBlogsContainer.innerHTML = '';
                return;
            }

            // Update section title and description
            const sectionTitle = document.getElementById('blogs-section-title');
            const sectionDescription = document.getElementById('blogs-section-description');
            const viewAllBtn = document.getElementById('view-all-blogs-btn');
            
            if (sectionTitle) {
                sectionTitle.textContent = this.getTranslation('latestBlogs');
            }
            if (sectionDescription) {
                sectionDescription.textContent = this.getTranslation('blogsDescription');
            }
            if (viewAllBtn) {
                viewAllBtn.querySelector('span').textContent = this.getTranslation('viewAllBlogs');
            }

            // Build blogs HTML
            const blogsHTML = blogs.map((blog, index) => {
                const content = this.getContentByLanguage(blog.content || []);
                const category = blog.category ? this.getContentByLanguage(blog.category.content || []) : null;
                const imageUrl = blog.main_image ? `${this.api.imageBaseURL}/${blog.main_image}` : 
                                (blog.thumb ? `${this.api.imageBaseURL}/${blog.thumb}` : 'assets/images/standard_post_img01.jpg');
                const date = blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                
                const blogSlug = blog.slug ? blog.slug : (blog.id ? blog.id.toString() : '');
                const blogUrl = `single-blog.html?slug=${encodeURIComponent(blogSlug)}`;

                return `
                    <div class="col-xl-4 col-lg-4 col-md-6 wow fadeInUp" data-wow-duration="1s" data-wow-delay="${0.3 + (index * 0.1)}s">
                        <div class="blog-box threecolumn-blog">
                            <div class="post-image">
                                <a href="${blogUrl}">
                                    <img alt="${content?.title || 'blog image'}" src="${imageUrl}" loading="lazy">
                                </a>
                            </div>
                            <div class="lower-portion">
                                <div class="span-i-con">
                                    <i class="fa-solid fa-user"></i>
                                    <span class="text-size-14 text-mr">${this.getTranslation('by')} ${content?.author || 'Admin'}</span>
                                    ${category ? `
                                        <i class="tag-mb fa-solid fa-tag"></i>
                                        <span class="text-size-14">${category.name || this.getTranslation('uncategorized')}</span>
                                    ` : ''}
                                </div>
                                <h5 class="mb-2">${content?.title || 'Blog Title'}</h5>
                                <p class="mb-0 text-size-16">${this.cleanHTML(content?.name || content?.title || 'No content available').substring(0, 100)}...</p>
                            </div>
                            <div class="button-portion">
                                <div class="date">
                                    <i class="mb-0 calendar-ml fa-solid fa-calendar-days"></i>
                                    <span class="mb-0 text-size-14">${date}</span>
                                </div>
                                <div class="button">
                                    <a class="mb-0 read_more text-decoration-none" href="${blogUrl}">${this.getTranslation('readMore')}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            homeBlogsContainer.innerHTML = blogsHTML;

            // Reinitialize WOW.js animations
            if (typeof WOW !== 'undefined') {
                new WOW().init();
            }
        } catch (error) {
            console.error('Error building home blogs:', error);
            homeBlogsContainer.innerHTML = '';
        }
    }

    // Initialize blogs and categories
    async init() {
        // Update navigation links
        this.updateNavigationLinks();
        
        // Check if we're on index page
        const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
        
        // Check if we're on single blog page
        const isSingleBlogPage = window.location.pathname.includes('single-blog.html');
        
        if (isSingleBlogPage) {
            await this.buildSingleBlog();
            await this.buildCategories();
        } else if (isIndexPage) {
            // Build home page blogs
            await this.buildHomeBlogs();
        } else {
            // Get category and page from URL
            const urlParams = new URLSearchParams(window.location.search);
            const categoryId = urlParams.get('category');
            const page = urlParams.get('page') ? parseInt(urlParams.get('page'), 10) : 1;
            
            this.buildBlogBanner();
            await Promise.all([
                this.buildBlogs(categoryId, page),
                this.buildCategories()
            ]);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for apiService to be available
    function initializeBlogsCategories() {
        if (typeof window.apiService !== 'undefined') {
            const blogsCategoriesService = new BlogsCategoriesService(window.apiService);
            blogsCategoriesService.init();
            
            // Export for global access
            window.blogsCategoriesService = blogsCategoriesService;
            
            // Listen for language changes
            if (typeof window.contentManager !== 'undefined') {
                // Override changeLanguage to also update blogs and categories
                const originalChangeLanguage = window.contentManager.changeLanguage.bind(window.contentManager);
                window.contentManager.changeLanguage = async function(language) {
                    await originalChangeLanguage(language);
                    if (window.blogsCategoriesService) {
                        const isSingleBlogPage = window.location.pathname.includes('single-blog.html');
                        if (isSingleBlogPage) {
                            // Update navigation links
                            window.blogsCategoriesService.updateNavigationLinks();
                            // Update single blog page
                            await window.blogsCategoriesService.buildSingleBlog();
                            await window.blogsCategoriesService.buildCategories();
                        } else {
                            // Update navigation links
                            window.blogsCategoriesService.updateNavigationLinks();
                            
                            // Check if we're on index page
                            const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
                            
                            if (isIndexPage) {
                                // Update home blogs
                                await window.blogsCategoriesService.buildHomeBlogs();
                            } else {
                                // Update banner content
                                window.blogsCategoriesService.buildBlogBanner();
                                // Update blogs and categories
                                await window.blogsCategoriesService.init();
                            }
                        }
                    }
                };
            }

            // Also listen to language dropdown changes
            document.addEventListener('click', function(e) {
                const langItem = e.target.closest('[data-lang]');
                if (langItem) {
                    const lang = langItem.getAttribute('data-lang');
                    setTimeout(() => {
                        if (window.blogsCategoriesService) {
                            const isSingleBlogPage = window.location.pathname.includes('single-blog.html');
                            if (isSingleBlogPage) {
                                // Update navigation links
                                window.blogsCategoriesService.updateNavigationLinks();
                                // Update single blog page
                                window.blogsCategoriesService.buildSingleBlog();
                                window.blogsCategoriesService.buildCategories();
                            } else {
                                // Update navigation links
                                window.blogsCategoriesService.updateNavigationLinks();
                                
                                // Check if we're on index page
                                const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
                                
                                if (isIndexPage) {
                                    // Update home blogs
                                    window.blogsCategoriesService.buildHomeBlogs();
                                } else {
                                    window.blogsCategoriesService.buildBlogBanner();
                                    // Get current category and page from URL
                                    const urlParams = new URLSearchParams(window.location.search);
                                    const categoryId = urlParams.get('category');
                                    const page = urlParams.get('page') ? parseInt(urlParams.get('page'), 10) : 1;
                                    // Update categories title and read more buttons
                                    window.blogsCategoriesService.buildCategories();
                                    // Rebuild blogs to update read more text
                                    window.blogsCategoriesService.buildBlogs(categoryId, page);
                                }
                            }
                        }
                    }, 100);
                }
            });
        } else {
            // Retry after a short delay
            setTimeout(initializeBlogsCategories, 500);
        }
    }
    
    initializeBlogsCategories();
});

