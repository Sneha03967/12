document.addEventListener('DOMContentLoaded', () => {
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

  // --- NEW: Get references to the details sidebar elements ---
  const detailsSidebar = document.getElementById('detailsSidebar');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const detailsImage = document.getElementById('detailsImage');
  const detailsName = document.getElementById('detailsName');
  const detailsYear = document.getElementById('detailsYear');
  const detailsInfo = document.getElementById('detailsInfo');
  const detailsText = document.getElementById('detailsText');

  // --- NEW: Add error handling for missing elements ---
  if (!detailsSidebar || !closeSidebarBtn || !detailsImage || !detailsName || !detailsYear || !detailsInfo || !detailsText) {
    console.error('Some details sidebar elements are missing from the HTML');
  }

  // ============ Harivamsa Flashcards Data & Logic ============
  /**
   * Flashcard type: { front: string, back: string(HTML), image?: string }
   */
  const harivamsaFlashcards = [
    {
      front: "Birth of the Yadu Lineage",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">The Yadu Dynasty</h2>
              <p class="text-base">The mighty Yadu dynasty was founded by King Yadu, descendant of the Moon god. From this divine line, Lord Krishna would one day take birth to restore dharma on earth.</p>
          </div>
      `,
      image: "images/Harivamsa/The Enternal Harivamsa_.jpg"
    },
    {
      front: "Prophecy of Krishna’s Birth",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Kansa's Fear</h2>
              <p class="text-base">King Kansa of Mathura feared a prophecy—that Devaki’s eighth child would end his life. Blinded by terror, he imprisoned Devaki and her husband, Vasudeva.</p>
          </div>
      `,
      image: "images/Harivamsa/King_Kansa.jpg"
    },
    {
      front: "Birth of Lord Krishna",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">The Divine Midnight</h2>
              <p class="text-base">At midnight, in the prison of Mathura, the divine child Krishna was born. The chains fell open, guards slept, and Vasudeva carried the infant across the Yamuna to Gokul.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “परित्राणाय साधूनां विनाशाय च दुष्कृताम्।”<br/>
              For the protection of the good and the destruction of the wicked, I take birth age after age.
          </p>
      `,
      image: "images/Harivamsa/Birth_of_krishna.jpg"
    },
    {
      front: "Infant in Gokul",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Nanda and Yashoda</h2>
              <p class="text-base">Krishna was raised by Nanda and Yashoda in Gokul. His childhood was filled with divine playfulness—adored by all and feared by the wicked.</p>
          </div>
      `,
      image: "images/Harivamsa/Infant_in_gokul.jpg"
    },
    {
      front: "Killing of Putana",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Defeat of the Demoness</h2>
              <p class="text-base">The demoness Putana came disguised as a mother to kill Krishna by feeding him poison, but the divine infant sucked out her very life, freeing her soul.</p>
          </div>
      `,
      image: "images/Harivamsa/Killing_of_putna.jpg"
    },
    {
      front: "The Makhan Chor",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Mischievous Butter Thief</h2>
              <p class="text-base">Little Krishna, known for his mischievous love of butter, enchanted everyone with his innocence. His divine leelas were glimpses of joy beyond reason.</p>
          </div>
      `,
      image: "images/Harivamsa/Makhan_chor.jpg"
    },
    {
      front: "Meeting of Radha and Krishna",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Eternal Souls Meet</h2>
              <p class="text-base">On the banks of the Yamuna, the eternal souls met—Radha and Krishna. Their eyes spoke a language beyond words; creation stood still. Their love was not of this world—it was the very essence of the divine.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “राधा कृष्ण एक आत्मा द्वे देहे विभज्यते।”<br/>
              Radha and Krishna are one soul, manifest in two bodies.
          </p>
      `,
      image: "images/Harivamsa/Meeting_of_radha_krishna.jpg"
    },
    {
      front: "Rasa Leela—The Dance Divine",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">The Dance of Infinity</h2>
              <p class="text-base">Under the full moon, Krishna multiplied himself so each Gopi felt him as her own. Yet only Radha’s heart held him completely—her love was boundless, selfless, and eternal.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “प्रेम ही परं तत्वं।”<br/>
              Love is the supreme truth.
          </p>
      `,
      image: "images/Harivamsa/Ras_leela.jpg"
    },
    {
      front: "Radha’s Eternal Devotion",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Love Turned Inward</h2>
              <p class="text-base">When Krishna left for Mathura, Radha stayed—her love turned inward, transforming into pure devotion. Though separated, their souls were never apart. Her silence became the sound of bhakti for all ages.</p>
          </div>
      `,
      image: "images/Harivamsa/Radha_eternal_devotion.jpg"
    },
    {
      front: "Kaliya Mardan",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Taming the Serpent</h2>
              <p class="text-base">Krishna danced upon the hoods of the venomous serpent Kaliya, purifying the Yamuna and restoring peace. The serpent surrendered, worshipping the Lord.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “मां हि पार्थ व्यपाश्रित्य येऽपि स्यु: पापयोनयः।”<br/>
              Even the sinful who surrender unto Me attain the supreme path.
          </p>
      `,
      image: "images/Harivamsa/Kaliya_mardan.jpg"
    },
    {
      front: "Govardhan Leela",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Lifting the Hill</h2>
              <p class="text-base">When Indra’s pride brought storms upon Gokul, Krishna lifted the Govardhan Hill on his little finger, sheltering all beneath it for seven days.</p>
          </div>
      `,
      image: "images/Harivamsa/Govardhan.jpg"
    },
    {
      front: "End of Kansa",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">The Prophecy Fulfilled</h2>
              <p class="text-base">Krishna returned to Mathura, broke Kansa’s tyranny, and freed his parents. The prophecy was fulfilled—righteousness triumphed over arrogance.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “दिव्यं ददाति भगवान् धर्मसंस्थापनार्थकं।”<br/>
              The Lord bestows divinity to re-establish righteousness on earth.
          </p>
      `,
      image: "images/Harivamsa/End of Kansa.jpg"
    },
    {
      front: "Rukmini’s Love",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">The Abduction and Union</h2>
              <p class="text-base">Princess Rukmini, devoted to Krishna, sent him a heartfelt letter. Krishna arrived in glory and carried her away, defeating all who opposed their divine union.</p>
          </div>
      `,
      image: "images/Harivamsa/Rukmini_s Love.jpg"
    },
    {
      front: "Krishna’s Marriages and Kingdom",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Dwaraka</h2>
              <p class="text-base">Krishna ruled in Dwaraka, marrying Rukmini, Satyabhama, and other queens. Each union symbolized a divine truth—love, devotion, and cosmic balance.</p>
          </div>
      `,
      image: "images/Harivamsa/Krishna_s marriages and kingdom.jpg"
    },
    {
      front: "The Syamantaka Jewel",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Clearing the Name</h2>
              <p class="text-base">The Syamantaka gem caused suspicion and strife. Krishna retrieved it from a lion and cleared his name, showing that truth always dispels illusion.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “सत्यं परं धीमहि।”<br/>
              We meditate upon the Supreme Truth.
          </p>
      `,
      image: "images/Harivamsa/Narakasura_s Fall(1).jpg"
    },
    {
      front: "Narakasura’s Fall",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Liberation</h2>
              <p class="text-base">Krishna and Satyabhama destroyed the demon Narakasura, freeing thousands of captive princesses—symbolizing liberation of souls from bondage.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “सत्यं परं धीमहि।”<br/>
              We meditate upon the Supreme Truth.
          </p>
      `,
      image: "images/Harivamsa/Narakasura_s Fall.jpg"
    },
    {
      front: "Uddhava Gita",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">The Path of Detachment</h2>
              <p class="text-base">Krishna imparted wisdom to Uddhava—the path of detachment, devotion, and seeing the Lord in all beings.</p>
          </div>
      `,
      image: "images/Harivamsa/Uddhava Gita.jpg"
    },
    {
      front: "Friend and Guide of Pandavas",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Arjun's Charioteer</h2>
              <p class="text-base">In the great Mahabharata, Krishna became Arjun’s charioteer—not a ruler, but a guide. His counsel would echo through eternity as the Bhagavad Gita.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “अहं सर्वस्य प्रभवो मत्तः सर्वं प्रवर्तते।”<br/>
              I am the source of all creation; everything emanates from Me.
          </p>
      `,
      image: "images/Harivamsa/Friend and Guide of Pandavas_.jpg"
    },
    {
      front: "The Vishvarupa",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">The Universal Form</h2>
              <p class="text-base">On the battlefield, Krishna revealed his universal form—countless faces, infinite light. Arjun saw the truth: the universe itself was Krishna.</p>
          </div>
      `,
      image: "images/Harivamsa/The Vishvarupa_.jpg"
    },
    {
      front: "Final Days in Dwaraka",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Acceptance of Destiny</h2>
              <p class="text-base">The Yadava clan fell to strife. Krishna, serene and unshaken, accepted destiny—a reminder that even avatars withdraw when their purpose is fulfilled.</p>
          </div>
      `,
      image: "images/Harivamsa/Final Day_s in Dwaraka_.jpg"
    },
    {
      front: "The Departure of Krishna",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">Returning to Vaikuntha</h2>
              <p class="text-base">Resting beneath a tree, Krishna was struck by a hunter’s arrow. Smiling, He left His mortal form—returning to His eternal abode with Radha awaiting beyond time.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “न जायते म्रियते वा कदाचित्।”<br/>
              The soul is never born, nor does it ever die.
          </p>
      `,
      image: "images/Harivamsa/The Departure of Krishna_.jpg"
    },
    {
      front: "The Eternal Harivamsa",
      back: `
          <div class="back-content">
              <h2 class="text-2xl font-bold mb-3 text-center">The Divine Song</h2>
              <p class="text-base">Thus ends the Harivamsa—the sacred lineage of Hari. Through Krishna’s life and leelas, mankind learns that love, devotion, and truth are the highest forms of dharma.</p>
          </div>
          <p class="quote">
              <span class="text-[#003366] font-extrabold text-xl">ॐ</span><br/>
              “भक्त्या मामभिजानाति यावान्यश्चास्मि तत्त्वतः।”<br/>
              Only through devotion can one truly know Me as I am.
          </p>
      `,
      image: "images/Harivamsa/The Enternal Harivamsa_.jpg"
    }
  ];

  let flashIndex = 0;
  const totalHarivamsa = harivamsaFlashcards.length;

  function setFlashHeader(title, desc) {
    if (flashcardHeaderTitle) flashcardHeaderTitle.textContent = title || 'Epic Flashcards';
    if (flashcardHeaderDesc) flashcardHeaderDesc.textContent = desc || 'Click a card to flip it. Use Enter or Space for keyboard.';
  }

  function placeholderFor(text) {
    const encoded = encodeURIComponent((text || 'Harivamsa').replace('/', ' | '));
    return `https://placehold.co/400x300/fffafa/003366?text=${encoded}`;
  }

  function renderHarivamsaCard(index) {
    if (!flashcardsGrid) return;
    const data = harivamsaFlashcards[index];
    const imgSrc = data.image || data.front;
    // Build single flip card
    flashcardsGrid.innerHTML = `
      <div class="flashcard-container" tabindex="0" aria-label="Flashcard ${index + 1} of ${totalHarivamsa}">
        <div class="flashcard" id="harivamsa-card" role="button" aria-pressed="false">
          <div class="flashcard-front bg-white">
            <div class="image-wrap">
              <img class="flashcard-image" src="${imgSrc}" alt="${data.front}" onerror="this.onerror=null; this.src='${placeholderFor(data.front)}';"/>
            </div>
            <div style="padding: 0.75rem 1rem; text-align:center;">
              <h3 style="margin:0; font-size:1.05rem; color:#0f172a; font-weight:700;">${data.front}</h3>
            </div>
          </div>
          <div class="flashcard-back">
            ${data.back}
          </div>
        </div>
      </div>
    `;

    // attach flip events
    const cardEl = document.getElementById('harivamsa-card');
    if (cardEl) {
      const toggleFlip = () => {
        cardEl.classList.toggle('flipped');
      };
      cardEl.addEventListener('click', toggleFlip);
      // keyboard accessibility
      const container = flashcardsGrid.querySelector('.flashcard-container');
      if (container) {
        container.addEventListener('keydown', (e) => {
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            toggleFlip();
          }
          if (e.code === 'ArrowRight') {
            goNextCard();
          }
          if (e.code === 'ArrowLeft') {
            goPrevCard();
          }
        });
        // focus initial for keyboard
        setTimeout(() => container.focus(), 10);
      }
    }

    // update nav state
    if (flashcardPosition) flashcardPosition.textContent = `${index + 1} / ${totalHarivamsa}`;
    if (flashcardPrev) flashcardPrev.disabled = index === 0;
    if (flashcardNext) flashcardNext.disabled = index === totalHarivamsa - 1;
  }

  function goPrevCard() { if (flashIndex > 0) { flashIndex -= 1; renderHarivamsaCard(flashIndex); } }
  function goNextCard() { if (flashIndex < totalHarivamsa - 1) { flashIndex += 1; renderHarivamsaCard(flashIndex); } }

  if (flashcardPrev) flashcardPrev.addEventListener('click', () => goPrevCard());
  if (flashcardNext) flashcardNext.addEventListener('click', () => goNextCard());

  function openHarivamsaFlashcards() {
    if (!flashcardContent) return;
    setFlashHeader("Harivamsa: Krishna's Lineage", 'Click a card to flip. Use arrow keys to navigate.');
    // Hide details content, show flashcards
      html: `<div style="width: 20px; height: 20px; background-color: #3498db; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'default-marker-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const customIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor: [0, -28],
      errorIconUrl: iconUrls.default // Fallback to default icon on error
    });

    return L.marker(item.coords, { icon: customIcon });
  }

  // --- NEW: Function to display details in the sidebar ---
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

    detailsImage.alt = item.name;
    detailsName.textContent = item.name;
    detailsYear.textContent = item.year;
    detailsInfo.textContent = item.info;
    detailsText.textContent = item.details || "More details for this location will be added soon.";

    // Open the sidebar
    detailsSidebar.classList.add('open');
    // Ensure details view visible if we came from flashcards
    closeFlashcardsView();
  }

  function showMarkers() {
    markerLayer.clearLayers();
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

        // Create popup content with click handlers
        const popupContent = `
          <div style="width:240px;font-family:'Poppins',sans-serif" class="marker-popup">
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;cursor:pointer" class="popup-image">` : ''}
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
      }
    });
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
      // If Tales & Epics but no subfilter yet, keep flashcards hidden
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

  // --- NEW: Event listener to close the details sidebar ---
  closeSidebarBtn.addEventListener('click', () => {
    detailsSidebar.classList.remove('open');
  });

  // --- NEW: Close sidebar when clicking outside of it ---
  detailsSidebar.addEventListener('click', (e) => {
    if (e.target === detailsSidebar) {
      detailsSidebar.classList.remove('open');
    }
  });

  window.addEventListener('resize', () => {
    setTimeout(() => map.invalidateSize(), 200);
  });
  
  setTimeout(() => map.invalidateSize(), 500);
});




  // Subfilter buttons for Tales & Epics
  (function(){
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

          // Open Harivamsa flashcards when that subfilter is selected; otherwise hide flashcards
          if (String(activeEpic).toLowerCase() === 'harivamsa') {
            openHarivamsaFlashcards();
          } else {
            closeFlashcardsView();
          }
        });
      });
    }
  })();