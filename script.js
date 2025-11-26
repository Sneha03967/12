document.addEventListener('DOMContentLoaded', () => {
  // Fix Leaflet default marker icon issue
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  const map = L.map('map', { preferCanvas: true }).setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors, © CARTO'
  }).addTo(map);

  map.zoomControl.setPosition('bottomright');

  const markerLayer = L.layerGroup().addTo(map);
  let sites = [];
  let activeTheme = 'all';
  let activeYear = 2025;
  let searchQuery = '';
  let activeEpic = null;

  // --- Get references to the details sidebar elements ---
  const detailsSidebar = document.getElementById('detailsSidebar');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const detailsImage = document.getElementById('detailsImage');
  const detailsName = document.getElementById('detailsName');
  const detailsYear = document.getElementById('detailsYear');
  const detailsInfo = document.getElementById('detailsInfo');
  const detailsText = document.getElementById('detailsText');

  // --- Flashcard elements ---
  const flashcardContent = document.getElementById('flashcardContent');
  const detailsContent = document.getElementById('detailsContent');
  const flashcardsGrid = document.getElementById('flashcardsGrid');
  const flashcardHeaderTitle = document.getElementById('flashcardHeaderTitle');
  const flashcardHeaderDesc = document.getElementById('flashcardHeaderDesc');
  const flashcardPrev = document.getElementById('flashcardPrev');
  const flashcardNext = document.getElementById('flashcardNext');
  const flashcardPosition = document.getElementById('flashcardPosition');
  const moreDetailsBtn = document.getElementById('moreDetailsBtn');
  const flashcardBackBtn = document.getElementById('flashcardBackBtn');

  // --- Add error handling for missing elements ---
  if (!detailsSidebar || !closeSidebarBtn || !detailsImage || !detailsName || !detailsYear || !detailsInfo || !detailsText) {
    console.error('Some details sidebar elements are missing from the HTML');
  }

  // ============ Harivamsa Flashcards Data ============
  const harivamsaFlashcards = [
    {
      front: "Birth of the Yadu Lineage",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">The Yadu Dynasty</h2><p class="text-base">The mighty Yadu dynasty was founded by King Yadu, descendant of the Moon god. From this divine line, Lord Krishna would one day take birth to restore dharma on earth.</p></div>`,
      image: "images/Harivamsa/The Enternal Harivamsa_.jpg"
    },
    {
      front: "Prophecy of Krishna's Birth",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Kansa's Fear</h2><p class="text-base">King Kansa of Mathura feared a prophecy—that Devaki's eighth child would end his life. Blinded by terror, he imprisoned Devaki and her husband, Vasudeva.</p></div>`,
      image: "images/Harivamsa/King_Kansa.jpg"
    },
    {
      front: "Birth of Lord Krishna",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">The Divine Midnight</h2><p class="text-base">At midnight, in the prison of Mathura, the divine child Krishna was born. The chains fell open, guards slept, and Vasudeva carried the infant across the Yamuna to Gokul.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"परित्राणाय साधूनां विनाशाय च दुष्कृताम्।"<br/>For the protection of the good and the destruction of the wicked, I take birth age after age.</p>`,
      image: "images/Harivamsa/Birth_of_krishna.jpg"
    },
    {
      front: "Infant in Gokul",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Nanda and Yashoda</h2><p class="text-base">Krishna was raised by Nanda and Yashoda in Gokul. His childhood was filled with divine playfulness—adored by all and feared by the wicked.</p></div>`,
      image: "images/Harivamsa/Infant_in_gokul.jpg"
    },
    {
      front: "Killing of Putana",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Defeat of the Demoness</h2><p class="text-base">The demoness Putana came disguised as a mother to kill Krishna by feeding him poison, but the divine infant sucked out her very life, freeing her soul.</p></div>`,
      image: "images/Harivamsa/Killing_of_putna.jpg"
    },
    {
      front: "The Makhan Chor",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Mischievous Butter Thief</h2><p class="text-base">Little Krishna, known for his mischievous love of butter, enchanted everyone with his innocence. His divine leelas were glimpses of joy beyond reason.</p></div>`,
      image: "images/Harivamsa/Makhan_chor.jpg"
    },
    {
      front: "Meeting of Radha and Krishna",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Eternal Souls Meet</h2><p class="text-base">On the banks of the Yamuna, the eternal souls met—Radha and Krishna. Their eyes spoke a language beyond words; creation stood still. Their love was not of this world—it was the very essence of the divine.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"राधा कृष्ण एक आत्मा द्वे देहे विभज्यते।"<br/>Radha and Krishna are one soul, manifest in two bodies.</p>`,
      image: "images/Harivamsa/Meeting_of_radha_krishna.jpg"
    },
    {
      front: "Rasa Leela—The Dance Divine",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">The Dance of Infinity</h2><p class="text-base">Under the full moon, Krishna multiplied himself so each Gopi felt him as her own. Yet only Radha's heart held him completely—her love was boundless, selfless, and eternal.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"प्रेम ही परं तत्वं।"<br/>Love is the supreme truth.</p>`,
      image: "images/Harivamsa/Ras_leela.jpg"
    },
    {
      front: "Radha's Eternal Devotion",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Love Turned Inward</h2><p class="text-base">When Krishna left for Mathura, Radha stayed—her love turned inward, transforming into pure devotion. Though separated, their souls were never apart. Her silence became the sound of bhakti for all ages.</p></div>`,
      image: "images/Harivamsa/Radha_eternal_devotion.jpg"
    },
    {
      front: "Kaliya Mardan",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Taming the Serpent</h2><p class="text-base">Krishna danced upon the hoods of the venomous serpent Kaliya, purifying the Yamuna and restoring peace. The serpent surrendered, worshipping the Lord.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"मां हि पार्थ व्यपाश्रित्य येऽपि स्यु: पापयोनयः।"<br/>Even the sinful who surrender unto Me attain the supreme path.</p>`,
      image: "images/Harivamsa/Kaliya_mardan.jpg"
    },
    {
      front: "Govardhan Leela",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Lifting the Hill</h2><p class="text-base">When Indra's pride brought storms upon Gokul, Krishna lifted the Govardhan Hill on his little finger, sheltering all beneath it for seven days.</p></div>`,
      image: "images/Harivamsa/Govardhan.jpg"
    },
    {
      front: "End of Kansa",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">The Prophecy Fulfilled</h2><p class="text-base">Krishna returned to Mathura, broke Kansa's tyranny, and freed his parents. The prophecy was fulfilled—righteousness triumphed over arrogance.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"दिव्यं ददाति भगवान् धर्मसंस्थापनार्थकं।"<br/>The Lord bestows divinity to re-establish righteousness on earth.</p>`,
      image: "images/Harivamsa/End of Kansa.jpg"
    },
    {
      front: "Rukmini's Love",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">The Abduction and Union</h2><p class="text-base">Princess Rukmini, devoted to Krishna, sent him a heartfelt letter. Krishna arrived in glory and carried her away, defeating all who opposed their divine union.</p></div>`,
      image: "images/Harivamsa/Rukmini_s Love.jpg"
    },
    {
      front: "Krishna's Marriages and Kingdom",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Dwaraka</h2><p class="text-base">Krishna ruled in Dwaraka, marrying Rukmini, Satyabhama, and other queens. Each union symbolized a divine truth—love, devotion, and cosmic balance.</p></div>`,
      image: "images/Harivamsa/Krishna_s marriages and kingdom.jpg"
    },
    {
      front: "The Syamantaka Jewel",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Clearing the Name</h2><p class="text-base">The Syamantaka gem caused suspicion and strife. Krishna retrieved it from a lion and cleared his name, showing that truth always dispels illusion.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"सत्यं परं धीमहि।"<br/>We meditate upon the Supreme Truth.</p>`,
      image: "images/Harivamsa/Narakasura_s Fall(1).jpg"
    },
    {
      front: "Narakasura's Fall",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Liberation</h2><p class="text-base">Krishna and Satyabhama destroyed the demon Narakasura, freeing thousands of captive princesses—symbolizing liberation of souls from bondage.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"सत्यं परं धीमहि।"<br/>We meditate upon the Supreme Truth.</p>`,
      image: "images/Harivamsa/Narakasura_s Fall.jpg"
    },
    {
      front: "Uddhava Gita",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">The Path of Detachment</h2><p class="text-base">Krishna imparted wisdom to Uddhava—the path of detachment, devotion, and seeing the Lord in all beings.</p></div>`,
      image: "images/Harivamsa/Uddhava Gita.jpg"
    },
    {
      front: "Friend and Guide of Pandavas",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Arjun's Charioteer</h2><p class="text-base">In the great Mahabharata, Krishna became Arjun's charioteer—not a ruler, but a guide. His counsel would echo through eternity as the Bhagavad Gita.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"अहं सर्वस्य प्रभवो मत्तः सर्वं प्रवर्तते।"<br/>I am the source of all creation; everything emanates from Me.</p>`,
      image: "images/Harivamsa/Friend and Guide of Pandavas_.jpg"
    },
    {
      front: "The Vishvarupa",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">The Universal Form</h2><p class="text-base">On the battlefield, Krishna revealed his universal form—countless faces, infinite light. Arjun saw the truth: the universe itself was Krishna.</p></div>`,
      image: "images/Harivamsa/The Vishvarupa_.jpg"
    },
    {
      front: "Final Days in Dwaraka",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Acceptance of Destiny</h2><p class="text-base">The Yadava clan fell to strife. Krishna, serene and unshaken, accepted destiny—a reminder that even avatars withdraw when their purpose is fulfilled.</p></div>`,
      image: "images/Harivamsa/Final Day_s in Dwaraka_.jpg"
    },
    {
      front: "The Departure of Krishna",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">Returning to Vaikuntha</h2><p class="text-base">Resting beneath a tree, Krishna was struck by a hunter's arrow. Smiling, He left His mortal form—returning to His eternal abode with Radha awaiting beyond time.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"न जायते म्रियते वा कदाचित्।"<br/>The soul is never born, nor does it ever die.</p>`,
      image: "images/Harivamsa/The Departure of Krishna_.jpg"
    },
    {
      front: "The Eternal Harivamsa",
      back: `<div class="back-content"><h2 class="text-2xl font-bold mb-3 text-center">The Divine Song</h2><p class="text-base">Thus ends the Harivamsa—the sacred lineage of Hari. Through Krishna's life and leelas, mankind learns that love, devotion, and truth are the highest forms of dharma.</p></div><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"भक्त्या मामभिजानाति यावान्यश्चास्मि तत्त्वतः।"<br/>Only through devotion can one truly know Me as I am.</p>`,
      image: "images/Harivamsa/The Enternal Harivamsa_.jpg"
    }
  ];

  // ============ Ramayan Flashcards Data (from flashcards.html) ============
  const ramayanFlashcards = [
    { front: "Ram's Birth", back: `Lord Vishnu incarnated as Shri Ram in Ayodhya, born to Queen Kaushalya and King Dasharath. The kingdom rejoiced at the divine birth.`, image: 'images/Ramayan/Rams_birth.jpg' },
    { front: "Ram & Brothers", back: `Ram grew up with his three brothers – Bharat, Lakshman, and Shatrughna. Together, they received education in scriptures, warfare, and dharma.`, image: 'images/Ramayan/Ram_and_brothers.jpg' },
    { front: "Sita Swayamvar", back: `In Mithila, Ram broke Lord Shiva’s mighty bow during Sita’s swayamvar, thus winning her hand in marriage.`, image: 'images/Ramayan/Sita_swayamvar.jpg' },
    { front: "Exile Begins", back: `Due to Queen Kaikeyi’s boon, Ram was exiled for 14 years. Sita and Lakshman chose to accompany him, leaving Ayodhya in sorrow.`, image: 'images/Ramayan/Exhile_begins.jpg' },
    { front: "Life in Forest", back: `During exile, Ram, Sita, and Lakshman lived in hermitages, met sages, and protected them by defeating demons in the forests.`, image: 'images/Ramayan/Life_in_forest.jpg' },
    { front: "Sita Abduction", back: `Ravan tricked Sita by sending Marich as a golden deer. While Ram and Lakshman were away, Ravan abducted Sita and took her to Lanka.`, image: 'images/Ramayan/Sita_adbuction.jpg' },
    { front: "Ram Meets Hanuman", back: `Searching for Sita, Ram met Hanuman and Sugriva. Hanuman pledged eternal devotion to Ram and promised to help rescue Sita.`, image: 'images/Ramayan/Ram_meets_hanuman.jpg' },
    { front: "Hanuman in Lanka", back: `Hanuman leapt across the ocean, met Sita in Ashok Vatika, gave her Ram’s ring, and reassured her. Later, he set Lanka ablaze before returning.`, image: 'images/Ramayan/Hanuman_in_lanka.jpg' },
    { front: "Ram Setu", back: `Under Ram’s command, the Vanara army built a stone bridge across the ocean, known as Ram Setu, to reach Lanka.`, image: 'images/Ramayan/Ram_setu.jpg' },
    { front: "Battle with Ravan", back: `A fierce battle was fought between Ram’s army and Ravan’s forces. Finally, Ram killed Ravan, ending his reign of adharma.`, image: 'images/Ramayan/Battle_with_ravan.jpg' },
    { front: "Ram–Sita Reunion", back: `After the war, Ram reunited with Sita. She proved her purity through the Agni Pariksha, and Ram accepted her once again.`, image: 'images/Ramayan/Ram_sita_reunion.jpg' },
    { front: "Return to Ayodhya", back: `With the exile completed, Ram, Sita, and Lakshman returned to Ayodhya in Pushpak Viman. The citizens welcomed them with joy.`, image: 'images/Ramayan/Return_to_ayodhya.jpg' },
    { front: "Diwali Celebrations", back: `To celebrate Ram's return and the victory of dharma over evil, the people of Ayodhya lit lamps. This tradition continues as Diwali.`, image: 'images/Ramayan/Diwali_celebrations.jpg' }
  ];

  // ============ Mahabharata Flashcards Data ============
  const mahabharataFlashcards = [
    { front: "The Birth of Princes", back: `In Hastinapur, King Pandu and Queen Kunti were blessed with five divine sons — the Pandavas. Dhritarashtra and Gandhari had a hundred sons — the Kauravas. Thus began the lineage destined for glory and destruction.`, image: 'images/Mahabharata/The_birth_of_princes.png' },
    { front: "Training Under Dronacharya", back: `The princes mastered archery and warfare under Guru Dronacharya. Arjun shone brightest, becoming his most devoted and skilled student, while jealousy brewed within Duryodhan's heart.`, image: 'images/Mahabharata/Training_under_Dronacharya.png' },
    { front: "Ekalavya's Sacrifice", back: `A tribal boy, Ekalavya, mastered archery by worshipping Drona's idol. When asked for guru dakshina, he cut off his own thumb, proving devotion beyond imagination.`, image: 'images/Mahabharata/Ikalavaya_sacrifice.png' },
    { front: "The Burning Wax Palace", back: `The Kauravas, fearing the Pandavas' rise, built a wax palace to burn them alive. But the Pandavas escaped the fiery trap, living in disguise to protect their fate.`, image: 'images/Mahabharata/The burning wax palace .png' },
    { front: "The Swayamvar of Draupadi", back: `At King Drupad's court, Arjun pierced the eye of a moving fish to win Draupadi's hand. Her marriage to all five Pandavas became the turning point of destiny.`, image: 'images/Mahabharata/The_Swayamvar_of_Draupadi.png' },
    { front: "The Kuru Kingdom Divided", back: `Dhritarashtra divided the kingdom. The Pandavas received barren Khandavprastha, which they turned into the magnificent city of Indraprastha — a symbol of righteousness and prosperity.`, image: 'images/Mahabharata/Kuru_kingdon_divided.jpg' },
    { front: "The Game of Dice", back: `Tricked by Shakuni's cunning, Yudhishthir gambled away his kingdom, his brothers, and even Draupadi. The dice of deceit rolled the first cries of war.`, image: 'images/Mahabharata/The_game_of_dice.png' },
    { front: "Draupadi's Humiliation", back: `In the royal court, Duryodhan tried to disrobe Draupadi. She called upon Lord Krishna, who protected her honor endlessly, filling the hall with divine radiance.`, image: 'images/Mahabharata/Draupadi_Humiliation.png' },
    { front: "Vow of Vengeance", back: `Humiliated and broken, Draupadi swore that her hair would remain untied until it was washed in Dushasan's blood. The Pandavas vowed to avenge her dishonor.`, image: 'images/Mahabharata/Vow of vengeance _edit_163654213504757.png' },
    { front: "The Exile Years", back: `The Pandavas spent 13 long years in exile, enduring hardships, gaining wisdom, and forming alliances. Arjun acquired divine weapons; Bhim met Hanuman; and Krishna guided them through despair.`, image: 'images/Mahabharata/The_exile_years.jpg' },
    { front: "Krishna's Counsel", back: `When peace negotiations failed, Krishna offered his army to one side and himself, weaponless, to the other. Arjun chose Krishna as his charioteer, sealing his path toward destiny.`, image: 'images/Mahabharata/Krishna_Counsel.png' },
    { front: "The Battlefield of Kurukshetra", back: `Two mighty armies faced each other — the Pandavas and Kauravas, kin against kin, dharma against adharma. The earth trembled, and time stood still as war began.`, image: 'images/Mahabharata/The_battlefield_of_kuruksheta.png' },
    { front: "Arjun's Despair", back: `Seeing his own relatives on the battlefield, Arjun's heart wavered. He dropped his bow, questioning the meaning of duty and righteousness.<br/><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।"<br/>You have the right to perform your duty, but not to the fruits of your actions.</p>`, image: 'images/Mahabharata/Arjun_despair.png' },
    { front: "The Song of the Gita", back: `Krishna revealed the eternal truth — life and death are illusions; the soul is immortal. He urged Arjun to rise, fight, and uphold dharma.<br/><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः।"<br/>Weapons cannot cut the soul, fire cannot burn it.</p>`, image: 'images/Mahabharata/The_song_of_the_Gita.png' },
    { front: "The War Commences", back: `With the conch shells roaring, the great Mahabharata war began. Heroes clashed, arrows darkened the skies, and dharma battled for its survival.`, image: 'images/Mahabharata/The_war_commence.png' },
    { front: "Bhishma's Fall", back: `Bound by his vow, Bhishma fought fiercely for the Kauravas until Arjun, guided by Shikhandi, brought him down on a bed of arrows — the grandsire's final rest.`, image: 'images/Mahabharata/Bishma_Fall.png' },
    { front: "Drona's Death", back: `Tricked by the false news of his son Ashwatthama's death, Drona laid down his arms. Dhrishtadyumna beheaded him, ending the might of the guru's wrath.`, image: 'images/Mahabharata/Drona_Death.png' },
    { front: "Karna's Fate", back: `Arjun faced his greatest rival, Karna — the unsung son of Kunti. When Karna's chariot wheel sank, Arjun, urged by Krishna, released the fatal arrow.<br/><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।"<br/>Abandon all duties and surrender unto Me alone.</p>`, image: 'images/Mahabharata/Karna_fate.png' },
    { front: "Abhimanyu's Sacrifice", back: `The young Abhimanyu broke into the Chakravyuha formation but was surrounded and slain mercilessly. His valor became immortal, echoing through generations.`, image: 'images/Mahabharata/Abhimanyu_sacrifice.png' },
    { front: "The Death of Duryodhan", back: `Bhim met Duryodhan in a fierce mace duel. Remembering his vow, Bhim struck Duryodhan on the thigh — ending his tyranny and fulfilling Draupadi's oath.`, image: 'images/Mahabharata/Death_of_Duryodhan.png' },
    { front: "The Fall of the Warriors", back: `The battlefield lay silent. Blood, valor, and sacrifice marked the soil of Kurukshetra. Victory came, but at the cost of countless lives.<br/><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"जातस्य हि ध्रुवो मृत्युर्ध्रुवं जन्म मृतस्य च।"<br/>For one who is born, death is certain; for one who dies, rebirth is certain.</p>`, image: 'images/Mahabharata/The_fall_of_warriors.png' },
    { front: "The Coronation of Yudhishthir", back: `After the war, Yudhishthir was crowned King of Hastinapur. Peace returned, yet the weight of loss haunted the Pandavas' hearts.`, image: 'images/Mahabharata/The_coronation_of_Yudhishthir.png' },
    { front: "The End of the Pandavas' Journey", back: `After ruling for years, the Pandavas renounced the throne and journeyed to the Himalayas, seeking liberation. One by one, they fell, until only Yudhishthir reached heaven.`, image: 'images/Mahabharata/End_of_pandavas.png' },
    { front: "Krishna's Departure", back: `In Dwarka, Krishna ended his earthly life, struck by a hunter's arrow. With his departure, the Dvapara Yuga came to a close, and Kali Yuga began.<br/><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।"<br/>Whenever righteousness declines, I manifest myself to restore balance.</p>`, image: 'images/Mahabharata/Krishna_departure.png' },
    { front: "Legacy of the Mahabharata", back: `The tale of Mahabharata endures as the eternal struggle between dharma and adharma. Its lessons guide humanity — that truth, duty, and righteousness always prevail, even through destruction.<br/><p class="quote"><span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>"यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।"<br/>Wherever Krishna and Arjuna stand together, there will be victory, prosperity, and righteousness.</p>`, image: 'images/Mahabharata/Legacy_of_Mahabharata.png' }
  ];

  let flashIndex = 0;
  const totalHarivamsa = harivamsaFlashcards.length;
  const totalRamayan = ramayanFlashcards.length;
  const totalMahabharata = mahabharataFlashcards.length;
  let currentEpic = null; // 'harivamsa' | 'ramayan' | 'mahabharat'

  function setFlashHeader(title, desc) {
    if (flashcardHeaderTitle) flashcardHeaderTitle.textContent = title || 'Epic Flashcards';
    if (flashcardHeaderDesc) flashcardHeaderDesc.textContent = desc || 'Click a card to flip it. Use Enter or Space for keyboard.';
  }

  function placeholderFor(text) {
    const encoded = encodeURIComponent((text || 'Harivamsa').replace('/', ' | '));
    return `https://placehold.co/400x300/fffafa/003366?text=${encoded}`;
  }

  function renderEpicCard(index) {
    if (!flashcardsGrid || !currentEpic) return;
    let arr, total;
    if (currentEpic === 'harivamsa') {
      arr = harivamsaFlashcards;
      total = totalHarivamsa;
    } else if (currentEpic === 'ramayan') {
      arr = ramayanFlashcards;
      total = totalRamayan;
    } else if (currentEpic === 'mahabharat') {
      arr = mahabharataFlashcards;
      total = totalMahabharata;
    } else {
      return;
    }
    const data = arr[index];
    const imgSrc = data.image || data.front;
    const cardId = `epic-card`;
    flashcardsGrid.innerHTML = `
      <div class="flashcard-container" tabindex="0" aria-label="Flashcard ${index + 1} of ${total}">
        <div class="flashcard" id="${cardId}" role="button" aria-pressed="false">
          <div class="flashcard-front bg-white">
            <div class="image-wrap">
              <img class="flashcard-image" src="${imgSrc}" alt="${data.front}" onerror="this.onerror=null; this.src='${placeholderFor(data.front)}';"/>
            </div>
            <div style="padding: 0.75rem 1rem; text-align:center;">
              <h3 style="margin:0; font-size:1.05rem; color:#0f172a; font-weight:700;">${data.front}</h3>
            </div>
          </div>
          <div class="flashcard-back">${data.back}</div>
        </div>
      </div>
    `;

    const cardEl = document.getElementById(cardId);
    if (cardEl) {
      const toggleFlip = () => cardEl.classList.toggle('flipped');
      cardEl.addEventListener('click', toggleFlip);
      const container = flashcardsGrid.querySelector('.flashcard-container');
      if (container) {
        container.addEventListener('keydown', (e) => {
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            toggleFlip();
          }
          if (e.code === 'ArrowRight') goNextCard();
          if (e.code === 'ArrowLeft') goPrevCard();
        });
        setTimeout(() => container.focus(), 10);
      }
    }
    if (flashcardPosition) flashcardPosition.textContent = `${index + 1} / ${total}`;
    if (flashcardPrev) flashcardPrev.disabled = index === 0;
    if (flashcardNext) flashcardNext.disabled = index === total - 1;
  }

  function goPrevCard() {
    let total;
    if (currentEpic === 'harivamsa') total = totalHarivamsa;
    else if (currentEpic === 'ramayan') total = totalRamayan;
    else if (currentEpic === 'mahabharat') total = totalMahabharata;
    if (flashIndex > 0) {
      flashIndex -= 1;
      renderEpicCard(flashIndex);
    }
  }
  function goNextCard() {
    let total;
    if (currentEpic === 'harivamsa') total = totalHarivamsa;
    else if (currentEpic === 'ramayan') total = totalRamayan;
    else if (currentEpic === 'mahabharat') total = totalMahabharata;
    if (flashIndex < total - 1) {
      flashIndex += 1;
      renderEpicCard(flashIndex);
    }
  }

  if (flashcardPrev) flashcardPrev.addEventListener('click', () => goPrevCard());
  if (flashcardNext) flashcardNext.addEventListener('click', () => goNextCard());
  if (flashcardBackBtn) flashcardBackBtn.addEventListener('click', () => {
    closeFlashcardsView();
    detailsSidebar.classList.add('open');
  });

  // More Details button click handler
  if (moreDetailsBtn) {
    moreDetailsBtn.addEventListener('click', () => {
      const epic = moreDetailsBtn.getAttribute('data-epic');
      if (epic) openEpicFlashcards(epic);
    });
  }

  function openEpicFlashcards(epic) {
    if (!flashcardContent || !detailsContent) return;
    currentEpic = epic;
    let title;
    if (epic === 'harivamsa') title = "Harivamsa: Krishna's Lineage";
    else if (epic === 'ramayan') title = 'Ramayan: Journey of Shri Ram';
    else if (epic === 'mahabharat') title = 'Mahabharata: The Eternal Song of Dharma';
    else title = 'Epic Flashcards';
    setFlashHeader(title, 'Click a card to flip. Use arrow keys to navigate.');
    detailsContent.style.display = 'none';
    flashcardContent.classList.add('active');
    detailsSidebar.classList.add('open');
    flashIndex = 0;
    renderEpicCard(flashIndex);
  }

  function closeFlashcardsView() {
    if (!flashcardContent || !detailsContent) return;
    flashcardContent.classList.remove('active');
    detailsContent.style.display = 'block';
    // Reset epic-specific state so reopening starts fresh
    currentEpic = null;
    flashIndex = 0;
    if (flashcardPrev) flashcardPrev.disabled = true;
    if (flashcardNext) flashcardNext.disabled = true;
    if (flashcardPosition) flashcardPosition.textContent = '';
  }

  // ============ Icon Creation Helper ============
  const iconUrls = {
    monuments_and_architecture: 'filters/monuments_and_architecture.png',
    folk_arts_and_handcrafts: 'filters/folk_arts_and_handcrafts.png',
    cuisine: 'filters/cuisine.png',
    music_and_dance: 'filters/music_and_dance.png',
    festivals_and_traditions: 'filters/festivals_and_traditions.png',
    spiritual_and_pilgrimage: 'filters/spiritual_and_pilgrimage.png',
    nature_and_wildlife: 'filters/nature_and_wildlife.png',
    tales_and_epics: 'filters/Tales_and_epics.png',
    default: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
  };

  function createMarker(item) {
    const iconUrl = iconUrls[item.category] || iconUrls.default;
    const customIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: [36, 42], // Adjust size as needed for your images
      iconAnchor: [18, 42], // Center bottom of icon (half width, full height)
      popupAnchor: [0, -42], // Popup appears above icon (0 horizontal, negative height)
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [12, 41]
    });
    return L.marker(item.coords, { icon: customIcon });
  }

  // --- Function to display details in the sidebar ---
  function displayDetails(item) {
    // Handle image loading with error fallback
    if (item.image_url) {
      detailsImage.src = item.image_url;
      detailsImage.onerror = () => {
        console.warn(`Failed to load image for ${item.name}: ${item.image_url}`);
        detailsImage.style.display = 'none';
      };
      detailsImage.onload = () => {
        detailsImage.style.display = 'block';
      };
    } else {
      detailsImage.style.display = 'none';
    }

    // Override heritage icon for tales_and_epics category with epic-specific cover
    try {
      const epicCovers = {
        harivamsa: 'images/Tales_and_epics/Harivamsa1 (1).jpg',
        ramayan: 'images/Tales_and_epics/Ramayan1 (1).jpg',
        mahabharat: 'images/Tales_and_epics/Mahabharat1 (1).jpg'
      };
      const epLower = item.epic ? String(item.epic).toLowerCase() : null;
      if (item.category === 'tales_and_epics' && epLower && epicCovers[epLower]) {
        // Only replace if current src is missing or still using generic heritage icon
        const isGeneric = /heritage_icon\.png$/i.test(detailsImage.src) || !detailsImage.src;
        if (isGeneric || detailsImage.src.endsWith('heritage_icon.png')) {
          detailsImage.src = epicCovers[epLower];
          detailsImage.style.display = 'block';
        }
      }
    } catch (e) {
      console.warn('Epic cover override failed:', e);
    }

    detailsImage.alt = item.name;
    detailsName.textContent = item.name;
    detailsYear.textContent = item.year;
    detailsInfo.textContent = item.info;
    detailsText.textContent = item.details || "More details for this location will be added soon.";

    // Show "Explore Flashcards" button for supported epics
    if (moreDetailsBtn) {
      const allowedEpics = ['harivamsa','ramayan','mahabharat'];
      const ep = item.epic ? String(item.epic).toLowerCase() : null;
      if (ep && allowedEpics.includes(ep)) {
        moreDetailsBtn.classList.add('visible');
        moreDetailsBtn.setAttribute('data-epic', ep);
        let label;
        if (ep === 'harivamsa') label = 'Explore Harivamsa Flashcards';
        else if (ep === 'ramayan') label = 'Explore Ramayan Flashcards';
        else if (ep === 'mahabharat') label = 'Explore Mahabharata Flashcards';
        else label = 'Explore Flashcards';
        moreDetailsBtn.innerHTML = `<span class="icon">📖</span><span>${label}</span>`;
      } else {
        moreDetailsBtn.classList.remove('visible');
        moreDetailsBtn.removeAttribute('data-epic');
      }
    }

    // Close flashcards and show details
    closeFlashcardsView();
    
    // Open the sidebar
    detailsSidebar.classList.add('open');
  }

  function showMarkers() {
    markerLayer.clearLayers();
    console.log('showMarkers called, sites:', sites.length);
    let markersAdded = 0;
    (sites || []).forEach(item => {
      let matchesTheme = activeTheme === 'all' || item.category === activeTheme;
      if (activeTheme === 'tales_and_epics' && activeEpic) {
        matchesTheme = matchesTheme && (String(item.epic || '').toLowerCase() === String(activeEpic).toLowerCase());
      }
      const matchesYear = Number(item.year) <= Number(activeYear);
      const query = (searchQuery || '').toLowerCase();
      const matchesSearch = !query || [
        item.name,
        item.info,
        item.details,
        item.category,
        String(item.year)
      ].filter(Boolean).some(v => String(v).toLowerCase().includes(query));
      if (matchesTheme && matchesYear && matchesSearch) {
        const marker = createMarker(item);

        // Create popup content with epic cover overrides for tales_and_epics
        let popupImageUrl = item.image_url || '';
        if (item.category === 'tales_and_epics') {
          const epicCovers = {
            harivamsa: 'images/Tales_and_epics/Harivamsa1 (1).jpg',
            ramayan: 'images/Tales_and_epics/Ramayan1 (1).jpg',
            mahabharat: 'images/Tales_and_epics/Mahabharat1 (1).jpg'
          };
            const epLower = item.epic ? String(item.epic).toLowerCase() : null;
            const needsOverride = !popupImageUrl || /heritage_icon\.png$/i.test(popupImageUrl);
            if (epLower && epicCovers[epLower] && needsOverride) {
              popupImageUrl = epicCovers[epLower];
            }
        }
        const popupContent = `
          <div style="width:240px;font-family:'Poppins',sans-serif" class="marker-popup">
            ${popupImageUrl ? `<img src="${popupImageUrl}" alt="${item.name}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;cursor:pointer" class="popup-image">` : ''}
            <h4 style="margin:0 0 6px 0;cursor:pointer" class="popup-name">${item.name}</h4>
            <div style="font-size:13px;color:#333">${item.info}</div>
            <div style="margin-top:8px;font-size:12px;color:#666">Year: ${item.year}</div>
          </div>
        `;

        // Bind popup to marker
        marker.bindPopup(popupContent, {minWidth:220});

        // Add click handler to popup content to open sidebar
        marker.on('popupopen', (e) => {
          const popup = e.popup;
          const popupElement = popup.getElement();

          // Add click handlers to name and image
          const nameElement = popupElement.querySelector('.popup-name');
          const imageElement = popupElement.querySelector('.popup-image');

          if (nameElement) {
            nameElement.addEventListener('click', (clickEvent) => {
              clickEvent.stopPropagation();
              marker.closePopup();
              displayDetails(item);
            });
          }

          if (imageElement) {
            imageElement.addEventListener('click', (clickEvent) => {
              clickEvent.stopPropagation();
              marker.closePopup();
              displayDetails(item);
            });
          }
        });

        // Optional: still show a simple tooltip on hover
        marker.bindTooltip(item.name);

        markerLayer.addLayer(marker);
        markersAdded++;
      }
    });
    console.log('Markers added:', markersAdded);
  }

  fetch('data.json', { cache: 'no-cache' })
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      return resp.json();
    })
    .then(data => {
      sites = data;
      // Make sure all entries have a details field for consistency
      sites.forEach(site => {
        if (!site.details) {
          site.details = "Detailed information for this site is not yet available.";
        }
      });
      showMarkers();
      console.log(`Successfully loaded ${sites.length} heritage sites`);
    })
    .catch(err => {
      console.error('Error loading data.json:', err);
      // Show user-friendly error message
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      errorMsg.innerHTML = `<strong>Error:</strong> Failed to load heritage sites data. Please check the console for details.`;
      document.body.appendChild(errorMsg);
      setTimeout(() => errorMsg.remove(), 5000);
    });

  const hamburger = document.getElementById('hamburger');
  const sidebarEl = document.getElementById('sidebar');
  const yearRange = document.getElementById('yearRange');
  const yearLabel = document.getElementById('yearLabel');
  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');

  function updateMapMargin() {
    const expanded = sidebarEl.classList.contains('expanded');
    const leftMargin = expanded ? getComputedStyle(document.documentElement).getPropertyValue('--sidebar-expanded-width').trim() : getComputedStyle(document.documentElement).getPropertyValue('--sidebar-collapsed-width').trim();
    document.getElementById('map').style.marginLeft = leftMargin;
    setTimeout(() => map.invalidateSize(), 360);
  }
  updateMapMargin();

  hamburger.addEventListener('click', () => {
    sidebarEl.classList.toggle('expanded');
    hamburger.classList.toggle('open');
    updateMapMargin();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentActiveBtn = document.querySelector('.filter-btn.active');
      const wasActiveClick = currentActiveBtn === btn;
      if (currentActiveBtn) currentActiveBtn.classList.remove('active');
      btn.classList.add('active');
      activeTheme = btn.dataset.theme;
      const epicSubfiltersEl = document.getElementById('epicSubfilters');
      if (epicSubfiltersEl) {
        if (activeTheme === 'tales_and_epics') {
          if (wasActiveClick) {
            epicSubfiltersEl.classList.remove('open');
            activeEpic = null;
            document.querySelectorAll('#epicSubfilters .subfilter-btn.active').forEach(b => b.classList.remove('active'));
            closeFlashcardsView();
          } else {
            epicSubfiltersEl.classList.add('open');
          }
        } else {
          epicSubfiltersEl.classList.remove('open');
          activeEpic = null;
          document.querySelectorAll('#epicSubfilters .subfilter-btn.active').forEach(b => b.classList.remove('active'));
          closeFlashcardsView();
        }
      }
      showMarkers();
    });
  });

  yearRange.addEventListener('input', e => {
    activeYear = e.target.value;
    yearLabel.textContent = activeYear;
    showMarkers();
  });

  function debounce(fn, delay = 250) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }
  if (searchInput) {
    const handleSearch = debounce((e) => {
      searchQuery = (e.target.value || '').trim();
      showMarkers();
    }, 300);
    searchInput.addEventListener('input', handleSearch);
  }
  if (clearSearch && searchInput) {
    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      showMarkers();
    });
  }

  zoomIn.addEventListener('click', () => map.zoomIn());
  zoomOut.addEventListener('click', () => map.zoomOut());

  // --- Event listener to close the details sidebar ---
  closeSidebarBtn.addEventListener('click', () => {
    detailsSidebar.classList.remove('open');
  });

  // --- Close sidebar when clicking outside of it ---
  detailsSidebar.addEventListener('click', (e) => {
    if (e.target === detailsSidebar) {
      detailsSidebar.classList.remove('open');
    }
  });

  window.addEventListener('resize', () => {
    setTimeout(() => map.invalidateSize(), 200);
  });
  
  setTimeout(() => map.invalidateSize(), 500);

  // Subfilter buttons for Tales & Epics
  const epicButtons = document.querySelectorAll('#epicSubfilters .subfilter-btn');
  if (epicButtons && epicButtons.length) {
    epicButtons.forEach(sb => {
      sb.addEventListener('click', () => {
        const mainEpicBtn = document.querySelector('.filter-btn[data-theme="tales_and_epics"]');
        const currentActive = document.querySelector('.filter-btn.active');
        if (mainEpicBtn) {
          if (currentActive) currentActive.classList.remove('active');
          mainEpicBtn.classList.add('active');
        }
        activeTheme = 'tales_and_epics';

        epicButtons.forEach(b => b.classList.remove('active'));
        sb.classList.add('active');
        activeEpic = sb.dataset.epic;

        const epicSubfiltersEl = document.getElementById('epicSubfilters');
        if (epicSubfiltersEl) epicSubfiltersEl.classList.add('open');

        showMarkers();
        
        // Close flashcards when switching epics
        closeFlashcardsView();
      });
    });
  }
});