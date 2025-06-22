/*function authenticateUser() {

    const phone = document.getElementById('phone').value;
    if (phone) {
      alert('Authenticated: ' + phone);
      document.getElementById('reservation-controls').style.display = 'block';
    }
  }
  
  function reserveClass() {
    alert('Class Reserved');
  }
  
  function cancelReservation() {
    alert('Reservation Canceled');
  }
  
  function confirmPayment() {
    alert('Payment Confirmed');
  }
  
  document.getElementById('customForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Request submitted!');
  });
  */ 
  document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendar-days');
    const selectedDateElem = document.getElementById('selected-date');
    const timeSlotsElem = document.getElementById('time-slots');
    const monthYearElem = document.getElementById('month-year');
  
    let currentDate = new Date(2024, 6); 
    const availableTimes = ["10:00am", "11:00am", "1:00pm", "2:30pm", "4:00pm"];
  
    function renderCalendar(date) {
      calendarGrid.innerHTML = '';
      monthYearElem.textContent = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  
      for (let i = 0; i < firstDay; i++) {
        const filler = document.createElement('div');
        calendarGrid.appendChild(filler);
      }
  
      for (let d = 1; d <= daysInMonth; d++) {
        const dayButton = document.createElement('button');
        dayButton.textContent = d;
        dayButton.className = 'calendar-day';
        dayButton.addEventListener('click', () => {
          document.querySelectorAll('.calendar-day').forEach(btn => btn.classList.remove('selected'));
          dayButton.classList.add('selected');
          const fullDate = new Date(date.getFullYear(), date.getMonth(), d);
          selectedDateElem.textContent = fullDate.toDateString();
          renderTimeSlots(fullDate);
        });
        calendarGrid.appendChild(dayButton);
      }
    }
  
    function renderTimeSlots(date) {
      timeSlotsElem.innerHTML = '';
      availableTimes.forEach(time => {
        const timeBtn = document.createElement('button');
        timeBtn.textContent = time;
        timeBtn.className = 'time-button';
        timeBtn.addEventListener('click', () => {
          document.querySelectorAll('.time-button').forEach(btn => btn.classList.remove('selected'));
          timeBtn.classList.add('selected');
          addConfirmButton(date, time);
        });
        timeSlotsElem.appendChild(timeBtn);
      });
    }
  
    function addConfirmButton(date, time) {
      let existing = document.querySelector('.confirm-button');
      if (existing) existing.remove();
  
      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'Confirm';
      confirmBtn.className = 'confirm-button';
      confirmBtn.addEventListener('click', () => {
        const reservation = {
          date: date.toISOString().split('T')[0],
          time: time
        };
  
        // Send to server
        fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reservation)
        })
        .then(res => res.json())
        .then(data => alert('Reservation confirmed!'))
        .catch(err => alert('Reservation failed'));
      });
      timeSlotsElem.appendChild(confirmBtn);
    }
  
    document.getElementById('prev-month').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar(currentDate);
    });
  
    document.getElementById('next-month').addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar(currentDate);
    });
  
    renderCalendar(currentDate);
  });
  
  


/* second */ 

document.addEventListener('DOMContentLoaded', () => {

    // --- Common Image Hover Effect for Cards ---
    // (Existing code, ensure it's still present)
    const allCardsWithImages = document.querySelectorAll('.class-card, .product-card');

    allCardsWithImages.forEach(card => {
        const mainImage = card.querySelector('img');
        const defaultImage = card.dataset.defaultImage;
        const hoverImage = card.dataset.hoverImage;

        if (mainImage && defaultImage && hoverImage) {
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
        }
    });

    // --- Basic Calendar Interactivity (Visual only, no actual date logic) ---
    // (Existing code, ensure it's still present)
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
        monthYearDisplay.textContent = "July 2024";

        prevMonthBtn.addEventListener('click', () => {
            console.log("Previous month clicked (functionality not implemented)");
        });

        nextMonthBtn.addEventListener('click', () => {
            console.log("Next month clicked (functionality not implemented)");
        });
    }

    // --- Store Page Product & Pagination Logic ---
    // (Existing code, ensure it's still present)
    const productsGrid = document.getElementById('productsGrid');
    const paginationContainer = document.getElementById('pagination');
    const productsPerPage = 10;
    let currentPage = 1;
    let allProducts = [];

    async function fetchProducts() {
        if (!productsGrid || !paginationContainer) return; // Only run if store page elements exist
        try {
            // Replace with your actual API endpoint if you build one
            const response = await fetch('http://localhost:5000/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProducts = await response.json();
            renderProducts(currentPage);
            setupPagination();
        } catch (error) {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = '<p>Failed to load products. Please try again later.</p>';
        }
    }

    function renderProducts(page) { /* ... existing code ... */ }
    function setupPagination() { /* ... existing code ... */ }
    function updatePaginationButtons() { /* ... existing code ... */ }
    function applyProductCardHoverEffects() { /* ... existing code ... */ }

    if (productsGrid && paginationContainer) {
        fetchProducts();
    }


    // --- New: Inspiration Gallery Logic ---
    const inspirationGallery = document.getElementById('inspirationGallery');

    // Array of inspiration image URLs
    const inspirationImages = [
        "https://via.placeholder.com/350x250/E0E0E0/000000?text=Custom+Piece+1",
        "https://via.placeholder.com/350x400/D0D0D0/000000?text=Custom+Piece+2",
        "https://via.placeholder.com/350x300/C0C0C0/000000?text=Custom+Piece+3",
        "https://via.placeholder.com/350x200/B0B0B0/000000?text=Custom+Piece+4",
        "https://via.placeholder.com/350x350/A0A0A0/000000?text=Custom+Piece+5",
        "https://via.placeholder.com/350x280/909090/000000?text=Custom+Piece+6",
        "https://via.placeholder.com/350x220/808080/000000?text=Custom+Piece+7",
        "https://via.placeholder.com/350x380/707070/000000?text=Custom+Piece+8",
        "https://via.placeholder.com/350x250/606060/000000?text=Custom+Piece+9",
        "https://via.placeholder.com/350x300/505050/000000?text=Custom+Piece+10",
        "https://via.placeholder.com/350x200/404040/000000?text=Custom+Piece+11",
        "https://via.placeholder.com/350x350/303030/000000?text=Custom+Piece+12"
        // Add more image URLs as needed
    ];

    function renderInspirationGallery() {
        if (!inspirationGallery) return; // Only run if gallery element exists

        inspirationGallery.innerHTML = ''; // Clear existing gallery
        inspirationImages.forEach(imageUrl => {
            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');
            galleryItem.innerHTML = `<img src="${imageUrl}" alt="Custom Pottery Idea">`;
            inspirationGallery.appendChild(galleryItem);
        });
    }

    // Call this function when the DOM is ready for the contact page
    if (inspirationGallery) {
        renderInspirationGallery();
    }

    // --- Add basic functionality for "View on Map" (if applicable) ---
    const viewOnMapBtn = document.querySelector('.view-on-map');
    if (viewOnMapBtn) {
        viewOnMapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert("This would open a map link to your studio location!");
        });
    }

});