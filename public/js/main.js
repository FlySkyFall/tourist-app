document.addEventListener('DOMContentLoaded', () => {
  // Карусель туров (для index.hbs)
  const carousel = document.querySelector('#tour-carousel');
  const prevBtn = document.querySelector('#carousel-prev');
  const nextBtn = document.querySelector('#carousel-next');
  let totalItems = 0;
  let currentIndex = 0;
  const cardWidth = 336; // w-80 (320px) + mx-2 (8px * 2 = 16px)

  const updateCarousel = () => {
    if (carousel && totalItems > 0) {
      // Ограничиваем currentIndex, чтобы не прокручивать за последнюю карточку
      const maxIndex = Math.max(0, totalItems - Math.floor(carousel.parentElement.offsetWidth / cardWidth));
      currentIndex = Math.min(Math.max(currentIndex, 0), maxIndex);
      carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
      // Обновляем состояние кнопок
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }
  };

  if (carousel) {
    // Отключаем встроенную прокрутку
    carousel.style.overflowX = 'hidden';

    // Предотвращаем ручную прокрутку
    carousel.addEventListener('scroll', (e) => {
      e.preventDefault();
      carousel.scrollLeft = 0; // Сбрасываем прокрутку
    });

    // Предотвращаем прокрутку колесом мыши
    carousel.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaX > 0 || e.deltaY > 0) {
        // Прокрутка вправо
        if (currentIndex < totalItems - Math.floor(carousel.parentElement.offsetWidth / cardWidth)) {
          currentIndex++;
          updateCarousel();
        }
      } else if (e.deltaX < 0 || e.deltaY < 0) {
        // Прокрутка влево
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      }
    });

    // Поддержка сенсорного управления
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    carousel.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Предотвращаем прокрутку
    });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchStartX - touchEndX;
      if (swipeDistance > 50) {
        // Свайп влево (вперёд)
        if (currentIndex < totalItems - Math.floor(carousel.parentElement.offsetWidth / cardWidth)) {
          currentIndex++;
          updateCarousel();
        }
      } else if (swipeDistance < -50) {
        // Свайп вправо (назад)
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      }
    });

    totalItems = carousel.querySelectorAll('.tour-card').length;
    updateCarousel();

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentIndex < totalItems - 1) {
          currentIndex++;
          updateCarousel();
        }
      });

      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });
    }

    // Автоматическая прокрутка
    let autoSlide = setInterval(() => {
      if (currentIndex < totalItems - Math.floor(carousel.parentElement.offsetWidth / cardWidth)) {
        currentIndex++;
      } else {
        currentIndex = 0; // Возвращаемся в начало
      }
      updateCarousel();
    }, 5000);

    carousel.addEventListener('mouseenter', () => clearInterval(autoSlide));
    carousel.addEventListener('mouseleave', () => {
      autoSlide = setInterval(() => {
        if (currentIndex < totalItems - Math.floor(carousel.parentElement.offsetWidth / cardWidth)) {
          currentIndex++;
        } else {
          currentIndex = 0;
        }
        updateCarousel();
      }, 5000);
    });

    // Обновление карусели при изменении размера окна
    window.addEventListener('resize', updateCarousel);
  }

  // Фильтрация туров на главной странице (index.hbs)
  const filterButtons = document.querySelectorAll('.filter-btn');
  const tourCarousel = document.querySelector('#tour-carousel');
  filterButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const category = button.dataset.category;

      filterButtons.forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-800');
      });
      button.classList.remove('bg-gray-200', 'text-gray-800');
      button.classList.add('bg-blue-600', 'text-white');

      if (tourCarousel) {
        tourCarousel.classList.add('loading');
        tourCarousel.innerHTML = '<p class="text-center text-gray-600">Загрузка...</p>';

        try {
          const response = await fetch(`/filter-tours?type=${category === 'all' ? '' : encodeURIComponent(category)}`);
          if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
          }
          const data = await response.json();

          if (data.tours && data.tours.length > 0) {
            tourCarousel.innerHTML = data.tours
              .map(tour => `
                <div class="tour-card flex-none w-80 mx-2" data-category="${tour.type}">
                  <div class="bg-gray-100 rounded-lg shadow-md overflow-hidden">
                    <img src="${tour.images[0] || '/img/placeholder.jpg'}" alt="${tour.title}" class="w-full h-48 object-cover">
                    <div class="p-4">
                      <h3 class="text-xl font-semibold mb-2">${tour.title}</h3>
                      <p class="text-gray-600 mb-2">${tour.description.substring(0, 100)}${tour.description.length > 100 ? '...' : ''}</p>
                      <p class="text-blue-600 font-bold mb-4">${tour.price} ₽</p>
                      <a href="/tours/${tour._id}" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Подробнее</a>
                    </div>
                  </div>
                </div>
              `)
              .join('');
          } else {
            tourCarousel.innerHTML = '<p class="text-center text-gray-600">Нет туров в этой категории</p>';
          }

          totalItems = tourCarousel.querySelectorAll('.tour-card').length;
          currentIndex = 0;
          updateCarousel();
        } catch (error) {
          console.error('Ошибка фильтрации:', error);
          tourCarousel.innerHTML = `<p class="text-center text-red-600">Ошибка загрузки туров: ${error.message}</p>`;
        } finally {
          tourCarousel.classList.remove('loading');
        }
      }
    });
  });


  // Фильтрация туров на странице региона (regions/:id)
  const regionFilterButtons = document.querySelectorAll('.region-filter-btn');
  const toursList = document.querySelector('.tours-list');
  const pagination = document.querySelector('.pagination');
  const pageInfo = document.querySelector('.pagination + p'); // Исправленный селектор

  console.log('Region filter elements:', {
    regionFilterButtons: regionFilterButtons.length,
    toursList: !!toursList,
    pagination: !!pagination,
    pageInfo: !!pageInfo,
  });

  if (!toursList) console.error('toursList not found');
  if (!pagination) console.error('pagination not found');
  if (!pageInfo) console.error('pageInfo not found');

  if (regionFilterButtons.length) {
    const regionId = window.location.pathname.split('/').pop();

    const fetchRegionTours = async (type = 'all', page = 1) => {
      try {
        const url = `/regions/${regionId}/filter?type=${encodeURIComponent(type)}&page=${page}`;
        console.log('Fetching tours:', url);
        if (toursList) {
          toursList.innerHTML = '<p class="text-center text-gray-600">Загрузка...</p>';
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ошибка: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetch data:', data);

        if (toursList) {
          toursList.innerHTML = data.tours && data.tours.length
            ? data.tours.map(tour => `
                <div class="tour-card bg-gray-100 rounded-lg shadow-md overflow-hidden" data-category="${tour.type}">
                  <img src="${tour.images[0] || '/img/placeholder.jpg'}" alt="${tour.title}" class="w-full h-48 object-cover">
                  <div class="p-4">
                    <h3 class="text-xl font-semibold mb-2">${tour.title}</h3>
                    <p class="text-gray-600 mb-2">${tour.description}</p>
                    <p class="text-blue-600 font-bold mb-4">${tour.price} ₽</p>
                    <a href="/tours/${tour._id}" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Подробнее</a>
                  </div>
                </div>
              `).join('')
            : '<p class="text-center text-gray-600 col-span-3">Нет туров для выбранного типа</p>';
        }

        if (pagination) {
          if (data.totalPages > 1) {
            pagination.innerHTML = `
              ${data.currentPage > 1 ? `<button data-page="${data.currentPage - 1}" data-type="${type}" class="pagination-btn px-4 py-2 mx-1 bg-gray-200 rounded">Предыдущая</button>` : '<span class="pagination-btn px-4 py-2 mx-1 bg-gray-200 rounded opacity-50 cursor-not-allowed">Предыдущая</span>'}
              ${Array.from({ length: data.totalPages }, (_, i) => `
                <button data-page="${i + 1}" data-type="${type}" class="pagination-btn px-4 py-2 mx-1 rounded ${data.currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}">${i + 1}</button>
              `).join('')}
              ${data.currentPage < data.totalPages ? `<button data-page="${data.currentPage + 1}" data-type="${type}" class="pagination-btn px-4 py-2 mx-1 bg-gray-200 rounded">Следующая</button>` : '<span class="pagination-btn px-4 py-2 mx-1 bg-gray-200 rounded opacity-50 cursor-not-allowed">Следующая</span>'}
            `;
          } else {
            pagination.innerHTML = '';
          }
        }

        if (pageInfo) {
          pageInfo.textContent = `Страница: ${data.currentPage} из ${data.totalPages} (Туров на странице: ${data.toursOnPage}, Всего туров: ${data.totalTours})`;
        }

        const newUrl = `/regions/${regionId}${type === 'all' && page === 1 ? '' : `?${type !== 'all' ? `type=${type}` : ''}${type !== 'all' && page !== 1 ? '&' : ''}${page !== 1 ? `page=${page}` : ''}`}`;
        history.pushState({ type, page }, '', newUrl);

        if (pagination) {
          pagination.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const page = parseInt(btn.dataset.page);
              const type = btn.dataset.type;
              if (page) fetchRegionTours(type, page);
            });
          });
        }
      } catch (error) {
        console.error('Ошибка фильтрации:', error);
        if (toursList) {
          toursList.innerHTML = `<p class="text-center text-red-600 col-span-3">Ошибка фильтрации: ${error.message}</p>`;
        }
      }
    };

    regionFilterButtons.forEach(button => {
      button.addEventListener('click', () => {
        console.log('Region filter button clicked:', button.dataset.type);
        const type = button.dataset.type;
        regionFilterButtons.forEach(btn => {
          btn.classList.remove('bg-blue-600', 'text-white');
          btn.classList.add('bg-gray-200', 'text-gray-800');
        });
        button.classList.remove('bg-gray-200', 'text-gray-800');
        button.classList.add('bg-blue-600', 'text-white');
        fetchRegionTours(type, 1);
      });
    });

    window.addEventListener('popstate', (event) => {
      if (event.state) {
        fetchRegionTours(event.state.type, event.state.page);
        regionFilterButtons.forEach(btn => {
          btn.classList.remove('bg-blue-600', 'text-white');
          btn.classList.add('bg-gray-200', 'text-gray-800');
          if (btn.dataset.type === event.state.type) {
            btn.classList.remove('bg-gray-200', 'text-gray-800');
            btn.classList.add('bg-blue-600', 'text-white');
          }
        });
      }
    });
  }

  // Плавная прокрутка для навигации
  const navLinks = document.querySelectorAll('.navbar a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 60,
          behavior: 'smooth',
        });
      } else {
        window.location.href = link.getAttribute('href');
      }
    });
  });

  // Эффект прокрутки для навигации
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
});