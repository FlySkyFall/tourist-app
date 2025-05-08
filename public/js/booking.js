document.addEventListener('DOMContentLoaded', () => {
  console.log('booking.js loaded');
  
  const calendarEl = document.querySelector('#calendar');
  const bookingForm = document.querySelector('#booking-form');
  const tourDateInput = document.querySelector('#tourDate');
  const participantsInput = document.querySelector('#participants');
  const bookTourBtn = document.querySelector('#book-tour-btn');
  const bookingError = document.querySelector('#booking-error');
  const bookingSuccess = document.querySelector('#booking-success');

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
  const durationDays = window.tourData.durationDays;

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
    events: `/tours/${tourId}/availability`,
    eventClick: function(info) {
      if (info.event.extendedProps.availableSlots >= 1) {
        if (['active', 'camping', 'excursion'].includes(tourType)) {
          const select = tourDateInput;
          const option = select.querySelector(`option[value="${info.event.startStr}"]`);
          if (option) {
            select.value = info.event.startStr;
          }
        } else {
          tourDateInput.value = info.event.startStr;
        }
        participantsInput.max = Math.min(info.event.extendedProps.availableSlots, maxGroupSize);
      }
    }
  });
  calendar.render();

  // Заполнение выпадающего списка для active, camping, excursion
  if (['active', 'camping', 'excursion'].includes(tourType)) {
    fetch(`/tours/${tourId}/availability`)
      .then(response => response.json())
      .then(events => {
        const select = tourDateInput;
        events.forEach(event => {
          if (event.availableSlots >= 1) {
            const option = document.createElement('option');
            option.value = event.start;
            option.textContent = new Date(event.start).toLocaleDateString('ru-RU');
            select.appendChild(option);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching availability:', error);
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

    if (participants > maxGroupSize) {
      bookingError.textContent = `Количество участников не может превышать ${maxGroupSize}`;
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
      bookingSuccess.textContent = data.message || 'Тур успешно забронирован!';
      bookingSuccess.classList.remove('hidden');
      bookingForm.reset();
      calendar.refetchEvents();
      if (['active', 'camping', 'excursion'].includes(tourType)) {
        tourDateInput.innerHTML = '<option value="">Выберите дату</option>';
        fetch(`/tours/${tourId}/availability`)
          .then(response => response.json())
          .then(events => {
            events.forEach(event => {
              if (event.availableSlots >= 1) {
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