package com.path.parish.seeder;

import com.path.parish.model.*;
import com.path.parish.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final NavigationItemRepository navigationItemRepository;
    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;
    private final AnnouncementRepository announcementRepository;
    private final ParishEventRepository parishEventRepository;
    private final PriestRepository priestRepository;
    private final HistoryMilestoneRepository historyMilestoneRepository;
    private final GalleryAlbumRepository galleryAlbumRepository;
    private final GalleryImageRepository galleryImageRepository;
    private final SiteSettingRepository siteSettingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            AdminUserRepository adminUserRepository,
            NavigationItemRepository navigationItemRepository,
            PageRepository pageRepository,
            PageSectionRepository pageSectionRepository,
            AnnouncementRepository announcementRepository,
            ParishEventRepository parishEventRepository,
            PriestRepository priestRepository,
            HistoryMilestoneRepository historyMilestoneRepository,
            GalleryAlbumRepository galleryAlbumRepository,
            GalleryImageRepository galleryImageRepository,
            SiteSettingRepository siteSettingRepository,
            PasswordEncoder passwordEncoder) {
        this.adminUserRepository = adminUserRepository;
        this.navigationItemRepository = navigationItemRepository;
        this.pageRepository = pageRepository;
        this.pageSectionRepository = pageSectionRepository;
        this.announcementRepository = announcementRepository;
        this.parishEventRepository = parishEventRepository;
        this.priestRepository = priestRepository;
        this.historyMilestoneRepository = historyMilestoneRepository;
        this.galleryAlbumRepository = galleryAlbumRepository;
        this.galleryImageRepository = galleryImageRepository;
        this.siteSettingRepository = siteSettingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedNavigation();
        seedPagesAndSections();
        seedAnnouncements();
        seedEvents();
        seedPriests();
        seedHistory();
        seedGallery();
        seedSiteSettings();
    }

    private void seedAdminUser() {
        if (!adminUserRepository.existsByEmail("admin@path.org")) {
            AdminUser admin = new AdminUser();
            admin.setFullName("Parish Administrator");
            admin.setEmail("admin@path.org");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            admin.setStatus("ACTIVE");
            adminUserRepository.save(admin);
        }
    }

    private void seedNavigation() {
        if (navigationItemRepository.count() == 0) {
            // 1. Home
            NavigationItem home = new NavigationItem();
            home.setLabel("Home");
            home.setDestinationType("INTERNAL");
            home.setTargetPath("/");
            home.setDisplayOrder(0);
            home.setIsVisible(true);
            navigationItemRepository.save(home);

            // 2. Announcements
            NavigationItem announcements = new NavigationItem();
            announcements.setLabel("Announcements");
            announcements.setDestinationType("INTERNAL");
            announcements.setTargetPath("/announcements");
            announcements.setDisplayOrder(1);
            announcements.setIsVisible(true);
            navigationItemRepository.save(announcements);

            // 3. About (Dropdown trigger)
            NavigationItem about = new NavigationItem();
            about.setLabel("About");
            about.setDestinationType("DROPDOWN_PARENT");
            about.setTargetPath("/about");
            about.setDisplayOrder(2);
            about.setIsVisible(true);
            about = navigationItemRepository.save(about);

            // Submenu 1: Mission & Vision
            NavigationItem missionVision = new NavigationItem();
            missionVision.setLabel("Mission & Vision");
            missionVision.setDestinationType("INTERNAL");
            missionVision.setTargetPath("/about/mission-vision");
            missionVision.setParentId(about.getId());
            missionVision.setDisplayOrder(0);
            missionVision.setIsVisible(true);
            navigationItemRepository.save(missionVision);

            // Submenu 2: History of the Church
            NavigationItem history = new NavigationItem();
            history.setLabel("History of the Church");
            history.setDestinationType("INTERNAL");
            history.setTargetPath("/about/history");
            history.setParentId(about.getId());
            history.setDisplayOrder(1);
            history.setIsVisible(true);
            navigationItemRepository.save(history);

            // Submenu 3: Priests
            NavigationItem priests = new NavigationItem();
            priests.setLabel("Priests");
            priests.setDestinationType("INTERNAL");
            priests.setTargetPath("/about/priests");
            priests.setParentId(about.getId());
            priests.setDisplayOrder(2);
            priests.setIsVisible(true);
            navigationItemRepository.save(priests);

            // 4. Events
            NavigationItem events = new NavigationItem();
            events.setLabel("Events");
            events.setDestinationType("INTERNAL");
            events.setTargetPath("/events");
            events.setDisplayOrder(3);
            events.setIsVisible(true);
            navigationItemRepository.save(events);

            // 5. Ministries
            NavigationItem ministries = new NavigationItem();
            ministries.setLabel("Ministries");
            ministries.setDestinationType("INTERNAL");
            ministries.setTargetPath("/ministries");
            ministries.setDisplayOrder(4);
            ministries.setIsVisible(true);
            navigationItemRepository.save(ministries);

            // 6. Gallery
            NavigationItem gallery = new NavigationItem();
            gallery.setLabel("Gallery");
            gallery.setDestinationType("INTERNAL");
            gallery.setTargetPath("/gallery");
            gallery.setDisplayOrder(5);
            gallery.setIsVisible(true);
            navigationItemRepository.save(gallery);

            // 7. Contact
            NavigationItem contact = new NavigationItem();
            contact.setLabel("Contact");
            contact.setDestinationType("INTERNAL");
            contact.setTargetPath("/contact");
            contact.setDisplayOrder(6);
            contact.setIsVisible(true);
            navigationItemRepository.save(contact);
        }
    }

    private void seedPagesAndSections() {
        if (!pageRepository.existsBySlug("home")) {
            Page homePage = new Page();
            homePage.setTitle("Home");
            homePage.setSlug("home");
            homePage.setTemplate("HOME");
            homePage.setStatus("PUBLISHED");
            homePage.setSeoTitle("Welcome to the Parish of the Alliance of the Two Hearts");
            homePage.setSeoDescription("Official platform of the Parish of the Alliance of the Two Hearts. Mass schedules, community announcements, and events.");
            homePage.setPublishedAt(LocalDateTime.now());
            homePage = pageRepository.save(homePage);

            Long pageId = homePage.getId();

            // 1. Hero Slideshow
            PageSection hero = new PageSection();
            hero.setPageId(pageId);
            hero.setSectionType("HERO_SLIDESHOW");
            hero.setTitle("Homepage Hero Slideshow");
            hero.setDisplayOrder(0);
            hero.setIsVisible(true);
            hero.setContentJson("""
            {
              "slides": [],
              "autoplay": true,
              "intervalSeconds": 6
            }
            """);
            pageSectionRepository.save(hero);

            // 2. Welcome Section
            PageSection welcome = new PageSection();
            welcome.setPageId(pageId);
            welcome.setSectionType("WELCOME");
            welcome.setTitle("Welcome Section");
            welcome.setDisplayOrder(1);
            welcome.setIsVisible(true);
            welcome.setContentJson("""
            {
              "heading": "A Sanctuary of Faith, Hope, and Love",
              "welcomeMessage": "Welcome to our parish family! We are honored to accompany you on your spiritual journey.",
              "supportingDescription": "The Parish of the Alliance of the Two Hearts is dedicated to fostering deep prayer life, reverent sacramental worship, and compassionate outreach to all parishioners and seekers.",
              "imageUrl": "",
              "buttonText": "About Our Parish",
              "buttonLink": "/about/mission-vision",
              "layout": "centered"
            }
            """);
            pageSectionRepository.save(welcome);

            // 3. Announcements Section
            PageSection announcements = new PageSection();
            announcements.setPageId(pageId);
            announcements.setSectionType("ANNOUNCEMENT_CARDS");
            announcements.setTitle("Latest Announcements");
            announcements.setDisplayOrder(2);
            announcements.setIsVisible(true);
            announcements.setContentJson("""
            {
              "heading": "Official Parish Announcements",
              "subheading": "Stay informed on liturgical celebrations, pastoral advisories, and community news.",
              "maxItems": 3,
              "showViewAll": true
            }
            """);
            pageSectionRepository.save(announcements);

            // 4. Events Section
            PageSection events = new PageSection();
            events.setPageId(pageId);
            events.setSectionType("EVENT_CARDS");
            events.setTitle("Upcoming Events");
            events.setDisplayOrder(3);
            events.setIsVisible(true);
            events.setContentJson("""
            {
              "heading": "Upcoming Parish Activities",
              "subheading": "Mark your calendar and participate in our communal devotions, seminars, and parish celebrations.",
              "maxItems": 3,
              "showViewAll": true
            }
            """);
            pageSectionRepository.save(events);

            // 5. About the Parish Preview
            PageSection aboutPreview = new PageSection();
            aboutPreview.setPageId(pageId);
            aboutPreview.setSectionType("ABOUT_PREVIEW");
            aboutPreview.setTitle("About the Parish");
            aboutPreview.setDisplayOrder(4);
            aboutPreview.setIsVisible(true);
            aboutPreview.setContentJson("""
            {
              "heading": "Rooted in Faith, Growing in Fellowship",
              "description": "Established with deep reverence to the Sacred Heart of Jesus and the Immaculate Heart of Mary, our parish stands as a spiritual home for countless families in the diocese.",
              "buttonText": "Discover Our History",
              "buttonLink": "/about/history",
              "imageUrl": ""
            }
            """);
            pageSectionRepository.save(aboutPreview);

            // 6. Priest Highlight
            PageSection priests = new PageSection();
            priests.setPageId(pageId);
            priests.setSectionType("PRIEST_CARDS");
            priests.setTitle("Our Pastoral Shepherds");
            priests.setDisplayOrder(5);
            priests.setIsVisible(true);
            priests.setContentJson("""
            {
              "heading": "Pastoral Leadership",
              "subheading": "Meet the priests dedicated to our pastoral care, sacramental celebrations, and spiritual guidance.",
              "maxItems": 3
            }
            """);
            pageSectionRepository.save(priests);

            // 7. Gallery Preview
            PageSection galleryPreview = new PageSection();
            galleryPreview.setPageId(pageId);
            galleryPreview.setSectionType("GALLERY_PREVIEW");
            galleryPreview.setTitle("Photo Gallery Preview");
            galleryPreview.setDisplayOrder(6);
            galleryPreview.setIsVisible(true);
            galleryPreview.setContentJson("""
            {
              "heading": "Moments of Faith & Celebration",
              "subheading": "Snapshots from liturgical solemnities, fiesta processions, and parish ministry gatherings.",
              "maxItems": 4,
              "showViewAll": true
            }
            """);
            pageSectionRepository.save(galleryPreview);

            // 8. Contact Section
            PageSection contactSec = new PageSection();
            contactSec.setPageId(pageId);
            contactSec.setSectionType("CONTACT_SECTION");
            contactSec.setTitle("Contact & Mass Schedules");
            contactSec.setDisplayOrder(7);
            contactSec.setIsVisible(true);
            contactSec.setContentJson("""
            {
              "heading": "Visit Our Parish",
              "subheading": "Find our location, mass schedules, and parish office hours.",
              "showMap": true,
              "showOfficeHours": true
            }
            """);
            pageSectionRepository.save(contactSec);
        }

        // Mission & Vision Page
        if (!pageRepository.existsBySlug("mission-vision")) {
            Page mvPage = new Page();
            mvPage.setTitle("Mission & Vision");
            mvPage.setSlug("mission-vision");
            mvPage.setTemplate("ABOUT");
            mvPage.setStatus("PUBLISHED");
            mvPage.setSeoTitle("Mission & Vision - Parish of the Alliance of the Two Hearts");
            mvPage.setSeoDescription("The mission, vision, and core spiritual values of the Parish of the Alliance of the Two Hearts.");
            mvPage.setPublishedAt(LocalDateTime.now());
            mvPage = pageRepository.save(mvPage);

            PageSection mvSection = new PageSection();
            mvSection.setPageId(mvPage.getId());
            mvSection.setSectionType("RICH_TEXT");
            mvSection.setTitle("Mission and Vision Statements");
            mvSection.setDisplayOrder(0);
            mvSection.setIsVisible(true);
            mvSection.setContentJson("""
            {
              "vision": "Katilingban sa parokya nga nagpuyo sa Ebanghelyo ug nagkahiusa sa panaw sa pagtoo paingon sa kapuno sa kinabuhi dinasig sa gugma ni Hesus ug Maria",
              "missionPoints": [
                "Ang paghimo ug mga kalihukan alang sa lawas ug kalag aron pagtabang sa mga tao nga makakaplag sa Ginoo, sa pag-amuma sa ilang pagtuo, sa pagtugkad sa katuyuan sa kinabuhi, ug paghimo sa kabag-uhan.",
                "Ang pagpakiglambigit sa mga labing kabus aron pagtabang kanila sa pagkab-ot ug malambuong kinabuhi",
                "Ang paghatag ug kadasig sa katawhan nga magpuyo sa Kristohanong kinabuhi uban sa mga maayong buhat ni Maria",
                "Pagpahigmata ug pagpahinumdum sa atong kaakuhan sa pag-amoma sa kalikopan"
              ],
              "pathways": [
                { "letter": "P", "title": "Persevering Commitment", "cebuano": "Pagkamalahutayon nga mobuhat sa kaakohan" },
                { "letter": "A", "title": "Ardent Care for others", "cebuano": "Anaa ang kadasig nga Moatiman sa uban" },
                { "letter": "T", "title": "Trustworthiness", "cebuano": "Tinoud nga kasaligan" },
                { "letter": "H", "title": "Honesty", "cebuano": "Hilom sa kamatinud-anon" },
                { "letter": "W", "title": "Wisdom", "cebuano": "Walay hunong nagtamod sa Diosnong kaalam" },
                { "letter": "A", "title": "Achieving Cooperation and Fairness", "cebuano": "Andam mopuyo diha sa pagtinabangay og kaangayan" },
                { "letter": "Y", "title": "Yearning Social Responsibility", "cebuano": "Yanong nagtuman sa katilingbanong responsabilidad" },
                { "letter": "S", "title": "Servant Leadership", "cebuano": "Sulogoon nga pangulo" }
              ],
              "hearts": [
                { "letter": "H", "title": "Helping others", "cebuano": "Tabang, Abag, Alagad" },
                { "letter": "E", "title": "Ecological Awareness", "cebuano": "Pagmangon sa kalikupan" },
                { "letter": "A", "title": "Accountability", "cebuano": "Andam motubag sa kaakohan" },
                { "letter": "R", "title": "Respect", "cebuano": "Pagtahod" },
                { "letter": "T", "title": "Truth", "cebuano": "Tinoud" },
                { "letter": "S", "title": "Solidarity and Sustainability", "cebuano": "Sa kanunay nagdasig sa panaghiusa og pagpadayon" }
              ]
            }
            """);
            pageSectionRepository.save(mvSection);
        }
    }

    private void seedAnnouncements() {
        // Left clean so user can add real announcements via CMS
    }

    private void seedEvents() {
        // Left clean so user can add real events via CMS
    }

    private void seedPriests() {
        // Left clean so user can add real priests via CMS
    }

    private void seedHistory() {
        // Left clean so user can add real history milestones via CMS
    }

    private void seedGallery() {
        // Left clean so user can add real gallery albums and photos via CMS
    }

    private void seedSiteSettings() {
        saveSettingIfAbsent("site_name", "Parish of the Alliance of the Two Hearts");
        saveSettingIfAbsent("site_short_name", "PATH");
        saveSettingIfAbsent("tagline", "A community united in faith, prayer, and devotion to the Sacred Hearts of Jesus and Mary");
        saveSettingIfAbsent("primary_color", "#C41E3A");
        saveSettingIfAbsent("secondary_color", "#0B3B95");
        saveSettingIfAbsent("accent_color", "#D4AF37");
        saveSettingIfAbsent("logo_url", "/logo.png");
        saveSettingIfAbsent("font_heading", "Cinzel");
        saveSettingIfAbsent("font_body", "Plus Jakarta Sans");
        saveSettingIfAbsent("address", "J. Fortich St., Banawa, Cebu City, Philippines");
        saveSettingIfAbsent("phone", "(032) 255 3241");
        saveSettingIfAbsent("email", "office@pathparish.org");
        saveSettingIfAbsent("office_hours", "Tuesday – Saturday: 8:00 AM – 12:00 PM, 1:30 PM – 5:00 PM\nSunday: 8:00 AM – 12:00 PM\nMonday: Closed");
        saveSettingIfAbsent("mass_schedules", "Monday – Friday:\n6:00 AM [Cebuano]\n6:30 AM [English]\n12:15 PM [English]\n5:00 PM [Cebuano] (Every Monday at the Columbary)\n6:00 PM [English] 🔴 LIVE\n\nSaturday:\n6:00 AM [Cebuano]\n6:30 AM [English]\n5:30 PM [English] 🔴 LIVE (Anticipated Mass)\n\nSunday:\n5:30 AM [Cebuano]\n7:00 AM [English]\n9:00 AM [English] 🔴 LIVE\n11:00 AM [English]\n4:00 PM [English]\n5:30 PM [Cebuano] 🔴 LIVE\n7:00 PM [English]");
        saveSettingIfAbsent("confession_schedule", "Approach the Parish Priest at the sacristy after the mass or inform any mass servers immediately");
        saveSettingIfAbsent("facebook_url", "https://www.facebook.com/PATHBanawa");
        saveSettingIfAbsent("youtube_url", "");
        saveSettingIfAbsent("footer_copyright", "© 2026 Parish of the Alliance of the Two Hearts. All Rights Reserved.");
    }

    private void saveSettingIfAbsent(String key, String value) {
        if (!siteSettingRepository.existsBySettingKey(key)) {
            siteSettingRepository.save(new SiteSetting(key, value));
        }
    }
}
