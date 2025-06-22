document.addEventListener('DOMContentLoaded', () => {

    // --- Common Image Hover Effect for Cards ---
    // Apply to both class cards and product cards
    const allCardsWithImages = document.querySelectorAll('.class-card, .product-card');

    allCardsWithImages.forEach(card => {
        const mainImage = card.querySelector('img'); // Assumes the main image is the direct child of .class-image-container or .product-image-container
        const defaultImage = card.dataset.defaultImage;
        const hoverImage = card.dataset.hoverImage;

        if (mainImage && defaultImage && hoverImage) {
            // Preload hover image to avoid flicker
            const img = new Image();
            img.src = hoverImage;

            card.addEventListener('mouseenter', () => {
                mainImage.style.opacity = '0'; // Fade out current image
                setTimeout(() => {
                    mainImage.src = hoverImage;
                    mainImage.style.opacity = '1'; // Fade in new image
                }, 150); // Match CSS transition duration
            });

            card.addEventListener('mouseleave', () => {
                mainImage.style.opacity = '0'; // Fade out current image
                setTimeout(() => {
                    mainImage.src = defaultImage;
                    mainImage.style.opacity = '1'; // Fade in new image
                }, 150); // Match CSS transition duration
            });
        }
    });

    // --- Basic Calendar Interactivity (Visual only, no actual date logic) ---
    // (This part is from the previous response and should remain if you need it on other pages)
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        calendarGrid.addEventListener('click', (event) => {
            const clickedSpan = event.target;
            if (clickedSpan.tagName === 'SPAN') {
                const currentlySelected = calendarGrid.querySelector('.selected');
                if (currentlySelected) {
                    currentlySelected.classList.remove('selected');
                }
                clickedSpan.classList.add('selected');
                console.log(`Date selected: ${clickedSpan.textContent} July 2024 (Visual only)`);
            }
        });
    }

    const prevMonthBtn = document.querySelector('.calendar-arrow:first-child');
    const nextMonthBtn = document.querySelector('.calendar-arrow:last-child');
    const monthYearDisplay = document.querySelector('.calendar-month-year');

    if (prevMonthBtn && nextMonthBtn && monthYearDisplay) {
        monthYearDisplay.textContent = "July 2024"; // Hardcode for screenshot consistency

        prevMonthBtn.addEventListener('click', () => {
            console.log("Previous month clicked (functionality not implemented)");
        });

        nextMonthBtn.addEventListener('click', () => {
            console.log("Next month clicked (functionality not implemented)");
        });
    }

    // --- Store Page Product & Pagination Logic ---
    const productsGrid = document.getElementById('productsGrid');
    const paginationContainer = document.getElementById('pagination');
    const productsPerPage = 10;
    let currentPage = 1;

    // Simulate product data (replace with real data from an API or array)
    const allProducts = [
        // Example products - add more to test pagination
        { id: 1, name: "Textured Vase", price: "60.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Vase+1", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Vase+1b" },
        { id: 2, name: "Abstract Bowl", price: "45.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Bowl+1", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Bowl+1b" },
        { id: 3, name: "Striped Planter", price: "35.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Planter+1", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Planter+1b" },
        { id: 4, name: "Sculptural Piece", price: "75.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Sculpture+1", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Sculpture+1b" },
        { id: 5, name: "Rustic Mug", price: "25.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Mug+1", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Mug+1b" },
        { id: 6, name: "Geometric Plate", price: "55.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Plate+1", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Plate+1b" },
        { id: 7, name: "Miniature Pot", price: "18.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Pot+2", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Pot+2b" },
        { id: 8, name: "Glazed Dish", price: "30.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Dish+2", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Dish+2b" },
        { id: 9, name: "Ceramic Candle Holder", price: "40.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Candle+2", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Candle+2b" },
        { id: 10, name: "Textured Mug", price: "28.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Mug+2", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Mug+2b" },
        { id: 11, name: "Elegant Pitcher", price: "90.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Pitcher+3", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Pitcher+3b" },
        { id: 12, name: "Artisan Coaster Set", price: "30.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Coaster+3", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Coaster+3b" },
        { id: 13, name: "Wavy Bowl", price: "48.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Bowl+3", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Bowl+3b" },
        { id: 14, name: "Tall Cylinder Vase", price: "65.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Vase+3", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Vase+3b" },
        { id: 15, name: "Speckled Plate", price: "32.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Plate+3", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Plate+3b" },
        { id: 16, name: "Abstract Sculpture 2", price: "80.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Sculpture+2", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Sculpture+2b" },
        { id: 17, name: "Coffee Cup Set", price: "60.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Cup+Set+4", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Cup+Set+4b" },
        { id: 18, name: "Garden Planter Large", price: "95.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Planter+4", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Planter+4b" },
        { id: 19, name: "Decorative Tile", price: "20.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Tile+4", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Tile+4b" },
        { id: 20, name: "Hand-Painted Mug", price: "30.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Mug+4", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Mug+4b" },
        { id: 21, name: "Small Ceramic Jar", price: "22.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Jar+5", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Jar+5b" },
        { id: 22, name: "Textured Serving Platter", price: "70.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Platter+5", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Platter+5b" },
        { id: 23, name: "Minimalist Bud Vase", price: "38.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Bud+Vase+5", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Bud+Vase+5b" },
        { id: 24, name: "Ceramic Tea Set", price: "120.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Tea+Set+6", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Tea+Set+6b" },
        { id: 25, name: "Abstract Wall Art", price: "90.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Wall+Art+6", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Wall+Art+6b" },
        { id: 26, name: "Hand-thrown Bowl Set", price: "85.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Bowl+Set+6", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Bowl+Set+6b" },
        { id: 27, name: "Textured Pitcher", price: "70.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Pitcher+6", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Pitcher+6b" },
        { id: 28, name: "Small Sculpture", price: "50.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Sculpture+6", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Sculpture+6b" },
        { id: 29, name: "Round Vase", price: "60.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Round+Vase+7", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Round+Vase+7b" },
        { id: 30, name: "Square Planter", price: "40.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Square+Planter+7", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Square+Planter+7b" },
        { id: 31, name: "Ceramic Spoon Rest", price: "15.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Spoon+Rest+7", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Spoon+Rest+7b" },
        { id: 32, name: "Handpainted Plate", price: "45.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Handpainted+Plate+7", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Handpainted+Plate+7b" },
        { id: 33, name: "Textured Cup", price: "25.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Textured+Cup+8", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Textured+Cup+8b" },
        { id: 34, name: "Unique Ashtray", price: "35.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Ashtray+8", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Ashtray+8b" },
        { id: 35, name: "Coiled Bowl", price: "50.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Coiled+Bowl+8", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Coiled+Bowl+8b" },
        { id: 36, name: "Tall Planter", price: "70.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Tall+Planter+8", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Tall+Planter+8b" },
        { id: 37, name: "Ceramic Bell", price: "28.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Bell+9", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Bell+9b" },
        { id: 38, name: "Serving Tray", price: "60.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Serving+Tray+9", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Serving+Tray+9b" },
        { id: 39, name: "Hand-built Vase", price: "55.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Hand-built+Vase+9", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Hand-built+Vase+9b" },
        { id: 40, name: "Abstract Coaster", price: "12.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Coaster+9", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Coaster+9b" },
        { id: 41, name: "Coffee Dripper", price: "40.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Dripper+10", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Dripper+10b" },
        { id: 42, name: "Flower Pot Small", price: "20.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Flower+Pot+10", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Flower+Pot+10b" },
        { id: 43, name: "Soap Dish", price: "18.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Soap+Dish+10", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Soap+Dish+10b" },
        { id: 44, name: "Textured Cup Set", price: "55.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Cup+Set+10", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Cup+Set+10b" },
        { id: 45, name: "Mini Sculpture", price: "30.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Mini+Sculpture+11", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Mini+Sculpture+11b" },
        { id: 46, name: "Ceramic Diffuser", price: "42.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Diffuser+11", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Diffuser+11b" },
        { id: 47, name: "Small Pitcher", price: "48.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Small+Pitcher+11", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Small+Pitcher+11b" },
        { id: 48, name: "Wall Planter", price: "35.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Wall+Planter+12", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Wall+Planter+12b" },
        { id: 49, name: "Sugar Bowl", price: "25.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Sugar+Bowl+12", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Sugar+Bowl+12b" },
        { id: 50, name: "Milk Jug", price: "28.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Milk+Jug+12", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Milk+Jug+12b" },
        { id: 51, name: "Large Serving Bowl", price: "75.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Serving+Bowl+12", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Serving+Bowl+12b" },
        { id: 52, name: "Textured Coaster Set", price: "20.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Coaster+Set+13", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Coaster+Set+13b" },
        { id: 53, name: "Ceramic Spoon", price: "10.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Spoon+13", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Spoon+13b" },
        { id: 54, name: "Unique Vase", price: "68.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Unique+Vase+13", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Unique+Vase+13b" },
        { id: 55, name: "Plant Pot", price: "30.00", defaultImage: "https://via.placeholder.com/300x300/F0EFE7/000000?text=Plant+Pot+14", hoverImage: "https://via.placeholder.com/300x300/DDDCD6/000000?text=Plant+Pot+14b" },
        { id: 56, name: "Decorative Bowl", price: "40.00", defaultImage: "https://via.placeholder.com/300x300/F5F5F0/000000?text=Decorative+Bowl+14", hoverImage: "https://via.placeholder.com/300x300/E5E5E0/000000?text=Decorative+Bowl+14b" },
        { id: 57, name: "Abstract Figure", price: "85.00", defaultImage: "https://via.placeholder.com/300x300/EAEAEA/000000?text=Abstract+Figure+14", hoverImage: "https://via.placeholder.com/300x300/DEDEDE/000000?text=Abstract+Figure+14b" },
        { id: 58, name: "Ceramic Lamp Base", price: "110.00", defaultImage: "https://via.placeholder.com/300x300/F2F2F2/000000?text=Lamp+Base+14", hoverImage: "https://via.placeholder.com/300x300/E2E2E2/000000?text=Lamp+Base+14b" },
        { id: 59, name: "Small Dish", price: "15.00", defaultImage: "https://via.placeholder.com/300x300/F7F7F7/000000?text=Small+Dish+15", hoverImage: "https://via.placeholder.com/300x300/E7E7E7/000000?text=Small+Dish+15b" },
        { id: 60, name: "Dinner Plate Set (4)", price: "150.00", defaultImage: "https://via.placeholder.com/300x300/FDFDFD/000000?text=Dinner+Plate+Set+15", hoverImage: "https://via.placeholder.com/300x300/EDEBEA/000000?text=Dinner+Plate+Set+15b" }
    ];

    function renderProducts(page) {
        productsGrid.innerHTML = ''; // Clear current products
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const productsToDisplay = allProducts.slice(start, end);

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.defaultImage = product.defaultImage;
            productCard.dataset.hoverImage = product.hoverImage;

            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.defaultImage}" alt="${product.name}" class="product-main-image">
                </div>
                <h3>${product.name}</h3>
                <p class="price">$${product.price} USD</p>
                <a href="#" class="btn">View Product</a>
            `;
            productsGrid.appendChild(productCard);
        });

        // Re-apply hover effect listeners to newly rendered cards
        applyProductCardHoverEffects();
    }

    function setupPagination() {
        paginationContainer.innerHTML = ''; // Clear existing pagination
        const totalPages = Math.ceil(allProducts.length / productsPerPage);

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts(currentPage);
                updatePaginationButtons();
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
            }
        });
        paginationContainer.appendChild(prevButton);

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderProducts(currentPage);
                updatePaginationButtons();
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
            });
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts(currentPage);
                updatePaginationButtons();
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    function updatePaginationButtons() {
        const buttons = paginationContainer.querySelectorAll('button');
        const totalPages = Math.ceil(allProducts.length / productsPerPage);

        buttons.forEach(button => {
            button.classList.remove('active');
            if (button.textContent === currentPage.toString()) {
                button.classList.add('active');
            }
        });

        // Update disabled state for Previous/Next
        buttons[0].disabled = currentPage === 1; // Previous button
        buttons[buttons.length - 1].disabled = currentPage === totalPages; // Next button
    }


    // Function to apply hover effects specifically for product cards
    // This is necessary because new elements are added to the DOM dynamically.
    function applyProductCardHoverEffects() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const mainImage = card.querySelector('img');
            const defaultImage = card.dataset.defaultImage;
            const hoverImage = card.dataset.hoverImage;

            if (mainImage && defaultImage && hoverImage) {
                 // Ensure event listeners are only added once per card
                 // Check if listeners are already present (simple check)
                if (!card.dataset.listenersAdded) {
                    // Preload hover image to avoid flicker
                    const img = new Image();
                    img.src = hoverImage;

                    card.addEventListener('mouseenter', () => {
                        mainImage.style.opacity = '0'; // Fade out current image
                        setTimeout(() => {
                            mainImage.src = hoverImage;
                            mainImage.style.opacity = '1'; // Fade in new image
                        }, 150); // Match CSS transition duration
                    });

                    card.addEventListener('mouseleave', () => {
                        mainImage.style.opacity = '0'; // Fade out current image
                        setTimeout(() => {
                            mainImage.src = defaultImage;
                            mainImage.style.opacity = '1'; // Fade in new image
                        }, 150); // Match CSS transition duration
                    });
                    card.dataset.listenersAdded = 'true'; // Mark as listeners added
                }
            }
        });
    }

    // Initialize the store page if elements exist
    if (productsGrid && paginationContainer) {
        renderProducts(currentPage);
        setupPagination();
    }

    // --- Add basic functionality for "View on Map" (if applicable) ---
    const viewOnMapBtn = document.querySelector('.view-on-map');
    if (viewOnMapBtn) {
        viewOnMapBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            alert("This would open a map link to your studio location!");
            // You would replace this with actual map embed or link
        });
    }

});