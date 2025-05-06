document.addEventListener('DOMContentLoaded', () => {
  console.log('booking-list.js loaded');
  const cancelForms = document.querySelectorAll('form[action*="/cancel"]');

  if (!cancelForms.length) {
    console.warn('No cancel forms found');
    return;
  }

  // Получение CSRF-токена
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  if (!csrfToken) {
    console.error('CSRF token not found');
    alert('Ошибка: CSRF-токен не найден');
    return;
  }

  cancelForms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cancelButton = form.querySelector('button[type="submit"]');
      const formAction = form.action;
      console.log('Form action:', formAction);

      const bookingIdMatch = formAction.match(/\/bookings\/(.+)\/cancel$/);
      if (!bookingIdMatch || !bookingIdMatch[1]) {
        console.error('Invalid form action, cannot extract bookingId:', formAction);
        alert('Ошибка: невозможно определить идентификатор бронирования');
        return;
      }

      const bookingId = bookingIdMatch[1];
      console.log('Cancel form submitted for booking:', bookingId);

      // Проверка формата bookingId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingId);
      if (!isValidObjectId) {
        console.error('Invalid bookingId format:', bookingId);
        alert('Ошибка: неверный формат идентификатора бронирования');
        return;
      }

      try {
        cancelButton.disabled = true;
        cancelButton.textContent = 'Отмена...';

        const response = await fetch(`/bookings/${bookingId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'CSRF-Token': csrfToken,
          },
        });

        console.log('Cancel response status:', response.status);

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON:', jsonError);
          throw new Error('Сервер вернул некорректный ответ');
        }

        if (!response.ok) {
          throw new Error(data.error || `Ошибка отмены (статус ${response.status})`);
        }

        console.log('Cancel response data:', data);

        // Перенаправление на страницу бронирований
        window.location.href = '/bookings';
      } catch (error) {
        console.error('Cancel error:', error.message);
        alert(`Ошибка: ${error.message}`);
      } finally {
        cancelButton.disabled = false;
        cancelButton.textContent = 'Отменить';
      }
    });
  });
});