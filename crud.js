const adminProductList = document.getElementById('adminProductList');
    const adminPagination = document.getElementById('adminPagination');
    const productForm = document.getElementById('productForm');
    const productIdField = document.getElementById('productId');
    const productNameField = document.getElementById('productName');
    const productDescriptionField = document.getElementById('productDescription');
    const productPriceField = document.getElementById('productPrice');
    const defaultImageUrlField = document.getElementById('defaultImageUrl');
    const hoverImageUrlField = document.getElementById('hoverImageUrl');
    const productImagesUrlsField = document.getElementById('productImagesUrls');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');

    let adminAllProducts = []; 
    let adminCurrentPage = 1;
    const adminProductsPerPage = 9; 
    const AIRTABLE_API_TOKEN = 'patrSy9TVR7uQBAXz.1621be16e219e3aece918dff943ff1e5e38672d65c3185175a7c969b176095b9'; // Keep this secure in production!
    const AIRTABLE_BASE_ID = 'appbX0R18ZDRlhXQN';
    const AIRTABLE_TABLE_NAME = 'Products'; 
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const fetchAdminProducts = async () => {
        if (!adminProductList) return; 

        adminProductList.innerHTML = '<p class="loading-message">Loading products...</p>';

        try {
            const response = await fetch(AIRTABLE_API_URL, {
                headers: { 'Authorization': `Bearer ${AIRTABLE_API_TOKEN}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Airtable API Error (Admin Fetch):', response.status, response.statusText, errorData);
                adminProductList.innerHTML = '<p class="error-message">Failed to load products. Check console for details.</p>';
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            adminAllProducts = data.records.map(record => {
              
                const defaultImg = record.fields.DefaultImage?.[0]?.url;
                const hoverImg = record.fields.HoverImage?.[0]?.url;
                const productImgs = (record.fields.ProductImages || []).map(img => img.url);

                return {
                    id: record.id,
                    name: record.fields.Name || 'Unnamed Product',
                    description: record.fields.Description || '',
                    price: record.fields.Price || 0,
                    defaultImage: defaultImg,
                    hoverImage: hoverImg,
                    productImages: productImgs,
                    // Store the raw field values for easier re-population of form
                    rawDefaultImage: record.fields.DefaultImage || [],
                    rawHoverImage: record.fields.HoverImage || [],
                    rawProductImages: record.fields.ProductImages || []
                };
            });

            renderAdminProductList(adminCurrentPage);
            setupAdminPagination();

        } catch (error) {
            console.error('Error cargando productos:', error);
            adminProductList.innerHTML = `<p class="error-message">Error: ${error.message}. No se pudieron cargar los productos.</p>`;
        }
    };
    fetchAdminProducts();

    // Traer todos los productos
    function renderAdminProductList(page) {
        adminProductList.innerHTML = '';
        const start = (page - 1) * adminProductsPerPage;
        const end = start + adminProductsPerPage;
        const productsToDisplay = adminAllProducts.slice(start, end);

        if (productsToDisplay.length === 0) {
            adminProductList.innerHTML = '<p class="Cargando productos"> No hay productos para mostrar.</p>';
            return;
        }

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-admin-card');
            productCard.innerHTML = `
                <img src="${product.defaultImage || 'https://via.placeholder.com/150x150?text=No+Image'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${parseFloat(product.price).toFixed(2)} USD</p>
                <div class="admin-card-actions">
                    <button class="delete-btn" data-id="${product.id}">Borrar</button>
                    <button class="edit-btn" data-id="${product.id}">Editar</button>
    
                </div>
            `;
            adminProductList.appendChild(productCard);
        });

        //  event listeners para editar y borrar
        adminProductList.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                const productToEdit = adminAllProducts.find(p => p.id === productId);
                if (productToEdit) {
                    populateFormForEdit(productToEdit);
                }
            });
        });

        adminProductList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                if (confirm('Quiere borrar este producto?')) {
                    deleteProduct(productId);
                }
            });
        });
    }

    // Paginacion crud
    function setupAdminPagination() {
        if (!adminPagination) return;
        adminPagination.innerHTML = '';
        const totalPages = Math.ceil(adminAllProducts.length / adminProductsPerPage);

        if (totalPages <= 1 && adminAllProducts.length > 0) { return; }
        if (adminAllProducts.length === 0) { return; }

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = adminCurrentPage === 1;
        prevButton.addEventListener('click', () => {
            if (adminCurrentPage > 1) { adminCurrentPage--; renderAdminProductList(adminCurrentPage); updateAdminPaginationButtons(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        });
        adminPagination.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === adminCurrentPage) { pageButton.classList.add('active'); }
            pageButton.addEventListener('click', () => {
                adminCurrentPage = i; renderAdminProductList(adminCurrentPage); updateAdminPaginationButtons(); window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            adminPagination.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = adminCurrentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (adminCurrentPage < totalPages) { adminCurrentPage++; renderAdminProductList(adminCurrentPage); updateAdminPaginationButtons(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        });
        adminPagination.appendChild(nextButton);
    }

    function updateAdminPaginationButtons() {
        const buttons = adminPagination.querySelectorAll('button');
        const totalPages = Math.ceil(adminAllProducts.length / adminProductsPerPage);
        buttons.forEach(button => {
            button.classList.remove('active');
            if (button.textContent === adminCurrentPage.toString()) { button.classList.add('active'); }
        });
        if (buttons.length > 0) {
            buttons[0].disabled = adminCurrentPage === 1;
            buttons[buttons.length - 1].disabled = adminCurrentPage === totalPages;
        }
    }


    // Funciones del formulartio
    function populateFormForEdit(product) {
        productIdField.value = product.id;
        productNameField.value = product.name;
        productDescriptionField.value = product.description;
        productPriceField.value = product.price;
        defaultImageUrlField.value = product.rawDefaultImage[0]?.url || '';
        hoverImageUrlField.value = product.rawHoverImage[0]?.url || '';
        productImagesUrlsField.value = (product.rawProductImages || []).map(img => img.url).join(', ');

        saveProductBtn.textContent = 'Actualizar Producto';
    }

    function clearForm() {
        productForm.reset();
        productIdField.value = ''; 
        saveProductBtn.textContent = 'Agregar Producto';
    }

    // CRUD 

    // Crear/Actualizar Producto
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = productIdField.value;
        const name = productNameField.value;
        const description = productDescriptionField.value;
        const price = parseFloat(productPriceField.value);
        const defaultImageUrl = defaultImageUrlField.value;
        const hoverImageUrl = hoverImageUrlField.value;
        const productImagesUrls = productImagesUrlsField.value.split(',').map(url => url.trim()).filter(url => url);

        // Constructor API airtable
        const defaultImageAttachments = defaultImageUrl ? [{ url: defaultImageUrl }] : [];
        const hoverImageAttachments = hoverImageUrl ? [{ url: hoverImageUrl }] : [];
        const productImagesAttachments = productImagesUrls.map(url => ({ url: url }));


        const fields = {
            "Name": name,
            "Description": description,
            "Price": price,
            "DefaultImage": defaultImageAttachments,
            "HoverImage": hoverImageAttachments,
            "ProductImages": productImagesAttachments
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${AIRTABLE_API_URL}/${id}` : AIRTABLE_API_URL;

        saveProductBtn.disabled = true;
        saveProductBtn.textContent = id ? 'Updating...' : 'Adding...';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields: fields })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Airtable API Error (CRUD):', response.status, response.statusText, result);
                alert(`Error: ${result.error?.message || 'Falló guardar producto.'}`);
            } else {
                alert(`Product ${id ? 'Actualizado' : 'Guardado'} Exitosamente!`);
                clearForm();
                fetchAdminProducts(); 
            }
        } catch (error) {
            console.error('Network or unexpected error:', error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            saveProductBtn.disabled = false;
            saveProductBtn.textContent = id ? 'Update Product' : 'Add Product';
        }
    });

    // Borrar producto
    const deleteProduct = async (productId) => {
        try {
            const response = await fetch(`${AIRTABLE_API_URL}/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${AIRTABLE_API_TOKEN}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Airtable API Error (Delete):', response.status, response.statusText, errorData);
                alert(`Error: ${errorData.error?.message || 'Falló borrar producto'}`);
            } else {
                alert('Producto borrado exitosamente');
                fetchAdminProducts(); 
            }
        } catch (error) {
            console.error('Eror:', error);
            alert(`Ocurrio un error: ${error.message}`);
        }
    };

    // Event listener borrar formulario
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }
