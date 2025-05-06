document.addEventListener('DOMContentLoaded', () => {
  console.log('booking.js loaded');
  const bookingForm = document.querySelector('#booking-form');
  const bookingDateInput = document.querySelector('#bookingDate');
  const participantsInput = document.querySelector('#participants');
  const bookTourBtn = document.querySelector('#book-tour-btn');
  const bookingError = document.querySelector('#booking-error');
  const bookingSuccess = document.querySelector('#booking-success');

  if (!bookingForm || !bookingDateInput || !participantsInput || !bookTourBtn || !bookingError || !bookingSuccess) {
    console.error('Required elements not found:', {
      bookingForm: !!bookingForm,
      bookingDateInput: !!bookingDateInput,
      participantsInput: !!participantsInput,
      bookTourBtn: !!bookTourBtn,
      bookingError: !!bookingError,
      bookingSuccess: !!bookingSuccess,
    });
    return;
  }

  // Получение CSRF-токена
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  console.log('CSRF meta tag:', csrfMeta);
  const csrfToken = csrfMeta?.content;
  if (!csrfToken) {
    console.error('CSRF token not found');
    bookingError.textContent = 'Ошибка: CSRF-токен не найден. Пожалуйста, обновите страницу.';
    bookingError.classList.remove('hidden');
    bookTourBtn.disabled = true;
    return;
  }
  console.log('CSRF token:', csrfToken);

  // Получение дат сезона из window.tourData
  const tourSeasonStart = new Date(window.tourData?.season?.start);
  const tourSeasonEnd = new Date(window.tourData?.season?.end);

  // Проверка валидности дат
  if (isNaN(tourSeasonStart.getTime()) || isNaN(tourSeasonEnd.getTime())) {
    console.error('Invalid season dates:', {
      start: window.tourData?.season?.start,
      end: window.tourData?.season?.end,
    });
    bookingError.textContent = 'Ошибка: некорректные даты сезона';
    bookingError.classList.remove('hidden');
    bookTourBtn.disabled = true;
    return;
  }

  // Установка минимальной и максимальной даты
  bookingDateInput.min = tourSeasonStart.toISOString().split('T')[0];
  bookingDateInput.max = tourSeasonEnd.toISOString().split('T')[0];

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Booking form submitted');

    const bookingDate = bookingDateInput.value;
    const participants = parseInt(participantsInput.value);
    const maxGroupSize = parseInt(participantsInput.max);

    // Клиентская валидация
    if (!bookingDate) {
      bookingError.textContent = 'Пожалуйста, выберите дату бронирования';
      bookingError.classList.remove('hidden');
      bookingSuccess.classList.add('hidden');
      return;
    }

    const selectedDate = new Date(bookingDate);
    if (isNaN(selectedDate.getTime())) {
      bookingError.textContent = 'Некорректная дата бронирования';
      bookingError.classList.remove('hidden');
      bookingSuccess.classList.add('hidden');
      return;
    }

    if (selectedDate < tourSeasonStart || selectedDate > tourSeasonEnd) {
      bookingError.textContent = `Дата должна быть в пределах сезона: с ${tourSeasonStart.toLocaleDateString('ru-RU')} по ${tourSeasonEnd.toLocaleDateString('ru-RU')}`;
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
          tourId: bookingForm.querySelector('input[name="tourId"]').value,
          bookingDate,
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