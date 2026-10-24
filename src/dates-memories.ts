// Locality centers are approximate. Unspecified locations intentionally use the Delhi placeholder.
// Replace a location's coordinates when the user supplies an exact address or map pin.
export const memoryLocations: Record<string, { name: string; state: string; latitude: number; longitude: number; placeholder?: boolean }> = {
  delhi: { name: 'Delhi', state: 'delhi', latitude: 28.6139, longitude: 77.2090, placeholder: true },
  vaishali: { name: 'Vaishali', state: 'uttar-pradesh', latitude: 28.6444, longitude: 77.3444 },
  ghaziabad: { name: 'Ghaziabad', state: 'uttar-pradesh', latitude: 28.6692, longitude: 77.4538 },
  rohini: { name: 'Rohini', state: 'delhi', latitude: 28.7383, longitude: 77.0822 },
  cp: { name: 'Connaught Place', state: 'delhi', latitude: 28.6315, longitude: 77.2167 },
  aerocity: { name: 'Aerocity', state: 'delhi', latitude: 28.5506, longitude: 77.1217 },
  nirman: { name: 'Nirman Vihar', state: 'delhi', latitude: 28.6365, longitude: 77.2868 },
  mandapam: { name: 'Bharat Mandapam', state: 'delhi', latitude: 28.6134, longitude: 77.2462 },
  jama: { name: 'Jama Masjid', state: 'delhi', latitude: 28.6507, longitude: 77.2334 },
  gurgaon: { name: 'Gurgaon', state: 'haryana', latitude: 28.4595, longitude: 77.0266 },
  nsp: { name: 'Netaji Subhash Place', state: 'delhi', latitude: 28.6961, longitude: 77.1528 },
  vikaspuri: { name: 'Vikaspuri', state: 'delhi', latitude: 28.6384, longitude: 77.0703 },
  venky: { name: 'Sri Venkateswara College area', state: 'delhi', latitude: 28.5885, longitude: 77.1687 },
  corbett: { name: 'Jim Corbett area', state: 'uttarakhand', latitude: 29.5300, longitude: 78.7747 },
  bangla: { name: 'Bangla Sahib', state: 'delhi', latitude: 28.6264, longitude: 77.2091 },
  southdelhi: { name: 'South Delhi', state: 'delhi', latitude: 28.5245, longitude: 77.2066 },
  murthal: { name: 'Murthal', state: 'haryana', latitude: 29.0322, longitude: 77.0679 },
  manali: { name: 'Manali', state: 'himachal-pradesh', latitude: 32.2432, longitude: 77.1892 },
  shalimar: { name: 'Shalimar Bagh', state: 'delhi', latitude: 28.7171, longitude: 77.1628 },
  janakpuri: { name: 'Janakpuri', state: 'delhi', latitude: 28.6219, longitude: 77.0878 },
  manesar: { name: 'Manesar', state: 'haryana', latitude: 28.3515, longitude: 76.9428 },
}

export type DateMemory = { id: string; date: string; place: string; note: string; location: string }
export const dateMemories: DateMemory[] = [
  {
    "id": "memory-1",
    "date": "12-06-2021",
    "place": "Sector 4 vaishali lenskart.com",
    "note": "Where it all started with a hug",
    "location": "vaishali"
  },
  {
    "id": "memory-2",
    "date": "03-07-2021",
    "place": "Mayfield Gardens sector 51 gurgaon",
    "note": "From rohini to vaishali to gurgaon then back to Vaishali 🙃",
    "location": "gurgaon"
  },
  {
    "id": "memory-3",
    "date": "19-07-2021",
    "place": "Divya Jyoti Apartments",
    "note": "The legendary masala cheese maggi",
    "location": "delhi"
  },
  {
    "id": "memory-4",
    "date": "13-08-2021",
    "place": "Ramprastha vaishali",
    "note": "I’ve no idea where to park the car",
    "location": "vaishali"
  },
  {
    "id": "memory-5",
    "date": "29-10-2021",
    "place": "National Museum CP",
    "note": "When you forgot that we are in a public space",
    "location": "cp"
  },
  {
    "id": "memory-6",
    "date": "08-11-2021",
    "place": "Park plaza",
    "note": "Such a wholesome response to the birthday gift “ye kon hai” 🙃",
    "location": "delhi"
  },
  {
    "id": "memory-7",
    "date": "11-12-2021",
    "place": "Rohini sector 18 metro station",
    "note": "When I decided to always pick you up near the lift area",
    "location": "rohini"
  },
  {
    "id": "memory-8",
    "date": "24-12-2021",
    "place": "Cp inox",
    "note": "I hope they don’t keep footages of the multiplex",
    "location": "cp"
  },
  {
    "id": "memory-9",
    "date": "17-02-2022",
    "place": "Aerocity Novotel",
    "note": "I lied that I have a 50% off discount coupon, I paid the full price",
    "location": "aerocity"
  },
  {
    "id": "memory-10",
    "date": "02-03-2022",
    "place": "Yellow bowl",
    "note": "First actual going out to eat together",
    "location": "delhi"
  },
  {
    "id": "memory-11",
    "date": "07-03-2022",
    "place": "Crpf public school",
    "note": "Made you happy just by wiping of kachodi from your face",
    "location": "delhi"
  },
  {
    "id": "memory-12",
    "date": "28-04-2022",
    "place": "Cafeteria and co",
    "note": "Food was great and yet Jaysha never wants to go there again",
    "location": "delhi"
  },
  {
    "id": "memory-13",
    "date": "24-06-2022",
    "place": "Nirman vihar cinepolis",
    "note": "When I got to know Jaysha is a Mcd paglu",
    "location": "nirman"
  },
  {
    "id": "memory-14",
    "date": "27-07-2022",
    "place": "Bharat mandapam bassi",
    "note": "Watching madhur making fun of his ex live in front of her sister 😛",
    "location": "mandapam"
  },
  {
    "id": "memory-15",
    "date": "27-07-2022",
    "place": "Jama masjid",
    "note": "When I introduced you to Ya Allah Chala de Hotel",
    "location": "jama"
  },
  {
    "id": "memory-16",
    "date": "10-08-2022",
    "place": "Pvr icon",
    "note": "Tu apne bande ke sath Raksha Bandhan ki screening pe gayi hai?",
    "location": "delhi"
  },
  {
    "id": "memory-17",
    "date": "27-08-2022",
    "place": "Divya Jyoti Apartments",
    "note": "Nobody’s home for the first time",
    "location": "delhi"
  },
  {
    "id": "memory-18",
    "date": "21-10-2022",
    "place": "Ramprastha",
    "note": "Dono ko pitne se bachaya single handedly",
    "location": "vaishali"
  },
  {
    "id": "memory-19",
    "date": "08-11-2022",
    "place": "Forresta Gurgaon",
    "note": "Waiter fucked up my whole surprise",
    "location": "gurgaon"
  },
  {
    "id": "memory-20",
    "date": "28-12-2022",
    "place": "32nd avenue",
    "note": "Beautiful cafes yet you just wanted an “ice cream cone”",
    "location": "gurgaon"
  },
  {
    "id": "memory-21",
    "date": "06-05-2023",
    "place": "Hari om chole bhature",
    "note": "Morning breakfast with my evening breakfast",
    "location": "delhi"
  },
  {
    "id": "memory-22",
    "date": "23-06-2023",
    "place": "mcd shopprix vaishali",
    "note": "Please kabhi to mcd ke alava kahi or le jaaya kar?",
    "location": "vaishali"
  },
  {
    "id": "memory-23",
    "date": "01-07-2023",
    "place": "stellar inn",
    "note": "When I finally found our go to spot",
    "location": "delhi"
  },
  {
    "id": "memory-24",
    "date": "20-10-2023",
    "place": "nsp tasteland",
    "note": "I beat you twice in Jenga",
    "location": "nsp"
  },
  {
    "id": "memory-25",
    "date": "08-11-2023",
    "place": "Department of Political science",
    "note": "Fooled the security guard just to get inside the library",
    "location": "delhi"
  },
  {
    "id": "memory-26",
    "date": "27-11-2023",
    "place": "bobby punjabj rasoi",
    "note": "Trying my go to chicken spot after 2 years constantly listening about bobby",
    "location": "delhi"
  },
  {
    "id": "memory-27",
    "date": "25-12-2023",
    "place": "delhi heights cafe nsp",
    "note": "When we decided that it will be our annual Christmas ritual",
    "location": "nsp"
  },
  {
    "id": "memory-28",
    "date": "17-01-2024",
    "place": "vikaspuri pizza",
    "note": "“Aww baby you got me a pad”",
    "location": "vikaspuri"
  },
  {
    "id": "memory-29",
    "date": "29-01-2024",
    "place": "sector 4 vaishali",
    "note": "First time introduced to Didi ke Momos",
    "location": "vaishali"
  },
  {
    "id": "memory-30",
    "date": "18-02-2024",
    "place": "cp ministry of beer",
    "note": "Bhand Lakshya texted weird ass things which somehow made you happy",
    "location": "cp"
  },
  {
    "id": "memory-31",
    "date": "10-04-2024",
    "place": "venky college",
    "note": "Mohit Chauhan, your first ever concert",
    "location": "venky"
  },
  {
    "id": "memory-32",
    "date": "01-05-2024",
    "place": "Divya Jyoti Apartments",
    "note": "I swear my mom makes better Shahi Paneer than that",
    "location": "delhi"
  },
  {
    "id": "memory-33",
    "date": "03-08-2024",
    "place": "jim corbett",
    "note": "I was bleeding and you suddenly became Mother Teresa",
    "location": "corbett"
  },
  {
    "id": "memory-34",
    "date": "18-08-2024",
    "place": "yellow bowl rohini",
    "note": "Eating with 20 aunties at a kitty party",
    "location": "rohini"
  },
  {
    "id": "memory-35",
    "date": "10-09-2024",
    "place": "kesar pitampura",
    "note": "“Baby muje badiya si Dal makhani khila do”",
    "location": "delhi"
  },
  {
    "id": "memory-36",
    "date": "28-09-2024",
    "place": "radisson",
    "note": "“Oh so this is how you party?”",
    "location": "delhi"
  },
  {
    "id": "memory-37",
    "date": "08-10-2024",
    "place": "Punjab Grill",
    "note": "Came 40kms to do ice skating but ended up eating Butter chicken",
    "location": "gurgaon"
  },
  {
    "id": "memory-38",
    "date": "08-11-2024",
    "place": "bangla sahib",
    "note": "“Meri chunni pakad lo please”",
    "location": "bangla"
  },
  {
    "id": "memory-39",
    "date": "08-11-2024",
    "place": "pindi pandara road",
    "note": "“Baby its a straw, you have to drink through it”",
    "location": "delhi"
  },
  {
    "id": "memory-40",
    "date": "25-12-2024",
    "place": "unwind cafe ansal plaza",
    "note": "You probably made more videos than you actually enjoyed the vibe",
    "location": "southdelhi"
  },
  {
    "id": "memory-41",
    "date": "09-02-2025",
    "place": "Divya Jyoti Apartments",
    "note": "Still can’t believe how adorable you were looking in white suit",
    "location": "delhi"
  },
  {
    "id": "memory-42",
    "date": "21-02-2025",
    "place": "Divya Jyoti apartments",
    "note": "Talking through the wall",
    "location": "delhi"
  },
  {
    "id": "memory-43",
    "date": "23-02-2025",
    "place": "manali",
    "note": "“Muje subha breakfast sath karna tha isliye chalo ladd leti hun”",
    "location": "manali"
  },
  {
    "id": "memory-44",
    "date": "20-03-2025",
    "place": "gallivanto in rohini",
    "note": "Made me cute drawing and notes while I was asleep",
    "location": "rohini"
  },
  {
    "id": "memory-45",
    "date": "21-04-2025",
    "place": "madras cafe shalimar",
    "note": "Your favourite Dosa spot",
    "location": "shalimar"
  },
  {
    "id": "memory-46",
    "date": "15-05-2025",
    "place": "vada pav ghaziabad",
    "note": "Jaysha’s treat because it costed less than 100 😛",
    "location": "ghaziabad"
  },
  {
    "id": "memory-47",
    "date": "08-06-2025",
    "place": "presidium school",
    "note": "I swear I play better cricket when you’re not around",
    "location": "delhi"
  },
  {
    "id": "memory-48",
    "date": "03-07-2025",
    "place": "Boho bistro vaishali",
    "note": "You did not expect that at all, did you?",
    "location": "vaishali"
  },
  {
    "id": "memory-49",
    "date": "19-10-2025",
    "place": "haveli murthal",
    "note": "Jaysha became PT usha. Lakshya unwillingly playing pakdan pakdayi at 3 in the morning",
    "location": "murthal"
  },
  {
    "id": "memory-50",
    "date": "08-11-2025",
    "place": "pind balucchi",
    "note": "When you were smiling more than you were eating",
    "location": "delhi"
  },
  {
    "id": "memory-51",
    "date": "08-11-2025",
    "place": "orchid petals gurgaon",
    "note": "I missed the legendary fight just to come pick you up 🙃",
    "location": "gurgaon"
  },
  {
    "id": "memory-52",
    "date": "24-12-2025",
    "place": "nebo ansal plaza",
    "note": "One of my favourite time walking with bhand Jaysha from car parking basement to the restaurant",
    "location": "southdelhi"
  },
  {
    "id": "memory-53",
    "date": "07-02-2026",
    "place": "salt stayz pitampura",
    "note": "The most prettiest most beautiful you’ve ever looked",
    "location": "delhi"
  },
  {
    "id": "memory-54",
    "date": "14-03-2026",
    "place": "chawla restaurant",
    "note": "When I finally trained you how to eat properly",
    "location": "delhi"
  },
  {
    "id": "memory-55",
    "date": "05-06-2026",
    "place": "park plaza shahdara",
    "note": "When you cared for me like a baby the whole night",
    "location": "delhi"
  },
  {
    "id": "memory-56",
    "date": "05-06-2026",
    "place": "NMACC",
    "note": "“Abhi na jao chhod ke, ke dil abhi bhara nahi”",
    "location": "delhi"
  },
  {
    "id": "memory-57",
    "date": "17-06-2026",
    "place": "Mahagun metro mall",
    "note": "Watched mai vapas aunga again just to experience it with youu",
    "location": "ghaziabad"
  },
  {
    "id": "memory-58",
    "date": "03-07-2026",
    "place": "elegante mall",
    "note": "Played 50 games/activities but I know you enjoyed bumper car the most",
    "location": "delhi"
  },
  {
    "id": "memory-59",
    "date": "06-07-2026",
    "place": "wembley estate",
    "note": "When I realised I want to do this forever",
    "location": "gurgaon"
  },
  {
    "id": "memory-60",
    "date": "02-08-2026",
    "place": "manesar",
    "note": "2 breezer or Jaysha set",
    "location": "manesar"
  },
  {
    "id": "memory-61",
    "date": "07-09-2026",
    "place": "opulence",
    "note": "Still laughing about how you fell",
    "location": "delhi"
  },
  {
    "id": "memory-62",
    "date": "19-10-2026",
    "place": "wonder carnival gurgaon",
    "note": "Maut ka kuaan fun hota hai stfu!",
    "location": "gurgaon"
  },
  {
    "id": "memory-63",
    "date": "21-10-2026",
    "place": "qureshi kabab corner sector 54 gurgaon",
    "note": "Where you saw a great bond of father and daughter 😛",
    "location": "gurgaon"
  }
]
