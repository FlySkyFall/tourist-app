document.addEventListener('DOMContentLoaded', () => {
  console.log('tours.js loaded');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const toursList = document.querySelector('.tours-list');
  const pagination = document.querySelector('.pagination');
  const pageInfo = document.querySelector('.pagination + p');
  const searchInput = document.querySelector('#tour-search');
  const regionFilter = document.querySelector('#region-filter');
  const minPriceInput = document.querySelector('#min-price');
  const maxPriceInput = document.querySelector('#max-price');
  const startDateInput = document.querySelector('#start-date');
  const endDateInput = document.querySelector('#end-date');
  const applyPriceDateBtn = document.querySelector('#apply-price-date');
  const sortByFilter = document.querySelector('#sort-by');
  const minDurationInput = document.querySelector('#min-duration');
  const maxDurationInput = document.querySelector('#max-duration');
  const difficultyFilter = document.querySelector('#difficulty-filter');
  const applyDurationDifficultyBtn = document.querySelector('#apply-duration-difficulty');
  const amenitiesFilter = document.querySelector('#amenities-filter');
  const applyAmenitiesBtn = document.querySelector('#apply-amenities');

  console.log('Found elements:', {
    filterButtons: filterButtons.length,
    toursList: !!toursList,
    pagination: !!pagination,
    pageInfo: !!pageInfo,
    searchInput: !!searchInput,
    regionFilter: !!regionFilter,
    minPriceInput: !!minPriceInput,
    maxPriceInput: !!maxPriceInput,
    startDateInput: !!startDateInput,
    endDateInput: !!endDateInput,
    applyPriceDateBtn: !!applyPriceDateBtn,
    sortByFilter: !!sortByFilter,
    minDurationInput: !!minDurationInput,
    maxDurationInput: !!maxDurationInput,
    difficultyFilter: !!difficultyFilter,
    applyDurationDifficultyBtn: !!applyDurationDifficultyBtn,
    amenitiesFilter: !!amenitiesFilter,
    applyAmenitiesBtn: !!applyAmenitiesBtn,
  });

  if (!pageInfo) console.warn('pageInfo element not found, pagination info will not be updated');

  const debounceSearch = _.debounce((value, type, page, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities) => {
    fetchTours(type, page, value, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
  }, 300);

  const fetchTours = async (type = '', page = 1, search = '', region = '', minPrice = '', maxPrice = '', startDate = '', endDate = '', sortBy = '', minDuration = '', maxDuration = '', difficulties = '', amenities = '') => {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (page !== 1) params.append('page', page);
      if (search) params.append('search', search);
      if (region) params.append('region', region);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (sortBy) params.append('sortBy', sortBy);
      if (minDuration) params.append('minDuration', minDuration);
      if (maxDuration) params.append('maxDuration', maxDuration);
      if (difficulties) params.append('difficulties', difficulties);
      if (amenities) params.append('amenities', amenities);
      const url = `/tours/filter?${params.toString()}`;
      console.log('Sending fetch to:', url);
      console.log('Fetch parameters:', { type, page, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities });

      if (toursList) {
        toursList.innerHTML = '<p class="text-center text-gray-600">Загрузка...</p>';
      }

      const response = await fetch(url);
      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
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
          : '<p class="text-center text-gray-600 col-span-3">Нет доступных туров для выбранных фильтров</p>';
      }

      if (pagination && data.totalPages > 1) {
        pagination.innerHTML = `
          ${data.currentPage > 1 ? `<button data-page="${data.currentPage - 1}" data-type="${type}" data-search="${search}" data-region="${region}" data-min-price="${minPrice}" data-max-price="${maxPrice}" data-start-date="${startDate}" data-end-date="${endDate}" data-sort-by="${sortBy}" data-min-duration="${minDuration}" data-max-duration="${maxDuration}" data-difficulties="${difficulties}" data-amenities="${amenities}" class="pagination-btn px-4 py-2 mx-1 bg-gray-200 rounded">Предыдущая</button>` : '<span class="pagination-btn px-4 py-2 mx-1 bg-gray-200 rounded opacity-50 cursor-not-allowed">Предыдущая</span>'}
          ${Array.from({ length: data.totalPages }, (_, i) => `
            <button data-page="${i + 1}" data-type="${type}" data-search="${search}" data-region="${region}" data-min-price="${minPrice}" data-max-price="${maxPrice}" data-start-date="${startDate}" data-end-date="${endDate}" data-sort-by="${sortBy}" data-min-duration="${minDuration}" data-max-duration="${maxDuration}" data-difficulties="${difficulties}" data-amenities="${amenities}" class="pagination-btn px-4 py-2 mx-1 rounded ${data.currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}">${i + 1}</button>
          `).join('')}
          ${data.currentPage < data.totalPages ? `<button data-page="${data.currentPage + 1}" data-type="${type}" data-search="${search}" data-region="${region}" data-min-price="${minPrice}" data-max-price="${maxPrice}" data-start-date="${startDate}" data-end-date="${endDate}" data-sort-by="${sortBy}" data-min-duration="${minDuration}" data-max-duration="${maxDuration}" data-difficulties="${difficulties}" data-amenities="${amenities}" class="pagination-btn px-4 py-2 mx-1 bg-gray-200 rounded">Следующая</button>` : '<span class="pagination-btn px-4 py-2 mx-1 bg-gray-200 rounded opacity-50 cursor-not-allowed">Следующая</span>'}
        `;
      } else if (pagination) {
        pagination.innerHTML = '';
      }

      if (pageInfo) {
        pageInfo.textContent = `Страница: ${data.currentPage} из ${data.totalPages} (Туров на странице: ${data.toursOnPage}, Всего туров: ${data.totalTours})`;
      }

      const newUrl = `/tours${params.toString() ? `?${params.toString()}` : ''}`;
      history.pushState({ type, page, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities }, '', newUrl);

      if (pagination) {
        pagination.querySelectorAll('.pagination-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            const type = btn.dataset.type || '';
            const search = btn.dataset.search || '';
            const region = btn.dataset.region || '';
            const minPrice = btn.dataset.minPrice || '';
            const maxPrice = btn.dataset.maxPrice || '';
            const startDate = btn.dataset.startDate || '';
            const endDate = btn.dataset.endDate || '';
            const sortBy = btn.dataset.sortBy || '';
            const minDuration = btn.dataset.minDuration || '';
            const maxDuration = btn.dataset.maxDuration || '';
            const difficulties = btn.dataset.difficulties || '';
            const amenities = btn.dataset.amenities || '';
            if (page) fetchTours(type, page, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
          });
        });
      }
    } catch (error) {
      console.error('Ошибка фильтрации:', error.message);
      if (toursList) {
        toursList.innerHTML = `<p class="text-center text-red-600 col-span-3">Ошибка фильтрации: ${error.message}</p>`;
      }
    }
  };

  if (filterButtons.length) {
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        console.log('Filter button clicked, type:', button.dataset.type);
        const type = button.dataset.type || '';
        filterButtons.forEach(btn => {
          btn.classList.remove('bg-blue-600', 'text-white');
          btn.classList.add('bg-gray-200', 'text-gray-800');
        });
        button.classList.remove('bg-gray-200', 'text-gray-800');
        button.classList.add('bg-blue-600', 'text-white');
        const search = searchInput ? searchInput.value.trim() : '';
        const region = regionFilter ? regionFilter.value : '';
        const minPrice = minPriceInput ? minPriceInput.value.trim() : '';
        const maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';
        const startDate = startDateInput ? startDateInput.value : '';
        const endDate = endDateInput ? endDateInput.value : '';
        const sortBy = sortByFilter ? sortByFilter.value : '';
        const minDuration = minDurationInput ? minDurationInput.value.trim() : '';
        const maxDuration = maxDurationInput ? maxDurationInput.value.trim() : '';
        const difficulties = difficultyFilter ? Array.from(difficultyFilter.selectedOptions).map(opt => opt.value).join(',') : '';
        const amenities = amenitiesFilter ? Array.from(amenitiesFilter.selectedOptions).map(opt => opt.value).join(',') : '';
        fetchTours(type, 1, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const searchValue = searchInput.value.trim();
      const currentType = Array.from(filterButtons).find(btn => btn.classList.contains('bg-blue-600'))?.dataset.type || '';
      const region = regionFilter ? regionFilter.value : '';
      const minPrice = minPriceInput ? minPriceInput.value.trim() : '';
      const maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';
      const startDate = startDateInput ? startDateInput.value : '';
      const endDate = endDateInput ? endDateInput.value : '';
      const sortBy = sortByFilter ? sortByFilter.value : '';
      const minDuration = minDurationInput ? minDurationInput.value.trim() : '';
      const maxDuration = maxDurationInput ? maxDurationInput.value.trim() : '';
      const difficulties = difficultyFilter ? Array.from(difficultyFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      const amenities = amenitiesFilter ? Array.from(amenitiesFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      debounceSearch(searchValue, currentType, 1, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
    });
  }

  if (regionFilter) {
    regionFilter.addEventListener('change', () => {
      console.log('Region filter changed:', regionFilter.value);
      const region = regionFilter.value;
      const currentType = Array.from(filterButtons).find(btn => btn.classList.contains('bg-blue-600'))?.dataset.type || '';
      const search = searchInput ? searchInput.value.trim() : '';
      const minPrice = minPriceInput ? minPriceInput.value.trim() : '';
      const maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';
      const startDate = startDateInput ? startDateInput.value : '';
      const endDate = endDateInput ? endDateInput.value : '';
      const sortBy = sortByFilter ? sortByFilter.value : '';
      const minDuration = minDurationInput ? minDurationInput.value.trim() : '';
      const maxDuration = maxDurationInput ? maxDurationInput.value.trim() : '';
      const difficulties = difficultyFilter ? Array.from(difficultyFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      const amenities = amenitiesFilter ? Array.from(amenitiesFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      fetchTours(currentType, 1, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
    });
  }

  if (applyPriceDateBtn) {
    applyPriceDateBtn.addEventListener('click', () => {
      console.log('Apply price/date filter clicked');
      const minPrice = minPriceInput ? minPriceInput.value.trim() : '';
      const maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';
      const startDate = startDateInput ? startDateInput.value : '';
      const endDate = endDateInput ? endDateInput.value : '';
      const currentType = Array.from(filterButtons).find(btn => btn.classList.contains('bg-blue-600'))?.dataset.type || '';
      const search = searchInput ? searchInput.value.trim() : '';
      const region = regionFilter ? regionFilter.value : '';
      const sortBy = sortByFilter ? sortByFilter.value : '';
      const minDuration = minDurationInput ? minDurationInput.value.trim() : '';
      const maxDuration = maxDurationInput ? maxDurationInput.value.trim() : '';
      const difficulties = difficultyFilter ? Array.from(difficultyFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      const amenities = amenitiesFilter ? Array.from(amenitiesFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      fetchTours(currentType, 1, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
    });
  }

  if (sortByFilter) {
    sortByFilter.addEventListener('change', () => {
      console.log('Sort by filter changed:', sortByFilter.value);
      const sortBy = sortByFilter.value;
      const currentType = Array.from(filterButtons).find(btn => btn.classList.contains('bg-blue-600'))?.dataset.type || '';
      const search = searchInput ? searchInput.value.trim() : '';
      const region = regionFilter ? regionFilter.value : '';
      const minPrice = minPriceInput ? minPriceInput.value.trim() : '';
      const maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';
      const startDate = startDateInput ? startDateInput.value : '';
      const endDate = endDateInput ? endDateInput.value : '';
      const minDuration = minDurationInput ? minDurationInput.value.trim() : '';
      const maxDuration = maxDurationInput ? maxDurationInput.value.trim() : '';
      const difficulties = difficultyFilter ? Array.from(difficultyFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      const amenities = amenitiesFilter ? Array.from(amenitiesFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      fetchTours(currentType, 1, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
    });
  }

  if (applyDurationDifficultyBtn) {
    applyDurationDifficultyBtn.addEventListener('click', () => {
      console.log('Apply duration/difficulty filter clicked');
      const minDuration = minDurationInput ? minDurationInput.value.trim() : '';
      const maxDuration = maxDurationInput ? maxDurationInput.value.trim() : '';
      const difficulties = difficultyFilter ? Array.from(difficultyFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      const currentType = Array.from(filterButtons).find(btn => btn.classList.contains('bg-blue-600'))?.dataset.type || '';
      const search = searchInput ? searchInput.value.trim() : '';
      const region = regionFilter ? regionFilter.value : '';
      const minPrice = minPriceInput ? minPriceInput.value.trim() : '';
      const maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';
      const startDate = startDateInput ? startDateInput.value : '';
      const endDate = endDateInput ? endDateInput.value : '';
      const sortBy = sortByFilter ? sortByFilter.value : '';
      const amenities = amenitiesFilter ? Array.from(amenitiesFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      fetchTours(currentType, 1, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
    });
  }

  if (applyAmenitiesBtn) {
    applyAmenitiesBtn.addEventListener('click', () => {
      console.log('Apply amenities filter clicked');
      const amenities = amenitiesFilter ? Array.from(amenitiesFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      const currentType = Array.from(filterButtons).find(btn => btn.classList.contains('bg-blue-600'))?.dataset.type || '';
      const search = searchInput ? searchInput.value.trim() : '';
      const region = regionFilter ? regionFilter.value : '';
      const minPrice = minPriceInput ? minPriceInput.value.trim() : '';
      const maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';
      const startDate = startDateInput ? startDateInput.value : '';
      const endDate = endDateInput ? endDateInput.value : '';
      const sortBy = sortByFilter ? sortByFilter.value : '';
      const minDuration = minDurationInput ? minDurationInput.value.trim() : '';
      const maxDuration = maxDurationInput ? maxDurationInput.value.trim() : '';
      const difficulties = difficultyFilter ? Array.from(difficultyFilter.selectedOptions).map(opt => opt.value).join(',') : '';
      fetchTours(currentType, 1, search, region, minPrice, maxPrice, startDate, endDate, sortBy, minDuration, maxDuration, difficulties, amenities);
    });
  }

  window.addEventListener('popstate', (event) => {
    if (event.state) {
      fetchTours(event.state.type, event.state.page, event.state.search, event.state.region, event.state.minPrice, event.state.maxPrice, event.state.startDate, event.state.endDate, event.state.sortBy, event.state.minDuration, event.state.maxDuration, event.state.difficulties, event.state.amenities);
      filterButtons.forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-800');
        if (btn.dataset.type === event.state.type) {
          btn.classList.remove('bg-gray-200', 'text-gray-800');
          btn.classList.add('bg-blue-600', 'text-white');
        }
      });
      if (searchInput) searchInput.value = event.state.search || '';
      if (regionFilter) regionFilter.value = event.state.region || '';
      if (minPriceInput) minPriceInput.value = event.state.minPrice || '';
      if (maxPriceInput) maxPriceInput.value = event.state.maxPrice || '';
      if (startDateInput) startDateInput.value = event.state.startDate || '';
      if (endDateInput) endDateInput.value = event.state.endDate || '';
      if (sortByFilter) sortByFilter.value = event.state.sortBy || '';
      if (minDurationInput) minDurationInput.value = event.state.minDuration || '';
      if (maxDurationInput) maxDurationInput.value = event.state.maxDuration || '';
      if (difficultyFilter) {
        const selectedDifficulties = event.state.difficulties ? event.state.difficulties.split(',') : [];
        Array.from(difficultyFilter.options).forEach(opt => {
          opt.selected = selectedDifficulties.includes(opt.value);
        });
      }
      if (amenitiesFilter) {
        const selectedAmenities = event.state.amenities ? event.state.amenities.split(',') : [];
        Array.from(amenitiesFilter.options).forEach(opt => {
          opt.selected = selectedAmenities.includes(opt.value);
        });
      }
    }
  });
});