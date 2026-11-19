// Travel facts for every Indian state and union territory, carried over from the original desktop app.
export type StateInfo = {
  name: string;
  slug: string;
  type: "State" | "Union Territory";
  culture: string;
  tradition: string;
  language: string;
  touristPlaces: string[];
  cuisines: string[];
  bestTime: string;
  monuments: string[];
  adventures: string[];
};

export const STATES: StateInfo[] = [
  {
    "name": "Andhra Pradesh",
    "slug": "andhra-pradesh",
    "type": "State",
    "culture": "Kuchipudi dance, Sankranti festival",
    "tradition": "Temple architecture, Kalamkari art",
    "language": "Telugu",
    "touristPlaces": [
      "Tirupati",
      "Araku Valley"
    ],
    "cuisines": [
      "Hyderabadi biryani",
      "Pesarattu"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Charminar (Hyderabad, historical)",
      "Golconda Fort",
      "Lepakshi Temple",
      "Undavalli Caves"
    ],
    "adventures": [
      "Water Sports in Rushikonda Beach",
      "Trekking in Araku Valley",
      "Caving in Borra Caves"
    ]
  },
  {
    "name": "Arunachal Pradesh",
    "slug": "arunachal-pradesh",
    "type": "State",
    "culture": "Tribal festivals (Losar, Dree)",
    "tradition": "Monpa wood craft, yak dances",
    "language": "English, Nyishi",
    "touristPlaces": [
      "Tawang Monastery"
    ],
    "cuisines": [
      "Thukpa",
      "Apong"
    ],
    "bestTime": "October–April",
    "monuments": [
      "Ita Fort",
      "Tawang Monastery",
      "Bomdila Monastery",
      "Bhismaknagar Fort"
    ],
    "adventures": [
      "River Rafting in Siang",
      "Trekking to Talle Valley",
      "Camping in Ziro Valley"
    ]
  },
  {
    "name": "Assam",
    "slug": "assam",
    "type": "State",
    "culture": "Bihu festival, Satriya dance",
    "tradition": "Silk weaving (Muga, Eri)",
    "language": "Assamese",
    "touristPlaces": [
      "Kaziranga National Park",
      "Kamakhya Temple"
    ],
    "cuisines": [
      "Masor Tenga(Fish curry)"
    ],
    "bestTime": "October–April",
    "monuments": [
      "Kareng Ghar (Sivasagar)",
      "Rang Ghar",
      "Talatal Ghar",
      "Kamakhya Temple"
    ],
    "adventures": [
      "Wildlife Safari in Kaziranga",
      "River Cruise on Brahmaputra",
      "Trekking in Haflong"
    ]
  },
  {
    "name": "Bihar",
    "slug": "bihar",
    "type": "State",
    "culture": "Chhath Puja, Bhojpuri folk",
    "tradition": "Madhubani painting",
    "language": "Hindi, Bhojpuri",
    "touristPlaces": [
      "Bodh Gaya"
    ],
    "cuisines": [
      "Litti Chokha"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Mahabodhi Temple (Bodh Gaya)",
      "Nalanda University Ruins",
      "Vikramshila Monastery",
      "Golghar (Patna)"
    ],
    "adventures": [
      "Rock Climbing in Rajgir Hills",
      "Exploring Caves in Barabar Hills",
      "Cycling in Bodh Gaya"
    ]
  },
  {
    "name": "Chhattisgarh",
    "slug": "chhattisgarh",
    "type": "State",
    "culture": "Bastar Dussehra, tribal dances",
    "tradition": "Bell-metal handicrafts",
    "language": "Chhattisgarhi, Hindi",
    "touristPlaces": [
      "Bastar"
    ],
    "cuisines": [
      "Chila"
    ],
    "bestTime": "October–February",
    "monuments": [
      "Sirpur Laxman Temple",
      "Rajim Temples",
      "Ratanpur Fort",
      "Madku Dweep"
    ],
    "adventures": [
      "Caving in Kotumsar",
      "Trekking in Kanger Valley",
      "Boating in Chitrakote Falls"
    ]
  },
  {
    "name": "Goa",
    "slug": "goa",
    "type": "State",
    "culture": "Carnival, Konkani folk music",
    "tradition": "Portuguese heritage houses",
    "language": "Konkani, Marathi",
    "touristPlaces": [
      "Calangute Beach",
      "Dudhsagar Falls"
    ],
    "cuisines": [
      "Goan fish curry",
      "Bebinca"
    ],
    "bestTime": "November–February",
    "monuments": [
      "Basilica of Bom Jesus",
      "Se Cathedral",
      "Fort Aguada",
      "Chapora Fort"
    ],
    "adventures": [
      "Scuba Diving in Grande Island",
      "Jet Skiing in Baga Beach",
      "Parasailing in Calangute"
    ]
  },
  {
    "name": "Gujarat",
    "slug": "gujarat",
    "type": "State",
    "culture": "Navratri Garba, folk arts",
    "tradition": "Bandhani textiles, Patola sarees",
    "language": "Gujarati",
    "touristPlaces": [
      "Kutch"
    ],
    "cuisines": [
      "Dhokla"
    ],
    "bestTime": "November–February",
    "monuments": [
      "Rani ki Vav (Patan)",
      "Sabarmati Ashram (Ahmedabad)",
      "Champaner-Pavagadh Forts",
      "Sun Temple (Modhera)"
    ],
    "adventures": [
      "Desert Safari in Rann of Kutch",
      "Paragliding in Saputara",
      "Trekking in Polo Forest"
    ]
  },
  {
    "name": "Haryana",
    "slug": "haryana",
    "type": "State",
    "culture": "Teeyan, Ragini folk",
    "tradition": "Phulkari embroidery",
    "language": "Haryanvi, Hindi",
    "touristPlaces": [
      "Chandigarh"
    ],
    "cuisines": [
      "Kadhi Pakoda"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Star Monument (Bhiwani)",
      "Tomb of Sheikh Chilli (Thanesar)",
      "Panipat Battlefield",
      "Firoz Shah Palace Complex (Hisar)"
    ],
    "adventures": [
      "Adventure Park in Gurgaon",
      "Hot Air Ballooning in Damdama",
      "Rock Climbing in Morni Hills"
    ]
  },
  {
    "name": "Himachal Pradesh",
    "slug": "himachal-pradesh",
    "type": "State",
    "culture": "Kullu Dussehra, Pahari songs",
    "tradition": "Wool shawls, wood carving",
    "language": "Pahari, Hindi",
    "touristPlaces": [
      "Manali",
      "Shimla"
    ],
    "cuisines": [
      "Chana Madra",
      "Dham"
    ],
    "bestTime": "March–June, September–November",
    "monuments": [
      "Kangra Fort",
      "Bhimakali Temple",
      "Tabo Monastery",
      "Naggar Castle"
    ],
    "adventures": [
      "Paragliding in Bir Billing",
      "Trekking in Manali",
      "Camping in Spiti Valley"
    ]
  },
  {
    "name": "Jharkhand",
    "slug": "jharkhand",
    "type": "State",
    "culture": "Sarhul, Jhumair dance",
    "tradition": "Dokra metal craft",
    "language": "Hindi, Nagpuri",
    "touristPlaces": [
      "Betla National Park"
    ],
    "cuisines": [
      "Rugra"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Jagannath Temple (Ranchi)",
      "Rajrappa Temple",
      "Maluti Temples",
      "Navratangarh Fort"
    ],
    "adventures": [
      "Rock Climbing in Netarhat",
      "Boating in Patratu Valley",
      "Waterfalls Trek in Ranchi"
    ]
  },
  {
    "name": "Karnataka",
    "slug": "karnataka",
    "type": "State",
    "culture": "Mysuru Dasara, Yakshagana",
    "tradition": "Sandalwood art, Mysore silk",
    "language": "Kannada",
    "touristPlaces": [
      "Coorg"
    ],
    "cuisines": [
      "Mysore Masala Dosa",
      "Bisi Bele Bath"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Hampi Ruins",
      "Mysore Palace",
      "Gol Gumbaz (Bijapur)",
      "Halebidu Temples"
    ],
    "adventures": [
      "River Rafting in Dandeli",
      "Scuba Diving in Netrani Island",
      "Trekking in Kudremukh"
    ]
  },
  {
    "name": "Kerala",
    "slug": "kerala",
    "type": "State",
    "culture": "Onam, Kathakali",
    "tradition": "Backwaters, mural paintings",
    "language": "Malayalam",
    "touristPlaces": [
      "Munnar",
      "Alleppey"
    ],
    "cuisines": [
      "Appam with stew"
    ],
    "bestTime": "October–March, June–August (Ayurveda monsoon season)",
    "monuments": [
      "Mattancherry Palace",
      "Bekal Fort",
      "Padmanabhapuram Palace",
      "St. Francis Church (Kochi)"
    ],
    "adventures": [
      "Kayaking in Alleppey",
      "Trekking in Wayanad",
      "Paragliding in Vagamon"
    ]
  },
  {
    "name": "Madhya Pradesh",
    "slug": "madhya-pradesh",
    "type": "State",
    "culture": "Bhagoria festival, folk songs",
    "tradition": "Chanderi, Maheshwari sarees",
    "language": "Hindi",
    "touristPlaces": [
      "Bhopal"
    ],
    "cuisines": [
      "Dal Bafla",
      "Bhutte Ka Kees"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Khajuraho Temples",
      "Sanchi Stupa",
      "Gwalior Fort",
      "Mandu Fort"
    ],
    "adventures": [
      "Wildlife Safari in Kanha",
      "Trekking in Pachmarhi",
      "Rock Climbing in Bhimbetka"
    ]
  },
  {
    "name": "Maharashtra",
    "slug": "maharashtra",
    "type": "State",
    "culture": "Ganeshotsav, Lavani dance",
    "tradition": "Warli painting, Paithani sarees",
    "language": "Marathi",
    "touristPlaces": [
      "Lonavala",
      "Gateway of India"
    ],
    "cuisines": [
      "Vada Pav",
      "Misal Pav"
    ],
    "bestTime": "October–February, June–September (monsoon treks)",
    "monuments": [
      "Ajanta Caves",
      "Ellora Caves",
      "Gateway of India (Mumbai)",
      "Shaniwar Wada (Pune)"
    ],
    "adventures": [
      "Trekking in Sahyadris",
      "Scuba Diving in Tarkarli",
      "Paragliding in Kamshet"
    ]
  },
  {
    "name": "Manipur",
    "slug": "manipur",
    "type": "State",
    "culture": "Lai Haraoba, Manipuri dance",
    "tradition": "Handloom & bamboo crafts",
    "language": "Manipuri",
    "touristPlaces": [
      "Loktak Lake"
    ],
    "cuisines": [
      "Eromba"
    ],
    "bestTime": "October–April",
    "monuments": [
      "Kangla Fort",
      "Govindajee Temple",
      "Shaheed Minar (Imphal)",
      "INA Memorial (Moirang)"
    ],
    "adventures": [
      "Boating in Loktak Lake",
      "Trekking in Dzuko Valley",
      "Caving in Tharon"
    ]
  },
  {
    "name": "Meghalaya",
    "slug": "meghalaya",
    "type": "State",
    "culture": "Shad Suk Mynsiem, Wangala",
    "tradition": "Bamboo huts, wood carving",
    "language": "Khasi, Garo",
    "touristPlaces": [
      "Cherrapunjee"
    ],
    "cuisines": [
      "Jadoh"
    ],
    "bestTime": "October–April, June–September (for monsoon beauty)",
    "monuments": [
      "Nartiang Monoliths",
      "Mawphlang Sacred Grove",
      "David Scott Trail (heritage route)",
      "Iewduh Market (Shillong)"
    ],
    "adventures": [
      "Caving in Mawsmai",
      "Trekking to Living Root Bridges",
      "Kayaking in Dawki River"
    ]
  },
  {
    "name": "Mizoram",
    "slug": "mizoram",
    "type": "State",
    "culture": "Chapchar Kut, Cheraw dance",
    "tradition": "Handloom, bamboo work",
    "language": "Mizo",
    "touristPlaces": [
      "Lunglei"
    ],
    "cuisines": [
      "Bai"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Khawnglung Wildlife Heritage Site",
      "Vantawng Falls (heritage significance)",
      "Tomb of Vanhimailian",
      "Chhingpuii Memorial"
    ],
    "adventures": [
      "Trekking in Blue Mountain",
      "Camping in Hmuifang",
      "Paragliding in Serchhip"
    ]
  },
  {
    "name": "Nagaland",
    "slug": "nagaland",
    "type": "State",
    "culture": "Hornbill Festival",
    "tradition": "Naga shawls, bead jewelry",
    "language": "English, Nagamese",
    "touristPlaces": [
      "Monochung"
    ],
    "cuisines": [
      "Smoked Pork with Bamboo Stick"
    ],
    "bestTime": "October–May",
    "monuments": [
      "Kachari Ruins (Dimapur)",
      "Triple Falls (Dimapur)",
      "Dzükou Valley (cultural importance)",
      "Chumukedima Ruins"
    ],
    "adventures": [
      "Trekking in Dzukou Valley",
      "Camping at Kisama",
      "Rock Climbing in Japfu Peak"
    ]
  },
  {
    "name": "Odisha",
    "slug": "odisha",
    "type": "State",
    "culture": "Rath Yatra, Odissi dance",
    "tradition": "Pattachitra art, Sambalpuri sarees",
    "language": "Odia",
    "touristPlaces": [
      "Puri",
      "Konark Sun Temple"
    ],
    "cuisines": [
      "Dalma",
      "Chenna Poda"
    ],
    "bestTime": "November–February",
    "monuments": [
      "Konark Sun Temple",
      "Jagannath Temple (Puri)",
      "Lingaraja Temple (Bhubaneswar)",
      "Udayagiri and Khandagiri Caves"
    ],
    "adventures": [
      "Surfing in Puri",
      "Trekking in Gandhamardan Hills",
      "Boating in Chilika Lake"
    ]
  },
  {
    "name": "Punjab",
    "slug": "punjab",
    "type": "State",
    "culture": "Baisakhi, Bhangra",
    "tradition": "Phulkari embroidery, Giddha",
    "language": "Punjabi",
    "touristPlaces": [
      "Golden Temple"
    ],
    "cuisines": [
      "Makki Di Roti and Sarson Da Saag",
      "Butter Chicken"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Golden Temple (Amritsar)",
      "Jallianwala Bagh",
      "Sheesh Mahal (Patiala)",
      "Qila Mubarak"
    ],
    "adventures": [
      "ATV Rides in Jalandhar",
      "Skydiving near Patiala (seasonal)",
      "Camping near Kikar Lodge"
    ]
  },
  {
    "name": "Rajasthan",
    "slug": "rajasthan",
    "type": "State",
    "culture": "Desert festival, Kalbeliya",
    "tradition": "Bandhej textiles, stone carving",
    "language": "Rajasthani, Hindi",
    "touristPlaces": [
      "Jaipur",
      "Udaipur"
    ],
    "cuisines": [
      "Dal Baati Churma"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Amber Fort (Jaipur)",
      "Mehrangarh Fort (Jodhpur)",
      "City Palace (Udaipur)",
      "Jaisalmer Fort"
    ],
    "adventures": [
      "Desert Safari in Jaisalmer",
      "Hot Air Ballooning in Jaipur",
      "Camel Riding in Pushkar"
    ]
  },
  {
    "name": "Sikkim",
    "slug": "sikkim",
    "type": "State",
    "culture": "Losar, Mask dances",
    "tradition": "Handloom & Buddhist art",
    "language": "Nepali, English",
    "touristPlaces": [
      "Tsomgo Lake"
    ],
    "cuisines": [
      "Momos",
      "Thukpa"
    ],
    "bestTime": "March–June, September–November",
    "monuments": [
      "Rumtek Monastery",
      "Pemayangtse Monastery",
      "Rabdentse Ruins",
      "Tashiding Monastery"
    ],
    "adventures": [
      "Trekking to Goechala",
      "River Rafting in Teesta",
      "Yak Safari near Tsomgo Lake"
    ]
  },
  {
    "name": "Tamil Nadu",
    "slug": "tamil-nadu",
    "type": "State",
    "culture": "Pongal, Bharatanatyam",
    "tradition": "Temple architecture, Kanchipuram silk",
    "language": "Tamil",
    "touristPlaces": [
      "Ooty",
      "Rameswaram"
    ],
    "cuisines": [
      "Pongal"
    ],
    "bestTime": "November–March",
    "monuments": [
      "Brihadeeswarar Temple (Thanjavur)",
      "Meenakshi Temple (Madurai)",
      "Mahabalipuram Temples",
      "Fort St. George (Chennai)"
    ],
    "adventures": [
      "Surfing in Mahabalipuram",
      "Scuba Diving in Covelong",
      "Trekking in Nilgiris"
    ]
  },
  {
    "name": "Telangana",
    "slug": "telangana",
    "type": "State",
    "culture": "Bonalu, Perini dance",
    "tradition": "Nirmal paintings, Pochampally sarees",
    "language": "Telugu",
    "touristPlaces": [
      "Hyderabad"
    ],
    "cuisines": [
      "Hyderabadi Biryani"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Charminar",
      "Golconda Fort",
      "Chowmahalla Palace",
      "Warangal Fort"
    ],
    "adventures": [
      "Trekking in Ananthagiri Hills",
      "Boating in Hussain Sagar",
      "Rock Climbing in Bhongir Fort"
    ]
  },
  {
    "name": "Tripura",
    "slug": "tripura",
    "type": "State",
    "culture": "Garia Puja, tribal dance",
    "tradition": "Handloom, bamboo products",
    "language": "Kokborok, Bengali",
    "touristPlaces": [
      "Ujjayanta Palace"
    ],
    "cuisines": [
      "Berma",
      "Mui Borok"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Ujjayanta Palace",
      "Neermahal Palace",
      "Tripura Sundari Temple",
      "Unakoti Rock Carvings"
    ],
    "adventures": [
      "Trekking to Jampui Hills",
      "Boating in Dumboor Lake",
      "Exploring Caves in Unakoti"
    ]
  },
  {
    "name": "Uttar Pradesh",
    "slug": "uttar-pradesh",
    "type": "State",
    "culture": "Holi (Mathura), Kathak",
    "tradition": "Chikankari embroidery, Awadhi cuisine",
    "language": "Hindi, Urdu",
    "touristPlaces": [
      "Taj Mahal",
      "Varanasi Ghats"
    ],
    "cuisines": [
      "Biryani",
      "Tunde Ke Kebabs"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Taj Mahal",
      "Agra Fort",
      "Ayodhya"
    ],
    "adventures": [
      "Paragliding in Varanasi",
      "Boating in Naini Lake",
      "Trekking in Chitrakoot"
    ]
  },
  {
    "name": "Uttarakhand",
    "slug": "uttarakhand",
    "type": "State",
    "culture": "Ganga Aarti, Kumaoni songs",
    "tradition": "Woolen shawls, wood craft",
    "language": "Hindi, Garhwali",
    "touristPlaces": [
      "Rishikesh"
    ],
    "cuisines": [
      "Bhatt Ki Churkani",
      "Dham"
    ],
    "bestTime": "March–June, September–November",
    "monuments": [
      "Katarmal Sun Temple",
      "Baleshwar Temple",
      "Jageshwar Temples",
      "Landour Clock Tower"
    ],
    "adventures": [
      "River Rafting in Rishikesh",
      "Trekking to Valley of Flowers",
      "Bungee Jumping in Rishikesh"
    ]
  },
  {
    "name": "West Bengal",
    "slug": "west-bengal",
    "type": "State",
    "culture": "Durga Puja, Baul songs",
    "tradition": "Terracotta, Baluchari sarees",
    "language": "Bengali",
    "touristPlaces": [
      "Darjeeling"
    ],
    "cuisines": [
      "Kosha Mangshi",
      "Maacher Jhol"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Victoria Memorial (Kolkata)",
      "Howrah Bridge",
      "Hazarduari Palace (Murshidabad)",
      "Bishnupur Terracotta Temples"
    ],
    "adventures": [
      "Trekking in Sandakphu",
      "Rafting in Teesta River",
      "Paragliding in Kalimpong"
    ]
  },
  {
    "name": "Andaman and Nicobar Islands",
    "slug": "andaman-and-nicobar-islands",
    "type": "Union Territory",
    "culture": "Beach festivals",
    "tradition": "Tribal arts, coconut craft",
    "language": "Hindi, English",
    "touristPlaces": [
      "Havelock Island"
    ],
    "cuisines": [
      "Coconut Prawn Curry",
      "Tandoori Fish"
    ],
    "bestTime": "October–May",
    "monuments": [
      "Cellular Jail (Port Blair)",
      "Ross Island Ruins",
      "Japanese Bunkers (Ross Island)",
      "Chatham Saw Mill (oldest in Asia)"
    ],
    "adventures": [
      "Scuba Diving in Havelock",
      "Snorkeling in Neil Island",
      "Sea Walking in North Bay"
    ]
  },
  {
    "name": "Chandigarh",
    "slug": "chandigarh",
    "type": "Union Territory",
    "culture": "Modern Punjabi culture",
    "tradition": "Urban handicrafts",
    "language": "Punjabi, Hindi",
    "touristPlaces": [
      "Rock Garden"
    ],
    "cuisines": [
      "Chole Kulche",
      "Butter Chicken"
    ],
    "bestTime": "October–June",
    "monuments": [
      "Sukhna Lake",
      "Zakir Hussain",
      "Rose Garden",
      "Butterfly Park"
    ],
    "adventures": [
      "Boating in Sukhna Lake",
      "Rock Climbing in Rock Garden",
      "Cycling in Leisure Valley"
    ]
  },
  {
    "name": "Dadra and Nagar Haveli and Daman and Diu",
    "slug": "dnh-and-dd",
    "type": "Union Territory",
    "culture": "Beach festivals",
    "tradition": "Portuguese influence",
    "language": "Gujarati, Hindi",
    "touristPlaces": [
      "Vanganga Lake Garden"
    ],
    "cuisines": [
      "Seafood Curry"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Diu Fort",
      "St. Paul’s Church",
      "Church of Our Lady of Remedios",
      "Tribal Museum (Silvassa)"
    ],
    "adventures": [
      "Parasailing in Diu",
      "Jet Skiing in Devka Beach",
      "Camping near Dudhni Lake"
    ]
  },
  {
    "name": "Delhi",
    "slug": "delhi",
    "type": "Union Territory",
    "culture": "Blend of Mughal and modern",
    "tradition": "Mughal architecture, street food",
    "language": "Hindi, English",
    "touristPlaces": [
      "Red Fort",
      "India Gate"
    ],
    "cuisines": [
      "Chhole Bhature",
      "Butter Chicken"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Red Fort",
      "Qutub Minar",
      "Humayun’s Tomb",
      "India Gate"
    ],
    "adventures": [
      "Hot Air Ballooning near Gurgaon",
      "Cycling in India Gate Circuit",
      "Paintball Adventure in Dwarka"
    ]
  },
  {
    "name": "Jammu and Kashmir",
    "slug": "jammu-and-kashmir",
    "type": "Union Territory",
    "culture": "Tulip festival, Sufi songs",
    "tradition": "Kashmiri shawls, Wazwan cuisine",
    "language": "Kashmiri, Urdu",
    "touristPlaces": [
      "Gulmarg",
      "Vaishno Devi"
    ],
    "cuisines": [
      "Rogan Josh",
      "Yakhni"
    ],
    "bestTime": "April–October (Kashmir Valley), December–February (Gulmarg snow)",
    "monuments": [
      "Shankaracharya Temple",
      "Martand Sun Temple",
      "Hari Parbat Fort",
      "Mubarak Mandi Palace"
    ],
    "adventures": [
      "Skiing in Gulmarg",
      "Trekking in Ladakh",
      "River Rafting in Zanskar"
    ]
  },
  {
    "name": "Ladakh",
    "slug": "ladakh",
    "type": "Union Territory",
    "culture": "Hemis festival, folk songs",
    "tradition": "Thangka paintings, apricot wood",
    "language": "Ladakhi, Hindi",
    "touristPlaces": [
      "Pangong Lake",
      "Leh Palace"
    ],
    "cuisines": [
      "Skyu",
      "Thukpa"
    ],
    "bestTime": "June–September",
    "monuments": [
      "Leh Palace",
      "Hemis Monastery",
      "Thiksey Monastery",
      "Shey Palace"
    ],
    "adventures": [
      "Motorbiking to Khardung La",
      "Camel Safari in Nubra Valley",
      "Trekking to Chadar"
    ]
  },
  {
    "name": "Lakshadweep",
    "slug": "lakshadweep",
    "type": "Union Territory",
    "culture": "Island fairs, folk dance",
    "tradition": "Coir craft, coconut art",
    "language": "Malayalam, Jeseri",
    "touristPlaces": [
      "Bangaram island"
    ],
    "cuisines": [
      "Mas Podichathu"
    ],
    "bestTime": "October–March",
    "monuments": [
      "Kavaratti Mosque",
      "Juma Masjid (Andrott)",
      "Ancient Tombs of Kalpeni",
      "Marine Museum (Kavaratti)"
    ],
    "adventures": [
      "Scuba Diving in Kavaratti",
      "Snorkeling in Agatti",
      "Kayaking in Minicoy Lagoon"
    ]
  },
  {
    "name": "Puducherry",
    "slug": "puducherry",
    "type": "Union Territory",
    "culture": "French and Tamil blend",
    "tradition": "French colonial houses, Tamil crafts",
    "language": "Tamil, French, English",
    "touristPlaces": [
      "Auroville"
    ],
    "cuisines": [
      "Meen Puyabaisse"
    ],
    "bestTime": "October–March",
    "monuments": [
      "French War Memorial",
      "Basilica of the Sacred Heart of Jesus",
      "Aayi Mandapam",
      "Romain Rolland Library"
    ],
    "adventures": [
      "Scuba Diving in Temple Reef",
      "Surfing in Serenity Beach",
      "Kayaking in Paradise Beach"
    ]
  }
];

export const STATE_BY_NAME = new Map(STATES.map((s) => [s.name, s]));
export const STATE_BY_SLUG = new Map(STATES.map((s) => [s.slug, s]));
