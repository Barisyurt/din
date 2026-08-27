export type PostureType =
  | "niyet"
  | "kiyam"
  | "ruku"
  | "dogrulma"
  | "secde"
  | "oturus"
  | "selam";

export interface PrayerStep {
  id: string;
  rakat: number;
  title: string;
  posture: PostureType;
  postureName: string;
  guidanceText: string;
  arabicText?: string;
  transliteration?: string;
  meaning?: string;
  audioText: string;
  durationSeconds?: number;
}

export interface PrayerDefinition {
  id: string;
  name: string;
  category: "sabah" | "ogle" | "ikindi" | "aksam" | "yatsı" | "vitir";
  categoryName: string;
  type: "sunnet" | "farz" | "son_sunnet" | "vitir";
  typeName: string;
  rakatCount: number;
  description: string;
  steps: PrayerStep[];
}

// ─── Ortak Dua & Sure Metinleri ─────────────────────────────────────────────
const TEXTS = {
  niyet: (namazAdi: string) => `Niyet ettim Allah rızası için bugünkü ${namazAdi} kılmaya.`,
  tekbir: "Allâhu Ekber (اللهُ أَكْبَرُ)",
  subhaneke: {
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلاَ إِلَهَ غَيْرُكَ",
    transliteration: "Sübhaneke allâhumme ve bihamdik ve tebârakesmuk ve te'âlâ ceddük ve lâ ilâhe ğayruk.",
    meaning: "Allah'ım! Seni her türlü noksanlıktan tenzih eder, hamd ile tesbih ederim. İsmin mübarektir, şanın yücedir ve Senden başka ilah yoktur.",
    audio: "Sübhaneke Allâhumme ve bihamdik ve tebârakesmuk ve te'âlâ ceddük ve lâ ilâhe ğayruk."
  },
  fatiha: {
    arabic: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۞ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۞ الرَّحْمَنِ الرَّحِيمِ ۞ مَالِكِ يَوْمِ الدِّينِ ۞ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۞ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۞ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلاَ الضَّالِّينَ",
    transliteration: "Eûzü billâhi mineş-şeytânir-racîm. Bismillâhir-rahmânir-rahîm. Elhamdü lillâhi rabbil-'âlemîn. Er-rahmânir-rahîm. Mâliki yevmid-dîn. İyyâke na'büdü ve iyyâke neste'în. İhdinâs-sırâtal-müstekîm. Sırâtallezîne en'amte 'aleyhim ğayril-mağdûbi 'aleyhim ve lad-dâllîn. Âmîn.",
    meaning: "Kovulmuş şeytandan Allah'a sığınırım. Rahman ve Rahim olan Allah'ın adıyla. Hamd, âlemlerin Rabbi olan Allah'a mahsustur. O Rahman'dır, Rahim'dir. Din gününün sahibidir. Yalnız Sana kulluk eder, yalnız Senden yardım dileriz. Bizi doğru yola ilet.",
    audio: "Eûzü billâhi mineş-şeytânir-racîm. Bismillâhir-rahmânir-rahîm. Elhamdü lillâhi rabbil-'âlemîn. Er-rahmânir-rahîm. Mâliki yevmid-dîn. İyyâke na'büdü ve iyyâke neste'în. İhdinâs-sırâtal-müstekîm. Sırâtallezîne en'amte 'aleyhim ğayril-mağdûbi 'aleyhim ve lad-dâllîn. Amîn."
  },
  ihlas: {
    arabic: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۞ قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration: "Bismillâhir-rahmânir-rahîm. Kul hüvallâhu ehad. Allâhüs-samed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad.",
    meaning: "Rahman ve Rahim olan Allah'ın adıyla. De ki: O Allah tektir. Allah Samed'dir (her şey O'na muhtaçtır). Doğurmamış ve doğmamıştır. Hiçbir şey O'nun dengi değildir.",
    audio: "Bismillâhir-rahmânir-rahîm. Kul hüvallâhu ehad. Allâhüs-samed. Lem yelid ve lem yûled. Ve lem yekün lehû küfüven ehad."
  },
  felak: {
    arabic: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۞ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    transliteration: "Bismillâhir-rahmânir-rahîm. Kul e'ûzü birabbil-felak. Min şerri mâ halak. Ve min şerri ğâsikın izâ vekab. Ve min şerrin-neffâsâti fil-'ukad. Ve min şerri hâsidin izâ hased.",
    meaning: "De ki: Yarattığı şeylerin şerrinden, karanlığı çöktüğü zaman gecenin şerrinden, düğümlere üfleyenlerin şerrinden ve haset ettiği zaman hasetçinin şerrinden sabahın Rabbine sığınırım.",
    audio: "Bismillâhir-rahmânir-rahîm. Kul e'ûzü birabbil-felak. Min şerri mâ halak. Ve min şerri ğâsikın izâ vekab. Ve min şerrin-neffâsâti fil-'ukad. Ve min şerri hâsidin izâ hased."
  },
  nas: {
    arabic: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۞ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَٰهِ النَّاسِ ۞ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ",
    transliteration: "Bismillâhir-rahmânir-rahîm. Kul e'ûzü birabbin-nâs. Melikin-nâs. İlâhin-nâs. Min şerril-vesvâsil-hannâs. Ellezî yüvesvisü fî sudûrin-nâs. Minel-cinneti ven-nâs.",
    meaning: "De ki: İnsanların kalplerine vesvese sokan o sinsi vesvesecinin şerrinden insanların Rabbine, insanların Hükümdarına, insanların İlahına sığınırım.",
    audio: "Bismillâhir-rahmânir-rahîm. Kul e'ûzü birabbin-nâs. Melikin-nâs. İlâhin-nâs. Min şerril-vesvâsil-hannâs. Ellezî yüvesvisü fî sudûrin-nâs. Minel-cinneti ven-nâs."
  },
  rukuText: {
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ (3 Defa)",
    transliteration: "Allâhu Ekber. Sübhâne rabbiyel-'azîm. Sübhâne rabbiyel-'azîm. Sübhâne rabbiyel-'azîm.",
    meaning: "Yüce olan Rabbim her türlü noksandan münezzehtir.",
    audio: "Allâhu Ekber. Sübhâne rabbiyel-azîm. Sübhâne rabbiyel-azîm. Sübhâne rabbiyel-azîm."
  },
  kavmeText: {
    arabic: "سَمِعَ اللهُ لِمَنْ حَمِدَهُ ۞ رَبَّنَا لَكَ الْحَمْدُ",
    transliteration: "Semi'allâhu limen hamideh. Rabbena lekel-hamd.",
    meaning: "Allah, kendisine hamd edeni işitti. Rabbimiz! Hamd yalnızca Sanadır.",
    audio: "Semi'allâhu limen hamideh. Rabbena lekel-hamd."
  },
  secdeText: {
    arabic: "سُبْحَانَ رَبِّيَ الأَعْلَى (3 Defa)",
    transliteration: "Allâhu Ekber. Sübhâne rabbiyel-a'lâ. Sübhâne rabbiyel-a'lâ. Sübhâne rabbiyel-a'lâ.",
    meaning: "En yüce olan Rabbim her türlü noksandan münezzehtir.",
    audio: "Allâhu Ekber. Sübhâne rabbiyel-a'lâ. Sübhâne rabbiyel-a'lâ. Sübhâne rabbiyel-a'lâ."
  },
  tahiyyat: {
    arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ ۞ السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ ۞ السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللهِ الصَّالِحِينَ ۞ أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration: "Et-tahıyyâtü lillâhi ves-salevâtü vet-tayyibât. Es-selâmü 'aleyke eyyühen-nebiyyü ve rahmetullâhi ve berakâtüh. Es-selâmü 'aleynâ ve 'alâ 'ibâdillâhis-sâlihîn. Eşhedü el lâ ilâhe illallâh ve eşhedü enne Muhammeden 'abdühû ve rasûlüh.",
    meaning: "Her türlü hürmet, dua ve güzel şeyler Allah'adır. Ey Peygamber! Allah'ın selamı, rahmeti ve bereketi senin üzerine olsun. Selam bizim ve Allah'ın salih kullarının üzerine olsun. Şahitlik ederim ki Allah'tan başka ilah yoktur ve yine şahitlik ederim ki Muhammed O'nun kulu ve elçisidir.",
    audio: "Et-tahıyyâtü lillâhi ves-salevâtü vet-tayyibât. Es-selâmü aleyke eyyühen-nebiyyü ve rahmetullâhi ve berakâtüh. Es-selâmü aleynâ ve alâ ibâdillâhis-sâlihîn. Eşhedü el lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh."
  },
  salliBarik: {
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ ۞ اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allâhumme salli 'alâ Muhammedin ve 'alâ âli Muhammedin kemâ salleyte 'alâ İbrâhîme ve 'alâ âli İbrâhîm inneke hamîdün mecîd. Allâhumme bârik 'alâ Muhammedin ve 'alâ âli Muhammedin kemâ bârakte 'alâ İbrâhîme ve 'alâ âli İbrâhîm inneke hamîdün mecîd.",
    meaning: "Allah'ım! İbrahim'e ve ailesine merhamet ettiğin gibi Muhammed'e ve ailesine de merhamet eyle. Şüphesiz sen övülmeye layıksın. Allah'ım! İbrahim'i ve ailesini mübarek kıldığın gibi Muhammed'i ve ailesini de mübarek kıl.",
    audio: "Allâhumme salli alâ Muhammedin ve alâ âli Muhammedin kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm inneke hamîdün mecîd. Allâhumme bârik alâ Muhammedin ve alâ âli Muhammedin kemâ bârakte alâ İbrâhîme ve alâ âli İbrâhîm inneke hamîdün mecîd."
  },
  rabbena: {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ ۞ رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    transliteration: "Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhireti haseneten ve kınâ 'azâben-nâr. Rabbenâğfirlî ve li-vâlideyye ve lil-mü'minîne yevme yekûmül-hisâb.",
    meaning: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver ve bizi cehennem azabından koru. Rabbimiz! Hesap kurulacağı gün beni, anne-babamı ve tüm müminleri bağışla.",
    audio: "Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhireti haseneten ve kınâ azâben-nâr. Rabbenâğfirlî ve li-vâlideyye ve lil-mü'minîne yevme yekûmül-hisâb."
  },
  kunut: {
    arabic: "اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْدِيكَ... اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ...",
    transliteration: "Allâhumme innâ neste'înüke ve nesteğfiruke ve nestehdîk... Allâhumme iyyâke na'büdü ve leke nusal-lî ve nescüdü...",
    meaning: "Allah'ım! Senden yardım dileriz, Senden bağışlanma dileriz...",
    audio: "Allâhumme innâ neste'înüke ve nesteğfiruke ve nestehdîk ve nü'minü bike ve netûbü ileyk ve netevekkelü 'aleyke ve nüsnî 'aleykel-hayra küllehû neşkuruke ve lâ nekfuruk ve nahle'u ve netruku mey yefcuruk. Allâhumme iyyâke na'büdü ve leke nusallî ve nescüdü ve ileyke nes'â ve nahfidü nercû rahmeteke ve nahşâ 'azâbeke inne 'azâbeke bil-küffâri mulhık."
  },
  selamText: {
    arabic: "السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ",
    transliteration: "Sağa çevirip: Esselâmü aleyküm ve rahmetullâh.\nSola çevirip: Esselâmü aleyküm ve rahmetullâh.",
    meaning: "Allah'ın selamı ve rahmeti üzerinize olsun.",
    audio: "Sağa selam verin: Esselâmü aleyküm ve rahmetullâh. Sola selam verin: Esselâmü aleyküm ve rahmetullâh."
  }
};

// ─── 2 Rekat Sünnet / Farz Şablon Oluşturucu ──────────────────────────────
function createTwoRakatPrayer(
  id: string,
  name: string,
  category: PrayerDefinition["category"],
  categoryName: string,
  type: PrayerDefinition["type"],
  typeName: string,
  niyetMetni: string
): PrayerDefinition {
  return {
    id,
    name,
    category,
    categoryName,
    type,
    typeName,
    rakatCount: 2,
    description: `${name} (${typeName}), toplam 2 rekat olarak kılınır. Adım adım sesli yönlendirme ile kolayca takip edebilirsiniz.`,
    steps: [
      {
        id: `${id}-1-niyet`,
        rakat: 1,
        title: "1. Rekat - Niyet ve İftitah Tekbiri",
        posture: "niyet",
        postureName: "Niyet & Tekbir",
        guidanceText: `${niyetMetni} Ardından ellerinizi kulak hizasına kaldırıp 'Allâhu Ekber' diyerek tekbir getirin ve göğüs/göbek üzerinde bağlayın.`,
        arabicText: TEXTS.tekbir,
        transliteration: "Allâhu Ekber",
        audioText: `${niyetMetni} Allâhu Ekber.`,
        durationSeconds: 5
      },
      {
        id: `${id}-1-kiyam`,
        rakat: 1,
        title: "1. Rekat - Sübhaneke, Fatiha & İhlas Suresi",
        posture: "kiyam",
        postureName: "Kıyam (Ayakta Okuma)",
        guidanceText: "Eller bağlı şekilde ayakta durun. Sırasıyla Sübhaneke duası, Eûzü Besmele, Fatiha Suresi ve İhlas Suresi okuyun.",
        arabicText: `${TEXTS.subhaneke.arabic}\n\n${TEXTS.fatiha.arabic}\n\n${TEXTS.ihlas.arabic}`,
        transliteration: `${TEXTS.subhaneke.transliteration}\n\n${TEXTS.fatiha.transliteration}\n\n${TEXTS.ihlas.transliteration}`,
        meaning: TEXTS.fatiha.meaning,
        audioText: `${TEXTS.subhaneke.audio} ${TEXTS.fatiha.audio} ${TEXTS.ihlas.audio}`,
        durationSeconds: 22
      },
      {
        id: `${id}-1-ruku`,
        rakat: 1,
        title: "1. Rekat - Rükû",
        posture: "ruku",
        postureName: "Rükû (Eğilme)",
        guidanceText: "'Allâhu Ekber' diyerek rükûya eğilin. Belinizi düz tutarak 3 defa 'Sübhâne rabbiyel-azîm' deyin.",
        arabicText: TEXTS.rukuText.arabic,
        transliteration: TEXTS.rukuText.transliteration,
        meaning: TEXTS.rukuText.meaning,
        audioText: TEXTS.rukuText.audio,
        durationSeconds: 8
      },
      {
        id: `${id}-1-kavme`,
        rakat: 1,
        title: "1. Rekat - Doğrulma (Kavme)",
        posture: "dogrulma",
        postureName: "Rükûdan Doğrulma",
        guidanceText: "'Semi'allâhu limen hamideh' diyerek dik konuma gelin ve 'Rabbena lekel-hamd' deyin.",
        arabicText: TEXTS.kavmeText.arabic,
        transliteration: TEXTS.kavmeText.transliteration,
        meaning: TEXTS.kavmeText.meaning,
        audioText: TEXTS.kavmeText.audio,
        durationSeconds: 4
      },
      {
        id: `${id}-1-secde1`,
        rakat: 1,
        title: "1. Rekat - 1. Secde",
        posture: "secde",
        postureName: "1. Secde",
        guidanceText: "'Allâhu Ekber' diyerek secdeye varın. Alın, burun ve eller yerde olacak şekilde 3 defa 'Sübhâne rabbiyel-a'lâ' deyin.",
        arabicText: TEXTS.secdeText.arabic,
        transliteration: TEXTS.secdeText.transliteration,
        meaning: TEXTS.secdeText.meaning,
        audioText: TEXTS.secdeText.audio,
        durationSeconds: 8
      },
      {
        id: `${id}-1-oturus-ara`,
        rakat: 1,
        title: "1. Rekat - Ara Oturuş",
        posture: "oturus",
        postureName: "Secdeler Arası Oturuş",
        guidanceText: "'Allâhu Ekber' diyerek secdeden doğrulup dizlerinizin üzerine kısa süre oturun.",
        arabicText: "اللهُ أَكْبَرُ",
        transliteration: "Allâhu Ekber.",
        audioText: "Allâhu Ekber.",
        durationSeconds: 3
      },
      {
        id: `${id}-1-secde2`,
        rakat: 1,
        title: "1. Rekat - 2. Secde",
        posture: "secde",
        postureName: "2. Secde",
        guidanceText: "'Allâhu Ekber' diyerek tekrar secdeye varın ve 3 defa 'Sübhâne rabbiyel-a'lâ' deyin.",
        arabicText: TEXTS.secdeText.arabic,
        transliteration: TEXTS.secdeText.transliteration,
        meaning: TEXTS.secdeText.meaning,
        audioText: TEXTS.secdeText.audio,
        durationSeconds: 8
      },
      // 2. Rekat
      {
        id: `${id}-2-kiyam`,
        rakat: 2,
        title: "2. Rekat - Fatiha & Felak Suresi",
        posture: "kiyam",
        postureName: "2. Rekat Kıyam",
        guidanceText: "'Allâhu Ekber' diyerek ikinci rekat için ayağa kalkın. Besmele çekip Fatiha Suresi ve ardından Felak Suresi okuyun.",
        arabicText: `${TEXTS.fatiha.arabic}\n\n${TEXTS.felak.arabic}`,
        transliteration: `${TEXTS.fatiha.transliteration}\n\n${TEXTS.felak.transliteration}`,
        meaning: TEXTS.felak.meaning,
        audioText: `Allâhu Ekber. ${TEXTS.fatiha.audio} ${TEXTS.felak.audio}`,
        durationSeconds: 20
      },
      {
        id: `${id}-2-ruku`,
        rakat: 2,
        title: "2. Rekat - Rükû",
        posture: "ruku",
        postureName: "Rükû",
        guidanceText: "'Allâhu Ekber' diyerek rükûya eğilin. 3 defa 'Sübhâne rabbiyel-azîm' deyin.",
        arabicText: TEXTS.rukuText.arabic,
        transliteration: TEXTS.rukuText.transliteration,
        audioText: TEXTS.rukuText.audio,
        durationSeconds: 8
      },
      {
        id: `${id}-2-kavme`,
        rakat: 2,
        title: "2. Rekat - Doğrulma",
        posture: "dogrulma",
        postureName: "Rükûdan Doğrulma",
        guidanceText: "'Semi'allâhu limen hamideh' diyerek doğrulun, 'Rabbena lekel-hamd' deyin.",
        arabicText: TEXTS.kavmeText.arabic,
        transliteration: TEXTS.kavmeText.transliteration,
        audioText: TEXTS.kavmeText.audio,
        durationSeconds: 4
      },
      {
        id: `${id}-2-secde1`,
        rakat: 2,
        title: "2. Rekat - 1. Secde",
        posture: "secde",
        postureName: "1. Secde",
        guidanceText: "'Allâhu Ekber' diyerek secdeye varın. 3 defa 'Sübhâne rabbiyel-a'lâ' deyin.",
        arabicText: TEXTS.secdeText.arabic,
        transliteration: TEXTS.secdeText.transliteration,
        audioText: TEXTS.secdeText.audio,
        durationSeconds: 8
      },
      {
        id: `${id}-2-oturus-ara`,
        rakat: 2,
        title: "2. Rekat - Ara Oturuş",
        posture: "oturus",
        postureName: "Secdeler Arası Oturuş",
        guidanceText: "'Allâhu Ekber' deyip diz üzerinde oturun.",
        arabicText: "اللهُ أَكْبَرُ",
        transliteration: "Allâhu Ekber.",
        audioText: "Allâhu Ekber.",
        durationSeconds: 3
      },
      {
        id: `${id}-2-secde2`,
        rakat: 2,
        title: "2. Rekat - 2. Secde",
        posture: "secde",
        postureName: "2. Secde",
        guidanceText: "'Allâhu Ekber' diyerek ikinci secdeyi yapın ve 3 defa 'Sübhâne rabbiyel-a'lâ' deyin.",
        arabicText: TEXTS.secdeText.arabic,
        transliteration: TEXTS.secdeText.transliteration,
        audioText: TEXTS.secdeText.audio,
        durationSeconds: 8
      },
      {
        id: `${id}-2-oturus-son`,
        rakat: 2,
        title: "2. Rekat - Son Oturuş (Dualar)",
        posture: "oturus",
        postureName: "Son Oturuş (Kade-i Âhire)",
        guidanceText: "'Allâhu Ekber' deyip oturun. Ettahıyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ dualarını okuyun.",
        arabicText: `${TEXTS.tahiyyat.arabic}\n\n${TEXTS.salliBarik.arabic}\n\n${TEXTS.rabbena.arabic}`,
        transliteration: `${TEXTS.tahiyyat.transliteration}\n\n${TEXTS.salliBarik.transliteration}\n\n${TEXTS.rabbena.transliteration}`,
        meaning: TEXTS.tahiyyat.meaning,
        audioText: `${TEXTS.tahiyyat.audio} ${TEXTS.salliBarik.audio} ${TEXTS.rabbena.audio}`,
        durationSeconds: 30
      },
      {
        id: `${id}-selam`,
        rakat: 2,
        title: "Selam Verme ve Tamamlama",
        posture: "selam",
        postureName: "Selam",
        guidanceText: "Başınızı önce sağ omzunuza çevirip 'Esselâmü aleyküm ve rahmetullâh' deyin. Sonra sol omzunuza çevirip aynı selamı verin.",
        arabicText: TEXTS.selamText.arabic,
        transliteration: TEXTS.selamText.transliteration,
        meaning: TEXTS.selamText.meaning,
        audioText: `${TEXTS.selamText.audio} Tebrikler, namazınızı tamamladınız. Allah kabul eylesin.`,
        durationSeconds: 6
      }
    ]
  };
}

// ─── 4 Rekat Sünnet / Farz Şablon Oluşturucu ──────────────────────────────
function createFourRakatPrayer(
  id: string,
  name: string,
  category: PrayerDefinition["category"],
  categoryName: string,
  type: PrayerDefinition["type"],
  typeName: string,
  niyetMetni: string,
  isFarz: boolean = false
): PrayerDefinition {
  const baseTwo = createTwoRakatPrayer(id, name, category, categoryName, type, typeName, niyetMetni);
  
  const stepsWithoutSelam = baseTwo.steps.slice(0, -1);
  
  stepsWithoutSelam[stepsWithoutSelam.length - 1] = {
    id: `${id}-2-oturus-ilk`,
    rakat: 2,
    title: "2. Rekat - İlk Oturuş (Tahiyyat)",
    posture: "oturus",
    postureName: "İlk Oturuş (Kade-i Ûlâ)",
    guidanceText: "'Allâhu Ekber' deyip dizlerinizin üzerinde oturun. Sadece Ettahıyyâtü duasını okuyun ve ardından 3. rekat için ayağa kalkın.",
    arabicText: TEXTS.tahiyyat.arabic,
    transliteration: TEXTS.tahiyyat.transliteration,
    meaning: TEXTS.tahiyyat.meaning,
    audioText: `${TEXTS.tahiyyat.audio}`,
    durationSeconds: 15
  };

  const thirdAndFourthSteps: PrayerStep[] = [
    {
      id: `${id}-3-kiyam`,
      rakat: 3,
      title: isFarz ? "3. Rekat - Fatiha Suresi" : "3. Rekat - Fatiha & Nas Suresi",
      posture: "kiyam",
      postureName: "3. Rekat Kıyam",
      guidanceText: isFarz 
        ? "'Allâhu Ekber' diyerek 3. rekat için ayağa kalkın. Besmele çekip sadece Fatiha Suresi okuyun."
        : "'Allâhu Ekber' diyerek 3. rekat için ayağa kalkın. Besmele çekip Fatiha Suresi ve ardından Nas Suresi okuyun.",
      arabicText: isFarz ? TEXTS.fatiha.arabic : `${TEXTS.fatiha.arabic}\n\n${TEXTS.nas.arabic}`,
      transliteration: isFarz ? TEXTS.fatiha.transliteration : `${TEXTS.fatiha.transliteration}\n\n${TEXTS.nas.transliteration}`,
      audioText: isFarz ? `Allâhu Ekber. ${TEXTS.fatiha.audio}` : `Allâhu Ekber. ${TEXTS.fatiha.audio} ${TEXTS.nas.audio}`,
      durationSeconds: isFarz ? 12 : 20
    },
    {
      id: `${id}-3-ruku`,
      rakat: 3,
      title: "3. Rekat - Rükû",
      posture: "ruku",
      postureName: "Rükû",
      guidanceText: "'Allâhu Ekber' diyerek rükûya eğilin. 3 defa 'Sübhâne rabbiyel-azîm' deyin.",
      arabicText: TEXTS.rukuText.arabic,
      transliteration: TEXTS.rukuText.transliteration,
      audioText: TEXTS.rukuText.audio,
      durationSeconds: 8
    },
    {
      id: `${id}-3-kavme`,
      rakat: 3,
      title: "3. Rekat - Doğrulma",
      posture: "dogrulma",
      postureName: "Rükûdan Doğrulma",
      guidanceText: "'Semi'allâhu limen hamideh' diyerek doğrulun, 'Rabbena lekel-hamd' deyin.",
      arabicText: TEXTS.kavmeText.arabic,
      transliteration: TEXTS.kavmeText.transliteration,
      audioText: TEXTS.kavmeText.audio,
      durationSeconds: 4
    },
    {
      id: `${id}-3-secde1`,
      rakat: 3,
      title: "3. Rekat - Secdeler",
      posture: "secde",
      postureName: "Secdeler",
      guidanceText: "'Allâhu Ekber' deyip 1. secdeyi yapın, doğrulup kısa oturun ve 2. secdeyi tamamlayın.",
      arabicText: TEXTS.secdeText.arabic,
      transliteration: TEXTS.secdeText.transliteration,
      audioText: `Allâhu Ekber. ${TEXTS.secdeText.audio} Allâhu Ekber. Allâhu Ekber. ${TEXTS.secdeText.audio}`,
      durationSeconds: 15
    },

    {
      id: `${id}-4-kiyam`,
      rakat: 4,
      title: isFarz ? "4. Rekat - Fatiha Suresi" : "4. Rekat - Fatiha & İhlas Suresi",
      posture: "kiyam",
      postureName: "4. Rekat Kıyam",
      guidanceText: isFarz
        ? "'Allâhu Ekber' diyerek 4. rekat için ayağa kalkın. Besmele çekip sadece Fatiha Suresi okuyun."
        : "'Allâhu Ekber' diyerek 4. rekat için ayağa kalkın. Besmele çekip Fatiha Suresi ve ardından İhlas Suresi okuyun.",
      arabicText: isFarz ? TEXTS.fatiha.arabic : `${TEXTS.fatiha.arabic}\n\n${TEXTS.ihlas.arabic}`,
      transliteration: isFarz ? TEXTS.fatiha.transliteration : `${TEXTS.fatiha.transliteration}\n\n${TEXTS.ihlas.transliteration}`,
      audioText: isFarz ? `Allâhu Ekber. ${TEXTS.fatiha.audio}` : `Allâhu Ekber. ${TEXTS.fatiha.audio} ${TEXTS.ihlas.audio}`,
      durationSeconds: isFarz ? 12 : 20
    },
    {
      id: `${id}-4-ruku`,
      rakat: 4,
      title: "4. Rekat - Rükû",
      posture: "ruku",
      postureName: "Rükû",
      guidanceText: "'Allâhu Ekber' diyerek rükûya eğilin. 3 defa 'Sübhâne rabbiyel-azîm' deyin.",
      arabicText: TEXTS.rukuText.arabic,
      transliteration: TEXTS.rukuText.transliteration,
      audioText: TEXTS.rukuText.audio,
      durationSeconds: 8
    },
    {
      id: `${id}-4-kavme`,
      rakat: 4,
      title: "4. Rekat - Doğrulma",
      posture: "dogrulma",
      postureName: "Rükûdan Doğrulma",
      guidanceText: "'Semi'allâhu limen hamideh' diyerek doğrulun, 'Rabbena lekel-hamd' deyin.",
      arabicText: TEXTS.kavmeText.arabic,
      transliteration: TEXTS.kavmeText.transliteration,
      audioText: TEXTS.kavmeText.audio,
      durationSeconds: 4
    },
    {
      id: `${id}-4-secde1`,
      rakat: 4,
      title: "4. Rekat - Secdeler",
      posture: "secde",
      postureName: "Secdeler",
      guidanceText: "'Allâhu Ekber' diyerek iki secdeyi de sırasıyla yapın.",
      arabicText: TEXTS.secdeText.arabic,
      transliteration: TEXTS.secdeText.transliteration,
      audioText: `Allâhu Ekber. ${TEXTS.secdeText.audio} Allâhu Ekber. Allâhu Ekber. ${TEXTS.secdeText.audio}`,
      durationSeconds: 15
    },
    {
      id: `${id}-4-oturus-son`,
      rakat: 4,
      title: "4. Rekat - Son Oturuş (Dualar)",
      posture: "oturus",
      postureName: "Son Oturuş (Kade-i Âhire)",
      guidanceText: "'Allâhu Ekber' deyip son oturuşa geçin. Ettahıyyâtü, Allahümme Salli, Allahümme Bârik ve Rabbenâ dualarını okuyun.",
      arabicText: `${TEXTS.tahiyyat.arabic}\n\n${TEXTS.salliBarik.arabic}\n\n${TEXTS.rabbena.arabic}`,
      transliteration: `${TEXTS.tahiyyat.transliteration}\n\n${TEXTS.salliBarik.transliteration}\n\n${TEXTS.rabbena.transliteration}`,
      meaning: TEXTS.tahiyyat.meaning,
      audioText: `${TEXTS.tahiyyat.audio} ${TEXTS.salliBarik.audio} ${TEXTS.rabbena.audio}`,
      durationSeconds: 30
    },
    {
      id: `${id}-selam`,
      rakat: 4,
      title: "Selam Verme ve Tamamlama",
      posture: "selam",
      postureName: "Selam",
      guidanceText: "Başınızı sağa ve sola çevirerek 'Esselâmü aleyküm ve rahmetullâh' diyerek namazınızı bitirin.",
      arabicText: TEXTS.selamText.arabic,
      transliteration: TEXTS.selamText.transliteration,
      audioText: `${TEXTS.selamText.audio} Tebrikler, 4 rekatlık namazınızı tamamladınız. Allah kabul eylesin.`,
      durationSeconds: 6
    }
  ];

  return {
    ...baseTwo,
    rakatCount: 4,
    description: `${name} (${typeName}), toplam 4 rekat kılınır.`,
    steps: [...stepsWithoutSelam, ...thirdAndFourthSteps]
  };
}

// ─── Akşam Namazı Farzı (3 Rekat) ──────────────────────────────────────────
function createAkshamFarz(): PrayerDefinition {
  const baseTwo = createTwoRakatPrayer(
    "aksam-farz",
    "Akşam Namazı Farzı",
    "aksam",
    "Akşam",
    "farz",
    "Farz",
    "Niyet ettim Allah rızası için bugünkü akşam namazının 3 rekat farzını kılmaya."
  );

  const stepsWithoutSelam = baseTwo.steps.slice(0, -1);
  stepsWithoutSelam[stepsWithoutSelam.length - 1] = {
    id: "aksam-farz-2-oturus-ilk",
    rakat: 2,
    title: "2. Rekat - İlk Oturuş (Tahiyyat)",
    posture: "oturus",
    postureName: "İlk Oturuş",
    guidanceText: "'Allâhu Ekber' deyip oturun. Sadece Ettahıyyâtü duasını okuyun.",
    arabicText: TEXTS.tahiyyat.arabic,
    transliteration: TEXTS.tahiyyat.transliteration,
    audioText: TEXTS.tahiyyat.audio,
    durationSeconds: 15
  };

  const thirdRakatSteps: PrayerStep[] = [
    {
      id: "aksam-farz-3-kiyam",
      rakat: 3,
      title: "3. Rekat - Fatiha Suresi",
      posture: "kiyam",
      postureName: "3. Rekat Kıyam",
      guidanceText: "'Allâhu Ekber' diyerek 3. rekat için ayağa kalkın. Besmele çekip sadece Fatiha Suresi okuyun (zammi sure eklenmez).",
      arabicText: TEXTS.fatiha.arabic,
      transliteration: TEXTS.fatiha.transliteration,
      audioText: `Allâhu Ekber. ${TEXTS.fatiha.audio}`,
      durationSeconds: 12
    },
    {
      id: "aksam-farz-3-ruku",
      rakat: 3,
      title: "3. Rekat - Rükû",
      posture: "ruku",
      postureName: "Rükû",
      guidanceText: "'Allâhu Ekber' deyip rükûya eğilin. 3 defa 'Sübhâne rabbiyel-azîm' deyin.",
      arabicText: TEXTS.rukuText.arabic,
      transliteration: TEXTS.rukuText.transliteration,
      audioText: TEXTS.rukuText.audio,
      durationSeconds: 8
    },
    {
      id: "aksam-farz-3-kavme",
      rakat: 3,
      title: "3. Rekat - Doğrulma",
      posture: "dogrulma",
      postureName: "Doğrulma",
      guidanceText: "'Semi'allâhu limen hamideh' diyerek doğrulun, 'Rabbena lekel-hamd' deyin.",
      arabicText: TEXTS.kavmeText.arabic,
      transliteration: TEXTS.kavmeText.transliteration,
      audioText: TEXTS.kavmeText.audio,
      durationSeconds: 4
    },
    {
      id: "aksam-farz-3-secde",
      rakat: 3,
      title: "3. Rekat - Secdeler",
      posture: "secde",
      postureName: "Secdeler",
      guidanceText: "'Allâhu Ekber' deyip secdeleri sırasıyla yapın.",
      arabicText: TEXTS.secdeText.arabic,
      transliteration: TEXTS.secdeText.transliteration,
      audioText: `Allâhu Ekber. ${TEXTS.secdeText.audio} Allâhu Ekber. Allâhu Ekber. ${TEXTS.secdeText.audio}`,
      durationSeconds: 15
    },
    {
      id: "aksam-farz-3-oturus-son",
      rakat: 3,
      title: "3. Rekat - Son Oturuş (Dualar)",
      posture: "oturus",
      postureName: "Son Oturuş (Kade-i Âhire)",
      guidanceText: "'Allâhu Ekber' deyip son oturuşa geçin. Tahiyyat, Salli-Barik ve Rabbena dualarını okuyun.",
      arabicText: `${TEXTS.tahiyyat.arabic}\n\n${TEXTS.salliBarik.arabic}\n\n${TEXTS.rabbena.arabic}`,
      transliteration: `${TEXTS.tahiyyat.transliteration}\n\n${TEXTS.salliBarik.transliteration}\n\n${TEXTS.rabbena.transliteration}`,
      audioText: `${TEXTS.tahiyyat.audio} ${TEXTS.salliBarik.audio} ${TEXTS.rabbena.audio}`,
      durationSeconds: 30
    },
    {
      id: "aksam-farz-selam",
      rakat: 3,
      title: "Selam Verme",
      posture: "selam",
      postureName: "Selam",
      guidanceText: "Sağa ve sola selam vererek namazı tamamlayın.",
      arabicText: TEXTS.selamText.arabic,
      transliteration: TEXTS.selamText.transliteration,
      audioText: `${TEXTS.selamText.audio} Akşam namazı farzı tamamlandı. Allah kabul eylesin.`,
      durationSeconds: 6
    }
  ];

  return {
    ...baseTwo,
    rakatCount: 3,
    description: "Akşam Namazı Farzı 3 rekat olarak kılınır.",
    steps: [...stepsWithoutSelam, ...thirdRakatSteps]
  };
}

// ─── Vitir Namazı (3 Rekat) ────────────────────────────────────────────────
function createVitirPrayer(): PrayerDefinition {
  const baseAksam = createAkshamFarz();
  const steps = [...baseAksam.steps];

  steps[steps.length - 3] = {
    id: "vitir-3-kiyam",
    rakat: 3,
    title: "3. Rekat - Fatiha, Zammı Sure & Kunut Tekbiri",
    posture: "kiyam",
    postureName: "3. Rekat Kıyam & Kunut",
    guidanceText: "'Allâhu Ekber' deyip kalkın. Fatiha ve İhlas okuduktan sonra elleri kaldırıp 'Allâhu Ekber' diyerek Kunut dualarını okuyun.",
    arabicText: `${TEXTS.fatiha.arabic}\n\n${TEXTS.ihlas.arabic}\n\n${TEXTS.kunut.arabic}`,
    transliteration: `${TEXTS.fatiha.transliteration}\n\n${TEXTS.ihlas.transliteration}\n\n${TEXTS.kunut.transliteration}`,
    meaning: TEXTS.kunut.meaning,
    audioText: `Allâhu Ekber. ${TEXTS.fatiha.audio} ${TEXTS.ihlas.audio} Allâhu Ekber. ${TEXTS.kunut.audio}`,
    durationSeconds: 30
  };

  return {
    id: "vitir-vacip",
    name: "Vitir Namazı",
    category: "vitir",
    categoryName: "Vitir",
    type: "vitir",
    typeName: "Vacip",
    rakatCount: 3,
    description: "Yatsı namazından sonra kılınan 3 rekatlık vacip namazdır. 3. rekatta Kunut duası okunur.",
    steps
  };
}

// ─── Tüm Namaz Tanımları ───────────────────────────────────────────────────
export const PRAYER_LIST: PrayerDefinition[] = [
  // SABAH
  createTwoRakatPrayer(
    "sabah-sunnet",
    "Sabah Namazı Sünneti",
    "sabah",
    "Sabah",
    "sunnet",
    "Sünnet",
    "Niyet ettim Allah rızası için bugünkü sabah namazının iki rekat sünnetini kılmaya."
  ),
  createTwoRakatPrayer(
    "sabah-farz",
    "Sabah Namazı Farzı",
    "sabah",
    "Sabah",
    "farz",
    "Farz",
    "Niyet ettim Allah rızası için bugünkü sabah namazının iki rekat farzını kılmaya."
  ),

  // ÖĞLE
  createFourRakatPrayer(
    "ogle-sunnet",
    "Öğle Namazı İlk Sünneti",
    "ogle",
    "Öğle",
    "sunnet",
    "İlk Sünnet",
    "Niyet ettim Allah rızası için bugünkü öğle namazının ilk sünnetini kılmaya.",
    false
  ),
  createFourRakatPrayer(
    "ogle-farz",
    "Öğle Namazı Farzı",
    "ogle",
    "Öğle",
    "farz",
    "Farz",
    "Niyet ettim Allah rızası için bugünkü öğle namazının 4 rekat farzını kılmaya.",
    true
  ),
  createTwoRakatPrayer(
    "ogle-son-sunnet",
    "Öğle Namazı Son Sünneti",
    "ogle",
    "Öğle",
    "son_sunnet",
    "Son Sünnet",
    "Niyet ettim Allah rızası için bugünkü öğle namazının son sünnetini kılmaya."
  ),

  // İKİNDİ
  createFourRakatPrayer(
    "ikindi-sunnet",
    "İkindi Namazı Sünneti",
    "ikindi",
    "İkindi",
    "sunnet",
    "Sünnet",
    "Niyet ettim Allah rızası için bugünkü ikindi namazının sünnetini kılmaya.",
    false
  ),
  createFourRakatPrayer(
    "ikindi-farz",
    "İkindi Namazı Farzı",
    "ikindi",
    "İkindi",
    "farz",
    "Farz",
    "Niyet ettim Allah rızası için bugünkü ikindi namazının farzını kılmaya.",
    true
  ),

  // AKŞAM
  createAkshamFarz(),
  createTwoRakatPrayer(
    "aksam-sunnet",
    "Akşam Namazı Sünneti",
    "aksam",
    "Akşam",
    "sunnet",
    "Sünnet",
    "Niyet ettim Allah rızası için bugünkü akşam namazının sünnetini kılmaya."
  ),

  // YATSI
  createFourRakatPrayer(
    "yatsi-sunnet",
    "Yatsı Namazı İlk Sünneti",
    "yatsı",
    "Yatsı",
    "sunnet",
    "İlk Sünnet",
    "Niyet ettim Allah rızası için bugünkü yatsı namazının ilk sünnetini kılmaya.",
    false
  ),
  createFourRakatPrayer(
    "yatsi-farz",
    "Yatsı Namazı Farzı",
    "yatsı",
    "Yatsı",
    "farz",
    "Farz",
    "Niyet ettim Allah rızası için bugünkü yatsı namazının farzını kılmaya.",
    true
  ),
  createTwoRakatPrayer(
    "yatsi-son-sunnet",
    "Yatsı Namazı Son Sünneti",
    "yatsı",
    "Yatsı",
    "son_sunnet",
    "Son Sünnet",
    "Niyet ettim Allah rızası için bugünkü yatsı namazının son sünnetini kılmaya."
  ),
  createVitirPrayer()
];

export function getPrayerById(id: string): PrayerDefinition | undefined {
  return PRAYER_LIST.find((p) => p.id === id);
}
