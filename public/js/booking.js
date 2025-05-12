document.addEventListener('DOMContentLoaded', () => {
  console.log('booking.js loaded');

  const calendarEl = document.querySelector('#calendar');
  const bookingForm = document.querySelector('#booking-form');
  const tourDateInput = document.querySelector('#tourDate');
  const participantsInput = document.querySelector('#participants');
  const bookTourBtn = document.querySelector('#book-tour-btn');
  const bookingError = document.querySelector('#booking-error');
  const bookingSuccess = document.querySelector('#booking-success');
  const bookingStatus = document.querySelector('#booking-status');
  const bookingStatusText = document.querySelector('#booking-status-text');
  const paymentStatusText = document.querySelector('#payment-status-text');
  const payButton = document.querySelector('#pay-button');

  if (!calendarEl || !bookingForm || !tourDateInput || !participantsInput || !bookTourBtn || !bookingError || !bookingSuccess) {
    console.error('Required elements not found:', {
      calendarEl: !!calendarEl,
      bookingForm: !!bookingForm,
      tourDateInput: !!tourDateInput,
      participantsInput: !!participantsInput,
      bookTourBtn: !!bookTourBtn,
      bookingError: !!bookingError,
      bookingSuccess: !!bookingSuccess,
    });
    return;
  }

  if (!bookingStatus || !bookingStatusText || !paymentStatusText || !payButton) {
    console.error('Payment status elements not found:', {
      bookingStatus: !!bookingStatus,
      bookingStatusText: !!bookingStatusText,
      paymentStatusText: !!paymentStatusText,
      payButton: !!payButton,
    });
    return;
  }

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  if (!csrfToken) {
    console.error('CSRF token not found');
    bookingError.textContent = 'Ошибка: CSRF-токен не найден. Пожалуйста, обновите страницу.';
    bookingError.classList.remove('hidden');
    bookTourBtn.disabled = true;
    return;
  }

  const tourId = window.tourData.id;
  const tourType = window.tourData.type;
  const seasonStart = new Date(window.tourData.season.start);
  const seasonEnd = new Date(window.tourData.season.end);
  const maxGroupSize = window.tourData.maxGroupSize;
  const minGroupSize = window.tourData.minGroupSize || 1; // Значение по умолчанию
  const durationDays = window.tourData.durationDays;

  console.log('Tour data:', { tourId, tourType, seasonStart, seasonEnd, maxGroupSize, minGroupSize, durationDays });

  if (isNaN(seasonStart.getTime()) || isNaN(seasonEnd.getTime())) {
    console.error('Invalid season dates:', window.tourData.season);
    bookingError.textContent = 'Ошибка: некорректные даты сезона';
    bookingError.classList.remove('hidden');
    bookTourBtn.disabled = true;
    return;
  }

  // Инициализация FullCalendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'ru',
    validRange: {
      start: seasonStart,
      end: new Date(seasonEnd.getTime() + 86400000),
    },
    events: async function(fetchInfo, successCallback, failureCallback) {
      try {
        const response = await fetch(`/tours/${tourId}/availability`);
        const events = await response.json();
        console.log('Availability events:', events);
        const filteredEvents = events.filter(event => event.availableSlots >= minGroupSize);
        console.log('Filtered events for calendar:', filteredEvents);
        successCallback(filteredEvents);
      } catch (error) {
        console.error('Error fetching availability for calendar:', error);
        bookingError.textContent = 'Ошибка загрузки доступных дат';
        bookingError.classList.remove('hidden');
        failureCallback(error);
      }
    },
    eventDidMount: function(info) {
      tippy(info.el, {
        content: info.event.extendedProps.availableSlots >= minGroupSize
          ? `Осталось мест: ${info.event.extendedProps.availableSlots}`
          : 'Нет доступных мест',
        placement: 'top',
        theme: 'light',
      });
    },
    eventClick: function(info) {
      if (info.event.extendedProps.availableSlots >= minGroupSize) {
        tourDateInput.value = info.event.startStr;
        participantsInput.max = info.event.extendedProps.availableSlots;
        bookingError.classList.add('hidden');
        console.log('Selected date from calendar:', info.event.startStr, 'Available slots:', info.event.extendedProps.availableSlots);
      }
    }
  });
  calendar.render();

  // Заполнение выпадающего списка для active, camping, excursion
  if (['active', 'camping', 'excursion'].includes(tourType)) {
    fetch(`/tours/${tourId}/availability`)
      .then(response => response.json())
      .then(events => {
        console.log('Fetched availability for select:', events);
        const select = tourDateInput;
        select.innerHTML = '<option value="">Выберите дату</option>';
        const availableDates = events
          .filter(event => event.availableSlots >= minGroupSize)
          .map(event => event.start);
        console.log('Available dates for select:', availableDates);

        events.forEach(event => {
          if (event.availableSlots >= minGroupSize) {
            const option = document.createElement('option');
            option.value = event.start;
            option.textContent = new Date(event.start).toLocaleDateString('ru-RU');
            select.appendChild(option);
          }
        });

        // Валидация выбора даты
        tourDateInput.addEventListener('change', () => {
          const selectedDate = tourDateInput.value;
          console.log('Selected date in select:', selectedDate);
          if (selectedDate && !availableDates.includes(selectedDate)) {
            bookingError.textContent = 'Выбранная дата недоступна';
            bookingError.classList.remove('hidden');
            tourDateInput.value = '';
            participantsInput.max = '';
          } else {
            bookingError.classList.add('hidden');
            const event = events.find(e => e.start === selectedDate);
            participantsInput.max = event ? event.availableSlots : maxGroupSize;
          }
        });
      })
      .catch(error => {
        console.error('Error fetching availability for select:', error);
        bookingError.textContent = 'Ошибка загрузки доступных дат';
        bookingError.classList.remove('hidden');
      });
  } else {
    // Валидация дат для passive и health туров
    fetch(`/tours/${tourId}/availability`)
      .then(response => response.json())
      .then(events => {
        console.log('Fetched availability for input:', events);
        const availableDates = events
          .filter(event => event.availableSlots >= minGroupSize)
          .map(event => event.start);
        console.log('Available dates for input:', availableDates);

        tourDateInput.min = seasonStart.toISOString().split('T')[0];
        tourDateInput.max = seasonEnd.toISOString().split('T')[0];

        tourDateInput.addEventListener('input', () => {
          const selectedDate = tourDateInput.value;
          console.log('Selected date in input:', selectedDate);
          if (selectedDate && !availableDates.includes(selectedDate)) {
            bookingError.textContent = 'Выбранная дата недоступна';
            bookingError.classList.remove('hidden');
            tourDateInput.value = '';
            participantsInput.max = '';
          } else {
            bookingError.classList.add('hidden');
            const event = events.find(e => e.start === selectedDate);
            participantsInput.max = event ? event.availableSlots : maxGroupSize;
          }
        });
      })
      .catch(error => {
        console.error('Error fetching availability for input:', error);
        bookingError.textContent = 'Ошибка загрузки доступных дат';
        bookingError.classList.remove('hidden');
      });
  }

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Booking form submitted');

    const tourDate = tourDateInput.value;
    const participants = parseInt(participantsInput.value);

    if (!tourDate) {
      bookingError.textContent = 'Пожалуйста, выберите дату тура';
      bookingError.classList.remove('hidden');
      bookingSuccess.classList.add('hidden');
      return;
    }

    const selectedDate = new Date(tourDate);
    if (isNaN(selectedDate.getTime())) {
      bookingError.textContent = 'Некорректная дата тура';
      bookingError.classList.remove('hidden');
      bookingSuccess.classList.add('hidden');
      return;
    }

    if (selectedDate < seasonStart || selectedDate > seasonEnd) {
      bookingError.textContent = `Дата должна быть в пределах сезона: с ${seasonStart.toLocaleDateString('ru-RU')} по ${seasonEnd.toLocaleDateString('ru-RU')}`;
      bookingError.classList.remove('hidden');
      bookingSuccess.classList.add('hidden');
      return;
    }

    if (!participants || participants < 1) {
      bookingError.textContent = 'Количество участников должно быть больше 0';
      bookingError.classList.remove('hidden');
      bookingSuccess.classList.add('hidden');
      return;
    }

    try {
      bookTourBtn.disabled = true;
      bookTourBtn.textContent = 'Бронирование...';

      const response = await fetch('/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          tourId,
          tourDate,
          participants,
        }),
      });

      console.log('Booking response status:', response.status);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error('Сервер вернул некорректный ответ');
      }

      if (response.status === 403) {
        throw new Error('Недействительный CSRF-токен. Пожалуйста, обновите страницу.');
      }

      if (!response.ok) {
        throw new Error(data.error || `Ошибка бронирования (статус ${response.status})`);
      }

      console.log('Booking response data:', data);

      bookingError.classList.add('hidden');
      bookingSuccess.textContent = data.message || 'Тур успешно забронирован! Пожалуйста, оплатите, чтобы подтвердить.';
      bookingSuccess.classList.remove('hidden');
      
      // Показать блок статуса брони
      bookingStatus.classList.remove('hidden');
      bookingStatusText.textContent = 'pending';
      paymentStatusText.textContent = 'pending';
      payButton.classList.remove('hidden');
      payButton.onclick = () => openPaymentModal(data.bookingId);

      bookingForm.reset();
      calendar.refetchEvents();
      if (['active', 'camping', 'excursion'].includes(tourType)) {
        tourDateInput.innerHTML = '<option value="">Выберите дату</option>';
        fetch(`/tours/${tourId}/availability`)
          .then(response => response.json())
          .then(events => {
            events.forEach(event => {
              if (event.availableSlots >= minGroupSize) {
                const option = document.createElement('option');
                option.value = event.start;
                option.textContent = new Date(event.start).toLocaleDateString('ru-RU');
                tourDateInput.appendChild(option);
              }
            });
          });
      }
    } catch (error) {
      console.error('Booking error:', error.message);
      bookingError.textContent = error.message;
      bookingError.classList.remove('hidden');
      bookingSuccess.classList.add('hidden');
    } finally {
      bookTourBtn.disabled = false;
      bookTourBtn.textContent = 'Забронировать';
    }
  });
});