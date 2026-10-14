import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  Users, Sparkles, Clock, Phone, 
  MapPin, Heart, BookOpen, Music, Shield, ArrowRight 
} from 'lucide-react';
import { FacebookIcon } from '../../components/common/SocialIcons';

export default function MinistriesPage() {
  const { settings } = useTheme();

  const previewMinistries = [
    {
      name: "Liturgical Commission & Altar Servers",
      category: "Worship & Liturgy",
      desc: "Servants of the sanctuary assisting the clergy in sacred celebrations and solemn liturgical rites.",
      icon: Shield,
    },
    {
      name: "Lectors & Commentators Ministry",
      category: "Ministry of the Word",
      desc: "Proclaimers of the Sacred Scriptures during the Holy Sacrifice of the Mass and liturgical devotions.",
      icon: BookOpen,
    },
    {
      name: "Parish Music & Choir Ministry",
      category: "Liturgical Music",
      desc: "Vocal and instrumental ministers uplifting congregational praise and solemnity in sacred liturgy.",
      icon: Music,
    },
    {
      name: "Parish Youth Ministry (PYM)",
      category: "Youth Apostolate",
      desc: "Empowering Catholic youth in spiritual formation, fellowship, and zealous discipleship.",
      icon: Sparkles,
    },
    {
      name: "Family & Life Apostolate",
      category: "Pastoral Care",
      desc: "Fostering Catholic marriage values, domestic church formation, and pastoral family counseling.",
      icon: Heart,
    },
    {
      name: "Caritas & Social Action Ministry",
      category: "Charity & Outreach",
      desc: "Living the Gospel through outreach to the poor, medical missions, and parish community solidarity.",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF9] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block">
            Pastoral Apostolates & Organizations
          </span>
          <h1 className="font-serif-heading text-4xl sm:text-5xl font-extrabold text-[#071838] tracking-tight leading-tight">
            Parish Ministries
          </h1>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            United in the Sacred Hearts of Jesus and Mary to serve the Lord, the Church, and our community.
          </p>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
        </div>

        {/* Dignified "In the Making" Announcement Card */}
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#071838] via-[#0D2556] to-[#071838] rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-amber-400/30 relative overflow-hidden scroll-reveal-scale">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300 block">
              Section Under Preparation
            </span>

            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-amber-300 leading-snug">
              Ministries Directory is Currently in the Making
            </h2>

            <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
              We are currently compiling and updating the complete directory of parish ministries, apostolic movements, coordinators, and schedules. The finalized directory and online sign-up details will be published here soon.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium">
              <a 
                href={`tel:${settings.phone || '(032) 255 3241'}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#071838] font-bold transition-all shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call Parish Office: {settings.phone || '(032) 255 3241'}</span>
              </a>

              {settings.facebook_url && (
                <a 
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md"
                >
                  <FacebookIcon className="w-4 h-4" />
                  <span>Inquire via Facebook</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Preview of Upcoming Ministries Grid */}
        <div className="space-y-6 scroll-reveal">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-serif-heading text-2xl font-bold text-stone-900">
              Areas of Service & Apostolates
            </h3>
            <p className="text-stone-500 text-sm mt-1">
              Here are some of the active ministries at PATH Banawa currently finalizing their rosters:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scroll-stagger">
            {previewMinistries.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm card-lift scroll-reveal space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-[#071838] group-hover:text-amber-300 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      Roster Updating
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h4 className="font-serif-heading font-bold text-stone-900 text-base mt-0.5">
                      {item.name}
                    </h4>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA / Information */}
        <div className="bg-stone-100 rounded-2xl p-6 sm:p-8 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-serif-heading text-base font-bold text-stone-900">
              Interested in joining a ministry or serving as a volunteer?
            </h4>
            <p className="text-stone-600 text-xs sm:text-sm">
              Visit our parish office at J. Fortich St., Banawa, Cebu City during regular office hours.
            </p>
          </div>
          <Link 
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071838] text-amber-300 hover:text-white text-xs font-bold transition-colors shrink-0"
          >
            <span>View Office Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
