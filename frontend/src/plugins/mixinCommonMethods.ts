export default defineNuxtPlugin((nuxtApp) => {
  // Добавляет к объекту карты nomination дополнительные поля
  const mapObjectDefaults = (nmObject: any) => {
    if (nmObject.address && nmObject.category) {
      // Короткое название
      var shortNameArr = []
      const name = nmObject.address[nmObject.category]
      if (name) shortNameArr.push(name)
      if (nmObject.address.state) shortNameArr.push(nmObject.address.state)
      if (!nmObject.address.state && nmObject.address.region) shortNameArr.push(nmObject.address.region)
      if (nmObject.address.city) shortNameArr.push('г. ' + nmObject.address.city)
      if (nmObject.address.municipality) shortNameArr.push(nmObject.address.municipality)
      if (nmObject.address.village) shortNameArr.push(nmObject.address.village)
      if (nmObject.address.road) shortNameArr.push(nmObject.address.road)
      if (nmObject.address.house_number) shortNameArr.push('д. ' + nmObject.address.house_number)
      nmObject.shortName = shortNameArr.join(', ')

      // Улица и номер дома
      shortNameArr = []
      if (nmObject.address.road) shortNameArr.push(nmObject.address.road)
      if (nmObject.address.house_number) shortNameArr.push('д. ' + nmObject.address.house_number)
      nmObject.shortAddress = shortNameArr.join(', ')

      const buildingTypes = {
        // Жилые
        apartments: 'Многоквартирный жилой дом',
        barracks: 'Казармы.',
        bungalow: 'Небольшой одноэтажный летний домик',
        cabin: 'Неопределён',
        detached: 'Частный жилой дом',
        dormitory: 'Общежитие',
        farm: 'Жилой дом на ферме',
        ger: 'Круглая юрта или гэр',
        hotel: 'Гостиница',
        house: 'Индивидуальный жилой дом',
        houseboat: 'Лодка-жилище',
        residential: 'Жилое здание',
        semidetached_house: 'Жилой дом 2 семьи',
        static_caravan: 'Передвижной дом',
        stilt_house: 'Дом на сваях',
        terrace: 'Ряд жилых домов',
        tree_house: 'Дом на дереве',
        // Коммерческие
        commercial: 'Офисное здание',
        industrial: 'Промышленное здание',
        kiosk: 'Киоск',
        office: 'Офисное здание',
        retail: 'Магазин',
        supermarket: 'Супермаркет',
        warehouse: 'Складские здания',
        // Религиозные
        cathedral: 'Собор',
        chapel: 'Часовня',
        church: 'Церковь, храм',
        kingdom_hall: 'Церковь Иеговы',
        monastery: 'Монастырь',
        mosque: 'Мечеть',
        presbytery: 'Пресвитерия',
        religious: 'Религиозное здание',
        shrine: 'Святыня',
        synagogue: 'Синагога',
        temple: 'Храм',
        // Общественные
        bakehouse: 'Пекарня',
        bridge: 'Здание-мост',
        civic: 'Административное здание',
        college: 'Колледж',
        fire_station: 'Пожарная часть',
        government: 'Правительственое здание',
        gatehouse: 'КПП',
        hospital: 'Корпус больницы',
        kindergarten: 'Детский сад',
        public: 'Общественное здание',
        school: 'Школа',
        toilets: 'Общественный туалет',
        train_station: 'Вокзал',
        transportation: 'Здание общественного транспорта',
        university: 'Университет',
        // Сельскохозяйственные
        barn: 'Склад',
        conservatory: 'Зимний сад',
        cowshed: 'Коровник',
        farm_auxiliary: 'Нежилые здания фермы',
        greenhouse: 'Теплица',
        slurry_tank: 'Хранилище отходов',
        stable: 'Конюшня',
        sty: 'Свинарник',
        // Спортивные
        grandstand: 'Трибуна',
        pavilion: 'Спортивный павильон',
        riding_hall: 'Манеж',
        sports_hall: 'Спортивный зал',
        stadium: 'Стадион',
        // Хранение
        hangar: 'Ангар',
        hut: 'Склад',
        shed: 'Сарай',
        // Автомобили
        carport: 'Навес для машин',
        garage: 'Отдельностоящий гараж',
        garages: 'Гаражи, ГСК',
        parking: 'Парковка автомобилей',
        // Энергетические и технические здания
        digester: 'Варочный котёл',
        service: 'Служебные постройки',
        transformer_tower: 'Трансформаторная башня',
        water_tower: 'Водонапорная башня',
        storage_tank: 'Накопительный бак',
        silo: 'Силос',
        // Прочие
        beach_hut: 'Пляжная кабинка',
        bunker: 'Бункер',
        castle: 'За́мок',
        construction: 'Стройка',
        container: 'Контейнер',
        dog_house: 'Собачья будка',
        military: 'Военное здание',
        roof: 'Навес',
        ruins: 'Заброшеный дом',
        tent: 'Палатка, тент',
      }

      const shopTypes = {
        alcohol: 'Магазин алкогольной продукции',
        bakery: 'Хлебный магазин',
        beverages: 'Магазин напитков',
        brewing_supplies: 'Магазин напитков',
        butcher: 'Мясные изделия',
        cheese: 'Магазин сыра',
        chocolate: 'Магазин шоколада',
        coffee: 'Магазин кофе',
        confectionery: 'Кондитерская',
        convenience: 'Повседневные товары',
        deli: 'Магазин деликатесов',
        dairy: 'Магазин молочных продуктов',
        farm: 'Фермерский магазин',
        frozen_food: 'Магазин замороженных продуктов',
        greengrocer: 'Магазин свежих фруктов и овощей',
        health_food: 'Товары для здоровья',
        ice_cream: 'Магазин мороженного',
        pasta: 'Магазин макаронных изделий',
        pastry: 'Магазин кондитерских изделий',
        seafood: 'Магазин морепродуктов',
        spices: 'Магазин специй',
        tea: 'Магазин чая',
        wine: 'Магазин вина',
        water: 'Продажа питьевой воды',
        department_store: 'Универмаг',
        general: 'Магазин',
        kiosk: 'Киоск',
        mall: 'Торговый центр',
        supermarket: 'Супермаркет',
        wholesale: 'Оптовый магазин',
        // Одежда, обувь и аксессуары
        baby_goods: 'Магазин детских товаров',
        bag: 'Магазин сумок',
        boutique: 'Бутик',
        clothes: 'Магазин одежды',
        fabric: 'Магазин тканей',
        fashion: 'Магазин брендовой одежды',
        fashion_accessories: 'Магазин аксессуаров',
        jewelry: 'Ювелирный магазин',
        leather: 'Магазин изделий из кожи',
        sewing: 'Магазин товаров для шитья',
        shoes: 'Обувной магазин',
        tailor: 'Ателье',
        watches: 'Магазин часов',
        wool: 'Магазин шерстяных товаров',
        // Эконом, секонд хенд, благотворительные магазины
        charity: 'Благотворительный магазин',
        second_hand: 'Секонд-хенд',
        variety_store: 'Товары по одной цене',
        // Салоны красоты, косметика, уход за здоровьем
        beauty: 'Салон красоты',
        chemist: 'Бытовая химия',
        cosmetics: 'Магазин косметики',
        erotic: 'Магазин эротических товаров',
        hairdresser: 'Парикмахерская',
        hairdresser_supply: 'Магазин товаров для ухода за волосами',
        hearing_aids: 'Магазин слуховых аппаратов',
        herbalist: 'Магазин трав',
        massage: 'Массажный салон',
        medical_supply: 'Магазин медицинских изделий',
        nutrition_supplements: 'Аптека',
        optician: 'Оптика',
        perfumery: 'Парфюмерный магазин',
        tattoo: 'Тату салон',
        // Хозяйственные, строительные, "сделай сам"
        agrarian: 'Магазин аграрных продуктов',
        appliance: 'Магазин бытовой техники',
        bathroom_furnishing: 'Сантехника',
        doityourself: 'Магазин инструментов',
        electrical: 'Магазин электротоваров',
        energy: 'Магазин накопителей энергии',
        fireplace: 'Продажа каминов',
        florist: 'Магазин флористики',
        garden_centre: 'Магазин семян',
        garden_furniture: 'Магазины по продаже садовой мебели',
        gas: 'Продажа газа в баллонах',
        glaziery: 'Магазин окон/дверей',
        groundskeeping: 'Магазин уличного оборудования',
        hardware: 'Хозяйственный магазин',
        houseware: 'Магазин посуды',
        locksmith: 'Изготовление ключей',
        paint: 'Магазин красок',
        security: 'Продажа охранных систем',
        trade: 'Оптовый склад',
        // Мебель и интерьер
        antiques: 'Магазин антиквариата',
        candles: 'Магазин свечей',
        carpet: 'Ковровый магазин',
        curtain: 'Магазин штор',
        doors: 'Магазин дверей',
        flooring: 'Магазин напольных покрытий',
        furniture: 'Мебельный магазин',
        household_linen: 'Продажа шерстяных изделий',
        interior_decoration: 'Магазин декора',
        kitchen: 'Магазин кухонь',
        lighting: 'Продажа осветительных приборов',
        tiles: 'Магазин плитки',
        window_blind: 'Магазин штор',
        // Электроника, бытовая техника
        computer: 'Компьютерный магазин',
        electronics: 'Магазин бытовой электроники',
        hifi: 'Магазин аудио и видео-аппаратуры',
        mobile_phone: 'Магазин мобильных телефонов',
        radiotechnics: 'Магазин радиодеталей',
        telecommunication: 'Магазин ТВ',
        vacuum_cleaner: 'Магазин пылесосов',
        // Спорт, путешествия, транспорт
        atv: 'Магазин квадрациклов',
        bicycle: 'Магазин велосипедов',
        boat: 'Магазин лодок',
        car: 'Автосалон',
        car_repair: 'Автомастерская',
        car_parts: 'Магазин автозапчастей',
        caravan: 'Магазин автодомов',
        fuel: 'Продажа топлива',
        fishing: 'Магазин рыболовных принадлежностей',
        golf: 'Магазин оборудования для игры в гольф',
        hunting: 'Охотничий магазин',
        jetski: 'Магазин гидроциклов',
        military_surplus: 'Военторг',
        motorcycle: 'Магазмн мототехники',
        outdoor: 'Магазин товаров для туризма',
        scuba_diving: 'Магазин товаров для подводного плавания',
        ski: 'Магазин лыжных товаров',
        snowmobile: 'Магазин снегоходов',
        sports: 'Магазин спортивных товаров',
        swimming_pool: 'Магазин бассейнов',
        trailer: 'Магазин трейлеров',
        tyres: 'Магазин шин',
        // Художественные, музыкальные
        art: 'Магазин товаров искусства',
        camera: 'Магазин фотоаппаратов',
        collector: 'Магазин коллекционеров',
        craft: 'Магазин канцелярии',
        frame: 'Магазин багета',
        games: 'Магазин настольных игр',
        model: 'Магазин масштабных моделей',
        music: 'Музыкальный магазин',
        musical_instrument: 'Магазин музыкальных инструментов',
        photo: 'Магазин фото-товаров',
        trophy: 'Магазин трофеев',
        video: 'Магазин видео, видеопрокат',
        video_games: 'Магазин видеоигр',
        // Книги, журналы, канцелярские принадлежности, открытки
        anime: 'Магазин аниме',
        books: 'Книжный магазин',
        gift: 'Продажа подарков',
        lottery: 'Магазин лот. билетов',
        newsagent: 'Пресса',
        stationery: 'Канцтовары',
        ticket: 'Продажа билетов',
        // Прочие, без категории
        bookmaker: 'Приём ставок',
        copyshop: 'Услуги фотокопирования и печати',
        dry_cleaning: 'Химчистка',
        funeral_directors: 'Ритуальные услуги',
        insurance: 'Услуги страхования',
        laundry: 'Прачечная',
        money_lender: 'Кредитор',
        outpost: 'Пункт выдачи заказов',
        party: 'Товары для праздника',
        pawnbroker: 'Ломбард',
        pest_control: 'Пестициды',
        pet: 'Зоомагазин',
        pet_grooming: 'Зоотовары',
        pyrotechnics: 'Магазин пиротехники',
        religion: 'Магазин религиозных товаров',
        storage_rental: 'Хранения автомобилей',
        tobacco: 'Магазин табака',
        toys: 'Магазин игрушек',
        travel_agency: 'Туристическое агентство',
        weapons: 'Магазин оружия',
      }

      const amenityTypes = {
        bar: 'Торговля спиртными напитками',
        biergarten: 'Пивная',
        cafe: 'Кофейня',
        fast_food: 'Бистро',
        food_court: 'Ресторанный дворик',
        ice_cream: 'Кафе-мороженое',
        pub: 'Бар',
        restaurant: 'Ресторан',
        // Образование
        college: 'Колледж',
        driving_school: 'Автошкола',
        kindergarten: 'Детский сад',
        language_school: 'Языковая школа',
        library: 'Библиотека',
        toy_library: 'Прокат игр',
        research_institute: 'Исследовательский институт',
        training: 'Тренировочный зал',
        music_school: 'Музыкальная школа',
        school: 'Школа',
        traffic_park: 'Автошкола',
        university: 'ВУЗ',
        // Транспорт
        bicycle_parking: 'Парковка для велосипедов',
        bicycle_repair_station: 'Место ремонта велосипеда',
        bicycle_rental: 'Аренда велосипедов',
        boat_rental: 'Прокат лодок',
        boat_sharing: 'Прокат лодок',
        bus_station: 'Автостанция',
        car_rental: 'Аренда автомобилей',
        car_sharing: 'Каршаринг',
        car_wash: 'Автомойка',
        compressed_air: 'Замена шин',
        vehicle_inspection: 'ДПС',
        charging_station: 'Зарядная станция для электромобилей',
        driver_training: 'Автогородок',
        ferry_terminal: 'Паромный причал',
        fuel: 'АЗС',
        grit_bin: 'Противогололёдные материалы',
        motorcycle_parking: 'Парковки для мотоциклов',
        parking: 'Стоянка',
        parking_entrance: 'Въезд на подземную стоянку',
        parking_space: 'Парковочное место',
        taxi: 'Стоянка такси',
        // Финансы
        atm: 'Банкомат',
        bank: 'Банк',
        bureau_de_change: 'Пункт обмена валют',
        // Здоровье
        baby_hatch: 'Бэби-бокс',
        clinic: 'Поликлиника',
        dentist: 'Стоматология',
        doctors: 'Мед-пункт',
        hospital: 'Больница',
        nursing_home: 'Дом пристарелых',
        pharmacy: 'Аптека',
        social_facility: 'Социальные услуги',
        veterinary: 'Ветеринарная клиника',
        // Досуг, искусство и культура
        arts_centre: 'Выставочный центр',
        brothel: 'Публичный дом',
        casino: 'Казино',
        cinema: 'Кинотеатр',
        community_centre: 'Дом творчества',
        conference_centre: 'Конференц-центр',
        events_venue: 'Деловой центр',
        exhibition_centre: 'Выставочный центр',
        fountain: 'Фонтан',
        gambling: 'Азартные игры',
        love_hotel: 'Почасовой отель',
        music_venue: 'Музыкальный отель',
        nightclub: 'Ночной клуб',
        planetarium: 'Планетарий',
        public_bookcase: 'Уличный книжный шкаф',
        social_centre: 'Место свободной некоммерческой деятельности',
        stripclub: 'Стрипклуб',
        studio: 'Студия',
        swingerclub: 'Свингер-клуб',
        theatre: 'Театр',
        courthouse: 'Суд',
        fire_station: 'Пожарная часть',
        police: 'Полицейский участок',
        post_box: 'Почтовый ящик',
        post_depot: 'Почта',
        post_office: 'Почтовое отделение',
        prison: 'Тюрьма',
        ranger_station: 'Полицейский участок',
        townhall: 'Городская администрация',
        bbq: 'Места отдыха',
        bench: 'Скамейка',
        dog_toilet: 'Туалет для животных',
        dressing_room: 'Раздевалка',
        drinking_water: 'Питьевая вода',
        give_box: 'Обмен вещами',
        mailroom: 'Выдача посылок',
        parcel_locker: 'Приём посылок',
        shelter: 'Навес',
        shower: 'Общественый душ',
        telephone: 'Телефон',
        toilets: 'Туалет',
        water_point: 'Питьевая вода',
        watering_place: 'Поилка для животных',
        sanitary_dump_station: 'Сбор отходов',
        recycling: 'Сбор отходов',
        waste_basket: 'Урна',
        waste_disposal: 'Мусорный контейнер',
        waste_transfer_station: 'Распределение мусора',
        // Другое
        animal_boarding: 'Отель для животных',
        animal_breeding: 'Содержание животных',
        animal_shelter: 'Приют для животных',
        animal_training: 'Тренировка животных',
        baking_oven: 'Пекарня',
        childcare: 'Детская комната',
        clock: 'Уличные часы',
        crematorium: 'Крематорий',
        dive_centre: 'Точка старта соревнований',
        funeral_hall: 'Похоронный зал',
        grave_yard: 'Захоронение',
        hunting_stand: 'Охотничья вышка',
        internet_cafe: 'Интернет-кафе',
        kitchen: 'Общественная кухня',
        kneipp_water_cure: 'Ножная ванна Кнайпа',
        lounger: 'Лежак',
        marketplace: 'Торговая площадь',
        monastery: 'Монастырь',
        photo_booth: 'Фотокиоск',
        place_of_mourning: 'Похоронный зал',
        place_of_worship: 'Религиозное сооружение',
        public_bath: 'Баня',
        refugee_site: 'Приют для беженцев',
        vending_machine: 'Автомат',
      }

      const categories: any = {
        place: { category_rus: 'Нас. пункты', icon: 'empty', ob_title: 'Нас. пункт' },
        landuse: { category_rus: 'Землепольз.', icon: 'fi_landplot', ob_title: 'Землепользование' },
        building: { category_rus: 'Здания', icon: 'ksi_building', ob_title: 'Здание', types: buildingTypes },
        amenity: {
          category_rus: 'Сфера услуг',
          icon: 'fi_user',
          ob_title: 'Объект сферы услуг',
          types: amenityTypes,
        },
        tourism: { category_rus: 'Туризм', icon: 'empty', ob_title: 'Туристический объект' },
        leisure: { category_rus: 'Досуг', icon: 'empty', ob_title: 'Объект досуга' },
        shop: { category_rus: 'Торговля', icon: 'empty', ob_title: 'Магазин', types: shopTypes },
        craft: { category_rus: 'Мастерские', icon: 'empty', ob_title: 'Мастерская' },
        office: { category_rus: 'Офисы', icon: 'ksi_building', ob_title: 'Офис' },
        highway: { category_rus: 'Трассы', icon: 'empty', ob_title: 'Трасса' },
        waterway: { category_rus: 'Водоёмы', icon: 'empty', ob_title: 'Водоём' },
        aeroway: { category_rus: 'Аэропорты', icon: 'empty', ob_title: 'Аэропорт' },
        cycleway: { category_rus: 'Велодорожки', icon: 'empty', ob_title: 'Велодорожка' },
        railway: { category_rus: 'Ж/д пути', icon: 'empty', ob_title: 'Ж/д путь' },
        boundary: { category_rus: 'Границы', icon: 'fi_landplot', ob_title: 'Административное образование' },
        power: { category_rus: 'Энергетика', icon: 'fi_landplot', ob_title: 'Энергетика' },
        man_made: {
          category_rus: 'Искусственные сооружения',
          icon: 'fi_landplot',
          ob_title: 'Искусственное сооружение',
        },
      }

      // Название
      if (nmObject.category in categories) {
        nmObject.category_rus = categories[nmObject.category].category_rus
        if (categories[nmObject.category].types && nmObject.type in categories[nmObject.category].types) {
          nmObject.type_rus = categories[nmObject.category].types[nmObject.type]
          nmObject.title = nmObject.type_rus
        } else {
          nmObject.title = categories[nmObject.category].ob_title
        }
        nmObject.icon = categories[nmObject.category].icon
      } else {
        nmObject.title = nmObject.category
        nmObject.icon = 'fas fa-question-circle'
      }
      if (name) nmObject.title += ' "' + name + '"'
    }
  }
  return {
    provide: {
      mapObjectDefaults,
    },
  }
})
