using System.Text.Json;
using Investment.Domain;
using Microsoft.EntityFrameworkCore;

namespace Investment.Infrastructure.Persistence;

public static class InvestmentSeeder
{
    public static async Task SeedAsync(DbContext db)
    {
        if (db is not InvestmentDbContext invDb) return;

        if (await invDb.InvestmentLeads.AnyAsync()) return;

        var now = DateTime.UtcNow;

        // 1. Micro Capital (Aquarium Fish Harvest Project)
        var lead1Id = Guid.Parse("11111111-1111-1111-1111-111111111101");
        var lead1 = new InvestmentLead
        {
            Id = lead1Id,
            CompanyName = "Micro Capital",
            Industry = "Aquaculture & Fish",
            OfferSummary = "Micro Capital একুরিয়াম ফিশ হারভেস্ট প্রজেক্ট: ১৫,০০০ টাকার শেয়ারে মাসিক ২,২০০ - ২,৮০০ টাকা লাভের অফার।",
            RawText = "একুরিয়াম ফিশ হারভেস্ট প্রজেক্ট | APP PROMOTIONAL FLASH OFFER. রেগুলার শেয়ার মূল্য: ২৫,০০০ টাকা, Flash Price: মাত্র ১৫,০০০ / শেয়ার। প্রতি শেয়ারে মাসিক লাভ: ২,২০০ – ২,৮০০ টাকা। MicroCapital App Download & Install করে App-এর মাধ্যমে Purchase করতে হবে। Offer Duration: ২৪ ঘণ্টা। WhatsApp: 01710-286515",
            SourceChannel = "Facebook Ad",
            ContactInfo = "01710-286515 | www.microcapitalbd.com",
            Location = "Online / Satkhira",
            MinimumInvestment = 15000m,
            PromisedMonthlyReturnPercent = 16.5m,
            PayoutFrequency = "প্রজেক্ট মেয়াদান্তে (৬ মাস পর)",
            LockInPeriod = "৬ মাস",
            OfferedSecurity = "অ্যাপ মেম্বারশিপ",
            TrustScore = 4,
            RiskLevel = "SCAM",
            ShariahStatus = "NON_COMPLIANT",
            Status = "REJECTED",
            CreatedAt = now.AddDays(-1),
            ExternalWebsiteUrl = "https://www.microcapitalbd.com",
            AppPackageName = "com.microcapitalbd.webapp",
            DomainWhoisSummary = "ডোমেইন: microcapitalbd.com | রেজিস্ট্রেশন: ৯ জুন ২০২৬ (Namecheap) | মেয়াদ: ১ বছর | ক্লাউডফ্লেয়ার প্রক্সি দিয়ে প্রকৃত সার্ভার আইপি লুকানো | আরজেএসসি ভেরিফিকেশন অনুপস্থিত",
            AppStorePackageSummary = "প্যাকেজ: com.microcapitalbd.webapp | প্রকাশক: ArchCode Solutions (সাতক্ষীরা) | আর্কিটেকচার: সাধারণ আনসিকিউরড WebView মোড়ক | ডাউনলোড: <১০০ বার | ফিনটেক সিকিউরিটি জিরো",
            ReputationSearchSummary = "অনলাইন ও সোশ্যাল ফোরাম রেকর্ড: ফেসবুক গ্রুপে 'Micro Capital' এর বিরুদ্ধে প্রতারণা ও টাকা আটকে রাখার অভিযোগ। কোনো বিএসইসি কালেক্টিভ ইনভেস্টমেন্ট স্কিম (CIS) অনুমোদন নেই।",
            DeepInvestigationReportMarkdown = @"# 🕵️‍♂️ ফিনক্স ডিপ ফরেনসিক ইনভেস্টিগেশন: Micro Capital (একুরিয়াম ফিশ হারভেস্ট)
**তদন্তের তারিখ:** সেপ্টেম্বর ২০২৬ | **চূড়ান্ত স্কোর:** ৪/১০০ | **ঝুঁকির স্তর:** 🚨 চরম স্ক্যাম (100% Ponzi Scheme)

---
### 📌 ১. এক্সিকিউটিভ সামারি
Micro Capital নামক প্রতিষ্ঠানটি Google Play Store অ্যাপের মাধ্যমে 'একুরিয়াম ফিশ হারভেস্ট প্রজেক্ট' নামে সাধারণ মানুষের কাছ থেকে ১৫,০০০ টাকা মূল্যের শেয়ার বিক্রি করছে। প্রতি শেয়ারে মাসিক ২,২০০ থেকে ২,৮০০ টাকা লাভের প্রতিশ্রুতি দিচ্ছে, যা মাসিক ১৪.৬% থেকে ১৮.৬% এবং বার্ষিক ১৭৬% থেকে ২২৪% নিট রিটার্ন! ফিন্যান্সিয়াল ম্যাথমেটিক্স, কোম্পানি ও ডোমেইন রেকর্ড এবং প্লে-স্টোর অ্যাপ আর্কিটেকচার বিশ্লেষণে এটি একটি শতভাগ নিশ্চিত পনজি স্কিম।

---
### 🌐 ২. ডোমেইন ও প্রযুক্তিগত ফরেনসিক
- **ডোমেইন:** `microcapitalbd.com`
- **হু-ইজ রেকর্ড:** রেজিস্ট্রেশন তারিখ ৯ জুন ২০২৬ (Namecheap, Inc.)। ডোমেইনের বয়স ৩ মাসেরও কম। প্রাইভেসি গার্ড দিয়ে মালিকের নাম ও আসল ঠিকানা লুকানো।
- **মোবাইল অ্যাপ্লিকেশন:** `com.microcapitalbd.webapp`। এটি কোনো নেটিভ ফিনটেক বা ব্যাংকিং অ্যাপ নয়; এটি সাতক্ষীরার 'ArchCode Solutions' নামক ডেভেলপার দিয়ে তৈরি একটি সস্তা WebView মোড়ক। এর উদ্দেশ্য বাংলাদেশ ব্যাংকের অনলাইন পেমেন্ট নজরদারি এড়িয়ে নগদ/বিকাশ চ্যানেলে টাকা সরিয়ে নেওয়া।
- **ওয়েবসাইট লিংক ট্র্যাপ:** ওয়েবসাইটের Terms of Service এবং Refund Policy লিংকে ক্লিক করলে কোনো পৃষ্ঠা খোলে না, কেবল ডামি `#` এঙ্করে আটকে থাকে।

---
### 📊 ৩. ক্যাশফ্লো ও পনজি ম্যাথমেটিক্স
- মাছ চাষ বা একুরিয়াম ফিডিংয়ে খাদ্য খরচ, মড়ক ও পানির পিএইচ পরিবর্তনের ঝুঁকি থাকে। বিশ্ববাজারে বা বাংলাদেশে কোনো বাস্তব একুরিয়াম ব্যবসায় বার্ষিক ২২৪% নিট মুনাফা সম্ভব নয়।
- এই অস্বাভাবিক লাভ পুরোনো গ্রাহককে দেওয়া হয় কেবল নতুন গ্রাহকের আনা ১৫,০০০ টাকার মূলধন থেকে (ক্লাসিক চার্লস পনজি মডেল)।

---
### ⚖️ ৪. আইনি রেগুলেশন ও লক-ইন ফাঁদ
- ব্যাংক কোম্পানি আইন ১৯৯১ ও বিএসইসি কালেক্টিভ ইনভেস্টমেন্ট স্কিম (CIS) বিধিমালা অনুযায়ী জনসাধারণের কাছ থেকে আমানত সংগ্রহের কোনো লাইসেন্স এদের নেই।
- প্রজেক্ট মেয়াদান্তে (৬ মাস পর) লভ্যাংশ ও আসল দেওয়ার শর্ত দিয়ে গ্রাহকের মূলধন ৬ মাসের জন্য হাইজ্যাক করা হয়, যাতে এই সময়ের মধ্যে প্রতিষ্ঠাতারা অর্থ নিয়ে পালিয়ে যেতে পারে।

---
### ☪️ ৫. ইসলামি শরিয়াহ অডিট
- আমানতের ওপর ফিক্সড রিটার্ন নিশ্চিত করা ইসলামি শরিয়াহ অনুযায়ী সুস্পষ্ট 'রিবা' (সুদ)। ব্যবসা ও হিসাবের অস্বচ্ছতার কারণে এটি 'গারার' (অনিশ্চয়তা ও জুয়া)-এর অন্তর্ভুক্ত।

---
### 🎯 ৬. চূড়ান্ত রায় ও করণীয় পদক্ষেপ
**রায়: ১০০% পনজি স্কিম (Absolute Scam Alert)।**
১. Micro Capital-এ এক পয়সাও বিনিয়োগ করবেন না।
২. প্লে-স্টোর থেকে এদের অ্যাপ ইন্সটল করবেন না এবং কোনো বিকাশ/নগদ ওটিপি দেবেন না।
৩. হোয়াটসঅ্যাপ নম্বর (01710-286515) অবিলম্বে ব্লক ও রিপোর্ট করুন।",
            LastDeepInvestigatedAt = now.AddDays(-1)
        };
        var report1 = new AuditReport
        {
            Id = Guid.NewGuid(),
            InvestmentLeadId = lead1Id,
            FinancialSanityScore = 2,
            FinancialSanityVerdict = "মাসিক ১৪.৬% - ১৮.৬% রিটার্ন (বার্ষিক ১৭৬% - ২২৪%) জীববৈচিত্র্য বা অ্যাকুয়াকালচারে কোনোভাবেই সম্ভব নয়। এটি স্পষ্ট পনজি ম্যাথমেটিক্স।",
            RegulatoryComplianceScore = 5,
            RegulatoryVerdict = "RJSC বা বাংলাদেশ সিকিউরিটিজ অ্যান্ড এক্সচেঞ্জ কমিশনের (BSEC) কোনো কালেক্টিভ ইনভেস্টমেন্ট স্কিম (CIS) অনুমোদন নেই।",
            CashflowAndLockInScore = 8,
            CashflowVerdict = "প্লে স্টোরে ওয়েবভিউ অ্যাপ (com.microcapitalbd.webapp) তৈরি করে অনিবন্ধিত পেমেন্ট চ্যানেলে টাকা নিয়ে ৬ মাস লক-ইন রাখার ফাঁদ।",
            ShariahComplianceScore = 0,
            ShariahVerdict = "ফিক্সড রিটার্নের নিশ্চয়তা এবং অস্বচ্ছ বিনিয়োগ ইসলামি শরিয়াহতে সরাসরি 'রিবা' ও প্রতারণা।",
            RedFlagsJson = JsonSerializer.Serialize(new[]
            {
                "বার্ষিক ১৭৬% থেকে ২২৪% কাল্পনিক মুনাফার ফাঁদ",
                "অপ্রমাণিত ওয়েবভিউ অ্যাপ ডাউনলোডে বাধ্য করে ব্যাংকিং নজরদারি এড়ানোর অপচেষ্টা",
                "ওয়েবসাইটের টার্মস ও রিফান্ড পলিসি লিংকে ক্লিক করলে ডামি '#' এঙ্কর কাজ করে",
                "নেমচিপে জুন ২০২৬-এ রেজিস্ট্রেশন করা অনামিক ডোমেইন",
                "৬ মাস মূলধন সম্পূর্ণ আটকে রাখা ও প্রাথমিক লভ্যাংশ আটকানো"
            }),
            VerifiedClaimsJson = JsonSerializer.Serialize(Array.Empty<string>()),
            RecommendationSummary = "🚨 চরম প্রতারণা সতর্কবার্তা (100% Ponzi Scheme): Micro Capital-এ কোনো টাকা পাঠাবেন না। প্লে স্টোর অ্যাপ ইন্সটল করবেন না।",
            ActionPlan = "১. অবিলম্বে হোয়াটসঅ্যাপে যোগাযোগ বিচ্ছিন্ন ও ব্লক করুন।\n২. কোনো ব্যাংকিং বা বিকাশ ওটিপি ও পেমেন্ট করবেন না।\n৩. এই প্রতিষ্ঠানকে স্ক্যাম ডাটাবেজে অন্তর্ভুক্ত রাখুন।",
            AuditedAt = now.AddDays(-1)
        };

        // 2. Haven Park (China Import Trading)
        var lead2Id = Guid.Parse("11111111-1111-1111-1111-111111111102");
        var lead2 = new InvestmentLead
        {
            Id = lead2Id,
            CompanyName = "Haven Park",
            Industry = "Import & E-Commerce",
            OfferSummary = "চীন থেকে পণ্য আমদানি করে দারাজ ও ফেসবুক শপে বিক্রির অংশীদারিত্ব। ১ লাখে মাসিক ৩-৪ হাজার (গড় ৪-৬%) লাভ।",
            RawText = "Haven Park — বাংলাদেশে স্মার্ট ট্রেডিং ও ইমপোর্ট ব্যবসা। চায়না থেকে ট্রেন্ডিং প্রোডাক্ট ইমপোর্ট করে সেল। মাসিক প্রফিট (গড় ৪-৬%): ১ লাখ -> ৩-৪ হাজার টাকা, ৫ লাখ -> ১৮-২০ হাজার। নিরাপত্তা: স্ট্যাম্পে লিখিত চুক্তি, সিকিউরিটি চেক। ১ বছরের চুক্তি | ৩ মাস পর উইথড্র। অফিস: দক্ষিণ বনশ্রী, ব্লক-J, ঢাকা। হটলাইন: 01711-999872",
            SourceChannel = "Facebook Ad",
            ContactInfo = "01716-411838 / 01711-999872",
            Location = "দক্ষিণ বনশ্রী, ব্লক-J, রোড-০৫, ঢাকা",
            MinimumInvestment = 100000m,
            PromisedMonthlyReturnPercent = 4.5m,
            PayoutFrequency = "মাসিক",
            LockInPeriod = "১ বছর (৩ মাস পর উইথড্র সুবিধা দাবি)",
            OfferedSecurity = "৩০০ টাকার স্ট্যাম্প ও ব্যক্তিগত ব্যাংক সিকিউরিটি চেক",
            TrustScore = 18,
            RiskLevel = "SCAM",
            ShariahStatus = "NON_COMPLIANT",
            Status = "REJECTED",
            CreatedAt = now.AddDays(-2)
        };
        var report2 = new AuditReport
        {
            Id = Guid.NewGuid(),
            InvestmentLeadId = lead2Id,
            FinancialSanityScore = 15,
            FinancialSanityVerdict = "বাণিজ্যিক ই-কমার্স ট্রেডিংয়ে মাসিক ৪-৬% (বার্ষিক ৪৮-৭২%) নিশ্চিত নিট মুনাফা টানা প্রদান করা অর্থনৈতিকভাবে অসম্ভব।",
            RegulatoryComplianceScore = 20,
            RegulatoryVerdict = "পাবলিক থেকে আমানত বা ডিপোজিট সংগ্রহের কোনো আর্থিক প্রতিষ্ঠান (NBFI) লাইসেন্স নেই।",
            CashflowAndLockInScore = 30,
            CashflowVerdict = "ব্যক্তিগত সিকিউরিটি চেক আইনিভাবে সুরক্ষার মিথ্যা আশ্বাস দেয়; কোম্পানি দেউলিয়া হলে এনআই অ্যাক্ট ১৩৮ ধারার মামলা বছরের পর বছর ঝুলে থাকে।",
            ShariahComplianceScore = 5,
            ShariahVerdict = "মূলধনের ওপর নির্দিষ্ট অংকের মাসিক প্রফিট প্রতিশ্রুতি শরিয়াহতে সরাসরি হারাম (Riba al-Qardh)।",
            RedFlagsJson = JsonSerializer.Serialize(new[]
            {
                "বার্ষিক ৪৮% থেকে ৭২% অস্বাভাবিক মুনাফা প্রতিশ্রুতি",
                "পাবলিক ডিপোজিটের বিপরীতে ব্যক্তিগত সিকিউরিটি চেকের অবৈধ ব্যবহার",
                "আমদানি পণ্যের কাস্টমস বিল অব এন্ট্রি বা অডিট স্টেটমেন্ট অনুপস্থিত",
                "ফিক্সড পারসেন্টেজ মাসিক রিটার্ন ইসলামিক মুদারাবা নীতির সম্পূর্ণ লঙ্ঘন"
            }),
            VerifiedClaimsJson = JsonSerializer.Serialize(new[]
            {
                "বনশ্রীতে অফিস ও পারিবারিক ঠিকানার ভৌগোলিক উল্লেখ রয়েছে।"
            }),
            RecommendationSummary = "⚠️ উচ্চ পনজি ঝুঁকি (High Ponzi Risk): ফিক্সড মাসিক লাভের আশ্বাস দিয়ে ট্রেডিংয়ে আমানত সংগ্রহ একটি ক্লাসিক ট্র্যাপ।",
            ActionPlan = "১. ফিক্সড প্রফিট চুক্তিতে কোনো মূলধন বিনিয়োগ করবেন না।\n২. প্রকৃত ব্যবসার ব্যালেন্স শিট ও বিগত ২ বছরের কাস্টমস ট্যাক্স চালান যাচাই না করে এগিয়ে যাওয়া নিষিদ্ধ।",
            AuditedAt = now.AddDays(-2)
        };

        // 3. তাকওয়া এগ্রো ফার্ম (Taqwa Agro Farm)
        var lead3Id = Guid.Parse("11111111-1111-1111-1111-111111111103");
        var lead3 = new InvestmentLead
        {
            Id = lead3Id,
            CompanyName = "তাকওয়া এগ্রো ফার্ম",
            Industry = "Agro & Livestock",
            OfferSummary = "গরু মোটাতাজাকরণ ও ডেইরি প্রকল্পে ১০,০০০ টাকার ১৫০ শেয়ার ক্রাউডফান্ডিং। প্রজেক্ট লাভের ৫০% বণ্টন।",
            RawText = "তাকওয়া এগ্রো ফার্ম: মাত্র ১০,০০০ টাকা শেয়ার মূল্য। লক্ষ্য: ১৫০ শেয়ার পূর্ণ হলেই শুরু হবে মেগা প্রজেক্ট। লভ্যাংশ: মোট লাভের ৫০% বিনিয়োগকারীদের দেওয়া হবে। ১ম লভ্যাংশ ৬ মাস পর, পরে প্রতি ৩ মাস পর পর। ১৫০/৩০০ টাকার স্ট্যাম্পে চুক্তিপত্র। ফার্ম: মেদেহীবাগ, সাতক্ষীরা ও খলশী, ডুমুরিয়া, খুলনা। যোগাযোগ: +880 1793-483837",
            SourceChannel = "WhatsApp",
            ContactInfo = "+880 1793-483837",
            Location = "ডুমুরিয়া, খুলনা ও সাতক্ষীরা সদর",
            MinimumInvestment = 10000m,
            PromisedMonthlyReturnPercent = 3.5m,
            PayoutFrequency = "প্রথম কিস্তি ৬ মাস পর, পরবর্তীতে ৩ মাস অন্তর",
            LockInPeriod = "২ বছর",
            OfferedSecurity = "১৫০/৩০০ টাকার স্ট্যাম্প চুক্তি",
            TrustScore = 38,
            RiskLevel = "HIGH",
            ShariahStatus = "DOUBTFUL",
            Status = "REJECTED",
            CreatedAt = now.AddDays(-3)
        };
        var report3 = new AuditReport
        {
            Id = Guid.NewGuid(),
            InvestmentLeadId = lead3Id,
            FinancialSanityScore = 48,
            FinancialSanityVerdict = "লাভের ৫০% বণ্টনের কথা বলা হলেও ক্যাটল ফার্মিংয়ে খাদ্যের চড়া দাম ও রোগবালাইয়ের কারণে ৩.৫% মাসিক গড় রিটার্ন টেকসই নয়।",
            RegulatoryComplianceScore = 30,
            RegulatoryVerdict = "পাবলিক থেকে ক্রাউডফান্ডিং শেয়ার বিক্রির বৈধ বিএসইসি অনুমোদন বা যৌথ মূলধন কোম্পানির শেয়ার রেজিস্ট্রেশন নেই।",
            CashflowAndLockInScore = 35,
            CashflowVerdict = "প্রথম লভ্যাংশের জন্য ৬ মাস অপেক্ষা এবং ২ বছরের দীর্ঘ লক-ইন মূলধনকে চরম ঝুঁকিতে ফেলে।",
            ShariahComplianceScore = 42,
            ShariahVerdict = "অনুপাতে লাভের কথা বললেও লোকসান হলে মূলধন ফেরত বা অবমূল্যায়নের হিসাব পদ্ধতি অস্বচ্ছ।",
            RedFlagsJson = JsonSerializer.Serialize(new[]
            {
                "১৫০ শেয়ারের অননুমোদিত পাবলিক ক্রাউডফান্ডিং পুল",
                "প্রথম লভ্যাংশ পেতে ৬ মাসের লম্বা গ্যাপ",
                "গবাদিপশুর মৃত্যু বা রোগব্যাধিতে কোনো প্রাতিষ্ঠানিক বীমা কাভারেজ নেই",
                "৩০০ টাকার স্ট্যাম্পে দেওয়ানি মামলায় টাকা উদ্ধারের সুযোগ নেই বললেই চলে"
            }),
            VerifiedClaimsJson = JsonSerializer.Serialize(new[]
            {
                "খুলনা ও সাতক্ষীরায় বাস্তবিক ফার্ম ও ঠিকানার ভৌগোলিক অস্তিত্ব রয়েছে।"
            }),
            RecommendationSummary = "⚠️ উচ্চ পরিচালনা ও মূলধন ঝুঁকি (High Operational Risk): ব্যক্তিগত বা বোনের ক্ষুদ্র সঞ্চয় এই ধরনের অনিবন্ধিত পশু খামারে বিনিয়োগ করা অনুচিত।",
            ActionPlan = "১. বোনের কষ্টার্জিত টাকা কোনো ক্রাউডফান্ডেড গবাদিপশু প্রকল্পে দেবেন না।\n২. সরাসরি তত্ত্বাবধান ছাড়া দূরের জেলায় এগ্রো বিনিয়োগ সম্পূর্ণ পরিহার করুন।",
            AuditedAt = now.AddDays(-3)
        };

        // 4. ৩১৩ প্রোপার্টিজ (রুজি-রোজগার প্রজেক্ট)
        var lead4Id = Guid.Parse("11111111-1111-1111-1111-111111111104");
        var lead4 = new InvestmentLead
        {
            Id = lead4Id,
            CompanyName = "৩১৩ প্রোপার্টিজ লিমিটেড",
            Industry = "Multi-business Agro/Frozen/Transport Pool",
            OfferSummary = "মুফতী হাবিবুর রহমান মিছবাহ'র 'রুজি-রোজগার' প্রজেক্ট: সর্বনিম্ন ১ লাখ টাকা বিনিয়োগ, ত্রৈমাসিক লভ্যাংশ বণ্টন।",
            RawText = "৩১৩ প্রোপার্টিজ লিমিটেড Gov Reg: C-162267. রুজি-রোজগার প্রজেক্ট: সর্বনিম্ন ১ লক্ষ টাকা। লভ্যাংশ: ৫০% বিনিয়োগকারী, ৪০% ম্যানেজমেন্ট, ১০% সমাজসেবা। ৩ বছর আগে রিফান্ডে ১০% সার্ভিস চার্জ। ধারা ৯: পরপর ৪ কিস্তি লোকসানে মূলধন ৯০% নামলে বিনিয়োগকারীরা ভর্তুকি দিয়ে মূলধন ১০০% করতে হবে। ধারা ১৯-২০: চেয়ারম্যানের ওয়ারিশগণ দায়িত্ব পালন করবেন। হেড অফিস: যাত্রাবাড়ি বড় মাদরাসা মার্কেট, ঢাকা।",
            SourceChannel = "WhatsApp",
            ContactInfo = "01785-654313 / 096-13660-313",
            Location = "যাত্রাবাড়ি বড় মাদরাসা মার্কেট, যাত্রাবাড়ি, ঢাকা",
            MinimumInvestment = 100000m,
            PromisedMonthlyReturnPercent = 2.8m,
            PayoutFrequency = "ত্রৈমাসিক (প্রথম লভ্যাংশ ৬ মাস পর)",
            LockInPeriod = "৩ বছর",
            OfferedSecurity = "চেয়ারম্যানের সীল-স্বাক্ষরিত ইনভয়েস ও মানি রিসিপ্ট",
            TrustScore = 32,
            RiskLevel = "HIGH",
            ShariahStatus = "DOUBTFUL",
            Status = "REJECTED",
            CreatedAt = now.AddDays(-4)
        };
        var report4 = new AuditReport
        {
            Id = Guid.NewGuid(),
            InvestmentLeadId = lead4Id,
            FinancialSanityScore = 55,
            FinancialSanityVerdict = "ত্রৈমাসিক ব্যবসায়িক রোলিংয়ের দাবি থাকলেও নির্দিষ্ট ব্যবসায়িক প্রতিষ্ঠান ছাড়া ব্ল্যাঙ্কেট ফান্ড রোলিং নিয়ন্ত্রণহীন।",
            RegulatoryComplianceScore = 45,
            RegulatoryVerdict = "RJSC রেজিস্ট্রেশন (C-162267) রয়েছে, তবে আনরেগুলেটেড পাবলিক আমানত নেওয়ার অধিকার সীমিত দায় কোম্পানির নেই।",
            CashflowAndLockInScore = 15,
            CashflowVerdict = "চুক্তিপত্রের ধারা ৯ অনুযায়ী ক্ষতি হলে বিনিয়োগকারীকে নিজ পকেট থেকে ভর্তুকি দিতে হবে; ধারা ১২ অনুযায়ী ৩ বছর লক-ইন ও ১০% কর্তন।",
            ShariahComplianceScore = 20,
            ShariahVerdict = "বাইয়ে মুদারাবার নাম ব্যবহার করলেও লোকসানে মূলধন রক্ষার দায়িত্ব বিনিয়োগকারীর ওপর এককভাবে চাপানো শরিয়াহর পরিপন্থী।",
            RedFlagsJson = JsonSerializer.Serialize(new[]
            {
                "ধারা ৯ (ভর্তুকি ফাঁদ): লোকসানে মূলধন ৯০% এর নিচে নামলে বিনিয়োগকারীকে নিজ পকেট থেকে ভর্তুকি দিয়ে ১০০% করতে হবে",
                "ধারা ১২ ও ১৩: ৩ বছরের বাধ্যতামূলক লক-ইন এবং আগাম উত্তোলনে ১০% জরিমানা কর্তন",
                "ধারা ১৯ ও ২০: পরিচালনা কঠোরভাবে পারিবারিক ওয়ারিশদের ওপর অর্পিত; বিনিয়োগকারীদের ভোটাধিকার নেই",
                "ধর্মীয় ব্যক্তিত্ব ও আস্থার ওপর অতিরিক্ত নির্ভরতা, যা প্রাতিষ্ঠানিক জবাবদিহিতার ঘাটতি ঢাকতে ব্যবহৃত হয়"
            }),
            VerifiedClaimsJson = JsonSerializer.Serialize(new[]
            {
                "আরজেএসসি রেজিস্ট্রেশন (C-162267) বিদ্যমান",
                "যাত্রাবাড়িতে দৃশ্যমান ফিজিক্যাল অফিস রয়েছে"
            }),
            RecommendationSummary = "⚠️ মারাত্মক আইনি ও চুক্তিভিত্তিক ফাঁদ (Contractual Penalty Trap): ধারা ৯ ও ১২ এর মতো মারাত্মক ক্ষতিকর ক্লজ মেনে বিনিয়োগ করা আত্মঘাতী।",
            ActionPlan = "১. ধারা ৯ ও ধারা ১২ সংবলিত কোনো এগ্রিমেন্টে স্বাক্ষর করবেন না।\n২. যেখানে লোকসানের ভর্তুকি বিনিয়োগকারীকে দিতে হয় সেখানে কোনো ক্যাপিটাল নিরাপদ নয়।",
            AuditedAt = now.AddDays(-4)
        };

        // 5. হাটবাজার অনলাইন (Haatbazar Online)
        var lead5Id = Guid.Parse("11111111-1111-1111-1111-111111111105");
        var lead5 = new InvestmentLead
        {
            Id = lead5Id,
            CompanyName = "হাটবাজার অনলাইন",
            Industry = "Agro & Livestock",
            OfferSummary = "১০০ বিঘা এগ্রো প্রজেক্টে মাত্র ১০,০০০ টাকায় মাসিক ৮০০ টাকা+ নিশ্চিত হালাল প্যাসিভ ইনকাম।",
            RawText = "মাত্র ১০,০০০ টাকা দিয়েই শুরু করা যায় এবং মাসিক হালাল আয় ৮০০ টাকা+ পাওয়া যায়। শতভাগ সেইফ নিজেস্ব ১০০ বিঘা জমির বৃহৎ এগ্রো প্রজেক্টে পার্টনার নিচ্ছি, যেখানে অংশীদার হয়ে আপনি মাসিক ৮০০ থেকে ৩৫,০০০ টাকা প্যাসিভ ইনকাম করতে পারবেন। অফিস: গুলশান, ঢাকা। যোগাযোগ: +880 1858-577771",
            SourceChannel = "WhatsApp",
            ContactInfo = "+880 1858-577771",
            Location = "গুলশান, ঢাকা",
            MinimumInvestment = 10000m,
            PromisedMonthlyReturnPercent = 8.0m,
            PayoutFrequency = "মাসিক",
            LockInPeriod = "অনির্ধারিত",
            OfferedSecurity = "অফিস ভিজিট সুবিধা",
            TrustScore = 6,
            RiskLevel = "SCAM",
            ShariahStatus = "NON_COMPLIANT",
            Status = "REJECTED",
            CreatedAt = now.AddDays(-5)
        };
        var report5 = new AuditReport
        {
            Id = Guid.NewGuid(),
            InvestmentLeadId = lead5Id,
            FinancialSanityScore = 3,
            FinancialSanityVerdict = "১০,০০০ টাকায় মাসিক ৮০০ টাকা মানে বার্ষিক ৯৬% নিশ্চিত রিটার্ন! কৃষি বা পোল্ট্রিতে এ ধরনের মুনাফা রূপকথার গল্প ও প্রতারণা।",
            RegulatoryComplianceScore = 10,
            RegulatoryVerdict = "১০০ বিঘা জমির মালিকানার কোনো ভূমি রেকর্ড বা আরজেএসসি সার্টিফাইড ব্যালেন্স শিট বিজ্ঞাপনে নেই।",
            CashflowAndLockInScore = 12,
            CashflowVerdict = "নতুন গ্রাহকের ১০,০০০ টাকা দিয়ে পুরোনো গ্রাহককে ৮০০ টাকা দেওয়ার ক্লাসিক পনজি রোটেশন।",
            ShariahComplianceScore = 0,
            ShariahVerdict = "আমানতের ওপর নিশ্চিত ফিক্সড মাসিক মুনাফা ইসলামি শরিয়াহতে সুস্পষ্ট হারাম সুদ।",
            RedFlagsJson = JsonSerializer.Serialize(new[]
            {
                "বার্ষিক ৯৬% অবিশ্বাস্য রিটার্ন যা নিশ্চিত পনজি স্কিম",
                "অপরিচিত হোয়াটসঅ্যাপ নম্বরে আগ্রাসী কোল্ড-মেসেজিং",
                "১০০ বিঘা জমির দাবির সমর্থনে কোনো সিএস/আরএস খতিয়ান বা লিগ্যাল দলিল নেই"
            }),
            VerifiedClaimsJson = JsonSerializer.Serialize(Array.Empty<string>()),
            RecommendationSummary = "🚨 নিশ্চিত পনজি স্কিম (Severe Ponzi Alert): ৮% মাসিক রিটার্ন কোনো ব্যবসা দিতে পারে না। অবিলম্বে এড়িয়ে চলুন।",
            ActionPlan = "১. হোয়াটসঅ্যাপে অবিলম্বে ব্লক ও রিপোর্ট করুন।\n২. কোনো ব্যাংকিং বা মোবাইল অ্যাকাউন্টে টাকা পাঠাবেন না।",
            AuditedAt = now.AddDays(-5)
        };

        // 6. Benchmark Halal Garment Production Unit (The Finox 10-Year Wealth Blueprint Model)
        var lead6Id = Guid.Parse("11111111-1111-1111-1111-111111111106");
        var lead6 = new InvestmentLead
        {
            Id = lead6Id,
            CompanyName = "স্মার্ট টেক্সটাইল অ্যান্ড অ্যাপারেলস পার্টনারশিপ (বেঞ্চমার্ক মডেল)",
            Industry = "Garments & Textiles",
            OfferSummary = "রপ্তানিমুখী ও লোকাল নিটওয়্যার সাব-কন্ট্রাক্ট উৎপাদন ইউনিটে সরাসরি মেশিনারি ও ওয়ার্কিং ক্যাপিটাল অংশীদারিত্ব।",
            RawText = "ফিজিক্যাল গার্মেন্ট ম্যানুফ্যাকচারিং পার্টনারশিপ: আরজেএসসি নিবন্ধিত প্রাইভেট লিমিটেড ফ্যাক্টরি। ন্যূনতম ইউনিট: ৫,০০,০০০ টাকা। সরাসরি এলসি ও বায়ার ওয়ার্ডার বুকিং ভিত্তিক প্রকৃত মুনাফা বণ্টন। মাসিক গড় ২.২% - ২.৮% বাস্তবসম্মত রিটার্ন। ১০০% হালাল মুশারাকা চুক্তিপত্র, যৌথ ব্যাংক অ্যাকাউন্ট পরিচালনা এবং ত্রৈমাসিক চার্টার্ড অ্যাকাউন্ট্যান্ট (CA) অডিট রিপোর্ট প্রদান। ঠিকানা: কোনাবাড়ী, গাজীপুর।",
            SourceChannel = "Offline",
            ContactInfo = "ফ্যাক্টরি ভিজিট ও রেজিস্টার্ড লিগ্যাল অ্যাডভাইজার",
            Location = "কোনাবাড়ী শিল্প এলাকা, গাজীপুর",
            MinimumInvestment = 500000m,
            PromisedMonthlyReturnPercent = 2.5m,
            PayoutFrequency = "বাস্তব শিপমেন্ট অনুযায়ী মাসিক/ত্রৈমাসিক",
            LockInPeriod = "২ বছর (৬ মাসের নোটিশে মেশিনারি অবচয় বাদ দিয়ে ক্যাপিটাল এক্সিট)",
            OfferedSecurity = "আরজেএসসি শেয়ার ট্রান্সফার, পার্টনারশিপ ডিড ও জয়েন্ট ব্যাংক অ্যাকাউন্ট",
            TrustScore = 92,
            RiskLevel = "LOW",
            ShariahStatus = "COMPLIANT",
            Status = "SHORTLISTED",
            CreatedAt = now.AddDays(-6)
        };
        var report6 = new AuditReport
        {
            Id = Guid.NewGuid(),
            InvestmentLeadId = lead6Id,
            FinancialSanityScore = 94,
            FinancialSanityVerdict = "মাসিক ২.২% - ২.৮% (বার্ষিক ২৬-৩৩%) নিট রিটার্ন কার্যকর রপ্তানি ও স্থানীয় নিটওয়্যার উৎপাদনে সম্পূর্ণ বাস্তবসম্মত ও টেকসই।",
            RegulatoryComplianceScore = 90,
            RegulatoryVerdict = "আরজেএসসি ইনকর্পোরেশন, বিজিএমইএ/বিকেএমইএ মেম্বারশিপ এবং বৈধ ফায়ার ও ট্রেড লাইসেন্স সম্বলিত।",
            CashflowAndLockInScore = 88,
            CashflowVerdict = "বায়ার পেমেন্ট ও ব্যাক-টু-ব্যাক এলসি সংশ্লিষ্ট স্পষ্ট ক্যাশফ্লো সাইকেল। ৬ মাসের প্রজ্ঞাপনে ক্যাপিটাল উইথড্রল নিয়মসম্মত।",
            ShariahComplianceScore = 96,
            ShariahVerdict = "প্রকৃত লাভ-ক্ষতি অংশীদারিত্বভিত্তিক শতভাগ বিশুদ্ধ ইসলামি মুশারাকা (Musharakah) নীতি অনুসরণ করে।",
            RedFlagsJson = JsonSerializer.Serialize(Array.Empty<string>()),
            VerifiedClaimsJson = JsonSerializer.Serialize(new[]
            {
                "আরজেএসসি নিবন্ধিত ও বিজিএমইএ তালিকাভুক্ত ফ্যাক্টরি",
                "বাস্তব ওয়ার্ক অর্ডার ও এলসি (Letter of Credit) ভিত্তিক উৎপাদন",
                "ইসলামিক মুশারাকা নীতি অনুযায়ী অডিটেড লাভ-লোকসান বণ্টন",
                "যৌথ ব্যাংক অ্যাকাউন্টে স্বচ্ছ লেনদেন"
            }),
            RecommendationSummary = "🟢 গোল্ড স্ট্যান্ডার্ড মডেল (Gold Standard Model): ফিনক্স ১০-বছরের ওয়েলথ ব্লুপ্রিন্ট ও ৭ কোটি টাকা লক্ষ্যের জন্য আদর্শ বাস্তব উৎপাদনশীল বিনিয়োগ কাঠামো।",
            ActionPlan = "১. গাজীপুর ফ্যাক্টরি সরাসরি পরিদর্শন করে উৎপাদন লাইন ও লেবার কমপ্লায়েন্স যাচাই করুন।\n২. আইনজীবী দিয়ে ৩০০ টাকার স্ট্যাম্পে পার্টনারশিপ ডিড সম্পাদন করে কোম্পানি আরজেএসসি ফর্মে নাম অন্তর্ভুক্ত করুন।",
            AuditedAt = now.AddDays(-6)
        };

        await invDb.InvestmentLeads.AddRangeAsync(lead1, lead2, lead3, lead4, lead5, lead6);
        await invDb.AuditReports.AddRangeAsync(report1, report2, report3, report4, report5, report6);
        await invDb.SaveChangesAsync();
    }
}
