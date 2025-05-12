let currentBookingId = null;

function openPaymentModal(bookingId) {
  currentBookingId = bookingId;
  const modal = document.getElementById('paymentModal');
  const bookingIdInput = document.getElementById('paymentBookingId');
  bookingIdInput.value = bookingId;
  modal.classList.remove('hidden');
  console.log('Opened payment modal for bookingId:', bookingId);
}

function closePaymentModal() {
  const modal = document.getElementById('paymentModal');
  modal.classList.add('hidden');
  document.getElementById('paymentForm').reset();
  currentBookingId = null;
  console.log('Closed payment modal');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('paymentForm');
  const bookingStatus = document.getElementById('booking-status');
  const bookingStatusText = document.getElementById('booking-status-text');
  const paymentStatusText = document.getElementById('payment-status-text');
  const payButton = document.getElementById('pay-button');
  const paymentSuccess = document.getElementById('payment-success');
  const paymentError = document.getElementById('payment-error');

  if (!form || !bookingStatus || !bookingStatusText || !paymentStatusText || !payButton || !paymentSuccess || !paymentError) {
    console.error('Payment elements not found:', {
      form: !!form,
      bookingStatus: !!bookingStatus,
      bookingStatusText: !!bookingStatusText,
      paymentStatusText: !!paymentStatusText,
      payButton: !!payButton,
      paymentSuccess: !!paymentSuccess,
      paymentError: !!paymentError,
    });
    return;
  }

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  if (!csrfToken) {
    console.error('CSRF token not found');
    paymentError.textContent = 'Ошибка: CSRF-токен не найден. Пожалуйста, обновите страницу.';
    paymentError.classList.remove('hidden');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Payment form submitted for bookingId:', currentBookingId);

    const cardNumber = document.getElementById('cardNumber').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;

    // Клиентская валидация
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      paymentError.textContent = 'Некорректный номер карты';
      paymentError.classList.remove('hidden');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
      paymentError.textContent = 'Некорректный срок действия';
      paymentError.classList.remove('hidden');
      return;
    }
    if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
      paymentError.textContent = 'Некорректный CVV';
      paymentError.classList.remove('hidden');
      return;
    }

    try {
      const formData = new FormData(form);
      console.log('FormData contents:', Object.fromEntries(formData)); // Логируем содержимое FormData
      const response = await fetch(`/bookings/${currentBookingId}/pay`, {
        method: 'POST',
        headers: {
          'CSRF-Token': csrfToken,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Payment response:', result);

      if (response.ok) {
        bookingStatus.classList.remove('hidden');
        bookingStatusText.textContent = 'confirmed';
        paymentStatusText.textContent = 'completed';
        payButton.classList.add('hidden');
        paymentSuccess.classList.remove('hidden');
        paymentError.classList.add('hidden');
        closePaymentModal();
      } else {
        paymentError.textContent = result.error || 'Ошибка оплаты';
        paymentError.classList.remove('hidden');
        paymentSuccess.classList.add('hidden');
        bookingStatusText.textContent = 'pending';
        paymentStatusText.textContent = 'failed';
        payButton.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Payment error:', error);
      paymentError.textContent = 'Ошибка при обработке оплаты';
      paymentError.classList.remove('hidden');
      paymentSuccess.classList.add('hidden');
    }
  });
});