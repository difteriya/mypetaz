# mypet.az — Layihə Planı

> Azərbaycanda ev heyvanları üçün "hamısı bir yerdə" portal: pet profilləri + elanlar + biznes hesabları (mağaza + xidmət göstərən obyektlər birləşdirilib) + bloq (Phase 1), tam e-ticarət mağazası (Phase 2).
> Əlaqəli layihə: baytar həkimlər üçün ayrı domendə appointment platforması — ortaq backend/DB üzərindən mypet.az-la sinxron işləyir.

**Son yenilənmə:** 2026-07-09

---

## 1. Ümumi baxış

| | |
|---|---|
| **Layihə** | mypet.az — pet portalı + baytar platforması (ayrı domen, ortaq backend) |
| **Dil** | Azərbaycan dili (Phase 1 yalnız AZ) |
| **Texnologiya** | Next.js (App Router) + PostgreSQL |
| **Hosting** | VPS (Nginx + PM2/Docker, PostgreSQL və şəkillər eyni serverdə) |
| **Dizayn** | İsti və dostcanlı — yumşaq rənglər, pet temalı illüstrasiyalar |
| **Monetizasiya** | Phase 1-də yoxdur, istisna: biznes hesabı Phase 1-də admin təsdiqi ilə pulsuz, **Phase 2-də pullu özünəqeydiyyata keçir** (gələcəkdə modul-əsaslı: elan paylaşma / xidmət göstərmə ayrıca ödənişli ola bilər — bax bölmə 6) |

---

## 2. Phase 1 — Scope

### 2.1 Pet Profili (nüvə obyekt — hər şey buna bağlıdır)
- Hər pet **user-in profilinə bağlıdır** (`ownerId`), elandan asılı olmadan mövcuddur
- **Pet yaratma axını (addım-addım):**
  1. **Kateqoriya seç** — İt / Pişik / Dovşan / Gəmiricilər (Xomyak və bənzərləri) / Balıq / Quş / Digər (bax 2.2)
  2. **Cins (növ) seç** — seçilmiş kateqoriyaya bağlı, admin panelindən idarə olunan cins siyahısından (məs. kateqoriya = İt → cins = Golden Retriever), və ya "Qarışıq/Bilinmir"
  3. **Kateqoriyaya uyğun dinamik sahələr** doldurulur (bax 2.2 — hər kateqoriyanın öz sahə dəsti var)
- **Ownership transfer:** elan vasitəsilə satış/övladlığa vermə tamamlananda pet profili **bütün tarixçəsi ilə birlikdə** (passport, peyvənd qeydləri, baytar tarixçəsi) köhnə sahibdən yeni sahibə keçir — pet-in ID-si sabit qalır, sadəcə `ownerId` dəyişir (tetiklenmə qaydası: bax 2.5)
- Şəxsi kabinetdə: "Mənim petlərim" siyahısı, hər biri üçün profil səhifəsi

### 2.2 Kateqoriyalar və dinamik sahələr

**Top 6 kateqoriya + Digər:**

| Kateqoriya |
|---|
| 🐕 İt |
| 🐈 Pişik |
| 🐇 Dovşan |
| 🐹 Gəmiricilər (Xomyak və bənzərləri) |
| 🐠 Balıq |
| 🐦 Quş |
| 🔹 Digər |

### 2.2.1 Cinslər (növ) — admin panelindən idarə olunur

Hər kateqoriyanın öz **cins siyahısı** var (məs. kateqoriya = İt → cins = Golden Retriever). Bu siyahı admin panelindən **kod dəyişikliyi olmadan** idarə olunur (əlavə et / redaktə et / sırasını dəyiş / deaktiv et) — aşağıdakılar ilkin seed data kimi əlavə olunacaq:

**İt:**
Alman Çoban İti, Qafqaz Çoban İti (Alabaş), Orta Asiya Çoban İti (Alabai), Golden Retriever, Labrador Retriever, Pudel, Yorkshire Terrier, Chihuahua, Pomeranian (Şpiц), Sibir Haskisi, Rottweiler, Fransız Buldoqu, Şi-Tzu, Dratxar, Qarışıq/Bilinmir

**Pişik:**
Fars, Britan Qısa Tüklü, Şotland Qıvrıq Qulaqlı, Siam, Sfinks, Meyn Kun, Qızıl Şinşilla, Van Pişiyi, Benqal, Reqdoll, Yerli/Adi Pişik, Qarışıq/Bilinmir

**Dovşan:**
Holland Lop, Angora Dovşanı, Flamand Nəhəngi, Reks, Karlik Dovşan (Netherland Dwarf), Himalay Dovşanı, Yerli Dovşan, Qarışıq/Bilinmir

**Gəmiricilər:**
Suriya Xomyakı, Cungar Xomyakı, Roborovski Xomyakı, Dəniz Donuzu (Guinea Pig), Çinçilla, Cerbil, Dequ, Qarışıq/Bilinmir

**Balıq:**
Qızıl Balıq, Betta (Döyüşçü Balıq), Guppi, Neon Tetra, Skalyariya, Karp Koi, Som Balığı, Oskar, Papağan Balığı (Flowerhorn), Qarışıq/Digər

**Quş:**
Dalğalı Tutuquşu (Budgie), Kakadu, Ara Papağan (Macaw), Afrika Boz Tutuquşusu, Lovbird, Konur, Kanareya, Bülbül, Dekorativ Toyuq, Göyərçin, Qarışıq/Bilinmir

**Digər:** cins siyahısı yoxdur — istifadəçi növü sərbəst mətn kimi özü yazır.

> Hər siyahının sonunda "Qarışıq/Bilinmir" seçimi mütləq saxlanılır ki, istifadəçi dəqiq cinsi bilmədiyi halda da elan yerləşdirə bilsin.

**Ümumi sahələr (bütün kateqoriyalarda):**
`ad`, `cins (breed)`, `doğum tarixi` (və ya təxmini yaş), `cinsiyyət`, `rəng`, `çəki`, `mikroçip nömrəsi (optional)`, `şəkillər`, `qısa təsvir/xarakter`

**Kateqoriyaya xas əlavə sahələr:**

| Kateqoriya | Əlavə sahələr |
|---|---|
| İt / Pişik | tük uzunluğu, sterilizasiya olunub/olunmayıb, ölçü (kiçik/orta/böyük), xarakter teqləri (sakit, enerjili, uşaqlarla dost və s.) |
| Dovşan | tük tipi, ölçü kateqoriyası |
| Gəmiricilər | növ altı (xomyak/dəniz donuzu/çinçilla/cerbil və s.), tük tipi, qəfəs tipi |
| Balıq | su tipi (şirin/duzlu), akvarium ölçüsü, temperatur/pH tələbi |
| Quş | növ altı, qanad kəsilib/kəsilməyib, danışıq/oxuma bacarığı |
| Digər | sərbəst əlavə sahə (ad-dəyər cütləri) |

> Texniki qeyd: bu sahə dəstləri DB-də sabit sxem kimi deyil, **kateqoriya bazlı JSON schema** kimi saxlanılmalıdır ki, yeni kateqoriya/sahə əlavəsi kod dəyişikliyi tələb etməsin (bax 4-cü bölmə, `PetCategoryField`).

### 2.3 Passport və Peyvənd (optional, pet profilinə bağlı)
- **Passport:** sənəd nömrəsi, verilmə tarixi, mikroçip ID, doğum yeri, sənəd şəkli (upload)
- **Peyvənd/tibbi tarixçə:** hər qeyd = tip (peyvənd/müayinə/əməliyyat), ad, tarix, növbəti tarix (xatırlatma üçün), qeyd, əlavə edən (istifadəçi özü **və ya** baytar həkim — bax bölmə 7)
- Bu qeydlər pet ilə birlikdə ownership transfer zamanı **tam köçür**
- İstifadəçi özü də əl ilə qeyd əlavə edə bilər (baytar təsdiqi olmadan, sadəcə şəxsi qeyd kimi) — həkim əlavə etdiyi qeydlərdən fərqləndirilməlidir (mənbə: "Özüm" vs "Baytar: Dr. X")

### 2.4 Elanlar
- **Elan tipləri (badge rəngləri ilə):** `SATIS`, `OVLADLIGA`, `ITMIS_TAPILMIS`, `CUTLESME` (mypet.az-dakı "Alış" tipini Phase 1-də çıxarırıq — az istifadə olunur, sonra əlavə edilə bilər)
- **Elan = mövcud pet profilinə keçiddir** — istifadəçi əvvəlcə pet yaradır, sonra həmin pet üçün elan açır (məlumat təkrarlanmır, elan sadəcə pet profilinə "vitrin" olur)
- Elan yerləşdirmə: pet seç → elan tipi seç → qiymət (satış üçün) / şəhər / ünvan (xəritə pin-i ilə) / əlaqə məlumatı doldur
- Filtrlər: elan tipi, kateqoriya, cins, şəhər, qiymət aralığı, yaş
- Axtarış (başlıq/təsvir üzrə)
- **Elan heç vaxt birbaşa post olunmur:** yeni elan yaradılanda default olaraq `GOZLEMEDE` statusunda yaranır və saytda (elan siyahısı, axtarış, kateqoriya səhifələri, ana səhifə) **ictimai görünmür** — yalnız admin panelindən təsdiqlədikdən sonra `AKTIV`-ə keçir və görünməyə başlayır. Bu qayda **bütün elan sahiblərinə aiddir** — fərdi istifadəçi və biznes hesabı arasında istisna yoxdur
- Elan statusları: `GOZLEMEDE` (moderasiya, defolt) → `AKTIV` (admin təsdiqi) → `BITMIS` / `REDD`
- **Şəkil üzərində badge:** sol yuxarı küncdə rəngli lent — elan tipinə görə fərqli rəng (məs. Satış = firuzəyi, Övladlığa = çəhrayı, İtmiş/Tapılmış = qırmızı, Cütləşmə = bənövşəyi); altında ikinci, opsional status lenti ("Yeni", "Təcili")
- **Qiymət göstərilməsi:** manat simvolu (₼) istifadə olunur (məs. "450 ₼"); simvol dəstəklənmirsə (köhnə cihaz/font) avtomatik **"AZN" mətn fallback-ına** keçilir (front-end tərəfdə şrift/glyph aşkarlanması ilə)
- **"Nömrəni göstər" (tap.az referansı):** elan detalında (və biznes elanlarında kartın da üzərində) telefon nömrəsi əvvəlcə maskalanmış görünür (məs. "+994 •• ••• •• ••"), düyməyə klikləndə tam nömrə açılır; WhatsApp düyməsi ayrıca göstərilir

#### Seçilmiş Elanlar (ana səhifə, gələcək monetizasiya üçün)
- Ana səhifədə **"Seçilmiş Elanlar"** bölməsi (karusel/grid) — mypet.az-dakı "Seçilmiş Elanlar" bölməsinə bənzər, saytın ən üstündə göstərilir
- `Listing.secilmis` (bool) sahəsi ilə idarə olunur — **Phase 1-də admin əl ilə** istənilən elanı seçilmiş edə bilər (pulsuz, kurasiya məqsədli)
- **Phase 2-də bu, VIP/premium ödənişli yerləşdirməyə çevrilir** — istifadəçi/biznes öz elanını ödəniş edərək "Seçilmiş"ə çıxara biləcək (bax bölmə 6, VIP/premium elanlar)
- Seçilmiş elan kartında əlavə görsəl fərq: qızılı kənar çərçivə/ulduz ikonu ilə "Seçilmiş" işarəsi (tip badge-i ilə qarışdırılmır, ayrıca vizual qat)

#### Elan detalı səhifəsi — layout
- Əsas məzmun: şəkil qalereyası, bütün pet/elan sahələri, "Nömrəni göstər" + WhatsApp düymələri, **"Xəritədə göstər"** düyməsi (ünvan varsa, kliklənəndə embedded xəritə açılır/genişlənir)
- **Əgər elan biznes hesabı tərəfindən yerləşdirilibsə** — səhifənin **sağında** biznes kartı göstərilir (tap.az-ın məhsul səhifəsindəki satıcı paneli kimi): biznes loqosu, adı, "Təsdiqlənmiş" nişanı, elan sayı, "Profilə bax" linki, "Nömrəni göstər" düyməsi
- **Aşağıda, əgər biznes elanıdırsa:** "[Biznes adı]-nın digər elanları" horizontal grid
- **Həmişə, aşağıda:** "Bənzər elanlar" grid-i (eyni kateqoriya/cins/şəhər üzrə uyğunlaşdırılmış elanlar) — fərdi satıcı elanlarında da görünür
- **Rəy və reytinq** — mypet.az-da artıq mövcud olan "Rəy və şərhlər" bölməsinin formalaşdırılmış versiyası: 1-5 ulduz reytinqi + şərh mətni, orta reytinq və rəy sayı elan başlığının yanında göstərilir (bax "Rəy sistemi" aşağıda)

#### Rəy sistemi (Elanlar + Biznes profilləri üçün, ortaq `Review` modeli)
- **Kim rəy yaza bilər:** yalnız **giriş etmiş** istifadəçilər (mypet.az-dakı köhnə "qonaq + ad/email" formasından fərqli olaraq spam-a qarşı daha etibarlı) — hər istifadəçi bir hədəfə (elan və ya biznes profili) **yalnız bir rəy** yaza bilər
- **Moderasiya:** yeni rəy də elan/bloq ilə eyni axından keçir — default `GOZLEMEDE`, admin təsdiqindən sonra `AKTIV` və ictimai görünür (spam/təhqiramiz məzmun filtri üçün)
- **Harada görünür:**
  - Elan detalı səhifəsində — reytinq + rəylər siyahısı + "Rəy yaz" formu
  - Biznes profili səhifəsində — statistika sətrinə **orta reytinq** (★ 4.6, 32 rəy) əlavə olunur (bax 2.7), altında rəylər siyahısı + "Rəy yaz" formu — biznesin həm elan, həm xidmət tərəfini əhatə edən **vahid** rəy axını (ayrıca "mağaza rəyi" / "xidmət rəyi" bölünməsi yoxdur, real dünyada da bir biznes tək dəfə qiymətləndirilir)
- **Hədəf tipləri (Phase 1):** `Review.hedefTip` — `LISTING` / `BIZNES`. Struktur elə qurulur ki, **Phase 2-də `VET`** əlavəsi ilə asanlıqla genişlənə bilər (bax bölmə 6, Phase 2 backlog) — kod dəyişikliyi minimal olur

### 2.5 Ownership Transfer axını
- Yalnız **elan sahibi (satıcı)** tetikleyir: elanı "Sahiblik dəyişdi" statusuna keçirir və sistemdən **alıcının hesabını seçir** (email/telefon ilə axtarış və ya alıcı ilə mesajlaşmadan seçim)
- Satıcı təsdiqləyən kimi transfer **avtomatik** icra olunur: pet-in `ownerId`-si yenilənir, bütün tarixçə (passport, peyvənd, baytar qeydləri) yeni sahibin kabinetində görünməyə başlayır
- Köhnə sahibin kabinetində həmin pet "Köçürülmüş" arxivində qalır (read-only, tarixçə üçün)
- **Transfer zamanı bütün aktiv `PetShareLink`-lər avtomatik deaktiv olunur** — köhnə sahibin paylaşdığı link yeni sahibin razılığı olmadan işləməyə davam etməsin; yeni sahib istəsə öz linkini yenidən yaradar
- Risk qeydi: bu axın sadələşdirilmiş olduğu üçün səhv/etiraz halları üçün admin tərəfindən **geri qaytarma (rollback)** imkanı admin panelə əlavə olunmalıdır

### 2.6 Əlaqə (hər ikisi)
- Elanda telefon nömrəsi + WhatsApp linki
- **Daxili mesajlaşma** — elan üzərindən yazışma, polling əsaslı (real-time WebSocket tələb olunmur)

### 2.7 Biznes Hesabları — Mağaza + Xidmət göstərən obyektlər (birləşdirilmiş)
> Əvvəllər "Mağaza" (pet satan biznes) və "Xidmət obyekti" (qromer, pet otel, kinoloq) ayrı hesab tipləri kimi planlaşdırılmışdı. Bunlar **bir "Biznes" hesabına** birləşdirilir — bir biznes həm **elan yerləşdirə** (pet satışı/övladlığa vermə), həm də **öz xidmətlərini göstərə** bilər (məs. bir pet mağazası eyni zamanda qromer xidməti də göstərə bilər). Hər iki imkan **Phase 1-də birgə və pulsuz aktivdir**; gələcəkdə bunlar ayrı-ayrı ödənişli modul kimi təklif oluna bilər (bax bölmə 6, Phase 2).

- **Hesab tipi:** `User.accountType` — `INDIVID` (fərdi) / `BIZNES` (pet mağazası, breeder, sığınacaq, qromer, pet otel, kinoloq/heyvan təlimçisi, gəzdirmə xidməti və s. — hamısı bir hesab tipi)
- **Özünəqeydiyyat:** istənilən biznes **öz hesabından qeydiyyatdan keçib profilini yaradır** → **admin təsdiqləyənə qədər** gözləmə statusunda qalır (`GOZLEMEDE` → `AKTIV`) — elan/bloq/rəy ilə **eyni moderasiya dili**, Phase 1-də pulsuz
- **Phase 2-yə qoyulan dəyişiklik (indidən qeyd olunur):** biznes hesabı açılışı **pullu** özünəqeydiyyata keçəcək, admin təsdiqi tələbi aradan qalxacaq (bax bölmə 6)
- **Biznes profili:** ad, banner, loqo, təsvir, ünvan + xəritədə göstər (lat/lng), şəhər, iş saatları (açıq/bağlı canlı status), telefon ("Nömrəni göstər", tap.az üslubu), sosial linklər, "Təsdiqlənmiş Biznes" nişanı
- **Xidmət kateqoriyası teqləri (opsional, çoxlu seçim ola bilər):** qromer, pet otel, kinoloq/heyvan təlimçisi, gəzdirmə xidməti, digər (`ServiceCategory` — admin idarəli sadə lookup, yeni kateqoriya əlavəsi kod dəyişikliyi tələb etmir); təmiz pet satan biznes heç bir kateqoriya seçməyə bilər

**İki müstəqil imkan (hər ikisi Phase 1-də aktiv):**
1. **Elan yerləşdirmə** — biznes bir neçə elan yerləşdirə bilər, hər elan **öz pet profilinə bağlı qalır** (2.1-dəki model pozulmur, passport/tibbi tarixçə/ownership transfer bu elanlarda da işləyir). Elan kartlarında kiçik "Biznes" nişanı/linki göstərilir (fərdi satıcıdan fərqləndirmək üçün). Biznesin hesabı təsdiqlənmiş olsa belə, **hər elan yenə ayrıca admin moderasiyasından keçir** (bax 2.4) — biznes statusu elanı avtomatik `AKTIV` etmir
2. **Göstərdiyi xidmətlər siyahısı (`ServiceOffering`)** — biznes öz təklif etdiyi konkret xidmətləri strukturlaşdırılmış siyahı kimi əlavə edir (məs. pet otel üçün: "Gündəlik baxım", "Gecələmə", "Hovuz"; qromer üçün: "Tam yuyulma", "Tük kəsimi", "Caynaq kəsimi") — hər xidmət üçün opsional qiymət/təsvir, sahib tərəfindən sərbəst əlavə/redaktə edilir, admin təsdiqi tələb olunmur (biznes profilinin özü artıq təsdiqlənib)

- **Rəy və reytinq** — ortaq `Review` sistemi (bax 2.4) burada da işləyir: istifadəçilər biznesə ulduz reytinqi + şərh yaza bilər (bir istifadəçi — bir rəy), moderasiyadan keçir, profil səhifəsində orta reytinq göstərilir
- Şəhər/kateqoriya üzrə filtrlənə bilən **kataloq/directory səhifəsi** (`/bizneslar`) — bütün biznesləri göstərir (istəsə "yalnız elan satanlar" / "yalnız xidmət göstərənlər" filtri əlavə oluna bilər)
- **Baytar klinikaları/həkimləri bu modeldən kənardadır** — onlar öz ayrı domenində (appointment daxil) tam funksional panelə malikdirlər (bax bölmə 7). Digər xidmət növlərində appointment/rezervasiya **Phase 2**-dədir, Phase 1-də yalnız "Nömrəni göstər" ilə əlaqə saxlanılır

#### Biznes profili səhifəsi (`/biznes/[slug]`) — turbo.az/tap.az referansı ilə
tap.az-ın mağaza səhifəsi (banner + stats) və turbo.az-ın dilər səhifəsi (banner + iş saatı + "Nömrəni göstər") ən uğurlu elementləri birləşdirilir:

- **Banner (cover):** eninə tam, biznesin öz yüklədiyi şəkil (yoxdursa default pet-temalı banner) — üzərində loqo/ad overlay ola bilər
- **Loqo:** kvadrat, banner-in altında üst-üstə düşən (overlap) mövqedə
- **Başlıq bloku:** biznes adı (böyük) + "Təsdiqlənmiş Biznes" nişanı (mavi tik, tap.az-dakı kimi)
- **Statistika sətri:** elan sayı • baxış sayı • **★ orta reytinq (rəy sayı ilə)**
- **Təsvir:** qısa mətn, uzun olduqda "Davamını oxu" ilə açılır
- **Ünvan + status:** ünvan mətni + **"Xəritədə göstər"** düyməsi (kliklənəndə embedded xəritə açılır, lat/lng əsasında), "Açıqdır/Bağlıdır" canlı status + iş saatları (aşağı açılan)
- **Sağ üst əməliyyat düyməsi:** **"Nömrəni göstər"** (biznesin telefonu, tap.az-dakı kimi maskalanmış → klik ilə açılır) / WhatsApp
- **Əgər elanları varsa — "[Biznes adı] elanları (N)":** daxili axtarış, pet kateqoriyası üzrə filtr, sıralama, elan grid-i (adi elan kartları, badge-lər saxlanılır)
- **Əgər göstərdiyi xidmətlər varsa — "Göstərdiyi xidmətlər":** siyahı görünüşü (ad + qiymət/təsvir varsa)
- **Rəylər bölməsi** — rəylər siyahısı (ulduz + mətn + rəyçinin adı) + "Rəy yaz" formu (giriş etmiş istifadəçilər üçün)

### 2.8 İstifadəçi sistemi
- Qeydiyyat / giriş: email + şifrə, sosial giriş (Google, Facebook) — Auth.js / NextAuth
- Şəxsi kabinet:
  - **Mənim petlərim** (profillər + tarixçə)
  - Mənim elanlarım (status üzrə)
  - **Bloq yazılarım** (yaratma/redaktə + status: Gözləmədə/Aktiv/Rədd, bax 2.12)
  - **Biznesim** (biznes hesabı üçün: profil + göstərdiyi xidmətlər siyahısı idarəetməsi, status görünüşü, bax 2.7)
  - Mesajlarım
  - Seçilmişlər (elanlar)
  - Profil parametrləri

### 2.9 Admin panel
- **Elan moderasiyası** (təsdiq / rədd + səbəb) — yeni elanlar defolt `GOZLEMEDE` siyahısına düşür, admin baxıb `AKTIV` edənə qədər saytda görünmür (fərdi və biznes elanları eyni qaydaya tabedir)
- Ownership transfer rollback
- **Biznes profili moderasiyası** (təsdiq/rədd + səbəb) — yeni qeydiyyatdan keçən biznes hesabları `GOZLEMEDE`-də yaranır, admin təsdiqindən sonra kataloqda görünür (bax 2.7); `ServiceCategory` CRUD (qromer, otel, kinoloq və s. siyahısı)
- Baytar həkim qeydiyyatlarının təsdiqi (bax 7.1)
- İstifadəçi siyahısı (bloklama)
- Kateqoriya idarəetməsi: `PetCins` CRUD (cins əlavə et, redaktə et, sırasını dəyiş, deaktiv et) və `PetCategoryField` CRUD (dinamik sahələr) — hər ikisi kod dəyişikliyi tələb etmir
- Elanı "Seçilmiş" et/çıxar (`Listing.secilmis` toggle) — ana səhifədəki "Seçilmiş Elanlar" bölməsini idarə etmək üçün (bax 2.4)
- **Bloq moderasiyası** (təsdiq/rədd + səbəb) — təsdiq anında `metaBaslik`/`metaTesvir` (SEO) doldurulur, kateqoriya təyin/dəyişdirilir; admin öz yazdığı postları birbaşa `AKTIV` yaradır (bax 2.12)
- `BlogCategory` CRUD
- **Rəy moderasiyası** (təsdiq/rədd + səbəb) — elan və biznes rəyləri üçün, spam/təhqiramiz məzmun filtri (bax "Rəy sistemi", 2.4)
- **Şikayətlərin baxılması** (`Report`) — icma tərəfindən işarələnmiş artıq-aktiv elan/bloq/rəy/biznes siyahısı, admin baxıb məzmunu deaktiv edə bilər (bax 2.13)
- Kontent idarəetməsi (bax 2.10)
- Sadə statistika

### 2.10 Kontent İdarəetməsi (CMS) — bütün səhifələrin şəkil/mətnləri admin panelindən dəyişir

Saytdakı **statik məzmun** (marketinq mətnləri, banner şəkilləri, statik səhifə mətnləri) kod içində hardcode olunmur — admin panelindən **kod dəyişikliyi/deploy tələb olunmadan** redaktə edilə bilən `ContentBlock` sistemi ilə idarə olunur:

- **Ana səhifə:** hero background şəkli, hero başlıq/alt mətn, promo banner-lər (mypet.az-dakı "Sənə Yeni Dost Tapaq" / "Paylaşımını Bizimlə Et" tipli bloklar — hər biri şəkil + başlıq + düymə mətni + link, admin sayını da idarə edir)
- **Statik səhifələr:** Haqqımızda, Əlaqə — sərbəst rich-text + şəkil məzmunu
- **Footer:** ünvan, əlaqə telefonu/email, sosial media linkləri
- **Kateqoriya/cins şəkilləri:** hər `PetCins` (və əsas kateqoriyaların) təmsilçi şəkli admin tərəfindən yüklənir/dəyişdirilir (`PetCins.sekil`) — kateqoriya seçim ekranlarında və elan kartı placeholder-larında istifadə olunur
- **Admin UI:** səhifə üzrə qruplaşdırılmış blok siyahısı; hər blokun tipinə uyğun input göstərilir (şəkil üçün upload widget + önizləmə, mətn üçün sadə input, uzun mətn üçün rich-text editor)
- Dəyişikliklər dərhal (deploy gözləmədən) canlı saytda görünür

> Diqqət: bu, elan/biznes kimi **dinamik məzmuna** aid deyil (onlar öz CRUD-larından idarə olunur, bax 2.9) — CMS yalnız saytın **marketinq/statik** hissəsini əhatə edir.

### 2.11 Pet Passport Export (shared link / PDF)
- Pet profilində **"Passport-u paylaş"** funksiyası — sahib öz petinin məlumatlarını kənara paylaşa bilər
- **İxrac formatları:** ictimai shared link (read-only səhifə) və PDF sənəd (yükləmə/çap üçün)
- **Sahib seçir, nə göstərilsin** — paylaşım yaradılanda checkbox-larla seçim:
  - Əsas məlumat (ad, kateqoriya, cins, yaş, cinsiyyət, rəng, şəkil)
  - Passport məlumatları (sənəd nömrəsi, mikroçip, doğum yeri)
  - Peyvənd/tibbi tarixçə (bütün `PetHealthRecord` qeydləri, baytar qeydləri daxil)
- Shared link **idarə oluna bilən** olmalıdır: sahib istənilən vaxt linki söndürə/yenidən aktivləşdirə bilər (token-based, tam URL bilinmədən açıla bilməz)
- PDF eyni seçim əsasında server tərəfdə generasiya olunur (passport formatına bənzər səliqəli sənəd — pet şəkli, əsas məlumat cədvəli, tarixçə siyahısı)

### 2.12 Bloq (Phase 2-dən Phase 1-ə köçürüldü)
- **Kim yaza bilər:** hər pet sahibi — fərdi istifadəçi **və** biznes hesabı — öz kabinetindən bloq yazısı yarada bilər. Admin da CMS vasitəsilə rəsmi yazılar yarada bilər (mypet.az komandası adından)
- **Moderasiya axını (elan axınının eyni məntiqi):** istifadəçi/biznes yazısı yaradılanda default `GOZLEMEDE` statusunda yaranır, ictimai görünmür → admin təsdiqlədikdən sonra `AKTIV` olur və **müəllifin adından** dərc olunur. Admin özü yazdığı postlar moderasiyaya ehtiyac olmadan birbaşa `AKTIV` yaranır
- Təsdiqlənmiş yazı sonradan redaktə olunarsa, yenidən `GOZLEMEDE`-ə düşür (dəyişiklik də təsdiq tələb edir)
- **SEO metadata:** admin moderasiya zamanı (təsdiq anında) `metaBaslik`/`metaTesvir` sahələrini doldurur/redaktə edir — bu, yazının axtarış nəticələrində necə göründüyünü müəyyənləşdirir (bax bölmə 8)
- **Kateqoriyalar:** hər yazıya bir `BlogCategory` təyin olunur (admin idarəli siyahı — məs. Qulluq, Qidalanma, Sağlamlıq, Tərbiyə, Hekayələr)
- Müəllif biznes hesabıdırsa, yazıda biznes profilinə keçid göstərilir; fərdi istifadəçilərdə müəllif adı sadəcə mətn kimi görünür (ictimai profil linki yoxdur)
- **Şəxsi kabinetdə "Bloq yazılarım" bölməsi** — yazı yaratma/redaktə formu + status görünüşü (Gözləmədə / Aktiv / Rədd + səbəb)

### 2.13 Etibar və Təhlükəsizlik — Bildirişlər + Şikayətlər

Bütün sayt boyu **hər şey moderasiyadan keçdiyi üçün** (elan, bloq, rəy, biznes) istifadəçiyə nəticə barədə xəbər çatdırılması vacibdir; həmçinin artıq yayımlanmış məzmuna görə icma özü şikayət edə bilməlidir.

#### Bildirişlər (`Notification`)
- **Nə vaxt göndərilir:** elan/bloq/biznes təsdiqləndi/rədd edildi (səbəblə), rəy təsdiqləndi, yeni mesaj gəldi, pet ownership transfer sənə edildi
- **Kanal:** in-app (header-də bildiriş zəngi + `/kabinet/bildirisler` siyahısı) + **email** (ən vacib hadisələr üçün: rədd/təsdiq, ownership transfer)
- Oxunmamış say header-də görünür

#### Şikayət mexanizmi (`Report`)
- Artıq **AKTIV** olan elan, bloq yazısı, rəy və ya biznes profili üzərində **"Şikayət et"** düyməsi — istifadəçi səbəb seçir (spam, saxta, təhqiramiz, fırıldaq və s.) + opsional qeyd
- Admin panelə düşür (`GOZLEMEDE` → `BAXILDI`), admin baxıb məzmunu deaktiv edə bilər — pre-publish moderasiyanı **post-publish icma nəzarəti** ilə tamamlayır
- Bu, yeni submission-ların ilkin moderasiyasından fərqlidir — artıq təsdiqlənmiş, amma sonradan problemli çıxan məzmun üçündür

### 2.14 Səhifələr
| Route | Səhifə |
|---|---|
| `/` | Ana səhifə — hero (background şəkilli), kateqoriyalar, **seçilmiş elanlar**, son elanlar, bizneslər |
| `/petlerim` | Şəxsi kabinet — pet profilləri |
| `/petlerim/yeni` | Pet yaratma (kateqoriya → cins → dinamik sahələr) |
| `/pet/[id]` | Pet profili (sahibi üçün tam, başqaları üçün elan varsa məhdud görünüş) |
| `/pet/[id]/passport` | Passport paylaşım/ixrac idarəetməsi (sahib üçün) |
| `/p/[token]` | İctimai shared passport görünüşü (link vasitəsilə, giriş tələb olunmur) |
| `/elanlar` | Elan siyahısı + filtrlər |
| `/elanlar/[kateqoriya]` | Kateqoriya landing (SEO, bax 8.1) |
| `/elanlar/[kateqoriya]/[cins]` | Cins landing (SEO, bax 8.1) |
| `/elanlar/[slug]` | Elan detalı |
| `/elan-yerlesdir` | Yeni elan formu (mövcud petdən seçim) |
| `/bizneslar` | Biznes kataloqu/directory (bütün mağaza + xidmət göstərən obyektlər, şəhər/kateqoriya filtri) |
| `/biznes/[slug]` | Biznes profili — elanları + göstərdiyi xidmətlər + rəylər (bax 2.7) |
| `/biznes-ol` | Biznes hesabına keçid/qeydiyyat tələbi formu |
| `/bloq` | Bloq siyahısı |
| `/bloq/[kateqoriya]` | Bloq kateqoriya landing (SEO) |
| `/bloq/[slug]` | Bloq yazısı detalı |
| `/bloq-yaz` | Yeni bloq yazısı formu (giriş etmiş istifadəçi/biznes üçün) |
| `/kabinet/*` | Şəxsi kabinet (elanlar, mesajlar, seçilmişlər, **bloq yazılarım**, **biznesim paneli**) |
| `/kabinet/bildirisler` | Bildirişlər siyahısı (bax 2.13) |
| `/mesajlar` | Daxili mesajlaşma |
| `/haqqimizda`, `/elaqe` | Statik səhifələr |
| `/qaydalar` | İstifadə şərtləri |
| `/mexfilik-siyaseti` | Məxfilik siyasəti |
| `/admin/*` | Admin panel |

---

## 3. Texniki stek

| Qat | Seçim |
|---|---|
| Framework | Next.js 15+ (App Router, Server Components) |
| Dil | TypeScript |
| DB | PostgreSQL (VPS-də lokal, **mypet.az və baytar platforması üçün ortaq**) |
| ORM | Prisma |
| Auth | Auth.js (NextAuth v5) — email/şifrə + sosial giriş (Google, Facebook — Auth.js-in provider sistemi sayəsində əlavə provayder qoşmaq asandır), **ortaq auth** (bir hesabla hər iki sistemə giriş, rola görə fərqli panel) |
| Şəkil storage | VPS diski (`/uploads`) + sharp ilə resize/webp |
| Email servisi | Resend / SMTP — parol bərpası, təsdiq/rədd bildirişləri, ownership transfer xəbərdarlığı |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Deploy | VPS: Nginx (reverse proxy + SSL) + PM2 və ya Docker Compose |

### Monorepo/servis strukturu
- **Ortaq backend/DB** qərarı: iki Next.js app (`mypet.az` + `vet.mypet.az`) eyni Prisma sxemi və eyni PostgreSQL instansına qoşulur
- Təklif olunan struktur: monorepo (`apps/web` → mypet.az, `apps/vet` → vet.mypet.az, `packages/db` — ortaq Prisma client və tiplər)
- Nginx-də hər subdomain üçün ayrı server bloku, hər ikisi eyni VPS-də fərqli portlarda işləyən Next.js instansına proxy edir
- Subdomain seçimi sayəsində **bir wildcard SSL sertifikatı** (`*.mypet.az`) və **ortaq cookie/session domeni** kifayətdir — cross-domain auth mürəkkəbliyi yoxdur

### VPS qurulumu (deploy vaxtı)
- **Nginx** — reverse proxy, `/uploads` üçün birbaşa static serving, gzip, hər subdomain üçün ayrı bloklar
- **SSL** — Let's Encrypt (certbot, wildcard `*.mypet.az` sertifikatı, avtomatik yenilənmə)
- **Proses meneceri** — PM2 (hər app üçün ayrı proses) və ya Docker Compose (2 app + 1 postgres)
- **Backup** — gecə cron: `pg_dump` + uploads folderinin arxivi
- **Deploy axını** — git pull → `npm run build` → PM2 restart

## 4. Data modeli (eskiz)

```
User            — id, ad, email, telefon, rol (USER/VET/ADMIN),
                  accountType (INDIVID/BIZNES), yaradilma

BusinessProfile — id, userId, ad, slug, banner, loqo, tesvir, seher, unvan,
                  lat, lng, telefon, isSaatlari, baxishSayi,
                  ortaReytinq (nullable, cache), reyingSayi (defolt 0, cache),
                  status (defolt: GOZLEMEDE — özünəqeydiyyat, admin
                  təsdiqindən sonra AKTIV), tesdiqTarixi,
                  odenisStatusu (Phase 2 üçün nullable), yaradilma
                  — ortaReytinq/reyingSayi hər `Review` təsdiqləndikdə
                  yenidən hesablanır (performans üçün cache, bax "Rəy sistemi");
                  Mağaza+Xidmət birləşdirilmiş modeli (bax 2.7) — elan
                  yerləşdirmə (`Listing.userId`) və `ServiceOffering`
                  siyahısı hər ikisi bu profilə bağlanır
BusinessServiceCategory — businessId + serviceCategoryId (çoxlu seçim,
                  opsional — pet satan biznes heç birini seçməyə bilər)

Pet             — id, ownerId, kateqoriya, cinsId (nullable — "Qarışıq/
                  Bilinmir" halında boş), ad, dogumTarixi, cinsiyyet, reng,
                  cheki, mikrochipNo, tesvir, statik_sahələr (yuxarı),
                  status (AKTIV/KOCURULMUS), yaradilma
PetImage        — id, petId, url, sira
PetCins         — id, kateqoriya, ad (məs. "Golden Retriever"), slug, sıra,
                  sekil (nullable — təmsilçi şəkil, admin yükləyir), aktiv(bool),
                  aciqlama (nullable — SEO landing səhifəsi üçün mətn),
                  metaBaslik, metaTesvir (nullable, SEO üçün)
                  — admin panelindən idarə olunur, hər kateqoriyanın öz
                  cins (növ) siyahısı (bax 2.2.1) və SEO landing məzmunu (bax 8.1)

ContentBlock    — id, sehife (ANA_SEHIFE/HAQQIMIZDA/ELAQE/FOOTER/GLOBAL),
                  acar (unikal, məs. "hero_sekil", "banner_1_baslik"),
                  tip (TEXT/RICHTEXT/IMAGE/URL), deyer, sira, yenilenme
                  — admin panelindən idarə olunur, kod dəyişmədən bütün
                  statik səhifə şəkil/mətnləri (bax 2.10)
PetCategoryField— id, kateqoriya, sahəAdı, tip (text/number/select/bool),
                  seçimlər (JSON), mecburi(bool), sıra
                  — admin panelindən idarə olunur, kod dəyişmədən sahə əlavəsi

PetPassport     — id, petId, senedNo, verilmeTarixi, mikrochipId,
                  dogumYeri, senedSekli

PetHealthRecord — id, petId, tip (PEYVEND/MUAYINE/EMELIYYAT), ad, tarix,
                  novbetiTarix, qeyd, menbe (OZUM/BAYTAR),
                  vetAppointmentId (nullable — baytar əlavə edibsə bağlanır),
                  yaradilma

PetShareLink    — id, petId, token, aktiv(bool), gosterilenSahələr (JSON —
                  esasMelumat/passport/tibbiTarixce seçimləri), baxishSayi,
                  yaradilma

Listing         — id, tip, petId, basliq, slug, tesvir, qiymet, seher,
                  unvan, lat, lng, telefon, secilmis(bool),
                  status (defolt: GOZLEMEDE — heç bir elan avtomatik AKTIV
                  yaranmır), userId, yaradilma
ListingImage    — id, listingId, url, sira
OwnershipTransfer— id, petId, kohneOwnerId, yeniOwnerId, listingId,
                  tarix, geriQaytarilib(bool)

BlogCategory    — id, ad (məs. "Qulluq", "Qidalanma", "Sağlamlıq"), slug,
                  sıra, aktiv(bool) — admin panelindən idarə olunur
BlogPost        — id, userId (müəllif — fərdi/biznes/admin), kateqoriyaId,
                  basliq, slug, qapaqSekli, qisaTesvir, metn (rich-text),
                  status (defolt: GOZLEMEDE, admin özü yazanda: AKTIV),
                  metaBaslik, metaTesvir (admin təsdiq anında doldurur),
                  yayinTarixi (AKTIV olduğu tarix), yaradilma, yenilenme
                  — moderasiya axını Listing ilə eynidir (bax 2.12)

Review          — id, hedefTip (LISTING/BIZNES — Phase 2: +VET),
                  hedefId, userId (rəyçi), reytinq (1-5), metn,
                  status (defolt: GOZLEMEDE), yaradilma
                  — unikal: (userId, hedefTip, hedefId) — bir hədəfə bir rəy;
                  moderasiya axını Listing/BlogPost ilə eynidir (bax 2.4)

Favorite        — userId + listingId
Conversation    — id, listingId, aliciId, saticiId
Message         — id, conversationId, senderId, metn, oxundu, yaradilma

Notification    — id, userId, tip (ELAN_TESDIQ/ELAN_RED/BLOQ_TESDIQ/BLOQ_RED/
                  REY_TESDIQ/YENI_MESAJ/BIZNES_TESDIQ/BIZNES_RED/
                  OWNERSHIP_TRANSFER), mesaj, link, oxundu(bool), yaradilma
                  — in-app + email (vacib hadisələr üçün), bax 2.13
Report          — id, hedefTip (LISTING/BLOGPOST/REVIEW/BIZNES), hedefId,
                  reporterId, sebeb, qeyd (nullable),
                  status (defolt: GOZLEMEDE, admin baxandan sonra: BAXILDI),
                  yaradilma — post-publish icma nəzarəti, bax 2.13

ServiceCategory — id, ad (qromer/pet otel/kinoloq/gəzdirmə/digər), slug,
                  sıra, aktiv(bool) — admin panelindən idarə olunur
                  (`BusinessProfile`-a `BusinessServiceCategory` ilə bağlanır)
ServiceOffering — id, businessId, ad (məs. "Tük kəsimi", "Gecələmə"),
                  qiymet (nullable), tesvir (nullable), sıra
                  — biznesin göstərdiyi konkret xidmətlərin strukturlaşdırılmış
                  siyahısı, sahib tərəfindən sərbəst idarə olunur (bax 2.7)

City            — id, ad (Bakı, Gəncə, Sumqayıt, ...)

--- Baytar platforması (ortaq DB-də əlavə cədvəllər) ---
VetProfile      — id, userId, klinikaAdi, ixtisas, isSaatlari, unvan,
                  lisenziyaNo, tesdiqlenib(bool), yaradilma
VetAppointment  — id, vetId, petId, muraciciUserId, tarix, saat,
                  status (SORGU/TESDIQ/RED/TAMAMLANDI), qeyd,
                  yaradilBySekli (MUSTERI/HEKIM)
VetVisitRecord  — id, appointmentId, petId, vetId, novMuayine,
                  tesvir, tarix, tesdiqlenib(bool), tesdiqTarixi
                  — tesdiqlenib=true olanda PetHealthRecord-a köçürülür
```

## 5. Dizayn istiqaməti

- **Ton:** isti, dostcanlı, emosional — heyvan sevgisi hiss olunsun
- Yumşaq, isti rəng palitrası (kremli fon, isti accent rəngi)
- Yumru künclər, yumşaq kölgələr, pet temalı illüstrasiya/ikonlar
- **Hero bölməsi:** tam-bleed background fotoşəkli (isti, canlı pet fotoşəkli — internetdən mənbələnir, watermarksız) + oxunaqlılıq üçün yüngül tünd overlay, üzərində başlıq/CTA
- Şəkillər ön planda (elan kartları böyük şəkilli, hər kateqoriya/cins üçün internetdən mənbələnmiş nümunə fotoşəkillər)
- Elan kartında badge lenti: tip (rəngli) + opsional status lenti alt-alta, sol yuxarı künc
- Mobil-first — istifadəçilərin çoxu telefondan girəcək
- Baytar platforması daha "klinik/peşəkar" tonda ola bilər (eyni rəng ailəsi, amma sakin) — dəqiqləşdirmə bölmə 7-də
- Biznes profili səhifəsi bir qədər daha "peşəkar/brend" tonu daşıyır (banner + loqo + statistika, turbo.az/tap.az referansı — bax 2.7), amma elan kartları saytın qalan hissəsi ilə eyni istiliyi saxlayır

### 5.1 Layout — Boxed dizayn + reklam zonaları

- **Boxed layout:** bütün səhifə məzmunu sabit maksimum enli konteynerdə (məs. `max-width: 1280px`), üfüqi mərkəzləşdirilmiş — tam-enli (full-bleed) fluid layout deyil (yalnız hero background şəkli tam-bleed ola bilər, məzmun özü boxed qalır)
- **Reklam zonaları (görsəl yer ayrılır, Phase 1-də statik/idarəolunan):**
  - **Header üstü** — boxed konteynerdən əvvəl, səhifənin ən üstündə tam-enli üfüqi banner zonası (leaderboard tipli, məs. 970×250)
  - **Sol/sağ arxa-fon (background) zonası** — tap.az-da yoxladığımız real nümunəyə əsasən: bu, iki ayrı sidebar deyil, **bir bütöv "arxa fon" reklamı**-nın viewport-un sol və sağ kənarlarında görünən hissələridir. Texniki olaraq `position: fixed`, viewport-un sol/sağ kənarına yapışdırılır (`left:0` / `right:0`), header hündürlüyündən başlayır və aşağı doğru uzanır; **z-index baxımından boxed məzmunun altında** qalır — boxed konteynerin öz (kremli/ağ) fonu üstünü örtdüyü üçün yalnız konteynerdən kənarda qalan zolaqlar görünür (viewport genişdirsə vizual effekt: sayt "çərçivə içində", ətrafında bir bütöv reklam şəkli)
  - Ekran boxed enə yaxınlaşdıqda bu zonalar üçün görünən yer qalmır → **avtomatik gizlənir**; mobildə yalnız header üstü banner (kiçildilmiş formada) qala bilər
  - **Bonus (Phase 2 üçün qeyd):** tap.az-da həmçinin "catfish" tipli — səhifənin ən altında, hər şeydən üstdə (yüksək z-index) görünən sticky bottom-bar reklamı da var; Phase 1-də tələb olunmur, amma reklam sistemi genişlənəndə asan əlavə oluna bilər
- **İdarəetmə:** bu zonalar ayrıca reklam-satış sistemi qurulana qədər mövcud **`ContentBlock`** (CMS, bax 2.10) vasitəsilə idarə olunur — admin panelində `sehife=GLOBAL`, açarlar: `reklam_header`, `reklam_arxafon` (bir şəkil + link, CSS ilə sol/sağ kənarlara bölünür) — bu, real reklam-sifariş sisteminə (bax Phase 2) qədər sadə həll təmin edir

## 6. Mərhələlər

### Phase 1 (bu plan)
1. Monorepo skeleti: Next.js (apps/web) + Prisma + Auth + Tailwind quraşdırma
2. DB schema + seed (şəhərlər, kateqoriyalar, `PetCategoryField`)
3. Auth (qeydiyyat/giriş)
4. **Pet profili:** CRUD + kateqoriya→cins→dinamik sahə axını + şəkil yükləmə
5. Passport + peyvənd/tibbi tarixçə (əl ilə qeyd)
6. Elanlar: pet-ə bağlı CRUD + badge + filtrlər + detal səhifəsi (nömrəni göstər, xəritədə göstər, biznes sidebar-ı, bənzər elanlar) + Seçilmiş Elanlar (admin idarəli)
7. Ownership transfer axını (satıcı təsdiqi)
8. **Biznes hesabları:** `BusinessProfile`/`ServiceCategory`/`ServiceOffering` + özünəqeydiyyat axını + admin təsdiqi + profil (vitrin) səhifəsi + directory (`/bizneslar`)
9. Pet Passport Export: shared link (token-based) + PDF generasiyası
10. Daxili mesajlaşma
11. Şəxsi kabinet (biznesim paneli daxil)
12. **Bloq:** `BlogPost`/`BlogCategory` + yazı yaratma formu (kabinet) + moderasiya axını + kateqoriya/detal səhifələri
13. **Rəy sistemi:** `Review` modeli (elan + biznes) + "Rəy yaz" formu + moderasiya + reytinq cache-ləri
14. Admin panel + moderasiya (elan + bloq + rəy + biznes) + rollback
15. **Bildirişlər + Şikayətlər:** `Notification` (in-app + email) və `Report` sistemi + admin baxış paneli (bax 2.13)
16. Kontent İdarəetməsi (CMS): `ContentBlock` sistemi + admin UI (şəkil upload + rich-text)
17. Boxed layout + reklam zonaları (header üstü, sol/sağ rail) — `ContentBlock` ilə idarə olunan statik banner-lər
18. Ana səhifə + statik səhifələr (Haqqımızda, Əlaqə, Qaydalar, Məxfilik Siyasəti) — CMS bloklarından render olunur, dizayn cilalanması
19. **SEO təməli:** kateqoriya/cins/bloq landing səhifələri + metadata/OG + JSON-LD + sitemap/robots (bax bölmə 8)
20. Deploy (VPS: Nginx + SSL + PM2 + backup cron) + test + Search Console/GA4 qoşulması

### Phase 1.5 — Baytar platforması (bax bölmə 7, ayrıca planlaşdırılacaq)
1. `apps/vet` skeleti (ortaq DB/Prisma-ya qoşulma)
2. Baytar özünəqeydiyyatı + admin təsdiqi
3. Appointment: müştəri sorğusu + həkimin əl ilə yaratması
4. Vizit qeydi → təsdiq → `PetHealthRecord`-a köçürmə
5. Baytar domeni deploy (Nginx-də əlavə server blok)

### Phase 2 (gələcək — scope-dan kənar)
- 💳 Biznes hesabı pullu özünəqeydiyyat (admin təsdiqi tələbi aradan qalxır, ödəniş inteqrasiyası)
- 🧩 **Modul-əsaslı biznes ödənişi** — "elan yerləşdirmə" və "xidmət göstərmə" imkanları ayrı-ayrı ödənişli təklif (Phase 1-də hər ikisi bir yerdə pulsuz aktivdir, bax 2.7) — məs. sadəcə elan satmaq istəyən biznes bir tarif, həm elan həm xidmət göstərmək istəyən başqa tarif ödəyə bilər
- 🛒 Biznes hesabları üçün tam e-ticarət (kataloq, səbət, ödəniş Payriff/Epoint, çatdırılma) — pet elanlarından əlavə fiziki məhsul satışı
- 💎 VIP/premium elanlar + ödəniş — Phase 1-də admin-idarəli `Listing.secilmis` bayrağı ödənişli özünəqeydiyyata çevrilir (istifadəçi/biznes özü ödəyib elanını "Seçilmiş"ə çıxara bilər, bax 2.4)
- 📢 Tam reklam-sifariş sistemi (header üstü + sol/sağ rail zonaları üçün) — sifarişçi idarəetməsi, aktiv tarix aralığı, göstərilmə/klik statistikası; Phase 1-də bu zonalar sadəcə `ContentBlock` ilə statik doldurulur (bax 5.1)
- 📅 Biznes profilləri üçün onlayn rezervasiya/appointment (qromer, pet otel, kinoloq və s. — özünəqeydiyyat Phase 1-ə köçürüldü, bax 2.7; burada yalnız rezervasiya sistemi qalır, baytar üçün oxşar axın artıq Phase 1.5-də var, bax bölmə 7)
- 🔔 Peyvənd növbəti tarix xatırlatmaları (email/SMS)
- 💬 Bloq yazılarına şərh yazma + newsletter abunəliyi (əsas bloq funksionallığı Phase 1-ə köçürüldü, bax 2.12)
- 🌐 Rus/İngilis dilləri
- ⭐ Baytar profilləri üçün rəy/reytinq (`Review.hedefTip = VET` əlavəsi — Elan/Biznes üçün `Review` sistemi artıq Phase 1-də mövcuddur, bax 2.4)

---

## 7. Baytar (Vet) Platforması — vet.mypet.az

### 7.1 Həkim qeydiyyatı və profili
- Baytar həkim özü qeydiyyatdan keçir (`VetProfile`), admin təsdiqindən sonra aktivləşir
- Profil: klinika/şəxsi adı, ixtisas sahəsi, iş saatları, ünvan, lisenziya nömrəsi

### 7.2 Appointment axını (hər ikisi dəstəklənir)
- **Müştəri tərəfdən:** istifadəçi öz peti üçün baytar seçir, tarix/saat sorğusu göndərir → həkim təsdiqləyir/rədd edir
- **Həkim tərəfdən:** klinikaya zəng/gəlişlə gələn müştəri üçün həkim appointment-i əl ilə birbaşa yaradır (`yaradilBySekli = HEKIM`)
- Appointment statusları: `SORGU → TESDIQ/RED → TAMAMLANDI`

### 7.3 Vizit qeydi və pet tarixçəsinə köçürmə
- Həkim appointment tamamlandıqdan sonra `VetVisitRecord` yaradır (müayinə, peyvənd, əməliyyat və s.)
- Həkim qeydi **təsdiqlədikdən sonra** (`tesdiqlenib = true`) həmin qeyd avtomatik `PetHealthRecord`-a köçürülür və pet profilində tarixçə siyahısında tarixi ilə görünür
- Mənbə "Baytar: [Klinika/Həkim adı]" kimi işarələnir, istifadəçinin özü əlavə etdiyi qeydlərdən fərqləndirilir

### 7.4 Qərarlar
- **Domen:** `vet.mypet.az` (subdomain) — eyni brend altında, ortaq SSL (wildcard) və ortaq auth/session asan olur
- **Monetizasiya:** Phase 1-də yoxdur, baytarlar pulsuz istifadə edir. Phase 2-də əlavə oluna bilər (bax bölmə 6)
- **Tarixçəyə giriş:** həkim vizit zamanı pet-in **tam tibbi tarixçəsini** görür — digər klinikaların keçmiş qeydləri də daxil (düzgün diaqnoz/müalicə üçün tam kontekst vacibdir, məxfilik məhdudlaşdırması yoxdur)

---

## 8. SEO və Marketinq

mypet.az bir **elanlar/marketplace saytıdır** — bu tip saytlar üçün orqanik trafikin əsas mənbəyi uzun-quyruq axtarışlardır ("golden retriever satışı bakı", "pişik balası pulsuz sahiblənmə" və s.). SEO memarlığa **kodlaşdırmadan əvvəl** daxil edilməlidir, sonradan əlavə etmək qat-qat çətindir.

### 8.1 URL strukturu — kateqoriya/cins landing səhifələri
Hazırki `/elanlar/[slug]` flat strukturuna əlavə olaraq, aşağıdaki **indeksləşən landing səhifələr** əlavə olunur (sadəcə filtrlənmiş nəticə görünüşü deyil — hər biri unikal H1/mətn/meta ilə real crawl olunan səhifədir):

| Route | Məqsəd |
|---|---|
| `/elanlar/[kateqoriya]` | Kateqoriya landing (məs. `/elanlar/it`) — "İt elanları Bakıda" tipli axtarışlar üçün |
| `/elanlar/[kateqoriya]/[cins]` | Cins landing (məs. `/elanlar/it/golden-retriever`) — ən güclü uzun-quyruq səhifə ("golden retriever satışı") |
| `/elanlar/[slug]` | Fərdi elan detalı (mövcud) |

- Şəhər üzrə landing (`/elanlar/it/baki`) Phase 1.5/2-də əlavə oluna bilər — Phase 1-də şəhər filtri query-param kimi qalır (canonical əsas kateqoriya/cins səhifəsinə işarə edir, thin-content/duplicate qarşısı alınır)
- Slug-lar Azərbaycan hərflərini (ə, ı, ö, ü, ş, ç, ğ) düzgün transliterasiya edir (ə→e, ş→sh, ç→ch və s.) — təmiz ASCII, oxunaqlı URL
- **`PetCins`** modelinə SEO üçün əlavə sahələr: `aciqlama` (cins landing səhifəsi üçün unikal təsviri mətn), `metaBaslik`, `metaTesvir` — admin panelindən doldurulur (bax 2.10 CMS)

### 8.2 Metadata & Open Graph
- Next.js **Metadata API** ilə hər səhifə tipi üçün dinamik `<title>`/`<meta description>`: elan (başlıq + şəhər + qiymət), kateqoriya/cins landing (statik SEO mətni), biznes/vet profili (ad + şəhər)
- **Open Graph + Twitter Card** — elan şəkli, başlığı və qiyməti ilə; WhatsApp/Instagram-da paylaşılanda düzgün önizləmə üçün AZ bazarında kritikdir
- Pet Passport shared link (`/p/[token]`) də öz OG preview-una malikdir (pet şəkli + adı) — paylaşıldıqda link cəlbedici görünür

### 8.3 Structured data (JSON-LD)
- **Elan səhifəsi:** `Product` + `Offer` schema (qiymət, valyuta, mövcudluq statusu)
- **Biznes / Vet profili:** `LocalBusiness` schema (ad, ünvan, telefon, iş saatları, lat/lng) — Google-un yerli axtarış nəticələrində zəngin görünüş üçün
- **Bütün səhifələr:** `BreadcrumbList` schema (Ana səhifə › Elanlar › İt › Golden Retriever › [elan])
- **Ana səhifə:** `Organization` schema (mypet.az brendi)
- **Elan (`Product`) və Biznes (`LocalBusiness`) schema-larına `AggregateRating`** əlavə olunur — Phase 1-də `Review` sistemi ilə birlikdə hər ikisi üçün hazırdır (bax 2.4); baytar profillərinə Phase 2-də, rəy sistemi o tərəfə genişlənəndə əlavə olunur

### 8.4 Sitemap, robots və canonical
- Dinamik **XML sitemap** — `sitemap.xml` (index) → `sitemap-elanlar.xml`, `sitemap-kateqoriyalar.xml`, `sitemap-bizneslar.xml` — yalnız `AKTIV` statuslu elanlar/profillər daxil olur, admin təsdiqindən keçməyənlər sitemap-da görünmür (bax bölmə 2.4 moderasiya qaydası ilə uyğun)
- `robots.txt` — `/kabinet/*`, `/mesajlar/*`, `/admin/*`, `/api/*` bloklanır; ictimai səhifələr açıq
- Filtrlənmiş/sıralanmış elan siyahısı URL-ləri (`?seher=&qiymet=`) **canonical tag** ilə əsas kateqoriya səhifəsinə işarə edir — duplicate content qarşısı alınır
- Elan `BITMIS`/silinəndə **soft-404 deyil** — bənzər elanlarla "Bu elan artıq mövcud deyil" səhifəsi (link equity itirilmir, istifadəçi tərk etmir)

### 8.5 Performance / Core Web Vitals
- Next.js **Image komponenti** bütün pet şəkilləri üçün (avtomatik responsive, lazy-load, WebP) — artıq planlaşdırılan `sharp` boru xəttiylə üst-üstə düşür (bax 3-cü bölmə)
- Kateqoriya/cins landing səhifələri **statik/ISR render** olunur (tez-tez dəyişmir, cache-lənə bilər); elan detalları ISR ilə tez-tez revalidate olunur
- Mobil-first performans — Google-un mobile-first indeksləşməsi üçün həlledicidir (istifadəçilərin əksəriyyəti də mobildən girir, bax 5-ci bölmə)

### 8.6 Daxili linkləmə
- Breadcrumb hər səhifədə (həm görsəl, həm `BreadcrumbList` JSON-LD)
- "Biznesin digər elanları" + "Bənzər elanlar" grid-ləri (artıq planlaşdırılıb, bax 2.4) — SEO baxımından da güclü daxili link toru yaradır
- Kateqoriya landing səhifəsində bütün aktiv cins-lərə keçidlər (yeni cins əlavə olunanda avtomatik görünür, `PetCins` siyahısından)

### 8.7 Kontent marketinqi — Bloq (Phase 1, bax 2.12)
- **İstifadəçi/biznes mənbəli bloq** — informativ axtarışları tutur ("pişik necə qidalandırılır", "it peyvənd cədvəli") → üzvi trafik + brend etibarı; həm də icma-yönümlü məzmun (istifadəçilər öz təcrübəsini paylaşır) sayta orijinal, təkrarsız kontent gətirir — Google-un E-E-A-T (təcrübə/etibar) siqnalları üçün faydalıdır
- Hər yazının **admin tərəfindən moderasiya anında doldurulan** `metaBaslik`/`metaTesvir` sahələri var (bax 2.12) — texniki SEO işi məzmun axınına inteqrasiya olunub, ayrıca addım tələb etmir
- Hər bloq məqaləsi əlaqəli cins/kateqoriya landing səhifələrinə keçid verə bilər (əlaqəli elanlar/xidmətlər) — kontent-to-commerce körpüsü
- `BlogCategory` əsasında öz landing səhifələri (`/bloq/[kateqoriya]`) də əlavə indeksləşən səhifələr yaradır (bax 8.1-dəki eyni məntiq)

### 8.8 Analytics və izləmə
- Google Search Console-a domen təsdiqi + sitemap submit (deploy mərhələsində)
- Google Analytics 4 / GTM inteqrasiyası — elan baxışı, "Nömrəni göstər" kliki, elan yerləşdirmə tamamlanması kimi hadisələr üçün conversion tracking
- Search Console-da mütəmadi index/coverage yoxlanışı (admin moderasiyadan keçən yeni elanların indeksləşməsini izləmək üçün)

### 8.9 Gələcək dillər üçün hazırlıq (Phase 2)
- Phase 1 AZ-only olsa da, URL strukturu Rus/İngilis əlavəsini nəzərə alaraq qurulur (məs. `/ru/elanlar/...`, `/en/elanlar/...` prefiksləri) ki, Phase 2-də **hreflang** əlavəsi asan olsun
- Slug-lar dil-neytral saxlanılır (mümkün olduqda), tərcümə yalnız görünən mətndə, URL-də deyil — dil dəyişəndə keçmiş linklər qırılmır
