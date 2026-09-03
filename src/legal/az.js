/**
 * Hüquqi sənədlər — Azərbaycan dili.
 *
 * Mətn `en.js` ilə eyni mənanı daşımalıdır: bölmələr eynidir və heç bir dil
 * digərinin vermədiyi bir vədi verə bilməz. `legal.test.js` bunu yoxlayır.
 *
 * Terminologiya: hüquqi dil Azərbaycan dilinin öz normalarına uyğun yazılıb,
 * texniki və məhsul adları isə tanınan formasında saxlanılıb.
 */
export default {
  /* ================================================================== *
   * İstifadə Şərtləri
   * ================================================================== */
  terms: {
    title: 'İstifadə Şərtləri',
    intro:
      'Bu şərtlər JSPath-ın nə təklif etdiyini, ondan nə gözləyə biləcəyinizi və istifadə zamanı sizdən nə gözlənildiyini izah edir. Şərtlər hesabı olan və olmayan bütün istifadəçilərə şamil olunur.',
    sections: {
      agreement: {
        heading: 'Şərtlərin qəbulu',
        blocks: [
          { p: 'JSPath-dan istifadə etməklə bu şərtləri qəbul etmiş olursunuz. Şərtlərlə razı deyilsinizsə, xidmətdən istifadə etməyin.' },
          { p: 'JSPath-dan bir təşkilat adından istifadə edirsinizsə, bu şərtləri həmin təşkilat adından qəbul etmək səlahiyyətinizin olduğunu təsdiq edirsiniz.' },
        ],
      },
      'what-jspath-is': {
        heading: 'JSPath nədir',
        blocks: [
          { p: 'JSPath JavaScript öyrənmək üçün nəzərdə tutulmuş platformadır. Burada strukturlaşdırılmış tədris proqramı, praktiki tapşırıqlar, kod çağırışları, addım-addım layihələr, müsahibəyə hazırlıq materialları, dil arayışı, xülasə vərəqləri və brauzerdə işləyən kod meydançası var.' },
          { p: 'Tədris proqramı, arayış, xülasə vərəqləri, kod meydançası və bir sıra praktiki tapşırıqlar pulsuzdur. Ödənişli Pro planı qalan praktiki materialı açır: çağırış və layihə kitabxanalarının tam həcmi, müsahibə suallarının tam bazası, premium praktika sessiyaları və mənimsəmə təhlili.' },
          { p: 'JSPath bir öyrənmə resursudur. O, sertifikatlaşdırma qurumu, işəgötürən, işə qəbul agentliyi və ya peşəkar məsləhət xidməti deyil.' },
        ],
      },
      operator: {
        heading: 'JSPath-ı kim idarə edir',
        blocks: [
          { p: 'JSPath fərdi qaydada {operator} tərəfindən idarə olunur. O, qeydiyyatdan keçmiş şirkət deyil və bu şərtlərin tərəfi kimi hər hansı şirkət çıxış etmir.' },
          { p: 'Operatorla {email} ünvanı vasitəsilə əlaqə saxlaya bilərsiniz.' },
        ],
      },
      accounts: {
        heading: 'Hesablar',
        blocks: [
          { p: 'JSPath hesabını Google və ya GitHub ilə daxil olaraq yarada bilərsiniz. Daxil olmağın yalnız bu iki yolu var. JSPath parol əsaslı hesab sistemi işlətmir, ona görə də seçəcəyiniz, saxlayacağınız, unudacağınız və ya bərpa edəcəyiniz bir JSPath parolu yoxdur.' },
          { p: 'JSPath hesabınıza Google və ya GitHub hesabınız vasitəsilə daxil olunduğu üçün həmin hesabın təhlükəsizliyi JSPath hesabınızın da təhlükəsizliyi deməkdir. Daxil olduğunuz hesab üzərində nəzarəti itirsəniz, ona sahib olan şəxs JSPath irəliləyişinizə də çata bilər.' },
          { p: 'Hesab məcburi deyil. Hesab cihazlar arasında irəliləyişin sinxronlaşdırılmasını, əlfəcinləri və nailiyyətləri əlavə edir; Pro abunəliyi də məhz hesaba bağlanır.' },
        ],
      },
      age: {
        heading: 'Minimum yaş həddi',
        blocks: [
          { p: 'JSPath-dan istifadə etmək üçün ən azı {minimumAge} yaşınız olmalıdır. İstifadə etməklə bunu təsdiq etmiş olursunuz.' },
          { p: 'JSPath yaşı yoxlamır. Doğum tarixi soruşmur və heç bir yaş təsdiqi və ya valideyn razılığı prosesi işlətmir; buna görə bu, xidmətin yoxladığı bir şey deyil, istifadə şərtidir.' },
          { p: 'Operator hesabın {minimumAge} yaşından kiçik şəxsə aid olduğunu öyrənərsə, həmin hesab və onunla saxlanılan məlumatlar silinə və ya istifadəsi məhdudlaşdırıla bilər.' },
        ],
      },
      'guest-use': {
        heading: 'Hesabsız istifadə',
        blocks: [
          { p: 'JSPath-dan qonaq kimi istifadə edə bilərsiniz. Tədris proqramına baxmaq, dərsləri oxumaq, arayış və xülasə vərəqlərindən istifadə etmək, kod meydançasında kod işlətmək və pulsuz tapşırıqları həll etmək — bunların heç biri hesab və ya girişi tələb etmir.' },
          { p: 'Qonaq kimi irəliləyişiniz yalnız istifadə etdiyiniz brauzerdə saxlanılır. O, heç yerə yüklənmir və heç bir kimliyə bağlanmır. Məlumat həmin cihazda qalır və brauzer məlumatlarını təmizləməklə silinir. Başqa brauzer və ya cihazda hər şey sıfırdan başlayır.' },
        ],
      },
      'acceptable-use': {
        heading: 'Məqbul istifadə',
        blocks: [
          { p: 'JSPath öyrənmək üçündür. Ondan qanuni şəkildə istifadə edin və aşağıdakılara yol verməyin:' },
          {
            ul: [
              'xidmətə və ya onun işlədiyi infrastruktura hücum etmək, onu həddindən artıq yükləmək və ya işini pozmaq',
              'giriş nəzarətlərini, hesaba daxil olmanı və ya pulsuz və ödənişli materialı ayıran yoxlamaları keçməyə cəhd etmək',
              'ödənişli Pro materialını şəxsi öyrənmə çərçivəsindən kənarda çıxarmaq, köçürmək, yenidən dərc etmək və ya yaymaq',
              'platformanı avtomatlaşdırılmış vasitələrlə onun işinə mane olacaq həcmdə toplamaq',
              'başqasının hesabından istifadə etmək və ya ödədiyiniz abunəlikdən başqalarının öz hesabı kimi istifadə etməsinə şərait yaratmaq',
              'kod icrası imkanlarından başqa sistemlərə hücum etmək, zərərli kod yerləşdirmək və ya yaymaq üçün istifadə etmək',
            ],
          },
          { p: 'Təhlükəsizlik problemi barədə məlumat vermək qarşılanır və layihənin təhlükəsizlik siyasətinə uyğun aparıldıqda bu şərtlərin pozulması sayılmır. Xidmətə zərər vuran və ya başqa istifadəçilərin məlumatına çatan sınaqlar isə buraya daxil deyil.' },
        ],
      },
      'learning-content': {
        heading: 'Tədris materialı haqqında',
        blocks: [
          { p: 'JSPath-dakı dərslər, izahlar, tapşırıqlar, həllər və müsahibə materialları tədris xarakterlidir. Onlar JavaScript-in necə işlədiyini və onun məntiqini başa salmaq üçün yazılıb.' },
          { p: 'JSPath heç bir nəticəyə zəmanət vermir. Tədris proqramını tamamlamaq, tapşırıqları həll etmək və ya müsahibə bazasını işləmək işə düzəlməyə, müsahibə nəticəsinə, sertifikata, ixtisas dərəcəsinə və ya hər hansı gəlir səviyyəsinə zəmanət vermir.' },
          { p: 'Kod nümunələri anlayışı aydınlaşdırmaq üçün yazılıb, olduğu kimi real məhsula köçürülmək üçün deyil. Real sistemlərin öz tələbləri olur — səhvlərin idarə edilməsi, təhlükəsizlik, məhsuldarlıq, əlçatanlıq, brauzer dəstəyi — və nümunəni bu tələblərə uyğunlaşdırmaq sizin məsuliyyətinizdir. Yazdığınız və işlətdiyiniz koda görə siz cavabdehsiniz.' },
        ],
      },
      'free-and-pro': {
        heading: 'Pulsuz və Pro giriş',
        blocks: [
          { p: 'Hər planın nəyi əhatə etdiyi qiymət səhifəsində göstərilir və xidmətin özü tərəfindən tətbiq olunur. Ödənişli material serverdə saxlanılır və yalnız abunəliyiniz yoxlanıldıqdan sonra verilir; buna görə Pro materialı pulsuz istifadəçinin yüklədiyi tətbiqin içində ümumiyyətlə olmur.' },
          { p: 'Hansı materialın pulsuz, hansının Pro olması platforma böyüdükcə dəyişə bilər. Artıq ödənişli olan material aktiv Pro abunəliyinin üzərinə əlavə ödəniş tələb edən formaya keçirilməyəcək.' },
        ],
      },
      subscriptions: {
        heading: 'Abunəlik və ödəniş',
        blocks: [
          { p: 'JSPath Pro aylıq və ya illik təkrarlanan abunəlik kimi satılır. Cari qiymətlər ödəniş səhifəsində göstərilir.' },
          { p: 'Ödənişləri Gumroad idarə edir və JSPath Pro üçün rəsmi satıcı qismində çıxış edir. Ödəniş prosesi, kart məlumatları, hesablaşma və abunəliyin yenilənməsi Gumroad-ın öz şərtləri altında Gumroad tərəfində baş verir. JSPath kart məlumatlarınızı nə alır, nə də saxlayır.' },
          { p: 'JSPath-dan ödənişə keçdiyiniz zaman alışın hesabınızla uzlaşdırıla bilməsi üçün e-poçt ünvanınız və JSPath hesab identifikatorunuz Gumroad-a ötürülür. Sonra JSPath Gumroad-ın bildirdiyi abunəlik vəziyyətini qeyd edir: plan, abunəliyin aktiv olub-olmaması, ödənilmiş dövrün bitmə tarixi və ləğv edilib-edilmədiyi.' },
          { p: 'Abunəliyiniz ləğv edilənə qədər seçdiyiniz dövriyyə üzrə avtomatik yenilənir.' },
        ],
      },
      cancellation: {
        heading: 'Ləğv etmə',
        blocks: [
          { p: 'Pro abunəliyini istənilən vaxt Gumroad vasitəsilə — alışınızın saxlandığı Gumroad kitabxanasından — ləğv edə bilərsiniz. JSPath ora tənzimləmələr səhifəsindən keçid verir.' },
          { p: 'Ləğv etmək növbəti yenilənməni dayandırır. Girişinizi dərhal bitirmir: Pro artıq ödədiyiniz dövrün sonuna qədər açıq qalır və JSPath abunəlik başa çatana qədər həmin tarixi göstərir. Tarix keçdikdən sonra hesab pulsuz plana qayıdır və bütün tədris irəliləyişini saxlayır.' },
          { p: 'Ləğv etmək pulun geri qaytarılmasını tələb etmək demək deyil. Geri Qaytarma Siyasətinə baxın.' },
        ],
      },
      refunds: {
        heading: 'Ödənişin geri qaytarılması',
        blocks: [
          { p: 'Geri qaytarma məsələləri bu şərtlərin tərkib hissəsi olan JSPath Geri Qaytarma Siyasəti ilə tənzimlənir. Geri qaytarma ilə bağlı iki sənəd arasında fərq görünərsə, Geri Qaytarma Siyasəti tətbiq olunur.' },
        ],
      },
      'third-parties': {
        heading: 'JSPath-ın istifadə etdiyi xidmətlər',
        blocks: [
          { p: 'JSPath başqa şirkətlərin işlətdiyi xidmətlər üzərində qurulub və JSPath-dan istifadə həmin xidmətlərin də işə qoşulması deməkdir:' },
          {
            ul: [
              'Supabase — hesablar, irəliləyişinizi və abunəlik vəziyyətinizi saxlayan verilənlər bazası və ödənişli materialı verən server funksiyaları',
              'Vercel — tətbiqin yerləşdirilməsi və çatdırılması',
              'Google və GitHub — hesab yaratmağı seçsəniz, hesaba giriş',
              'Gumroad — ödəniş prosesi, abunəliklər və ödənişlərin idarə edilməsi',
            ],
          },
          { p: 'Bunların hər birinin öz şərtləri və öz məxfilik qaydaları var və JSPath onlara nəzarət etmir. Onlardan hər hansı birində baş verən nasazlıq və ya dəyişiklik JSPath-a təsir edə bilər.' },
        ],
      },
      'intellectual-property': {
        heading: 'Mülkiyyət',
        blocks: [
          { p: 'JSPath — mənbə kodu, yazılı tədris materialları, tapşırıqları, çağırışları, layihələri, müsahibə materialları, arayışı və xülasə vərəqləri, dizaynı və brendi — müəllifinə məxsusdur və açıq mənbəli deyil. JSPath-dan istifadə sizə ondan şəxsən öyrənmək icazəsi verir. Bu, onu köçürmək, yenidən dərc etmək, satmaq, əsasında rəqib məhsul qurmaq və ya törəmə əsərlər yaratmaq hüququ vermir.' },
          { p: 'Yazdığınız kod sizin olaraq qalır. Kod meydançasına, tapşırığa, çağırışa və ya layihəyə yazdığınız hər şey — həmçinin kod parçası kimi saxladıqlarınız — sizə məxsusdur. JSPath onlar üzərində mülkiyyət iddia etmir və onları sizin üçün icra etməkdən və irəliləyişinizi saxlamaqdan başqa heç bir məqsədlə istifadə etmir.' },
          { p: 'Standart JavaScript sintaksisi, ümumi işlənən yanaşmalar və özünüzün gəldiyiniz həllər heç kimin mülkiyyəti sayılmır.' },
        ],
      },
      availability: {
        heading: 'Əlçatanlıq',
        blocks: [
          { p: 'JSPath olduğu kimi təqdim olunur və zəmanətli iş vaxtı öhdəliyi daşımır. Texniki xidmət zamanı, asılı olduğu xidmətlərdən birində nasazlıq baş verdikdə və ya kimsənin nəzarətində olmayan səbəblərdən əlçatmaz ola bilər.' },
          { p: 'Qonaq rejimi və pulsuz materialın böyük hissəsi tətbiqi artıq yükləmiş brauzerdə oflayn işləməyə davam edir; lakin hesaba giriş, irəliləyişin sinxronlaşdırılması və ödənişli material işlək internet bağlantısı tələb edir.' },
        ],
      },
      'service-changes': {
        heading: 'JSPath-dakı dəyişikliklər',
        blocks: [
          { p: 'JSPath fəal şəkildə inkişaf etdirilir. Funksiyalar, material və səhifə quruluşu dəyişir; bəzi hissələr əlavə edilə, yenidən işlənə və ya silinə bilər.' },
          { p: 'Dəyişiklik aktiv Pro abunəliyindən əhəmiyyətli bir hissəni çıxaracaqsa, praktiki cəhətdən mümkün olduğu hallarda əvvəlcədən məlumat veriləcək.' },
        ],
      },
      'terms-changes': {
        heading: 'Şərtlərdəki dəyişikliklər',
        blocks: [
          { p: 'Bu şərtlər yenilənə bilər — məsələn, platformaya yeni funksiya əlavə olunduqda, provayder dəyişdikdə və ya məlumatların işlənmə qaydası dəyişdikdə. Səhifənin yuxarısındakı tarix cari versiyanın nə vaxt dərc olunduğunu göstərir.' },
          { p: 'Yenilikdən sonra JSPath-dan istifadəni davam etdirmək yenilənmiş şərtlərin sizə şamil olunması deməkdir. Dəyişiklik əhəmiyyətli olduqda, praktiki cəhətdən mümkün olan hallarda tətbiq daxilində məlumat veriləcək.' },
        ],
      },
      suspension: {
        heading: 'Dayandırma və xitam',
        blocks: [
          { p: 'JSPath-dan istifadəni istənilən vaxt dayandıra, abunəliyi isə istənilən vaxt ləğv edə bilərsiniz.' },
          { p: 'Giriş zəruri hallarda dayandırıla və ya sonlandırıla bilər: qanunsuz istifadə, xidmətə hücum, ödənişli materialın qorunmasını qəsdən aşmaq cəhdi, Pro materialının kütləvi yayılması, yaxud digər istifadəçiləri və ya platformanı riskə atan davranış. Şərait imkan verdikdə əvvəlcə xəbərdarlıq edilir və cavab tədbiri baş verənə mütənasib olur.' },
          { p: 'Abunəlik davam edərkən giriş bu səbəblərdən biri ilə sonlandırılarsa, bu, öz-özlüyündə qalan dövrün geri qaytarılması hüququ vermir — istehlakçı qanunvericiliyi başqa hal nəzərdə tutmadıqda.' },
        ],
      },
      liability: {
        heading: 'Zəmanətlərdən imtina və məsuliyyət',
        blocks: [
          { p: 'JSPath «olduğu kimi» və «mövcud olduğu şəkildə» təqdim edilir. Materialı diqqətlə yazılır və yoxlanılır, lakin onun səhvsiz, tam, hər zaman güncəl və ya sizin nəzərdə tutduğunuz konkret məqsəd üçün yararlı olacağına dair vəd verilmir.' },
          { p: 'Tətbiq olunan qanunvericiliyin icazə verdiyi həddə, JSPath dolayı və ya törəmə zərərə, itirilmiş gəlirə və imkanlara, öz nüsxənizi saxlamadığınız halda itirilmiş məlumatlara, habelə asılı olduğu üçüncü tərəf xidmətlərinin yaratdığı problemlərə görə məsuliyyət daşımır.' },
          { p: 'Bu şərtlərdə heç nə qanunla məhdudlaşdırıla bilməyən məsuliyyəti — o cümlədən ehtiyatsızlıq nəticəsində ölüm və ya bədən xəsarətinə, yaxud dələduzluğa görə məsuliyyəti — məhdudlaşdırmır və ölkənizin istehlakçı qanunvericiliyinin verdiyi, istisna edilməsinə yol verilməyən hüquqları aradan qaldırmır.' },
        ],
      },
      'governing-law': {
        heading: 'Tətbiq olunan qanunvericilik və mübahisələr',
        blocks: [
          { p: 'Bu şərtlər {governingLaw} qanunvericiliyi ilə tənzimlənir.' },
          { p: 'Aramızda həll edilə bilməyən mübahisələr {disputeVenue} səlahiyyətli məhkəmələrinə təqdim edilə bilər.' },
          { p: 'JSPath-dan istehlakçı kimi istifadə edirsinizsə, bunların heç biri sizi yaşadığınız ölkənin qanunvericiliyinin imperativ normalarının verdiyi müdafiədən, habelə tətbiq olunan qanunvericiliyin sizə orada iddia qaldırmaq hüququ verdiyi hallarda həmin hüquqdan məhrum etmir.' },
        ],
      },
      contact: {
        heading: 'Əlaqə',
        blocks: [
          { p: 'Bu şərtlərlə bağlı suallarınızı {email} ünvanına göndərə bilərsiniz.' },
        ],
      },
    },
  },

  /* ================================================================== *
   * Məxfilik Siyasəti
   * ================================================================== */
  privacy: {
    title: 'Məxfilik Siyasəti',
    intro:
      'Bu siyasət JSPath-ın nəyi saxladığını, harada saxladığını və kimlərin bu prosesə cəlb olunduğunu izah edir. O, hazır şablondan deyil, tətbiqin real iş məntiqindən yazılıb; buna görə nəyin saxlanıldığı və nəyin saxlanılmadığı konkret göstərilir.',
    sections: {
      scope: {
        heading: 'Bu siyasət nəyi əhatə edir',
        blocks: [
          { p: 'Bu siyasət JSPath tətbiqini və onun işlədiyi məlumatları əhatə edir. O, Google, GitHub, Gumroad, Supabase və Vercel xidmətlərini əhatə etmir — onların hər birinin öz məxfilik siyasəti var.' },
          { p: 'Siyasətin sizə nə dərəcədə aid olduğu JSPath-dan necə istifadə etdiyinizdən asılıdır. Heç vaxt hesaba daxil olmayan qonaq üçün buradakıların çox az hissəsi keçərlidir.' },
        ],
      },
      'guest-and-account': {
        heading: 'Qonaqlar və hesaba daxil olmuş istifadəçilər',
        blocks: [
          { p: 'JSPath iki rejimdə işləyir və bu rejimlər məlumatı çox fərqli şəkildə saxlayır.' },
          { p: 'Qonaq kimi hər şey brauzerinizdə qalır. İrəliləyişiniz, tənzimləmələriniz, kod meydançasındakı kodunuz və saxladığınız kod parçaları brauzerin lokal yaddaşına yazılır və heç yerə yüklənmir. Hesab mövcud olmur, heç nə sizi eyniləşdirmir və qonaq kimi etdikləriniz serverə çatmır.' },
          { p: 'Hesaba daxil olduqda tədris irəliləyişiniz cihazlar arasında sizi izləməsi üçün JSPath verilənlər bazasına sinxronlaşdırılır. Tədris məlumatınız məhz bu anda brauzerinizdən çıxır və hesabınıza bağlı şəkildə saxlanılır.' },
        ],
      },
      'account-data': {
        heading: 'Hesab məlumatları',
        blocks: [
          { p: 'Google və ya GitHub ilə daxil olduqda JSPath həmin provayderin qaytardığı profil məlumatlarını alır:' },
          {
            ul: [
              'e-poçt ünvanınız',
              'provayder təqdim edirsə, görünən adınız və ya istifadəçi adınız',
              'provayder təqdim edirsə, avatar şəklinizin ünvanı',
              'hansı provayderlə daxil olduğunuz və onun verdiyi hesab identifikatoru',
            ],
          },
          { p: 'JSPath Google və ya GitHub parolunuzu heç vaxt almır. Adınız və avatarınız kimin daxil olduğunu göstərmək üçün istifadə olunur. E-poçt ünvanınız hesabınızı müəyyən edir və Gumroad alışını hesabınıza bağlayan məhz odur.' },
        ],
      },
      'learning-data': {
        heading: 'Tədris məlumatları',
        blocks: [
          { p: 'Hesaba daxil olmuş istifadəçi üçün hər hesaba bir qeyd platformanın faydalı olması üçün yadda saxlamalı olduğu hər şeyi ehtiva edir:' },
          {
            ul: [
              'hansı dərsləri, tapşırıqları, testləri, çağırışları, layihələri və müsahibə suallarını açdığınız və tamamladığınız',
              'XP, ardıcıllıq günləri, gündəlik fəallıq və açılmış nailiyyətlər',
              'əlfəcinlər',
              'səhv cavablandırdığınız suallar — praktikanın onlara qayıda bilməsi üçün',
              'keçmisinizsə, səviyyə qiymətləndirmənizin nəticəsi',
              'ilkin tanışlıq zamanı qurduğunuz profil: görünən ad, özünüzə verdiyiniz səviyyə, məqsədlər və gündəlik vaxt hədəfi',
              'tənzimləmələriniz — interfeys dili, mövzu, hərəkətin azaldılması, mətn və redaktor ölçüsü, gündəlik hədəf',
            ],
          },
          { p: 'Bu qeydi yalnız aid olduğu hesab oxuya və dəyişə bilər. Bu, təkcə tətbiq tərəfindən deyil, verilənlər bazasının özü tərəfindən tətbiq olunur; yəni bir istifadəçi digərinin qeydinə çata bilmir.' },
          { p: 'Kod meydançasındakı kod və saxlanılmış kod parçaları bu qeydin tərkibinə daxil deyil. Onlar brauzerinizdə qalır.' },
        ],
      },
      'billing-data': {
        heading: 'Ödəniş məlumatları',
        blocks: [
          { p: 'JSPath ödənişləri emal etmir və kartınızı heç vaxt görmür. Ödəniş prosesini, kart məlumatlarını, abunəliyin yenilənməsini və ödənişlərin idarə edilməsini rəsmi satıcı qismində Gumroad həyata keçirir.' },
          { p: 'Ödənişə başladığınız zaman alışın hesabınızla uzlaşdırılması üçün JSPath e-poçt ünvanınızı və JSPath hesab identifikatorunuzu Gumroad-a ötürür. Geri qayıdan və saxlanılan məlumat ödəniş təfərrüatı deyil, abunəlik vəziyyətidir:' },
          {
            ul: [
              'plan və hesablaşma dövriyyəsi',
              'abunəliyin vəziyyəti — aktiv, ləğv olunur, müddəti bitib, gecikib, geri qaytarılıb və ya ləğv edilib',
              'abunəliyin başlama tarixi və ödənilmiş dövrün bitmə tarixi',
              'cari dövrün sonunda bitəcəyinin qeyd olunub-olunmaması',
              'Gumroad-ın abunəlik, satış və məhsul üçün istifadə etdiyi identifikatorlar',
              'alışın həyata keçirildiyi e-poçt ünvanı',
            ],
          },
          { p: 'JSPath həmçinin aldığı hər ödəniş bildirişinin qısa qeydini saxlayır ki, eyni hadisə iki dəfə emal olunmasın. Bu qeyddə hadisənin növü, aid olduğu obyektin identifikatoru və mesajın kriptoqrafik barmaq izi saxlanılır — mesajın özü isə qəsdən saxlanılmır.' },
        ],
      },
      'technical-data': {
        heading: 'Texniki məlumatlar',
        blocks: [
          { p: 'JSPath öz jurnal, monitorinq və ya diaqnostika sistemini işlətmir və sizin haqqınızda cihaz və ya brauzer məlumatı toplamır.' },
          { p: 'İstənilən veb-saytın çatdırılması serverin sorğunu görməsi deməkdir. JSPath-ın işlədiyi provayderlər — yerləşdirmə üçün Vercel, hesablar və verilənlər bazası üçün Supabase — sorğuya cavab vermək üçün IP ünvanınız kimi bağlantı məlumatlarını zəruri olaraq emal edir və bunu öz məxfilik siyasətləri çərçivəsində edirlər. JSPath bu məlumatı toplu şəkildə almır, onun əsasında profil qurmur və onu tədris fəaliyyətinizlə əlaqələndirmir.' },
        ],
      },
      'browser-storage': {
        heading: 'Brauzerinizdə nə saxlanılır',
        blocks: [
          { p: 'JSPath brauzerinizin lokal yaddaşından istifadə edir. Orada bunlar saxlanılır:' },
          {
            ul: [
              'tədris irəliləyişiniz — qonaqsınızsa, onun yeganə nüsxəsi',
              'interfeys tərcihləriniz, o cümlədən mövzu və dil',
              'kod meydançasındakı ən son kodunuz',
              'kod meydançasında saxladığınız kod parçaları',
              'hesaba daxil olmusunuzsa, sizi sistemdə saxlayan sessiya tokeni',
            ],
          },
          { p: 'Bunların hamısını brauzer tənzimləmələrindən silə bilərsiniz; JSPath-ın öz tənzimləmələr səhifəsi isə saxladığı tədris məlumatlarını sıfırlaya bilər. Lokal yaddaş əlçatan olmadıqda — məxfi pəncərədə və ya onu bloklayan brauzerdə — JSPath eyni məlumatı həmin ziyarət müddətində yaddaşda saxlayır və tətbiq işləməyə davam edir.' },
          { p: 'Ödənişli Pro materialı qəsdən heç vaxt brauzer yaddaşına yazılmır. O, lazım olduqda alınır və yalnız operativ yaddaşda saxlanılır ki, hesabdan çıxdıqdan sonra ortaq kompüterdə qalmasın.' },
        ],
      },
      'third-parties': {
        heading: 'Prosesə kimlər cəlb olunur',
        blocks: [
          { p: 'JSPath səhifəsinin əlaqə saxladığı üçüncü tərəflərin tam siyahısı belədir:' },
          {
            ul: [
              'Supabase — hesablar, irəliləyişi və abunəlik vəziyyətini saxlayan verilənlər bazası və ödənişli materialı verən server funksiyaları',
              'Vercel — yerləşdirmə və məzmunun çatdırılması',
              'Google — seçsəniz, hesaba giriş; həmçinin interfeysdə istifadə olunan şriftləri təqdim edən Google Fonts',
              'GitHub — seçsəniz, hesaba giriş',
              'Gumroad — ödəniş prosesi, abunəliklər və ödənişlərin idarə edilməsi',
              'jsDelivr — brauzerdəki kod redaktorunu çatdıran açıq şəbəkə',
            ],
          },
          { p: 'Google və GitHub burada giriş provayderi, Google Fonts və jsDelivr isə brauzerinizə fayl çatdırma vasitəsi kimi iştirak edir. Onların heç biri JSPath-ın reklam və ya analitika tərəfdaşı deyil. Şriftin və ya redaktor faylının sorğulanması həmin faylı çatdıran şəbəkənin sorğunu görməsi deməkdir — brauzerin başqa domendən yüklədiyi istənilən fayl kimi.' },
          { p: 'JSPath şəxsi məlumatları satmır və bunu edə biləcəyi bir mexanizmi yoxdur. Məlumatlarınızı reklamçılara, məlumat brokerlərinə və ya marketinq xidmətlərinə vermir, çünki onların heç biri ilə işləmir.' },
        ],
      },
      cookies: {
        heading: 'Kukilər və izləmə',
        blocks: [
          { p: 'JSPath kuki yerləşdirmir. Onun analitikası, telemetriyası, reklam və ya ölçmə etiketləri, sessiya yazısı və heç bir formada saytlararası izləməsi yoxdur. Sizi saytlar arasında izləyən bir şey yoxdur və sizin haqqınızda profil qurulmur.' },
          { p: 'JSPath-ın lokal olaraq saxladıqları yuxarıda təsvir olunub: bunlar sizin öz irəliləyişiniz və tərcihlərinizdir, tətbiqin onları xatırlaya bilməsi üçün brauzerinizdə saxlanılır və sizi izləmək üçün istifadə olunmur. JSPath-ın kuki razılığı bildirişi göstərməməsinin səbəbi də budur — razılıq veriləcək bir şey yoxdur.' },
        ],
      },
      security: {
        heading: 'Təhlükəsizlik',
        blocks: [
          { p: 'JSPath məlumatlarınızın sizə aid qalması üçün nəzərdə tutulmuş giriş nəzarətləri ilə qurulub. Hər istifadəçinin irəliləyiş qeydi yalnız həmin istifadəçi üçün əlçatandır və bu, verilənlər bazası səviyyəsində tətbiq olunur. Abunəlik qeydlərini sahibi oxuya bilər, yazmaq isə yalnız server tərəfindən mümkündür. Ödənişli material abunəliyinizi brauzerin təsir edə bilmədiyi qeydlərlə tutuşduran server funksiyası tərəfindən verilir və sorğuda yoxlanıla bilməyən bir şey varsa, funksiya imtina edir.' },
          { p: 'Tətbiq məzmun təhlükəsizliyi siyasəti və əlaqəli qoruma vasitələri ilə təqdim olunur; istifadəçi kodu isə səhifənin özündə deyil, təcrid olunmuş mühitdə icra edilir.' },
          { p: 'Bu tədbirlər riski azaltmaq üçün nəzərdə tutulub. Heç bir onlayn xidmət məlumatların tam təhlükəsizliyinə söz verə bilməz və JSPath də belə bir söz vermir.' },
        ],
      },
      'your-controls': {
        heading: 'Sizin idarəetmə imkanlarınız',
        blocks: [
          { p: 'JSPath daxilində bunları edə bilərsiniz:' },
          {
            ul: [
              'platformadan qonaq kimi istifadə etmək — hesabsız və heç nə yüklənmədən',
              'hesabdan çıxmaq, bu da həmin cihazdakı sessiyanı bitirir',
              'interfeys dilini, mövzunu və digər tərcihləri istənilən vaxt dəyişmək',
              'tədris irəliləyişinizi özünüzdə saxlayacağınız fayl kimi ixrac etmək',
              'irəliləyiş faylını geri idxal etmək',
              'tədris məlumatlarınızı sıfırlamaq — bu, məlumatı brauzerdə təmizləyir və hesaba daxil olmusunuzsa, saxlanılan qeydi boş qeydlə əvəz edir',
              'abunəliyinizi tənzimləmələrdən keçidlə Gumroad vasitəsilə idarə etmək və ya ləğv etmək',
            ],
          },
        ],
      },
      retention: {
        heading: 'Məlumatlar nə qədər saxlanılır',
        blocks: [
          { p: 'JSPath hazırda sabit saxlanma müddəti qrafiki tətbiq etmir və bu siyasət belə bir qrafikin mövcudluğunu iddia etmir.' },
          { p: 'Praktikada belədir: tədris qeydiniz hesabınız mövcud olduğu müddətdə saxlanılır, çünki bu, sizin irəliləyişinizdir. Abunəlik qeydləri hesabın hansı girişə malik olduğunu müəyyən etmək üçün lazım olduğu müddətdə saxlanılır. Qonaq məlumatları brauzerinizdə yaşayır və orada saxladığınız müddət qədər qalır. Tənzimləmələrdən tədris məlumatlarını sıfırlamaq onları dərhal təmizləyir.' },
          { p: 'Verilənlər bazası elə qurulub ki, hesabın silinməsi ona bağlı tədris və abunəlik qeydlərini də silir.' },
        ],
      },
      'your-rights': {
        heading: 'Hüquqlarınız',
        blocks: [
          { p: 'Yaşadığınız yerdən asılı olaraq, tətbiq olunan qanunvericilik sizə haqqınızdakı şəxsi məlumatlar üzərində hüquqlar verə bilər — adətən nəyin saxlanıldığını öyrənmək, düzəliş etdirmək, silinməsini tələb etmək, nüsxəsini almaq və ya bəzi istifadələrə etiraz etmək.' },
          { p: 'Bunların bir qismini birbaşa özünüz həyata keçirə bilərsiniz: tənzimləmələrdəki ixrac tədris məlumatlarınızın nüsxəsini verir, sıfırlama isə onları təmizləyir. Digərləri üçün müraciət etmək lazımdır.' },
          { p: 'Bu siyasət JSPath-ın məlumatları necə işlədiyinin təsviridir. O, sertifikat deyil və burada JSPath-ın hər hansı məxfilik çərçivəsi üzrə auditdən keçdiyi və ya sertifikatlaşdırıldığı iddia edilmir.' },
        ],
      },
      'policy-changes': {
        heading: 'Bu siyasətdəki dəyişikliklər',
        blocks: [
          { p: 'JSPath-ın məlumatlarla nə etdiyi dəyişdikdə — yeni provayder, yeni saxlanılan sahə, çatdırılma qaydasında dəyişiklik — bu siyasət yenilənəcək. Səhifənin yuxarısındakı tarix cari versiyanın nə vaxt dərc olunduğunu göstərir.' },
          { p: 'Siyasət JSPath-ın etmədiyi bir şeyi təsvir etmək üçün yenilənməyəcək. Buradakı hər hansı bölmə proqram təminatına uyğun gəlməyi dayandırarsa, ya proqram, ya da bölmə səhvdir və bu barədə məlumat verilməlidir.' },
        ],
      },
      deletion: {
        heading: 'Hesabınızın silinməsi',
        blocks: [
          { p: 'JSPath hesabınızı özünüz silə bilərsiniz: Tənzimləmələr bölməsindəki "Təhlükəli əməliyyatlar" hissəsindən. Silinmə brauzerinizdə deyil, serverdə həyata keçirilir və yalnız daxil olduğunuz hesaba şamil olunur.' },
          { p: 'Hesabın silinməsi hesabı və onunla saxlanılan tədris qeydini - tamamlanmış dərsləri, XP-ni, ardıcıllıq günlərini, əlfəcinləri, nailiyyətləri, səviyyə qiymətləndirməsinin nəticəsini, ilkin profili və tənzimləmələri - habelə həmin hesaba aid abunəlik qeydlərini silir. İstifadə etdiyiniz brauzerdə saxlanılan JSPath məlumatları da eyni anda təmizlənir.' },
          { p: 'Abunəlik hələ də yenilənə bilirsə, siz onu Gumroad-da ləğv edənə qədər silinmə rədd edilir. JSPath Gumroad abunəliyini sizin əvəzinizə ləğv edə bilmir və hesabı əvvəlcə silmək arxasında hesab olmayan bir ödənişin davam etməsinə gətirib çıxarardı.' },
          { p: 'Bəzi şeylər JSPath-ın əli çatan hüdudlardan kənardadır:' },
          {
            ul: [
              'Gumroad öz alış və ödəniş qeydlərini öz siyasəti və öz hüquqi öhdəlikləri çərçivəsində saxlayır. JSPath hesabının silinməsi geri qaytarma demək deyil.',
              'Google və GitHub öz hesab qeydlərini saxlayır. JSPath hesabınızın silinməsi daxil olduğunuz hesaba təsir etmir.',
              'JSPath ödəniş bildirişinin iki dəfə emal olunmaması üçün kiçik bir hadisə jurnalı saxlayır. Orada hadisənin növü, provayder istinadı və mesajın kriptoqrafik barmaq izi var; nə hesabınıza, nə də sizə istinad daşımır.',
            ],
          },
          { p: 'Silinmə ilə bağlı suallarınızı {email} ünvanına göndərə bilərsiniz.' },
        ],
      },
      children: {
        heading: 'Yaş',
        blocks: [
          { p: 'JSPath {minimumAge} yaş və yuxarı istifadəçilər üçün nəzərdə tutulub və bilərəkdən daha kiçik yaşlılara təqdim edilmir.' },
          { p: 'JSPath yaşı yoxlamır. Doğum tarixi soruşmur və valideyn razılığı prosesi işlətmir.' },
          { p: 'Operator hesabın {minimumAge} yaşından kiçik şəxs tərəfindən yaradıldığını öyrənərsə, həmin hesab və onunla saxlanılan məlumatlar silinə və ya istifadəsi məhdudlaşdırıla bilər.' },
        ],
      },
      contact: {
        heading: 'Əlaqə',
        blocks: [
          { p: 'Məxfiliklə bağlı sual və müraciətlərinizi {email} ünvanına göndərə bilərsiniz. Haqqınızda nəyin saxlanıldığını soruşmaq, düzəliş tələb etmək, silinmə barədə soruşmaq və ya tətbiq olunan qanunvericiliyin sizə verdiyi digər məlumat hüquqları üzrə müraciət etmək üçün kanal budur.' },
          { p: 'Zəhmət olmasa parol, giriş tokeni və ya kart məlumatlarının tam nüsxəsini göndərməyin. Onlara heç vaxt ehtiyac yoxdur və JSPath onlardan istifadə etmir.' },
          { p: 'Burada sabit cavab müddəti vəd edilmir. Müraciətlərə praktiki cəhətdən mümkün olan ən qısa müddətdə baxılır.' },
        ],
      },
    },
  },

  /* ================================================================== *
   * Geri Qaytarma Siyasəti
   * ================================================================== */
  refund: {
    title: 'Geri Qaytarma Siyasəti',
    intro:
      'Bu siyasət JSPath Pro üçün ödənişin necə işlədiyini, ləğv etməyin nə demək olduğunu və ödəniş geri qaytarıldıqda nə baş verdiyini izah edir.',
    sections: {
      scope: {
        heading: 'Bu siyasət nəyi əhatə edir',
        blocks: [
          { p: 'Bu siyasət JSPath Pro abunəliklərinə şamil olunur. JSPath-ın pulsuz təklif etdiyi hər şey pulsuzdur və buradakılar ona aid deyil.' },
        ],
      },
      'who-you-pay': {
        heading: 'Ödənişi kimə edirsiniz',
        blocks: [
          { p: 'JSPath Pro Gumroad vasitəsilə satılır və alış üzrə rəsmi satıcı Gumroad-dır. Ödənişiniz Gumroad-a gedir, kart məlumatlarınızı Gumroad idarə edir və abunəliyiniz Gumroad kitabxananızda saxlanılır.' },
          { p: 'Bu, geri qaytarma üçün əhəmiyyətlidir: pulu onu qəbul edən tərəf qaytarır. Pro-ya girişi JSPath, ödənişin özünü isə Gumroad idarə edir.' },
        ],
      },
      'cancellation-is-not-a-refund': {
        heading: 'Ləğv etmək geri qaytarma demək deyil',
        blocks: [
          { p: 'Bunlar iki fərqli şeydir və hansını istədiyinizi dəqiqləşdirmək faydalıdır.' },
          { p: 'Ləğv etmək abunəliyin yenilənməsini dayandırır. Artıq etdiyiniz ödənişi qaytarmır və girişinizi vaxtından əvvəl kəsmir — Pro ödədiyiniz dövrün sonuna qədər açıq qalır və JSPath həmin tarixi sizə göstərir. Tarix keçdikdən sonra hesabınız pulsuz plana keçir və bütün tədris irəliləyişini tam saxlayır.' },
          { p: 'Geri qaytarma isə ödənişin geri verilməsidir. Bu, ayrıca müraciətdir və siyasətin qalan hissəsi ona aiddir.' },
          { p: 'Sadəcə ödəniş etməyi dayandırmaq istəyirsinizsə, ləğv etmək kifayətdir və artıq ödədiyiniz heç nəyi itirmirsiniz.' },
        ],
      },
      'access-after-a-refund': {
        heading: 'Girişinizlə nə olur',
        blocks: [
          { p: 'Ödəniş geri qaytarıldıqda abunəlik Pro girişi verməyi dayandırır. JSPath geri qaytarılma vəziyyətini qeyd edir və hesab, adətən geri qaytarma bildirildikdən qısa müddət sonra, pulsuz plana qayıdır.' },
          { p: 'Tədris irəliləyişinizə toxunulmur. Tamamladığınız dərslər, XP, ardıcıllıq günləri, nailiyyətlər və əlfəcinlər yerində qalır və pulsuz plandakı hər şey sizə açıq olur. Yalnız Pro materialı bağlanır.' },
        ],
      },
      'payment-problems': {
        heading: 'Ödəniş və ya giriş problemləri',
        blocks: [
          { p: 'Bəzən ödəniş uğurla keçir, lakin Pro açılmır. Bu, adətən uzlaşdırma problemidir — çox vaxt alışın JSPath hesabınızdan fərqli e-poçt ünvanı ilə edilməsi, çünki alışı hesaba bağlayan məhz həmin ünvandır.' },
          { p: 'JSPath abunəlik vəziyyətini Gumroad ilə yenidən tutuşdurur, ona görə bir neçə dəqiqəlik gözləmə çox vaxt problemi özü həll edir. Hesabdan çıxıb yenidən daxil olmaq da vəziyyəti yeniləyir.' },
          { p: 'Pro yenə də açılmayıbsa, bu, geri qaytarma məsələsindən əvvəl dəstək məsələsidir və adətən həll oluna bilir — uyğun gəlməyən e-poçt ünvanı ödənişin itməsi demək deyil. Eyni abunəlik üçün iki dəfə ödəniş tutulması halında da belədir. Ödəniş etdiyiniz ünvanla və varsa, Gumroad qəbzi ilə birlikdə {email} ünvanına yazın.' },
        ],
      },
      'statutory-rights': {
        heading: 'İstehlakçı qanunvericiliyi üzrə hüquqlarınız',
        blocks: [
          { p: 'Ölkənizin istehlakçı qanunvericiliyi sizə siyasətin əlindən ala bilmədiyi ləğvetmə və ya geri qaytarma hüquqları verə bilər — məsələn, onlayn alınmış məhsul üçün qanunla müəyyən edilmiş imtina müddəti.' },
          { p: 'Bu siyasətdə heç nə tətbiq olunan istehlakçı qanunvericiliyi üzrə istisna edilə bilməyən hüquqları məhdudlaşdırmır. Siyasət və məcburi qanuni hüquq bir-birinə zidd olarsa, qanuni hüquq üstünlük təşkil edir.' },
          { p: 'Rəsmi satıcı kimi Gumroad-ın öz geri qaytarma qaydaları var, ödəniş provayderi də öz mübahisə həlli prosedurunu təklif edə bilər. Bunlar bu siyasətdən asılı olmayaraq mövcuddur.' },
        ],
      },
      'policy-changes': {
        heading: 'Bu siyasətdəki dəyişikliklər',
        blocks: [
          { p: 'Bu siyasət, xüsusilə ödəniş provayderi və ya abunəlik modeli dəyişdikdə, yenilənə bilər. Səhifənin yuxarısındakı tarix cari versiyanın nə vaxt dərc olunduğunu göstərir. Alış edildiyi anda qüvvədə olan siyasət həmin alışa şamil edilir.' },
        ],
      },
      eligibility: {
        heading: 'Geri qaytarma hansı hallarda mümkündür',
        blocks: [
          { p: 'İlkin uyğun Pro alışının geri qaytarılması alış tarixindən sonrakı {refundDays} təqvim günü ərzində tələb edilə bilər. İş günü deyil, təqvim günü: həftəsonları və bayramlar da sayılır.' },
          { p: 'Yenilənmə ödənişləri bir qayda olaraq geri qaytarılmır. Abunəlik əvvəlcədən bildiyiniz tarixdə yenilənir və həmin tarixdən əvvəl ləğv etmək ödənişin qarşısını alır - ödənişi dayandırmağın nəzərdə tutulan yolu budur.' },
          { p: 'İstisna hallarda yenilənmə müraciətlərinə fərdi qaydada baxılır. Vəziyyətiniz qeyri-adidirsə, əlaqə saxlamağa dəyər, lakin fərdi baxış məhz odur: nəticə vəd edilmir və burada yenilənmələr üçün ikinci bir {refundDays} günlük müddət yaradılmır.' },
          { p: 'Bunların heç biri istehlakçı qanunvericiliyi üzrə istisna edilə bilməyən hüquqlarınıza təsir etmir. Aşağıya baxın.' },
        ],
      },
      'how-to-request': {
        heading: 'Geri qaytarma üçün müraciət',
        blocks: [
          { p: 'Müraciətinizi {email} ünvanına göndərin.' },
          { p: 'Ödənişin müəyyən edilməsi üçün kifayət qədər məlumat əlavə edin: alışın həyata keçirildiyi e-poçt ünvanı və varsa, Gumroad qəbzi və ya sifariş nömrəsi. Nəyin səhv getdiyini bir cümlə ilə yazmaq da kömək edir, xüsusən problem Pro-nun ümumiyyətlə açılmaması olduqda.' },
          { p: 'Heç vaxt parolunuzu, giriş tokenini və ya kart məlumatlarının tam nüsxəsini göndərməyin. Onlar ödənişi müəyyən etmək üçün lazım deyil və heç kimə e-poçtla göndərilməməlidir.' },
        ],
      },
      contact: {
        heading: 'Əlaqə',
        blocks: [
          { p: 'Geri qaytarma və ödənişlə bağlı suallarınızı {email} ünvanına göndərə bilərsiniz.' },
        ],
      },
    },
  },
};
