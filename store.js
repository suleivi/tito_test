document.addEventListener('DOMContentLoaded', () => {

    const productsGrid = document.getElementById('productsGrid');
    const paginationContainer = document.getElementById('pagination');
    const cartCountSpan = document.querySelector('.cart-count');
    const productsPerPage = 10;
    let currentPage = 1;
    let allProducts = []; 

    const AIRTABLE_API_TOKEN = 'patrSy9TVR7uQBAXz.1621be16e219e3aece918dff943ff1e5e38672d65c3185175a7c969b176095b9'; // Keep this secure in production!
    const AIRTABLE_BASE_ID = 'appbX0R18ZDRlhXQN';
    const AIRTABLE_TABLE_NAME = 'Products'; 
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

    //  Modal Elements
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
    let currentProductInModal = null; 

    // Cart Elements 
    const cartModal = document.getElementById('cartModal');
    const openCartBtn = document.getElementById('openCartBtn');
    const cartCloseBtn = cartModal.querySelector('.close-button');
    const cartItemsList = document.getElementById('cartItems');
    const cartSubtotalSpan = document.getElementById('cartSubtotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');

  // local storage
    let cart = JSON.parse(localStorage.getItem('pepito_ceramica_cart')) || [];

    const saveCart = () => {
        localStorage.setItem('pepito_ceramica_cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems(); 
    };

    // Actualizar carrito en nav
    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    };

    // Abrir y cerrar modal
    const openModal = (modalElement) => {
        modalElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closeModal = (modalElement) => {
        modalElement.classList.remove('active');
        document.body.style.overflow = 'auto'; 
        addToCartMessage.style.display = 'none'; 
    };

    // Detalles de productos 

    const renderProductDetailModal = (product) => {
        currentProductInModal = product; 

        productDetailName.textContent = product.name;
        productDetailPrice.textContent = `$${parseFloat(product.price).toFixed(2)} ARS`;
        productDetailDescription.textContent = product.description;
        productQuantityInput.value = 1; 

        productDetailThumbnails.innerHTML = '';

        // imagenes de vista detalle
        const imagesToDisplay = [];
        if (product.defaultImage) imagesToDisplay.push(product.defaultImage);
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                if (img !== product.defaultImage) {
                    imagesToDisplay.push(img);
                }
            });
        } else if (product.hoverImage && product.hoverImage !== product.defaultImage) {
            imagesToDisplay.push(product.hoverImage);
        }


        if (imagesToDisplay.length > 0) {
            productDetailMainImage.src = imagesToDisplay[0];
            productDetailMainImage.alt = product.name;

            imagesToDisplay.forEach((imgUrl, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgUrl;
                thumb.alt = `${product.name} Thumbnail ${index + 1}`;
                thumb.classList.add('product-thumbnail');
                if (index === 0) {
                    thumb.classList.add('active-thumbnail'); 
                }
                thumb.addEventListener('click', () => {
                    productDetailMainImage.src = imgUrl;
                    productDetailThumbnails.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active-thumbnail'));
                    thumb.classList.add('active-thumbnail');
                });
                productDetailThumbnails.appendChild(thumb);
            });
        } else {
            // Fallback si no hay imagenes images
            productDetailMainImage.src = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fvector%2F404-error-web-page-with-cute-cat-gm1305033045-396020757&psig=AOvVaw3d2sErDRPvImWdnXoHUdPv&ust=1750885569354000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNCtu5b7io4DFQAAAAAdAAAAABAE:https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fvector%2F404-error-web-page-with-cute-cat-gm1305033045-396020757&psig=AOvVaw3d2sErDRPvImWdnXoHUdPv&ust=1750885569354000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNCtu5b7io4DFQAAAAAdAAAAABAE';
            productDetailThumbnails.innerHTML = '';
        }

        openModal(productDetailModal);
    };

    // Selector de cantidad card 
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

    // Logica carrito

    const addToCart = () => {
        if (!currentProductInModal) return;

        const quantity = parseInt(productQuantityInput.value);
        if (quantity < 1) {
            displayAddToCartMessage("Agregue al menos una unidad", true);
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
        }, 3000); 
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
            productsGrid.innerHTML = '<p>Fallo cargar productos, revise Airtable API key.</p>';
        }
    };


    // Pagina actual
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
            productCard.dataset.productId = product.id; 

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

        // event listeners ver productos
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

        // button Siguiente
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
        fetchProducts();
    }

    const viewOnMapBtn = document.querySelector('.view-on-map');
    if (viewOnMapBtn) {
        viewOnMapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("This would open a map link to your studio location!");
        });
    }

});
