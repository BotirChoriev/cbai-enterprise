/** BUILD-034 — Organization workspace UI copy (O'zbek). */

export const ORG_WORKSPACE_UZ = {
  pageEyebrow: "Tashkilot OS",
  persistenceSharedReady:
    "Umumiy backend sozlangan. Tashkilot yozuvlari Supabase orqali RLS bilan sinfgan holda sinxronlanadi.",
  persistenceMisconfigured:
    "Umumiy backend noto'g'ri sozlangan — tashkilot ma'lumotlari faqat qurilmada qoladi.",
  persistenceDeviceLocal:
    "Umumiy backend sozlanmagan — tashkilot ma'lumotlari faqat qurilmada. Ko'p foydalanuvchili hamkorlik Supabase talab qiladi.",
  inviteTokenPresent:
    "Taklif tokeni mavjud — taklif qilingan emailga mos hisobdan shu qurilmada qabul qiling.",
  createHeading: "Tashkilot yaratish",
  identityWarning:
    'Faqat foydalanuvchi yaratgan ish maydoni. "NASA", "WHO" yoki boshqa haqiqiy muassasa nomi rasmiy vakillikni tasdiqlamaydi.',
  nameLabel: "Nom",
  typeLabel: "Tur",
  createButton: "Tashkilot yaratish",
  nameRequired: "Tashkilot nomi talab qilinadi.",
  orgCreated:
    'Tashkilot "{name}" yaratildi. Bu foydalanuvchi ish maydoni — rasmiy tasdiqlangan muassasa emas.',
  memberCount: "{count} a'zo",
  missionsLabel: "Missiyalar",
  missionsLinked: "Missiya konteksti orqali bog'langan",
  membersLabel: "A'zolar",
  pendingInvitesLabel: "Kutilayotgan takliflar",
  inviteHeading: "A'zo taklif qilish",
  emailLabel: "Email",
  createInviteLink: "Taklif havolasini yaratish",
  emailNotSent: "Email transport ulanmagan — faqat taklif havolasi.",
  inviteCreated: "Taklif yaratildi. Email yuborilmadi — havolani nusxalang: {link}",
  auditHeading: "Audit",
  workspaceOrganization: "workspace_organization",
} as const;
