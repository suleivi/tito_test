document.addEventListener('DOMContentLoaded', () => {

    const productsGrid = document.getElementById('productsGrid');
    const paginationContainer = document.getElementById('pagination');
    const cartCountSpan = document.querySelector('.cart-count');
    const productsPerPage = 10;
    let currentPage = 1;
    let allProducts = []; // This will store all products fetched from API

    // Airtable API Configuration (Ensure these match your Airtable setup)
    const AIRTABLE_API_TOKEN = 'patrSy9TVR7uQBAXz.1621be16e219e3aece918dff943ff1e5e38672d65c3185175a7c969b176095b9'; // Keep this secure in production!
    const AIRTABLE_BASE_ID = 'appbX0R18ZDRlhXQN';
    const AIRTABLE_TABLE_NAME = 'Products'; // Make sure this matches your table name exactly
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    // --- Product Detail Modal Elements ---
    const productDetailModal = document.getElementById('productDetailModal');
    const productDetailCloseBtn = productDetailModal.querySelector('.close-button');
    const productDetailMainImage = document.getElementById('productDetailMainImage');
    const productDetailThumbnails = document.getElementById('productDetailThumbnails');
    const productDetailName = document.getElementById('productDetailName');
    const productDetailPrice = document.getElementById('productDetailPrice');
    const productDetailDescription = document.getElementById('productDetailDescription');
    const productQuantityInput = document.getElementById('productQuantity');
    const decreaseQuantityBtn = document.getElementById('decreaseQuantity');
    const increaseQuantityBtn = document.getElementById('increaseQuantity');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const addToCartMessage = document.getElementById('addToCartMessage');
    let currentProductInModal = null; // To store the product object currently displayed

    // --- Cart Modal Elements ---
    const cartModal = document.getElementById('cartModal');
    const openCartBtn = document.getElementById('openCartBtn');
    const cartCloseBtn = cartModal.querySelector('.close-button');
    const cartItemsList = document.getElementById('cartItems');
    const cartSubtotalSpan = document.getElementById('cartSubtotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');

    // --- Cart Array (Local Storage) ---
    let cart = JSON.parse(localStorage.getItem('pepito_ceramica_cart')) || [];

    // --- Helper Functions ---

    // Function to save cart to local storage
    const saveCart = () => {
        localStorage.setItem('pepito_ceramica_cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems(); // Re-render cart display if modal is open
    };

    // Function to update cart count in header
    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    };

    // Function to open any modal
    const openModal = (modalElement) => {
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    };

    // Function to close any modal
    const closeModal = (modalElement) => {
        modalElement.classList.remove('active');
        document.body.style.overflow = 'auto'; 
        addToCartMessage.style.display = 'none'; 
    };

    // --- Product Detail Modal Functions ---

    const renderProductDetailModal = (product) => {
        currentProductInModal = product; // Store the product for add-to-cart logic

        productDetailName.textContent = product.name;
        productDetailPrice.textContent = `$${parseFloat(product.price).toFixed(2)} ARS`;
        productDetailDescription.textContent = product.description;
        productQuantityInput.value = 1; // Reset quantity to 1

        // Clear existing thumbnails
        productDetailThumbnails.innerHTML = '';

        // Handle product images for detail view
        const imagesToDisplay = [];
        if (product.defaultImage) imagesToDisplay.push(product.defaultImage);
        // Assuming product.images is an array from Airtable (new field)
        if (product.images && product.images.length > 0) {
            // Add other images, ensuring we don't duplicate defaultImage if it's in images array
            product.images.forEach(img => {
                if (img !== product.defaultImage) {
                    imagesToDisplay.push(img);
                }
            });
        } else if (product.hoverImage && product.hoverImage !== product.defaultImage) {
            // Fallback: if no dedicated 'images' array, use hoverImage as secondary
            imagesToDisplay.push(product.hoverImage);
        }


        // Set main image and create thumbnails
        if (imagesToDisplay.length > 0) {
            productDetailMainImage.src = imagesToDisplay[0];
            productDetailMainImage.alt = product.name;

            imagesToDisplay.forEach((imgUrl, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgUrl;
                thumb.alt = `${product.name} Thumbnail ${index + 1}`;
                thumb.classList.add('product-thumbnail');
                if (index === 0) {
                    thumb.classList.add('active-thumbnail'); // Mark first as active
                }
                thumb.addEventListener('click', () => {
                    productDetailMainImage.src = imgUrl;
                    productDetailThumbnails.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active-thumbnail'));
                    thumb.classList.add('active-thumbnail');
                });
                productDetailThumbnails.appendChild(thumb);
            });
        } else {
            // Fallback for no images
            productDetailMainImage.src = 'https://via.placeholder.com/600x400?text=No+Image+Available';
            productDetailThumbnails.innerHTML = '';
        }

        openModal(productDetailModal);
    };

    // Quantity selector logic
    decreaseQuantityBtn.addEventListener('click', () => {
        let currentQuantity = parseInt(productQuantityInput.value);
        if (currentQuantity > 1) {
            productQuantityInput.value = currentQuantity - 1;
        }
    });

    increaseQuantityBtn.addEventListener('click', () => {
        let currentQuantity = parseInt(productQuantityInput.value);
        productQuantityInput.value = currentQuantity + 1;
    });

    // --- Cart Logic ---

    const addToCart = () => {
        if (!currentProductInModal) return;

        const quantity = parseInt(productQuantityInput.value);
        if (quantity < 1) {
            displayAddToCartMessage("Quantity must be at least 1.", true);
            return;
        }

        const existingItemIndex = cart.findIndex(item => item.id === currentProductInModal.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: currentProductInModal.id,
                name: currentProductInModal.name,
                price: currentProductInModal.price,
                imageUrl: currentProductInModal.defaultImage || currentProductInModal.imageUrl, 
                quantity: quantity
            });
        }
        saveCart();
        displayAddToCartMessage(`${quantity} x ${currentProductInModal.name} Agregado al carrito!`, false);
    };

    addToCartBtn.addEventListener('click', addToCart);

    const displayAddToCartMessage = (message, isError) => {
        addToCartMessage.textContent = message;
        addToCartMessage.classList.remove('error');
        if (isError) {
            addToCartMessage.classList.add('error');
        }
        addToCartMessage.style.display = 'block';
        setTimeout(() => {
            addToCartMessage.style.display = 'none';
        }, 3000); // Hide message after 3 seconds
    };


    const renderCartItems = () => {
        cartItemsList.innerHTML = ''; // 
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-message">Su carrito esta vacio.</p>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p class="price">$${parseFloat(item.price).toFixed(2)} ARS</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button class="decrease-cart-quantity" data-id="${item.id}">-</button>
                            <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="cart-item-quantity-input">
                            <button class="increase-cart-quantity" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">Remove</button>
                    </div>
                `;
                cartItemsList.appendChild(cartItemDiv);
            });
        }
        cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)} ARS`;
        updateCartCount(); 
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    };

    const changeCartItemQuantity = (productId, newQuantity) => {
        cart = cart.map(item =>
            item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
        );
        saveCart();
    };

    // Eventos de carrito
    cartItemsList.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.dataset.id;

        if (productId) {
            if (target.classList.contains('remove-item-btn')) {
                removeFromCart(productId);
            } else if (target.classList.contains('decrease-cart-quantity')) {
                const input = target.nextElementSibling;
                changeCartItemQuantity(productId, parseInt(input.value) - 1);
            } else if (target.classList.contains('increase-cart-quantity')) {
                const input = target.previousElementSibling;
                changeCartItemQuantity(productId, parseInt(input.value) + 1);
            }
        }
    });

    cartItemsList.addEventListener('change', (event) => {
        const target = event.target;
        if (target.classList.contains('cart-item-quantity-input')) {
            const productId = target.dataset.id;
            const newQuantity = parseInt(target.value);
            changeCartItemQuantity(productId, newQuantity);
        }
    });


    // --- eventos de Modal ---
    productDetailCloseBtn.addEventListener('click', () => closeModal(productDetailModal));
    cartCloseBtn.addEventListener('click', () => closeModal(cartModal));
    openCartBtn.addEventListener('click', () => {
        renderCartItems();
        openModal(cartModal);
    });

    // Cerrar modal con click fuera del cuadro
    window.addEventListener('click', (event) => {
        if (event.target === productDetailModal) {
            closeModal(productDetailModal);
        }
        if (event.target === cartModal) {
            closeModal(cartModal);
        }
    });

    clearCartBtn.addEventListener('click', () => {
        if (confirm('Borrar carrito?')) {
            cart = [];
            saveCart();
            renderCartItems(); 
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Su carrito esta vacio, agrege productos antes de finalizar su compra.');
            return;
        }
        alert('Aqui iriamos a finalizar la compra :P ');
    });


    // Cargar productos de Airtable
    const fetchProducts = async () => {
        if (!productsGrid || !paginationContainer) return;

        try {
            const response = await fetch(AIRTABLE_API_URL, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Airtable API Error:', response.status, response.statusText, errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Mapear imagenes de Airtable con records 
            allProducts = data.records.map(record => ({
                id: record.id,
                name: record.fields.Name || 'Producto sin nombre',
                description: record.fields.Description || '',
                price: record.fields.Price || 0,
                defaultImage: record.fields.DefaultImage?.[0]?.url || 'https://via.placeholder.com/300x300/EAEAEA/000000?text=No+Default+Image',
                hoverImage: record.fields.HoverImage?.[0]?.url || record.fields.DefaultImage?.[0]?.url || 'https://via.placeholder.com/300x300/EAEAEA/000000?text=No+Hover+Image',
                // Mas imagenes, en la descripcion del modal
                images: record.fields.ProductImages?.map(img => img.url) || []
            }));

            console.log('Fetched Products:', allProducts);

            renderProducts(currentPage);
            setupPagination();

        } catch (error) {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = '<p>Failed to load products. Please check your Airtable API key, base ID, table name, and network connection.</p>';
        }
    };


    // Function to render products for the current page
    function renderProducts(page) {
        productsGrid.innerHTML = '';
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const productsToDisplay = allProducts.slice(start, end);

        if (productsToDisplay.length === 0) {
            productsGrid.innerHTML = '<p>No products found for this page.</p>';
            return;
        }

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.dataset.defaultImage = product.defaultImage;
            productCard.dataset.hoverImage = product.hoverImage;
            productCard.dataset.productId = product.id; // Store product ID on the card

            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.defaultImage}" alt="${product.name}" class="product-main-image">
                </div>
                <h3>${product.name}</h3>
                <p class="price">$${parseFloat(product.price).toFixed(2)} ARS</p>
                <button class="btn view-product-btn" data-id="${product.id}">Ver mas</button>
            `;
            productsGrid.appendChild(productCard);
        });

        // Attach event listeners for "View Product" buttons
        productsGrid.querySelectorAll('.view-product-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                const product = allProducts.find(p => p.id === productId);
                if (product) {
                    renderProductDetailModal(product);
                }
            });
        });

        applyProductCardHoverEffects();
    }

    function setupPagination() { /* ... existing code ... */ }
    function updatePaginationButtons() { /* ... existing code ... */ }
    function applyProductCardHoverEffects() { /* ... existing code ... */ }

        // Functiones de paginacion
    function setupPagination() {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(allProducts.length / productsPerPage);

        if (totalPages <= 1 && allProducts.length > 0) { 
            return;
        } else if (allProducts.length === 0) { 
            return;
        }

        // Botones
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts(currentPage);
                updatePaginationButtons();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(prevButton);

        // Numero de paginas
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts(currentPage);
                updatePaginationButtons();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    // Logica mostrar ocultar botones
    function updatePaginationButtons() {
        const buttons = paginationContainer.querySelectorAll('button');
        const totalPages = Math.ceil(allProducts.length / productsPerPage);

        buttons.forEach(button => {
            button.classList.remove('active');
            if (button.textContent === currentPage.toString()) {
                button.classList.add('active');
            }
        });

        if (buttons.length > 0) { 
            buttons[0].disabled = currentPage === 1; 
            buttons[buttons.length - 1].disabled = currentPage === totalPages; 
        }
    }
    function applyProductCardHoverEffects() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const mainImage = card.querySelector('img');
            const defaultImage = card.dataset.defaultImage;
            const hoverImage = card.dataset.hoverImage;

            if (mainImage && defaultImage && hoverImage && !card.dataset.listenersAdded) {
                const img = new Image();
                img.src = hoverImage; 

                card.addEventListener('mouseenter', () => {
                    mainImage.style.opacity = '0';
                    setTimeout(() => {
                        mainImage.src = hoverImage;
                        mainImage.style.opacity = '1';
                    }, 150);
                });

                card.addEventListener('mouseleave', () => {
                    mainImage.style.opacity = '0';
                    setTimeout(() => {
                        mainImage.src = defaultImage;
                        mainImage.style.opacity = '1';
                    }, 150);
                });
                card.dataset.listenersAdded = 'true'; 
            }
        });
    }

    updateCartCount(); 
    if (productsGrid && paginationContainer) {
        fetchProducts(); // Start fetching products
    }

    const viewOnMapBtn = document.querySelector('.view-on-map');
    if (viewOnMapBtn) {
        viewOnMapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("This would open a map link to your studio location!");
        });
    }

});
