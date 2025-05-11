const placesData = {
  attractions: [
    {
      id: "attraction1",
      name: "Ласточкино гнездо",
      description: "Иконический замок на скале Аврора, расположенный недалеко от Ялты. Построен в 1912 году, это одна из самых узнаваемых достопримечательностей Крыма.",
      imageUrl: "/img/swallows-nest.jpg",
      category: "Достопримечательность",
      location: "Ялта, Крым",
      website: "https://замок-ласточкино-гнездо.рф"
    },
    {
      id: "attraction2",
      name: "Гора Ай-Петри",
      description: "Одна из самых популярных природных достопримечательностей Крыма. Высота пика составляет 1234 метра, с вершины открывается потрясающий вид на побережье.",
      imageUrl: "/img/ai-petri.jpg",
      category: "Достопримечательность",
      location: "Ялта, Крым"
    },
    {
      id: "attraction3",
      name: "Херсонес Таврический",
      description: "Древний город, основанный греками более 2000 лет назад. Считается колыбелью русского христианства, так как здесь крестился князь Владимир.",
      imageUrl: "/img/chersonese.jpg",
      category: "Достопримечательность",
      location: "Севастополь, Крым"
    }
  ],
  restaurants: [
    {
      id: "restaurant1",
      name: "Rybny-Vyny",
      description: "Небольшое кафе в Балаклаве, известное своими вкусными морепродуктами и вином. Расположено недалеко от моря, идеально для ужина после прогулки.",
      imageUrl: "/img/rybny-vyny.jpg",
      category: "Ресторан",
      location: "Балаклава, Крым"
    },
    {
      id: "restaurant2",
      name: "Tarelka",
      description: "Популярное кафе в Гурзуфе, известное своим уютом и вкусной едой. Отличное место для завтрака или ужина.",
      imageUrl: "/img/tarelka.jpg",
      category: "Ресторан",
      location: "Гурзуф, Крым"
    },
    {
      id: "restaurant3",
      name: "Kozachok",
      description: "Ресторан с отличной украинской кухней в Гурзуфе. Здесь подают традиционные блюда, которые понравятся любителям сытной еды.",
      imageUrl: "/img/kozachok.jpg",
      category: "Ресторан",
      location: "Гурзуф, Крым"
    }
  ],
  hotels: [
    {
      id: "hotel1",
      name: "Oreanda",
      description: "Один из лучших отелей Ялты с красивой набережной, комфортабельными номерами и высоким уровнем сервиса.",
      imageUrl: "/img/oreanda.jpg",
      category: "Отель",
      location: "Ялта, Крым",
      website: "https://oreanda.com"
    },
    {
      id: "hotel2",
      name: "Villa Elena Hotel & Residences",
      description: "Роскошный отель в Ялте с видом на море, предлагающий комфортное проживание и отличный сервис.",
      imageUrl: "/img/villa-elena.jpg",
      category: "Отель",
      location: "Ялта, Крым"
    },
    {
      id: "hotel3",
      name: "Levant Eco Hotel",
      description: "Эко-отель в Ялте, идеально подходящий для тех, кто ищет спокойный отдых на природе.",
      imageUrl: "/img/levant-eco.jpg",
      category: "Отель",
      location: "Ялта, Крым"
    }
  ]
};

exports.getTravelPage = (req, res) => {
  try {
    res.render('travels/travel', {
      attractions: placesData.attractions,
      restaurants: placesData.restaurants,
      hotels: placesData.hotels,
      user: req.user || null
    });
  } catch (error) {
    console.error('Ошибка загрузки страницы "Куда поехать":', error);
    res.status(500).render('error', { message: 'Ошибка загрузки страницы' });
  }
};

exports.getPlacePage = (req, res) => {
  try {
    const placeId = req.params.id;
    const allPlaces = [
      ...placesData.attractions,
      ...placesData.restaurants,
      ...placesData.hotels
    ];
    const place = allPlaces.find(p => p.id === placeId);
    if (!place) {
      return res.status(404).render('error', { message: 'Место не найдено' });
    }
    res.render('travels/place', {
      place,
      user: req.user || null
    });
  } catch (error) {
    console.error('Ошибка загрузки страницы места:', error);
    res.status(500).render('error', { message: 'Ошибка загрузки страницы места' });
  }
};