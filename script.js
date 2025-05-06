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
  
  